import { useState, useCallback } from 'react';

interface FormState {
  [key: string]: any;
}

interface FormErrors {
  [key: string]: string;
}

interface ValidationRules {
  [key: string]: (value: any) => string | undefined;
}

export const useForm = (initialState: FormState = {}, validationRules?: ValidationRules) => {
  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback((name: string, value: any) => {
    if (!validationRules || !validationRules[name]) return undefined;
    return validationRules[name](value);
  }, [validationRules]);

  const handleChange = useCallback((name: string, value: any) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
    
    // No validar en onChange para evitar revelar información
    // Solo limpiar el error si el campo estaba tocado y ahora tiene valor
    if (touched[name] && value) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [touched]);

  const handleBlur = useCallback((name: string) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validar el campo cuando pierde el foco
    if (validationRules && validationRules[name]) {
      const error = validateField(name, values[name]);
      setErrors(prev => ({
        ...prev,
        [name]: error || ''
      }));
    }
  }, [validationRules, validateField, values]);

  const validateForm = useCallback(() => {
    if (!validationRules) return true;

    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach(key => {
      const error = validateField(key, values[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [validationRules, validateField, values]);

  const handleSubmit = useCallback(async (callback: (values: FormState) => Promise<void>) => {
    setIsSubmitting(true);
    try {
      if (validateForm()) {
        await callback(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validateForm]);

  const resetForm = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialState]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setErrors,
    validateForm
  };
};
