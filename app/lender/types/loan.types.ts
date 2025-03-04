// app/lender/types/loan.types.ts
export interface LoanRequest {
  id: string;
  userId: string;
  amount: number;
  income: number;
  term: string;
  payment: 'mensual' | 'quincenal' | 'semanal';
  createdAt: Date | string;
  purpose: string;
  type: string;
  status?: 'pending' | 'approved' | 'rejected';
}

export interface PublicUserData {
  country: string;
  state: string;
  city: string;
  birthday?: string | null;
  purpose?: string;
  // Podemos agregar más campos si son necesarios
}

export interface ProposalData {
  company: string;
  amount: number;
  comision: number; // Ahora en pesos (MXN), no en porcentaje
  amortization: '' | 'mensual' | 'quincenal' | 'semanal';
  partner: string;
  deadline: number; // En meses
  interest_rate: number; // En porcentaje
  medical_balance: number; // En porcentaje
}