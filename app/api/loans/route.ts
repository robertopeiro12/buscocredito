import "server-only";
import { NextRequest } from 'next/server';
import { adminFirestore } from '@/app/firebase-admin';
import { verifyAuthentication } from '../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../utils/response';
import { BusinessValidators } from '../utils/validation';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (maneja tanto cookies como Bearer tokens)
    const user = await verifyAuthentication(request);
    if (!user) {
      return ApiResponses.unauthorized();
    }

    // Solo usuarios tipo 'user' pueden crear solicitudes
    if (user.userType !== 'user') {
      return ApiResponses.onlyUsersAllowed();
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Validar datos de la solicitud
    const validation = BusinessValidators.loanRequest(body);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.errors);
    }
    
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

    return createSuccessResponse(
      { solicitudId: solicitudRef.id },
      'Solicitud de préstamo creada exitosamente'
    );

  } catch (error) {
    console.error('Error al crear solicitud:', error);
    return createErrorResponse('Error interno del servidor');
  }
}
