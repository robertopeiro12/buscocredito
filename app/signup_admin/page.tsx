"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Spacer,
} from "@nextui-org/react";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";
import { doc, getFirestore, setDoc } from "firebase/firestore";

export default function SignUpAdmin() {
  const [accessToken, setAccessToken] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const verifyAccessToken = () => {
    setLoading(true);
    setError("");

    if (accessToken === "valid_token") {
      setIsVerified(true);
      setError("");
    } else {
      setError(
        "Token de acceso inválido. Por favor verifica e intenta de nuevo."
      );
    }
    setLoading(false);
  };

  async function signUp() {
    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const userId = userCredential.user.uid;

      const db = getFirestore();
      await setDoc(doc(db, "cuentas", userId), {
        Empresa: "",
        type: "b_admin",
        email: email,
        // Removed createdAt field
      });

      await signOut(auth);
      router.push("/login");
    } catch (error: any) {
      let errorMessage = "Ocurrió un error durante el registro.";

      switch (error.code) {
        case "auth/email-already-in-use":
          errorMessage = "Este correo ya está registrado.";
          break;
        case "auth/invalid-email":
          errorMessage = "Por favor ingresa un correo válido.";
          break;
        case "auth/weak-password":
          errorMessage = "La contraseña debe tener al menos 6 caracteres.";
          break;
        default:
          errorMessage = error.message;
      }

      setError(errorMessage);
      setLoading(false);
    }
  }

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    signUp();
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="flex flex-col items-center px-6 pt-6 pb-4 border-b border-gray-200">
        <h4 className="text-2xl font-bold text-gray-800">BuscoCredito</h4>
        <p className="text-base text-gray-600 mt-2">
          {isVerified
            ? "Crea tu cuenta de administrador"
            : "Ingresa tu token de acceso"}
        </p>
      </CardHeader>
      <CardBody className="px-6 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {!isVerified ? (
          <div className="space-y-6">
            <Input
              label="Token de Acceso"
              placeholder="Ingresa tu token de acceso"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full"
              size="lg"
              isRequired
              isDisabled={loading}
            />
            <Button
              color="primary"
              onClick={verifyAccessToken}
              className="w-full bg-[#48A348] hover:bg-[#3b833b] h-12 text-base font-medium"
              isLoading={loading}
            >
              {loading ? "Verificando..." : "Verificar Token"}
            </Button>

            <div className="flex items-center gap-4 mt-4 p-4 bg-[#f8fdf8] rounded-lg border border-[#48A348]/20">
              <span className="text-[#48A348]">✓</span>
              <p className="text-sm text-gray-600">Proceso Simple y Seguro</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-6">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="Ingresa tu correo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isRequired
              size="lg"
              isDisabled={loading}
              className="w-full"
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              isRequired
              size="lg"
              isDisabled={loading}
              className="w-full"
            />
            <Button
              color="primary"
              type="submit"
              className="w-full bg-[#48A348] hover:bg-[#3b833b] h-12 text-base font-medium"
              isLoading={loading}
            >
              {loading ? "Creando Cuenta..." : "Crear Cuenta"}
            </Button>

            <div className="flex items-center gap-4 mt-4 p-4 bg-[#f8fdf8] rounded-lg border border-[#48A348]/20">
              <span className="text-[#48A348]">🔒</span>
              <p className="text-sm text-gray-600">100% Seguro</p>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
}
