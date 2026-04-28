"use client";

import { useState } from "react";
import { 
  Card, 
  CardBody, 
  CardHeader, 
  Input, 
  Button, 
  Image,
} from "@heroui/react";
import { Lock, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function BetaAccessPage() {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Por favor ingresa un token");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/beta/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim().toUpperCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("¡Acceso concedido!");
        router.push("/");
        router.refresh(); // Forzar recarga para que el middleware reconozca la cookie
      } else {
        toast.error(data.error || "Token inválido");
      }
    } catch (error) {
      console.error("Error validando token:", error);
      toast.error("Error al validar el token. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full animate-in fade-in zoom-in duration-500">
        {/* Logo Section */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Busco<span className="text-green-600">Credito</span>
            </h1>
          </div>
        </div>

        <Card className="shadow-2xl border-none">
          <CardHeader className="flex flex-col gap-1 p-8 pb-0 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100">
              <Lock className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Acceso Exclusivo</h2>
            <p className="text-gray-500 text-sm">
              Estamos en fase beta privada. Ingresa tu token de acceso para continuar.
            </p>
          </CardHeader>
          
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Token de Acceso"
                placeholder="EJ: BETA-XXXX-XXXX"
                variant="bordered"
                radius="lg"
                size="lg"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                classNames={{
                  label: "text-gray-600 font-medium",
                  input: "uppercase tracking-widest font-mono text-center text-lg",
                  inputWrapper: "border-gray-200 focus-within:border-green-500 h-16",
                }}
                isDisabled={isLoading}
              />
              
              <Button
                type="submit"
                color="success"
                size="lg"
                className="w-full h-14 text-lg font-bold shadow-lg shadow-green-200"
                radius="lg"
                endContent={isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                isDisabled={isLoading}
              >
                {isLoading ? "Validando..." : "Ingresar"}
              </Button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                ¿No tienes un token? Contacta a tu administrador para solicitar acceso a la demo.
              </p>
            </div>
          </CardBody>
        </Card>
        
        <p className="text-center mt-8 text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} BuscoCredito - Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
