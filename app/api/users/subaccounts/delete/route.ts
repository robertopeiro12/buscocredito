import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from "@/db/FirebaseAdmin";
import { delete_subaccount_doc } from "@/db/FirestoreFunc";
import { delete_subaccount } from "@/db/FireAuthFunc";
import { verifyAuthentication } from '../../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../../utils/response';
import { validateRequiredFields } from '../../../utils/validation';

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación (maneja tanto cookies como Bearer tokens)
    const user = await verifyAuthentication(request);
    if (!user) {
      return ApiResponses.unauthorized();
    }

    // Solo administradores pueden eliminar subcuentas
    if (user.userType !== 'b_admin') {
      return createErrorResponse('Solo administradores pueden eliminar subcuentas', 403);
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Validar campos requeridos
    const validation = validateRequiredFields(body, ['userId']);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.errors);
    }

    const { userId } = body;

    // Inicializar Firebase Admin
    await initAdmin();

    // Primero eliminar del Authentication
    const authResult = await delete_subaccount(userId);
    if (authResult.status !== 200) {
      console.error('Error deleting user from auth:', authResult.error);
      return createErrorResponse(authResult.error || 'Error al eliminar usuario de autenticación');
    }

    // Luego eliminar el documento de Firestore
    const firestoreResult = await delete_subaccount_doc(userId);
    if (firestoreResult.status !== 200) {
      console.error('Error deleting user document:', firestoreResult.error);
      return createErrorResponse(firestoreResult.error || 'Error al eliminar documento de usuario');
    }

    return createSuccessResponse(
      { userId: userId, deleted: true },
      'Subcuenta eliminada exitosamente'
    );

  } catch (error) {
    console.error("Error deleting subaccount:", error);
    return createErrorResponse('Error interno del servidor');
  }
}
