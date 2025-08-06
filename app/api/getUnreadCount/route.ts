import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getUnreadNotificationCount } from '@/db/FirestoreFunc';

export async function POST(req: NextRequest) {
  try {
    // Intentar parsear el JSON de forma segura
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await initAdmin();
    const result = await getUnreadNotificationCount(userId);
    
    if (result.status !== 200) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      status: 200, 
      count: result.count 
    });
  } catch (e) {
    console.error("Error getting unread count:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
