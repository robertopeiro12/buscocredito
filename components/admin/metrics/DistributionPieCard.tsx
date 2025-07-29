import { MetricsCard } from "../MetricsCard";
import { Pie } from "react-chartjs-2";

interface DistributionPieCardProps {
  title: string;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
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
}

export const DistributionPieCard = ({
  title,
  gradientFrom,
  gradientTo,
  textColor,
  data,
  colors,
  chartOptions,
  getTopDistributionItems,
}: DistributionPieCardProps) => {
  return (
    <MetricsCard
      title={title}
      gradientFrom={gradientFrom}
      gradientTo={gradientTo}
      textColor={textColor}
    >
      {Object.keys(data).length > 0 ? (
        <div className="w-full h-full">
          <Pie
            data={{
              labels: getTopDistributionItems(data, 5).map((item) => item.name),
              datasets: [
                {
                  data: getTopDistributionItems(data, 5).map((item) => item.value),
                  backgroundColor: colors.backgroundColor,
                  borderColor: colors.borderColor,
                  borderWidth: 1,
                  hoverOffset: 6,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          No hay datos suficientes
        </div>
      )}
    </MetricsCard>
  );
};
