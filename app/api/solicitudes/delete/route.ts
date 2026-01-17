import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAuthentication } from '../../utils/auth';
import { ApiResponses, createSuccessResponse, createErrorResponse } from '../../utils/response';
import { validateRequiredFields } from '../../utils/validation';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthentication(request);
    if (!user) {
      return ApiResponses.unauthorized();
    }

    // Obtener datos del cuerpo de la petición
    const body = await request.json();
    
    // Validar campos requeridos
    const validation = validateRequiredFields(body, ['solicitudId']);
    if (!validation.isValid) {
      return ApiResponses.missingFields(validation.errors);
    }

    const { solicitudId } = body;

    // Inicializar Firebase Admin
    await initAdmin();
    const db = getFirestore();

    // Verificar que la solicitud existe y pertenece al usuario
    const solicitudRef = db.collection("solicitudes").doc(solicitudId);
    const solicitudDoc = await solicitudRef.get();

    if (!solicitudDoc.exists) {
      return createErrorResponse('La solicitud no existe', 404);
    }

    const solicitudData = solicitudDoc.data();

    // Verificar que el usuario es el dueño de la solicitud
    if (solicitudData?.userId !== user.uid) {
      return createErrorResponse('No tienes permiso para eliminar esta solicitud', 403);
    }

    // Verificar que la solicitud no tenga una propuesta aceptada
    if (solicitudData?.status === 'approved') {
      return createErrorResponse('No puedes eliminar una solicitud con propuesta aceptada', 400);
    }

    // Delete all propuestas linked to this solicitud (by loanId)
    const propuestasByLoanId = await db.collection("propuestas")
      .where("loanId", "==", solicitudId)
      .get();
    
    // Also check for propuestas linked by solicitudId (backward compatibility)
    const propuestasBySolicitudId = await db.collection("propuestas")
      .where("solicitudId", "==", solicitudId)
      .get();

    // Collect all propuesta docs to delete (deduplicated by id)
    const propuestaDocsToDelete = new Map();
    propuestasByLoanId.docs.forEach(doc => propuestaDocsToDelete.set(doc.id, doc));
    propuestasBySolicitudId.docs.forEach(doc => propuestaDocsToDelete.set(doc.id, doc));

    // Delete propuestas in batch
    if (propuestaDocsToDelete.size > 0) {
      const batch = db.batch();
      propuestaDocsToDelete.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log(`Deleted ${propuestaDocsToDelete.size} propuestas for solicitud ${solicitudId}`);
    }

    // Delete the solicitud
    await solicitudRef.delete();
    console.log(`User ${user.uid} deleted solicitud ${solicitudId}`);

    return createSuccessResponse(
      { 
        deletedSolicitudId: solicitudId,
        deletedPropuestas: propuestaDocsToDelete.size 
      },
      'Solicitud eliminada exitosamente'
    );

  } catch (error: any) {
    console.error("Error deleting solicitud:", error);
    return createErrorResponse('Error interno del servidor');
  }
}
