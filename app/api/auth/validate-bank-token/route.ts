import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';

// POST - Validate a token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token requerido' }, { status: 400 });
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
        valid: false, 
        error: 'Token inválido o ya utilizado' 
      });
    }

    const tokenDoc = tokensSnapshot.docs[0];
    
    return NextResponse.json({ 
      valid: true, 
      tokenId: tokenDoc.id,
      description: tokenDoc.data().description
    });
  } catch (error: any) {
    console.error('Error validating token:', error);
    return NextResponse.json({ valid: false, error: error.message }, { status: 500 });
  }
}
