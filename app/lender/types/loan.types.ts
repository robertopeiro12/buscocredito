// app/lender/types/loan.types.ts
export interface LoanRequest {
  id: string;
  userId: string;
  amount: number;
  income: number;
  term: string;
  payment: 'mensual' | 'quincenal' | 'semanal';
  createdAt: Date | string;
}

export interface PublicUserData {
  country: string;
  state: string;
  city: string;
  purpose: string;
}

export interface ProposalData {
  company: string;
  amount: number;
  comision: number;
  amortization: '' | 'mensual' | 'quincenal' | 'semanal';
  partner: string;
  deadline: number;
  interest_rate: number;
  medical_balance: number;
}