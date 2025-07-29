import { BarChart3, Calendar, TrendingUp } from "lucide-react";

export const EmptyMetricsState = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12">
      <div className="flex flex-col justify-center items-center text-center max-w-md mx-auto">
        {/* Icon Stack */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-pulse"></div>
          <div className="relative p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg">
            <BarChart3 className="h-12 w-12 text-white" />
          </div>
          {/* Floating elements */}
          <div className="absolute -top-2 -right-2 p-2 bg-green-500 rounded-full shadow-md animate-bounce">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <div className="absolute -bottom-2 -left-2 p-2 bg-purple-500 rounded-full shadow-md animate-bounce" style={{ animationDelay: '0.5s' }}>
            <Calendar className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">
            No hay datos disponibles
          </h3>
          <p className="text-gray-500 leading-relaxed">
            No se encontraron propuestas en el período seleccionado.
            Las métricas se mostrarán cuando haya datos disponibles.
          </p>
          
          {/* Suggestions */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">
              Sugerencias:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• Cambia el rango de fechas</li>
              <li>• Verifica que tus trabajadores hayan creado propuestas</li>
              <li>• Revisa la configuración de filtros</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
