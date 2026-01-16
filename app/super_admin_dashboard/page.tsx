"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button } from "@nextui-org/react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useSuperAdminDashboard } from "@/hooks/useSuperAdminDashboard";
import {
  SuperAdminSidebar,
  SuperAdminHeader,
  SuperAdminLoadingScreen,
  StatsCards,
  AccountsTable,
  AccountDetailModal,
  ConfirmActionModal,
  SystemInfoCards,
} from "@/components/superadmin";
import type { AccountInfo } from "@/types/superadmin";

export default function SuperAdminDashboard() {
  const {
    // Auth states
    isAuthorized,
    isCheckingAuth,
    userEmail,

    // Data
    accounts,
    filteredAccounts,
    stats,
    databaseInfo,
    serverHealth,

    // Loading states
    isLoading,
    error,

    // UI state
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    selectedAccount,
    setSelectedAccount,
    isAccountModalOpen,
    setIsAccountModalOpen,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    confirmAction,
    setConfirmAction,

    // Actions
    fetchAccountsAndStats,
    fetchSystemInfo,
    handleConfirmAction,
    handleSignOut,
  } = useSuperAdminDashboard();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle view account
  const handleViewAccount = (account: AccountInfo) => {
    setSelectedAccount(account);
    setIsAccountModalOpen(true);
  };

  // Handle action confirmations
  const handleActivate = (account: AccountInfo) => {
    setConfirmAction({ type: "activate", account });
    setIsConfirmModalOpen(true);
  };

  const handleDeactivate = (account: AccountInfo) => {
    setConfirmAction({ type: "deactivate", account });
    setIsConfirmModalOpen(true);
  };

  const handleDelete = (account: AccountInfo) => {
    setConfirmAction({ type: "delete", account });
    setIsConfirmModalOpen(true);
  };

  // Loading state
  if (isCheckingAuth || !isAuthorized) {
    return <SuperAdminLoadingScreen />;
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Resumen del Sistema
              </h2>
              <Button
                size="sm"
                variant="bordered"
                startContent={<RefreshCw className="w-4 h-4" />}
                onPress={() => {
                  fetchAccountsAndStats();
                  fetchSystemInfo();
                }}
              >
                Actualizar
              </Button>
            </div>
            <StatsCards stats={stats} isLoading={isLoading} />
          </div>
        );

      case "accounts":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Gestión de Cuentas
            </h2>
            <AccountsTable
              accounts={filteredAccounts}
              isLoading={isLoading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onViewAccount={handleViewAccount}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              onDelete={handleDelete}
              onRefresh={fetchAccountsAndStats}
            />
          </div>
        );

      case "stats":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Estadísticas Detalladas
            </h2>
            <StatsCards stats={stats} isLoading={isLoading} />
          </div>
        );

      case "database":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Información de Base de Datos
              </h2>
              <Button
                size="sm"
                variant="bordered"
                startContent={<RefreshCw className="w-4 h-4" />}
                onPress={fetchSystemInfo}
              >
                Actualizar
              </Button>
            </div>
            <SystemInfoCards
              databaseInfo={databaseInfo}
              serverHealth={null}
              isLoading={isLoading}
            />
          </div>
        );

      case "system":
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Estado del Sistema
              </h2>
              <Button
                size="sm"
                variant="bordered"
                startContent={<RefreshCw className="w-4 h-4" />}
                onPress={fetchSystemInfo}
              >
                Actualizar
              </Button>
            </div>
            <SystemInfoCards
              databaseInfo={databaseInfo}
              serverHealth={serverHealth}
              isLoading={isLoading}
            />
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Configuración del Sistema</h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-500">
                  La configuración avanzada estará disponible próximamente.
                </p>
                <div className="mt-4 space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Zona de Precaución</span>
                    </div>
                    <p className="text-sm text-yellow-600 mt-2">
                      Las opciones de configuración que afectan a todo el sistema
                      estarán protegidas con confirmación adicional.
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        );

      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">Selecciona una opción del menú</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <SuperAdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSignOut={handleSignOut}
      />

      {/* Mobile sidebar overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="w-64 h-full bg-white"
            onClick={(e) => e.stopPropagation()}
          >
            <SuperAdminSidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileMenuOpen(false);
              }}
              onSignOut={handleSignOut}
            />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="md:ml-64">
        {/* Header */}
        <SuperAdminHeader
          userEmail={userEmail}
          onSignOut={handleSignOut}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        />

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          )}

          {renderContent()}
        </main>
      </div>

      {/* Account Detail Modal */}
      <AccountDetailModal
        account={selectedAccount}
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setSelectedAccount(null);
        }}
        onActivate={handleActivate}
        onDeactivate={handleDeactivate}
        onDelete={handleDelete}
      />

      {/* Confirm Action Modal */}
      <ConfirmActionModal
        isOpen={isConfirmModalOpen}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmAction}
        action={confirmAction}
      />
    </div>
  );
}
