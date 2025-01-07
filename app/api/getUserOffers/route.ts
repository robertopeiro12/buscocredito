import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin'; // Adjust the import path as necessary
import { getUserOffers } from '@/db/FirestoreFunc'; // Adjust the import path as necessary

export async function GET() {
  try{
    await initAdmin();
   
    const offers = await getUserOffers();
    console.log(offers);
    return NextResponse.json({ offers: offers.offers }, { status: 200 });
  }catch(e){
    return NextResponse.json({ error: e }, { status: 500 });
  }
}