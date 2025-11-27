// Tipos centralizados de entidades de negocio
export interface LoanRequest {
  id: string;
  userId: string;
  amount: number;
  income: number;
  term: string;
  payment: 'mensual' | 'quincenal' | 'semanal';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date | string;
  purpose: string;
  type: string;
}

export interface ProposalData {
  company: string;
  amount: number;
  comision: number; // En pesos (MXN)
  amortization_frequency: '' | 'mensual' | 'quincenal' | 'semanal'; // Frecuencia de pago
  amortization: number; // Monto de amortización en pesos (MXN), puede incluir hasta 2 decimales
  partner: string;
  deadline: number; // En meses
  interest_rate: number; // En porcentaje
  medical_balance: number; // En pesos (MXN)
}

export interface PublicUserData {
  country: string;
  state: string;
  city: string;
  birthday?: string | null;
  purpose?: string;
  creditScore?: {
    score: number;
    classification: string;
  };
  // Podemos agregar más campos si son necesarios
}

export interface PartnerData {
  name: string;
  company: string;
  company_id: string;
}
