import "server-only";
import { NextRequest } from 'next/server';
import { getUserOfferData } from '@/db/FirestoreFunc';
import { verifyAuthentication } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación del prestamista
    const user = await verifyAuthentication(req);
    if (!user) {
      return ApiResponses.unauthorized();
    }

    // Obtener userId del body
    const body = await req.json().catch(() => ({}));
    const { userId } = body;
    
    if (!userId) {
      return createErrorResponse('userId es requerido');
    }

    // Obtener datos públicos del usuario solicitante
    const result = await getUserOfferData(userId);
    
    if (result.status !== 200) {
      return createErrorResponse(result.error || 'Error al obtener datos del usuario');
    }

    return createSuccessResponse(result.data, 'Datos públicos del usuario obtenidos exitosamente');
  } catch (error) {
    console.error('Error in public-profile:', error);
    return createErrorResponse('Error interno del servidor');
  }
}
