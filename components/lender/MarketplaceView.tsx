import React from 'react';
import { motion } from "framer-motion";
import { Card, Button } from "@nextui-org/react";
import { CreditCard } from "lucide-react";
import LenderFilters from './LenderFilters';
import LoanRequestCard from './LoanRequestCard';
import LoanRequestDetails from "@/components/features/loans/LoanRequestDetails";
import { ProposalForm } from "@/components/features/loans/ProposalForm";
import type { 
  LoanRequest, 
  PublicUserData, 
  LenderFilters as LenderFiltersType 
} from '@/app/lender/types/loan.types';

interface MarketplaceViewProps {
  // Datos
  filteredRequests: LoanRequest[];
  allRequests: LoanRequest[];
  selectedRequest: LoanRequest | null;
  userData: PublicUserData | null;
  userDataMap: Record<string, PublicUserData>;
  loading: boolean;
  
  // Estados UI
  isCreatingOffer: boolean;
  filters: LenderFiltersType;
  
  // Props del proposal form
  proposalData: any;
  submitting: boolean;
  submitError: string | null;
  
  // Funciones
  onFilterChange: (key: keyof LenderFiltersType, value: string) => void;
  onClearFilters: () => void;
  onMakeOffer: (requestId: string) => void;
  onSubmitOffer: () => void;
  onCancelOffer: () => void;
  onBackToMarket: () => void;
  updateProposal: (data: any) => void;
  
  // Datos del partner
  partnerData: {
    company: string;
    name: string;
    company_id: string;
  };
  user: string;
}

const MarketplaceView = ({
  filteredRequests,
  allRequests,
  selectedRequest,
  userData,
  userDataMap,
  loading,
  isCreatingOffer,
  filters,
  proposalData,
  submitting,
  submitError,
  onFilterChange,
  onClearFilters,
  onMakeOffer,
  onSubmitOffer,
  onCancelOffer,
  onBackToMarket,
  updateProposal,
  partnerData,
  user,
}: MarketplaceViewProps) => {
  return (
    <div className="p-8">
      {/* Barra de Filtros y Contador de solicitudes - Solo mostrar cuando no se está creando una oferta */}
      {!isCreatingOffer && (
        <>
          {/* Barra de Filtros */}
          <LenderFilters
            filters={filters}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
          />

          {/* Contador de solicitudes */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
              Solicitudes de Préstamo
            </h2>
            <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
              <span className="text-sm text-gray-600">
                {filteredRequests.length} de {allRequests.length} disponibles
              </span>
            </div>
          </div>
        </>
      )}

      {/* Contenido Principal */}
      {!selectedRequest ? (
        <>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center p-10 bg-white rounded-lg shadow">
              <div className="text-5xl text-gray-300 mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay solicitudes disponibles
              </h3>
              <p className="text-gray-600 mb-6">
                No hay nuevas solicitudes de préstamo en este momento. Vuelve más tarde para ver nuevas oportunidades.
              </p>
            </div>
          ) : (
            /* Grid de solicitudes */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRequests.map((request, index) => (
                <LoanRequestCard
                  key={request.id}
                  request={request}
                  userData={userDataMap[request.userId]}
                  index={index}
                  onMakeOffer={onMakeOffer}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        // Vista de detalles o formulario de propuesta
        <motion.div layout className="max-w-4xl mx-auto">
          {isCreatingOffer ? (
            <ProposalForm
              proposal={proposalData}
              loading={submitting}
              error={submitError}
              onUpdate={updateProposal}
              onSubmit={onSubmitOffer}
              onCancel={onCancelOffer}
            />
          ) : (
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">
                  Detalles de la Solicitud
                </h2>
                <Button
                  variant="light"
                  onClick={onBackToMarket}
                >
                  Volver al mercado
                </Button>
              </div>
              <LoanRequestDetails
                request={selectedRequest}
                userData={userData}
                onMakeOffer={() => {
                  updateProposal({
                    company: partnerData.company,
                    partner: user,
                    amount: selectedRequest?.amount || 0,
                    amortization_frequency: selectedRequest?.payment || "mensual",
                  });
                  onMakeOffer(selectedRequest.id);
                }}
              />
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default MarketplaceView;
