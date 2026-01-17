import { Button } from "@heroui/react";
import { RefreshCw } from "lucide-react";
import { FallbackProps } from "react-error-boundary";

export const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Algo salió mal
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message ||
            "Ha ocurrido un error inesperado. Por favor, intenta recargar la página."}
        </p>
        <div className="space-y-3">
          <Button
            color="primary"
            className="w-full"
            onPress={resetErrorBoundary}
          >
            Intentar de nuevo
          </Button>
          <Button
            variant="light"
            className="w-full"
            onPress={() => window.location.reload()}
          >
            Recargar página
          </Button>
        </div>
      </div>
    </div>
  );
};
