import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/app/firebase-admin';
import { auth } from 'firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autorización requerido' },
        { status: 401 }
      );
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await auth().verifyIdToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: 'Token de autorización inválido' },
        { status: 401 }
      );
    }

    // Verificar que el usuario sea lender
    const userDoc = await adminFirestore
      .collection('users')
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists || userDoc.data()?.role !== 'b_sale') {
      return NextResponse.json(
        { error: 'Solo los lenders pueden crear propuestas' },
        { status: 403 }
      );
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Agregar lenderId del token autenticado
    const propuestaData = {
      ...body,
      lenderId: decodedToken.uid,
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
        estado: 'pendiente',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

    // Crear notificación para el usuario
    await adminFirestore
      .collection('notifications')
      .add({
        userId: body.userId,
        tipo: 'nueva_propuesta',
        titulo: 'Nueva propuesta recibida',
        mensaje: `Has recibido una nueva propuesta para tu solicitud de préstamo de $${propuestaData.montoOfrecido.toLocaleString()}`,
        leida: false,
        fechaCreacion: new Date(),
        solicitudId: body.solicitudId,
        propuestaId: propuestaRef.id,
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
