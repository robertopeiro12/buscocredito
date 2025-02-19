import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getLoanOffers } from '@/db/FirestoreFunc';

export async function POST(req: NextRequest) {
  const { loanId } = await req.json();
  console.log(loanId); 
  if (!loanId) {
    return NextResponse.json({ error: "Missing loan ID" }, { status: 400 });
  }

  try {
    await initAdmin();
    const offers = await getLoanOffers(loanId);
    
    if (offers.status !== 200) {
      return NextResponse.json({ error: offers.error }, { status: 500 });
    }

    return NextResponse.json({ data: JSON.stringify(offers.data) }, { status: 200 });
  } catch (e) {
    return NextResponse.json({ error: e }, { status: 500 });
  }
}