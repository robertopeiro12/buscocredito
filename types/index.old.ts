import {SVGProps} from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

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