import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAuthentication } from '../../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { validateRequiredFields } from '../../../utils/validation';

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

    // Verificar que el usuario está actualizando su propio perfil
    if (body.userId !== user.uid) {
      return createErrorResponse('Solo puedes actualizar tu propio perfil', 403);
    }

    // Inicializar Firebase Admin
    await initAdmin();
    const db = getFirestore();
    
    // Preparar datos de actualización (solo campos permitidos)
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    // Campos de información personal permitidos
    if (body.name && typeof body.name === 'string') {
      updateData.name = body.name.trim();
    }
    if (body.last_name && typeof body.last_name === 'string') {
      updateData.last_name = body.last_name.trim();
    }
    if (body.second_last_name && typeof body.second_last_name === 'string') {
      updateData.second_last_name = body.second_last_name.trim();
    }
    if (body.phone && typeof body.phone === 'string') {
      updateData.phone = body.phone.trim();
    }
    if (body.rfc && typeof body.rfc === 'string') {
      updateData.rfc = body.rfc.trim().toUpperCase();
    }
    if (body.birthday) {
      updateData.birthday = body.birthday;
    }

    // Campos de dirección
    if (body.address && typeof body.address === 'object') {
      const addressFields = ['street', 'exteriorNumber', 'interiorNumber', 'colony', 'city', 'state', 'country', 'zipCode'];
      const addressUpdate: Record<string, any> = {};
      
      for (const field of addressFields) {
        if (body.address[field] !== undefined) {
          addressUpdate[field] = typeof body.address[field] === 'string' 
            ? body.address[field].trim() 
            : body.address[field];
        }
      }
      
      if (Object.keys(addressUpdate).length > 0) {
        // Get current address and merge
        const userRef = db.collection("cuentas").doc(body.userId);
        const userDoc = await userRef.get();
        const currentAddress = userDoc.exists ? userDoc.data()?.address || {} : {};
        updateData.address = { ...currentAddress, ...addressUpdate };
      }
    }

    // Verificar que hay algo que actualizar
    if (Object.keys(updateData).length <= 1) { // Solo tiene updatedAt
      return createErrorResponse('No se proporcionaron datos para actualizar', 400);
    }

    // Update user document
    const userRef = db.collection("cuentas").doc(body.userId);
    await userRef.update(updateData);
    
    return createSuccessResponse(
      { updated: Object.keys(updateData) },
      'Perfil actualizado exitosamente'
    );

  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return createErrorResponse('Error interno del servidor');
  }
}
