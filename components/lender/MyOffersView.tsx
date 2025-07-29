import React, { useState } from 'react';
import {
  Button,
  Card,
  Chip,
  CardBody,
} from "@nextui-org/react";
import { User, ChevronRight, CreditCard } from "lucide-react";
import { LenderStats } from "@/components/features/dashboard/LenderStats";
import { MarketplacePagination } from "@/components/features/dashboard/MarketplacePagination";
import { LenderLoadingSkeletons } from "@/components/features/dashboard/LenderLoadingSkeletons";
import type { LenderProposal } from '@/app/lender/types/loan.types';

interface MyOffersViewProps {
  lenderProposals: LenderProposal[];
  loadingProposals: boolean;
  onGoToMarketplace: () => void;
  // Datos adicionales para stats
  allRequests?: any[];
}

const MyOffersView = ({ 
  lenderProposals, 
  loadingProposals, 
  onGoToMarketplace,
  allRequests = []
}: MyOffersViewProps) => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 9 ofertas por página
  
  // Pagination logic
  const totalPages = Math.ceil(lenderProposals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOffers = lenderProposals.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "accepted":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "accepted":
        return "Aceptada";
      case "rejected":
        return "Rechazada";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Mis Ofertas</h1>
          <p className="text-gray-600">
            Gestiona y monitorea el estado de tus propuestas enviadas
          </p>
        </div>
        {lenderProposals.length > 0 && (
          <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <span className="text-sm text-gray-600">
              {lenderProposals.length} propuestas enviadas
            </span>
          </div>
        )}
      </div>

      {loadingProposals ? (
        <LenderLoadingSkeletons.OffersGrid />
      ) : lenderProposals.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
            <CreditCard className="w-12 h-12 text-green-600" />
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-3">
            No has enviado propuestas
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Cuando envíes propuestas a los solicitantes, aparecerán aquí.
            ¡Empieza a explorar el mercado de oportunidades!
          </p>
          <Button
            color="success"
            size="md"
            startContent={<ChevronRight className="w-4 h-4" />}
            onClick={onGoToMarketplace}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200"
          >
            Explorar Mercado
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {currentOffers.map((proposal) => (
              <Card key={proposal.id} className="shadow-md hover:shadow-lg transition-shadow duration-200">
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {proposal.requestInfo?.purpose || "Sin propósito"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {proposal.requestInfo?.type || "Préstamo"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-semibold text-green-600 mb-2">
                        ${proposal.amount?.toLocaleString()}
                      </span>
                      <Chip
                        className={`text-white text-sm ${getStatusColor(proposal.status)}`}
                      >
                        {getStatusText(proposal.status)}
                      </Chip>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        Tasa de interés:
                      </span>
                      <span className="font-medium">
                        {proposal.interest_rate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        Plazo del préstamo:
                      </span>
                      <span className="font-medium">
                        {proposal.deadline} meses
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        Fecha de propuesta:
                      </span>
                      <span className="font-medium">
                        {proposal.createdAt ? 
                          (typeof proposal.createdAt === 'object' && 'seconds' in proposal.createdAt ?
                            new Date((proposal.createdAt as any).seconds * 1000).toLocaleDateString() :
                            new Date(proposal.createdAt as string).toLocaleDateString()
                          ) : 
                          "No disponible"
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        Amortización:
                      </span>
                      <span className="font-medium">
                        ${proposal.amortization?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        Comisión:
                      </span>
                      <span className="font-medium">
                        ${proposal.comision?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {(proposal as any).message && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 italic">
                        "{(proposal as any).message}"
                      </p>
                    </div>
                  )}

                  {/* Datos de contacto para propuestas aceptadas */}
                  {proposal.status === "accepted" && proposal.contactInfo && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="font-semibold text-green-700 mb-3 flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        Datos de Contacto
                      </h4>
                      <div className="space-y-2 bg-green-50 p-3 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Nombre:</span>
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
    </div>
  );
};

export default MyOffersView;
