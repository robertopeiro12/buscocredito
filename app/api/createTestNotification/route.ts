import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { createNotification } from '@/db/FirestoreFunc';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();
  
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    await initAdmin();
    
    // Crear notificación de prueba para competidor con datos reales
    const result = await createNotification({
      recipientId: userId,
      type: "loan_assigned_other",
      title: "Préstamo asignado a otra propuesta",
      message: "La solicitud fue asignada a otra propuesta",
      data: {
        loanId: "L68sRuQyjGJcmksD1ZL3",
        winningOffer: {
          amount: 300000,
          interestRate: 1,
          amortizationFrequency: "mensual",
          term: 6,
          comision: 1,
          medicalBalance: 1
        }
      }
    });
    
    if (result.status !== 200) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ 
      status: 200, 
      message: "Test notification created successfully",
      notificationId: result.notificationId
    });
  } catch (e) {
    console.error("Error creating test notification:", e);
    return NextResponse.json({ error: e }, { status: 500 });
  }
}
