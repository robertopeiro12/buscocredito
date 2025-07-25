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

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Crear datos finales para guardar
    const solicitudData = {
      ...body,
      userId: decodedToken.uid,
      income: Number(body.income), // Convertir income a número
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Guardar en Firestore
    const solicitudRef = await adminFirestore
      .collection('solicitudes')
      .add(solicitudData);

    return NextResponse.json({
      success: true,
      solicitudId: solicitudRef.id,
      mensaje: 'Solicitud creada exitosamente'
    });

  } catch (error) {
    console.error('Error al crear solicitud:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
