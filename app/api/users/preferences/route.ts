import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAuthentication } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';
import { validateRequiredFields } from '../../utils/validation';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthentication(request);
    if (!user) {
      return ApiResponses.unauthorized();
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Validar campos requeridos
    const validation = validateRequiredFields(body, ['userId']);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.errors);
    }

    // Verificar que el usuario está actualizando sus propias preferencias
    if (body.userId !== user.uid) {
      return createErrorResponse('Solo puedes actualizar tus propias preferencias', 403);
    }

    // Inicializar Firebase Admin
    await initAdmin();
    const db = getFirestore();
    
    // Preparar datos de actualización
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    // Email notifications preference
    if (typeof body.emailNotifications === 'boolean') {
      updateData.emailNotifications = body.emailNotifications;
    }

    // Update user document
    const userRef = db.collection("cuentas").doc(body.userId);
    await userRef.update(updateData);
    
    return createSuccessResponse(
      { updated: Object.keys(updateData) },
      'Preferencias actualizadas exitosamente'
    );

  } catch (error: any) {
    console.error("Error updating user preferences:", error);
    return createErrorResponse('Error interno del servidor');
  }
}

// GET endpoint to retrieve user preferences
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthentication(request);
    if (!user) {
      return ApiResponses.unauthorized();
    }

    // Inicializar Firebase Admin
    await initAdmin();
    const db = getFirestore();
    
    // Get user document
    const userRef = db.collection("cuentas").doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return createErrorResponse('Usuario no encontrado', 404);
    }

    const userData = userDoc.data();
    
    return createSuccessResponse({
      emailNotifications: userData?.emailNotifications !== false, // Default to true
    }, 'Preferencias obtenidas exitosamente');

  } catch (error: any) {
    console.error("Error getting user preferences:", error);
    return createErrorResponse('Error interno del servidor');
  }
}
