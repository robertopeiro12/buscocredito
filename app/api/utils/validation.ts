import "server-only";

/**
 * Utilities para validación de datos de entrada
 */

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateRequiredFields(data: any, requiredFields: string[]): ValidationResult {
  const errors: string[] = [];
  
  for (const field of requiredFields) {
    if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
      errors.push(`${field} es requerido`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateAmount(amount: any): boolean {
  const numAmount = Number(amount);
  return !isNaN(numAmount) && numAmount > 0;
}

export function validatePaymentFrequency(frequency: string): boolean {
  const validFrequencies = ['mensual', 'quincenal', 'semanal'];
  return validFrequencies.includes(frequency);
}

export function validateLoanStatus(status: string): boolean {
  const validStatuses = ['pending', 'approved', 'rejected'];
  return validStatuses.includes(status);
}

export function validateUserType(userType: string): boolean {
  const validTypes = ['user', 'b_sale', 'b_admin'];
  return validTypes.includes(userType);
}

// Validaciones específicas del negocio
export const BusinessValidators = {
  loanRequest: (data: any): ValidationResult => {
    const requiredFields = ['amount', 'income', 'term', 'payment', 'purpose', 'type'];
    const fieldValidation = validateRequiredFields(data, requiredFields);
    
    if (!fieldValidation.isValid) {
      return fieldValidation;
    }
    
    const errors: string[] = [];
    
    if (!validateAmount(data.amount)) {
      errors.push('El monto debe ser un número mayor a 0');
    }
    
    if (!validateAmount(data.income)) {
      errors.push('Los ingresos deben ser un número mayor a 0');
    }
    
    if (data.payment && !validatePaymentFrequency(data.payment)) {
      errors.push('Frecuencia de pago inválida');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  proposal: (data: any): ValidationResult => {
    const requiredFields = ['amount', 'interest_rate', 'deadline', 'amortization_frequency'];
    const fieldValidation = validateRequiredFields(data, requiredFields);
    
    if (!fieldValidation.isValid) {
      return fieldValidation;
    }
    
    const errors: string[] = [];
    
    if (!validateAmount(data.amount)) {
      errors.push('El monto debe ser un número mayor a 0');
    }
    
    if (!validateAmount(data.interest_rate)) {
      errors.push('La tasa de interés debe ser un número mayor a 0');
    }
    
    if (!validatePaymentFrequency(data.amortization_frequency)) {
      errors.push('Frecuencia de amortización inválida');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },
  
  notification: (data: any): ValidationResult => {
    const requiredFields = ['recipientId', 'type', 'title', 'message'];
    return validateRequiredFields(data, requiredFields);
  }
};
