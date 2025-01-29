"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";
import { auth } from "../firebase";
import NavBar from "@/components/navbar";
import Footer from "@/components/Footer";
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
    validateField(`address.${name}`, value);
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
        } else if (
          !/^[A-Z&Ñ]{3,4}[0-9]{2}(0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])[A-Z0-9]{2}[0-9A]$/.test(
            value
          )
        ) {
          newErrors[name] = "RFC inválido";
        } else {
          delete newErrors[name];
        }
        break;
      case "phone":
        if (!value.trim()) {
          newErrors[name] = "Teléfono es requerido";
        } else if (!/^\d{10}$/.test(value)) {
          newErrors[name] = "Teléfono inválido (10 dígitos)";
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
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
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

    fieldsToValidate.forEach((field) => {
      const value = field.includes("address.")
        ? formData.address[field.split(".")[1]]
        : formData[field];
      validateField(field, value);
      if (errors[field]) stepErrors[field] = errors[field];
    });

    return Object.keys(stepErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setStep((prev) => prev + 1);
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

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <StepHeader
              icon={<User className="w-6 h-6" />}
              title="Información Personal"
              description="Ingresa tus datos personales para comenzar"
            />
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
          <div className="space-y-6">
            <StepHeader
              icon={<CreditCard className="w-6 h-6" />}
              title="Información de Contacto"
              description="Proporciona tu información de contacto y documentos"
            />
            <div className="space-y-4">
              <InputField
                id="rfc"
                label="RFC"
                value={formData.rfc}
                onChange={handleInputChange}
                error={errors.rfc}
                placeholder="PECJ880101XXX"
              />
              <InputField
                id="phone"
                label="Número de Teléfono"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                error={errors.phone}
                placeholder="5512345678"
              />
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
          <div className="space-y-6">
            <StepHeader
              icon={<MapPin className="w-6 h-6" />}
              title="Dirección"
              description="Ingresa los detalles de tu domicilio"
            />
            <div className="space-y-4">
              <InputField
                id="street"
                label="Calle"
                value={formData.address.street}
                onChange={handleAddressChange}
                error={errors["address.street"]}
                placeholder="Av. Insurgentes"
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="number"
                  label="Número"
                  value={formData.address.number}
                  onChange={handleAddressChange}
                  error={errors["address.number"]}
                  placeholder="123"
                />
                <InputField
                  id="zipCode"
                  label="Código Postal"
                  value={formData.address.zipCode}
                  onChange={handleAddressChange}
                  error={errors["address.zipCode"]}
                  placeholder="06100"
                />
              </div>
              <InputField
                id="colony"
                label="Colonia"
                value={formData.address.colony}
                onChange={handleAddressChange}
                error={errors["address.colony"]}
                placeholder="Condesa"
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="city"
                  label="Ciudad"
                  value={formData.address.city}
                  onChange={handleAddressChange}
                  error={errors["address.city"]}
                  placeholder="Ciudad de México"
                />
                <InputField
                  id="state"
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
          <div className="space-y-6">
            <StepHeader
              icon={<Lock className="w-6 h-6" />}
              title="Información de la Cuenta"
              description="Crea tus credenciales de acceso"
            />
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
                {renderStepContent()}

                {errors.submit && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{errors.submit}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                    >
                      Anterior
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${
                      step === 1 ? "w-full" : "ml-auto"
                    } inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 ${
                      isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                      </span>
                    ) : step === 4 ? (
                      "Crear Cuenta"
                    ) : (
                      "Siguiente"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

const StepHeader = ({ icon, title, description }) => (
  <div className="text-center">
    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
      {React.cloneElement(icon, { className: "h-6 w-6 text-green-600" })}
    </div>
    <h2 className="mt-4 text-2xl font-semibold text-gray-900">{title}</h2>
    <p className="mt-1 text-sm text-gray-500">{description}</p>
  </div>
);

const StepIndicator = ({ currentStep }) => {
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
  label,
  type = "text",
  value,
  onChange,
  error,
  placeholder,
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="mt-1 relative rounded-md shadow-sm">
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`block w-full px-4 py-3 rounded-md border ${
          error
            ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-green-500 focus:border-green-500"
        } shadow-sm transition-colors duration-200`}
      />
      {error && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <AlertCircle className="h-5 w-5 text-red-500" />
        </div>
      )}
    </div>
    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
  </div>
);
