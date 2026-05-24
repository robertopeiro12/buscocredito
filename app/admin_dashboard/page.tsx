"use client";
import { useState } from "react";
import "@/lib/chart-config"; // Registrar componentes de Chart.js
import {
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Switch,
} from "@heroui/react";
import {
  Store,
  Activity,
  TrendingUp,
  Users,
  Download,
  Building2,
  Mail,
  Bell,
  BookOpen,
  Headphones,
} from "lucide-react";
import { AdminSidebarUpdated } from "@/components/features/dashboard/AdminSidebarUpdated";
import { AdminHeader } from "@/components/features/dashboard/AdminHeader";
import { AdminLoadingSkeletons } from "@/components/features/dashboard/AdminLoadingSkeletons";
import { WorkersTable } from "@/components/features/dashboard/WorkersTable";
import { MetricsHeader } from "@/components/admin/MetricsHeader";
import { EmptyMetricsState } from "@/components/admin/EmptyMetricsState";
import { DateRangeModal } from "@/components/admin/DateRangeModal";
import { TotalProposalsCard } from "@/components/admin/metrics/TotalProposalsCard";
import { DistributionPieCard } from "@/components/admin/metrics/DistributionPieCard";
import { InterestRateCard } from "@/components/admin/metrics/InterestRateCard";
import { AverageAmountCard } from "@/components/admin/metrics/AverageAmountCard";
import { MarketplaceMetricsCards } from "@/components/admin/metrics/MarketplaceMetricsCards";
import AdminMarketplaceView from "@/components/admin/AdminMarketplaceView";
import { AmortizationComparisonChart } from "@/components/admin/metrics/AmortizationComparisonChart";
import { InterestRateComparisonChart } from "@/components/admin/metrics/InterestRateComparisonChart";
import { ProposalDetailsTable } from "@/components/admin/metrics/ProposalDetailsTable";
import { ComparisonSummaryCards } from "@/components/admin/metrics/ComparisonSummaryCards";
import { ProfessionalMetricsCard } from "@/components/admin/metrics/ProfessionalMetricsCard";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useProposalComparison } from "@/hooks/useProposalComparison";
import { exportProposalsData, exportWorkerStats } from "@/utils/exportCsv";
import { useAdminLoans } from "@/hooks/useAdminLoans";
import { useWorkerStats } from "@/hooks/useWorkerStats";

export default function AdminDashboard() {
  const {
    // Auth states
    isAuthorized,
    isCheckingAuth,
    adminData,

    // UI states
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    isCreating,

    // Subaccounts states
    searchTerm,
    setSearchTerm,
    newSubaccount,
    setNewSubaccount,
    formErrors,

    // Metrics states
    selectedTimeRange,
    setSelectedTimeRange,
    isDateRangeModalOpen,
    setIsDateRangeModalOpen,
    customDateRange,
    setCustomDateRange,

    // Metrics data
    metricsData,
    isLoadingMetrics,
    rawProposals,
    getMonthName,
    getTopDistributionItems,

    // Action handlers
    handleCreateSubaccount,
    handleSignOut,
    handleOpenDateRangeModal,
    handleDateRangeConfirm,
  } = useAdminDashboard();

  // Hook para obtener datos del marketplace para métricas
  const { loans: marketplaceLoans, loading: marketplaceLoading } =
    useAdminLoans({
      status: "pending",
      enableRealtime: true,
      adminCompany: adminData.companyName, // Pasar la empresa del admin
    });

  // Hook para estadísticas de trabajadores
  const [workersPeriod, setWorkersPeriod] = useState<"month" | "all">("month");

  const {
    workers,
    setWorkers,
    summary,
    isLoading: isLoadingWorkers,
    statsError,
    activityError,
    refresh: refreshWorkers,
    formatLastActivity,
  } = useWorkerStats({ period: workersPeriod });

  // Hook para comparación de propuestas
  const {
    comparisons,
    summary: comparisonSummary,
    isLoading: isLoadingComparisons,
  } = useProposalComparison({
    rawProposals,
    companyName: adminData.companyName,
    isLoadingMetrics,
  });

  // Funciones de utilidad para el dashboard
  const getActiveWorkersCount = () => summary?.activeWorkers || 0;
  const getTotalPropuestasEnviadas = () =>
    summary?.totalPropuestasEnviadas || 0;
  const getAverageApprovalRate = () => summary?.averageApprovalRate || 0;
  const workersError = statsError || activityError;

  // Mapa de IDs de trabajadores a nombres para exportar propuestas
  const workerNameMap: Record<string, string> = {};
  workers.forEach((w) => {
    workerNameMap[w.id] = w.name;
  });

  // CONDICIONALES DESPUÉS DE TODOS LOS HOOKS
  // Mostrar loading mientras verifica permisos
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Verificando permisos de administrador...
          </p>
        </div>
      </div>
    );
  }

  // Si no está autorizado, el hook ya manejó la redirección
  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <div className="flex min-h-screen bg-gray-50">
        {/* Fixed Sidebar */}
        <AdminSidebarUpdated
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          companyName={adminData.companyName}
        />

        <div className="flex-1 ml-64">
          <div className="px-4 lg:px-6 pt-4 lg:pt-6">
            <AdminHeader
              activeTab={activeTab}
              companyName={adminData.companyName}
              onTabChange={setActiveTab}
              onSignOut={handleSignOut}
            />
          </div>

          <main className="px-4 lg:px-6 pb-4 lg:pb-6">
            {activeTab === "subaccounts" && (
              <div className="max-w-7xl mx-auto">
                <div className="space-y-6">
                  {/* Stats cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <ProfessionalMetricsCard
                      title="Total Trabajadores"
                      value={String(workers?.length || 0)}
                      icon={Users}
                      variant="primary"
                    />
                    <ProfessionalMetricsCard
                      title="Activos"
                      subtitle="Últimos 7 días"
                      value={String(getActiveWorkersCount())}
                      icon={Activity}
                      variant="success"
                    />
                    <ProfessionalMetricsCard
                      title="Propuestas Enviadas"
                      value={String(getTotalPropuestasEnviadas())}
                      icon={TrendingUp}
                      variant="info"
                    />
                    <ProfessionalMetricsCard
                      title="Tasa de Aceptación"
                      value={`${getAverageApprovalRate()}%`}
                      icon={Store}
                      variant="warning"
                    />
                  </div>

                  <WorkersTable
                    workers={workers ?? []}
                    isLoading={isLoadingWorkers}
                    error={workersError}
                    period={workersPeriod}
                    onPeriodChange={setWorkersPeriod}
                    onRefresh={refreshWorkers}
                    onDelete={(id) => {
                      setWorkers((prev) => prev.filter((w) => w.id !== id));
                      refreshWorkers();
                    }}
                    onCreateWorker={() => setIsModalOpen(true)}
                    formatLastActivity={formatLastActivity}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                  />
                </div>
              </div>
            )}

            {activeTab === "metrics" && (
              <div className="max-w-7xl mx-auto">
                <MetricsHeader
                  selectedTimeRange={selectedTimeRange}
                  setSelectedTimeRange={setSelectedTimeRange}
                  handleOpenDateRangeModal={handleOpenDateRangeModal}
                  showExports={!isLoadingMetrics && metricsData.totalProposals > 0}
                  onExportProposals={() => exportProposalsData(rawProposals, adminData.companyName, workerNameMap)}
                  onExportWorkers={() => exportWorkerStats(workers, adminData.companyName)}
                />

                {isLoadingMetrics ? (
                  <AdminLoadingSkeletons.MetricsCards />
                ) : metricsData.totalProposals === 0 ? (
                  <EmptyMetricsState />
                ) : (
                  <div className="transition-all duration-300 ease-in-out">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {/* Total de propuestas */}
                      <TotalProposalsCard
                        metricsData={metricsData}
                        getMonthName={getMonthName}
                      />

                      {/* Distribución por tipo de préstamo */}
                      <DistributionPieCard
                        title="Distribución por Tipo de Préstamo"
                        data={metricsData.loanTypeDistribution}
                        colors={{
                          backgroundColor: [
                            "rgba(99, 102, 241, 0.82)",
                            "rgba(245, 158, 11, 0.82)",
                            "rgba(16, 185, 129, 0.82)",
                            "rgba(244, 63, 94, 0.82)",
                            "rgba(14, 165, 233, 0.82)",
                          ],
                          borderColor: [
                            "rgb(99, 102, 241)",
                            "rgb(245, 158, 11)",
                            "rgb(16, 185, 129)",
                            "rgb(244, 63, 94)",
                            "rgb(14, 165, 233)",
                          ],
                        }}
                        chartOptions={metricsData.chartOptions?.pie}
                        getTopDistributionItems={getTopDistributionItems}
                        variant="primary"
                      />

                      {/* Distribución por propósito */}
                      <DistributionPieCard
                        title="Distribución por Propósito"
                        data={metricsData.purposeDistribution}
                        colors={{
                          backgroundColor: [
                            "rgba(99, 102, 241, 0.82)",
                            "rgba(245, 158, 11, 0.82)",
                            "rgba(16, 185, 129, 0.82)",
                            "rgba(244, 63, 94, 0.82)",
                            "rgba(14, 165, 233, 0.82)",
                          ],
                          borderColor: [
                            "rgb(99, 102, 241)",
                            "rgb(245, 158, 11)",
                            "rgb(16, 185, 129)",
                            "rgb(244, 63, 94)",
                            "rgb(14, 165, 233)",
                          ],
                        }}
                        chartOptions={metricsData.chartOptions?.pie}
                        getTopDistributionItems={getTopDistributionItems}
                        variant="secondary"
                      />

                      {/* Distribución por frecuencia de pago */}
                      <DistributionPieCard
                        title="Distribución por Frecuencia de Pago"
                        data={metricsData.paymentFrequencyDistribution}
                        colors={{
                          backgroundColor: [
                            "rgba(99, 102, 241, 0.82)",
                            "rgba(245, 158, 11, 0.82)",
                            "rgba(16, 185, 129, 0.82)",
                            "rgba(244, 63, 94, 0.82)",
                            "rgba(14, 165, 233, 0.82)",
                          ],
                          borderColor: [
                            "rgb(99, 102, 241)",
                            "rgb(245, 158, 11)",
                            "rgb(16, 185, 129)",
                            "rgb(244, 63, 94)",
                            "rgb(14, 165, 233)",
                          ],
                        }}
                        chartOptions={metricsData.chartOptions?.pie}
                        getTopDistributionItems={getTopDistributionItems}
                        variant="info"
                      />

                      {/* Tasa de interés promedio */}
                      <InterestRateCard
                        metricsData={metricsData}
                        getMonthName={getMonthName}
                      />

                      {/* Monto promedio de propuestas */}
                      <AverageAmountCard
                        metricsData={metricsData}
                        getMonthName={getMonthName}
                      />
                    </div>

                    <div className="mt-10 mb-6 flex items-center gap-3">
                      <Store className="w-4 h-4 text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Métricas del Marketplace</h3>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* Métricas del Marketplace */}
                    <MarketplaceMetricsCards
                      loanRequests={marketplaceLoans}
                      loading={marketplaceLoading}
                    />

                    <div className="mt-10 mb-6 flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-gray-400" />
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Análisis Competitivo</h3>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {isLoadingComparisons ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0e3a45] mr-3"></div>
                        <span className="text-gray-500">Cargando análisis competitivo...</span>
                      </div>
                    ) : comparisons.length > 0 ? (
                      <div className="space-y-6">
                        {/* Summary cards */}
                        <ComparisonSummaryCards summary={comparisonSummary} />

                        {/* Comparison charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <AmortizationComparisonChart comparisons={comparisons} />
                          <InterestRateComparisonChart
                            comparisons={comparisons}
                            companyName={adminData.companyName}
                          />
                        </div>

                        {/* Detailed table */}
                        <ProposalDetailsTable
                          comparisons={comparisons}
                          companyName={adminData.companyName}
                        />
                      </div>
                    ) : (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
                        <p className="text-gray-500">
                          No hay datos de comparación para el período seleccionado.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "marketplace" && <AdminMarketplaceView loans={marketplaceLoans} loading={marketplaceLoading} />}

            {activeTab === "settings" && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-1 bg-green-500 w-full" />
                  <div className="p-6 space-y-8">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                        Información de la Empresa
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0e3a45]/[0.08] flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-6 h-6 text-[#0e3a45]" />
                        </div>
                        <div>
                          <p className="text-base font-semibold text-gray-900">{adminData.companyName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#0e3a45]/[0.08] text-[#0e3a45] uppercase tracking-wide">
                              Administrador
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 uppercase tracking-wide">
                              Activa
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-8">
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
                        Notificaciones
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#0e3a45]/[0.08] flex items-center justify-center">
                              <Mail className="w-4 h-4 text-[#0e3a45]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Notificaciones por correo</p>
                              <p className="text-xs text-gray-500">Recibe alertas sobre actividad de tu equipo</p>
                            </div>
                          </div>
                          <Switch color="success" size="sm" defaultSelected />
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#0e3a45]/[0.08] flex items-center justify-center">
                              <Bell className="w-4 h-4 text-[#0e3a45]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Notificaciones en la plataforma</p>
                              <p className="text-xs text-gray-500">Siempre recibirás notificaciones dentro del panel</p>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                            Siempre activas
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-6">
                      <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 text-center">
                        Para modificar información de la empresa, contacta al super administrador.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "help" && (
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="h-1 bg-green-500 w-full" />
                  <div className="p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="p-5 bg-[#0e3a45]/[0.04] border border-[#0e3a45]/10 rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-[#0e3a45]/[0.08] flex items-center justify-center mb-3">
                          <BookOpen className="w-4 h-4 text-[#0e3a45]" />
                        </div>
                        <h3 className="text-sm font-semibold text-[#0e3a45] mb-2">¿Cómo funciona?</h3>
                        <p className="text-sm text-gray-600">
                          Gestiona tu equipo de trabajadores, monitorea el marketplace y analiza el rendimiento
                          competitivo de las propuestas enviadas por tu institución.
                        </p>
                      </div>
                      <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center mb-3">
                          <Headphones className="w-4 h-4 text-gray-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-2">Soporte Técnico</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          ¿Tienes problemas con la plataforma? Nuestro equipo está disponible para ayudarte.
                        </p>
                        <p className="text-xs font-medium text-gray-500">soporte@buscocredito.mx</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      <DateRangeModal
        isOpen={isDateRangeModalOpen}
        onClose={() => setIsDateRangeModalOpen(false)}
        customDateRange={customDateRange}
        setCustomDateRange={setCustomDateRange}
        onConfirm={handleDateRangeConfirm}
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Crear Subcuenta
          </ModalHeader>
          <ModalBody>
            <Input
              label="Nombre"
              placeholder="Ingrese nombre"
              value={newSubaccount.name}
              onChange={(e) =>
                setNewSubaccount({ ...newSubaccount, name: e.target.value })
              }
              isInvalid={!!formErrors.name}
              errorMessage={formErrors.name}
              className="mb-4"
            />
            <Input
              label="Email"
              placeholder="Ingrese email"
              value={newSubaccount.email}
              onChange={(e) =>
                setNewSubaccount({ ...newSubaccount, email: e.target.value })
              }
              isInvalid={!!formErrors.email}
              errorMessage={formErrors.email}
              className="mb-4"
            />
            <Input
              label="Contraseña"
              placeholder="Ingrese contraseña"
              type="password"
              value={newSubaccount.password}
              onChange={(e) =>
                setNewSubaccount({
                  ...newSubaccount,
                  password: e.target.value,
                })
              }
              isInvalid={!!formErrors.password}
              errorMessage={formErrors.password}
              className="mb-4"
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onPress={handleCreateSubaccount}
              isLoading={isCreating}
              style={{ backgroundColor: "#0e3a45" }}
              className="text-white"
            >
              Crear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
