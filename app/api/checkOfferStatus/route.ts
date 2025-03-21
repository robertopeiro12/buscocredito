import { NextResponse } from "next/server";
import { adminFirestore } from "@/app/firebase-admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { loanId } = body;

    if (!loanId) {
      return NextResponse.json(
        { error: "loanId parameter is required" },
        { status: 400 }
      );
    }

    // First check if this solicitud is already marked as having an accepted offer
    const solicitudRef = adminFirestore.collection("solicitudes").doc(loanId);
    const solicitudDoc = await solicitudRef.get();
    
    if (solicitudDoc.exists && 
        solicitudDoc.data()?.status === "approved" && 
        solicitudDoc.data()?.acceptedOfferId) {
      const acceptedOfferId = solicitudDoc.data()?.acceptedOfferId;
      
      // Try to get the full offer data
      try {
        const proposalRef = adminFirestore.collection("proposals").doc(acceptedOfferId);
        const proposalDoc = await proposalRef.get();
        
        if (proposalDoc.exists) {
          return NextResponse.json({
            acceptedOfferId,
            acceptedOffer: proposalDoc.data()
          });
        }
      } catch (proposalErr) {
        console.error("Error fetching proposal", proposalErr);
      }
      
      // If we couldn't get the full offer, still return the ID
      return NextResponse.json({
        acceptedOfferId,
        acceptedOffer: null
      });
    }

    // If solicitud doesn't indicate an accepted offer, query the proposals directly
    const proposalsRef = adminFirestore.collection("proposals");
    const snapshot = await proposalsRef
      .where("loanId", "==", loanId)
      .where("status", "==", "accepted")
      .get();

    if (snapshot.empty) {
      // No accepted proposals found
      return NextResponse.json({ acceptedOfferId: null });
    }

    // Return the ID of the accepted proposal (should be only one)
    const acceptedProposal = snapshot.docs[0];
    
    // Also update the solicitud to mark it as having an accepted offer
    try {
      await solicitudRef.update({
        status: "approved",
        updatedAt: new Date().toISOString(),
        acceptedOfferId: acceptedProposal.id
      });
    } catch (updateErr) {
      console.error("Error updating solicitud", updateErr);
      // Continue even if update fails
    }
    
    return NextResponse.json({
      acceptedOfferId: acceptedProposal.id,
      acceptedOffer: acceptedProposal.data()
    });
  } catch (error) {
    console.error("Error checking offer status:", error);
    return NextResponse.json(
      { error: "Failed to check offer status" },
      { status: 500 }
    );
  }
} 