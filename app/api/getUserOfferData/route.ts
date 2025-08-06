import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getUserOfferData } from '@/db/FirestoreFunc';
import { verifyAuthentication, createUnauthorizedResponse } from '../utils/auth';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthentication(req);
    if (!user) {
      return createUnauthorizedResponse();
    }

    const { userId } = await req.json();
    
    // Verificar que el usuario solo acceda a sus propios datos
    if (userId !== user.uid) {
      return new Response(
        JSON.stringify({ error: 'Acceso denegado' }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await initAdmin();
    const user_data = await getUserOfferData(userId);
    
    if (user_data.status !== 200) {
      return NextResponse.json({ error: user_data.error }, { status: 500 });
    }

    return NextResponse.json({ data: user_data.data }, { status: 200 });
  } catch (e) {
    console.error('Error in getUserOfferData:', e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}