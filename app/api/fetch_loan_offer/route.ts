import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getLoanOffers } from '@/db/FirestoreFunc';
import { verifyAuthentication, createUnauthorizedResponse } from '../utils/auth';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthentication(req);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const { loanId } = await req.json();
    console.log('Fetching offers for loan:', loanId, 'by user:', user.uid); 
    
    if (!loanId) {
      return NextResponse.json({ error: "Missing loan ID" }, { status: 400 });
    }

    await initAdmin();
    const offers = await getLoanOffers(loanId);
    
    if (offers.status !== 200) {
      return NextResponse.json({ error: offers.error }, { status: 500 });
    }

    return NextResponse.json({ data: JSON.stringify(offers.data) }, { status: 200 });
  } catch (e) {
    console.error('Error in fetch_loan_offer:', e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}