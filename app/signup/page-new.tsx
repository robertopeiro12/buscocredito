"use client";

import React from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            {/* Logo y título principal */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900">
                Crear Cuenta
              </h1>
              <p className="mt-2 text-gray-600">
                Únete a BuscoCredito y encuentra las mejores opciones de préstamo
              </p>
            </div>

            {/* Formulario principal */}
            <div className="bg-white rounded-lg shadow-xl p-8">
              {/* Indicador de pasos */}
              <StepIndicator currentStep={step} />

              {/* Header del paso actual */}
              <StepHeaderWithStep step={step} />

              {/* Contenido del paso */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <StepContent
                  step={step}
                  formData={formData}
                  errors={errors}
                  isLoadingCP={isLoadingCP}
                  handleInputChange={handleInputChange}
                  handleAddressChange={handleAddressChange}
                  handlePhoneChange={handlePhoneChange}
                />

                {/* Botones de navegación */}
                <div className="flex justify-between pt-6">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Anterior
                    </button>
                  ) : (
                    <div></div>
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Siguiente
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin h-4 w-4 mr-2"
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
                      ) : (
                        "Crear Cuenta"
                      )}
                    </button>
                  )}
                </div>
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
      </div>
    </div>
  );
}
