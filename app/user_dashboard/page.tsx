"use client";

import { useState } from "react";
import { useUserGuard } from "@/hooks/useRoleGuard";
import { useDashboardState } from "@/hooks/useDashboardState";
import {
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@nextui-org/react";
import {
  PlusCircle,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import CreditForm from "@/components/features/loans/CreditForm";
import { AnimatePresence } from "framer-motion";
import ErrorNotification from "@/components/common/ui/ErrorNotification";
import { ErrorBoundary } from "react-error-boundary";
import { OfferCard } from "@/components/features/dashboard/OfferCard";
import { LoanRequestCard } from "@/components/features/dashboard/LoanRequestCard";
import { DashboardSidebar } from "@/components/features/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { UserSettings } from "@/components/features/dashboard/UserSettings";
import { HelpCenter } from "@/components/features/dashboard/HelpCenter";
import { ErrorFallback } from "@/components/features/dashboard/ErrorFallback";
import { 
  AuthLoadingSkeleton, 
  InitialLoadingSkeleton, 
  LoanCardsSkeleton, 
  SettingsLoadingSkeleton 
} from "@/components/features/dashboard/LoadingSkeletons";
import {
  doc,
  getFirestore,
  getDoc,
} from "firebase/firestore";

export default function DashboardPage() {
  // TODOS LOS HOOKS PRIMERO
  const { isAuthorized, isLoading: isCheckingAuth } = useUserGuard();
  const dashboardState = useDashboardState();
  
  // Local state for modals
  const [showForm, setShowForm] = useState(false);
  const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);
  const [offerToAccept, setOfferToAccept] = useState<{ offer: any; index: number } | null>(null);
  
  // Destructure dashboard state for easier access
  const {
    activeTab,
    setActiveTab,
    isLoading,
    errors,
    userData,
    solicitudes,
    offerCounts,
    offer_data,
    acceptedOfferId,
    selectedSolicitudId,
    setSelectedSolicitudId,
    set_offer_Data,
    setAcceptedOfferId,
    showDeleteConfirmation,
    setShowDeleteConfirmation,
    handleSignOut,
    handleErrorClose,
    handleDeleteSolicitud,
    confirmDeleteSolicitud,
    refreshSolicitudes,
    setErrors,
    resetErrors,
  } = dashboardState;

  // CONDICIONALES DESPUÉS DE TODOS LOS HOOKS
  if (isCheckingAuth) {
    return <AuthLoadingSkeleton />;
  }

  if (!isAuthorized) {
    return null; // El guard ya maneja la redirección
  }

  // Helper functions - lógica original exacta
  const fetch_offer_data = async (loanId: string) => {
    try {
      setErrors({
        ...errors,
        offers: null
      });

      // Also check if the solicitud is marked as approved in Firestore
      let firestoreAcceptedOfferId = null;
      try {
        const db = getFirestore();
        const solicitudDoc = await getDoc(doc(db, "solicitudes", loanId));
        if (
          solicitudDoc.exists() &&
          solicitudDoc.data().status === "approved" &&
          solicitudDoc.data().acceptedOfferId
        ) {
          firestoreAcceptedOfferId = solicitudDoc.data().acceptedOfferId;
        }
      } catch (err) {
        console.error("Error checking solicitud status", err);
      }

      // Fetch offers as normal
      const response = await fetch("/api/loans/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loanId }),
      });

      if (!response.ok) {
        throw new Error("Error al obtener las ofertas");
      }

      const data = await response.json();
      const offers = data.data?.offers || [];

      // Check if any offer is already accepted based on its status field OR firestoreAcceptedOfferId
      const acceptedOffer = offers.find(
        (offer: any) => offer.status === "accepted" || offer.id === firestoreAcceptedOfferId
      );

      if (acceptedOffer || firestoreAcceptedOfferId) {
        // Si hay una oferta aceptada, establecer el ID y mostrar SOLO esa oferta
        const acceptedId = acceptedOffer?.id || firestoreAcceptedOfferId;
        setAcceptedOfferId(acceptedId);
        
        if (acceptedOffer) {
          set_offer_Data([acceptedOffer]); // Solo mostrar la oferta aceptada
        } else {
          // Si tenemos el ID pero no encontramos la oferta en la lista, filtrar por ID
          const filteredOffer = offers.filter((offer: any) => offer.id === firestoreAcceptedOfferId);
          set_offer_Data(filteredOffer);
        }
      } else {
        // Si no hay ofertas aceptadas, mostrar todas
        setAcceptedOfferId(null);
        set_offer_Data(offers);
      }
    } catch (error) {
      setErrors({
        ...errors,
        offers: "Error al cargar las ofertas. Por favor, intenta de nuevo.",
      });
    }
  };

  const openBanksModal = async (solicitudId: string) => {
    setSelectedSolicitudId(solicitudId);

    try {
      const db = getFirestore();
      const solicitudDoc = await getDoc(doc(db, "solicitudes", solicitudId));
      if (
        solicitudDoc.exists() &&
        solicitudDoc.data().status === "approved" &&
        solicitudDoc.data().acceptedOfferId
      ) {
        setAcceptedOfferId(solicitudDoc.data().acceptedOfferId);
      }
    } catch (err) {
      console.error("Error checking solicitud status", err);
    }

    try {
      await fetch_offer_data(solicitudId);
    } catch (error) {
      // Usar notificación simple en consola
      console.error("Error al obtener ofertas:", error);
    }
  };

  const confirmAcceptOffer = (offer: any, index: number) => {
    setOfferToAccept({ offer, index });
    setShowAcceptConfirmation(true);
  };

  const handleAcceptOffer = async () => {
    if (!offerToAccept || !selectedSolicitudId) return;
    
    try {
      // Lógica básica original - solo actualizar estado local
      setAcceptedOfferId(offerToAccept.offer.id);
      setShowAcceptConfirmation(false);
      setOfferToAccept(null);
    } catch (error) {
      console.error("Error accepting offer:", error);
    }
  };

  const handleSolicitudSubmit = async (data: any) => {
    try {
      // Usar las funciones del hook original
      await refreshSolicitudes();
      setShowForm(false);
    } catch (error) {
      console.error("Error creating solicitud:", error);
    }
  };

  const handleUpdateUserData = async (data: any) => {
    try {
      // Placeholder para actualización de datos
      console.log("Update user data:", data);
    } catch (error) {
      console.error("Error updating user data:", error);
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        resetErrors();
      }}
    >
      <div className="flex min-h-[calc(100vh-64px)] bg-gray-50">
        <AnimatePresence>
          {errors.loans && (
            <ErrorNotification
              key="error-loans"
              message={errors.loans}
              onClose={() => handleErrorClose("loans")}
            />
          )}
          {errors.settings && (
            <ErrorNotification
              key="error-settings"
              message={errors.settings}
              onClose={() => handleErrorClose("settings")}
            />
          )}
          {errors.offers && (
            <ErrorNotification
              key="error-offers"
              message={errors.offers}
              onClose={() => handleErrorClose("offers")}
            />
          )}
        </AnimatePresence>

        {isLoading.initial ? (
          <InitialLoadingSkeleton />
        ) : (
          <>
            {/* Sidebar */}
            <DashboardSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onSignOut={handleSignOut}
            />

            {/* Main Content */}
            <div className="flex-1">
              <DashboardHeader activeTab={activeTab} />

              <main className="p-8 relative">
                {activeTab === "loans" && (
                  <>
                    <div className="space-y-6">
                      {isLoading.loans ? (
                        <LoanCardsSkeleton />
                      ) : (
                        <div className="space-y-8">
                          {selectedSolicitudId &&
                          offer_data &&
                          offer_data.length > 0 ? (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold text-gray-900">
                                  {acceptedOfferId
                                    ? "Oferta Aceptada"
                                    : "Ofertas Disponibles"}
                                </h2>
                                <Button
                                  variant="light"
                                  onPress={() => {
                                    setSelectedSolicitudId(null);
                                    setAcceptedOfferId(null);
                                    set_offer_Data([]);
                                  }}
                                  size="sm"
                                  endContent={
                                    <ChevronRight className="w-4 h-4 rotate-180" />
                                  }
                                >
                                  Volver a Préstamos
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {offer_data.map((offer, idx) => (
                                  <OfferCard
                                    key={`offer-${offer.id || idx}`}
                                    offer={offer}
                                    index={idx}
                                    acceptedOfferId={acceptedOfferId}
                                    onAcceptOffer={confirmAcceptOffer}
                                  />
                                ))}
                              </div>
                              {acceptedOfferId && (
                                <div className="mt-8 flex justify-center">
                                  <p className="text-sm text-gray-500 mb-4 text-center max-w-md">
                                    Has aceptado esta oferta. El prestamista se
                                    pondrá en contacto contigo para los
                                    siguientes pasos.
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                              {solicitudes.map((solicitud) => (
                                <LoanRequestCard
                                  key={solicitud.id}
                                  solicitud={solicitud}
                                  offerCount={offerCounts[solicitud.id] || 0}
                                  onViewOffers={openBanksModal}
                                  onDelete={handleDeleteSolicitud}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <Button
                      color="primary"
                      endContent={<PlusCircle className="w-4 h-4" />}
                      className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 shadow-lg z-50"
                      onPress={() => setShowForm(true)}
                    >
                      Solicitar Préstamo
                    </Button>
                  </>
                )}

                {activeTab === "settings" && (
                  <>
                    {isLoading.settings ? (
                      <SettingsLoadingSkeleton />
                    ) : (
                      <UserSettings
                        userData={userData}
                        onUpdate={handleUpdateUserData}
                      />
                    )}
                  </>
                )}

                {activeTab === "help" && <HelpCenter />}
              </main>
            </div>
          </>
        )}

        <AnimatePresence>
          {showForm && (
            <CreditForm
              addSolicitud={handleSolicitudSubmit}
              resetForm={() => setShowForm(false)}
            />
          )}
        </AnimatePresence>

        <Modal
          isOpen={showDeleteConfirmation}
          onClose={() => setShowDeleteConfirmation(false)}
        >
          <ModalContent>
            <ModalHeader className="border-b">
              Confirmar Eliminación
            </ModalHeader>
            <ModalBody>
              <p className="text-gray-600">
                ¿Estás seguro de que deseas eliminar esta solicitud de préstamo?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Esta acción no se puede deshacer.
              </p>
            </ModalBody>
            <ModalFooter className="border-t">
              <Button
                color="danger"
                onPress={confirmDeleteSolicitud}
              >
                Eliminar
              </Button>
              <Button
                color="default"
                variant="light"
                onPress={() => setShowDeleteConfirmation(false)}
              >
                Cancelar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Accept Offer Confirmation Modal */}
        <Modal
          isOpen={showAcceptConfirmation}
          onOpenChange={setShowAcceptConfirmation}
          backdrop="blur"
        >
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  ¿Aceptar esta oferta?
                </ModalHeader>
                <ModalBody>
                  {offerToAccept && (
                    <div className="space-y-4">
                      <p>
                        Estás a punto de aceptar la oferta de{" "}
                        <span className="font-semibold">
                          {offerToAccept.offer.lender_name}
                        </span>{" "}
                        por{" "}
                        <span className="font-semibold text-green-600">
                          ${offerToAccept.offer.amount.toLocaleString()}
                        </span>
                      </p>
                      <div className="bg-amber-50 p-3 rounded-md border border-amber-200">
                        <p className="text-amber-800 text-sm font-medium">
                          Importante
                        </p>
                        <ul className="text-sm text-amber-700 list-disc pl-5 mt-2 space-y-1">
                          <li>
                            Al aceptar esta oferta, las demás ofertas para esta
                            solicitud se marcarán como rechazadas.
                          </li>
                          <li>
                            Solo el prestamista de la oferta aceptada podrá ver
                            tu solicitud.
                          </li>
                          <li>
                            Tu solicitud ya no será visible para otros
                            prestamistas.
                          </li>
                          <li>
                            No podrás deshacer esta acción después de confirmar.
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="light"
                    onPress={onClose}
                    isDisabled={isLoading.offers}
                  >
                    Cancelar
                  </Button>
                  <Button
                    color="success"
                    onPress={handleAcceptOffer}
                    isLoading={isLoading.offers}
                  >
                    Confirmar y Aceptar
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </ErrorBoundary>
  );
}
