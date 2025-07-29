import { MetricsCard } from "../MetricsCard";
import { Bar } from "react-chartjs-2";

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
  return (
    <MetricsCard
      title="Monto Promedio de Propuestas"
      gradientFrom="from-pink-50"
      gradientTo="to-rose-50"
      textColor="text-pink-800"
    >
      <div className="mb-2 text-4xl font-bold text-pink-600 text-center">
        $
        {metricsData.averageAmount.toLocaleString("es-MX", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}{" "}
        MXN
      </div>
      <div className="text-sm text-center mb-4">
        <span
          className={`font-medium ${
            metricsData.percentageChanges.averageAmount > 0
              ? "text-green-500"
              : "text-red-500"
          }`}
        >
          {metricsData.percentageChanges.averageAmount > 0 ? "+" : ""}
          {metricsData.percentageChanges.averageAmount.toFixed(1)}%
        </span>
        <span className="text-gray-500"> respecto al período anterior</span>
      </div>
      <div className="flex-1 w-full">
        <Bar
          data={{
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
                      // Usar el valor exacto del promedio en vez de uno aleatorio
                      return metricsData.averageAmount;
                    }
                    return 0;
                  }),
                backgroundColor: "rgba(14, 165, 233, 0.8)",
                borderColor: "rgb(3, 105, 161)",
                borderWidth: 1,
                borderRadius: 6,
              },
            ],
          }}
          options={{
            ...metricsData.chartOptions?.bar,
            scales: {
              y: {
                beginAtZero: true,
                suggestedMax: Math.max(metricsData.averageAmount * 1.5, 5),
                ticks: {
                  callback: (value: any) => {
                    return `$${value.toLocaleString("es-MX")}`;
                  },
                  font: {
                    size: 12,
                    weight: "500",
                    family: "'Inter', sans-serif",
                  },
                  color: "#64748b",
                },
                grid: {
                  color: "rgba(226, 232, 240, 0.7)",
                  borderDash: [3, 3],
                },
              },
              x: metricsData.chartOptions?.bar?.scales?.x,
            },
            plugins: {
              ...metricsData.chartOptions?.bar?.plugins,
              tooltip: {
                callbacks: {
                  label: (context: any) => {
                    return `Monto: $${context.raw.toLocaleString("es-MX")}`;
                  },
                },
              },
            },
          }}
        />
      </div>
    </MetricsCard>
  );
};
