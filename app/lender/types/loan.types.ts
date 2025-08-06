// app/lender/types/loan.types.ts
// Re-exportar tipos centralizados para compatibilidad
export type { 
  LoanRequest, 
  ProposalData, 
  PublicUserData 
} from '@/types/entities/business.types';

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
  amount: 'all' | '0-50000' | '50000-100000' | '100000+';
  term: 'all' | '1-12' | '13-24' | '25+';
}

export interface PartnerData {
  name: string;
  company: string;
  company_id: string;
}

export interface LenderProposal {
  id: string;
  amortization: number;
  amortization_frequency: string;
  medical_balance: number;
  comision: number;
  amount: number;
  deadline: number;
  interest_rate: number;
  term: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string | null;
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
}