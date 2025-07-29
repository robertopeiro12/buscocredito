// app/lender/page.tsx
"use client";

// Hook personalizado
import { useLenderDashboard } from "@/hooks/useLenderDashboard";

// Components
import { LenderSidebar } from "@/components/features/dashboard/LenderSidebar";
import { LenderStats } from "@/components/features/dashboard/LenderStats";
import NotificationCenter from "@/components/features/dashboard/NotificationCenter";
import LenderHeader from "@/components/lender/LenderHeader";
import MarketplaceView from "@/components/lender/MarketplaceView";
import MyOffersView from "@/components/lender/MyOffersView";

export default function LenderPage() {
  // Usar el hook personalizado para toda la lógica
  const {
    // Estados
    user,
    partnerData,
    filters,
    lenderState,
    
    // Datos procesados
    requests,
    filteredRequests,
    selectedRequest,
    loading,
    
    // Estados de autenticación
    isAuthorized,
    isCheckingAuth,
    
    // Proposal hook
    proposalData,
    submitting,
    submitError,
    
    // Setters de estado
    setActiveTab,
    handleTabChange,
    
    // Funciones de manejo
    handleSelectRequest,
    handleSubmitOffer,
    handleSignOut,
    handleFilterChange,
    clearFilters,
    handleMakeOffer,
    handleCancelOffer,
    handleBackToMarket,
    updateProposal,
    resetProposal,
  } = useLenderDashboard();

  // CONDICIONALES DE AUTORIZACIÓN
  // Mostrar loading mientras verifica permisos
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos de prestamista...</p>
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
      {/* Fixed Sidebar */}
      <LenderSidebar
        activeTab={lenderState.activeTab}
        setActiveTab={handleTabChange}
        companyName={partnerData.company}
        userId={user}
      />

      {/* Main Content with left margin to account for fixed sidebar */}
      <div className="flex-1 ml-72">
        {/* Header */}
        <div className="px-4 lg:px-6">
          <LenderHeader 
            activeTab={lenderState.activeTab}
            companyName={partnerData.company}
            onTabChange={handleTabChange}
            onSignOut={handleSignOut}
            userId={user}
          />
        </div>

        {/* Content Area */}
        <main className="p-4 lg:p-6">
          {lenderState.activeTab === "marketplace" && (
            <MarketplaceView
              filteredRequests={filteredRequests}
              allRequests={requests}
              selectedRequest={selectedRequest}
              userData={lenderState.userData}
              userDataMap={lenderState.userDataMap}
              loading={loading}
              isCreatingOffer={lenderState.isCreatingOffer}
              filters={filters}
              proposalData={proposalData}
              submitting={submitting}
              submitError={submitError}
              onFilterChange={handleFilterChange}
              onClearFilters={clearFilters}
              onMakeOffer={(requestId) => {
                handleSelectRequest(requestId);
                updateProposal({
                  company: partnerData.company,
                  partner: user,
                });
                handleMakeOffer();
              }}
              onSubmitOffer={handleSubmitOffer}
              onCancelOffer={handleCancelOffer}
              onBackToMarket={handleBackToMarket}
              updateProposal={updateProposal}
              partnerData={partnerData}
              user={user}
            />
          )}

          {lenderState.activeTab === "myoffers" && (
            <MyOffersView
              lenderProposals={lenderState.lenderProposals}
              loadingProposals={lenderState.loadingProposals}
              onGoToMarketplace={() => handleTabChange("marketplace")}
              allRequests={requests}
            />
          )}

          {lenderState.activeTab === "metrics" && (
            <div className="max-w-7xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Métricas y Análisis</h1>
                <p className="text-gray-600">
                  Analiza tu rendimiento como prestamista y encuentra oportunidades de mejora
                </p>
              </div>
              <LenderStats 
                requests={requests}
                proposals={lenderState.lenderProposals}
                detailed={true}
              />
            </div>
          )}

          {lenderState.activeTab === "notifications" && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Centro de Notificaciones</h1>
                <p className="text-gray-600">
                  Mantente al día con todas las actualizaciones importantes
                </p>
              </div>
              <NotificationCenter userId={user} />
            </div>
          )}

          {lenderState.activeTab === "settings" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuración de Cuenta</h1>
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Información de la Empresa</h2>
                    <p className="text-gray-600">Nombre: {partnerData.company}</p>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Configuraciones</h2>
                    <p className="text-gray-600">Próximamente: notificaciones, preferencias, y más.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {lenderState.activeTab === "help" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Centro de Ayuda</h1>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">¿Cómo funciona?</h3>
                    <p className="text-green-700">Encuentra solicitudes de préstamo y envía propuestas competitivas.</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Soporte Técnico</h3>
                    <p className="text-blue-700">¿Tienes problemas? Contáctanos para recibir ayuda personalizada.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
