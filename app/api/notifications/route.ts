import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getNotificationsForUser } from '@/db/FirestoreFunc';
import { verifyAuthentication } from '../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../utils/response';
import { validateRequiredFields } from '../utils/validation';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (maneja tanto cookies como Bearer tokens)
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

    // Verificar que el usuario está consultando sus propias notificaciones
    if (body.userId !== user.uid) {
      return createErrorResponse('Solo puedes ver tus propias notificaciones', 403);
    }

    // Inicializar Firebase Admin
    await initAdmin();
    
    // Obtener notificaciones del usuario
    const result = await getNotificationsForUser(body.userId);
    
    if (result.status !== 200) {
      console.error('Error getting notifications:', result.error);
      return createErrorResponse(result.error || 'Error al obtener notificaciones');
    }

    return createSuccessResponse(
      { notifications: result.data },
      'Notificaciones obtenidas exitosamente'
    );

  } catch (error) {
    console.error("Error getting notifications:", error);
    return createErrorResponse('Error interno del servidor');
  }
}
