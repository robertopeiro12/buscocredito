// components/lender/LoanRequestDetails.tsx
"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Target, User } from "lucide-react";
import type {
  LoanRequest,
  PublicUserData,
} from "@/app/lender/types/loan.types";

interface LoanRequestDetailsProps {
  request: LoanRequest | null;
  userData: PublicUserData | null;
  onMakeOffer: () => void;
}

export default function LoanRequestDetails({
  request,
  userData,
  onMakeOffer,
}: LoanRequestDetailsProps) {
  if (!request || !userData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-lg shadow-md p-8 text-center h-[400px] flex flex-col items-center justify-center"
      >
        <User className="h-12 w-12 text-gray-400 mb-4" />
        <p className="text-gray-500">
          Selecciona una solicitud para ver los detalles
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      {/* Encabezado */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-semibold">Detalles de la Solicitud</h2>
      </div>

      {/* Información del Préstamo */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <DollarSign className="h-5 w-5 text-[#2EA043] mr-2" />
          <h3 className="text-lg font-medium">Detalles del Préstamo</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">Monto Solicitado</p>
            <p className="font-medium text-lg">
              ${request.amount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ingresos Declarados</p>
            <p className="font-medium text-lg">
              ${request.income.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Plazo</p>
            <p className="font-medium">{request.term}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Forma de Pago</p>
            <p className="font-medium capitalize">{request.payment}</p>
          </div>
        </div>
      </div>

      {/* Información del Solicitante */}
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <MapPin className="h-5 w-5 text-[#2EA043] mr-2" />
          <h3 className="text-lg font-medium">Ubicación del Solicitante</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-500">País</p>
            <p className="font-medium">{userData.country || "No disponible"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <p className="font-medium">{userData.state || "No disponible"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ciudad</p>
            <p className="font-medium">{userData.city || "No disponible"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Propósito</p>
            <p className="font-medium">
              {userData.purpose || "No especificado"}
            </p>
          </div>
        </div>
      </div>

      {/* Botón de Hacer Oferta */}
      <div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onMakeOffer}
          className="w-full py-3 bg-[#2EA043] text-white rounded-lg hover:bg-[#2EA043]/90
           transition-colors flex items-center justify-center font-medium"
        >
          <Target className="h-5 w-5 mr-2" />
          Hacer Oferta
        </motion.button>
      </div>
    </motion.div>
  );
}
