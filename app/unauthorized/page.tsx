"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody } from "@heroui/react";
import { ShieldX, Home, ArrowLeft } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { doc, getDoc, getFirestore } from "firebase/firestore";

export default function UnauthorizedPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const db = getFirestore();
          const userDoc = await getDoc(doc(db, "cuentas", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserType(userData.type);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGoToDashboard = () => {
    if (!userType) {
      router.push("/login");
      return;
    }

    // Redirigir al dashboard correspondiente según el tipo de usuario
    switch (userType) {
      case "b_admin":
        router.push("/admin_dashboard");
        break;
      case "b_sale":
        router.push("/lender");
        break;
      case "user":
        router.push("/user_dashboard");
        break;
      default:
        router.push("/login");
    }
  };

  const getDashboardName = () => {
    switch (userType) {
      case "b_admin":
        return "Panel de Administración";
      case "b_sale":
        return "Panel de Prestamista";
      case "user":
        return "Panel de Usuario";
      default:
        return "Tu Dashboard";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardBody className="text-center p-8">
          <div className="mb-6">
            <ShieldX className="mx-auto h-16 w-16 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Acceso No Autorizado
          </h1>
          
          <p className="text-gray-600 mb-6">
            No tienes permisos para acceder a esta página. Por favor, verifica que estés usando la cuenta correcta.
          </p>

          <div className="space-y-3">
            <Button
              color="primary"
              onClick={handleGoToDashboard}
              className="w-full bg-green-600 hover:bg-green-700"
              startContent={<Home className="h-4 w-4" />}
            >
              Ir a {getDashboardName()}
            </Button>
            
            <Button
              variant="light"
              onClick={() => router.back()}
              className="w-full"
              startContent={<ArrowLeft className="h-4 w-4" />}
            >
              Volver Atrás
            </Button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Si crees que esto es un error, contacta al soporte técnico.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
