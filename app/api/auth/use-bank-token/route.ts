import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';

// POST - Mark a token as used
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, usedBy, companyName } = body;

    if (!token || !usedBy) {
      return NextResponse.json({ success: false, error: 'Token y usedBy requeridos' }, { status: 400 });
    }

    await initAdmin();
    const db = getFirestore();

    // Read and write inside one transaction. Without it there is a window
    // between "is this token free?" and the write where a second concurrent
    // request passes the same `used == false` filter — the token gets burned
    // twice and one signup token registers two companies.
    const claimed = await db.runTransaction(async (tx) => {
      const query = db.collection('bank_signup_tokens')
        .where('token', '==', token)
        .where('used', '==', false)
        .limit(1);

      const tokensSnapshot = await tx.get(query);
      if (tokensSnapshot.empty) {
        return false;
      }

      tx.update(tokensSnapshot.docs[0].ref, {
        used: true,
        usedBy: usedBy,
        usedByCompany: companyName || null,
        usedAt: new Date(),
      });
      return true;
    });

    if (!claimed) {
      return NextResponse.json({
        success: false,
        error: 'Token inválido o ya utilizado'
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Token marcado como utilizado'
    });
  } catch (error: any) {
    console.error('Error marking token as used:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
