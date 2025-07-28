import { Button, Card, CardBody, CardFooter, Progress } from "@nextui-org/react";
import { ChevronRight } from "lucide-react";
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
  return (
    <Card className="bg-white">
      <CardBody className="p-6">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {solicitud.purpose}
              </h3>
              <p className="text-sm text-gray-500">{solicitud.type}</p>
            </div>
            <span className="text-lg font-semibold text-green-600">
              ${solicitud.amount.toLocaleString()}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Plazo</span>
              <span className="text-gray-900">{solicitud.term}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Forma de Pago</span>
              <span className="text-gray-900">{solicitud.payment}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ingresos Anuales Comprobables</span>
              <span className="text-gray-900">
                ${solicitud.income.toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">
                Ofertas disponibles
              </span>
              <span className="text-sm text-gray-500">
                {offerCount} ofertas
              </span>
            </div>
            <Progress
              value={offerCount ? offerCount * 20 : 0}
              className="h-2"
              color="success"
            />
          </div>
        </div>
      </CardBody>
      
      <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex justify-between w-full">
          <Button
            color="danger"
            variant="light"
            onPress={() => onDelete(solicitud)}
          >
            Eliminar
          </Button>
          <Button
            color="primary"
            variant="flat"
            endContent={<ChevronRight className="w-4 h-4" />}
            onPress={() => onViewOffers(solicitud.id)}
          >
            Ver Ofertas
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
