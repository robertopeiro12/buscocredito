import "server-only";
import { NextRequest } from 'next/server';
import { getUserOfferData } from '@/db/FirestoreFunc';
import { verifyAuthentication, createUnauthorizedResponse, createForbiddenResponse } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthentication(req);
    if (!user) {
      return ApiResponses.unauthorized();
    }

    // Obtener userId del body (opcional) o usar el del usuario autenticado
    const body = await req.json().catch(() => ({}));
    const requestedUserId = body.userId;
    
    // Si se especifica un userId, verificar que sea el mismo que el usuario autenticado
    if (requestedUserId && requestedUserId !== user.uid) {
      return ApiResponses.forbidden('Solo puedes acceder a tu propia información');
    }

    // Usar el ID del usuario autenticado
    const userId = user.uid;

    const result = await getUserOfferData(userId);
    
    if (result.status !== 200) {
      return createErrorResponse(result.error || 'Error al obtener datos del usuario');
    }

    return createSuccessResponse(result.data, 'Datos del usuario obtenidos exitosamente');
  } catch (error) {
    console.error('Error in getUserOfferData:', error);
    return createErrorResponse('Error interno del servidor');
  }
}
