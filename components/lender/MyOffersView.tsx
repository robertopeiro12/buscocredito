import React from 'react';
import {
  Button,
  Card,
  Chip,
  CardBody,
} from "@nextui-org/react";
import { User } from "lucide-react";
import type { LenderProposal } from '@/app/lender/types/loan.types';

interface MyOffersViewProps {
  lenderProposals: LenderProposal[];
  loadingProposals: boolean;
  onGoToMarketplace: () => void;
}

const MyOffersView = ({ 
  lenderProposals, 
  loadingProposals, 
  onGoToMarketplace 
}: MyOffersViewProps) => {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Ofertas</h1>
      </div>

      {loadingProposals ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
        </div>
      ) : lenderProposals.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-lg shadow">
          <div className="text-5xl text-gray-300 mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No has enviado propuestas
          </h3>
          <p className="text-gray-600 mb-6">
            Cuando envíes propuestas a los solicitantes, aparecerán aquí.
          </p>
          <Button
            color="success"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onGoToMarketplace}
          >
            Ir al mercado
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {lenderProposals.map((proposal) => (
            <Card key={proposal.id} className="shadow-md">
              <CardBody className="p-6">
                <div className="flex justify-between items-start mb-4 ">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {proposal.requestInfo?.purpose || "Sin propósito"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {proposal.requestInfo?.type || "Préstamo"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-semibold text-green-600">
                      ${proposal.amount?.toLocaleString()}
                    </span>
                    <Chip
                      className={`text-white text-sm ${
                        proposal.status === "pending"
                          ? "bg-gray-500"
                          : proposal.status === "accepted"
                          ? "bg-green-500"
                          : "bg-red-500"
                      }`}
                    >
                      {proposal.status === "pending"
                        ? "Pendiente"
                        : proposal.status === "accepted"
                        ? "Aceptada"
                        : "Rechazada"}
                    </Chip>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">
                      Tasa de interés:
                    </span>
                    <span className="font-medium">
                      {proposal.interest_rate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">
                      Plazo del prestamo:
                    </span>
                    <span className="font-medium">
                      {proposal.deadline} meses
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Amortizacion:</span>
                    <span className="font-medium">
                      ${proposal.amortization}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">
                      Frequencia de pago:
                    </span>
                    <span className="font-medium">
                      {proposal.amortization_frequency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Comision:</span>
                    <span className="font-medium">
                      ${proposal.comision}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Seguro de vida:</span>
                    <span className="font-medium">
                      ${proposal.medical_balance}
                    </span>
                  </div>
                </div>

                {/* Datos de contacto para propuestas aceptadas */}
                {proposal.status === "accepted" && proposal.contactInfo && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Datos de Contacto
                    </h4>
                    <div className="space-y-2 bg-green-50 p-3 rounded-md">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Nombre completo:</span>
                        <span className="font-medium text-gray-800">
                          {proposal.contactInfo.fullName || "No disponible"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium text-gray-800">
                          {proposal.contactInfo.email || "No disponible"}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Teléfono:</span>
                        <span className="font-medium text-gray-800">
                          {proposal.contactInfo.phone || "No disponible"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOffersView;
