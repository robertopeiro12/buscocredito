import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getLenderProposals } from '@/db/FirestoreFunc';
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

    // Solo lenders pueden ver sus propuestas
    if (user.userType !== 'b_sale') {
      return ApiResponses.onlyLendersAllowed();
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Validar campos requeridos
    const validation = validateRequiredFields(body, ['lenderId']);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.errors);
    }

    // Verificar que el lender está consultando sus propias propuestas
    if (body.lenderId !== user.uid) {
      return createErrorResponse('Solo puedes ver tus propias propuestas', 403);
    }

    // Inicializar Firebase Admin
    await initAdmin();
    
    // Obtener propuestas del prestamista
    const proposals = await getLenderProposals(body.lenderId);
    
    if (proposals.status !== 200) {
      console.error('Error getting lender proposals:', proposals.error);
      return createErrorResponse(proposals.error || 'Error al obtener propuestas');
    }

    return createSuccessResponse(
      { proposals: proposals.data },
      'Propuestas obtenidas exitosamente'
    );

  } catch (error) {
    console.error("Error getting lender proposals:", error);
    return createErrorResponse('Error interno del servidor');
  }
}
