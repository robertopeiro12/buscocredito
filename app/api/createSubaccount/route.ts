import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { create_subaccount_doc } from '@/db/FirestoreFunc';
import { create_subaccount } from '@/db/FireAuthFunc';
import { verifyAuthentication, createUnauthorizedResponse } from '../utils/auth';

export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthentication(req);
    if (!user) {
      return createUnauthorizedResponse();
    }

    // Solo administradores pueden crear subcuentas
    if (user.userType !== 'b_admin') {
      return new Response(
        JSON.stringify({ error: 'Acceso denegado - Solo administradores' }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const { name, email, password, userId, Empresa } = await req.json();
    
    // Verificar que el userId coincida con el usuario autenticado
    if (userId !== user.uid) {
      return new Response(
        JSON.stringify({ error: 'Acceso denegado' }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!name || !email || !password || !userId || !Empresa) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await initAdmin();
    const newUser = await create_subaccount(name, email, password);
    
    if (newUser.status !== 200) {
      return NextResponse.json({ error: newUser.error }, { status: 500 });
    }
    
    if (newUser.userId) {
      const account = await create_subaccount_doc(name, email, userId, newUser.userId, Empresa);
      if (account.status !== 200) {
        return NextResponse.json({ error: account.error }, { status: 500 });
      }
    }
    
    console.log(`Admin ${user.uid} created subcuenta for ${email}`);
    return NextResponse.json({ userId: newUser.userId }, { status: 200 });
  } catch (e) {
    console.error('Error in createSubaccount:', e);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}