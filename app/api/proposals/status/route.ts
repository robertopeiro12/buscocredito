import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { createNotification } from '@/db/FirestoreFunc';
import { verifyAuthentication } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';
import { validateRequiredFields } from '../../utils/validation';

const ALLOWED_STATUSES = ['accepted', 'rejected'] as const;
type ProposalStatus = typeof ALLOWED_STATUSES[number];

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthentication(request);
    if (!user) {
      return ApiResponses.unauthorized();
    }

    const body = await request.json();

    const validation = validateRequiredFields(body, ['proposalId', 'loanId', 'status']);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.errors);
    }

    const { proposalId, loanId, status } = body;

    if (!ALLOWED_STATUSES.includes(status as ProposalStatus)) {
      return createErrorResponse('Estado no válido. Debe ser "accepted" o "rejected"', 400);
    }

    if (user.userType !== 'borrower') {
      return createErrorResponse('Solo prestatarios pueden aceptar o rechazar propuestas', 403);
    }

    await initAdmin();
    const db = getFirestore();

    // Fetch both the solicitud and the proposal in parallel
    const [solicitudDoc, proposalDoc] = await Promise.all([
      db.collection('solicitudes').doc(loanId).get(),
      db.collection('propuestas').doc(proposalId).get(),
    ]);

    if (!solicitudDoc.exists) {
      return ApiResponses.loanNotFound();
    }

    if (solicitudDoc.data()?.userId !== user.uid) {
      return createErrorResponse('Solo el dueño de la solicitud puede actualizar propuestas', 403);
    }

    // Guard against double-acceptance
    if (status === 'accepted' && solicitudDoc.data()?.status === 'approved') {
      return createErrorResponse('Esta solicitud ya fue aprobada', 409);
    }

    // Verify the proposal actually belongs to this loan (prevents cross-loan IDOR)
    if (!proposalDoc.exists) {
      return createErrorResponse('Propuesta no encontrada', 404);
    }
    const proposalLoanId = proposalDoc.data()?.loanId || proposalDoc.data()?.solicitudId;
    if (proposalLoanId !== loanId) {
      return createErrorResponse('La propuesta no pertenece a esta solicitud', 403);
    }

    const batch = db.batch();

    const selectedProposalRef = db.collection('propuestas').doc(proposalId);
    batch.update(selectedProposalRef, {
      status,
      loanId,
      updatedAt: new Date().toISOString()
    });

    if (status === 'accepted') {
      const solicitudRef = db.collection('solicitudes').doc(loanId);
      batch.update(solicitudRef, {
        status: "approved",
        acceptedProposalId: proposalId,
        acceptedOfferId: proposalId,
        updatedAt: new Date().toISOString()
      });
    }

    // Reject all other pending proposals — query both loanId and solicitudId fields (legacy support)
    const [byLoanId, bySolicitudId] = await Promise.all([
      db.collection('propuestas').where("loanId", "==", loanId).where("status", "==", "pending").get(),
      db.collection('propuestas').where("solicitudId", "==", loanId).where("status", "==", "pending").get(),
    ]);

    const seenIds = new Set<string>();
    const competingDocs = [...byLoanId.docs, ...bySolicitudId.docs].filter(doc => {
      if (doc.id === proposalId || seenIds.has(doc.id)) return false;
      seenIds.add(doc.id);
      return true;
    });

    competingDocs.forEach(doc => {
      batch.update(db.collection('propuestas').doc(doc.id), {
        status: 'rejected',
        updatedAt: new Date().toISOString()
      });
    });

    await batch.commit();

    if (status === 'accepted') {
      const winningProposalDoc = await db.collection('propuestas').doc(proposalId).get();
      const winningProposal = winningProposalDoc.data();
      const solicitudData = solicitudDoc.data();

      if (winningProposal) {
        await createNotification({
          recipientId: winningProposal.lenderId,
          type: "loan_accepted",
          title: "Propuesta Aceptada",
          message: `El solicitante ha seleccionado tu oferta de $${winningProposal.amount?.toLocaleString()} con una tasa de interés del ${winningProposal.interestRate}%.`,
          data: {
            loanId,
            proposalId,
            amount: winningProposal.amount,
            interestRate: winningProposal.interestRate,
            amortizationFrequency: winningProposal.amortizationFrequency,
            amortization: winningProposal.amortization,
            term: winningProposal.deadline,
            comision: winningProposal.comision,
            medicalBalance: winningProposal.medicalBalance,
            purpose: solicitudData?.purpose,
            loanType: solicitudData?.type
          }
        });

        await Promise.all(
          competingDocs.map(doc => {
            const competitorProposal = doc.data();
            return createNotification({
              recipientId: competitorProposal.lenderId,
              type: "loan_assigned_other",
              title: "El Usuario ha aceptado otra propuesta",
              message: "La solicitud fue asignada a otra propuesta",
              data: {
                loanId,
                purpose: solicitudData?.purpose,
                loanType: solicitudData?.type,
                winningOffer: {
                  amount: winningProposal.amount,
                  interestRate: winningProposal.interestRate,
                  amortizationFrequency: winningProposal.amortizationFrequency,
                  amortization: winningProposal.amortization,
                  term: winningProposal.deadline,
                  comision: winningProposal.comision,
                  medicalBalance: winningProposal.medicalBalance
                },
                competitorOffer: {
                  amount: competitorProposal.amount,
                  interestRate: competitorProposal.interestRate,
                  amortizationFrequency: competitorProposal.amortizationFrequency,
                  amortization: competitorProposal.amortization,
                  term: competitorProposal.deadline,
                  comision: competitorProposal.comision,
                  medicalBalance: competitorProposal.medicalBalance
                }
              }
            });
          })
        );
      }
    }

    return createSuccessResponse(
      { proposalId, loanId },
      'Estado de propuesta actualizado exitosamente'
    );

  } catch (error) {
    console.error("Error updating proposal status:", error);
    return createErrorResponse('Error interno del servidor');
  }
}
