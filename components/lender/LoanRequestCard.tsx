import React from "react";
import { Button, Card, Chip, CardBody } from "@nextui-org/react";
import { DollarSign, Target, User } from "lucide-react";
import type {
  LoanRequest,
  PublicUserData,
} from "@/app/lender/types/loan.types";

interface LoanRequestCardProps {
  request: LoanRequest;
  userData: PublicUserData | undefined;
  index: number;
  onMakeOffer: (requestId: string) => void;
}

const LoanRequestCard = ({
  request,
  userData,
  index,
  onMakeOffer,
}: LoanRequestCardProps) => {
  return (
    <Card
      key={request.id}
      className="overflow-hidden shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-200"
    >
      {/* Encabezado de la tarjeta */}
      <CardBody className="p-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-700">
              Solicitud #{index + 1}
            </h3>
          </div>
          <p className="text-3xl font-bold mt-2 text-green-600">
            ${request.amount.toLocaleString()}
          </p>
        </div>

        <div className="p-5">
          {/* Detalles de la solicitud */}
          <div className="mb-6">
            <h4 className="text-md font-semibold mb-3 flex items-center border-b border-gray-100 pb-2 text-gray-700">
              <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
              Detalles de la Solicitud
            </h4>

            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-sm text-gray-500">Monto Solicitado</p>
                <p className="font-medium text-gray-800">
                  ${request.amount.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  Ingresos Mensuales Comprobables
                </p>
                <p className="font-medium text-gray-800">
                  ${request.income.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Frecuencia de Pago</p>
                <p className="font-medium text-gray-800 capitalize">
                  {request.payment}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Plazo</p>
                <p className="font-medium text-gray-800">{request.term}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Propósito</p>
                <p className="font-medium text-gray-800">
                  {request.purpose || "No especificado"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Tipo</p>
                <p className="font-medium text-gray-800">
                  {request.type || "No especificado"}
                </p>
              </div>

              {userData?.creditScore && (
                <div>
                  <p className="text-sm text-gray-500">Score Crediticio</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium text-gray-800">
                      {userData.creditScore.score}
                    </p>
                    <Chip
                      size="sm"
                      className={`${
                        userData.creditScore.classification === "Excelente"
                          ? "bg-emerald-100 text-emerald-800"
                          : userData.creditScore.classification === "Bueno"
                          ? "bg-green-100 text-green-800"
                          : userData.creditScore.classification === "Regular"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                      variant="flat"
                    >
                      {userData.creditScore.classification}
                    </Chip>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información del solicitante */}
          <div className="mb-5">
            <h4 className="text-md font-semibold mb-3 flex items-center border-b border-gray-100 pb-2 text-gray-700">
              <User className="h-4 w-4 text-gray-500 mr-2" />
              Información del Solicitante
            </h4>

            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
              <div>
                <p className="text-sm text-gray-500">País</p>
                <p className="font-medium text-gray-800">
                  {userData?.country || "No disponible"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Estado</p>
                <p className="font-medium text-gray-800">
                  {userData?.state || "No disponible"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Ciudad</p>
                <p className="font-medium text-gray-800">
                  {userData?.city || "No disponible"}
                </p>
              </div>
            </div>
          </div>

          {/* Botón de acción */}
          <Button
            color="success"
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={() => onMakeOffer(request.id)}
          >
            <Target className="h-4 w-4 mr-2" />
            Hacer Oferta
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default LoanRequestCard;
