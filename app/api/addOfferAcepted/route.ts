import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin'; // Adjust the import path as necessary
import {add_aceppted } from '@/db/FirestoreFunc'; // Adjust the import path as necessary

export async function POST(req: NextRequest) {
  const {id,userId} = await req.json();
  if(!userId){
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  try{
    await initAdmin();
    const user_data = await add_aceppted(id,userId);
    if(user_data.status !== 200){
      return NextResponse.json({ error: user_data.error }, { status: 500 });
    }

    return NextResponse.json({ status: 200 });
  }catch(e){
    return NextResponse.json({ error: e }, { status: 500 });
  }
}