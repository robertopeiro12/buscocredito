import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getUnreadNotificationCount } from '@/db/FirestoreFunc';

export async function POST(req: NextRequest) {
  try {
    console.log("Getting unread count - starting...");
    
    // Intentar parsear el JSON de forma segura
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      console.error("Error parsing JSON:", jsonError);
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }

    const { userId } = body;
    console.log("Getting unread count for userId:", userId);
    
    if (!userId) {
      console.error("Missing userId in request");
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    console.log("Initializing admin...");
    await initAdmin();
    
    console.log("Calling getUnreadNotificationCount...");
    const result = await getUnreadNotificationCount(userId);
    console.log("getUnreadNotificationCount result:", result);
    
    if (result.status !== 200) {
      console.error("Error from getUnreadNotificationCount:", result);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    console.log("Returning successful result:", result);
    return NextResponse.json({ 
      status: 200, 
      count: result.count 
    });
  } catch (e) {
    console.error("Error getting unread count:", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
