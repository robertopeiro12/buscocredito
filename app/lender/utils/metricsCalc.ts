import type {
  MetricsPeriod,
  PeriodRange,
  ProposalTrend,
  PurposeBreakdown,
  KPITrends,
  CompetitiveData,
  LossNotification,
} from '@/app/lender/types/metrics.types';
import type { LenderProposal } from '@/app/lender/types/loan.types';

export function normalizeDate(createdAt: string | { seconds: number } | null): Date | null {
  if (!createdAt) return null;
  if (typeof createdAt === 'string') return new Date(createdAt);
  return new Date(createdAt.seconds * 1000);
}

export function getPeriodRange(period: MetricsPeriod): PeriodRange {
  const end = new Date();
  if (period === 'all') return { start: null, end };
  const days = period === '30d' ? 30 : period === '3m' ? 90 : 180;
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return { start, end };
}

export function getPreviousPeriodRange(period: MetricsPeriod): PeriodRange | null {
  if (period === 'all') return null;
  const { start: currentStart } = getPeriodRange(period);
  if (!currentStart) return null;
  const days = period === '30d' ? 30 : period === '3m' ? 90 : 180;
  const prevEnd = new Date(currentStart);
  const prevStart = new Date(prevEnd);
  prevStart.setDate(prevStart.getDate() - days);
  return { start: prevStart, end: prevEnd };
}

export function filterByPeriod<T>(
  items: T[],
  range: PeriodRange,
  getDate: (item: T) => Date | null
): T[] {
  return items.filter(item => {
    const date = getDate(item);
    if (!date) return false;
    if (range.start && date < range.start) return false;
    if (date > range.end) return false;
    return true;
  });
}

export function computeKPITrends(
  current: LenderProposal[],
  previous: LenderProposal[]
): KPITrends {
  const pct = (curr: number, prev: number) =>
    prev > 0 ? Math.round(((curr - prev) / prev) * 100) : null;

  const currentAccepted = current.filter(p => p.status === 'accepted').length;
  const prevAccepted = previous.filter(p => p.status === 'accepted').length;

  return {
    proposalsChange: pct(current.length, previous.length),
    acceptedChange: pct(currentAccepted, prevAccepted),
  };
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function groupProposalsByMonth(
  proposals: LenderProposal[],
  period: MetricsPeriod
): ProposalTrend[] {
  if (period === '30d') {
    const weeks: Record<string, number> = {};
    proposals.forEach(p => {
      const date = normalizeDate(p.createdAt);
      if (!date) return;
      const d = new Date(date);
      d.setDate(d.getDate() - d.getDay());
      const key = d.toISOString().slice(0, 10);
      weeks[key] = (weeks[key] || 0) + 1;
    });
    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => ({ label: `Sem ${key.slice(5)}`, count }));
  }

  const months: Record<string, number> = {};
  proposals.forEach(p => {
    const date = normalizeDate(p.createdAt);
    if (!date) return;
    const key = `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
    months[key] = (months[key] || 0) + 1;
  });

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => {
      const [year, monthIdx] = key.split('-');
      return { label: `${MONTHS[parseInt(monthIdx)]} ${year}`, count };
    });
}

export function groupProposalsByPurpose(proposals: LenderProposal[]): PurposeBreakdown[] {
  const map: Record<string, PurposeBreakdown> = {};
  proposals.forEach(p => {
    const purpose = p.requestInfo?.purpose || 'Sin propósito';
    if (!map[purpose]) {
      map[purpose] = { purpose, accepted: 0, pending: 0, rejected: 0, total: 0 };
    }
    map[purpose][p.status as 'accepted' | 'pending' | 'rejected']++;
    map[purpose].total++;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

export function computeCompetitiveData(notifications: LossNotification[]): CompetitiveData {
  if (notifications.length === 0) {
    return { avgRateDiff: 0, avgAmountDiff: 0, avgTermDiff: 0, sampleSize: 0 };
  }
  let rateSum = 0, amountSum = 0, termSum = 0;
  notifications.forEach(({ data: { competitorOffer: mine, winningOffer: winner } }) => {
    rateSum += (mine.interestRate || 0) - (winner.interestRate || 0);
    amountSum += (mine.amount || 0) - (winner.amount || 0);
    termSum += (mine.term || 0) - (winner.term || 0);
  });
  const n = notifications.length;
  return {
    avgRateDiff: Math.round((rateSum / n) * 10) / 10,
    avgAmountDiff: Math.round(amountSum / n),
    avgTermDiff: Math.round(termSum / n),
    sampleSize: n,
  };
}
