import { Button } from "@heroui/react";
import { BarChart3, Calendar, TrendingUp } from "lucide-react";

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
  const timeRangeOptions = [
    { key: "month", label: "Último mes", icon: Calendar },
    { key: "quarter", label: "Trimestre", icon: TrendingUp },
    { key: "year", label: "Año", icon: BarChart3 },
    { key: "custom", label: "Personalizado", icon: Calendar },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title Section */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Métricas de Desempeño
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Análisis detallado de propuestas y rendimiento
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 mr-2">Período:</span>
          <div className="bg-gray-50 p-1 rounded-lg border border-gray-200 flex gap-1">
            {timeRangeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = selectedTimeRange === option.key;
              const isCustom = option.key === "custom";
              
              return (
                <Button
                  key={option.key}
                  size="sm"
                  variant={isActive ? "solid" : "light"}
                  color={isActive ? "primary" : "default"}
                  className={`
                    font-medium px-3 py-2 rounded-md transition-all duration-200 min-w-0
                    ${isActive ? "shadow-sm text-white" : "text-gray-600 hover:text-gray-900"}
                  `}
                  startContent={<Icon className="w-3.5 h-3.5" />}
                  onPress={isCustom ? handleOpenDateRangeModal : () => setSelectedTimeRange(option.key)}
                >
                  <span className="hidden sm:inline">{option.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
