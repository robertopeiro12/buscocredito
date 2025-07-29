import { MetricsCard } from "../MetricsCard";
import { Bar } from "react-chartjs-2";

interface MetricsData {
  averageInterestRate: number;
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

interface InterestRateCardProps {
  metricsData: MetricsData;
  getMonthName: (monthNumber: number, year?: number) => string;
}

export const InterestRateCard = ({
  metricsData,
  getMonthName,
}: InterestRateCardProps) => {
  return (
    <MetricsCard
      title="Tasa de Interés Promedio"
      gradientFrom="from-teal-50"
      gradientTo="to-lime-50"
      textColor="text-teal-800"
    >
      <div className="text-4xl font-bold text-teal-600 text-center mb-2">
        {metricsData.averageInterestRate.toFixed(2)}%
      </div>
      <div className="text-sm text-center mb-4">
        <span
          className={`font-medium ${
            metricsData.percentageChanges.averageInterestRate > 0
              ? "text-red-500"
              : "text-green-500"
          }`}
        >
          {metricsData.percentageChanges.averageInterestRate > 0 ? "+" : ""}
          {metricsData.percentageChanges.averageInterestRate.toFixed(1)}%
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
                label: "Tasa Promedio (%)",
                data: Object.entries(metricsData.monthlyData)
                  .sort((a, b) => {
                    const [month1, year1] = a[0].split("-").map(Number);
                    const [month2, year2] = b[0].split("-").map(Number);
                    return year1 * 12 + month1 - (year2 * 12 + month2);
                  })
                  .map(([_, data]) => {
                    if (data.proposals > 0) {
                      // Usar el valor exacto del promedio en vez de uno aleatorio
                      return metricsData.averageInterestRate;
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
                suggestedMax: Math.max(metricsData.averageInterestRate * 1.5, 5),
                ticks: {
                  callback: (value: any) => {
                    return value.toFixed(2) + "%";
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
                    return `Tasa: ${context.raw.toFixed(2)}%`;
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
