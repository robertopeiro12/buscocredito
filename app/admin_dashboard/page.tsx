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
} from "@nextui-org/react";
import { Search, PlusCircle, User, Store } from "lucide-react";
import { AdminSidebarUpdated } from "@/components/features/dashboard/AdminSidebarUpdated";
import { AdminHeader } from "@/components/features/dashboard/AdminHeader";
import { AdminLoadingSkeletons } from "@/components/features/dashboard/AdminLoadingSkeletons";
import { SubaccountCard } from "@/components/features/dashboard/SubaccountCard";
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
  const {
    loans: marketplaceLoans,
    loading: marketplaceLoading,
  } = useAdminLoans({
    status: "pending",
    enableRealtime: true,
  });

  // CONDICIONALES DESPUÉS DE TODOS LOS HOOKS
  // Mostrar loading mientras verifica permisos
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
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
                <div className="space-y-6">
                  <Card className="bg-white shadow-sm">
                    <CardBody className="p-4">
                      <Input
                        type="text"
                        placeholder="Buscar subcuentas..."
                        startContent={<Search className="text-gray-400" />}
                        className="w-full max-w-md"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </CardBody>
                  </Card>

                  <div className="flex justify-between items-center">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Gestión de Subcuentas
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">
                        Usuario actual: {userEmail}
                      </p>
                    </div>
                    <Button
                      color="success"
                      onPress={() => setIsModalOpen(true)}
                      startContent={<PlusCircle className="w-4 h-4" />}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Crear Subcuenta
                    </Button>
                  </div>

                  {isLoading ? (
                    <AdminLoadingSkeletons.SubaccountsGrid />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredSubaccounts.map((subaccount, index) => (
                        <SubaccountCard
                          key={subaccount.id || index}
                          subaccount={subaccount}
                          onDelete={() => handleDeleteSubaccount(subaccount.id)}
                        />
                      ))}
                      {filteredSubaccounts.length === 0 && (
                        <div className="col-span-full text-center py-8">
                          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">
                            No se encontraron subcuentas
                          </p>
                        </div>
                      )}
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

            {activeTab === "marketplace" && (
              <AdminMarketplaceView />
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
