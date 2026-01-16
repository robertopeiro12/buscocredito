import { useState, useEffect, useCallback, useRef } from "react";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/components/common/ui/NotificationProvider";
import { 
  UserData, 
  SolicitudData, 
  NewSolicitudData,
  Offer, 
  LoadingState, 
  ErrorState, 
  DashboardTab,
  OfferToAccept 
} from "@/types/dashboard";
import {
  fetchUserData,
  fetchSolicitudes,
  fetchOfferCount,
  deleteSolicitud as deleteSolicitudService,
  createSolicitud as createSolicitudService,
} from "@/services/dashboard-service";
export const useDashboardState = () => {
  // User and navigation
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>("loans");
  const router = useRouter();
  const { showNotification } = useNotification();
  const { signOut } = useAuth();

  // Modal states
  const [showBanksModal, setShowBanksModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showAcceptConfirmation, setShowAcceptConfirmation] = useState(false);

  // Data states
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<string | null>(null);
  const [banksData, setBanksData] = useState([]);
  const [solicitudes, setSolicitudes] = useState<SolicitudData[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudData | null>(null);
  const [offer_data, set_offer_Data] = useState<Offer[]>([]);
  const [acceptedOfferId, setAcceptedOfferId] = useState<string | null>(null);
  const [offerToAccept, setOfferToAccept] = useState<OfferToAccept | null>(null);
  const [userData, setUserData] = useState<UserData>({
    name: "",
    last_name: "",
    second_last_name: "",
    email: "",
    rfc: "",
    birthday: null,
    phone: "",
    address: {
      street: "",
      exteriorNumber: "",
      interiorNumber: "",
      colony: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
    creditScore: {
      score: 0,
      classification: "Alto Riesgo",
    },
  });
  const [offerCounts, setOfferCounts] = useState<{ [key: string]: number }>({});

  // Loading and error states
  const [isLoading, setIsLoading] = useState<LoadingState>({
    initial: true,
    loans: false,
    settings: false,
    offers: false,
  });

  const [errors, setErrors] = useState<ErrorState>({
    loans: null,
    settings: null,
    offers: null,
  });

  // Auth effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          setIsLoading((prev) => ({ ...prev, loans: true }));
          const solicitudesData = await fetchSolicitudes(user.uid);
          setSolicitudes(solicitudesData);
          
          // Fetch offer counts
          solicitudesData.forEach((solicitud) => {
            fetchOfferCountForSolicitud(solicitud.id);
          });
          
          setIsLoading((prev) => ({ ...prev, settings: true }));
          const userData = await fetchUserData(user.uid);
          setUserData(userData);
        } catch (error) {
          console.error('Error in useEffect:', error);
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          setErrors((prev) => ({
            ...prev,
            loans: `Error al cargar los préstamos: ${errorMessage}`,
            settings: `Error al cargar la configuración: ${errorMessage}`,
          }));
        } finally {
          setIsLoading((prev) => ({
            ...prev,
            loans: false,
            settings: false,
            initial: false,
          }));
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Ref to track previous offer counts for notification logic
  const prevOfferCountsRef = useRef<{ [key: string]: number }>({});

  // Real-time listener for proposals (propuestas)
  useEffect(() => {
    if (!user?.uid || solicitudes.length === 0) return;

    const db = getFirestore();
    const unsubscribers: (() => void)[] = [];

    // Set up listeners for proposals on each solicitud
    solicitudes.forEach((solicitud) => {
      // Listen for proposals by loanId
      const propuestasQuery = query(
        collection(db, "propuestas"),
        where("loanId", "==", solicitud.id)
      );

      const unsubscribeLoanId = onSnapshot(propuestasQuery, (snapshot) => {
        const count = snapshot.docs.length;
        const prevCount = prevOfferCountsRef.current[solicitud.id];
        
        // Show notification if count increased (outside of setState)
        if (prevCount !== undefined && count > prevCount) {
          showNotification({
            type: "success",
            message: "¡Nueva propuesta recibida!",
            description: `Tienes una nueva propuesta para tu solicitud de ${solicitud.purpose}.`,
          });
        }
        
        // Update ref and state
        prevOfferCountsRef.current[solicitud.id] = count;
        setOfferCounts((prev) => {
          if (prev[solicitud.id] !== count) {
            return { ...prev, [solicitud.id]: count };
          }
          return prev;
        });
      });
      unsubscribers.push(unsubscribeLoanId);

      // Also listen for proposals by solicitudId (backward compatibility)
      const propuestasBySolicitudQuery = query(
        collection(db, "propuestas"),
        where("solicitudId", "==", solicitud.id)
      );

      const unsubscribeSolicitudId = onSnapshot(propuestasBySolicitudQuery, (snapshot) => {
        // We need to combine counts from both queries, but since we're already
        // tracking by loanId, we only update if we find additional documents
        const existingCount = snapshot.docs.length;
        const currentCount = prevOfferCountsRef.current[solicitud.id] || 0;
        
        if (existingCount > currentCount) {
          prevOfferCountsRef.current[solicitud.id] = existingCount;
          setOfferCounts((prev) => ({ ...prev, [solicitud.id]: existingCount }));
        }
      });
      unsubscribers.push(unsubscribeSolicitudId);
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [user?.uid, solicitudes, showNotification]);

  // Helper functions
  const fetchOfferCountForSolicitud = async (loanId: string) => {
    try {
      const count = await fetchOfferCount(loanId);
      setOfferCounts((prev) => ({ ...prev, [loanId]: count }));
    } catch (error) {
      console.error("Error getting offer count:", error);
    }
  };

  const refreshSolicitudes = async () => {
    if (!user?.uid) return;
    try {
      const solicitudesData = await fetchSolicitudes(user.uid);
      setSolicitudes(solicitudesData);
      
      // Refresh offer counts
      solicitudesData.forEach((solicitud) => {
        fetchOfferCountForSolicitud(solicitud.id);
      });
    } catch (error) {
      console.error("Error refreshing solicitudes:", error);
    }
  };

  const handleDeleteSolicitud = async (solicitud: SolicitudData) => {
    setSelectedSolicitud(solicitud);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteSolicitud = async () => {
    if (!selectedSolicitud) return;
    
    try {
      await deleteSolicitudService(selectedSolicitud.id);
      await refreshSolicitudes();
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
    } finally {
      setShowDeleteConfirmation(false);
      setSelectedSolicitud(null);
    }
  };

  const createSolicitud = async (solicitudData: NewSolicitudData) => {
    if (!user?.uid) {
      showNotification({
        type: "error",
        message: "Error de autenticación",
        description: "Usuario no autenticado.",
      });
      return;
    }

    try {
      // Add userId and timestamps to the solicitud data
      const newSolicitudData: NewSolicitudData = {
        ...solicitudData,
        userId: user.uid,
        status: "pending" as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await createSolicitudService(newSolicitudData);
      await refreshSolicitudes();
      
      showNotification({
        type: "success",
        message: "Solicitud creada",
        description: "Tu solicitud de préstamo ha sido creada exitosamente.",
      });
      
      return true;
    } catch (error) {
      console.error("Error creating solicitud:", error);
      showNotification({
        type: "error",
        message: "Error al crear la solicitud",
        description: "Por favor, intenta nuevamente más tarde.",
      });
      return false;
    }
  };

  // Utility functions
  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleErrorClose = (key: keyof ErrorState) => {
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const resetErrors = () => {
    setErrors({
      loans: null,
      settings: null,
      offers: null,
    });
  };

  return {
    // User and navigation
    user,
    activeTab,
    setActiveTab,
    router,

    // Modal states
    showBanksModal,
    setShowBanksModal,
    showForm,
    setShowForm,
    showDeleteConfirmation,
    setShowDeleteConfirmation,
    showAcceptConfirmation,
    setShowAcceptConfirmation,

    // Data states
    selectedSolicitudId,
    setSelectedSolicitudId,
    banksData,
    setBanksData,
    solicitudes,
    setSolicitudes,
    selectedSolicitud,
    setSelectedSolicitud,
    offer_data,
    set_offer_Data,
    acceptedOfferId,
    setAcceptedOfferId,
    offerToAccept,
    setOfferToAccept,
    userData,
    setUserData,
    offerCounts,
    setOfferCounts,

    // Loading and error states
    isLoading,
    setIsLoading,
    errors,
    setErrors,

    // Action functions
    refreshSolicitudes,
    createSolicitud,
    handleDeleteSolicitud,
    confirmDeleteSolicitud,
    fetchOfferCountForSolicitud,

    // Utility functions
    handleSignOut,
    handleErrorClose,
    resetErrors,
    showNotification,
  };
};
