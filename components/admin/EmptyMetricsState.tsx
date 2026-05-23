import { BarChart3 } from "lucide-react";

export const EmptyMetricsState = () => {
  return (
    <div className="text-center py-20">
      <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#0e3a45]/[0.06] flex items-center justify-center">
        <BarChart3 className="w-9 h-9 text-[#0e3a45]/40" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1.5">
        Sin datos para este período
      </h3>
      <p className="text-sm text-gray-400 max-w-xs mx-auto">
        Cambia el rango de fechas o verifica que tus trabajadores hayan enviado propuestas.
      </p>
    </div>
  );
};
