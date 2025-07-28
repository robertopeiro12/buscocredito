import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { createNotification } from '@/db/FirestoreFunc';
import { verifyAuthentication } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';
import { validateRequiredFields } from '../../utils/validation';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (maneja tanto cookies como Bearer tokens)
    const user = await verifyAuthentication(request);
    if (!user) {
      return ApiResponses.unauthorized();
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Validar campos requeridos
    const validation = validateRequiredFields(body, ['userId']);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.errors);
    }

    // Solo admins pueden crear notificaciones de prueba
    if (user.userType !== 'admin') {
      return createErrorResponse('Solo administradores pueden crear notificaciones de prueba', 403);
    }

    // Inicializar Firebase Admin
    await initAdmin();
    
    // Crear notificación de prueba con datos reales
    const result = await createNotification({
      recipientId: body.userId,
      type: "loan_assigned_other",
      title: "Préstamo asignado a otra propuesta",
      message: "La solicitud fue asignada a otra propuesta. Esta es una notificación de prueba.",
      data: {
        loanId: "test-loan-id",
        winningOffer: {
          amount: 50000,
          interestRate: 12.5,
          amortizationFrequency: "Mensual",
          term: 12,
          comision: 5.0,
          medicalBalance: 0
        }
      }
    });
    
    if (result.status !== 200) {
      console.error('Error creating test notification:', result.error);
      return createErrorResponse(result.error || 'Error al crear notificación de prueba');
    }

    return createSuccessResponse(
      { notificationId: result.notificationId },
      'Notificación de prueba creada exitosamente'
    );

  } catch (error: any) {
    console.error("Error creating test notification:", error);
    return createErrorResponse('Error interno del servidor');
  }
}
