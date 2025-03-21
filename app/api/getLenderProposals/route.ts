import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getLenderProposals } from '@/db/FirestoreFunc';

export async function POST(req: NextRequest) {
  const { lenderId } = await req.json();
  
  if (!lenderId) {
    return NextResponse.json({ error: "Missing lender ID" }, { status: 400 });
  }

  try {
    await initAdmin();
    const proposals = await getLenderProposals(lenderId);
    
    if (proposals.status !== 200) {
      return NextResponse.json({ error: proposals.error }, { status: 500 });
    }

    return NextResponse.json({ data: proposals.data }, { status: 200 });
  } catch (e) {
    console.error("Error getting lender proposals:", e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
} 