import React, { useState } from "react";
import { Button, Card, Chip, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Tooltip } from "@heroui/react";
import { User, ChevronRight, CreditCard, Eye, Info, X } from "lucide-react";
import { LenderStats } from "@/components/features/dashboard/LenderStats";
import { MarketplacePagination } from "@/components/features/dashboard/MarketplacePagination";
import { LenderLoadingSkeletons } from "@/components/features/dashboard/LenderLoadingSkeletons";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import type { LenderProposal } from "@/app/lender/types/loan.types";

interface WinningOffer {
  amount?: number;
  interestRate?: number;
  amortizationFrequency?: string;
  amortization?: number;
  term?: number;
  comision?: number;
  medicalBalance?: number;
}

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
  allRequests = [],
}: MyOffersViewProps) => {
  // Winning offer modal state
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [winningOffer, setWinningOffer] = useState<WinningOffer | null>(null);
  const [loadingReason, setLoadingReason] = useState(false);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);

  const fetchWinningOffer = async (proposal: LenderProposal) => {
    const loanId = proposal.loanId;
    if (!loanId) return;

    setLoadingReason(true);
    setSelectedProposalId(proposal.id);
    setShowReasonModal(true);

    try {
      const db = getFirestore();
      const proposalsRef = collection(db, "propuestas");
      const q = query(proposalsRef, where("loanId", "==", loanId), where("status", "==", "accepted"));
      const snapshot = await getDocs(q);

      let accepted: any = null;
      snapshot.forEach((docSnap) => {
        accepted = docSnap.data();
      });

      // Also try solicitudId for legacy data
      if (!accepted) {
        const legacyQ = query(proposalsRef, where("solicitudId", "==", loanId), where("status", "==", "accepted"));
        const legacySnapshot = await getDocs(legacyQ);
        legacySnapshot.forEach((docSnap) => {
          accepted = docSnap.data();
        });
      }

      if (accepted) {
        setWinningOffer({
          amount: accepted.amount,
          interestRate: accepted.interestRate,
          amortizationFrequency: accepted.amortizationFrequency,
          amortization: accepted.amortization,
          term: accepted.deadline,
          comision: accepted.comision,
          medicalBalance: accepted.medicalBalance,
        });
      } else {
        setWinningOffer(null);
      }
    } catch (error) {
      console.error("Error fetching winning offer:", error);
      setWinningOffer(null);
    } finally {
      setLoadingReason(false);
    }
  };

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
              <Card
                key={proposal.id}
                className="shadow-md hover:shadow-lg transition-shadow duration-200"
              >
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
                        className={`text-white text-sm ${getStatusColor(
                          proposal.status
                        )}`}
                      >
                        {getStatusText(proposal.status)}
                      </Chip>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        Monto:
                      </span>
                      <span className="font-medium">
                        ${proposal.amount?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        Propósito de préstamo:
                      </span>
                      <span className="font-medium">
                        {proposal.requestInfo?.purpose || "Sin propósito"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        Tipo de préstamo:
                      </span>
                      <span className="font-medium">
                        {proposal.requestInfo?.type || "Préstamo"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        Tasa de interés:
                      </span>
                      <span className="font-medium">
                        {proposal.interestRate}%
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
                        Frecuencia de pago:
                      </span>
                      <span className="font-medium capitalize">
                        {proposal.amortizationFrequency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        Fecha de propuesta:
                      </span>
                      <span className="font-medium">
                        {proposal.createdAt
                          ? typeof proposal.createdAt === "object" &&
                            "seconds" in proposal.createdAt
                            ? new Date(
                                (proposal.createdAt as any).seconds * 1000
                              ).toLocaleDateString()
                            : new Date(
                                proposal.createdAt as string
                              ).toLocaleDateString()
                          : "No disponible"}
                      </span>
                    </div>
                    {proposal.medicalBalance !== undefined &&
                      proposal.medicalBalance > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500 text-sm">
                            Seguro de vida saldo deudor:
                          </span>
                          <span className="font-medium">
                            ${proposal.medicalBalance?.toLocaleString()}
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">
                        Amortización:
                      </span>
                      <span className="font-medium">
                        ${proposal.amortization?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Comisión por apertura:</span>
                      <span className="font-medium">
                        ${proposal.comision?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {proposal.status === "rejected" && proposal.loanId && (
                    <div className="pt-4 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="flat"
                        color="danger"
                        startContent={<Eye className="w-4 h-4" />}
                        onClick={() => fetchWinningOffer(proposal)}
                        isLoading={loadingReason && selectedProposalId === proposal.id}
                        className="w-full"
                      >
                        Ver Razón
                      </Button>
                    </div>
                  )}

                  {(proposal as any).message && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 italic">
                        &quot;{(proposal as any).message}&quot;
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
      {/* Modal: Ver Razón (Winning Offer Details) */}
      <Modal isOpen={showReasonModal} onClose={() => setShowReasonModal(false)} size="lg">
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <h3 className="text-lg font-bold text-gray-900">
              Detalles de la propuesta ganadora
            </h3>
            <p className="text-sm text-gray-500 font-normal">
              Esta es la propuesta que fue aceptada por el solicitante
            </p>
          </ModalHeader>
          <ModalBody>
            {loadingReason ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" />
                <span className="ml-3 text-gray-500">Cargando detalles...</span>
              </div>
            ) : winningOffer ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Monto:</span>
                  <span className="font-medium text-gray-900">
                    ${winningOffer.amount?.toLocaleString() || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Tasa de interés:</span>
                  <span className="font-medium text-gray-900">
                    {winningOffer.interestRate || "N/A"}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Frecuencia de pago:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {winningOffer.amortizationFrequency || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Plazo:</span>
                  <span className="font-medium text-gray-900">
                    {winningOffer.term || "N/A"} meses
                  </span>
                </div>
                {winningOffer.amortization !== undefined && winningOffer.amortization > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-500">Monto de amortización:</span>
                    <span className="font-medium text-gray-900">
                      ${winningOffer.amortization?.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500">Comisión por apertura:</span>
                  <span className="font-medium text-gray-900">
                    ${winningOffer.comision?.toLocaleString() || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">Seguro de vida saldo deudor:</span>
                    <Tooltip
                      content="Seguro que cubre el adeudo en caso de una situación fatal"
                      placement="top"
                      className="max-w-xs"
                    >
                      <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                    </Tooltip>
                  </div>
                  <span className="font-medium text-gray-900">
                    ${winningOffer.medicalBalance?.toLocaleString() || "N/A"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No se encontraron detalles de la propuesta ganadora.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onClick={() => setShowReasonModal(false)}
            >
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default MyOffersView;
