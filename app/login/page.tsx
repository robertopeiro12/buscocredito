// app/login/page.tsx
"use client";
import { Input, Button } from "@heroui/react";
import { useAuth } from "../../contexts/AuthContext";
import { useForm } from "../../hooks/useForm";
import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Helper function to get redirect path based on user type
const getRedirectPath = (userType: string): string => {
  switch (userType) {
    case "super_admin":
      return "/super_admin_dashboard";
    case "b_admin":
      return "/admin_dashboard";
    case "b_sale":
      return "/lender";
    case "user":
    default:
      return "/user_dashboard";
  }
};

// Reglas de validación
const validationRules = {
  email: (value: string) => {
    if (!value) return "El email es requerido";
    if (value.length > 254) return "Email demasiado largo";
    // Solo validar formato básico, no revelar si el email existe
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Formato de email inválido";
    }
  },
  password: (value: string) => {
    if (!value) return "La contraseña es requerida";
    // No validar complejidad en login, solo que no esté vacío
  },
};

function LoginForm() {
  const { signIn, loading, error: authError, user } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetMessage = searchParams?.get("message");

  // Redirect already logged-in users to their respective dashboard
  useEffect(() => {
    if (user && user.type) {
      const redirectPath = getRedirectPath(user.type);
      router.push(redirectPath);
    }
  }, [user, router]);

  // Rate limiting state
  const [attemptCount, setAttemptCount] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeLeft, setBlockTimeLeft] = useState(0);

  // Remember me state
  const [rememberMe, setRememberMe] = useState(false);

  // Show/hide password state
  const [showPassword, setShowPassword] = useState(false);

  // Ref para focus automático
  const emailInputRef = useRef<HTMLInputElement>(null);

  const {
    values: formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm({ email: "", password: "" }, validationRules);

  // Función de inicio de sesión memoizada
  const handleSignIn = useCallback(async () => {
    // Verificar si está bloqueado
    if (isBlocked) {
      return;
    }

    // Rate limiting: máximo 5 intentos
    if (attemptCount >= 5) {
      setIsBlocked(true);
      setBlockTimeLeft(300); // 5 minutos
      return;
    }

    try {
      await handleSubmit(async (values) => {
        await signIn(values.email, values.password, rememberMe);
        // Reset contador si login es exitoso
        setAttemptCount(0);
      });
    } catch (error) {
      // Incrementar contador solo si hay error de autenticación
      setAttemptCount((prev) => prev + 1);
    }
  }, [isBlocked, attemptCount, handleSubmit, signIn, rememberMe]);

  // Timer para el bloqueo
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (blockTimeLeft > 0) {
      timer = setTimeout(() => {
        setBlockTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isBlocked && blockTimeLeft === 0) {
      setIsBlocked(false);
      setAttemptCount(0);
    }
    return () => clearTimeout(timer);
  }, [blockTimeLeft, isBlocked]);

  // Manejo de tecla Enter
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !loading && !isSubmitting && !isBlocked) {
        handleSignIn();
      }
    };

    document.addEventListener("keypress", handleKeyPress);
    return () => document.removeEventListener("keypress", handleKeyPress);
  }, [loading, isSubmitting, isBlocked, handleSignIn]);

  // Focus automático en el email input al cargar
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  // Función para obtener el texto del botón dinámico
  const getButtonText = () => {
    if (isBlocked)
      return `Bloqueado (${Math.floor(blockTimeLeft / 60)}:${(
        blockTimeLeft % 60
      )
        .toString()
        .padStart(2, "0")})`;
    if (loading && !isSubmitting) return "Verificando credenciales...";
    if (isSubmitting) return "Iniciando sesión...";
    return "Iniciar Sesión";
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full border border-gray-100">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
        Iniciar Sesión
      </h1>

      {/* Mensaje de password reset exitoso */}
      {resetMessage === "password-reset" && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-4 h-4 text-green-600 mr-2"
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
            <p className="text-sm text-green-700">
              Si has restablecido tu contraseña exitosamente, ya puedes iniciar
              sesión con tu nueva contraseña.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        <Input
          ref={emailInputRef}
          type="email"
          label="Email"
          placeholder="correo@ejemplo.com"
          value={formData.email}
          onValueChange={(value) => handleChange("email", value)}
          onBlur={() => handleBlur("email")}
          isInvalid={!!errors.email && touched.email}
          errorMessage={touched.email && errors.email}
          classNames={{
            input: "bg-transparent",
            inputWrapper: [
              "bg-default-100",
              "hover:bg-default-200",
              "transition-colors",
            ].join(" "),
          }}
        />

        <Input
          type={showPassword ? "text" : "password"}
          label="Contraseña"
          placeholder="••••••••"
          value={formData.password}
          onValueChange={(value) => handleChange("password", value)}
          onBlur={() => handleBlur("password")}
          isInvalid={!!errors.password && touched.password}
          errorMessage={touched.password && errors.password}
          classNames={{
            input: "bg-transparent",
            inputWrapper: [
              "bg-default-100",
              "hover:bg-default-200",
              "transition-colors",
            ].join(" "),
          }}
          endContent={
            <button
              className="focus:outline-none"
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              )}
            </button>
          }
        />

        {(authError || isBlocked) && (
          <div className="text-red-500 text-sm text-center">
            {isBlocked
              ? `Demasiados intentos. Intenta en ${Math.floor(
                  blockTimeLeft / 60
                )}:${(blockTimeLeft % 60).toString().padStart(2, "0")} minutos`
              : authError}
          </div>
        )}

        {attemptCount > 0 && attemptCount < 5 && !isBlocked && (
          <div className="text-orange-500 text-sm text-center">
            Intento {attemptCount}/5. Ten cuidado con los intentos restantes.
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-[#55A555] bg-gray-100 border-gray-300 rounded focus:ring-[#55A555] focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-600">Recordarme</span>
          </label>
          <a
            href="/forgot-password"
            className="text-sm text-[#55A555] hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <Button
          color="success"
          onClick={handleSignIn}
          isLoading={loading || isSubmitting}
          isDisabled={isBlocked}
          className="w-full bg-[#55A555] hover:opacity-90 transition-opacity"
        >
          {getButtonText()}
        </Button>

        <p className="text-center text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <a href="/signup" className="text-[#55A555] hover:underline font-medium">
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-white p-8 rounded-xl shadow-lg w-full border border-gray-100">
        <div className="text-center">Cargando...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
