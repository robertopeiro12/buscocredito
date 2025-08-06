import "server-only";
import { NextRequest } from 'next/server';
import { adminFirestore } from '@/app/firebase-admin';
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

    const { loanId } = body;

    // Primero verificar si la solicitud ya tiene una oferta aceptada
    const solicitudRef = adminFirestore.collection("solicitudes").doc(loanId);
    const solicitudDoc = await solicitudRef.get();
    
    if (solicitudDoc.exists && 
        solicitudDoc.data()?.status === "approved" && 
        solicitudDoc.data()?.acceptedOfferId) {
      const acceptedOfferId = solicitudDoc.data()?.acceptedOfferId;
      
      // Intentar obtener los datos completos de la oferta
      try {
        const proposalRef = adminFirestore.collection("proposals").doc(acceptedOfferId);
        const proposalDoc = await proposalRef.get();
        
        if (proposalDoc.exists) {
          return createSuccessResponse({
            acceptedOfferId,
            acceptedOffer: proposalDoc.data()
          }, 'Estado de oferta obtenido exitosamente');
        }
      } catch (proposalErr) {
        console.error("Error fetching proposal", proposalErr);
      }
      
      // Si no se pudo obtener la oferta completa, devolver solo el ID
      return createSuccessResponse({
        acceptedOfferId,
        acceptedOffer: null
      }, 'Estado de oferta obtenido exitosamente');
    }

    // Si la solicitud no indica una oferta aceptada, consultar las propuestas directamente
    const proposalsRef = adminFirestore.collection("proposals");
    const snapshot = await proposalsRef
      .where("loanId", "==", loanId)
      .where("status", "==", "accepted")
      .get();

    if (snapshot.empty) {
      // No se encontraron propuestas aceptadas
      return createSuccessResponse({ 
        acceptedOfferId: null 
      }, 'No hay ofertas aceptadas para esta solicitud');
    }

    // Devolver el ID de la propuesta aceptada (debería ser solo una)
    const acceptedProposal = snapshot.docs[0];
    
    // También actualizar la solicitud para marcarla como que tiene una oferta aceptada
    try {
      await solicitudRef.update({
        status: "approved",
        updatedAt: new Date().toISOString(),
        acceptedOfferId: acceptedProposal.id
      });
    } catch (updateErr) {
      console.error("Error updating solicitud", updateErr);
      // Continuar aunque falle la actualización
    }
    
    return createSuccessResponse({
      acceptedOfferId: acceptedProposal.id,
      acceptedOffer: acceptedProposal.data()
    }, 'Estado de oferta obtenido exitosamente');

  } catch (error) {
    console.error("Error checking offer status:", error);
    return createErrorResponse("Error al verificar el estado de la oferta");
  }
}
