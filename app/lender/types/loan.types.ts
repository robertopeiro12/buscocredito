// types/loan.types.ts
export interface LoanRequest {
    id: string;
    userId: string;
    amount: number;
    income: number;
    term: string;
    payment: 'mensual' | 'quincenal' | 'semanal';
    status: 'pending' | 'approved' | 'rejected';
    createdAt: Date;
  }
  
  export interface ProposalData {
    company: string;
    amount: number;
    comision: number;
    amortization: 'mensual' | 'quincenal' | 'semanal';
    partner: string;
    deadline: number;
    interest_rate: number;
    medical_balance: number;
  }
  
  // Solo la información pública del usuario
  export interface PublicUserData {
    city: string;
    state: string;
    country: string;
    purpose: string;
  }