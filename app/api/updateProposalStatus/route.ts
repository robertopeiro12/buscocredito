import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { createNotification } from '@/db/FirestoreFunc';

export async function POST(req: NextRequest) {
  const { proposalId, loanId, status } = await req.json();
  
  console.log("Recibidos datos:", { proposalId, loanId, status });
  
  if (!proposalId || !loanId || !status) {
    return NextResponse.json({ error: "Missing required fields", received: { proposalId, loanId, status } }, { status: 400 });
  }

  try {
    await initAdmin();
    const db = getFirestore();
    const batch = db.batch();
    
    // Update the selected proposal to accepted
    const selectedProposalRef = db.collection('propuestas').doc(proposalId);
    batch.update(selectedProposalRef, { status: status });
    
    // Update the solicitud to mark as accepted and hide from other lenders
    const solicitudRef = db.collection('solicitudes').doc(loanId);
    batch.update(solicitudRef, { 
      status: "approved",
      acceptedProposalId: proposalId,
      acceptedOfferId: proposalId,
      updatedAt: new Date().toISOString()
    });
    
    // Get all other proposals for this loan and mark them as rejected
    const propuestasRef = db.collection('propuestas');
    const otherProposalsSnapshot = await propuestasRef
      .where("loanId", "==", loanId)
      .where("status", "==", "pending")
      .get();
    
    console.log(`Encontradas ${otherProposalsSnapshot.docs.length} otras propuestas para rechazar`);
    
    otherProposalsSnapshot.docs.forEach(doc => {
      if (doc.id !== proposalId) {
        const otherProposalRef = db.collection('propuestas').doc(doc.id);
        batch.update(otherProposalRef, { status: 'rejected' });
      }
    });
    
    await batch.commit();
    
    // Step 2: Create notifications after successful batch commit
    console.log("Creating notifications for loan acceptance...");
    
    // Get the winning proposal data
    const winningProposalDoc = await db.collection('propuestas').doc(proposalId).get();
    const winningProposal = winningProposalDoc.data();
    
    if (winningProposal) {
      // Notification for the winner
      await createNotification({
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
      
      // Get loan details for competitor notifications
      const loanDoc = await db.collection('solicitudes').doc(loanId).get();
      const loanData = loanDoc.data();
      
      // Notifications for competitors
      const competitorNotifications = otherProposalsSnapshot.docs
        .filter(doc => doc.id !== proposalId)
        .map(async (doc) => {
          const competitorProposal = doc.data();
          return createNotification({
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
        });
      
      // Send all competitor notifications
      await Promise.all(competitorNotifications);
      console.log(`Sent notifications to ${competitorNotifications.length} competitors`);
    }
    
    return NextResponse.json({ 
      status: 200, 
      message: "Proposal status updated successfully and notifications sent",
      proposalId: proposalId,
      loanId: loanId 
    });
  } catch (e) {
    console.error("Error updating proposal status:", e);
    return NextResponse.json({ error: e, proposalId, loanId }, { status: 500 });
  }
} 