"use client";

import { Card, CardBody, CardHeader } from "@nextui-org/react";
import { Database, Server, Clock, HardDrive, CheckCircle } from "lucide-react";

interface DatabaseInfoProps {
  databaseInfo: {
    collections: { name: string; documentCount: number }[];
    totalDocuments: number;
  } | null;
  serverHealth: {
    status: "healthy" | "degraded" | "down";
    uptime: number;
    lastChecked: string;
    nodeVersion?: string;
    platform?: string;
  } | null;
  isLoading: boolean;
}

export function SystemInfoCards({
  databaseInfo,
  serverHealth,
  isLoading,
}: DatabaseInfoProps) {
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.join(" ") || "< 1m";
  };

  const collectionLabels: Record<string, string> = {
    cuentas: "Cuentas de Usuario",
    solicitudes: "Solicitudes de Préstamo",
    propuestas: "Propuestas de Prestamistas",
    notificaciones: "Notificaciones",
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="animate-pulse">
          <CardBody className="h-64 bg-gray-100"></CardBody>
        </Card>
        <Card className="animate-pulse">
          <CardBody className="h-64 bg-gray-100"></CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Server Status */}
      {serverHealth && (
        <Card>
          <CardHeader className="flex items-center gap-3">
            <Server className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Estado del Servidor</h3>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    Estado
                  </span>
                </div>
                <p className="text-lg font-bold text-green-600 capitalize">
                  {serverHealth.status === "healthy" ? "Saludable" : serverHealth.status}
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    Tiempo Activo
                  </span>
                </div>
                <p className="text-lg font-bold text-blue-600">
                  {formatUptime(serverHealth.uptime)}
                </p>
              </div>

              {serverHealth.nodeVersion && (
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-700">
                      Node.js
                    </span>
                  </div>
                  <p className="text-lg font-bold text-purple-600">
                    {serverHealth.nodeVersion}
                  </p>
                </div>
              )}

              {serverHealth.platform && (
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Server className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-medium text-indigo-700">
                      Plataforma
                    </span>
                  </div>
                  <p className="text-lg font-bold text-indigo-600 capitalize">
                    {serverHealth.platform}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Última verificación:{" "}
              {new Date(serverHealth.lastChecked).toLocaleString("es-ES")}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Database Info */}
      {databaseInfo && (
        <Card>
          <CardHeader className="flex items-center gap-3">
            <Database className="w-5 h-5 text-indigo-500" />
            <h3 className="text-lg font-semibold">Base de Datos (Firestore)</h3>
          </CardHeader>
          <CardBody>
            <div className="mb-4">
              <p className="text-sm text-gray-500">Total de Documentos</p>
              <p className="text-3xl font-bold text-indigo-600">
                {databaseInfo.totalDocuments.toLocaleString()}
              </p>
            </div>

            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Colecciones
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {databaseInfo.collections.map((collection) => (
                <div
                  key={collection.name}
                  className="flex items-center justify-between bg-gray-50 p-4 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-800">
                      {collectionLabels[collection.name] || collection.name}
                    </p>
                    <p className="text-xs text-gray-500 font-mono">
                      {collection.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-700">
                      {collection.documentCount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">documentos</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}
