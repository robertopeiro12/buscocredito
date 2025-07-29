import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { createNotification } from '@/db/FirestoreFunc';
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
    
    console.log("Recibidos datos:", body);
    
    // Validar campos requeridos
    const validation = validateRequiredFields(body, ['proposalId', 'loanId', 'status']);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.errors);
    }

    const { proposalId, loanId, status } = body;

    // Inicializar Firebase Admin
    await initAdmin();
    const db = getFirestore();
    
    // Verificar que el usuario tiene permiso para actualizar esta propuesta
    // (debe ser el dueño de la solicitud)
    const solicitudDoc = await db.collection('solicitudes').doc(loanId).get();
    if (!solicitudDoc.exists) {
      return ApiResponses.loanNotFound();
    }
    
    if (solicitudDoc.data()?.userId !== user.uid) {
      return createErrorResponse('Solo el dueño de la solicitud puede actualizar propuestas', 403);
    }

    const batch = db.batch();
    
    // Actualizar la propuesta seleccionada
    const selectedProposalRef = db.collection('propuestas').doc(proposalId);
    batch.update(selectedProposalRef, { 
      status: status,
      loanId: loanId,
      updatedAt: new Date().toISOString()
    });
    
    // Actualizar la solicitud para marcarla como aceptada
    const solicitudRef = db.collection('solicitudes').doc(loanId);
    batch.update(solicitudRef, { 
      status: "approved",
      acceptedProposalId: proposalId,
      acceptedOfferId: proposalId,
      updatedAt: new Date().toISOString()
    });
    
    // Obtener todas las otras propuestas para este préstamo y marcarlas como rechazadas
    const propuestasRef = db.collection('propuestas');
    const otherProposalsSnapshot = await propuestasRef
      .where("loanId", "==", loanId)
      .where("status", "==", "pending")
      .get();
    
    console.log(`Encontradas ${otherProposalsSnapshot.docs.length} otras propuestas para rechazar`);
    
    otherProposalsSnapshot.docs.forEach(doc => {
      if (doc.id !== proposalId) {
        const otherProposalRef = db.collection('propuestas').doc(doc.id);
        batch.update(otherProposalRef, { 
          status: 'rejected',
          updatedAt: new Date().toISOString()
        });
      }
    });
    
    await batch.commit();
    
    // Crear notificaciones después del commit exitoso
    console.log("Creating notifications for loan acceptance...");
    
    // Obtener datos de la propuesta ganadora
    const winningProposalDoc = await db.collection('propuestas').doc(proposalId).get();
    const winningProposal = winningProposalDoc.data();
    
    console.log("Winning proposal data:", { 
      proposalId, 
      partner: winningProposal?.partner,
      amount: winningProposal?.amount,
      interest_rate: winningProposal?.interest_rate 
    });
    
    if (winningProposal) {
      // Notificación para el ganador
      console.log("Sending notification to winner:", winningProposal.partner);
      const winnerNotificationResult = await createNotification({
        recipientId: winningProposal.partner,
        type: "loan_accepted",
        title: "Propuesta Aceptada",
        message: `El solicitante ha seleccionado tu oferta de $${winningProposal.amount?.toLocaleString()} con una tasa de interés del ${winningProposal.interest_rate}%.`,
        data: {
          loanId: loanId,
          proposalId: proposalId,
          amount: winningProposal.amount,
          interestRate: winningProposal.interest_rate,
          amortizationFrequency: winningProposal.amortization_frequency,
          term: winningProposal.deadline,
          comision: winningProposal.comision,
          medicalBalance: winningProposal.medical_balance
        }
      });
      console.log("Winner notification result:", winnerNotificationResult);
      
      // Notificaciones para competidores
      const competitorProposals = otherProposalsSnapshot.docs.filter(doc => doc.id !== proposalId);
      console.log(`Found ${competitorProposals.length} competitor proposals to notify`);
      
      const competitorNotifications = competitorProposals.map(async (doc) => {
        const competitorProposal = doc.data();
        console.log("Sending notification to competitor:", competitorProposal.partner);
        
        const result = await createNotification({
          recipientId: competitorProposal.partner,
          type: "loan_assigned_other",
          title: "El Usuario ha aceptado otra propuesta",
          message: "La solicitud fue asignada a otra propuesta",
          data: {
            loanId: loanId,
            winningOffer: {
              amount: winningProposal.amount,
              interestRate: winningProposal.interest_rate,
              amortizationFrequency: winningProposal.amortization_frequency,
              term: winningProposal.deadline,
              comision: winningProposal.comision,
              medicalBalance: winningProposal.medical_balance
            }
          }
        });
        console.log(`Competitor notification result for ${competitorProposal.partner}:`, result);
        return result;
      });
      
      // Enviar todas las notificaciones de competidores
      const competitorResults = await Promise.all(competitorNotifications);
      console.log(`Sent notifications to ${competitorNotifications.length} competitors`);
      console.log("All competitor results:", competitorResults);
    }
    
    return createSuccessResponse({
      proposalId: proposalId,
      loanId: loanId,
      notificationsSent: true
    }, 'Estado de propuesta actualizado exitosamente');

  } catch (error) {
    console.error("Error updating proposal status:", error);
    return createErrorResponse('Error interno del servidor');
  }
}
