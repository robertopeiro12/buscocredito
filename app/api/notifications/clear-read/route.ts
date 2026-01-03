import "server-only";
import { NextRequest } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
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

    // Verificar que el usuario está limpiando sus propias notificaciones
    if (body.userId !== user.uid) {
      return createErrorResponse('Solo puedes limpiar tus propias notificaciones', 403);
    }

    // Inicializar Firebase Admin
    await initAdmin();
    const db = getFirestore();
    
    // Obtener solo las notificaciones leídas del usuario
    const notificationsRef = db.collection("notifications");
    const snapshot = await notificationsRef
      .where("recipientId", "==", body.userId)
      .where("read", "==", true)
      .get();
    
    if (snapshot.empty) {
      return createSuccessResponse(
        { deletedCount: 0 },
        'No hay notificaciones leídas para eliminar'
      );
    }

    // Eliminar las notificaciones leídas en lotes
    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    
    return createSuccessResponse(
      { deletedCount: snapshot.docs.length },
      `${snapshot.docs.length} notificaciones leídas eliminadas exitosamente`
    );

  } catch (error: any) {
    console.error("Error clearing read notifications:", error);
    return createErrorResponse('Error interno del servidor');
  }
}
