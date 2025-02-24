"use client";
import { useState } from "react";
import { Input, Button } from "@nextui-org/react";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async () => {
    if (!email) {
      setError("Por favor, ingresa tu correo electrónico");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error: any) {
      console.error("Error al enviar el correo de recuperación:", error);
      if (error.code === "auth/user-not-found") {
        setError("No existe una cuenta con este correo electrónico");
      } else if (error.code === "auth/invalid-email") {
        setError("El correo electrónico no es válido");
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
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            ¡Correo enviado!
          </h2>
          <p className="text-gray-600 mb-6">
            Hemos enviado un correo con instrucciones para restablecer tu
            contraseña. Por favor, revisa tu bandeja de entrada.
          </p>
          <Button
            color="success"
            onClick={() => router.push("/login")}
            className="w-full bg-[#55A555] hover:opacity-90 transition-opacity"
          >
            Volver al inicio de sesión
          </Button>
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
        <p className="text-gray-600 text-sm text-center">
          Ingresa tu correo electrónico y te enviaremos instrucciones para
          restablecer tu contraseña.
        </p>

        <Input
          type="email"
          label="Email"
          placeholder="correo@ejemplo.com"
          value={email}
          onValueChange={setEmail}
          isInvalid={!!error}
          classNames={{
            input: "bg-transparent",
            inputWrapper: [
              "bg-default-100",
              "hover:bg-default-200",
              "transition-colors",
            ].join(" "),
          }}
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <Button
          color="success"
          onClick={handleResetPassword}
          isLoading={isLoading}
          className="w-full bg-[#55A555] hover:opacity-90 transition-opacity"
        >
          {isLoading ? "Enviando..." : "Enviar instrucciones"}
        </Button>

        <div className="text-center">
          <a href="/login" className="text-sm text-[#55A555] hover:underline">
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    </div>
  );
}
