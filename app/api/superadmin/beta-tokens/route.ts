import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/db/FirebaseAdmin';
import { verifyAuthToken } from '@/lib/auth-middleware';

// Helper para generar tokens aleatorios
function generateRandomToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segment1 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const segment2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `BETA-${segment1}-${segment2}`;
}

/**
 * GET: Listar todos los tokens beta
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    if (!user || user.role !== 'superAdmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const db = getAdminFirestore();
    const snapshot = await db.collection('beta_tokens')
      .orderBy('createdAt', 'desc')
      .get();

    const tokens = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || null,
      lastUsed: doc.data().lastUsed?.toDate() || null,
    }));

    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Error fetching beta tokens:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

/**
 * POST: Crear un nuevo token beta
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthToken(request);
    if (!user || user.role !== 'superAdmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { assignedTo } = await request.json();

    if (!assignedTo) {
      return NextResponse.json({ error: 'Asignado a es requerido' }, { status: 400 });
    }

    const db = getAdminFirestore();
    const token = generateRandomToken();

    const newToken = {
      token,
      assignedTo,
      active: true,
      createdAt: new Date(),
      lastUsed: null,
      usageCount: 0,
      createdBy: user.uid
    };

    const docRef = await db.collection('beta_tokens').add(newToken);

    return NextResponse.json({ id: docRef.id, ...newToken });
  } catch (error) {
    console.error('Error creating beta token:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
