import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { add_propuesta } from '@/db/FirestoreFunc';
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
    const validation = validateRequiredFields(body, ['id', 'offer_data']);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.errors);
    }

    const { id, offer_data } = body;

    // Inicializar Firebase Admin
    await initAdmin();
    
    // Procesar la aceptación de la oferta
    const result = await add_propuesta(id, offer_data);
    
    if (result.status !== 200) {
      console.error('Error accepting offer:', result.error);
      return createErrorResponse(result.error || 'Error al aceptar la oferta');
    }

    return createSuccessResponse(
      { accepted: true },
      'Oferta aceptada exitosamente'
    );

  } catch (error) {
    console.error('Error in addOfferAccepted:', error);
    return createErrorResponse('Error interno del servidor');
  }
}
