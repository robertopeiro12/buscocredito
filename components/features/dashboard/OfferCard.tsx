import { Button, Card, CardBody, Chip } from "@nextui-org/react";
import { CheckCircle2, Building } from "lucide-react";
import { Offer } from "@/types/dashboard";

interface OfferCardProps {
  offer: Offer;
  index: number;
  acceptedOfferId: string | null;
  onAcceptOffer: (offer: Offer, index: number) => void;
}

export const OfferCard = ({ 
  offer, 
  index, 
  acceptedOfferId, 
  onAcceptOffer 
}: OfferCardProps) => {
  const isAccepted = acceptedOfferId === offer.id;

  return (
    <Card className={`w-full bg-white border ${isAccepted ? "border-green-500 bg-green-50" : "border-gray-200"}`}>
      <CardBody className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <Building className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  {offer.lender_name}
                </h4>
                <p className="text-sm text-gray-600">Prestamista</p>
              </div>
            </div>
            {isAccepted && (
              <Chip color="success" variant="solid" size="sm">
                Propuesta Aceptada
              </Chip>
            )}
          </div>

          {/* Información de la Propuesta */}
          <div>
            <h5 className="text-lg font-semibold text-gray-900 mb-4">
              Información de la Propuesta
            </h5>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Cantidad que te prestan:</span>
                <span className="font-semibold text-gray-900">
                  ${offer.amount?.toLocaleString()}
                </span>
              </div>
              
              {offer.comision !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Comisión:</span>
                  <span className="font-semibold text-gray-900">
                    ${offer.comision?.toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between">
                <span className="text-gray-600">Compañía:</span>
                <span className="font-semibold text-gray-900">
                  {offer.lender_name}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Tasa de interés:</span>
                <span className="font-semibold text-gray-900">
                  {offer.interest_rate}% anual
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Plazo:</span>
                <span className="font-semibold text-gray-900">
                  {offer.deadline} meses
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Frecuencia de pago:</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {offer.amortization_frequency}
                </span>
              </div>
              
              {offer.medical_balance !== undefined && offer.medical_balance > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Seguro médico:</span>
                  <span className="font-semibold text-gray-900">
                    ${offer.medical_balance?.toLocaleString()}
                  </span>
                </div>
              )}
              
              {offer.requestInfo?.type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo de préstamo:</span>
                  <span className="font-semibold text-gray-900">
                    {offer.requestInfo.type}
                  </span>
                </div>
              )}
              
              {offer.requestInfo?.purpose && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Propósito:</span>
                  <span className="font-semibold text-gray-900">
                    {offer.requestInfo.purpose}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Información de pago */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900 font-medium">
              Pagarás <span className="font-bold text-green-600">
                ${offer.monthly_payment?.toLocaleString()}
              </span> de forma <span className="font-bold capitalize">
                {offer.amortization_frequency}
              </span> durante{" "}
              <span className="font-bold">{offer.deadline} meses</span>
            </p>
          </div>

          {/* Botón de acción */}
          <div>
            {isAccepted ? (
              <div className="bg-green-100 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-green-700 font-medium">
                  Has aceptado esta propuesta. El prestamista se pondrá en contacto contigo.
                </p>
              </div>
            ) : (
              <Button
                color="success"
                size="lg"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
                onPress={() => onAcceptOffer(offer, index)}
                startContent={<CheckCircle2 className="w-5 h-5" />}
              >
                Aceptar Propuesta
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
