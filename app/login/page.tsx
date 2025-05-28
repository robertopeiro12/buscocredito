// app/login/page.tsx
"use client";
import { Input, Button } from "@nextui-org/react";
import { useAuth } from "../../contexts/AuthContext";
import { useForm } from "../../hooks/useForm";

// Reglas de validación
const validationRules = {
  email: (value: string) => {
    if (!value) return "El email es requerido";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Email inválido";
    }
  },
  password: (value: string) => {
    if (!value) return "La contraseña es requerida";
    if (value.length < 6) {
      return "La contraseña debe tener al menos 6 caracteres";
    }
  },
};

export default function LoginPage() {
  const { signIn, loading, error: authError } = useAuth();
  const {
    values: formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm({ email: "", password: "" }, validationRules);

  const handleSignIn = async () => {
    await handleSubmit(async (values) => {
      await signIn(values.email, values.password);
    });
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
          type="password"
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
        />

        {authError && (
          <p className="text-red-500 text-sm text-center">{authError}</p>
        )}

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
          isLoading={loading || isSubmitting}
          className="w-full bg-[#55A555] hover:opacity-90 transition-opacity"
        >
          {loading || isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>
      </div>
    </div>
  );
}
