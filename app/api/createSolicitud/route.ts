import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/app/firebase-admin';
import { verifyAuthentication, createUnauthorizedResponse } from '../utils/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (maneja tanto cookies como Bearer tokens)
    const user = await verifyAuthentication(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    // Solo usuarios tipo 'user' pueden crear solicitudes
    if (user.userType !== 'user') {
      return NextResponse.json(
        { error: 'Solo los usuarios pueden crear solicitudes' },
        { status: 403 }
      );
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Crear datos finales para guardar
    const solicitudData = {
      ...body,
      userId: user.uid,
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
