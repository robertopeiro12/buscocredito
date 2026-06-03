import { Button } from "@heroui/react";
import { Calendar, TrendingUp, Download } from "lucide-react";

interface MetricsHeaderProps {
  selectedTimeRange: string;
  setSelectedTimeRange: (range: string) => void;
  handleOpenDateRangeModal: () => void;
  showExports?: boolean;
  onExportProposals?: () => void;
  onExportWorkers?: () => void;
}

export const MetricsHeader = ({
  selectedTimeRange,
  setSelectedTimeRange,
  handleOpenDateRangeModal,
  showExports = false,
  onExportProposals,
  onExportWorkers,
}: MetricsHeaderProps) => {
  const timeRangeOptions = [
    { key: "month", label: "Último mes", icon: Calendar },
    { key: "quarter", label: "Trimestre", icon: TrendingUp },
    { key: "year", label: "Año", icon: TrendingUp },
    { key: "custom", label: "Personalizado", icon: Calendar },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8">
      {/* Period selector */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 flex-shrink-0">
          Período
        </span>
        <div className="bg-gray-50 p-1 rounded-xl border border-gray-200 flex gap-0.5">
          {timeRangeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = selectedTimeRange === option.key;
            const isCustom = option.key === "custom";

            return (
              <Button
                key={option.key}
                size="sm"
                variant={isActive ? "solid" : "light"}
                style={isActive ? { backgroundColor: "#0e3a45" } : undefined}
                className={`font-medium px-3 py-1.5 rounded-lg transition-all duration-150 min-w-0 ${
                  isActive ? "text-white shadow-sm" : "text-gray-500 hover:text-gray-800 hover:bg-white"
                }`}
                startContent={<Icon className="w-3 h-3" />}
                onPress={isCustom ? handleOpenDateRangeModal : () => setSelectedTimeRange(option.key)}
              >
                <span className="hidden sm:inline text-xs">{option.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Export actions */}
      {showExports && (
        <div className="flex items-center gap-2">
          <button
            onClick={onExportProposals}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-[#0e3a45]/40 hover:text-[#0e3a45] hover:bg-[#0e3a45]/[0.04] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Propuestas CSV
          </button>
          <button
            onClick={onExportWorkers}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-gray-600 border border-gray-200 rounded-lg hover:border-[#0e3a45]/40 hover:text-[#0e3a45] hover:bg-[#0e3a45]/[0.04] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Trabajadores CSV
          </button>
        </div>
      )}
    </div>
  );
};
