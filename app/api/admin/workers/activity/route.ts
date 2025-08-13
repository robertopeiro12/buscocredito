import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore, FieldPath } from 'firebase-admin/firestore';
import { verifyAuthentication, createUnauthorizedResponse } from '@/app/api/utils/auth';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = await verifyAuthentication(request);
    if (!user) {
      return createUnauthorizedResponse();
    }

    // Solo administradores pueden acceder
    if (user.userType !== 'b_admin') {
      return new Response(
        JSON.stringify({ error: 'Acceso denegado - Solo administradores' }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    await initAdmin();
    const db = getFirestore();
    
    // Obtener parámetros de query
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const workerId = url.searchParams.get('workerId'); // Para filtrar por trabajador específico
    
    console.log(`📅 Admin ${user.uid} solicitando actividad reciente (limit: ${limit}, workerId: ${workerId || 'todos'})...`);
    
    // 1. Obtener todos los trabajadores de este administrador (o uno específico)
    const workersRef = db.collection('cuentas');
    let workersQuery = workersRef.where('Empresa_id', '==', user.uid);
    
    if (workerId) {
      workersQuery = workersRef.where('Empresa_id', '==', user.uid).where(FieldPath.documentId(), '==', workerId);
    }
    
    const workersSnapshot = await workersQuery.get();
    
    if (workersSnapshot.empty) {
      console.log(`⚠️ No se encontraron trabajadores para admin ${user.uid}`);
      return NextResponse.json({ activities: [] }, { status: 200 });
    }

    // Crear mapa de trabajadores para referencia rápida
    const workersMap = new Map<string, {id: string, name: string, email: string}>();
    workersSnapshot.forEach(doc => {
      const data = doc.data();
      workersMap.set(doc.id, {
        id: doc.id,
        name: data.Nombre || data.name || 'Sin nombre',
        email: data.email || ''
      });
    });

    interface Activity {
      id: string;
      type: 'solicitud' | 'propuesta';
      action: string;
      status: string;
      worker: {id: string, name: string, email: string};
      details: any;
      timestamp: Date;
      createdAt: Date | null;
    }

    const allActivities: Activity[] = [];
    
    // 2. Obtener actividades recientes de solicitudes
    for (const [workerId, workerInfo] of Array.from(workersMap.entries())) {
      try {
        console.log(`🔍 Buscando actividades para ${workerInfo.name}...`);
        
        // Actividades de solicitudes (como partner)
        const solicitudesRef = db.collection('solicitudes');
        const solicitudesQuery = solicitudesRef
          .where('partner', '==', workerId)
          .orderBy('updatedAt', 'desc')
          .limit(20);
          
        const solicitudesSnapshot = await solicitudesQuery.get();
        
        solicitudesSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.updatedAt) {
            allActivities.push({
              id: doc.id,
              type: 'solicitud',
              action: getActionFromStatus(data.status),
              status: data.status,
              worker: workerInfo,
              details: {
                amount: data.amount,
                company: data.company,
                loanId: data.loanId,
                requestInfo: {
                  originalAmount: data.requestInfo?.originalAmount,
                  purpose: data.requestInfo?.purpose,
                  type: data.requestInfo?.type
                }
              },
              timestamp: data.updatedAt.toDate(),
              createdAt: data.createdAt ? data.createdAt.toDate() : null
            });
          }
        });
        
        // Actividades de propuestas (como userId - cuando el trabajador crea propuestas)
        const propuestasRef = db.collection('propuestas');
        const propuestasQuery = propuestasRef
          .where('userId', '==', workerId)
          .orderBy('updatedAt', 'desc')
          .limit(20);
          
        const propuestasSnapshot = await propuestasQuery.get();
        
        propuestasSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.updatedAt) {
            allActivities.push({
              id: doc.id,
              type: 'propuesta',
              action: getProposalAction(data.status),
              status: data.status,
              worker: workerInfo,
              details: {
                amount: data.amount,
                purpose: data.purpose,
                term: data.term,
                payment: data.payment,
                acceptedOfferId: data.acceptedOfferId,
                acceptedProposalId: data.acceptedProposalId
              },
              timestamp: data.updatedAt.toDate(),
              createdAt: data.createdAt ? data.createdAt.toDate() : null
            });
          }
        });
        
      } catch (workerError) {
        console.error(`❌ Error obteniendo actividades para trabajador ${workerId}:`, workerError);
      }
    }
    
    // 3. Ordenar todas las actividades por timestamp (más recientes primero)
    allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // 4. Limitar resultados
    const limitedActivities = allActivities.slice(0, limit);
    
    // 5. Formatear para respuesta
    const formattedActivities = limitedActivities.map(activity => ({
      id: activity.id,
      type: activity.type,
      action: activity.action,
      status: activity.status,
      worker: activity.worker,
      details: activity.details,
      timestamp: activity.timestamp.toISOString(),
      createdAt: activity.createdAt ? activity.createdAt.toISOString() : null,
      timeAgo: getTimeAgo(activity.timestamp)
    }));
    
    console.log(`✅ Encontradas ${formattedActivities.length} actividades recientes para admin ${user.uid}`);
    
    return NextResponse.json({
      activities: formattedActivities,
      meta: {
        total: formattedActivities.length,
        limit,
        workerId,
        generatedAt: new Date().toISOString()
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Error en API workers/activity:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Función auxiliar para determinar la acción basada en el status
function getActionFromStatus(status: string): string {
  switch (status) {
    case 'approved':
      return 'Aprobó solicitud';
    case 'rejected':
      return 'Rechazó solicitud';
    case 'pending':
      return 'Procesando solicitud';
    default:
      return 'Actualizó solicitud';
  }
}

// Función auxiliar para determinar la acción de propuestas
function getProposalAction(status: string): string {
  switch (status) {
    case 'approved':
      return 'Propuesta aprobada';
    case 'rejected':
      return 'Propuesta rechazada';
    case 'pending':
      return 'Creó propuesta';
    default:
      return 'Actualizó propuesta';
  }
}

// Función auxiliar para calcular "hace cuánto tiempo"
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInMinutes < 1) {
    return 'hace unos segundos';
  } else if (diffInMinutes < 60) {
    return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
  } else if (diffInHours < 24) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInDays < 30) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  } else {
    return date.toLocaleDateString('es-MX', { 
      day: 'numeric', 
      month: 'short',
      year: diffInDays > 365 ? 'numeric' : undefined 
    });
  }
}
