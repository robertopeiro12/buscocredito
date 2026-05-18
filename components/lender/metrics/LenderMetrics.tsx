'use client';
import { useState, useEffect, useMemo } from 'react';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { motion } from 'framer-motion';
import { MetricsPeriodFilter } from './MetricsPeriodFilter';
import { ProposalTrendChart } from './ProposalTrendChart';
import { ProposalBreakdownChart } from './ProposalBreakdownChart';
import { CompetitivePanel } from './CompetitivePanel';
import { LenderStats } from '@/components/features/dashboard/LenderStats';
import {
  normalizeDate,
  getPeriodRange,
  getPreviousPeriodRange,
  filterByPeriod,
  computeKPITrends,
  groupProposalsByMonth,
  groupProposalsByPurpose,
  computeCompetitiveData,
} from '@/app/lender/utils/metricsCalc';
import type { MetricsPeriod, LossNotification } from '@/app/lender/types/metrics.types';
import type { LenderProposal, LoanRequest } from '@/app/lender/types/loan.types';

interface LenderMetricsProps {
  proposals: LenderProposal[];
  requests: LoanRequest[];
  userId: string;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function LenderMetrics({ proposals, requests, userId }: LenderMetricsProps) {
  const [period, setPeriod] = useState<MetricsPeriod>('3m');
  const [lossNotifications, setLossNotifications] = useState<LossNotification[]>([]);

  useEffect(() => {
    if (!userId) return;
    const db = getFirestore();
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', userId)
    );
    getDocs(q).then(snapshot => {
      const losses: LossNotification[] = [];
      snapshot.docs.forEach(doc => {
        const d = doc.data();
        if (
          d.type === 'loan_assigned_other' &&
          d.data?.winningOffer &&
          d.data?.competitorOffer
        ) {
          losses.push({ data: d.data, createdAt: d.createdAt ?? null });
        }
      });
      setLossNotifications(losses);
    });
  }, [userId]);

  const range = useMemo(() => getPeriodRange(period), [period]);
  const prevRange = useMemo(() => getPreviousPeriodRange(period), [period]);

  const filteredProposals = useMemo(
    () => filterByPeriod(proposals, range, p => normalizeDate(p.createdAt)),
    [proposals, range]
  );

  const previousProposals = useMemo(
    () =>
      prevRange
        ? filterByPeriod(proposals, prevRange, p => normalizeDate(p.createdAt))
        : [],
    [proposals, prevRange]
  );

  const filteredLossNotifs = useMemo(
    () => filterByPeriod(lossNotifications, range, n => normalizeDate(n.createdAt)),
    [lossNotifications, range]
  );

  const trends = useMemo(
    () => computeKPITrends(filteredProposals, previousProposals),
    [filteredProposals, previousProposals]
  );

  const trendData = useMemo(
    () => groupProposalsByMonth(filteredProposals, period),
    [filteredProposals, period]
  );

  const breakdownData = useMemo(
    () => groupProposalsByPurpose(filteredProposals),
    [filteredProposals]
  );

  const competitiveData = useMemo(
    () => computeCompetitiveData(filteredLossNotifs),
    [filteredLossNotifs]
  );

  return (
    <motion.div
      className="space-y-8 max-w-7xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
    >
      <motion.div variants={sectionVariants} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Métricas y Análisis</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Analiza tu rendimiento como prestamista
          </p>
        </div>
        <MetricsPeriodFilter value={period} onChange={setPeriod} />
      </motion.div>

      <motion.div variants={sectionVariants}>
        <LenderStats
          requests={requests}
          proposals={filteredProposals}
          detailed
          trends={trends}
        />
      </motion.div>

      <motion.div variants={sectionVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-green-500 w-full" />
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Propuestas en el tiempo
            </h3>
            <ProposalTrendChart data={trendData} />
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="h-1 bg-green-500 w-full" />
          <div className="p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Desglose por propósito
            </h3>
            <ProposalBreakdownChart data={breakdownData} />
          </div>
        </div>
      </motion.div>

      <motion.div variants={sectionVariants}>
        <CompetitivePanel data={competitiveData} />
      </motion.div>
    </motion.div>
  );
}
