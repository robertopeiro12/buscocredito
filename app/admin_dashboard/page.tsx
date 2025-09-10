"use client";
import "@/lib/chart-config"; // Registrar componentes de Chart.js
import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  Chip,
} from "@nextui-org/react";
import {
  Search,
  PlusCircle,
  User,
  Store,
  Activity,
  TrendingUp,
  Users,
} from "lucide-react";
import { AdminSidebarUpdated } from "@/components/features/dashboard/AdminSidebarUpdated";
import { AdminHeader } from "@/components/features/dashboard/AdminHeader";
import { AdminLoadingSkeletons } from "@/components/features/dashboard/AdminLoadingSkeletons";
import { SubaccountCard } from "@/components/features/dashboard/SubaccountCard";
import { EnhancedSubaccountCard } from "@/components/features/dashboard/EnhancedSubaccountCard";
import { MetricsHeader } from "@/components/admin/MetricsHeader";
import { EmptyMetricsState } from "@/components/admin/EmptyMetricsState";
import { DateRangeModal } from "@/components/admin/DateRangeModal";
import { TotalProposalsCard } from "@/components/admin/metrics/TotalProposalsCard";
import { DistributionPieCard } from "@/components/admin/metrics/DistributionPieCard";
import { InterestRateCard } from "@/components/admin/metrics/InterestRateCard";
import { AverageAmountCard } from "@/components/admin/metrics/AverageAmountCard";
import { MarketplaceMetricsCards } from "@/components/admin/metrics/MarketplaceMetricsCards";
import AdminMarketplaceView from "@/components/admin/AdminMarketplaceView";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";
import { useAdminLoans } from "@/hooks/useAdminLoans";
import { useWorkerStats } from "@/hooks/useWorkerStats";

export default function AdminDashboard() {
  const {
    // Auth states
    isAuthorized,
    isCheckingAuth,
    userEmail,
    adminData,

    // UI states
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    isLoading,
    isCreating,

    // Subaccounts states
    filteredSubaccounts,
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
    getMonthName,
    getTopDistributionItems,

    // Action handlers
    handleCreateSubaccount,
    handleDeleteSubaccount,
    handleSignOut,
    handleOpenDateRangeModal,
    handleDateRangeConfirm,
  } = useAdminDashboard();

  // Hook para obtener datos del marketplace para métricas
  const { loans: marketplaceLoans, loading: marketplaceLoading } =
    useAdminLoans({
      status: "pending",
      enableRealtime: true,
    });

  // Hook para estadísticas de trabajadores
  const {
    workers,
    summary,
    activities,
    isLoading: isLoadingWorkers,
    statsError,
    activityError,
    hasError: workersHasError,
    refresh: refreshWorkers,
    getActiveWorkers,
    formatLastActivity,
  } = useWorkerStats();

  // Funciones de utilidad para el dashboard
  const getActiveWorkersCount = () => summary?.activeWorkers || 0;
  const getTotalPropuestasEnviadas = () =>
    summary?.totalPropuestasEnviadas || 0;
  const getAverageApprovalRate = () => summary?.averageApprovalRate || 0;
  const workersError = statsError || activityError;

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
          companyName={adminData.Empresa}
        />

        {/* Main Content with left margin to account for fixed sidebar */}
        <div className="flex-1 ml-64">
          {/* Header */}
          <div className="px-4 lg:px-6">
            <AdminHeader
              activeTab={activeTab}
              companyName={adminData.Empresa}
              onTabChange={setActiveTab}
              onSignOut={handleSignOut}
            />
          </div>

          {/* Content Area */}
          <main className="p-4 lg:p-6">
            {activeTab === "subaccounts" && (
              <div className="max-w-7xl mx-auto">
                <div className="space-y-8">
                  {/* Header Section Simplificado */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-8 border border-slate-200/50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-xl">
                          <Users className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                            Equipo de Trabajo
                          </h1>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-slate-600 font-medium text-sm">
                              {userEmail}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        color="success"
                        onPress={() => setIsModalOpen(true)}
                        startContent={<PlusCircle className="w-5 h-5" />}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-6 py-3 h-auto rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        Nuevo Trabajador
                      </Button>
                    </div>
                  </div>

                  {/* Resumen de estadísticas generales - Diseño más profesional */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-xl">
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-blue-700 font-semibold text-sm uppercase tracking-wide">
                              Total Trabajadores
                            </p>
                            <p className="text-3xl font-bold text-blue-900 mt-1">
                              {workers?.length || 0}
                            </p>
                            <div className="flex items-center mt-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                              <span className="text-blue-600 text-xs font-medium">
                                Equipo completo
                              </span>
                            </div>
                          </div>
                          <div className="p-4 bg-blue-200/50 rounded-xl">
                            <Users className="w-8 h-8 text-blue-700" />
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-xl">
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-green-700 font-semibold text-sm uppercase tracking-wide">
                              Activos (7 días)
                            </p>
                            <p className="text-3xl font-bold text-green-900 mt-1">
                              {getActiveWorkersCount()}
                            </p>
                            <div className="flex items-center mt-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                              <span className="text-green-600 text-xs font-medium">
                                Último período
                              </span>
                            </div>
                          </div>
                          <div className="p-4 bg-green-200/50 rounded-xl">
                            <Activity className="w-8 h-8 text-green-700" />
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-50 to-yellow-100 border-0 shadow-xl">
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-amber-700 font-semibold text-sm uppercase tracking-wide">
                              Propuestas Enviadas
                            </p>
                            <p className="text-3xl font-bold text-amber-900 mt-1">
                              {getTotalPropuestasEnviadas()}
                            </p>
                            <div className="flex items-center mt-2">
                              <div className="w-2 h-2 bg-amber-500 rounded-full mr-2"></div>
                              <span className="text-amber-600 text-xs font-medium">
                                Total enviadas
                              </span>
                            </div>
                          </div>
                          <div className="p-4 bg-amber-200/50 rounded-xl">
                            <TrendingUp className="w-8 h-8 text-amber-700" />
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-xl">
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-purple-700 font-semibold text-sm uppercase tracking-wide">
                              Tasa Aceptación
                            </p>
                            <p className="text-3xl font-bold text-purple-900 mt-1">
                              {getAverageApprovalRate()}%
                            </p>
                            <div className="flex items-center mt-2">
                              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                              <span className="text-purple-600 text-xs font-medium">
                                Promedio general
                              </span>
                            </div>
                          </div>
                          <div className="p-4 bg-purple-200/50 rounded-xl">
                            <Store className="w-8 h-8 text-purple-700" />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>

                  {/* Sección de controles mejorada */}
                  <Card className="bg-white/60 backdrop-blur-sm border-0 shadow-xl">
                    <CardBody className="p-6">
                      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                        <div className="flex-1 max-w-md">
                          <Input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            startContent={
                              <Search className="text-slate-400 w-5 h-5" />
                            }
                            className="w-full"
                            classNames={{
                              base: "max-w-full",
                              mainWrapper: "h-full",
                              input: "text-small",
                              inputWrapper:
                                "h-12 bg-white/70 border border-slate-200 hover:border-slate-300 focus-within:border-blue-500 rounded-xl shadow-sm transition-all",
                            }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            color="secondary"
                            variant="flat"
                            onPress={refreshWorkers}
                            disabled={isLoadingWorkers}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-6 h-12 rounded-xl transition-all"
                            startContent={
                              isLoadingWorkers ? (
                                <Spinner size="sm" />
                              ) : (
                                <Activity className="w-4 h-4" />
                              )
                            }
                          >
                            {isLoadingWorkers
                              ? "Actualizando..."
                              : "Actualizar"}
                          </Button>
                          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100/50 rounded-xl">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-slate-600 text-sm font-medium">
                              {workers?.length || 0} trabajadores
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Sección de resultados con diseño profesional */}
                  {isLoadingWorkers ? (
                    <div className="space-y-6">
                      <AdminLoadingSkeletons.SubaccountsGrid />
                    </div>
                  ) : workersError ? (
                    <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-0 shadow-xl">
                      <CardBody className="p-8 text-center">
                        <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <User className="w-8 h-8 text-red-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-red-800 mb-2">
                          Error al cargar trabajadores
                        </h3>
                        <p className="text-red-600 mb-6">{workersError}</p>
                        <Button
                          color="danger"
                          variant="flat"
                          onPress={refreshWorkers}
                          className="bg-red-100 hover:bg-red-200 text-red-700 font-semibold px-8 py-3 h-auto rounded-xl"
                          startContent={<Activity className="w-4 h-4" />}
                        >
                          Reintentar Conexión
                        </Button>
                      </CardBody>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {/* Título de sección */}
                      <div className="flex items-center gap-3">
                        <div className="h-px bg-gradient-to-r from-slate-300 to-transparent flex-1"></div>
                        <h2 className="text-lg font-semibold text-slate-700 px-4 py-2 bg-slate-100 rounded-full">
                          Equipo de Trabajo
                        </h2>
                        <div className="h-px bg-gradient-to-l from-slate-300 to-transparent flex-1"></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {workers && workers.length > 0 ? (
                          workers
                            .filter(
                              (worker) =>
                                searchTerm === "" ||
                                worker.name
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase()) ||
                                worker.email
                                  .toLowerCase()
                                  .includes(searchTerm.toLowerCase())
                            )
                            .map((worker) => (
                              <div
                                key={worker.id}
                                className="transform hover:scale-[1.02] transition-all duration-200"
                              >
                                <EnhancedSubaccountCard
                                  worker={worker}
                                  onDelete={() => {
                                    console.log(
                                      "TODO: Implementar eliminación de trabajador:",
                                      worker.id
                                    );
                                    // TODO: Implementar API para eliminar trabajadores por string ID
                                  }}
                                  formatLastActivity={formatLastActivity}
                                />
                              </div>
                            ))
                        ) : (
                          <div className="col-span-full">
                            <Card className="bg-gradient-to-br from-slate-50 to-blue-50 border-0 shadow-xl">
                              <CardBody className="p-12 text-center">
                                <div className="p-6 bg-slate-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                  <User className="w-12 h-12 text-slate-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-700 mb-3">
                                  No se encontraron trabajadores
                                </h3>
                                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                                  {searchTerm
                                    ? `No hay trabajadores que coincidan con "${searchTerm}". Intenta con otros términos de búsqueda.`
                                    : "Aún no tienes trabajadores registrados en tu equipo. Comienza agregando tu primer trabajador."}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                                  <Button
                                    color="primary"
                                    variant="flat"
                                    onPress={refreshWorkers}
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-8 py-3 h-auto rounded-xl"
                                    startContent={
                                      <Activity className="w-4 h-4" />
                                    }
                                  >
                                    Recargar Lista
                                  </Button>
                                  {!searchTerm && (
                                    <Button
                                      color="success"
                                      onPress={() => setIsModalOpen(true)}
                                      startContent={
                                        <PlusCircle className="w-4 h-4" />
                                      }
                                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold px-8 py-3 h-auto rounded-xl shadow-lg"
                                    >
                                      Crear Primer Trabajador
                                    </Button>
                                  )}
                                </div>
                              </CardBody>
                            </Card>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Mostrar trabajadores usando componente legacy como fallback */}
                  {(!workers || workers.length === 0) &&
                    filteredSubaccounts.length > 0 && (
                      <div>
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">
                          Subcuentas (Vista Legacy)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {filteredSubaccounts.map((subaccount, index) => (
                            <SubaccountCard
                              key={subaccount.id || index}
                              subaccount={subaccount}
                              onDelete={() =>
                                handleDeleteSubaccount(subaccount.id)
                              }
                            />
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            )}

            {activeTab === "metrics" && (
              <div className="max-w-7xl mx-auto">
                <MetricsHeader
                  selectedTimeRange={selectedTimeRange}
                  setSelectedTimeRange={setSelectedTimeRange}
                  handleOpenDateRangeModal={handleOpenDateRangeModal}
                />

                {isLoadingMetrics ? (
                  <AdminLoadingSkeletons.MetricsCards />
                ) : metricsData.totalProposals === 0 ? (
                  <EmptyMetricsState />
                ) : (
                  <div className="transition-all duration-300 ease-in-out">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            "rgba(99, 102, 241, 0.85)",
                            "rgba(245, 158, 11, 0.85)",
                            "rgba(239, 68, 68, 0.85)",
                            "rgba(20, 184, 166, 0.85)",
                            "rgba(236, 72, 153, 0.85)",
                          ],
                          borderColor: [
                            "rgb(79, 70, 229)",
                            "rgb(180, 83, 9)",
                            "rgb(185, 28, 28)",
                            "rgb(13, 148, 136)",
                            "rgb(219, 39, 119)",
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
                            "rgba(245, 158, 11, 0.85)",
                            "rgba(239, 68, 68, 0.85)",
                            "rgba(99, 102, 241, 0.85)",
                            "rgba(20, 184, 166, 0.85)",
                            "rgba(236, 72, 153, 0.85)",
                          ],
                          borderColor: [
                            "rgb(180, 83, 9)",
                            "rgb(185, 28, 28)",
                            "rgb(79, 70, 229)",
                            "rgb(13, 148, 136)",
                            "rgb(219, 39, 119)",
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
                            "rgba(245, 158, 11, 0.85)",
                            "rgba(239, 68, 68, 0.85)",
                            "rgba(245, 158, 11, 0.85)",
                            "rgba(139, 92, 246, 0.85)",
                            "rgba(239, 68, 68, 0.85)",
                          ],
                          borderColor: [
                            "rgb(180, 83, 9)",
                            "rgb(185, 28, 28)",
                            "rgb(180, 83, 9)",
                            "rgb(109, 40, 217)",
                            "rgb(185, 28, 28)",
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

                    {/* Separador y título para métricas del marketplace */}
                    <div className="mt-12 mb-8">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm">
                            <Store className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900">
                              Métricas del Marketplace
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Estadísticas del mercado de préstamos
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Métricas del Marketplace */}
                    <MarketplaceMetricsCards
                      loanRequests={marketplaceLoans}
                      loading={marketplaceLoading}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "marketplace" && <AdminMarketplaceView />}
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
              color="success"
              onPress={handleCreateSubaccount}
              isLoading={isCreating}
            >
              Crear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
