// app/lender/types/loan.types.ts
// Re-exportar tipos centralizados
export type { LoanRequest } from '@/types/entities/loan.types';
export type { Proposal } from '@/types/entities/proposal.types';
export type { PublicUserData, LenderInfo } from '@/types/entities/business.types';

// Import para usar en interfaces
import type { PublicUserData } from '@/types/entities/business.types';

// Tipos específicos del lender
export interface LenderState {
  activeTab: 'marketplace' | 'myoffers' | 'metrics' | 'notifications' | 'settings' | 'help';
  selectedRequestId: string | null;
  isCreatingOffer: boolean;
  userData: PublicUserData | null;
  lenderProposals: LenderProposal[];
  loadingProposals: boolean;
  userDataMap: Record<string, PublicUserData>;
}

export interface LenderFilters {
  search: string;
  state: string;
  city: string;
  purpose: 'all' | 'Personal' | 'Negocio';
  type: 'all' | 'consumo' | 'deudas' | 'capital' | 'maquinaria';
  amountRange: 'all' | '0-50000' | '50000-100000' | '100000-250000' | '250000-500000' | '500000+';
}

export interface LenderProposal {
  id: string;
  loanId?: string | null;
  amortization: number;
  amortizationFrequency: string;
  medicalBalance: number;
  comision: number;
  amount: number;
  deadline: number;
  interestRate: number;
  term: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string | { seconds: number } | null;
  requestInfo: {
    purpose?: string;
    type?: string;
    originalAmount?: number;
    originalTerm?: string;
    originalPayment?: string;
  };
  contactInfo?: {
    fullName: string;
    email: string;
    phone: string;
  };
  message?: string;
}
