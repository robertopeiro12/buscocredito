import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin'; // Adjust the import path as necessary
import { create_subaccount_doc } from '@/db/FirestoreFunc'; // Adjust the import path as necessary
import { create_subaccount } from '@/db/FireAuthFunc'; // Adjust the import path as necessary

export async function POST(req: NextRequest) {
  const { name, email, password,userId } = await req.json();
  if(!name || !email || !password || !userId){
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  try{
    await initAdmin();
    const user = await create_subaccount(name, email, password);
    if(user.status !== 200){
      return NextResponse.json({ error: user.error }, { status: 500 });
    }
    if (user.userId) {
      const account = await create_subaccount_doc(name, email, userId, user.userId);
      if(account.status !== 200){
        return NextResponse.json({ error: account.error }, { status: 500 });
      }
    }
    return NextResponse.json({ userId: user.userId }, { status: 200 });
  }catch(e){
    return NextResponse.json({ error: e }, { status: 500 });
  }
}