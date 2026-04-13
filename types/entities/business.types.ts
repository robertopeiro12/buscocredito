// Re-exports para compatibilidad — los tipos originales se movieron a archivos dedicados
export type { LoanRequest, LoanStatus, LoanPurpose, LoanType } from './loan.types';
export type { Proposal, ProposalStatus, RequestSnapshot } from './proposal.types';
export type {
  Address,
  CreditScore,
  PaymentFrequency,
  CreditClassification,
} from './account.types';

// PublicUserData se mantiene aquí ya que es un DTO específico del lender
export interface PublicUserData {
  country: string;
  state: string;
  city: string;
  birthday: string | null;
  purpose: string | null;
  creditScore: {
    score: number;
    classification: string;
  } | null;
}

// PartnerData renombrado a LenderInfo
export interface LenderInfo {
  name: string;
  company: string;
  adminId: string;
}
