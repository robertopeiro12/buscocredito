import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Card, Button } from "@heroui/react";
import { CreditCard, ChevronRight, Store } from "lucide-react";
import LenderFilters from './LenderFilters';
import LoanRequestCard from './LoanRequestCard';
import LoanRequestDetails from "@/components/features/loans/LoanRequestDetails";
import { ProposalForm } from "@/components/features/loans/ProposalForm";
import { LenderStats } from "@/components/features/dashboard/LenderStats";
import { MarketplacePagination } from "@/components/features/dashboard/MarketplacePagination";
import { LenderLoadingSkeletons } from "@/components/features/dashboard/LenderLoadingSkeletons";
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
  
  // Datos adicionales para stats
  lenderProposals?: any[];
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
  lenderProposals = [],
}: MarketplaceViewProps) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 solicitudes por página
  
  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <LenderFilters
        filters={filters}
        onFilterChange={onFilterChange}
        onClearFilters={onClearFilters}
      />

      {loading ? (
        <LenderLoadingSkeletons.MarketplaceGrid />
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
            <Store className="w-12 h-12 text-blue-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            {allRequests.length === 0 ? "No hay solicitudes disponibles" : "No se encontraron solicitudes"}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {allRequests.length === 0 
              ? "Aún no hay solicitudes de préstamo disponibles. Las nuevas solicitudes aparecerán aquí."
              : "Intenta ajustar los filtros para encontrar solicitudes que coincidan con tus criterios."}
          </p>
          {allRequests.length > 0 && (
            <Button
              color="primary"
              size="md"
              onClick={onClearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2"
            >
              Limpiar Filtros
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
            {currentRequests.map((request, index) => (
              <LoanRequestCard
                key={request.id}
                request={request}
                index={index}
                userData={userDataMap[request.userId]}
                onMakeOffer={() => onMakeOffer(request.id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6">
              <MarketplacePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Offer Modal */}
      {isCreatingOffer && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ProposalForm
              proposal={proposalData}
              loading={submitting}
              error={submitError}
              onUpdate={updateProposal}
              onSubmit={onSubmitOffer}
              onCancel={onCancelOffer}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketplaceView;
