import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAuthentication, createUnauthorizedResponse, createForbiddenResponse } from '../../utils/auth';
import { createSuccessResponse, createErrorResponse } from '../../utils/response';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthentication(request);
    if (!user) return createUnauthorizedResponse();
    if (user.userType !== 'lender') return createForbiddenResponse('Solo lenders pueden acceder');

    const { searchParams } = new URL(request.url);
    const loanId = searchParams.get('loanId');
    if (!loanId) return createErrorResponse('loanId requerido', 400);

    await initAdmin();
    const db = getFirestore();

    // Verify the lender has a proposal for this loan
    const lenderParticipationSnapshot = await db.collection('propuestas')
      .where('loanId', '==', loanId)
      .where('lenderId', '==', user.uid)
      .limit(1)
      .get();

    const lenderParticipationFallback = lenderParticipationSnapshot.empty
      ? await db.collection('propuestas')
          .where('solicitudId', '==', loanId)
          .where('lenderId', '==', user.uid)
          .limit(1)
          .get()
      : lenderParticipationSnapshot;

    if (lenderParticipationFallback.empty) {
      return createSuccessResponse(null, 'No tienes propuestas para este préstamo');
    }

    // Try loanId field first
    let snapshot = await db.collection('propuestas')
      .where('loanId', '==', loanId)
      .where('status', '==', 'accepted')
      .limit(1)
      .get();

    // Fallback: legacy solicitudId field
    if (snapshot.empty) {
      snapshot = await db.collection('propuestas')
        .where('solicitudId', '==', loanId)
        .where('status', '==', 'accepted')
        .limit(1)
        .get();
    }

    if (snapshot.empty) return createSuccessResponse(null, 'No se encontró propuesta ganadora');

    const winningDoc = snapshot.docs[0].data();
    const callerWon = winningDoc.lenderId === user.uid;

    // Return winning terms to all participants (so losers understand why they lost)
    // but never expose the winner's lender identity to competitors
    return createSuccessResponse({
      won: callerWon,
      amount: winningDoc.amount,
      interestRate: winningDoc.interestRate,
      amortizationFrequency: winningDoc.amortizationFrequency,
      amortization: winningDoc.amortization,
      term: winningDoc.deadline,
      comision: winningDoc.comision,
      medicalBalance: winningDoc.medicalBalance,
    });
  } catch (error) {
    console.error('Error fetching winning proposal:', error);
    return createErrorResponse('Error interno del servidor');
  }
}
