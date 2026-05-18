import React, { useState, useMemo } from "react";
import { Button, Card, Chip, CardBody, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Tooltip } from "@heroui/react";
import { User, ChevronRight, CreditCard, Eye, Info, ArrowUpDown } from "lucide-react";
import { MarketplacePagination } from "@/components/features/dashboard/MarketplacePagination";
import { LenderLoadingSkeletons } from "@/components/features/dashboard/LenderLoadingSkeletons";
import { auth } from "@/app/firebase";
import { normalizeDate } from "@/app/lender/utils/metricsCalc";
import type { LenderProposal } from "@/app/lender/types/loan.types";

type StatusFilter = 'all' | 'pending' | 'accepted' | 'rejected';
type SortOrder = 'newest' | 'oldest';

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
}

const MyOffersView = ({
  lenderProposals,
  loadingProposals,
  onGoToMarketplace,
}: MyOffersViewProps) => {
  // Filter / sort state
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

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
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch(`/api/proposals/winning?loanId=${encodeURIComponent(loanId)}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      if (!response.ok) {
        setWinningOffer(null);
        return;
      }

      const data = await response.json();
      setWinningOffer(data.data || null);
    } catch (error) {
      console.error('Error fetching winning offer:', error);
      setWinningOffer(null);
    } finally {
      setLoadingReason(false);
    }
  };

  // Filtered + sorted list
  const processedProposals = useMemo(() => {
    let list = statusFilter === 'all'
      ? lenderProposals
      : lenderProposals.filter(p => p.status === statusFilter);

    list = [...list].sort((a, b) => {
      const da = normalizeDate(a.createdAt)?.getTime() ?? 0;
      const db = normalizeDate(b.createdAt)?.getTime() ?? 0;
      return sortOrder === 'newest' ? db - da : da - db;
    });

    return list;
  }, [lenderProposals, statusFilter, sortOrder]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const totalPages = Math.ceil(processedProposals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOffers = processedProposals.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
    setCurrentPage(1);
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
      {lenderProposals.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status filter pills */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {(['all', 'pending', 'accepted', 'rejected'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => handleStatusFilter(s)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ${
                  statusFilter === s
                    ? 'bg-[#0e3a45] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'
                }`}
              >
                {s === 'all' ? 'Todas' : s === 'pending' ? 'Pendientes' : s === 'accepted' ? 'Aceptadas' : 'Rechazadas'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort toggle */}
            <button
              onClick={() => { setSortOrder(o => o === 'newest' ? 'oldest' : 'newest'); setCurrentPage(1); }}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-[#0e3a45] transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              {sortOrder === 'newest' ? 'Más recientes' : 'Más antiguas'}
            </button>

            {/* Count */}
            <div className="flex items-center bg-[#0e3a45]/[0.06] px-3 py-1.5 rounded-full border border-[#0e3a45]/10">
              <span className="text-sm font-medium text-[#0e3a45]">
                {processedProposals.length} {processedProposals.length === 1 ? 'propuesta' : 'propuestas'}
              </span>
            </div>
          </div>
        </div>
      )}

      {loadingProposals ? (
        <LenderLoadingSkeletons.OffersGrid />
      ) : lenderProposals.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#0e3a45]/[0.06] flex items-center justify-center">
            <CreditCard className="w-12 h-12 text-[#0e3a45]" />
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
            className="bg-[#0e3a45] hover:opacity-90 text-white font-semibold px-6 py-2 shadow-sm transition-all duration-200"
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
                className="overflow-hidden border border-gray-100 hover:border-[#0e3a45]/20 hover:shadow-md transition-all duration-200"
              >
                <div className="h-1 bg-green-500 w-full" />
                <CardBody className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
                        {proposal.requestInfo?.purpose || "Sin propósito"}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {proposal.requestInfo?.type || "Préstamo"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-[#0e3a45] mb-2">
                        ${proposal.amount?.toLocaleString("es-MX")}
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
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                        Monto
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        ${proposal.amount?.toLocaleString("es-MX")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                        Propósito
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {proposal.requestInfo?.purpose || "Sin propósito"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                        Tipo
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {proposal.requestInfo?.type || "Préstamo"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                        Tasa de interés
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {proposal.interestRate}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                        Plazo
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {proposal.deadline} meses
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                        Frecuencia
                      </span>
                      <span className="text-sm font-semibold text-gray-800 capitalize">
                        {proposal.amortizationFrequency}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                        Fecha
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {proposal.createdAt
                          ? typeof proposal.createdAt === "object" &&
                            "seconds" in proposal.createdAt
                            ? new Date(
                                (proposal.createdAt as { seconds: number }).seconds * 1000
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
                          <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                            Seguro vida
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            ${proposal.medicalBalance?.toLocaleString("es-MX")}
                          </span>
                        </div>
                      )}
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                        Amortización
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        ${proposal.amortization?.toLocaleString("es-MX")}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">
                        Comisión apertura
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        ${proposal.comision?.toLocaleString("es-MX")}
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

                  {proposal.message && (
                    <div className="pt-4 border-t border-gray-100">
                      <p className="text-sm text-gray-600 italic">
                        &quot;{proposal.message}&quot;
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
                          <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Nombre</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {proposal.contactInfo.fullName || "No disponible"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Email</span>
                          <span className="text-sm font-semibold text-gray-800">
                            {proposal.contactInfo.email || "No disponible"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Teléfono</span>
                          <span className="text-sm font-semibold text-gray-800">
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0e3a45]" />
                <span className="ml-3 text-gray-500">Cargando detalles...</span>
              </div>
            ) : winningOffer ? (
              <div className="space-y-1 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Monto</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${winningOffer.amount?.toLocaleString("es-MX") || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Tasa de interés</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {winningOffer.interestRate || "N/A"}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Frecuencia de pago</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {winningOffer.amortizationFrequency || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Plazo</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {winningOffer.term || "N/A"} meses
                  </span>
                </div>
                {winningOffer.amortization !== undefined && winningOffer.amortization > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Amortización</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ${winningOffer.amortization?.toLocaleString("es-MX")}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Comisión apertura</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${winningOffer.comision?.toLocaleString("es-MX") || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Seguro vida</span>
                    <Tooltip
                      content="Seguro que cubre el adeudo en caso de una situación fatal"
                      placement="top"
                      className="max-w-xs"
                    >
                      <Info className="w-3 h-3 text-gray-400 hover:text-gray-600 cursor-help" />
                    </Tooltip>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    ${winningOffer.medicalBalance?.toLocaleString("es-MX") || "N/A"}
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
              variant="light"
              onClick={() => setShowReasonModal(false)}
              className="text-[#0e3a45]"
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
