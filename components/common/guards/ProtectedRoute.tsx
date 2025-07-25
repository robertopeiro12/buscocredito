"use client";

import { ReactNode } from "react";
import { useRoleGuard } from "../../../hooks/useRoleGuard";

type UserType = 'b_admin' | 'b_sale' | 'user';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserType[];
  fallbackRoute?: string;
  loadingComponent?: ReactNode;
}

export default function ProtectedRoute({
  children,
  allowedRoles,
  fallbackRoute,
  loadingComponent
}: ProtectedRouteProps) {
  const { isAuthorized, isLoading } = useRoleGuard({
    allowedRoles,
    fallbackRoute
  });

  // Mostrar componente de carga mientras se verifica la autorización
  if (isLoading) {
    return (
      loadingComponent || (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando permisos...</p>
          </div>
        </div>
      )
    );
  }

  // Si está autorizado, mostrar el contenido
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Si no está autorizado, no mostrar nada (el hook ya manejó la redirección)
  return null;
}
