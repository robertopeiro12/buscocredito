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
import { Search, PlusCircle, User } from "lucide-react";
import { AdminSidebar } from "@/components/features/dashboard/AdminSidebar";
import { SubaccountCard } from "@/components/features/dashboard/SubaccountCard";
import { MetricsHeader } from "@/components/admin/MetricsHeader";
import { EmptyMetricsState } from "@/components/admin/EmptyMetricsState";
import { DateRangeModal } from "@/components/admin/DateRangeModal";
import { TotalProposalsCard } from "@/components/admin/metrics/TotalProposalsCard";
import { DistributionPieCard } from "@/components/admin/metrics/DistributionPieCard";
import { InterestRateCard } from "@/components/admin/metrics/InterestRateCard";
import { AverageAmountCard } from "@/components/admin/metrics/AverageAmountCard";
import { useAdminDashboard } from "@/hooks/useAdminDashboard";

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
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {activeTab === "subaccounts" && "Gestionar Subcuentas"}
              {activeTab === "settings" && "Configuración de Administrador"}
              {activeTab === "help" && "Centro de Ayuda"}
              {activeTab === "metrics" && "Dashboard de Métricas"}
            </h1>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto relative">
          {activeTab === "subaccounts" && (
            <>
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

                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Spinner color="success" size="lg" />
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSubaccounts.map((subaccount) => (
                      <SubaccountCard
                        key={subaccount.id}
                        subaccount={subaccount}
                        onDelete={handleDeleteSubaccount}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Botón flotante para crear subcuenta */}
              <Button
                className="fixed bottom-8 right-8 shadow-lg hover:shadow-xl transition-shadow duration-200 px-6"
                color="success"
                onPress={() => setIsModalOpen(true)}
                startContent={<PlusCircle className="w-5 h-5" />}
                size="lg"
              >
                Crear Subcuenta
              </Button>
            </>
          )}

          {activeTab === "settings" && (
            <Card className="bg-white max-w-4xl mx-auto">
              <CardBody className="p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {adminData.Empresa || "Nombre de la Empresa"}
                    </h2>
                    <p className="text-gray-500">{userEmail}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Datos de la Empresa */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      DATOS DE LA EMPRESA
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Nombre de la Empresa
                        </p>
                        <p className="text-gray-900">{adminData.Empresa}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Correo electrónico
                        </p>
                        <p className="text-gray-900">{adminData.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button color="primary">Modificar Información</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === "help" && (
            <Card className="bg-white max-w-2xl mx-auto">
              <CardBody className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Centro de Ayuda para Administradores
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Gestión de Subcuentas
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          ¿Cómo crear una subcuenta?
                        </h4>
                        <p className="text-gray-600">
                          Para crear una subcuenta, ve a la sección de
                          "Subcuentas" y haz clic en el botón "Crear Subcuenta".
                          Completa el formulario con la información del
                          trabajador y guarda los cambios.
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          ¿Cómo monitorear la actividad de las subcuentas?
                        </h4>
                        <p className="text-gray-600">
                          Desde el panel de administrador puedes ver todas las
                          subcuentas creadas y su información básica. Para un
                          análisis más detallado de la actividad de cada
                          trabajador, próximamente implementaremos un sistema de
                          reportes que te permitirá visualizar métricas como
                          número de ofertas realizadas, préstamos aprobados y
                          tasas de conversión por cada subcuenta.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Soporte Técnico
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 mb-2">
                        Si necesitas asistencia técnica, contáctanos:
                      </p>
                      <ul className="space-y-2 text-gray-600">
                        <li>Email: soporte@buscocredito.com</li>
                        <li>Teléfono: (55) 1234-5678</li>
                        <li>Horario: Lunes a Viernes, 9:00 AM - 6:00 PM</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === "metrics" && (
            <div className="space-y-6">
              <MetricsHeader
                selectedTimeRange={selectedTimeRange}
                setSelectedTimeRange={setSelectedTimeRange}
                handleOpenDateRangeModal={handleOpenDateRangeModal}
              />

              {isLoadingMetrics ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner color="success" size="lg" />
                </div>
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
                      gradientFrom="from-blue-50"
                      gradientTo="to-indigo-50"
                      textColor="text-blue-800"
                      data={metricsData.loanTypeDistribution}
                      colors={{
                        backgroundColor: [
                          "rgba(59, 130, 246, 0.85)",
                          "rgba(16, 185, 129, 0.85)",
                          "rgba(139, 92, 246, 0.85)",
                          "rgba(245, 158, 11, 0.85)",
                          "rgba(239, 68, 68, 0.85)",
                        ],
                        borderColor: [
                          "rgb(30, 64, 175)",
                          "rgb(5, 150, 105)",
                          "rgb(109, 40, 217)",
                          "rgb(180, 83, 9)",
                          "rgb(185, 28, 28)",
                        ],
                      }}
                      chartOptions={metricsData.chartOptions?.pie}
                      getTopDistributionItems={getTopDistributionItems}
                    />

                    {/* Distribución por propósito */}
                    <DistributionPieCard
                      title="Distribución por Propósito"
                      gradientFrom="from-purple-50"
                      gradientTo="to-pink-50"
                      textColor="text-purple-800"
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
                    />

                    {/* Distribución por frecuencia de pago */}
                    <DistributionPieCard
                      title="Distribución por Frecuencia de Pago"
                      gradientFrom="from-yellow-50"
                      gradientTo="to-orange-50"
                      textColor="text-yellow-800"
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
                </div>
              )}
            </div>
          )}
        </main>
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
    </div>
  );
}
