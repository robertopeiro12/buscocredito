import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin'; // Adjust the import path as necessary
import { getUserOfferData } from '@/db/FirestoreFunc'; // Adjust the import path as necessary

export async function POST(req: NextRequest) {
  const {userId} = await req.json();
  if(!userId){
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  try{
    await initAdmin();
    const user_data = await getUserOfferData(userId);
    if(user_data.status !== 200){
      return NextResponse.json({ error: user_data.error }, { status: 500 });
    }

    return NextResponse.json({ data: user_data.data }, { status: 200 });
  }catch(e){
    return NextResponse.json({ error: e }, { status: 500 });
  }
}