"use client";

import React, { useEffect } from "react";
import { ArrowRight, ArrowLeft, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import StepIndicator from "@/components/signup/StepIndicator";
import StepHeaderWithStep from "@/components/signup/StepHeaderWithStep";
import StepContent from "@/components/signup/StepContent";
import { useSignupForm } from "@/hooks/useSignupForm";
import { getRedirectPath } from "@/lib/navigation";

const leftPanelContent = {
  1: {
    title: "Cuéntanos quién eres",
    subtitle: "Tu nombre es el primer paso para conectarte con las mejores ofertas financieras.",
  },
  2: {
    title: "Datos de contacto",
    subtitle: "Necesitamos verificar tu identidad para proteger tu perfil crediticio.",
  },
  3: {
    title: "Tu domicilio",
    subtitle: "Las instituciones financieras usan tu ubicación para personalizar sus ofertas.",
  },
  4: {
    title: "Crea tu acceso",
    subtitle: "Ya casi terminas. Configura tus credenciales de acceso.",
  },
};

export default function Signup() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    step,
    formData,
    errors,
    isSubmitting,
    isLoadingCP,
    handleInputChange,
    handleAddressChange,
    handlePhoneChange,
    handleStateChange,
    handleTermsChange,
    handlePrevStep,
    handleSubmit,
  } = useSignupForm();

  useEffect(() => {
    if (user && user.type) {
      router.push(getRedirectPath(user.type));
    }
  }, [user, router]);

  const panel = leftPanelContent[step as keyof typeof leftPanelContent];

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — solo desktop */}
      <div className="hidden md:flex md:w-2/5 bg-[#0e3a45] flex-col relative overflow-hidden">
        {/* Franja verde superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />

        {/* Patrón geométrico */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute right-0 top-0 h-full opacity-[0.06]" viewBox="0 0 300 800" fill="none">
            <circle cx="250" cy="150" r="180" stroke="white" strokeWidth="50" />
            <circle cx="250" cy="500" r="120" stroke="white" strokeWidth="35" />
            <circle cx="250" cy="750" r="70" stroke="white" strokeWidth="25" />
          </svg>
          <svg className="absolute left-0 bottom-0 h-2/3 opacity-[0.04]" viewBox="0 0 300 600" fill="none">
            <circle cx="50" cy="500" r="180" stroke="white" strokeWidth="50" />
            <circle cx="50" cy="250" r="100" stroke="white" strokeWidth="30" />
          </svg>
        </div>

        {/* Contenido del panel */}
        <div className="relative z-10 flex flex-col justify-center h-full p-10">
          <div className="space-y-4">
            <p className="text-green-400 text-sm font-semibold uppercase tracking-widest">
              Paso {step} de 4
            </p>
            <h2 className="text-3xl font-bold text-white leading-snug">
              {panel.title}
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              {panel.subtitle}
            </p>
          </div>

          <p className="text-white/30 text-xs">
            BuscoCrédito no otorga préstamos. Es un intermediario financiero.
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 bg-white flex flex-col">
        {/* Header mobile con logo */}
        <div className="md:hidden flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <Image
            src="/img/logo-buscocredito.png"
            alt="BuscoCrédito"
            width={120}
            height={34}
            className="h-8 w-auto"
          />
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-6 sm:px-10 lg:px-14">
          <div className="w-full max-w-md mx-auto space-y-6">
            {/* Step indicator */}
            <StepIndicator currentStep={step} />

            <form onSubmit={handleSubmit} className="space-y-5">
              <StepHeaderWithStep step={step} />

              <StepContent
                step={step}
                formData={formData}
                errors={errors}
                isLoadingCP={isLoadingCP}
                handleInputChange={handleInputChange}
                handleAddressChange={handleAddressChange}
                handlePhoneChange={handlePhoneChange}
                handleStateChange={handleStateChange}
                handleTermsChange={handleTermsChange}
              />

              {/* Botones de navegación */}
              <div className="flex justify-between items-center pt-2">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center px-5 py-2.5 border border-[#0e3a45] text-sm font-medium rounded-full text-[#0e3a45] bg-white hover:bg-[#0e3a45]/5 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-full text-white bg-[#0e3a45] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
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

              {/* Error de envío */}
              {errors.submit && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <p className="ml-3 text-sm text-red-700">{errors.submit}</p>
                  </div>
                </div>
              )}
            </form>

            {/* Footer del form */}
            <div className="space-y-4 pt-2">
              <p className="text-center text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="font-medium text-[#0e3a45] hover:underline">
                  Inicia sesión aquí
                </Link>
              </p>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 border-t border-gray-100 pt-4">
                <Shield className="w-3.5 h-3.5" />
                <span>Conexión segura · Tus datos están protegidos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
