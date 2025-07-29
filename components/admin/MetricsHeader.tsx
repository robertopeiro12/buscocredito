import { Button } from "@nextui-org/react";

interface MetricsHeaderProps {
  selectedTimeRange: string;
  setSelectedTimeRange: (range: string) => void;
  handleOpenDateRangeModal: () => void;
}

export const MetricsHeader = ({
  selectedTimeRange,
  setSelectedTimeRange,
  handleOpenDateRangeModal,
}: MetricsHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-xl font-semibold text-gray-900">
        Métricas de Desempeño
      </h2>
      <div className="bg-gray-50 p-1 rounded-lg shadow-sm border border-gray-100 flex gap-1">
        <Button
          size="sm"
          color={
            selectedTimeRange === "month" ? "primary" : "default"
          }
          variant={selectedTimeRange === "month" ? "solid" : "light"}
          className={`font-medium px-3 py-1 rounded-md transition-all duration-200 ${
            selectedTimeRange === "month" ? "shadow-sm" : ""
          }`}
          onPress={() => setSelectedTimeRange("month")}
        >
          Último mes
        </Button>
        <Button
          size="sm"
          color={
            selectedTimeRange === "quarter" ? "primary" : "default"
          }
          variant={
            selectedTimeRange === "quarter" ? "solid" : "light"
          }
          className={`font-medium px-3 py-1 rounded-md transition-all duration-200 ${
            selectedTimeRange === "quarter" ? "shadow-sm" : ""
          }`}
          onPress={() => setSelectedTimeRange("quarter")}
        >
          Último trimestre
        </Button>
        <Button
          size="sm"
          color={selectedTimeRange === "year" ? "primary" : "default"}
          variant={selectedTimeRange === "year" ? "solid" : "light"}
          className={`font-medium px-3 py-1 rounded-md transition-all duration-200 ${
            selectedTimeRange === "year" ? "shadow-sm" : ""
          }`}
          onPress={() => setSelectedTimeRange("year")}
        >
          Último año
        </Button>
        <Button
          size="sm"
          color={
            selectedTimeRange === "custom" ? "primary" : "default"
          }
          variant={selectedTimeRange === "custom" ? "solid" : "light"}
          className={`font-medium px-3 py-1 rounded-md transition-all duration-200 ${
            selectedTimeRange === "custom" ? "shadow-sm" : ""
          }`}
          onPress={handleOpenDateRangeModal}
        >
          Personalizado
        </Button>
      </div>
    </div>
  );
};
