import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { markNotificationAsRead } from '@/db/FirestoreFunc';

export async function POST(req: NextRequest) {
  const { notificationId } = await req.json();
  
  if (!notificationId) {
    return NextResponse.json({ error: "Missing notificationId" }, { status: 400 });
  }

  try {
    await initAdmin();
    const result = await markNotificationAsRead(notificationId);
    
    if (result.status !== 200) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      status: 200, 
      message: "Notification marked as read" 
    });
  } catch (e) {
    console.error("Error marking notification as read:", e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}
