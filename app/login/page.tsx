// app/login/page.tsx
"use client";
import { Input, Button } from "@nextui-org/react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const { signIn, loading, error } = useAuth();

  const handleInputChange = (value: string, field: "email" | "password") => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSignIn = async () => {
    if (!formData.email || !formData.password) {
      return;
    }
    await signIn(formData.email, formData.password);
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-lg w-full border border-gray-100">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
        Iniciar Sesión
      </h1>

      <div className="flex flex-col gap-6">
        <Input
          type="email"
          label="Email"
          placeholder="correo@ejemplo.com"
          value={formData.email}
          onValueChange={(value) => handleInputChange(value, "email")}
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

        <Input
          type="password"
          label="Contraseña"
          placeholder="••••••••"
          value={formData.password}
          onValueChange={(value) => handleInputChange(value, "password")}
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

        <div className="flex justify-end">
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
          isLoading={loading}
          className="w-full bg-[#55A555] hover:opacity-90 transition-opacity"
        >
          {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </div>
    </div>
  );
}
