import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
import { verifyAuthentication, createUnauthorizedResponse } from '@/app/api/utils/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🚀 API workers/stats iniciada');
    
    // Verificar autenticación
    const user = await verifyAuthentication(request);
    if (!user) {
      console.log('❌ Usuario no autenticado');
      return createUnauthorizedResponse();
    }

    console.log(`👤 Usuario autenticado: ${user.uid}, tipo: ${user.userType}`);

    // Solo administradores pueden acceder
    if (user.userType !== 'companyAdmin') {
      console.log('❌ Usuario no es administrador');
      return new Response(
        JSON.stringify({ error: 'Acceso denegado - Solo administradores' }), 
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Read ?period=month|all (default: month)
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') === 'all' ? 'all' : 'month';

    const startOfMonth =
      period === 'month'
        ? (() => {
            const d = new Date();
            d.setDate(1);
            d.setHours(0, 0, 0, 0);
            return d;
          })()
        : null;

    await initAdmin();
    const db = getFirestore();
    
    console.log(`📊 Admin ${user.uid} solicitando estadísticas de trabajadores...`);
    
    // 1. Obtener todos los trabajadores de este administrador
    const workersRef = db.collection('cuentas');
    const workersQuery = workersRef.where('adminId', '==', user.uid);
    const workersSnapshot = await workersQuery.get();
    
    console.log(`📊 Buscando trabajadores para admin: ${user.uid}`);
    console.log(`📊 Trabajadores encontrados: ${workersSnapshot.size}`);
    
    if (workersSnapshot.empty) {
      console.log(`⚠️ No se encontraron trabajadores para admin ${user.uid}`);
      return NextResponse.json({ 
        workers: [],
        summary: {
          totalWorkers: 0,
          activeWorkers: 0,
          totalSolicitudes: 0,
          totalPropuestasEnviadas: 0,
          averageApprovalRate: 0
        }
      }, { status: 200 });
    }

    const workersStats = [];
    
    // 2. Para cada trabajador, calcular estadísticas de propuestas
    for (const workerDoc of workersSnapshot.docs) {
      const workerId = workerDoc.id;
      const workerData = workerDoc.data();
      
      console.log(`📈 Calculando stats para trabajador ${workerId}...`);
      
      try {
        // Obtener propuestas donde este trabajador es el partner (maneja la propuesta)
        const propuestasRef = db.collection('propuestas');
        let propuestasQuery: FirebaseFirestore.Query = propuestasRef.where('lenderId', '==', workerId);
        if (startOfMonth) {
          propuestasQuery = propuestasQuery.where('createdAt', '>=', startOfMonth);
        }
        const propuestasSnapshot = await propuestasQuery.get();
        
        console.log(`📈 Trabajador ${workerId} (${workerData.name}): ${propuestasSnapshot.size} propuestas`);
        
        // Calcular métricas básicas
        const totalPropuestas = propuestasSnapshot.size;
        
        // Calcular propuestas por estado
        let propuestasApproved = 0;
        let propuestasRejected = 0;
        let propuestasPending = 0;
        let lastActivity: Date | null = null;
        
        propuestasSnapshot.forEach(doc => {
          const data = doc.data();
          const status = data.status;
          
          // Mapear estados según la estructura real de Firebase
          if (status === 'approved' || status === 'accepted') propuestasApproved++;
          else if (status === 'rejected' || status === 'declined') propuestasRejected++;
          else if (status === 'pending' || status === 'active') propuestasPending++;
          
          // Obtener última actividad - manejar diferentes formatos de fecha
          if (data.updatedAt) {
            let updatedAt: Date;
            
            // Si es un Timestamp de Firebase
            if (data.updatedAt.toDate && typeof data.updatedAt.toDate === 'function') {
              updatedAt = data.updatedAt.toDate();
            }
            // Si es un string (ISO date)
            else if (typeof data.updatedAt === 'string') {
              updatedAt = new Date(data.updatedAt);
            }
            // Si es un número (timestamp)
            else if (typeof data.updatedAt === 'number') {
              updatedAt = new Date(data.updatedAt);
            }
            // Si es un objeto con segundos (Firestore Timestamp serializado)
            else if (data.updatedAt.seconds) {
              updatedAt = new Date(data.updatedAt.seconds * 1000);
            }
            else {
              console.log(`⚠️ Formato de fecha no reconocido para updatedAt:`, data.updatedAt);
              updatedAt = new Date(); // Fallback a fecha actual
            }
            
            if (!lastActivity || updatedAt > lastActivity) {
              lastActivity = updatedAt;
            }
          } else if (data.createdAt) {
            let createdAt: Date;
            
            // Mismo manejo para createdAt
            if (data.createdAt.toDate && typeof data.createdAt.toDate === 'function') {
              createdAt = data.createdAt.toDate();
            }
            else if (typeof data.createdAt === 'string') {
              createdAt = new Date(data.createdAt);
            }
            else if (typeof data.createdAt === 'number') {
              createdAt = new Date(data.createdAt);
            }
            else if (data.createdAt.seconds) {
              createdAt = new Date(data.createdAt.seconds * 1000);
            }
            else {
              console.log(`⚠️ Formato de fecha no reconocido para createdAt:`, data.createdAt);
              createdAt = new Date(); // Fallback a fecha actual
            }
            
            if (!lastActivity || createdAt > lastActivity) {
              lastActivity = createdAt;
            }
          }
        });
        
        // Calcular tasa de aprobación basada en propuestas
        const approvalRate = totalPropuestas > 0 
          ? Math.round((propuestasApproved / totalPropuestas) * 100) 
          : 0;
        
        // Determinar estado del trabajador y calcular métricas
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        let isActive = false;
        let averageDailyActivity = 0;
        let lastActivityISO: string | null = null;
        
        if (lastActivity) {
          const activityDate = lastActivity as Date;
          isActive = activityDate.getTime() > sevenDaysAgo.getTime();
          lastActivityISO = activityDate.toISOString();
          
          if (totalPropuestas > 0) {
            const daysDiff = Math.max(1, Math.ceil((now.getTime() - activityDate.getTime()) / (24 * 60 * 60 * 1000)));
            averageDailyActivity = Math.round(totalPropuestas / daysDiff);
          }
        }
        
        const workerStats = {
          id: workerId,
          name: workerData.name || 'Sin nombre',
          email: workerData.email || '',
          type: workerData.type || 'lender',
          
          // Métricas calculadas
          stats: {
            totalSolicitudes: 0, // Ya no se usan solicitudes
            totalPropuestas,
            solicitudesApproved: propuestasApproved, // Mantenemos nombre por compatibilidad con el frontend
            solicitudesRejected: propuestasRejected,
            solicitudesPending: propuestasPending,
            approvalRate,
            lastActivity: lastActivityISO,
            isActive,
            
            // Métricas derivadas
            averageDailyActivity
          }
        };
        
        workersStats.push(workerStats);
        console.log(`✅ Stats calculadas para ${workerData.name}: ${totalPropuestas} propuestas, ${approvalRate}% aprobación`);
        
      } catch (workerError) {
        console.error(`❌ Error calculando stats para trabajador ${workerId}:`, workerError);
        
        // Incluir trabajador con stats básicos aunque falle el cálculo
        workersStats.push({
          id: workerId,
          name: workerData.name || 'Sin nombre',
          email: workerData.email || '',
          type: workerData.type || 'lender',
          stats: {
            totalSolicitudes: 0,
            totalPropuestas: 0,
            solicitudesApproved: 0,
            solicitudesRejected: 0,
            solicitudesPending: 0,
            approvalRate: 0,
            lastActivity: null,
            isActive: false,
            averageDailyActivity: 0,
            error: 'Error calculando estadísticas'
          }
        });
      }
    }
    
    // Ordenar por actividad (activos primero, luego por última actividad)
    workersStats.sort((a, b) => {
      if (a.stats.isActive && !b.stats.isActive) return -1;
      if (!a.stats.isActive && b.stats.isActive) return 1;
      
      const aLastActivity = a.stats.lastActivity ? new Date(a.stats.lastActivity).getTime() : 0;
      const bLastActivity = b.stats.lastActivity ? new Date(b.stats.lastActivity).getTime() : 0;
      
      return bLastActivity - aLastActivity;
    });
    
    console.log(`✅ Estadísticas calculadas para ${workersStats.length} trabajadores del admin ${user.uid}`);
    
    const response = { 
      workers: workersStats,
      summary: {
        totalWorkers: workersStats.length,
        activeWorkers: workersStats.filter(w => w.stats.isActive).length,
        totalSolicitudes: workersStats.reduce((sum, w) => sum + w.stats.totalSolicitudes, 0),
        totalPropuestasEnviadas: workersStats.reduce((sum, w) => sum + w.stats.totalPropuestas, 0),
        averageApprovalRate: workersStats.length > 0 
          ? Math.round(workersStats.reduce((sum, w) => sum + w.stats.approvalRate, 0) / workersStats.length)
          : 0
      }
    };
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Error en API workers/stats:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
