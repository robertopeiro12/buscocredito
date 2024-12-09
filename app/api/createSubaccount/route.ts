import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { auth2, db2 } from '../../../config/FirebaseAdmin'; // Adjust the import path as necessary
import { doc, setDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  try {
    const userRecord = await auth2.createUser({
      email: email,
      password: password,
      displayName: name
    });

    const userId = userRecord.uid;
    //const cityRef = doc(db2, "cuentas", userId);

    // await setDoc(cityRef, {
    //   Nombre: name,
    //   Empresa: "",
    //   Empresa_id: "", // Adjust as necessary
    //   type: "b_sale",
    //   email,
    // });

    return NextResponse.json({ userId }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}