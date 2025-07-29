import { Card, CardBody } from "@nextui-org/react";
import { CreditCard, TrendingUp, Clock, CheckCircle2 } from "lucide-react";
import { SolicitudData } from "@/types/dashboard";

interface DashboardStatsProps {
  solicitudes: SolicitudData[];
  offerCounts: { [key: string]: number };
}

export const DashboardStats = ({ solicitudes, offerCounts }: DashboardStatsProps) => {
  // Calcular estadísticas
  const totalSolicitudes = solicitudes.length;
  const totalPropuestas = Object.values(offerCounts).reduce((acc, count) => acc + count, 0);
  const solicitudesConPropuestas = Object.values(offerCounts).filter(count => count > 0).length;
  const solicitudesAprobadas = solicitudes.filter(s => s.status === "approved").length;

  const stats = [
    {
      title: "Solicitudes Activas",
      value: totalSolicitudes,
      icon: CreditCard,
      color: "blue",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      textColor: "text-blue-700"
    },
    {
      title: "Propuestas Recibidas",
      value: totalPropuestas,
      icon: TrendingUp,
      color: "green",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      textColor: "text-green-700"
    },
    {
      title: "Con Interés",
      value: solicitudesConPropuestas,
      icon: Clock,
      color: "amber",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
      textColor: "text-amber-700"
    },
    {
      title: "Aprobadas",
      value: solicitudesAprobadas,
      icon: CheckCircle2,
      color: "emerald",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
      textColor: "text-emerald-700"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-shadow duration-200">
          <CardBody className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
};
