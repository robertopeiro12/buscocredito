import { Card, CardBody } from "@heroui/react";
import { FileText, TrendingUp, CheckCircle2 } from "lucide-react";
import { SolicitudData } from "@/types/dashboard";

interface DashboardStatsProps {
  solicitudes: SolicitudData[];
  offerCounts: { [key: string]: number };
}

export const DashboardStats = ({
  solicitudes,
  offerCounts,
}: DashboardStatsProps) => {
  // Calcular estadísticas más relevantes
  const totalSolicitudes = solicitudes.length;
  const totalPropuestas = Object.values(offerCounts).reduce(
    (acc, count) => acc + count,
    0
  );
  const solicitudesAprobadas = solicitudes.filter(
    (s) => s.status === "approved"
  ).length;

  const stats = [
    {
      title: "Mis Solicitudes",
      value: totalSolicitudes,
      icon: FileText,
      bgColor: "bg-[#0e3a45]/10",
      iconColor: "text-[#0e3a45]",
    },
    {
      title: "Propuestas Recibidas",
      value: totalPropuestas,
      icon: TrendingUp,
      bgColor: "bg-[#0e3a45]/10",
      iconColor: "text-[#0e3a45]",
    },
    {
      title: "Solicitudes Aprobadas",
      value: solicitudesAprobadas,
      icon: CheckCircle2,
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {stats.map((stat, index) => (
        <Card
          key={index}
          className="bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200"
        >
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div
                className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center`}
              >
                <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};
