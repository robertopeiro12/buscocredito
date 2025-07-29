// app/lender/page.tsx
"use client";

// Hook personalizado
import { useLenderDashboard } from "@/hooks/useLenderDashboard";

// Components
import { LenderSidebar } from "@/components/features/dashboard/LenderSidebar";
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
      <LenderSidebar
        activeTab={lenderState.activeTab}
        setActiveTab={handleTabChange}
        handleSignOut={handleSignOut}
        companyName={partnerData.company}
        userId={user}
      />

      <div className="flex-1">
        {/* Header */}
        <LenderHeader 
          activeTab={lenderState.activeTab}
          companyName={partnerData.company}
        />

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
          />
        )}

        {lenderState.activeTab === "settings" && (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          </div>
        )}

        {lenderState.activeTab === "help" && (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900">Ayuda</h1>
          </div>
        )}
      </div>
    </div>
  );
}
