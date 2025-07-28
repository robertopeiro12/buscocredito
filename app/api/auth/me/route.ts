import "server-only";
import { NextRequest } from 'next/server';
import { verifyAuthentication } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación usando nuestro sistema unificado
    const user = await verifyAuthentication(request);
    
    if (!user) {
      return ApiResponses.unauthorized();
    }

    // Devolver información básica del usuario autenticado
    return createSuccessResponse({
      uid: user.uid,
      email: user.email
    }, 'Usuario autenticado obtenido exitosamente');

  } catch (error) {
    console.error('Error in auth/me:', error);
    return createErrorResponse('Error interno del servidor');
  }
}
