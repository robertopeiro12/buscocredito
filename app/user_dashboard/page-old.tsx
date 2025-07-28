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
import { useNotification } from "@/components/common/ui/NotificationProvider";
import { 
  UserData, 
  SolicitudData, 
  NewSolicitudData, 
  Offer, 
  CreditFormData, 
  CreditFormProps 
} from "@/types/dashboard";
import { formatDate } from "@/utils/dashboard-utils";
import { ErrorFallback } from "@/components/features/dashboard/ErrorFallback";
import { DashboardSidebar } from "@/components/features/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/features/dashboard/DashboardHeader";
import { OfferCard } from "@/components/features/dashboard/OfferCard";
import { LoanRequestCard } from "@/components/features/dashboard/LoanRequestCard";
import { UserSettings } from "@/components/features/dashboard/UserSettings";
import { HelpCenter } from "@/components/features/dashboard/HelpCenter";
import { 
  AuthLoadingSkeleton, 
  InitialLoadingSkeleton, 
  LoanCardsSkeleton, 
  SettingsLoadingSkeleton 
} from "@/components/features/dashboard/LoadingSkeletons";

export default function DashboardPage() {
  // TODOS LOS HOOKS PRIMERO (sin early returns)
  const { isAuthorized, isLoading: isCheckingAuth } = useUserGuard();
  const dashboardState = useDashboardState();
  
  // Destructure dashboard state for easier access
  const {
    user,
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
    showForm,
    setShowForm,
    showDeleteConfirmation,
    showAcceptConfirmation,
    setShowAcceptConfirmation,
    offerToAccept,
    setOfferToAccept,
    handleSignOut,
    handleErrorClose,
    handleDeleteSolicitud,
    confirmDeleteSolicitud,
    showNotification,
  } = dashboardState;

  // CONDICIONALES DESPUÉS DE TODOS LOS HOOKS
  // Mostrar loading mientras verifica permisos
  if (isCheckingAuth) {
    return <AuthLoadingSkeleton />;
  }

  // Si no está autorizado, el hook ya manejó la redirección
  if (!isAuthorized) {
    return null;
  }

  // Funciones temporales (a mover a servicios en siguientes fases)
  const fetch_offer_data = async (loanId: string) => {
    try {
      dashboardState.setIsLoading((prev) => ({ ...prev, offers: true }));

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

      if (firestoreAcceptedOfferId) {
        setAcceptedOfferId(firestoreAcceptedOfferId);
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
      const offers: Offer[] = data.data?.offers || [];

      // Check if any offer is already accepted based on its status field
      const acceptedOffer = offers.find(
        (offer: Offer) => offer.status === "accepted"
      );

      if (acceptedOffer) {
        setAcceptedOfferId(acceptedOffer.id);
        set_offer_Data([acceptedOffer]);
      } else {
        set_offer_Data(offers);
      }
    } catch (error) {
      dashboardState.setErrors((prev) => ({
        ...prev,
        offers: "Error al cargar las ofertas. Por favor, intenta de nuevo.",
      }));
    } finally {
      dashboardState.setIsLoading((prev) => ({ ...prev, offers: false }));
    }
  };

  const confirmAcceptOffer = (offer: Offer, index: number) => {
    setOfferToAccept({ offer, index });
    setShowAcceptConfirmation(true);
  };

  const handleAcceptOffer = async () => {
    if (!selectedSolicitudId || !offerToAccept) return;

    const { offer, index } = offerToAccept;

    try {
      dashboardState.setIsLoading((prev) => ({ ...prev, offers: true }));

      // Verificamos que la oferta seleccionada tenga un ID
      if (!offer.id) {
        console.error("Error: La oferta seleccionada no tiene ID");
        throw new Error("La oferta seleccionada no tiene ID");
      }

      // Update the proposal status using our new endpoint
      const response = await fetch("/api/proposals/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalId: offer.id,
          loanId: selectedSolicitudId,
          status: "accepted",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error en la respuesta:", errorData);
        throw new Error("Error al aceptar la oferta");
      }

      showNotification({
        message: "Oferta aceptada exitosamente",
        description: `Has aceptado la oferta de ${
          offer.lender_name
        } por $${offer.amount.toLocaleString()}.`,
        type: "success",
      });

      // Update the offer with the accepted status
      const updatedOffer: Offer = {
        ...offer,
        status: "accepted" as const,
      };

      setAcceptedOfferId(offer.id);
      set_offer_Data([updatedOffer]);

      // Also update the solicitud status
      const db = getFirestore();
      const solicitudRef = doc(db, "solicitudes", selectedSolicitudId);
      await updateDoc(solicitudRef, {
        status: "approved",
        updatedAt: new Date().toISOString(),
        acceptedOfferId: offer.id,
      });

      // Refresh solicitudes list
      dashboardState.refreshSolicitudes();

      // Close the modal
      setShowAcceptConfirmation(false);
      setOfferToAccept(null);

      // Store in localStorage
      try {
        const acceptedOffers = JSON.parse(
          localStorage.getItem("acceptedOffers") || "{}"
        );
        acceptedOffers[selectedSolicitudId] = offer.id;
        localStorage.setItem("acceptedOffers", JSON.stringify(acceptedOffers));
      } catch (err) {
        console.error("Error saving to localStorage", err);
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
      showNotification({
        message: "Error al aceptar la oferta",
        description:
          "No se pudo aceptar la oferta. Por favor, intenta de nuevo.",
        type: "error",
      });
    } finally {
      dashboardState.setIsLoading((prev) => ({ ...prev, offers: false }));
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
      showNotification({
        type: "error",
        message: "Error al obtener ofertas",
        description:
          "No se pudieron cargar las ofertas. Por favor, intenta más tarde.",
      });
    }
  };

  const addSolicitud = async (data: CreditFormData) => {
    const solicitudData: NewSolicitudData = {
      ...data,
      userId: user?.uid || "",
      income: Number(data.income),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const db = getFirestore();
      await addDoc(collection(db, "solicitudes"), solicitudData);
      dashboardState.refreshSolicitudes();
      setShowForm(false);
      
      showNotification({
        type: "success",
        message: "Solicitud creada con éxito",
        description: "Tu solicitud de préstamo ha sido enviada correctamente.",
      });
    } catch (error) {
      console.error("Error al guardar solicitud:", error);
      showNotification({
        type: "error",
        message: "Error al crear la solicitud",
        description: "Por favor, intenta nuevamente más tarde.",
      });
    }
  };

  const handleUpdateUserData = async (data: any) => {
    try {
      showNotification({
        type: "success",
        message: "Datos actualizados",
        description: "Tus datos han sido actualizados correctamente.",
      });
    } catch (error) {
      showNotification({
        type: "error",
        message: "Error al actualizar datos",
        description: "Por favor, verifica la información e intenta nuevamente.",
      });
    }
  };

  const fetch_offer_data = async (loanId: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, offers: true }));

      // Check if we already know about an accepted offer from localStorage
      let storedAcceptedOfferId = null;
      // try {
      //   const acceptedOffers = JSON.parse(localStorage.getItem('acceptedOffers') || '{}');
      //   storedAcceptedOfferId = acceptedOffers[loanId] || null;
      // } catch (err) {
      //   console.error('Error reading from localStorage', err);
      // }

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

      // If we know about an accepted offer from either source, set it
      if (storedAcceptedOfferId || firestoreAcceptedOfferId) {
        const acceptedId = storedAcceptedOfferId || firestoreAcceptedOfferId;
        setAcceptedOfferId(acceptedId);
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
      const offers: Offer[] = data.data?.offers || [];

      // Check if any offer is already accepted based on its status field
      const acceptedOffer = offers.find(
        (offer: Offer) => offer.status === "accepted"
      );

      // If we've already identified an accepted offer ID, try to find that offer
      const knownAcceptedId = storedAcceptedOfferId || firestoreAcceptedOfferId;
      const knownAcceptedOffer = knownAcceptedId
        ? offers.find((offer: Offer) => offer.id === knownAcceptedId)
        : null;

      if (acceptedOffer) {
        // If an offer is explicitly marked as accepted, use that
        setAcceptedOfferId(acceptedOffer.id);
        set_offer_Data([acceptedOffer]);
      } else if (knownAcceptedOffer) {
        // If we've identified an accepted offer from storage/Firestore, use that
        // But add the accepted status to it
        const updatedOffer: Offer = {
          ...knownAcceptedOffer,
          status: "accepted" as const,
        };
        setAcceptedOfferId(knownAcceptedOffer.id);
        set_offer_Data([updatedOffer]);
      } else {
        // No accepted offer found, check if we need to look up additional information about acceptance
        try {
          // Additional fetch to check accepted status from server
          const statusCheckResponse = await fetch("/api/loans/status", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ loanId }),
          });

          if (statusCheckResponse.ok) {
            const statusData = await statusCheckResponse.json();
            if (statusData.acceptedOfferId) {
              // Find the accepted offer in our current offers
              const foundOffer = offers.find(
                (o: Offer) => o.id === statusData.acceptedOfferId
              );
              if (foundOffer) {
                const updatedOffer: Offer = {
                  ...foundOffer,
                  status: "accepted" as const,
                };
                setAcceptedOfferId(foundOffer.id);
                set_offer_Data([updatedOffer]);

                // Also update local storage
                try {
                  const acceptedOffers = JSON.parse(
                    localStorage.getItem("acceptedOffers") || "{}"
                  );
                  acceptedOffers[loanId] = foundOffer.id;
                  localStorage.setItem(
                    "acceptedOffers",
                    JSON.stringify(acceptedOffers)
                  );
                } catch (err) {
                  console.error("Error saving to localStorage", err);
                }
                return;
              }
            }
          }
        } catch (statusCheckError) {
          console.error("Error checking offer status:", statusCheckError);
          // Continue with all offers if there's an error
        }

        // If we get here, no accepted offer was found
        set_offer_Data(offers);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        offers: "Error al cargar las ofertas. Por favor, intenta de nuevo.",
      }));
    } finally {
      setIsLoading((prev) => ({ ...prev, offers: false }));
    }
  };

  const deleteSolicitud = async (solicitudId: string) => {
    const db = getFirestore();
    await deleteDoc(doc(db, "solicitudes", solicitudId));
    fetchSolicitudes(user?.uid || "");
    setShowDeleteConfirmation(false);
  };

  const addSolicitud = async (data: CreditFormData) => {
    const solicitudData: NewSolicitudData = {
      ...data,
      userId: user?.uid || "",
      income: Number(data.income),
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    try {
      const db = getFirestore();
      await addDoc(collection(db, "solicitudes"), solicitudData);
      fetchSolicitudes(user?.uid || "");
      setShowForm(false);
      
      // Mostrar mensaje de éxito
      alert("¡Solicitud creada exitosamente!");
    } catch (error) {
      console.error("Error al guardar solicitud:", error);
      alert("Error al guardar la solicitud. Inténtalo de nuevo.");
    }
  };

  const openBanksModal = async (solicitudId: string) => {
    setSelectedSolicitudId(solicitudId);

    // First check if we have a record of this solicitud having an accepted offer in localStorage
    // try {
    //   const acceptedOffers = JSON.parse(localStorage.getItem('acceptedOffers') || '{}');
    //   if (acceptedOffers[solicitudId]) {
    //     setAcceptedOfferId(acceptedOffers[solicitudId]);
    //   } else {
    //     setAcceptedOfferId(null);
    //   }
    // } catch (err) {
    //   console.error('Error reading from localStorage', err);
    // }

    // Also check if this solicitud is already marked as approved in Firestore
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

      // if (offer_data && offer_data.length > 0) {
      //   // Check if we found an accepted offer
      //   if (acceptedOfferId) {
      //     showNotification({
      //       type: "success",
      //       message: "Oferta aceptada",
      //       description: "Estás viendo la oferta que has aceptado para esta solicitud.",
      //     });
      //   } else {
      //     showNotification({
      //       type: "info",
      //       message: "Ofertas disponibles",
      //       description: "Se han encontrado ofertas para tu solicitud.",
      //     });
      //   }
      // } else {
      //   showNotification({
      //     type: "warning",
      //     message: "Sin ofertas disponibles",
      //     description:
      //       "No se encontraron ofertas para tu solicitud en este momento.",
      //   });
      // }
    } catch (error) {
      showNotification({
        type: "error",
        message: "Error al obtener ofertas",
        description:
          "No se pudieron cargar las ofertas. Por favor, intenta más tarde.",
      });
    } finally {
      // Always open the modal, even if there was an error loading offers
      setShowBanksModal(true);
    }
  };

  // Function to open the confirmation modal for accepting an offer
  const confirmAcceptOffer = (offer: Offer, index: number) => {
    setOfferToAccept({ offer, index });
    setShowAcceptConfirmation(true);
  };

  // Function to handle accepting an offer
  const handleAcceptOffer = async () => {
    if (!selectedSolicitudId || !offerToAccept) return;

    const { offer, index } = offerToAccept;

    try {
      setIsLoading((prev) => ({ ...prev, offers: true }));

      // Verificamos que la oferta seleccionada tenga un ID
      if (!offer.id) {
        console.error("Error: La oferta seleccionada no tiene ID");
        throw new Error("La oferta seleccionada no tiene ID");
      }

      // Update the proposal status using our new endpoint
      const response = await fetch("/api/proposals/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          proposalId: offer.id, // Enviamos solo el ID de la propuesta seleccionada
          loanId: selectedSolicitudId,
          status: "accepted",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error en la respuesta:", errorData);
        throw new Error("Error al aceptar la oferta");
      }

      const successData = await response.json();
      console.log("Respuesta exitosa:", successData);

      showNotification({
        message: "Oferta aceptada exitosamente",
        description: `Has aceptado la oferta de ${
          offer.lender_name
        } por $${offer.amount.toLocaleString()}.`,
        type: "success",
      });

      // Update the offer with the accepted status
      const updatedOffer: Offer = {
        ...offer,
        status: "accepted" as const,
      };

      // Set the accepted offer ID
      setAcceptedOfferId(offer.id);

      // Filter offers to show only the accepted one with updated status
      set_offer_Data([updatedOffer]);

      // Also update the solicitud status to show that it has an accepted offer
      const db = getFirestore();
      const solicitudRef = doc(db, "solicitudes", selectedSolicitudId);
      await updateDoc(solicitudRef, {
        status: "approved",
        updatedAt: new Date().toISOString(),
        acceptedOfferId: offer.id,
      });

      // Refresh solicitudes list in the background
      fetchSolicitudes(user?.uid || "");

      // Close the modal
      setShowAcceptConfirmation(false);
      setOfferToAccept(null);

      // Store the accepted status in local storage to maintain state between reloads
      try {
        const acceptedOffers = JSON.parse(
          localStorage.getItem("acceptedOffers") || "{}"
        );
        acceptedOffers[selectedSolicitudId] = offer.id;
        localStorage.setItem("acceptedOffers", JSON.stringify(acceptedOffers));
      } catch (err) {
        console.error("Error saving to localStorage", err);
      }
    } catch (error) {
      console.error("Error accepting offer:", error);
      showNotification({
        message: "Error al aceptar la oferta",
        description:
          "No se pudo aceptar la oferta. Por favor, intenta de nuevo.",
        type: "error",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, offers: false }));
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser(null);
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const handleErrorClose = (key: keyof typeof errors) => {
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleSolicitudSubmit = async (formData: CreditFormData) => {
    try {
      await addSolicitud(formData);
      showNotification({
        type: "success",
        message: "Solicitud creada con éxito",
        description: "Tu solicitud de préstamo ha sido enviada correctamente.",
      });
      setShowForm(false);
    } catch (error) {
      showNotification({
        type: "error",
        message: "Error al crear la solicitud",
        description: "Por favor, intenta nuevamente más tarde.",
      });
    }
  };

  const handleDeleteSolicitud = async (id: string) => {
    try {
      await deleteSolicitud(id);
      showNotification({
        type: "success",
        message: "Solicitud eliminada",
        description: "La solicitud ha sido eliminada correctamente.",
      });
    } catch (error) {
      showNotification({
        type: "error",
        message: "Error al eliminar la solicitud",
        description: "Por favor, intenta nuevamente más tarde.",
      });
    }
  };

  const handleUpdateUserData = async (data: any) => {
    try {
      await fetchUserData(user?.uid || "");
      showNotification({
        type: "success",
        message: "Datos actualizados",
        description: "Tus datos han sido actualizados correctamente.",
      });
    } catch (error) {
      showNotification({
        type: "error",
        message: "Error al actualizar datos",
        description: "Por favor, verifica la información e intenta nuevamente.",
      });
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        dashboardState.resetErrors();
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
              addSolicitud={addSolicitud}
              resetForm={() => setShowForm(false)}
            />
          )}
        </AnimatePresence>

        <Modal
          isOpen={showDeleteConfirmation}
          onClose={() => dashboardState.setShowDeleteConfirmation(false)}
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
                onPress={() => dashboardState.setShowDeleteConfirmation(false)}
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

// FIxear ofertas no disponibles
