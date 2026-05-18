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
    
    if (!body.address || typeof body.address !== 'object') {
      return createErrorResponse('Se requiere el campo address', 400);
    }

    const ALLOWED_ADDRESS_FIELDS = ['street', 'exteriorNumber', 'interiorNumber', 'colony', 'city', 'state', 'country', 'zipCode'];
    const addressUpdate: Record<string, string> = {};

    for (const field of ALLOWED_ADDRESS_FIELDS) {
      if (body.address[field] !== undefined) {
        addressUpdate[field] = typeof body.address[field] === 'string'
          ? body.address[field].trim()
          : body.address[field];
      }
    }

    if (Object.keys(addressUpdate).length === 0) {
      return createErrorResponse('No se proporcionaron campos de domicilio para actualizar', 400);
    }

    const userRef = db.collection("cuentas").doc(body.userId);
    const userDoc = await userRef.get();
    const currentAddress = userDoc.exists ? userDoc.data()?.address || {} : {};

    await userRef.update({
      address: { ...currentAddress, ...addressUpdate },
      updatedAt: new Date().toISOString(),
    });
    
    return createSuccessResponse(
      { updated: Object.keys(addressUpdate) },
      'Domicilio actualizado exitosamente'
    );

  } catch (error: any) {
    console.error("Error updating user profile:", error);
    return createErrorResponse('Error interno del servidor');
  }
}
