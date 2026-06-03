"use client";

import { Spinner } from "@heroui/react";

export function SuperAdminLoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Spinner size="lg" color="secondary" />
        <p className="mt-4 text-gray-600">Verificando acceso...</p>
      </div>
    </div>
  );
}
