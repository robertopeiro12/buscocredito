import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/app/firebase-admin';
import { verifyAuthentication, createUnauthorizedResponse, createForbiddenResponse } from '../utils/auth';
import { createNotification } from '@/db/FirestoreFunc';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (maneja tanto cookies como Bearer tokens)
    const user = await verifyAuthentication(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    // Solo lenders (b_sale) pueden crear propuestas
    if (user.userType !== 'b_sale') {
      return createForbiddenResponse('Solo los lenders pueden crear propuestas');
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Agregar lenderId del usuario autenticado
    const propuestaData = {
      ...body,
      lenderId: user.uid,
      fechaCreacion: new Date(),
    };

    // Verificar que la solicitud existe y está disponible
    const solicitudRef = adminFirestore.collection('solicitudes').doc(body.solicitudId);
    const solicitudDoc = await solicitudRef.get();

    if (!solicitudDoc.exists) {
      return NextResponse.json(
        { error: 'La solicitud no existe' },
        { status: 404 }
      );
    }

    if (solicitudDoc.data()?.status !== 'pending') {
      return NextResponse.json(
        { error: 'La solicitud ya no está disponible para propuestas' },
        { status: 409 }
      );
    }

    // Guardar propuesta en Firestore
    const propuestaRef = await adminFirestore
      .collection('propuestas')
      .add({
        ...propuestaData,
        loanId: body.solicitudId, // Ensure loanId is set for getLoanOffers query
        estado: 'pendiente',
        status: 'pending', // Add status field for consistency
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    // Crear notificación para el usuario (web + email)
    await createNotification({
      recipientId: body.userId,
      type: 'nueva_propuesta',
      title: 'Nueva propuesta recibida',
      message: `Has recibido una nueva propuesta para tu solicitud de préstamo de $${propuestaData.montoOfrecido?.toLocaleString() || propuestaData.amount?.toLocaleString() || 'N/A'}`,
      data: {
        loanId: body.solicitudId,
        proposalId: propuestaRef.id,
        amount: propuestaData.montoOfrecido || propuestaData.amount,
        interestRate: propuestaData.tasaInteres || propuestaData.interest_rate,
        amortizationFrequency: propuestaData.frecuenciaPago || propuestaData.amortization_frequency,
        amortization: propuestaData.montoAmortizacion || propuestaData.amortization,
        term: propuestaData.plazo || propuestaData.deadline,
        comision: propuestaData.comision,
        medicalBalance: propuestaData.seguroVida || propuestaData.medical_balance
      },
    });

    return NextResponse.json({
      success: true,
      propuestaId: propuestaRef.id,
      mensaje: 'Propuesta creada exitosamente'
    });

  } catch (error) {
    console.error('Error al crear propuesta:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
