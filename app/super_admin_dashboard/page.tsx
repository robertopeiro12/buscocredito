"use client";

import { Card, CardBody, Button } from "@heroui/react";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useSuperAdminDashboard } from "@/hooks/useSuperAdminDashboard";
import {
  SuperAdminSidebar,
  SuperAdminLoadingScreen,
  StatsCards,
  AccountsTable,
  AccountDetailModal,
  ConfirmActionModal,
  SystemInfoCards,
  TokenManagement,
  BetaManagement,
} from "@/components/superadmin";
import type { AccountInfo } from "@/types/superadmin";

export default function SuperAdminDashboard() {
  const {
    // Auth states
    isAuthorized,
    isCheckingAuth,

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
    getAuthToken,
    fetchAccountsAndStats,
    fetchSystemInfo,
    handleConfirmAction,
    handleSignOut,
  } = useSuperAdminDashboard();

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

  const TAB_META: Record<string, { title: string; description: string }> = {
    overview:  { title: "Resumen del Sistema",  description: "Vista general de cuentas y actividad de la plataforma" },
    accounts:  { title: "Gestión de Cuentas",   description: "Administra y supervisa todas las cuentas registradas" },
    tokens:    { title: "Tokens de Registro",   description: "Gestiona tokens de acceso para nuevas instituciones" },
    beta:      { title: "Accesos Beta",          description: "Controla el acceso a la demo privada" },
    database:  { title: "Base de Datos",         description: "Información de colecciones de Firestore" },
    system:    { title: "Estado del Sistema",    description: "Salud y rendimiento del servidor" },
    settings:  { title: "Configuración",         description: "Ajustes avanzados del sistema" },
  };

  const TabHeader = () => {
    const meta = TAB_META[activeTab];
    if (!meta) return null;
    return (
      <div className="mb-4 pb-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900 mb-0.5">{meta.title}</h1>
        <p className="text-gray-500 text-sm">{meta.description}</p>
      </div>
    );
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="space-y-6">
            <TabHeader />
            <div className="flex justify-end">
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
            <TabHeader />
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

      case "tokens":
        return (
          <div className="space-y-6">
            <TabHeader />
            <TokenManagement />
          </div>
        );

      case "beta":
        return (
          <div className="space-y-6">
            <TabHeader />
            <BetaManagement getAuthToken={getAuthToken} />
          </div>
        );

      case "database":
        return (
          <div className="space-y-6">
            <TabHeader />
            <div className="flex justify-end">
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
            <TabHeader />
            <div className="flex justify-end">
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
              databaseInfo={null}
              serverHealth={serverHealth}
              isLoading={isLoading}
            />
          </div>
        );

      case "settings":
        return (
          <div className="space-y-6">
            <TabHeader />
            <Card>
              <CardBody>
                <p className="text-gray-500">
                  La configuración avanzada estará disponible próximamente.
                </p>
                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Zona de Precaución</span>
                  </div>
                  <p className="text-sm text-yellow-600 mt-2">
                    Las opciones de configuración que afectan a todo el sistema
                    estarán protegidas con confirmación adicional.
                  </p>
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
    <div className="flex min-h-screen bg-gray-50">
      <SuperAdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSignOut={handleSignOut}
      />

      <div className="flex-1 ml-64">
        <main className="px-4 lg:px-6 pb-4 lg:pb-6 pt-4 lg:pt-6">
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

      <ConfirmActionModal
        isOpen={isConfirmModalOpen}
        action={confirmAction}
        onConfirm={handleConfirmAction}
        onClose={() => {
          setIsConfirmModalOpen(false);
          setConfirmAction(null);
        }}
      />
    </div>
  );
}
