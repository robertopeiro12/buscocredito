import { Timestamp } from "firebase/firestore";
import { CreditScore } from "./creditScore";

export interface Address {
  street: string;
  exteriorNumber: string;
  interiorNumber: string;
  colony: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  // Campo legacy para retrocompatibilidad
  number?: string;
}

export interface UserData {
  name: string;
  last_name: string;
  second_last_name: string;
  email: string;
  rfc: string;
  birthday: any; // You might want to make this more specific
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
  updatedAt?: string;
  comision?: number;
}

export type NewSolicitudData = Omit<SolicitudData, "id">;

export interface Offer {
  id: string;
  lender_name: string; // company de Firebase
  amount: number; // amount de Firebase
  interest_rate: number; // interest_rate de Firebase
  term: number; // deadline de Firebase (en meses)
  monthly_payment: number; // calculado basado en amortization_frequency
  amortization_frequency: string; // "quincenal", "semanal", "mensual"
  amortization?: number; // amortization de Firebase
  medical_balance?: number; // medical_balance de Firebase
  comision?: number; // comision de Firebase
  deadline?: number; // deadline de Firebase (en meses)
  partner?: string; // partner de Firebase
  status?: "accepted" | "rejected" | "pending";
  requestInfo?: {
    originalAmount: number;
    originalPayment: string;
    originalTerm: string;
    purpose: string; // Solo esto de la solicitud original
    type: string; // Solo esto de la solicitud original
  };
}

export interface CreditFormProps {
  addSolicitud: (data: CreditFormData) => void;
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

export type DashboardTab = "loans" | "settings" | "help";
