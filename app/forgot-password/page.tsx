"use client";
import { useState, useEffect, useRef } from "react";
import { Input, Button } from "@nextui-org/react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  // Ref para auto-focus
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus automático al cargar
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Timer para reenvío
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (!canResend && resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer, canResend]);

  const handleResetPassword = async () => {
    // Validación de email
    if (!email.trim()) {
      setError("Por favor, ingresa tu correo electrónico");
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Por favor, ingresa un correo electrónico válido");
      return;
    }

    if (!canResend) {
      setError(`Puedes reenviar el correo en ${resendTimer} segundos`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Configuración personalizada para el email
      const actionCodeSettings = {
        url: `${window.location.origin}/login?message=password-reset`, // URL de retorno
        handleCodeInApp: false, // Manejar en Firebase, no en la app
      };

      await sendPasswordResetEmail(auth, email.trim(), actionCodeSettings);
      setSuccess(true);
      setCanResend(false);
      setResendTimer(60); // 60 segundos de espera para reenvío
    } catch (error: any) {
      console.error("Error al enviar el correo de recuperación:", error);
      if (error.code === "auth/user-not-found") {
        setError("No existe una cuenta con este correo electrónico");
      } else if (error.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido");
      } else if (error.code === "auth/too-many-requests") {
        setError("Demasiadas solicitudes. Intenta más tarde");
      } else {
        setError("Ocurrió un error al enviar el correo de recuperación");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto border border-gray-100">
        <div className="text-center">
          {/* Ícono de éxito */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¡Correo enviado!
          </h2>

          <div className="text-gray-600 mb-6 space-y-2">
            <p>
              Hemos enviado un correo con instrucciones para restablecer tu
              contraseña a:
            </p>
            <p className="font-semibold text-[#55A555]">{email}</p>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <p className="font-medium mb-1">💡 No encuentras el correo?</p>
              <ul className="text-left space-y-1">
                <li>• Revisa tu carpeta de spam o promociones</li>
                <li>• El correo puede tardar unos minutos en llegar</li>
                <li>• El enlace expira en 1 hora</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              color="success"
              onClick={() => router.push("/login")}
              className="w-full bg-[#55A555] hover:opacity-90 transition-opacity"
            >
              Volver al inicio de sesión
            </Button>

            <button
              onClick={() => {
                setSuccess(false);
                setEmail("");
                setError(null);
              }}
              className="w-full text-sm text-[#55A555] hover:underline"
              disabled={!canResend}
            >
              {canResend ? "Enviar otro correo" : `Reenviar en ${resendTimer}s`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto border border-gray-100">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
        Recuperar contraseña
      </h1>

      <div className="flex flex-col gap-6">
        <div className="text-gray-600 text-sm text-center space-y-2">
          <p>
            Ingresa tu correo electrónico y te enviaremos instrucciones para
            restablecer tu contraseña.
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Proceso seguro y encriptado</span>
          </div>
        </div>

        <Input
          ref={emailInputRef}
          type="email"
          label="Email"
          placeholder="correo@ejemplo.com"
          value={email}
          onValueChange={(value) => {
            setEmail(value);
            if (error) setError(null); // Limpiar error al escribir
          }}
          isInvalid={!!error}
          errorMessage={error}
          classNames={{
            input: "bg-transparent",
            inputWrapper: [
              "bg-default-100",
              "hover:bg-default-200",
              "transition-colors",
            ].join(" "),
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleResetPassword();
            }
          }}
        />

        <Button
          color="success"
          onClick={handleResetPassword}
          isLoading={isLoading}
          isDisabled={!canResend && !isLoading}
          className="w-full bg-[#55A555] hover:opacity-90 transition-opacity"
        >
          {isLoading
            ? "Enviando..."
            : !canResend
            ? `Reenviar en ${resendTimer}s`
            : "Enviar instrucciones"}
        </Button>

        <div className="text-center">
          <a href="/login" className="text-sm text-[#55A555] hover:underline">
            ← Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
}
