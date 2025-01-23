"use client";
import { Input, Button } from "@nextui-org/react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, getFirestore } from "firebase/firestore";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.uid);
        console.log("uid", user.uid);
      } else {
        console.log("user is logged out");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (value: string, field: "email" | "password") => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setError(false);
  };

  const signIn = async () => {
    if (!formData.email || !formData.password) {
      setError(true);
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      setUser(userCredential.user.uid);

      const db = getFirestore();
      const userDocRef = doc(db, "cuentas", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        switch (userData.type) {
          case "b_admin":
            router.push("/admin_dashboard");
            break;
          case "user":
            router.push("/user_dashboard");
            break;
          case "b_sale":
            router.push("/lender");
            break;
          default:
            console.error("Unknown account type");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
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
          isInvalid={error}
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
          isInvalid={error}
          classNames={{
            input: "bg-transparent",
            inputWrapper: [
              "bg-default-100",
              "hover:bg-default-200",
              "transition-colors",
            ].join(" "),
          }}
        />

        {error && (
          <p className="text-red-500 text-sm text-center">
            Correo o contraseña incorrecta
          </p>
        )}

        <Button
          color="success"
          onClick={signIn}
          isLoading={isLoading}
          className="w-full bg-[#55A555] hover:opacity-90 transition-opacity"
        >
          {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
        </Button>

        <p className="text-sm text-center text-gray-600">
          ¿No tienes una cuenta?{" "}
          <a href="/signup" className="text-[#55A555] hover:underline">
            Regístrate aquí
          </a>
        </p>
      </div>
    </div>
  );
}
