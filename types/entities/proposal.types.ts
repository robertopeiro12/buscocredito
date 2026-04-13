// Tipos centralizados para propuestas de crédito (colección: propuestas)

import type { PaymentFrequency } from './account.types';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

// Snapshot de la solicitud original al momento de crear la propuesta
export interface RequestSnapshot {
  purpose: string;
  type: string;
  originalAmount: number;
  originalTerm: string;
  originalPayment: string;
}

export interface Proposal {
  id: string;
  lenderId: string;
  loanId: string;
  company: string;
  amount: number;
  interestRate: number; // porcentaje anual
  deadline: number; // meses
  amortizationFrequency: PaymentFrequency;
  amortization: number; // MXN por periodo
  comision: number; // MXN
  medicalBalance: number; // MXN
  status: ProposalStatus;
  requestInfo: RequestSnapshot;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// Datos para crear una propuesta (sin id ni timestamps)
export type NewProposal = Omit<Proposal, 'id' | 'createdAt' | 'updatedAt'>;
