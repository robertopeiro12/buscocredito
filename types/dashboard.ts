import { Timestamp } from "firebase/firestore";

export interface Address {
  street: string;
  number: string;
  colony: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
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
  lender_name: string;
  amount: number;
  interest_rate: number;
  term: string;
  monthly_payment: number;
  amortization?: {
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
  medical_balance?: number;
  comision?: number;
  status?: "accepted" | "rejected" | "pending";
  deadline?: Date | string | number;
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
