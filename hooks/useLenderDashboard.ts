import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getFirestore, getDoc } from 'firebase/firestore';
import { auth } from '@/app/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { useLenderGuard } from '@/hooks/useRoleGuard';
import { useLoan } from '@/hooks/useLoans';
import { useProposal } from '@/app/lender/hooks/useProposal';
import { addToast } from '@heroui/react';
import type {
  LenderState,
  LenderFilters,
  LenderProposal,
  PublicUserData,
  LoanRequest,
} from '@/app/lender/types/loan.types';
import type { LenderInfo } from '@/types/entities/business.types';

const initialFilters: LenderFilters = {
  search: "",
  state: "",
  city: "",
  purpose: "all",
  type: "all",
  amountRange: "all",
};

const initialPartnerData: LenderInfo = {
  name: "",
  company: "",
  adminId: "",
};

export const useLenderDashboard = () => {
  const { isAuthorized, isLoading: isCheckingAuth } = useLenderGuard();
  const { signOut } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Read initial tab from URL query parameter
  const initialTab = (() => {
    const tabParam = searchParams?.get('tab');
    if (tabParam === 'myoffers' || tabParam === 'marketplace' || 
        tabParam === 'metrics' || tabParam === 'notifications' || 
        tabParam === 'settings' || tabParam === 'help') {
      return tabParam as LenderState['activeTab'];
    }
    return 'marketplace';
  })();
  
  // Estados principales
  const [user, setUser] = useState<string>("");
  const [activeTab, setActiveTab] = useState<LenderState['activeTab']>(initialTab);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [partnerData, setPartnerData] = useState<LenderInfo>(initialPartnerData);
  // Always holds the latest partnerData — safe to read inside async functions
  const partnerDataRef = useRef(partnerData);
  partnerDataRef.current = partnerData;
  // Prevents race condition if handleOpenOffer is called twice rapidly
  const isOpeningOfferRef = useRef(false);
  const [filters, setFilters] = useState<LenderFilters>(initialFilters);
  const [userData, setUserData] = useState<PublicUserData | null>(null);
  const [lenderProposals, setLenderProposals] = useState<LenderProposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [userDataMap, setUserDataMap] = useState<Record<string, PublicUserData>>({});
  const [lenderEmailNotifications, setLenderEmailNotifications] = useState(true);

  // Hooks de datos
  const {
    loans: requests,
    loading,
    fetchLoans: refreshLoans,
  } = useLoan({
    companyName: partnerData.company,
    status: "pending",
    enableRealtime: partnerData.company ? true : false,
  });

  const selectedRequest = selectedRequestId
    ? requests.find((r) => r.id === selectedRequestId) || null
    : null;

  const {
    proposalData,
    updateProposal,
    submitProposal,
    loading: submitting,
    error: submitError,
    resetProposal,
  } = useProposal(selectedRequest);

  // Filtros computados
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      // Filtro de búsqueda
      const searchMatch =
        !filters.search ||
        request.amount.toString().includes(filters.search) ||
        request.term.toLowerCase().includes(filters.search.toLowerCase()) ||
        request.purpose?.toLowerCase().includes(filters.search.toLowerCase()) ||
        request.type?.toLowerCase().includes(filters.search.toLowerCase());

      // Filtro de estado (comparación exacta)
      let stateMatch = true;
      if (filters.state && userDataMap[request.userId]) {
        stateMatch = userDataMap[request.userId]?.state === filters.state;
      }

      // Filtro de ciudad (búsqueda parcial insensible a mayúsculas)
      let cityMatch = true;
      if (filters.city && userDataMap[request.userId]) {
        cityMatch = userDataMap[request.userId]?.city?.toLowerCase().includes(filters.city.toLowerCase()) || false;
      }

      // Filtro de propósito
      let purposeMatch = true;
      if (filters.purpose !== "all") {
        purposeMatch = request.purpose === filters.purpose;
      }

      // Filtro de tipo
      let typeMatch = true;
      if (filters.type !== "all") {
        // Mapear los tipos del formulario a los IDs almacenados
        const typeMapping = {
          'consumo': 'Crédito al consumo',
          'deudas': 'Liquidación deudas',
          'capital': 'Capital de trabajo',
          'maquinaria': 'Adquisición de maquinaria o equipo'
        };
        
        const mappedType = typeMapping[filters.type as keyof typeof typeMapping];
        typeMatch = request.type === mappedType;
      }

      // Filtro de rango de monto
      let amountMatch = true;
      if (filters.amountRange !== "all") {
        const amount = request.amount;
        switch (filters.amountRange) {
          case "0-50000":
            amountMatch = amount >= 0 && amount <= 50000;
            break;
          case "50000-100000":
            amountMatch = amount > 50000 && amount <= 100000;
            break;
          case "100000-250000":
            amountMatch = amount > 100000 && amount <= 250000;
            break;
          case "250000-500000":
            amountMatch = amount > 250000 && amount <= 500000;
            break;
          case "500000+":
            amountMatch = amount > 500000;
            break;
        }
      }

      return searchMatch && stateMatch && cityMatch && purposeMatch && typeMatch && amountMatch;
    });
  }, [requests, filters, userDataMap]);

  // Funciones
  const getPartnerData = async (uid: string) => {
    try {
      const db = getFirestore();
      const docRef = doc(db, "cuentas", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPartnerData({
          name: docSnap.data().name || "",
          company: docSnap.data().companyName || "",
          adminId: docSnap.data().adminId || "",
        });
      }
    } catch (error) {
      console.error("Error al obtener datos del partner:", error);
      // Mantener valores por defecto
      setPartnerData(initialPartnerData);
    }
  };

  const getUserData = async (userId: string) => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/users/public-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.data || null);
      }
    } catch (error) {
      console.error("Error getting data:", error);
    }
  };

  const handleSelectRequest = async (requestId: string) => {
    const request = requests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequestId(requestId);
      await getUserData(request.userId);
    }
  };

  const handleSubmitOffer = async () => {
    const success = await submitProposal();
    if (success) {
      // Mostrar notificación de éxito
      addToast({ title: "Tu propuesta ha sido enviada exitosamente", color: "success", timeout: 4000 });

      // Cerrar el formulario de propuesta
      setIsCreatingOffer(false);
      resetProposal();

      refreshLoans();

      // Volver al mercado de ofertas
      setSelectedRequestId(null);

      // Actualizar la vista para mostrar el mercado
      setActiveTab("marketplace");
    }
  };

  const handleSignOut = async () => {
    try {
      // Limpiar estados antes del signout para evitar errores de permisos
      setUser("");
      setPartnerData(initialPartnerData);
      setSelectedRequestId(null);
      setUserData(null);
      setLenderProposals([]);
      
      // Usar signOut del AuthContext
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
      // Aun con error, redirigir al login
      router.push("/login");
    }
  };

  const fetchLenderProposals = useCallback(async () => {
    if (!user) return;

    setLoadingProposals(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch("/api/proposals/lender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ lenderId: user }),
      });

      if (response.ok) {
        const data = await response.json();

        // Manejar la estructura de respuesta correcta: data.data.proposals o data.data
        let proposals = [];
        if (data.data) {
          proposals = data.data.proposals || data.data || [];
        } else {
          proposals = data.proposals || [];
        }

        setLenderProposals(Array.isArray(proposals) ? proposals : []);
      } else {
        console.error("Error fetching proposals:", response.statusText);
        addToast({ title: 'Error al cargar tus propuestas', color: 'danger' });
        setLenderProposals([]);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      addToast({ title: 'Error al cargar tus propuestas', color: 'danger' });
      setLenderProposals([]);
    } finally {
      setLoadingProposals(false);
    }
  }, [user]);

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const handleFilterChange = (key: keyof LenderFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOpenOffer = async (requestId: string) => {
    if (isOpeningOfferRef.current) return;
    isOpeningOfferRef.current = true;
    try {
      const request = requests.find((r) => r.id === requestId);
      if (!request) return;
      setSelectedRequestId(requestId);
      await getUserData(request.userId);
      // Use ref so we always get the latest partnerData even if the async
      // getPartnerData call resolved during the await above
      updateProposal({ company: partnerDataRef.current.company, lenderId: user });
      setIsCreatingOffer(true);
    } finally {
      isOpeningOfferRef.current = false;
    }
  };

  const handleCancelOffer = () => {
    setIsCreatingOffer(false);
    setSelectedRequestId(null);
    resetProposal();
  };

  const handleBackToMarket = () => {
    setSelectedRequestId(null);
  };

  // Effects
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        setUser(userAuth.uid);
        try {
          await getPartnerData(userAuth.uid);
        } catch (error) {
          console.error("Error al cargar datos del partner:", error);
          // Si hay error de permisos, intentar mantener funcionalidad básica
          if (error && typeof error === 'object' && 'code' in error && error.code !== 'permission-denied') {
            addToast({ title: "Error al cargar configuración de empresa", color: "danger" });
          }
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (partnerData.company) {
      // Refresh loans when company data becomes available
      refreshLoans();
    }
  }, [partnerData.company, refreshLoans]);

  // Cargar las propuestas del lender cuando se activa la pestaña "myoffers" o "metrics"
  useEffect(() => {
    if ((activeTab === "myoffers" || activeTab === "metrics") && user) {
      fetchLenderProposals();
    }
  }, [activeTab, user, fetchLenderProposals]);

  // Cargar preferencia de notificaciones por correo cuando el usuario está disponible
  useEffect(() => {
    if (!user) return;
    auth.currentUser?.getIdToken().then((token) => {
      fetch("/api/users/preferences", {
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.data?.emailNotifications !== undefined) {
            setLenderEmailNotifications(data.data.emailNotifications);
          }
        })
        .catch(() => {
          // Silently ignore — UI will default to true
        });
    });
  }, [user]);

  useEffect(() => {
    // Cargar datos de usuario para todas las solicitudes
    const loadAllUserData = async () => {
      const allUserIds = Array.from(new Set(requests.map((req) => req.userId)));
      const userIds = allUserIds.filter((id) => !userDataMap[id]);
      if (userIds.length === 0) return;
      const dataMap: Record<string, PublicUserData> = {};
      const token = await auth.currentUser?.getIdToken();

      const results = await Promise.all(
        userIds.map(async (userId) => {
          try {
            const response = await fetch("/api/users/public-profile", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              credentials: "include",
              body: JSON.stringify({ userId }),
            });

            if (response.ok) {
              const data = await response.json();
              if (data.data) {
                return { userId, userData: data.data as PublicUserData };
              }
            }
          } catch (error) {
            console.error(`Error getting data for user ${userId}:`, error);
          }
          return null;
        })
      );

      for (const result of results) {
        if (result) {
          dataMap[result.userId] = result.userData;
        }
      }

      setUserDataMap((prev) => ({ ...prev, ...dataMap }));
    };

    if (requests.length > 0 && !loading) {
      loadAllUserData();
    }
  }, [requests, loading]);

  const handleEmailNotificationsChange = async (value: boolean) => {
    setLenderEmailNotifications(value);
    try {
      const token = await auth.currentUser?.getIdToken();
      await fetch("/api/users/preferences", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: user, emailNotifications: value }),
      });
    } catch {
      // Silently ignore — optimistic update already applied
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as LenderState['activeTab']);
  };

  // Estado consolidado para retornar
  const lenderState: LenderState = {
    activeTab,
    selectedRequestId,
    isCreatingOffer,
    userData,
    lenderProposals,
    loadingProposals,
    userDataMap,
  };

  return {
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
    setSelectedRequestId,
    setIsCreatingOffer,
    
    // Funciones de manejo
    handleSelectRequest,
    handleSubmitOffer,
    handleSignOut,
    handleFilterChange,
    clearFilters,
    handleOpenOffer,
    handleCancelOffer,
    handleBackToMarket,
    refreshLoans,

    // Email notifications
    lenderEmailNotifications,
    handleEmailNotificationsChange,

    // Funciones de proposal
    updateProposal,
    resetProposal,
  };
};
