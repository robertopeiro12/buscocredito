"use client";

import React from "react";
import { ArrowRight, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import NavBar from "@/components/common/layout/navbar";

// Importar componentes extraídos
import StepIndicator from "@/components/signup/StepIndicator";
import StepHeaderWithStep from "@/components/signup/StepHeaderWithStep";
import StepContent from "@/components/signup/StepContent";
import { useSignupForm } from "@/hooks/useSignupForm";

export default function Signup() {
  const { user } = useAuth();
  const router = useRouter();
  
  // Usar el hook personalizado para toda la lógica del formulario
  const {
    step,
    formData,
    errors,
    isSubmitting,
    isLoadingCP,
    handleInputChange,
    handleAddressChange,
    handlePhoneChange,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
  } = useSignupForm();

  useEffect(() => {
    if (user) {
      router.push("/user_dashboard");
    }
  }, [user, router]);

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
                <StepHeaderWithStep step={step} />
                
                <StepContent
                  step={step}
                  formData={formData}
                  errors={errors}
                  isLoadingCP={isLoadingCP}
                  handleInputChange={handleInputChange}
                  handleAddressChange={handleAddressChange}
                  handlePhoneChange={handlePhoneChange}
                />

                <div className="mt-8 flex justify-between">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
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
                      <>
                        Siguiente
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </button>
                </div>

                {/* Mostrar errores de envío si existen */}
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

              {/* Link a login */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  ¿Ya tienes una cuenta?{" "}
                  <Link
                    href="/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Inicia sesión aquí
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Estilos para el componente de teléfono
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
