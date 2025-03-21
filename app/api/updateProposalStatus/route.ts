import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';

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
    
    return NextResponse.json({ 
      status: 200, 
      message: "Proposal status updated successfully",
      proposalId: proposalId,
      loanId: loanId 
    });
  } catch (e) {
    console.error("Error updating proposal status:", e);
    return NextResponse.json({ error: e, proposalId, loanId }, { status: 500 });
  }
} 