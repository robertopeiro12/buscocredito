import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAuthentication } from '../utils/auth';

export async function POST(req: NextRequest) {
  const user = await verifyAuthentication(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notificationId } = await req.json();

  if (!notificationId) {
    return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
  }

  try {
    await initAdmin();
    const db = getFirestore();
    const notificationRef = db.collection("notifications").doc(notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    if (notificationDoc.data()?.recipientId !== user.uid) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await notificationRef.update({ read: true, readAt: new Date() });

    return NextResponse.json({ status: 200, message: "Notification marked as read" });
  } catch (e) {
    console.error("Error marking notification as read:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
