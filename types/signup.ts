// Tipos para el formulario de registro

export interface AddressData {
  street: string;
  number: string;
  colony: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

export interface SignupFormData {
  name: string;
  lastName: string;
  secondLastName: string;
  rfc: string;
  birthday: string;
  phone: string;
  address: AddressData;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupErrors {
  name?: string;
  lastName?: string;
  secondLastName?: string;
  rfc?: string;
  birthday?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  'address.street'?: string;
  'address.number'?: string;
  'address.colony'?: string;
  'address.city'?: string;
  'address.state'?: string;
  'address.zipCode'?: string;
  submit?: string;
  [key: string]: string | undefined;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface StepHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface StepIndicatorProps {
  currentStep: number;
}

export interface InputFieldProps {
  id: string;
  name?: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  optional?: boolean;
}
