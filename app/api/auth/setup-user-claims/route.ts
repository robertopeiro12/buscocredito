import "server-only";
import { NextRequest } from 'next/server';
import { adminFirestore } from '@/app/firebase-admin';
import { onUserCreated } from '@/db/AuthManager';
import { verifyAuthentication } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';
import { validateRequiredFields } from '../../utils/validation';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, userData } = body;
    
    // Validar campos requeridos
    const validation = validateRequiredFields(body, ['userId', 'userData']);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.missingFields || []);
    }
    
    // Verificar que userData tenga los campos necesarios
    const userValidation = validateRequiredFields(userData, ['name', 'email', 'type']);
    if (!userValidation.isValid) {
      return ApiResponses.missingFields(userValidation.missingFields || []);
    }
    
    console.log(`🔄 Setting up custom claims for new user: ${userId}`);
    
    // Establecer custom claims
    const claimsResult = await onUserCreated(userId, userData);
    
    if (!claimsResult.success) {
      console.error('❌ Failed to set custom claims:', claimsResult.error);
      return createErrorResponse(
        `Error al establecer permisos de usuario: ${claimsResult.error}`,
        500
      );
    }
    
    // Crear o actualizar documento en Firestore si es necesario
    try {
      const userRef = adminFirestore.collection('cuentas').doc(userId);
      const userDoc = await userRef.get();
      
      if (!userDoc.exists) {
        // Si el documento no existe, crearlo con los datos básicos
        await userRef.set({
          ...userData,
          created_at: new Date(),
          updated_at: new Date()
        });
        console.log(`✅ User document created for ${userId}`);
      } else {
        // Si existe, actualizar solo los campos necesarios
        await userRef.update({
          type: userData.type,
          updated_at: new Date()
        });
        console.log(`✅ User document updated for ${userId}`);
      }
    } catch (firestoreError) {
      console.error('❌ Error handling user document:', firestoreError);
      // No fallar completamente si el documento no se puede crear/actualizar
      // Los custom claims ya se establecieron correctamente
    }
    
    return createSuccessResponse(
      { 
        userId,
        claimsSet: true,
        userType: userData.type
      },
      'Usuario configurado exitosamente con permisos'
    );
    
  } catch (error) {
    console.error('Error in setup-user-claims endpoint:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return createErrorResponse(`Error interno: ${errorMessage}`);
  }
}