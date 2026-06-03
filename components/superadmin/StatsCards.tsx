"use client";

import { Card, CardBody } from "@heroui/react";
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Activity,
} from "lucide-react";
import type { SystemStats } from "@/types/superadmin";

interface StatsCardsProps {
  stats: SystemStats | null;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardBody className="p-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  }

  const mainStats = [
    {
      title: "Total Cuentas",
      value: stats.totalAccounts,
      icon: Users,
      iconBg: "bg-[#0e3a45]/[0.08]",
      iconColor: "text-[#0e3a45]",
      valueColor: "text-[#0e3a45]",
    },
    {
      title: "Cuentas Activas",
      value: stats.activeAccounts,
      icon: UserCheck,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
    },
    {
      title: "Cuentas Desactivadas",
      value: stats.disabledAccounts,
      icon: UserX,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      valueColor: "text-red-600",
    },
    {
      title: "Registros Recientes",
      value: stats.recentSignups,
      subtitle: "Últimos 7 días",
      icon: TrendingUp,
      iconBg: "bg-[#0e3a45]/[0.08]",
      iconColor: "text-[#0e3a45]",
      valueColor: "text-[#0e3a45]",
    },
  ];

  const solicitudStats = [
    {
      title: "Total Solicitudes",
      value: stats.totalSolicitudes,
      icon: FileText,
      iconBg: "bg-[#0e3a45]/[0.08]",
      iconColor: "text-[#0e3a45]",
      valueColor: "text-[#0e3a45]",
    },
    {
      title: "Pendientes",
      value: stats.pendingSolicitudes,
      icon: Clock,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
      valueColor: "text-yellow-600",
    },
    {
      title: "Aprobadas",
      value: stats.approvedSolicitudes,
      icon: CheckCircle,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
      valueColor: "text-green-600",
    },
    {
      title: "Rechazadas",
      value: stats.rejectedSolicitudes,
      icon: XCircle,
      iconBg: "bg-red-50",
      iconColor: "text-red-500",
      valueColor: "text-red-600",
    },
  ];

  const userTypeStats = [
    { title: "Super Admins",  value: stats.accountsByType.superAdmin,   color: "bg-[#0e3a45]" },
    { title: "Admin Empresa", value: stats.accountsByType.companyAdmin,  color: "bg-[#0e3a45]/80" },
    { title: "Prestamistas",  value: stats.accountsByType.lender,        color: "bg-[#0e3a45]/60" },
    { title: "Solicitantes",  value: stats.accountsByType.borrower,      color: "bg-green-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-[#0e3a45]" />
          Resumen de Cuentas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mainStats.map((stat, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-1 bg-green-500 w-full" />
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className={`text-3xl font-bold ${stat.valueColor}`}>
                      {stat.value.toLocaleString()}
                    </p>
                    {stat.subtitle && (
                      <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full ${stat.iconBg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* Solicitudes Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[#0e3a45]" />
          Resumen de Solicitudes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {solicitudStats.map((stat, index) => (
            <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-1 bg-green-500 w-full" />
              <CardBody className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.title}</p>
                    <p className={`text-3xl font-bold ${stat.valueColor}`}>
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.iconBg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {/* User Types Distribution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#0e3a45]" />
          Distribución por Tipo de Usuario
        </h3>
        <Card>
          <CardBody className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userTypeStats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`w-16 h-16 mx-auto rounded-full ${stat.color} flex items-center justify-center mb-2`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
