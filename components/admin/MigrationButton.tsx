"use client";

import { useState } from 'react';
import { Button } from '@nextui-org/react';

export default function MigrationButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const executeMigration = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/admin/migrate-user-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        alert(`✅ Migración exitosa!\n${data.migratedCount} usuarios migrados\n${data.errorCount} errores`);
      } else {
        setError(data.error || 'Error desconocido');
        alert(`❌ Error: ${data.error}`);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error de conexión';
      setError(errorMsg);
      alert(`❌ Error: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
      <h3 className="text-lg font-semibold text-yellow-800 mb-2">
        🔧 Migración de Seguridad Requerida
      </h3>
      <p className="text-yellow-700 mb-4">
        Los usuarios necesitan permisos actualizados para funcionar con las nuevas reglas de seguridad.
      </p>
      
      <Button 
        onClick={executeMigration}
        isLoading={isLoading}
        color="warning"
        className="mb-4"
      >
        {isLoading ? 'Migrando usuarios...' : '🚀 Ejecutar Migración de Usuarios'}
      </Button>

      {result && (
        <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded">
          <h4 className="font-semibold text-green-800">✅ Migración Completada:</h4>
          <p className="text-green-700">
            • {result.migratedCount} usuarios migrados exitosamente
          </p>
          <p className="text-green-700">
            • {result.errorCount} errores encontrados
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded">
          <h4 className="font-semibold text-red-800">❌ Error:</h4>
          <p className="text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}