import { SignupFormData, SignupErrors, ValidationResult } from '@/types/signup';

/**
 * Valida RFC mexicano para personas físicas y morales
 */
export const validateRFC = (rfc: string): ValidationResult => {
  // Remover espacios y convertir a mayúsculas
  rfc = rfc.trim().toUpperCase();

  // Validar longitud
  if (rfc.length !== 13 && rfc.length !== 12) {
    return {
      isValid: false,
      error: `El RFC debe tener ${rfc.length < 13 ? "13" : "12"} caracteres`,
    };
  }

  // Expresiones regulares para personas físicas y morales
  const rfcPersonaFisica = /^[A-ZÑ&]{4}[0-9]{6}[A-V1-9][A-Z1-9][0-9A-Z]$/;
  const rfcPersonaMoral = /^[A-ZÑ&]{3}[0-9]{6}[A-V1-9][A-Z1-9][0-9A-Z]$/;

  // Validar formato
  if (!rfcPersonaFisica.test(rfc) && !rfcPersonaMoral.test(rfc)) {
    return {
      isValid: false,
      error: "Formato de RFC inválido",
    };
  }

  // Validar fecha
  const fechaRFC = rfc.slice(rfc.length === 13 ? 4 : 3, 10);
  const año = parseInt(fechaRFC.slice(0, 2));
  const mes = parseInt(fechaRFC.slice(2, 4));
  const dia = parseInt(fechaRFC.slice(4, 6));

  // Convertir a fecha completa (asumiendo el siglo correcto)
  const añoCompleto = año + (año < 30 ? 2000 : 1900);
  const fecha = new Date(añoCompleto, mes - 1, dia);

  // Validar que la fecha sea válida
  if (
    fecha.getFullYear() !== añoCompleto ||
    fecha.getMonth() + 1 !== mes ||
    fecha.getDate() !== dia
  ) {
    return {
      isValid: false,
      error: "La fecha en el RFC es inválida",
    };
  }

  return { isValid: true };
};

/**
 * Valida un campo específico del formulario
 */
export const validateField = (
  name: string, 
  value: string, 
  formData: SignupFormData
): string | undefined => {
  switch (name) {
    case "name":
    case "lastName":
    case "secondLastName":
      if (!value.trim()) {
        return "Este campo es requerido";
      } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
        return "Solo se permiten letras";
      }
      break;

    case "rfc":
      if (!value.trim()) {
        return "RFC es requerido";
      } else {
        const rfcValidation = validateRFC(value);
        if (!rfcValidation.isValid) {
          return rfcValidation.error;
        }
      }
      break;

    case "phone":
      if (!value.trim()) {
        return "Teléfono es requerido";
      } else if (value.startsWith("52") && value.length !== 12) {
        return "El número debe tener 10 dígitos";
      } else if (
        !value.startsWith("52") &&
        (value.length < 10 || value.length > 15)
      ) {
        return "El número de teléfono es inválido";
      } else if (!/^\+?[\d\s-]+$/.test(value)) {
        return "Formato de teléfono inválido";
      }
      break;

    case "birthday":
      if (!value) {
        return "Fecha de nacimiento es requerida";
      } else {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          return "Debes ser mayor de 18 años";
        }
      }
      break;

    case "email":
      if (!value.trim()) {
        return "Email es requerido";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Email inválido";
      }
      break;

    case "password":
      if (!value) {
        return "Contraseña es requerida";
      } else if (value.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres";
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        return "La contraseña debe contener mayúsculas, minúsculas y números";
      }
      break;

    case "confirmPassword":
      if (!value) {
        return "Confirma tu contraseña";
      } else if (value !== formData.password) {
        return "Las contraseñas no coinciden";
      }
      break;

    case "address.zipCode":
      if (!value.trim()) {
        return "Código postal es requerido";
      } else if (!/^\d{5}$/.test(value)) {
        return "El código postal debe tener 5 dígitos";
      }
      break;

    default:
      if (name.startsWith("address.")) {
        const addressField = name.split(".")[1];
        if (!value.trim()) {
          return `${addressField} es requerido`;
        }
      }
  }

  return undefined;
};

/**
 * Valida todos los campos de un paso específico
 */
export const validateStep = (
  step: number, 
  formData: SignupFormData, 
  currentErrors: SignupErrors
): { isValid: boolean; errors: SignupErrors } => {
  const stepErrors: SignupErrors = {};
  let fieldsToValidate: string[] = [];

  switch (step) {
    case 1:
      fieldsToValidate = ["name", "lastName", "secondLastName"];
      break;
    case 2:
      fieldsToValidate = ["rfc", "phone", "birthday"];
      break;
    case 3:
      fieldsToValidate = [
        "street",
        "number",
        "colony",
        "city",
        "state",
        "zipCode",
      ].map((field) => `address.${field}`);
      break;
    case 4:
      fieldsToValidate = ["email", "password", "confirmPassword"];
      break;
  }

  // Validate all fields in current step
  fieldsToValidate.forEach((field) => {
    const value = field.includes("address.")
      ? formData.address[field.split(".")[1] as keyof typeof formData.address]
      : formData[field as keyof SignupFormData] as string;

    // Validate empty fields
    if (!value || !value.trim()) {
      stepErrors[field] = `Este campo es requerido`;
    }

    // Run field-specific validation
    const fieldError = validateField(field, value, formData);
    if (fieldError) {
      stepErrors[field] = fieldError;
    }
  });

  const isValid = Object.keys(stepErrors).length === 0;

  return {
    isValid,
    errors: isValid ? {} : { ...currentErrors, ...stepErrors }
  };
};
