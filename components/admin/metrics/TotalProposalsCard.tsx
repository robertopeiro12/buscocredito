import { MetricsCard } from "../MetricsCard";
import { Bar } from "react-chartjs-2";

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
  return (
    <MetricsCard
      title="Total de Propuestas"
      gradientFrom="from-green-50"
      gradientTo="to-emerald-50"
      textColor="text-green-800"
    >
      <div className="mb-4 text-5xl font-bold text-green-600 transition-all duration-500 ease-in-out">
        {metricsData.totalProposals}
      </div>
      <div
        className={`text-sm font-medium ${
          metricsData.percentageChanges.totalProposals >= 0
            ? "text-green-600"
            : "text-red-500"
        } flex items-center gap-1 mb-4`}
      >
        {metricsData.percentageChanges.totalProposals >= 0 ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0L12 8.414l-3.293 3.293a1 1 0 01-1.414 0V13z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {metricsData.percentageChanges.totalProposals > 0 ? "+" : ""}
        {metricsData.percentageChanges.totalProposals.toFixed(0)}
        % respecto al período anterior
      </div>
      <div className="mt-2 w-full h-36">
        {Object.keys(metricsData.monthlyData).length > 0 && (
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
                  label: "Propuestas",
                  data: Object.entries(metricsData.monthlyData)
                    .sort((a, b) => {
                      const [month1, year1] = a[0].split("-").map(Number);
                      const [month2, year2] = b[0].split("-").map(Number);
                      return year1 * 12 + month1 - (year2 * 12 + month2);
                    })
                    .map(([_, data]) => data.proposals),
                  backgroundColor: "rgba(16, 185, 129, 0.8)",
                  borderColor: "rgb(5, 150, 105)",
                  borderWidth: 1,
                  borderRadius: 6,
                  hoverBackgroundColor: "rgba(16, 185, 129, 1)",
                },
              ],
            }}
            options={{
              ...metricsData.chartOptions?.bar,
              scales: {
                y: {
                  beginAtZero: true,
                  suggestedMax: Math.max(metricsData.totalProposals * 1.5, 5),
                  ticks: {
                    callback: (value: any) => {
                      return value.toFixed(0);
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
                  ...metricsData.chartOptions?.bar?.plugins?.tooltip,
                  callbacks: {
                    label: (context: any) => {
                      return `Propuestas: ${context.raw.toFixed(0)}`;
                    },
                  },
                },
              },
            }}
          />
        )}
      </div>
    </MetricsCard>
  );
};
