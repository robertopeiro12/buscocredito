import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { InputFieldProps } from '@/types/signup';

const InputField = ({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);
  const hasValue = debouncedValue && debouncedValue.trim().length > 0;
  const isValid = hasValue && !error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    if (validationMessage && validationMessage !== "Campo válido") {
      setDebouncedValue("");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [value]);

  const getValidationMessage = () => {
    if (error) {
      // Si es un error de RFC, mostrar el mensaje específico
      if (id === "rfc" && error !== "RFC es requerido") {
        return error;
      }
      return error;
    }
    if (isValid) return "Campo válido";
    if (isFocused) {
      switch (id) {
        case "name":
        case "lastName":
        case "secondLastName":
          return "Solo letras y espacios permitidos";
        case "rfc":
          return "Formato: AAAA999999AA9 (Persona Física) o AAA999999AA9 (Persona Moral)";
        case "phone":
          return "10 dígitos numéricos";
        case "email":
          return "ejemplo@dominio.com";
        case "password":
          return "Mínimo 8 caracteres, incluir mayúsculas, minúsculas y números";
        case "confirmPassword":
          return "Debe coincidir con la contraseña";
        default:
          return "Campo requerido";
      }
    }
    return "";
  };

  const validationMessage = getValidationMessage();
  const messageColor = error
    ? "text-red-600"
    : isValid
    ? "text-green-600"
    : "text-gray-500";

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <input
          id={id}
          name={name || id}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={`${id}-description`}
          required
          className={`block w-full px-4 py-3 rounded-md border ${
            error
              ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
              : isValid
              ? "border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          } shadow-sm transition-all duration-200 ${
            isFocused ? "ring-2 ring-opacity-50" : ""
          }`}
        />
      </div>
      {validationMessage && (
        <div
          id={`${id}-description`}
          className={`mt-1 text-sm ${messageColor} transition-all duration-200 flex items-center gap-1`}
        >
          {error ? (
            <AlertCircle className="h-4 w-4 inline" />
          ) : isValid ? (
            <CheckCircle className="h-4 w-4 inline" />
          ) : (
            <span className="h-4 w-4 inline-block" />
          )}
          <span>{validationMessage}</span>
        </div>
      )}
    </div>
  );
};

export default InputField;
