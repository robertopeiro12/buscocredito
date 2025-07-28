import { Button, Card, CardBody } from "@nextui-org/react";
import { CheckCircle2 } from "lucide-react";
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
    <Card
      className={`w-full ${
        isAccepted ? "border-2 border-green-500" : ""
      }`}
    >
      <CardBody className="p-6">
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div className="flex-col gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-medium text-gray-900">
                  {offer.lender_name}
                </h4>
                {isAccepted && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                    Aceptada
                  </span>
                )}
              </div>
              <div className="flex gap-2 font-bold text-lg">
                <span className="text-black">Pago mensual:</span>
                <span className="font-bold">
                  ${offer.monthly_payment?.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                ${offer.amount?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">
                {offer.interest_rate}% interés
              </p>
            </div>
          </div>

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 gap-6 pt-4 border-t">
            <div className="space-y-4">
              <h5 className="font-medium text-gray-900">
                Información del Préstamo
              </h5>
              <div className="space-y-3">
                {offer.comision !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Comisión:</span>
                    <span className="font-medium">
                      ${offer.comision?.toLocaleString()}
                    </span>
                  </div>
                )}
                {offer.medical_balance !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Seguro de Vida:</span>
                    <span className="font-medium">
                      ${offer.medical_balance?.toLocaleString()}
                    </span>
                  </div>
                )}
                {offer.deadline !== undefined && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Plazo del prestamo:</span>
                    <span className="font-medium">
                      {offer.deadline?.toLocaleString()} meses
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Amortization Table */}
            {offer.amortization &&
              Array.isArray(offer.amortization) &&
              offer.amortization.length > 0 && (
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900">
                    Tabla de Amortización
                  </h5>
                  <div className="max-h-48 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Mes
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Pago
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Capital
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Interés
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                            Saldo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {offer.amortization.map((row, rowIndex) => (
                          <tr key={`${offer.id || index}-amortization-${rowIndex}`}>
                            <td className="px-3 py-2 text-xs text-gray-900">
                              {rowIndex + 1}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-900">
                              ${row.payment?.toLocaleString() ?? 0}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-900">
                              ${row.principal?.toLocaleString() ?? 0}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-900">
                              ${row.interest?.toLocaleString() ?? 0}
                            </td>
                            <td className="px-3 py-2 text-xs text-gray-900">
                              ${row.balance?.toLocaleString() ?? 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>

          {/* Accept Button or Status */}
          <div className="pt-4 border-t">
            <div className="space-y-3">
              {acceptedOfferId ? (
                isAccepted ? (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-2" />
                    <p className="text-sm text-green-700 font-medium">
                      Esta oferta ha sido aceptada. El prestamista se pondrá en
                      contacto contigo.
                    </p>
                  </div>
                ) : null
              ) : (
                <Button
                  color="success"
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium shadow-md"
                  onPress={() => onAcceptOffer(offer, index)}
                  startContent={<CheckCircle2 className="w-4 h-4" />}
                >
                  Aceptar Oferta
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};
