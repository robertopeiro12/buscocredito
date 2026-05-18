// app/lender/page.tsx
"use client";

import { Suspense, useState, useEffect } from "react";
import { Building2, Mail, Bell, BookOpen, Headphones } from "lucide-react";
import { Switch } from "@heroui/react";

// Hook personalizado
import { useLenderDashboard } from "@/hooks/useLenderDashboard";

// Components
import { LenderSidebar } from "@/components/features/dashboard/LenderSidebar";
import { LenderStats } from "@/components/features/dashboard/LenderStats";
import NotificationHistory from "@/components/features/dashboard/NotificationHistory";
import LenderHeader from "@/components/lender/LenderHeader";
import MarketplaceView from "@/components/lender/MarketplaceView";
import MyOffersView from "@/components/lender/MyOffersView";

function LenderPageContent() {
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

  // Local state for settings
  const [lenderEmailNotifications, setLenderEmailNotifications] = useState(true);

  // Fetch email notification preference on mount
  useEffect(() => {
    if (!user) return;
    fetch("/api/users/preferences", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.data?.emailNotifications !== undefined) {
          setLenderEmailNotifications(data.data.emailNotifications);
        }
      })
      .catch(() => {
        // Silently ignore — UI will default to true
      });
  }, [user]);

  const handleEmailNotificationsChange = async (value: boolean) => {
    setLenderEmailNotifications(value);
    try {
      await fetch("/api/users/preferences", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user, emailNotifications: value }),
      });
    } catch {
      // Silently ignore — optimistic update already applied
    }
  };

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
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="px-4 lg:px-6">
          <LenderHeader 
            activeTab={lenderState.activeTab}
            companyName={partnerData.company}
            onTabChange={handleTabChange}
            onSignOut={handleSignOut}
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
            <NotificationHistory userId={user} isLender={true} />
          )}

          {lenderState.activeTab === "settings" && (
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
                        <p className="text-base font-semibold text-gray-900">{partnerData.company}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#0e3a45]/[0.08] text-[#0e3a45] uppercase tracking-wide">
                            Prestamista
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
                            <p className="text-xs text-gray-500">Recibe alertas cuando una propuesta cambie de estado</p>
                          </div>
                        </div>
                        <Switch
                          color="success"
                          size="sm"
                          isSelected={lenderEmailNotifications}
                          onValueChange={handleEmailNotificationsChange}
                        />
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
                      Para modificar información de la empresa, contacta a tu administrador.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {lenderState.activeTab === "help" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="h-1 bg-green-500 w-full" />
                <div className="p-6">
                  <h1 className="text-xl font-bold text-gray-900 mb-1">Centro de Ayuda</h1>
                  <p className="text-sm text-gray-500 mb-6">Recursos y soporte para prestamistas</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-5 bg-[#0e3a45]/[0.04] border border-[#0e3a45]/10 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-[#0e3a45]/[0.08] flex items-center justify-center mb-3">
                        <BookOpen className="w-4 h-4 text-[#0e3a45]" />
                      </div>
                      <h3 className="text-sm font-semibold text-[#0e3a45] mb-2">¿Cómo funciona?</h3>
                      <p className="text-sm text-gray-600">
                        Explora el mercado, evalúa solicitudes de préstamo y envía propuestas competitivas.
                        Cuando un solicitante acepta tu oferta, recibes sus datos de contacto directamente.
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
  );
}

export default function LenderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando panel de prestamista...</p>
          </div>
        </div>
      }
    >
      <LenderPageContent />
    </Suspense>
  );
}
