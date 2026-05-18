export type MetricsPeriod = '30d' | '3m' | '6m' | 'all';

export interface PeriodRange {
  start: Date | null;
  end: Date;
}

export interface ProposalTrend {
  label: string;
  count: number;
}

export interface PurposeBreakdown {
  purpose: string;
  accepted: number;
  pending: number;
  rejected: number;
  total: number;
}

export interface KPITrends {
  proposalsChange: number | null;
  acceptedChange: number | null;
}

export interface CompetitiveData {
  avgRateDiff: number;
  avgAmountDiff: number;
  avgTermDiff: number;
  sampleSize: number;
}

export interface LossNotification {
  data: {
    competitorOffer: {
      amount: number;
      interestRate: number;
      term: number;
    };
    winningOffer: {
      amount: number;
      interestRate: number;
      term: number;
    };
  };
  createdAt: string | { seconds: number } | null;
}
