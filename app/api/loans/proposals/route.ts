import "server-only";
import { NextRequest } from 'next/server';
import { adminFirestore } from '@/app/firebase-admin';
import { verifyAuthentication } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';
import { BusinessValidators, validateRequiredFields } from '../../utils/validation';
import { createNotification } from '@/db/FirestoreFunc';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación (maneja tanto cookies como Bearer tokens)
    const user = await verifyAuthentication(request);
    if (!user) {
      return ApiResponses.unauthorized();
    }

    // Solo lenders (b_sale) pueden crear propuestas
    if (user.userType !== 'b_sale') {
      return ApiResponses.onlyLendersAllowed();
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Validar campos requeridos
    const validation = validateRequiredFields(body, ['solicitudId']);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.errors);
    }
    
    // Validar datos de la propuesta
    const proposalValidation = BusinessValidators.proposal(body);
    if (!proposalValidation.isValid) {
      return ApiResponses.missingFields(proposalValidation.errors);
    }
    
    // Verificar que la solicitud existe y está disponible
    const solicitudRef = adminFirestore.collection('solicitudes').doc(body.solicitudId);
    const solicitudDoc = await solicitudRef.get();

    if (!solicitudDoc.exists) {
      return ApiResponses.loanNotFound();
    }

    if (solicitudDoc.data()?.status !== 'pending') {
      return ApiResponses.loanNotAvailable();
    }

    // Agregar lenderId del usuario autenticado
    const propuestaData = {
      ...body,
      lenderId: user.uid,
      estado: 'pendiente',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Guardar propuesta en Firestore
    const propuestaRef = await adminFirestore
      .collection('propuestas')
      .add(propuestaData);

    // Crear notificación para el usuario (web + email)
    await createNotification({
      recipientId: body.userId,
      type: 'nueva_propuesta',
      title: 'Nueva propuesta recibida',
      message: `Has recibido una nueva propuesta para tu solicitud de préstamo de $${propuestaData.amount?.toLocaleString()}`,
      data: {
        loanId: body.solicitudId,
        proposalId: propuestaRef.id,
        amount: propuestaData.amount,
        interestRate: propuestaData.interest_rate,
        amortizationFrequency: propuestaData.amortization_frequency,
        amortization: propuestaData.amortization,
        term: propuestaData.deadline,
        comision: propuestaData.comision,
        medicalBalance: propuestaData.medical_balance
      },
    });

    return createSuccessResponse(
      { propuestaId: propuestaRef.id },
      'Propuesta creada exitosamente'
    );

  } catch (error) {
    console.error('Error al crear propuesta:', error);
    return createErrorResponse('Error interno del servidor');
  }
}
