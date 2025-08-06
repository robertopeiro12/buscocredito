import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getLoanOffers } from '@/db/FirestoreFunc';
import { verifyAuthentication } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';
import { validateRequiredFields } from '../../utils/validation';

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
    const validation = validateRequiredFields(body, ['loanId']);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.errors);
    }

    console.log('Fetching offers for loan:', body.loanId, 'by user:', user.uid); 
    
    // Inicializar Firebase Admin
    await initAdmin();
    
    // Obtener ofertas del préstamo
    const offers = await getLoanOffers(body.loanId);
    
    if (offers.status !== 200) {
      console.error('Error getting loan offers:', offers.error);
      return createErrorResponse(offers.error || 'Error al obtener ofertas');
    }

    return createSuccessResponse(
      { offers: offers.data },
      'Ofertas obtenidas exitosamente'
    );

  } catch (error) {
    console.error('Error in fetch_loan_offer:', error);
    return createErrorResponse('Error interno del servidor');
  }
}
