import React from "react";
import { Card, Chip, CardBody } from "@heroui/react";
import { DollarSign, User } from "lucide-react";
import type {
  LoanRequest,
  PublicUserData,
} from "@/types/entities/business.types";

interface ExtendedPublicUserData extends PublicUserData {
  name?: string;
  lastName?: string;
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
    <Card className="overflow-hidden border border-gray-100 hover:border-[#0e3a45]/20 hover:shadow-md transition-all duration-200">
      <div className="h-1 bg-green-500 w-full" />
      <CardBody className="p-0">
        <div className="p-5 border-b border-gray-100">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
            Solicitud #{index + 1}
          </p>
          <p className="text-3xl font-bold text-[#0e3a45]">
            ${request.amount.toLocaleString("es-MX")}
          </p>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mb-3">
              <DollarSign className="w-3.5 h-3.5" />
              Detalles del Crédito
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Ingresos Mensuales</p>
                <p className="text-sm font-semibold text-gray-800">
                  ${Number(request.income).toLocaleString("es-MX")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Frecuencia de Pago</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">{request.payment}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Plazo</p>
                <p className="text-sm font-semibold text-gray-800">{request.term}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Propósito</p>
                <p className="text-sm font-semibold text-gray-800">{request.purpose || "No especificado"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Tipo</p>
                <p className="text-sm font-semibold text-gray-800">{request.type || "No especificado"}</p>
              </div>
            </div>
          </div>

          {userData?.creditScore && (
            <div className="bg-[#0e3a45]/[0.04] rounded-lg px-3 py-2.5 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Score Crediticio</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0e3a45]">{userData.creditScore.score}</span>
                <Chip
                  size="sm"
                  variant="flat"
                  className={
                    userData.creditScore.classification === "Excelente"
                      ? "bg-emerald-100 text-emerald-800"
                      : userData.creditScore.classification === "Bueno"
                      ? "bg-green-100 text-green-800"
                      : userData.creditScore.classification === "Regular"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {userData.creditScore.classification}
                </Chip>
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mb-3">
              <User className="w-3.5 h-3.5" />
              Solicitante
            </h4>
            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
              {(userData?.name || userData?.lastName) && (
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">Nombre</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {[userData.name, userData.lastName].filter(Boolean).join(" ")}
                  </p>
                </div>
              )}
              {userData?.age && (
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-400">Edad</p>
                  <p className="text-sm font-semibold text-gray-800">{userData.age} años</p>
                </div>
              )}
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">País</p>
                <p className="text-sm font-semibold text-gray-800">{userData?.country || "N/D"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Estado</p>
                <p className="text-sm font-semibold text-gray-800">{userData?.state || "N/D"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Ciudad</p>
                <p className="text-sm font-semibold text-gray-800">{userData?.city || "N/D"}</p>
              </div>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default AdminLoanRequestCard;
