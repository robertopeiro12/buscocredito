import "server-only";
import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/db/FirebaseAdmin';
import { adminFirestore } from '@/app/firebase-admin';
import { onUserCreated } from '@/db/AuthManager';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';
import { validateRequiredFields } from '../../utils/validation';

export async function POST(request: NextRequest) {
  try {
    // Verify the caller has a valid Firebase token (cookie or Bearer).
    // We cannot use verifyAuthentication here because the JWT may not have role claims yet
    // (that is precisely what this endpoint sets). We only need proof the caller IS the user.
    await initAdmin();
    const auth = getAuth();
    let callerUid: string | null = null;

    const authToken = request.cookies.get('auth-token')?.value;
    const authHeader = request.headers.get('Authorization');

    if (authToken) {
      try {
        const decoded = await auth.verifyIdToken(authToken);
        callerUid = decoded.uid;
      } catch { /* fall through to Bearer */ }
    }
    if (!callerUid && authHeader?.startsWith('Bearer ')) {
      try {
        const decoded = await auth.verifyIdToken(authHeader.split('Bearer ')[1]);
        callerUid = decoded.uid;
      } catch { /* invalid token */ }
    }
    if (!callerUid) {
      return createErrorResponse('No autorizado', 401);
    }

    const body = await request.json();
    const { userId, userData } = body;

    // Validar campos requeridos
    const validation = validateRequiredFields(body, ['userId', 'userData']);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.missingFields || []);
    }

    // A user can only configure their own claims
    if (userId !== callerUid) {
      return createErrorResponse('No autorizado para configurar este usuario', 403);
    }

    // Verificar que userData tenga los campos necesarios
    const userValidation = validateRequiredFields(userData, ['name', 'email']);
    if (!userValidation.isValid) {
      return ApiResponses.missingFields(userValidation.missingFields || []);
    }

    console.log(`🔄 Setting up custom claims for new user: ${userId}`);
    
    // Read the user type from Firestore — never trust the client-supplied type
    const userRef = adminFirestore.collection('cuentas').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return createErrorResponse('Usuario no encontrado en la plataforma', 404);
    }

    const firestoreType = userDoc.data()?.type as string | undefined;
    if (!firestoreType) {
      return createErrorResponse('Tipo de usuario no configurado', 400);
    }

    // Build safe payload using the Firestore-verified type
    const safeUserData = { ...userData, type: firestoreType };

    // Establecer custom claims
    const claimsResult = await onUserCreated(userId, safeUserData);

    if (!claimsResult.success) {
      console.error('❌ Failed to set custom claims:', claimsResult.error);
      return createErrorResponse(
        `Error al establecer permisos de usuario: ${claimsResult.error}`,
        500
      );
    }

    // Update Firestore timestamp
    try {
      await userRef.update({ updated_at: new Date() });
      console.log(`✅ Custom claims set for ${userId} with type: ${firestoreType}`);
    } catch (firestoreError) {
      console.error('❌ Error updating user document:', firestoreError);
    }

    return createSuccessResponse(
      {
        userId,
        claimsSet: true,
        userType: firestoreType,
      },
      'Usuario configurado exitosamente con permisos'
    );
    
  } catch (error) {
    console.error('Error in setup-user-claims endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return createErrorResponse(`Error interno: ${errorMessage}`);
  }
}