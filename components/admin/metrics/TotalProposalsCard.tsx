import { BarChart3 } from "lucide-react";
import { Bar } from "react-chartjs-2";
import { ProfessionalMetricsCard } from "./ProfessionalMetricsCard";

interface MetricsData {
  totalProposals: number;
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

interface TotalProposalsCardProps {
  metricsData: MetricsData;
  getMonthName: (monthNumber: number, year?: number) => string;
}

export const TotalProposalsCard = ({
  metricsData,
  getMonthName,
}: TotalProposalsCardProps) => {
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
        label: "Propuestas",
        data: Object.entries(metricsData.monthlyData)
          .sort((a, b) => {
            const [month1, year1] = a[0].split("-").map(Number);
            const [month2, year2] = b[0].split("-").map(Number);
            return year1 * 12 + month1 - (year2 * 12 + month2);
          })
          .map(([_, data]) => data.proposals),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgb(21, 128, 61)",
        borderWidth: 1,
        borderRadius: 6,
        hoverBackgroundColor: "rgba(34, 197, 94, 1)",
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
          label: (context: any) => `Propuestas: ${context.raw}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(226, 232, 240, 0.5)",
          borderDash: [2, 4],
        },
        ticks: {
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

  return (
    <ProfessionalMetricsCard
      title="Total de Propuestas"
      subtitle="Propuestas generadas"
      value={metricsData.totalProposals.toLocaleString()}
      icon={BarChart3}
      variant="success"
      trend={{
        value: Math.abs(metricsData.percentageChanges.totalProposals),
        label: "vs período anterior",
        isPositive: metricsData.percentageChanges.totalProposals >= 0
      }}
      chart={chart}
    />
  );
};
