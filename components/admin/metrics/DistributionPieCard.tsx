import { PieChart } from "lucide-react";
import { Pie } from "react-chartjs-2";
import { ProfessionalMetricsCard } from "./ProfessionalMetricsCard";

interface DistributionPieCardProps {
  title: string;
  data: { [key: string]: number };
  colors: {
    backgroundColor: string[];
    borderColor: string[];
  };
  chartOptions?: any;
  getTopDistributionItems: (
    distribution: { [key: string]: number },
    limit?: number
  ) => { name: string; value: number }[];
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
}

export const DistributionPieCard = ({
  title,
  data,
  colors,
  chartOptions,
  getTopDistributionItems,
  variant = 'primary'
}: DistributionPieCardProps) => {
  const topItems = getTopDistributionItems(data, 5);
  const totalItems = Object.values(data).reduce((sum, val) => sum + val, 0);
  const topItem = topItems[0];

  const chartData = {
    labels: topItems.map((item) => item.name),
    datasets: [
      {
        data: topItems.map((item) => item.value),
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: 2,
        hoverOffset: 8,
        hoverBorderWidth: 3,
      },
    ],
  };

  const modernChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false, // Ocultamos la leyenda por defecto para usar nuestra propia
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#4b5563",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const percentage = ((context.raw / totalItems) * 100).toFixed(1);
            return `${context.label}: ${context.raw} (${percentage}%)`;
          },
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 800,
    },
  };

  const chart = Object.keys(data).length > 0 ? (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-32 h-32">
          <Pie data={chartData} options={modernChartOptions} />
        </div>
      </div>
      {/* Custom Legend */}
      <div className="mt-3 space-y-1">
        {topItems.slice(0, 3).map((item, index) => (
          <div key={item.name} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: colors.backgroundColor[index] }}
              ></div>
              <span className="text-gray-600 truncate max-w-20">{item.name}</span>
            </div>
            <span className="font-medium text-gray-800">
              {((item.value / totalItems) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  ) : (
    <div className="flex items-center justify-center h-full text-gray-400">
      <span className="text-sm">No hay datos disponibles</span>
    </div>
  );

  // Calcular el valor principal para mostrar
  const mainValue = topItem ? `${((topItem.value / totalItems) * 100).toFixed(0)}%` : "0%";
  const subtitle = topItem ? `${topItem.name} (principal)` : "Sin datos";

  return (
    <ProfessionalMetricsCard
      title={title}
      subtitle={subtitle}
      value={mainValue}
      icon={PieChart}
      variant={variant}
      chart={chart}
    />
  );
};
