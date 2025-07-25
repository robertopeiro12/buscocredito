import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getUserOffersByUserId } from '@/db/FirestoreFunc';
import { verifyAuthentication, createUnauthorizedResponse } from '../utils/auth';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthentication(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    // Solo usuarios tipo 'user' pueden acceder a sus ofertas
    if (user.userType !== 'user') {
      return new Response(
        JSON.stringify({ error: 'Acceso denegado' }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await initAdmin();
    
    // Obtener ofertas específicas del usuario autenticado
    const offers = await getUserOffersByUserId(user.uid);
    console.log('User offers for', user.uid, ':', offers);
    
    return NextResponse.json({ offers: offers.offers }, { status: 200 });
  } catch (e) {
    console.error('Error in getUserOffers:', e);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}