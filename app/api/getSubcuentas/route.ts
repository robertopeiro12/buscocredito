import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAuthentication, createUnauthorizedResponse } from '../utils/auth';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthentication(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    // Solo administradores pueden acceder a esta API
    if (user.userType !== 'companyAdmin') {
      return new Response(
        JSON.stringify({ error: 'Acceso denegado - Solo administradores' }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await initAdmin();
    const db = getFirestore();
    
    // Obtener subcuentas que pertenecen a este administrador
    const subcuentasRef = db.collection('cuentas');
    const query = subcuentasRef.where('adminId', '==', user.uid);
    const querySnapshot = await query.get();
    
    const subcuentas: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      subcuentas.push({
        id: doc.id,
        name: data.name || '',
        email: data.email || '',
        userId: doc.id,
        companyName: data.companyName || '',
        type: data.type || ''
      });
    });

    console.log(`Admin ${user.uid} retrieved ${subcuentas.length} subcuentas`);
    
    return NextResponse.json({ subcuentas }, { status: 200 });
  } catch (error) {
    console.error('Error in getSubcuentas:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
