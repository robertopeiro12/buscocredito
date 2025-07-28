// Tipos de negocio legacy - MANTENER SIN CAMBIOS
export interface ProposalData {
  company: string;
  amount: number;
  comision: number; // En pesos (MXN)
  amortization_frequency: ''|'mensual'|'quincenal'|'semanal'; // Frecuencia de pago
  amortization: number; // Monto de amortización en pesos (MXN), puede incluir hasta 2 decimales
  partner: string;
  deadline: number; // En meses
  interest_rate: number; // En porcentaje
  medical_balance: number; // En pesos (MXN)
}

export interface PartnerData{
  name: string;
  company: string;
  company_id: string;
}
