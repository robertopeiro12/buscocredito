import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/db/FirebaseAdmin';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'El token es requerido' },
        { status: 400 }
      );
    }

    const db = getAdminFirestore();
    const betaTokensRef = db.collection('beta_tokens');
    
    // Buscar el token en Firestore
    const querySnapshot = await betaTokensRef
      .where('token', '==', token)
      .where('active', '==', true)
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { error: 'Token inválido o revocado' },
        { status: 401 }
      );
    }

    const tokenDoc = querySnapshot.docs[0];
    const tokenData = tokenDoc.data();

    // Actualizar metadatos del token
    await tokenDoc.ref.update({
      lastUsed: new Date(),
      usageCount: (tokenData.usageCount || 0) + 1
    });

    // Establecer la cookie de acceso beta
    const cookieStore = await cookies();
    cookieStore.set('buscocredito_beta', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: '/',
    });

    return NextResponse.json({ success: true, message: 'Acceso concedido' });
  } catch (error) {
    console.error('Error validando token beta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
