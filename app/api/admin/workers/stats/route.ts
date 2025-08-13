import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { getFirestore } from 'firebase-admin/firestore';
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
    
    console.log(`📊 Admin ${user.uid} solicitando estadísticas de trabajadores...`);
    
    // 1. Obtener todos los trabajadores de este administrador
    const workersRef = db.collection('cuentas');
    const workersQuery = workersRef.where('Empresa_id', '==', user.uid);
    const workersSnapshot = await workersQuery.get();
    
    if (workersSnapshot.empty) {
      console.log(`⚠️ No se encontraron trabajadores para admin ${user.uid}`);
      return NextResponse.json({ workers: [] }, { status: 200 });
    }

    const workersStats = [];
    
    // 2. Para cada trabajador, calcular estadísticas
    for (const workerDoc of workersSnapshot.docs) {
      const workerId = workerDoc.id;
      const workerData = workerDoc.data();
      
      console.log(`📈 Calculando stats para trabajador ${workerId}...`);
      
      try {
        // Obtener solicitudes asignadas a este trabajador
        const solicitudesRef = db.collection('solicitudes');
        const solicitudesQuery = solicitudesRef.where('partner', '==', workerId);
        const solicitudesSnapshot = await solicitudesQuery.get();
        
        // Obtener propuestas donde este trabajador participó
        const propuestasRef = db.collection('propuestas');
        const propuestasQuery = propuestasRef.where('userId', '==', workerId);
        const propuestasSnapshot = await propuestasQuery.get();
        
        // Calcular métricas básicas
        const totalSolicitudes = solicitudesSnapshot.size;
        const totalPropuestas = propuestasSnapshot.size;
        
        // Calcular solicitudes por estado
        let solicitudesApproved = 0;
        let solicitudesRejected = 0;
        let solicitudesPending = 0;
        let lastActivity: Date | null = null;
        
        solicitudesSnapshot.forEach(doc => {
          const data = doc.data();
          const status = data.status;
          
          if (status === 'approved') solicitudesApproved++;
          else if (status === 'rejected') solicitudesRejected++;
          else solicitudesPending++;
          
          // Obtener última actividad
          if (data.updatedAt) {
            const updatedAt = data.updatedAt.toDate();
            if (!lastActivity || updatedAt > lastActivity) {
              lastActivity = updatedAt;
            }
          }
        });
        
        // Calcular tasa de aprobación
        const approvalRate = totalSolicitudes > 0 
          ? Math.round((solicitudesApproved / totalSolicitudes) * 100) 
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
          
          if (totalSolicitudes > 0) {
            const daysDiff = Math.max(1, Math.ceil((now.getTime() - activityDate.getTime()) / (24 * 60 * 60 * 1000)));
            averageDailyActivity = Math.round(totalSolicitudes / daysDiff);
          }
        }
        
        const workerStats = {
          id: workerId,
          name: workerData.Nombre || workerData.name || 'Sin nombre',
          email: workerData.email || '',
          type: workerData.type || 'b_sale',
          
          // Métricas calculadas
          stats: {
            totalSolicitudes,
            totalPropuestas,
            solicitudesApproved,
            solicitudesRejected,
            solicitudesPending,
            approvalRate,
            lastActivity: lastActivityISO,
            isActive,
            
            // Métricas derivadas
            averageDailyActivity
          }
        };
        
        workersStats.push(workerStats);
        console.log(`✅ Stats calculadas para ${workerData.Nombre}: ${totalSolicitudes} solicitudes, ${approvalRate}% aprobación`);
        
      } catch (workerError) {
        console.error(`❌ Error calculando stats para trabajador ${workerId}:`, workerError);
        
        // Incluir trabajador con stats básicos aunque falle el cálculo
        workersStats.push({
          id: workerId,
          name: workerData.Nombre || workerData.name || 'Sin nombre',
          email: workerData.email || '',
          type: workerData.type || 'b_sale',
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
    
    return NextResponse.json({ 
      workers: workersStats,
      summary: {
        totalWorkers: workersStats.length,
        activeWorkers: workersStats.filter(w => w.stats.isActive).length,
        totalSolicitudes: workersStats.reduce((sum, w) => sum + w.stats.totalSolicitudes, 0),
        averageApprovalRate: workersStats.length > 0 
          ? Math.round(workersStats.reduce((sum, w) => sum + w.stats.approvalRate, 0) / workersStats.length)
          : 0
      }
    }, { status: 200 });
    
  } catch (error) {
    console.error('❌ Error en API workers/stats:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
