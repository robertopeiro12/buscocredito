import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/db/FirebaseAdmin';
import { verifyAuthToken } from '@/lib/auth-middleware';

/**
 * PATCH: Actualizar estado de un token beta
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await verifyAuthToken(request);
    if (!user || user.role !== 'superAdmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { active } = await request.json();
    const { id } = await params;

    const db = getAdminFirestore();
    await db.collection('beta_tokens').doc(id).update({
      active,
      updatedAt: new Date(),
      updatedBy: user.uid
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating beta token:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
