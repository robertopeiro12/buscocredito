import React from 'react';
import { Store, TrendingUp, Users, DollarSign, Activity } from "lucide-react";
import { LoanRequest } from "@/types/entities/business.types";
import { ProfessionalMetricsCard } from "./ProfessionalMetricsCard";

interface MarketplaceMetricsCardsProps {
  loanRequests?: LoanRequest[];
  loading?: boolean;
}

export const MarketplaceMetricsCards = ({
  loanRequests = [],
  loading = false
}: MarketplaceMetricsCardsProps) => {
  // Calcular métricas con validación
  const totalRequests = Array.isArray(loanRequests) ? loanRequests.length : 0;
  const activeRequests = Array.isArray(loanRequests) 
    ? loanRequests.filter(r => r && r.status === "pending").length 
    : 0;
  const totalAmount = Array.isArray(loanRequests) 
    ? loanRequests.reduce((sum, request) => {
        const amount = request && typeof request.amount === 'number' ? request.amount : 0;
        return sum + amount;
      }, 0)
    : 0;
  const avgAmount = totalRequests > 0 ? totalAmount / totalRequests : 0;

  // Calcular tasa de actividad
  const activityRate = totalRequests > 0 ? (activeRequests / totalRequests) * 100 : 0;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
              <div className="flex-1">
                <div className="w-24 h-3 bg-gray-200 rounded mb-2"></div>
                <div className="w-16 h-2 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="w-20 h-8 bg-gray-200 rounded mb-3"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Solicitudes */}
      <ProfessionalMetricsCard
        title="Total Solicitudes"
        subtitle="Marketplace"
        value={totalRequests.toString()}
        icon={Store}
        variant="success"
      />

      {/* Solicitudes Activas */}
      <ProfessionalMetricsCard
        title="Solicitudes Activas"
        subtitle="Estado pendiente"
        value={activeRequests.toString()}
        icon={TrendingUp}
        variant="info"
      />

      {/* Monto Total */}
      <ProfessionalMetricsCard
        title="Monto Total"
        subtitle="Valor del mercado"
        value={`$${totalAmount.toLocaleString('es-MX')}`}
        icon={DollarSign}
        variant="warning"
      />

      {/* Monto Promedio */}
      <ProfessionalMetricsCard
        title="Monto Promedio"
        subtitle="Por solicitud"
        value={`$${Math.round(avgAmount).toLocaleString('es-MX')}`}
        icon={Activity}
        variant="primary"
      />
    </div>
  );
};
