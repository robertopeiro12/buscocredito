// components/lender/LoanRequestDetails.tsx
"use client";

import { motion } from "framer-motion";
import { MapPin, DollarSign, Target, User, AlertCircle } from "lucide-react";
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

  // Check if the loan has already been accepted
  const isAccepted = request.status === 'approved' || !!request.acceptedOfferId;

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
        {isAccepted && (
          <div className="mt-2 bg-yellow-50 text-yellow-700 p-3 rounded-md flex items-center text-sm">
            <AlertCircle className="h-4 w-4 mr-2" />
            Esta solicitud ya ha sido aceptada por otro prestamista.
          </div>
        )}
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
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <p className="font-medium capitalize">
              {isAccepted ? (
                <span className="text-green-600">Aceptada</span>
              ) : (
                <span>{request.status}</span>
              )}
            </p>
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
            <p className="font-medium">{userData.country}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estado</p>
            <p className="font-medium">{userData.state}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Ciudad</p>
            <p className="font-medium">{userData.city}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Propósito</p>
            <p className="font-medium">{userData.purpose}</p>
          </div>
        </div>
      </div>

      {/* Botón de Hacer Oferta */}
      <div>
        {isAccepted ? (
          <button 
            disabled
            className="w-full py-3 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed flex items-center justify-center font-medium"
          >
            <AlertCircle className="h-5 w-5 mr-2" />
            Préstamo Ya Aceptado
          </button>
        ) : (
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
        )}
      </div>
    </motion.div>
  );
}
