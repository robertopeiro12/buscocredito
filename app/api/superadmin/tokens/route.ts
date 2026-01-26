import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAuthentication } from '../../utils/auth';
import crypto from 'crypto';

// GET - List all tokens
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthentication(request);
    if (!user || user.userType !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await initAdmin();
    const db = getFirestore();
    
    const tokensSnapshot = await db.collection('bank_signup_tokens')
      .orderBy('createdAt', 'desc')
      .get();
    
    const tokens = tokensSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
      usedAt: doc.data().usedAt?.toDate?.()?.toISOString() || doc.data().usedAt || null,
    }));

    return NextResponse.json({ tokens });
  } catch (error: any) {
    console.error('Error fetching tokens:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create a new token
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthentication(request);
    if (!user || user.userType !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { description } = body;

    await initAdmin();
    const db = getFirestore();
    
    // Generate a unique token
    const token = crypto.randomBytes(16).toString('hex').toUpperCase();
    
    const tokenData = {
      token,
      description: description || '',
      used: false,
      usedBy: null,
      usedAt: null,
      createdBy: user.uid,
      createdAt: new Date(),
    };

    const docRef = await db.collection('bank_signup_tokens').add(tokenData);

    return NextResponse.json({ 
      success: true, 
      id: docRef.id,
      token,
      message: 'Token creado exitosamente' 
    });
  } catch (error: any) {
    console.error('Error creating token:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete a token
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAuthentication(request);
    if (!user || user.userType !== 'super_admin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('id');

    if (!tokenId) {
      return NextResponse.json({ error: 'Token ID requerido' }, { status: 400 });
    }

    await initAdmin();
    const db = getFirestore();
    
    await db.collection('bank_signup_tokens').doc(tokenId).delete();

    return NextResponse.json({ success: true, message: 'Token eliminado' });
  } catch (error: any) {
    console.error('Error deleting token:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
