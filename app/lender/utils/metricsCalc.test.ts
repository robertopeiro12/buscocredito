import { describe, it, expect } from 'vitest';
import {
  normalizeDate,
  getPeriodRange,
  getPreviousPeriodRange,
  computeKPITrends,
  groupProposalsByPurpose,
  computeCompetitiveData,
} from './metricsCalc';
import type { LenderProposal } from '@/app/lender/types/loan.types';
import type { LossNotification } from '@/app/lender/types/metrics.types';

function makeProposal(overrides: Partial<LenderProposal> = {}): LenderProposal {
  return {
    id: '1',
    status: 'pending',
    amount: 100000,
    interestRate: 10,
    deadline: 12,
    term: 12,
    amortization: 0,
    amortizationFrequency: 'mensual',
    medicalBalance: 0,
    comision: 0,
    createdAt: null,
    requestInfo: { purpose: 'Test' },
    ...overrides,
  };
}

function makeLoss(myRate: number, winRate: number, myAmount = 100000, winAmount = 100000, myTerm = 12, winTerm = 12): LossNotification {
  return {
    data: {
      competitorOffer: { amount: myAmount, interestRate: myRate, term: myTerm },
      winningOffer: { amount: winAmount, interestRate: winRate, term: winTerm },
    },
    createdAt: null,
  };
}

describe('normalizeDate', () => {
  it('returns null for null input', () => {
    expect(normalizeDate(null)).toBeNull();
  });
  it('parses ISO string', () => {
    const result = normalizeDate('2026-01-15T10:00:00.000Z');
    expect(result).toBeInstanceOf(Date);
    expect(result!.getFullYear()).toBe(2026);
  });
  it('converts Firestore timestamp { seconds }', () => {
    const result = normalizeDate({ seconds: 1700000000 });
    expect(result).toBeInstanceOf(Date);
    expect(result!.getTime()).toBe(1700000000000);
  });
});

describe('getPeriodRange', () => {
  it('returns null start for "all"', () => {
    expect(getPeriodRange('all').start).toBeNull();
  });
  it('30d range spans 30 days', () => {
    const { start, end } = getPeriodRange('30d');
    const diff = Math.round((end.getTime() - start!.getTime()) / 86400000);
    expect(diff).toBe(30);
  });
  it('3m range spans 90 days', () => {
    const { start, end } = getPeriodRange('3m');
    const diff = Math.round((end.getTime() - start!.getTime()) / 86400000);
    expect(diff).toBe(90);
  });
  it('6m range spans 180 days', () => {
    const { start, end } = getPeriodRange('6m');
    const diff = Math.round((end.getTime() - start!.getTime()) / 86400000);
    expect(diff).toBe(180);
  });
});

describe('getPreviousPeriodRange', () => {
  it('returns null for "all"', () => {
    expect(getPreviousPeriodRange('all')).toBeNull();
  });
  it('previous period ends where current starts', () => {
    const current = getPeriodRange('30d');
    const prev = getPreviousPeriodRange('30d')!;
    expect(prev.end.getTime()).toBeCloseTo(current.start!.getTime(), -3);
  });
  it('previous period has same duration as current', () => {
    const prev = getPreviousPeriodRange('3m')!;
    const diff = Math.round((prev.end.getTime() - prev.start!.getTime()) / 86400000);
    expect(diff).toBe(90);
  });
});

describe('computeKPITrends', () => {
  it('computes positive percent change', () => {
    const trends = computeKPITrends(
      Array.from({ length: 12 }, () => makeProposal()),
      Array.from({ length: 10 }, () => makeProposal())
    );
    expect(trends.proposalsChange).toBe(20);
  });
  it('computes negative percent change', () => {
    const trends = computeKPITrends(
      Array.from({ length: 8 }, () => makeProposal()),
      Array.from({ length: 10 }, () => makeProposal())
    );
    expect(trends.proposalsChange).toBe(-20);
  });
  it('returns null when no previous proposals', () => {
    const trends = computeKPITrends(
      Array.from({ length: 5 }, () => makeProposal()),
      []
    );
    expect(trends.proposalsChange).toBeNull();
    expect(trends.acceptedChange).toBeNull();
  });
  it('tracks accepted proposals separately', () => {
    const current = [
      makeProposal({ status: 'accepted' }),
      makeProposal({ status: 'accepted' }),
      makeProposal({ status: 'accepted' }),
    ];
    const previous = [makeProposal({ status: 'accepted' })];
    const trends = computeKPITrends(current, previous);
    expect(trends.acceptedChange).toBe(200);
  });
});

describe('groupProposalsByPurpose', () => {
  it('groups and counts by status', () => {
    const proposals = [
      makeProposal({ requestInfo: { purpose: 'Consumo' }, status: 'accepted' }),
      makeProposal({ requestInfo: { purpose: 'Consumo' }, status: 'rejected' }),
      makeProposal({ requestInfo: { purpose: 'Capital' }, status: 'pending' }),
    ];
    const result = groupProposalsByPurpose(proposals);
    const consumo = result.find(r => r.purpose === 'Consumo')!;
    expect(consumo.accepted).toBe(1);
    expect(consumo.rejected).toBe(1);
    expect(consumo.total).toBe(2);
    expect(result.find(r => r.purpose === 'Capital')!.pending).toBe(1);
  });
  it('uses "Sin propósito" for missing purpose', () => {
    const proposals = [makeProposal({ requestInfo: {} })];
    const result = groupProposalsByPurpose(proposals);
    expect(result[0].purpose).toBe('Sin propósito');
  });
  it('sorts by total descending', () => {
    const proposals = [
      makeProposal({ requestInfo: { purpose: 'A' } }),
      makeProposal({ requestInfo: { purpose: 'B' } }),
      makeProposal({ requestInfo: { purpose: 'B' } }),
    ];
    const result = groupProposalsByPurpose(proposals);
    expect(result[0].purpose).toBe('B');
  });
});

describe('computeCompetitiveData', () => {
  it('returns zeros and sampleSize 0 for empty input', () => {
    const result = computeCompetitiveData([]);
    expect(result.sampleSize).toBe(0);
    expect(result.avgRateDiff).toBe(0);
  });
  it('averages rate differential across samples', () => {
    const result = computeCompetitiveData([makeLoss(14, 12), makeLoss(16, 12)]);
    expect(result.avgRateDiff).toBe(3);
    expect(result.sampleSize).toBe(2);
  });
  it('handles negative differential (competitive advantage)', () => {
    const result = computeCompetitiveData([makeLoss(10, 12)]);
    expect(result.avgRateDiff).toBe(-2);
  });
  it('averages amount differential', () => {
    const result = computeCompetitiveData([
      makeLoss(12, 12, 80000, 100000),
      makeLoss(12, 12, 90000, 100000),
    ]);
    expect(result.avgAmountDiff).toBe(-15000);
  });
});
