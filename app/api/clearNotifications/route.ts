import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    await initAdmin();
    const db = getFirestore();
    
    // Obtener todas las notificaciones del usuario
    const notificationsRef = db.collection("notifications");
    const snapshot = await notificationsRef
      .where("recipientId", "==", userId)
      .get();
    
    // Eliminar todas las notificaciones
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return NextResponse.json({ 
      status: 200, 
      message: `${snapshot.docs.length} notificaciones eliminadas` 
    });
  } catch (error: any) {
    console.error("Error clearing notifications:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
