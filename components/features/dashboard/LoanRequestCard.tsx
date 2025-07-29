import { Button, Card, CardBody, CardFooter, Progress, Chip } from "@nextui-org/react";
import { ChevronRight, TrendingUp, Calendar, CreditCard, DollarSign, Eye, Trash2 } from "lucide-react";
import { SolicitudData } from "@/types/dashboard";

interface LoanRequestCardProps {
  solicitud: SolicitudData;
  offerCount: number;
  onViewOffers: (solicitudId: string) => void;
  onDelete: (solicitud: SolicitudData) => void;
}

export const LoanRequestCard = ({ 
  solicitud, 
  offerCount, 
  onViewOffers, 
  onDelete 
}: LoanRequestCardProps) => {
  const getStatusColor = () => {
    if (offerCount === 0) return "default";
    if (offerCount < 3) return "warning";
    return "success";
  };

  const getStatusText = () => {
    if (offerCount === 0) return "Sin propuestas";
    if (offerCount === 1) return "1 propuesta";
    return `${offerCount} propuestas`;
  };

  return (
    <Card className="bg-white hover:shadow-lg transition-all duration-300 border border-gray-200">
      <CardBody className="p-8">
        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {solicitud.purpose}
              </h3>
              <p className="text-sm text-gray-600 mb-4">{solicitud.type}</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-green-600">
                ${solicitud.amount.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Plazo:</span>
                <span className="font-semibold text-gray-900">{solicitud.term}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Pago:</span>
                <span className="font-semibold text-gray-900">{solicitud.payment}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-medium">Ingresos anuales:</span>
                <span className="font-semibold text-gray-900">
                  ${solicitud.income.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">
                Interés de prestamistas
              </span>
              <Chip 
                color={getStatusColor()} 
                variant="flat" 
                size="md"
                className="font-semibold"
              >
                {getStatusText()}
              </Chip>
            </div>
            <Progress
              value={offerCount > 0 ? Math.min((offerCount / 3) * 100, 100) : 0}
              className="h-3"
              color="success"
            />
            <p className="text-xs text-gray-500 mt-2">
              {offerCount === 0 
                ? "Esperando propuestas de prestamistas" 
                : "Propuestas recibidas"
              }
            </p>
          </div>
        </div>
      </CardBody>
      
      <CardFooter className="px-8 py-6 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between w-full gap-4">
          <Button
            color="danger"
            variant="light"
            size="md"
            startContent={<Trash2 className="w-4 h-4" />}
            onPress={() => onDelete(solicitud)}
            className="text-red-600 hover:bg-red-50 flex-1"
          >
            Eliminar
          </Button>
          <Button
            color="success"
            variant="solid"
            size="md"
            endContent={<Eye className="w-4 h-4" />}
            onPress={() => onViewOffers(solicitud.id)}
            className="bg-green-600 hover:bg-green-700 text-white flex-1"
            isDisabled={offerCount === 0}
          >
            {offerCount === 0 ? "Sin propuestas" : "Ver Propuestas"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
