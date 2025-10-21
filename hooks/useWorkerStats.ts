import { useState, useEffect, useCallback } from 'react';

// Types
export interface WorkerStats {
  totalSolicitudes: number;
  totalPropuestas: number;
  solicitudesApproved: number;
  solicitudesRejected: number;
  solicitudesPending: number;
  approvalRate: number;
  lastActivity: string | null;
  isActive: boolean;
  averageDailyActivity: number;
  error?: string;
}

export interface Worker {
  id: string;
  name: string;
  email: string;
  type: string;
  stats: WorkerStats;
}

export interface WorkersSummary {
  totalWorkers: number;
  activeWorkers: number;
  totalSolicitudes: number;
  totalPropuestasEnviadas: number;
  averageApprovalRate: number;
}

export interface WorkersStatsResponse {
  workers: Worker[];
  summary: WorkersSummary;
}

export interface Activity {
  id: string;
  type: 'solicitud' | 'propuesta';
  action: string;
  status: string;
  worker: {
    id: string;
    name: string;
    email: string;
  };
  details: any;
  timestamp: string;
  createdAt: string | null;
  timeAgo: string;
}

export interface ActivityResponse {
  activities: Activity[];
  meta: {
    total: number;
    limit: number;
    workerId: string | null;
    generatedAt: string;
  };
}

export interface UseWorkerStatsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // en segundos
  enableActivity?: boolean;
  activityLimit?: number;
}

export function useWorkerStats(options: UseWorkerStatsOptions = {}) {
  const {
    autoRefresh = false,
    refreshInterval = 30,
    enableActivity = false,
    activityLimit = 20
  } = options;

  // Estados para estadísticas
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [summary, setSummary] = useState<WorkersSummary>({
    totalWorkers: 0,
    activeWorkers: 0,
    totalSolicitudes: 0,
    totalPropuestasEnviadas: 0,
    averageApprovalRate: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Estados para actividad
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [activityError, setActivityError] = useState<string | null>(null);

  // Estado general
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Función para obtener estadísticas de trabajadores
  const fetchWorkerStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setStatsError(null);

      const response = await fetch('/api/admin/workers/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data: WorkersStatsResponse = await response.json();

      setWorkers(data.workers);
      setSummary(data.summary);
      setLastUpdated(new Date());

    } catch (error: any) {
      console.error('❌ Error obteniendo estadísticas:', error);
      setStatsError(error.message || 'Error obteniendo estadísticas de trabajadores');
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Función para obtener actividad reciente
  const fetchActivity = useCallback(async (workerId?: string) => {
    try {
      setIsLoadingActivity(true);
      setActivityError(null);

      const params = new URLSearchParams();
      params.append('limit', activityLimit.toString());
      if (workerId) {
        params.append('workerId', workerId);
      }

      console.log(`🔄 Obteniendo actividad reciente${workerId ? ` para ${workerId}` : ''}...`);

      const response = await fetch(`/api/admin/workers/activity?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}: ${response.statusText}`);
      }

      const data: ActivityResponse = await response.json();

      setActivities(data.activities);

    } catch (error: any) {
      console.error('❌ Error obteniendo actividad:', error);
      setActivityError(error.message || 'Error obteniendo actividad reciente');
    } finally {
      setIsLoadingActivity(false);
    }
  }, [activityLimit]);

  // Función para refrescar todos los datos
  const refresh = useCallback(async () => {
    const promises = [fetchWorkerStats()];
    if (enableActivity) {
      promises.push(fetchActivity());
    }
    await Promise.all(promises);
  }, [fetchWorkerStats, fetchActivity, enableActivity]);

  // Efecto para carga inicial
  useEffect(() => {
    fetchWorkerStats();
    if (enableActivity) {
      fetchActivity();
    }
  }, [fetchWorkerStats, fetchActivity, enableActivity]);

  // Efecto para auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const intervalId = setInterval(() => {
      refresh();
    }, refreshInterval * 1000);

    return () => clearInterval(intervalId);
  }, [autoRefresh, refreshInterval, refresh]);

  // Funciones de utilidad
  const getWorkerById = useCallback((workerId: string): Worker | undefined => {
    return workers.find(worker => worker.id === workerId);
  }, [workers]);

  const getActiveWorkers = useCallback((): Worker[] => {
    return workers.filter(worker => worker.stats.isActive);
  }, [workers]);

  const getInactiveWorkers = useCallback((): Worker[] => {
    return workers.filter(worker => !worker.stats.isActive);
  }, [workers]);

  const getTopPerformers = useCallback((limit: number = 5): Worker[] => {
    return [...workers]
      .sort((a, b) => b.stats.approvalRate - a.stats.approvalRate)
      .slice(0, limit);
  }, [workers]);

  const getLowPerformers = useCallback((limit: number = 5): Worker[] => {
    return [...workers]
      .filter(w => w.stats.totalSolicitudes > 0) // Solo incluir trabajadores con actividad
      .sort((a, b) => a.stats.approvalRate - b.stats.approvalRate)
      .slice(0, limit);
  }, [workers]);

  // Funciones para formatear datos
  const formatLastActivity = useCallback((lastActivity: string | null): string => {
    if (!lastActivity) return 'Sin actividad';

    const date = new Date(lastActivity);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInHours < 1) {
      return 'Hace menos de 1 hora';
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
    } else if (diffInDays < 30) {
      return `Hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-MX', { 
        day: 'numeric', 
        month: 'short',
        year: diffInDays > 365 ? 'numeric' : undefined 
      });
    }
  }, []);

  return {
    // Datos
    workers,
    summary,
    activities,
    lastUpdated,

    // Estados de carga
    isLoadingStats,
    isLoadingActivity,
    isLoading: isLoadingStats || isLoadingActivity,

    // Estados de error
    statsError,
    activityError,
    hasError: !!statsError || !!activityError,

    // Acciones
    refresh,
    fetchWorkerStats,
    fetchActivity,

    // Funciones de utilidad
    getWorkerById,
    getActiveWorkers,
    getInactiveWorkers,
    getTopPerformers,
    getLowPerformers,
    formatLastActivity,
  };
}
