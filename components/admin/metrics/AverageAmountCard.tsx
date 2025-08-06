import { DollarSign } from "lucide-react";
import { Bar } from "react-chartjs-2";
import { ProfessionalMetricsCard } from "./ProfessionalMetricsCard";

interface MetricsData {
  averageAmount: number;
  percentageChanges: {
    totalProposals: number;
    averageInterestRate: number;
    averageAmount: number;
    totalCommissions: number;
  };
  monthlyData: {
    [key: string]: {
      proposals: number;
      commissions: number;
    };
  };
  chartOptions?: {
    bar?: any;
    pie?: any;
    interestRate?: any;
  };
}

interface AverageAmountCardProps {
  metricsData: MetricsData;
  getMonthName: (monthNumber: number, year?: number) => string;
}

export const AverageAmountCard = ({
  metricsData,
  getMonthName,
}: AverageAmountCardProps) => {
  const chartData = {
    labels: Object.entries(metricsData.monthlyData)
      .sort((a, b) => {
        const [month1, year1] = a[0].split("-").map(Number);
        const [month2, year2] = b[0].split("-").map(Number);
        return year1 * 12 + month1 - (year2 * 12 + month2);
      })
      .map(([key]) => {
        const [month, year] = key.split("-").map(Number);
        return getMonthName(month, year);
      }),
    datasets: [
      {
        label: "Monto Promedio",
        data: Object.entries(metricsData.monthlyData)
          .sort((a, b) => {
            const [month1, year1] = a[0].split("-").map(Number);
            const [month2, year2] = b[0].split("-").map(Number);
            return year1 * 12 + month1 - (year2 * 12 + month2);
          })
          .map(([_, data]) => {
            if (data.proposals > 0) {
              return metricsData.averageAmount;
            }
            return 0;
          }),
        backgroundColor: "rgba(168, 85, 247, 0.8)",
        borderColor: "rgb(124, 58, 237)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#4b5563",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `Monto: $${context.raw.toLocaleString("es-MX")}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        suggestedMax: Math.max(metricsData.averageAmount * 1.5, 5),
        grid: {
          color: "rgba(226, 232, 240, 0.5)",
          borderDash: [2, 4],
        },
        ticks: {
          callback: (value: any) => `$${value.toLocaleString("es-MX")}`,
          color: "#64748b",
          font: {
            size: 10,
            weight: "normal" as const,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#64748b",
          font: {
            size: 10,
            weight: "normal" as const,
          },
        },
      },
    },
  } as any;

  const chart = Object.keys(metricsData.monthlyData).length > 0 ? (
    <Bar data={chartData} options={chartOptions} />
  ) : (
    <div className="flex items-center justify-center h-full text-gray-400">
      <span className="text-sm">No hay datos disponibles</span>
    </div>
  );

  // Formatear valor para mostrar completo
  const formattedValue = `$${Math.round(metricsData.averageAmount).toLocaleString('es-MX')}`;

  return (
    <ProfessionalMetricsCard
      title="Monto Promedio"
      subtitle="Por propuesta"
      value={formattedValue}
      icon={DollarSign}
      variant="warning"
      trend={{
        value: Math.abs(metricsData.percentageChanges.averageAmount),
        label: "vs período anterior",
        isPositive: metricsData.percentageChanges.averageAmount > 0
      }}
      chart={chart}
    />
  );
};
