import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getUnreadNotificationCount } from '@/db/FirestoreFunc';
import { verifyAuthentication } from '../utils/auth';

export async function POST(req: NextRequest) {
  const user = await verifyAuthentication(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await initAdmin();
    const result = await getUnreadNotificationCount(user.uid);

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
