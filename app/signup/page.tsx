"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";
import { auth } from "../firebase";
import NavBar from "@/components/common/layout/navbar";
import Footer from "@/components/common/layout/Footer";
import {
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  Mail,
  Lock,
  MapPin,
  CreditCard,
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface StepHeaderProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StepIndicatorProps {
  currentStep: number;
}

interface InputFieldProps {
  id: string;
  name?: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
}

export default function SignUpPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    lastName: "",
    secondLastName: "",
    rfc: "",
    birthday: "",
    phone: "",
    address: {
      street: "",
      number: "",
      colony: "",
      city: "",
      state: "",
      country: "México",
      zipCode: "",
    },
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCP, setIsLoadingCP] = useState(false);
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    validateField(name, value);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));

    // Si el campo es código postal y tiene 5 dígitos, buscar información
    if (name === "zipCode" && value.length === 5 && /^\d{5}$/.test(value)) {
      fetchPostalCodeData(value);
    }

    validateField(`address.${name}`, value);
  };

  const validateRFC = (rfc: string): { isValid: boolean; error?: string } => {
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

  const validateField = (name, value) => {
    let newErrors = { ...errors };
    switch (name) {
      case "name":
      case "lastName":
      case "secondLastName":
        if (!value.trim()) {
          newErrors[name] = "Este campo es requerido";
        } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
          newErrors[name] = "Solo se permiten letras";
        } else {
          delete newErrors[name];
        }
        break;
      case "rfc":
        if (!value.trim()) {
          newErrors[name] = "RFC es requerido";
        } else {
          const rfcValidation = validateRFC(value);
          if (!rfcValidation.isValid) {
            newErrors[name] = rfcValidation.error;
          } else {
            delete newErrors[name];
          }
        }
        break;
      case "phone":
        if (!value.trim()) {
          newErrors[name] = "Teléfono es requerido";
        } else if (value.startsWith("52") && value.length !== 12) {
          newErrors[name] = "El número debe tener 10 dígitos";
        } else if (
          !value.startsWith("52") &&
          (value.length < 10 || value.length > 15)
        ) {
          newErrors[name] = "El número de teléfono es inválido";
        } else if (!/^\+?[\d\s-]+$/.test(value)) {
          newErrors[name] = "Formato de teléfono inválido";
        } else {
          delete newErrors[name];
        }
        break;
      case "birthday":
        if (!value) {
          newErrors[name] = "Fecha de nacimiento es requerida";
        } else {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 18) {
            newErrors[name] = "Debes ser mayor de 18 años";
          } else {
            delete newErrors[name];
          }
        }
        break;
      case "email":
        if (!value.trim()) {
          newErrors[name] = "Email es requerido";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[name] = "Email inválido";
        } else {
          delete newErrors[name];
        }
        break;
      case "password":
        if (!value) {
          newErrors[name] = "Contraseña es requerida";
        } else if (value.length < 8) {
          newErrors[name] = "La contraseña debe tener al menos 8 caracteres";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          newErrors[name] =
            "La contraseña debe contener mayúsculas, minúsculas y números";
        } else {
          delete newErrors[name];
        }
        validateField("confirmPassword", formData.confirmPassword);
        break;
      case "confirmPassword":
        if (!value) {
          newErrors[name] = "Confirma tu contraseña";
        } else if (value !== formData.password) {
          newErrors[name] = "Las contraseñas no coinciden";
        } else {
          delete newErrors[name];
        }
        break;
      case "address.zipCode":
        if (!value.trim()) {
          newErrors[name] = "Código postal es requerido";
        } else if (!/^\d{5}$/.test(value)) {
          newErrors[name] = "El código postal debe tener 5 dígitos";
        } else {
          delete newErrors[name];
        }
        break;
      default:
        if (name.startsWith("address.")) {
          const addressField = name.split(".")[1];
          if (!value.trim()) {
            newErrors[name] = `${addressField} es requerido`;
          } else {
            delete newErrors[name];
          }
        }
    }
    setErrors(newErrors);
  };

  const validateStep = () => {
    let stepErrors = {};
    let fieldsToValidate = [];

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
        ? formData.address[field.split(".")[1]]
        : formData[field];

      // Validate empty fields
      if (!value || !value.trim()) {
        stepErrors[field] = `Este campo es requerido`;
      }

      // Run field-specific validation
      validateField(field, value);
      if (errors[field]) {
        stepErrors[field] = errors[field];
      }
    });

    const isValid = Object.keys(stepErrors).length === 0;

    // If not valid, show errors for all fields in the step
    if (!isValid) {
      setErrors((prev) => ({
        ...prev,
        ...stepErrors,
      }));
    }

    return isValid;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
    } else {
      // Add visual feedback when validation fails
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step !== 4) {
      handleNextStep();
      return;
    }

    if (!validateStep()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const db = getFirestore();
      const userRef = doc(db, "cuentas", userCredential.user.uid);

      await setDoc(userRef, {
        name: formData.name,
        last_name: formData.lastName,
        second_last_name: formData.secondLastName,
        rfc: formData.rfc,
        birthday: Timestamp.fromDate(new Date(formData.birthday)),
        phone: formData.phone,
        address: formData.address,
        email: formData.email,
        type: "user",
        created_at: Timestamp.now(),
      });

      router.push("/login");
    } catch (err) {
      console.error("Error al registrarse:", err);
      setErrors((prev) => ({
        ...prev,
        submit:
          "Error al crear la cuenta. Por favor, verifica tus datos e intenta de nuevo.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepIcon = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        return <User className="w-6 h-6" />;
      case 2:
        return <CreditCard className="w-6 h-6" />;
      case 3:
        return <MapPin className="w-6 h-6" />;
      case 4:
        return <Mail className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const renderStepHeader = () => {
    switch (step) {
      case 1:
        return (
          <StepHeader
            icon={<User />}
            title="Información Personal"
            description="Ingresa tus datos personales"
          />
        );
      case 2:
        return (
          <StepHeader
            icon={<Phone />}
            title="Contacto y RFC"
            description="Ingresa tus datos de contacto y RFC"
          />
        );
      case 3:
        return (
          <StepHeader
            icon={<MapPin />}
            title="Dirección"
            description="Ingresa tu dirección de residencia"
          />
        );
      case 4:
        return (
          <StepHeader
            icon={<Lock />}
            title="Cuenta"
            description="Crea tu cuenta para acceder"
          />
        );
      default:
        return null;
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="mt-6">
            <div className="space-y-4">
              <InputField
                id="name"
                label="Nombre"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Juan"
              />
              <InputField
                id="lastName"
                label="Apellido Paterno"
                value={formData.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                placeholder="Pérez"
              />
              <InputField
                id="secondLastName"
                label="Apellido Materno"
                value={formData.secondLastName}
                onChange={handleInputChange}
                error={errors.secondLastName}
                placeholder="García"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="mt-6">
            <div className="space-y-4">
              <InputField
                id="rfc"
                label="RFC"
                value={formData.rfc}
                onChange={handleInputChange}
                error={errors.rfc}
                placeholder="PECJ880101XXX"
              />
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                  <PhoneInput
                    country={"mx"}
                    value={formData.phone}
                    onChange={(phone) => {
                      setFormData((prev) => ({
                        ...prev,
                        phone,
                      }));
                      validateField("phone", phone);
                    }}
                    inputProps={{
                      id: "phone",
                      name: "phone",
                      required: true,
                      "aria-invalid": errors.phone ? "true" : "false",
                    }}
                    containerClass="phone-input-container"
                    inputClass={`block w-full px-4 py-3 rounded-md border ${
                      errors.phone
                        ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500"
                        : formData.phone &&
                          (!formData.phone.startsWith("52") ||
                            formData.phone.length === 12)
                        ? "border-green-300 text-green-900 focus:ring-green-500 focus:border-green-500"
                        : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                    } shadow-sm`}
                    buttonClass={
                      errors.phone ? "phone-input-flag-button-error" : ""
                    }
                  />
                  {errors.phone ? (
                    <div className="mt-1 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4 inline" />
                      <span>{errors.phone}</span>
                    </div>
                  ) : formData.phone &&
                    (!formData.phone.startsWith("52") ||
                      formData.phone.length === 12) ? (
                    <div className="mt-1 text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 inline" />
                      <span>Campo válido</span>
                    </div>
                  ) : null}
                </div>
              </div>
              <InputField
                id="birthday"
                label="Fecha de Nacimiento"
                type="date"
                value={formData.birthday}
                onChange={handleInputChange}
                error={errors.birthday}
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="mt-6">
            <div className="space-y-4">
              <InputField
                id="street"
                name="street"
                label="Calle"
                value={formData.address.street}
                onChange={handleAddressChange}
                error={errors["address.street"]}
                placeholder="Av. Insurgentes"
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="number"
                  name="number"
                  label="Número"
                  value={formData.address.number}
                  onChange={handleAddressChange}
                  error={errors["address.number"]}
                  placeholder="123"
                />
                <InputField
                  id="zipCode"
                  name="zipCode"
                  label="Código Postal"
                  value={formData.address.zipCode}
                  onChange={handleAddressChange}
                  error={errors["address.zipCode"]}
                  placeholder="06100"
                />
              </div>
              {isLoadingCP && (
                <div className="mt-1 text-sm text-blue-600 flex items-center gap-1">
                  <svg
                    className="animate-spin h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Verificando código postal...</span>
                </div>
              )}
              <InputField
                id="colony"
                name="colony"
                label="Colonia"
                value={formData.address.colony}
                onChange={handleAddressChange}
                error={errors["address.colony"]}
                placeholder="Condesa"
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="city"
                  name="city"
                  label="Ciudad"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  error={errors["address.city"]}
                  placeholder="Ciudad de México"
                />
                <InputField
                  id="state"
                  name="state"
                  label="Estado"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  error={errors["address.state"]}
                  placeholder="CDMX"
                />
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="mt-6">
            <div className="space-y-4">
              <InputField
                id="email"
                label="Correo Electrónico"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                placeholder="juan.perez@ejemplo.com"
              />
              <InputField
                id="password"
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="••••••••"
              />
              <InputField
                id="confirmPassword"
                label="Confirmar Contraseña"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                placeholder="••••••••"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const fetchPostalCodeData = async (zipCode: string) => {
    if (zipCode.length === 5) {
      setIsLoadingCP(true);
      try {
        // Aquí irá la implementación con Google Maps API
        setIsLoadingCP(false);
      } catch (error) {
        console.error("Error al consultar el código postal:", error);
        setErrors((prev) => ({
          ...prev,
          "address.zipCode": "Error al verificar el código postal",
        }));
        setIsLoadingCP(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      <NavBar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl">
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-8 sm:px-10">
              <h1 className="text-3xl font-bold text-white text-center">
                Crea tu Cuenta en BuscoCredito
              </h1>
              <p className="mt-2 text-green-100 text-center max-w-2xl mx-auto">
                ¡Únete a nuestra plataforma y comienza tu viaje financiero hoy!
              </p>
              <div className="mt-8">
                <StepIndicator currentStep={step} />
              </div>
            </div>

            <div className="p-6 sm:p-10">
              <form onSubmit={handleSubmit} className="space-y-8">
                {renderStepHeader()}
                {renderStepContent()}

                <div className="mt-8 flex justify-between">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Anterior
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${
                      step === 1 ? "ml-auto" : ""
                    } inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creando cuenta...
                      </>
                    ) : step === 4 ? (
                      "Registrarse"
                    ) : (
                      "Siguiente"
                    )}
                  </button>
                </div>

                {errors.submit && (
                  <div className="rounded-md bg-red-50 p-4 mt-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{errors.submit}</p>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const StepHeader = ({ icon, title, description }: StepHeaderProps) => (
  <div className="text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
      {React.cloneElement(icon, { className: "h-6 w-6 text-green-600" })}
    </div>
    <h2 className="mt-4 text-2xl font-semibold text-gray-900">{title}</h2>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </div>
);

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  const steps = [
    { number: 1, title: "Personal" },
    { number: 2, title: "Contacto" },
    { number: 3, title: "Dirección" },
    { number: 4, title: "Cuenta" },
  ];

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between w-full max-w-2xl mx-auto">
        {steps.map((step) => (
          <li key={step.number} className="flex items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                step.number <= currentStep
                  ? "border-white bg-white"
                  : "border-green-200 bg-transparent"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  step.number <= currentStep ? "text-green-600" : "text-white"
                }`}
              >
                {step.number}
              </span>
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                step.number <= currentStep ? "text-white" : "text-green-200"
              }`}
            >
              {step.title}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
};

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

const styles = `
  .phone-input-container {
    width: 100% !important;
  }
  
  .phone-input-container .form-control {
    width: 100% !important;
    height: 46px !important;
  }
  
  .phone-input-container .flag-dropdown {
    background-color: transparent !important;
    border: none !important;
    border-right: 1px solid #e5e7eb !important;
  }
  
  .phone-input-container .selected-flag {
    background-color: transparent !important;
  }
  
  .phone-input-flag-button-error {
    border-color: #FCA5A5 !important;
  }
  
  .phone-input-container .country-list {
    margin: 0;
    padding: 0;
    background-color: white;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .phone-input-container .country-list .country {
    padding: 8px 12px;
  }
  
  .phone-input-container .country-list .country:hover {
    background-color: #f3f4f6;
  }
  
  .phone-input-container .country-list .country.highlight {
    background-color: #e5e7eb;
  }
`;

if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
