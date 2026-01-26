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
    
    // Find the token
    const tokensSnapshot = await db.collection('bank_signup_tokens')
      .where('token', '==', token)
      .where('used', '==', false)
      .limit(1)
      .get();
    
    if (tokensSnapshot.empty) {
      return NextResponse.json({ 
        success: false, 
        error: 'Token inválido o ya utilizado' 
      }, { status: 400 });
    }

    const tokenDoc = tokensSnapshot.docs[0];
    
    // Mark the token as used
    await db.collection('bank_signup_tokens').doc(tokenDoc.id).update({
      used: true,
      usedBy: usedBy,
      usedByCompany: companyName || null,
      usedAt: new Date(),
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Token marcado como utilizado'
    });
  } catch (error: any) {
    console.error('Error marking token as used:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
