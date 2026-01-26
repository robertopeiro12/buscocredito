"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
  applyActionCode,
} from "firebase/auth";
import { auth } from "../../firebase";
import { CheckCircle, XCircle, Eye, EyeOff, Lock, Loader2 } from "lucide-react";
import NavBar from "@/components/common/layout/navbar";

function AuthActionContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [mode, setMode] = useState<string | null>(null);
  const [oobCode, setOobCode] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    const modeParam = searchParams?.get("mode");
    const codeParam = searchParams?.get("oobCode");

    setMode(modeParam);
    setOobCode(codeParam);

    if (modeParam === "resetPassword" && codeParam) {
      // Verify the password reset code
      verifyPasswordResetCode(auth, codeParam)
        .then((email) => {
          setEmail(email);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error verifying reset code:", err);
          setError(getErrorMessage(err.code));
          setLoading(false);
        });
    } else if (modeParam === "verifyEmail" && codeParam) {
      // Handle email verification
      applyActionCode(auth, codeParam)
        .then(() => {
          setVerificationSuccess(true);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error verifying email:", err);
          setError(getErrorMessage(err.code));
          setLoading(false);
        });
    } else {
      setError("Enlace inválido o expirado");
      setLoading(false);
    }
  }, [searchParams]);

  const getErrorMessage = (code: string) => {
    switch (code) {
      case "auth/expired-action-code":
        return "Este enlace ha expirado. Por favor solicita uno nuevo.";
      case "auth/invalid-action-code":
        return "Este enlace es inválido o ya fue utilizado.";
      case "auth/user-disabled":
        return "Esta cuenta ha sido deshabilitada.";
      case "auth/user-not-found":
        return "No se encontró ninguna cuenta con este correo.";
      case "auth/weak-password":
        return "La contraseña debe tener al menos 6 caracteres.";
      default:
        return "Ocurrió un error. Por favor intenta de nuevo.";
    }
  };

  const validatePassword = () => {
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validatePassword()) return;
    if (!oobCode) {
      setError("Código de verificación no encontrado");
      return;
    }

    setSubmitting(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
    } catch (err: any) {
      console.error("Error resetting password:", err);
      setError(getErrorMessage(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
          <p className="text-gray-600">Verificando enlace...</p>
        </div>
      );
    }

    if (mode === "verifyEmail") {
      if (verificationSuccess) {
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Correo Verificado!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu correo electrónico ha sido verificado exitosamente.
            </p>
            <Button
              color="primary"
              className="bg-green-600 hover:bg-green-700"
              onPress={() => router.push("/login")}
            >
              Ir a Iniciar Sesión
            </Button>
          </div>
        );
      }

      return (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error de Verificación
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            color="primary"
            className="bg-green-600 hover:bg-green-700"
            onPress={() => router.push("/login")}
          >
            Ir a Iniciar Sesión
          </Button>
        </div>
      );
    }

    if (mode === "resetPassword") {
      if (success) {
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Contraseña Actualizada!
            </h2>
            <p className="text-gray-600 mb-6">
              Tu contraseña ha sido cambiada exitosamente. Ya puedes iniciar
              sesión con tu nueva contraseña.
            </p>
            <Button
              color="primary"
              className="bg-green-600 hover:bg-green-700"
              onPress={() => router.push("/login?message=password-reset")}
            >
              Ir a Iniciar Sesión
            </Button>
          </div>
        );
      }

      if (error && !email) {
        return (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Enlace Inválido
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button
              color="primary"
              className="bg-green-600 hover:bg-green-700"
              onPress={() => router.push("/forgot-password")}
            >
              Solicitar Nuevo Enlace
            </Button>
          </div>
        );
      }

      return (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              Restablecer Contraseña
            </h2>
            {email && (
              <p className="text-gray-600 mt-2">
                Ingresa tu nueva contraseña para{" "}
                <span className="font-medium">{email}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Nueva Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="Ingresa tu nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              isRequired
              size="lg"
              isDisabled={submitting}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              }
            />

            <Input
              label="Confirmar Contraseña"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirma tu nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              isRequired
              size="lg"
              isDisabled={submitting}
              endContent={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              }
            />
          </div>

          <div className="text-sm text-gray-500">
            <p>La contraseña debe:</p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li
                className={
                  newPassword.length >= 6 ? "text-green-600" : "text-gray-500"
                }
              >
                Tener al menos 6 caracteres
              </li>
              <li
                className={
                  newPassword === confirmPassword && confirmPassword.length > 0
                    ? "text-green-600"
                    : "text-gray-500"
                }
              >
                Las contraseñas deben coincidir
              </li>
            </ul>
          </div>

          <Button
            type="submit"
            color="primary"
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-base font-medium"
            isLoading={submitting}
          >
            {submitting ? "Actualizando..." : "Actualizar Contraseña"}
          </Button>
        </form>
      );
    }

    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Enlace Inválido
        </h2>
        <p className="text-gray-600 mb-6">
          Este enlace no es válido o ha expirado.
        </p>
        <Button
          color="primary"
          className="bg-green-600 hover:bg-green-700"
          onPress={() => router.push("/login")}
        >
          Ir a Iniciar Sesión
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-blue-50">
      <NavBar />
      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardBody className="px-6 py-8">{renderContent()}</CardBody>
        </Card>
      </main>
    </div>
  );
}

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-green-500 animate-spin mb-4" />
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      }
    >
      <AuthActionContent />
    </Suspense>
  );
}
