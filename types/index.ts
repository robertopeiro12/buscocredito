import {SVGProps} from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export interface ProposalData {
  company: string;
  amount: number;
  comision: number;
  amortization: ''|'mensual'|'quincenal'|'semanal';
  partner: string;
  deadline: number;
  interest_rate: number;
  medical_balance: number;
}

export interface PartnerData{
  name: string;
  company: string;
  company_id: string;
}