import React from "react";
import { Card, Chip, CardBody } from "@nextui-org/react";
import { DollarSign, Target, User, Eye } from "lucide-react";
import type {
  LoanRequest,
  PublicUserData,
} from "@/types/entities/business.types";

// Extender el tipo para incluir campos adicionales que puede tener el admin
interface ExtendedPublicUserData extends PublicUserData {
  first_name?: string;
  last_name?: string;
  age?: number;
  location?: string;
}

interface AdminLoanRequestCardProps {
  request: LoanRequest;
  userData: ExtendedPublicUserData | undefined;
  index: number;
}

const AdminLoanRequestCard = ({
  request,
  userData,
  index,
}: AdminLoanRequestCardProps) => {
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
                <p className="font-medium text-gray-800">{request.type}</p>
              </div>
            </div>
          </div>

          {/* Información del solicitante */}
          {userData && (
            <div className="mb-4">
              <h4 className="text-md font-semibold mb-3 flex items-center border-b border-gray-100 pb-2 text-gray-700">
                <User className="h-4 w-4 text-gray-500 mr-2" />
                Información del Solicitante
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {userData.first_name && (
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium text-gray-800">
                      {userData.first_name} {userData.last_name || ""}
                    </p>
                  </div>
                )}
                {userData.age && (
                  <div>
                    <p className="text-sm text-gray-500">Edad</p>
                    <p className="font-medium text-gray-800">
                      {userData.age} años
                    </p>
                  </div>
                )}
                {(userData.city || userData.state || userData.country) && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Ubicación</p>
                    <p className="font-medium text-gray-800">
                      {[userData.city, userData.state, userData.country]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Indicador de solo lectura */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-green-600" />
              <p className="text-sm text-green-700 font-medium">
                Vista de solo lectura - Monitoreo administrativo
              </p>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AdminLoanRequestCard;
