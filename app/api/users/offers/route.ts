import "server-only";
import { NextRequest } from 'next/server';
import { getUserOffersByUserId } from '@/db/FirestoreFunc';
import { verifyAuthentication } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthentication(request);
    if (!user) {
      return ApiResponses.unauthorized();
    }

    // Solo usuarios tipo 'user' pueden acceder a sus ofertas
    if (user.userType !== 'user') {
      return ApiResponses.onlyUsersAllowed();
    }

    // Obtener ofertas específicas del usuario autenticado
    const result = await getUserOffersByUserId(user.uid);
    console.log('User offers for', user.uid, ':', result);
    
    return createSuccessResponse(
      { offers: result.offers }, 
      'Ofertas del usuario obtenidas exitosamente'
    );
  } catch (error) {
    console.error('Error in getUserOffers:', error);
    return createErrorResponse('Error interno del servidor');
  }
}
