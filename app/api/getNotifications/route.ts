import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getNotificationsForUser } from '@/db/FirestoreFunc';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    await initAdmin();
    const result = await getNotificationsForUser(userId);
    
    if (result.status !== 200) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      status: 200, 
      data: result.data 
    });
  } catch (e) {
    console.error("Error getting notifications:", e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}
