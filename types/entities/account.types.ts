// Tipos centralizados para cuentas de usuario (colección: cuentas)

// Roles del sistema
export type UserRole = 'superAdmin' | 'companyAdmin' | 'lender' | 'borrower';

// Frecuencia de pago
export type PaymentFrequency = 'mensual' | 'quincenal' | 'semanal';

// Clasificación de crédito
export type CreditClassification = 'Excelente' | 'Bueno' | 'Regular' | 'Bajo';

// Dirección estructurada
export interface Address {
  street: string;
  exteriorNumber: string;
  interiorNumber: string;
  colony: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

// Score crediticio
export interface CreditScore {
  score: number;
  classification: CreditClassification;
}

// Base para todas las cuentas
interface BaseAccount {
  uid: string;
  email: string;
  type: UserRole;
  createdAt: string; // ISO 8601
}

// Solicitante de crédito (type: 'borrower')
export interface BorrowerAccount extends BaseAccount {
  type: 'borrower';
  name: string;
  lastName: string;
  secondLastName: string;
  rfc: string;
  birthday: string; // ISO 8601
  phone: string;
  address: Address;
  creditScore: CreditScore;
  acceptedTerms: boolean;
  acceptedTermsAt: string; // ISO 8601
  emailNotifications: boolean;
}

// Administrador de empresa (type: 'companyAdmin')
export interface CompanyAdminAccount extends BaseAccount {
  type: 'companyAdmin';
  companyName: string;
  name: string;
}

// Trabajador / prestamista (type: 'lender')
export interface LenderAccount extends BaseAccount {
  type: 'lender';
  companyName: string;
  adminId: string; // UID del companyAdmin
  name: string;
}

// Super administrador (type: 'superAdmin')
export interface SuperAdminAccount extends BaseAccount {
  type: 'superAdmin';
  name: string;
}

// Unión discriminada por type
export type Account = BorrowerAccount | CompanyAdminAccount | LenderAccount | SuperAdminAccount;

// Usuario en contexto de autenticación (mínimo, desde claims + Firestore)
export interface AuthUser {
  uid: string;
  email: string | null;
  type: UserRole | undefined;
  companyName: string | undefined;
  adminId: string | undefined;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}
