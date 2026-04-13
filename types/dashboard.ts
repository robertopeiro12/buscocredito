import type { CreditScore } from "./creditScore";
import type { Address } from "./entities/account.types";

export type { Address };

export interface UserData {
  name: string;
  lastName: string;
  secondLastName: string;
  email: string;
  rfc: string;
  birthday: string;
  phone: string;
  address: Address;
  creditScore: CreditScore;
}

export interface SolicitudData {
  id: string;
  userId: string;
  purpose: string;
  type: string;
  amount: number;
  term: string;
  payment: string;
  income: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string | null;
  comision: number | null;
}

export type NewSolicitudData = Omit<SolicitudData, "id">;

export interface Offer {
  id: string;
  lender_name: string;
  amount: number;
  interestRate: number;
  term: number;
  monthly_payment: number;
  amortizationFrequency: string;
  amortization: number | null;
  medicalBalance: number | null;
  comision: number | null;
  deadline: number | null;
  lenderId: string | null;
  status: "accepted" | "rejected" | "pending" | null;
  requestInfo: {
    originalAmount: number;
    originalPayment: string;
    originalTerm: string;
    purpose: string;
    type: string;
  } | null;
}

export interface CreditFormProps {
  addSolicitud: (data: CreditFormData) => Promise<boolean | void>;
  resetForm: () => void;
}

export interface CreditFormData {
  purpose: string;
  type: string;
  amount: number;
  term: string;
  payment: string;
  income: string;
}

export interface LoadingState {
  initial: boolean;
  loans: boolean;
  settings: boolean;
  offers: boolean;
}

export interface ErrorState {
  loans: string | null;
  settings: string | null;
  offers: string | null;
}

export interface OfferToAccept {
  offer: Offer;
  index: number;
}

export type DashboardTab = "loans" | "settings" | "help" | "notifications";
