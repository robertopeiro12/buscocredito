// Tipos centralizados para solicitudes de préstamo (colección: solicitudes)

import type { PaymentFrequency } from './account.types';

export type LoanStatus = 'pending' | 'approved' | 'rejected';
export type LoanPurpose = 'Personal' | 'Negocio';
export type LoanType = 'consumo' | 'deudas' | 'capital' | 'maquinaria';

export interface LoanRequest {
  id: string;
  userId: string;
  amount: number;
  income: number;
  term: string; // "6 meses", "12 meses", etc.
  payment: PaymentFrequency;
  purpose: LoanPurpose;
  type: LoanType;
  status: LoanStatus;
  acceptedProposalId: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export type NewLoanRequest = Omit<LoanRequest, 'id'>;
