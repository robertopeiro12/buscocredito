import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getFirestore, getDoc } from 'firebase/firestore';
import { auth } from '@/app/firebase';
import { useLenderGuard } from '@/hooks/useRoleGuard';
import { useLoan } from '@/hooks/useLoans';
import { useProposal } from '@/app/lender/hooks/useProposal';
import toast from 'react-hot-toast';
import type {
  LenderState,
  LenderFilters,
  PartnerData,
  LenderProposal,
  PublicUserData,
  LoanRequest,
} from '@/app/lender/types/loan.types';

const initialFilters: LenderFilters = {
  search: "",
  amount: "all",
  term: "all",
};

const initialPartnerData: PartnerData = {
  name: "",
  company: "",
  company_id: "",
};

export const useLenderDashboard = () => {
  const { isAuthorized, isLoading: isCheckingAuth } = useLenderGuard();
  const router = useRouter();
  
  // Estados principales
  const [user, setUser] = useState<string>("");
  const [activeTab, setActiveTab] = useState<LenderState['activeTab']>("marketplace");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [partnerData, setPartnerData] = useState<PartnerData>(initialPartnerData);
  const [filters, setFilters] = useState<LenderFilters>(initialFilters);
  const [userData, setUserData] = useState<PublicUserData | null>(null);
  const [lenderProposals, setLenderProposals] = useState<LenderProposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [userDataMap, setUserDataMap] = useState<Record<string, PublicUserData>>({});

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
        request.term.toLowerCase().includes(filters.search.toLowerCase());

      // Filtro de monto
      let amountMatch = true;
      if (filters.amount !== "all") {
        switch (filters.amount) {
          case "0-50000":
            amountMatch = request.amount <= 50000;
            break;
          case "50000-100000":
            amountMatch = request.amount > 50000 && request.amount <= 100000;
            break;
          case "100000+":
            amountMatch = request.amount > 100000;
            break;
        }
      }

      // Filtro de plazo
      let termMatch = true;
      if (filters.term !== "all") {
        const months = parseInt(request.term);
        switch (filters.term) {
          case "1-12":
            termMatch = months <= 12;
            break;
          case "13-24":
            termMatch = months > 12 && months <= 24;
            break;
          case "25+":
            termMatch = months > 24;
            break;
        }
      }

      return searchMatch && amountMatch && termMatch;
    });
  }, [requests, filters]);

  // Funciones
  const getPartnerData = async (uid: string) => {
    try {
      const db = getFirestore();
      const docRef = doc(db, "cuentas", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPartnerData({
          name: docSnap.data().Nombre || "",
          company: docSnap.data().Empresa || "",
          company_id: docSnap.data().company_id || "",
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
      const response = await fetch("/api/users/public-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  const updateOffer = async (id: string) => {
    try {
      const response = await fetch("/api/loans/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: id, offer_data: proposalData }),
      });

      if (response.ok) {
      } else {
        console.error("Error fetching user data:", response.statusText);
      }
    } catch (error) {
      console.error("Error getting data:", error);
    }
  };

  const handleSubmitOffer = async () => {
    const success = await submitProposal();
    if (success) {
      // Mostrar notificación de éxito
      toast.success("Tu propuesta ha sido enviada exitosamente", {
        duration: 4000,
        position: "top-center",
      });

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

  const handleSignOut = () => {
    // Limpiar estados antes del signout para evitar errores de permisos
    setUser("");
    setPartnerData(initialPartnerData);
    setSelectedRequestId(null);
    setUserData(null);
    setLenderProposals([]);
    
    signOut(auth)
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
        // Aun con error, redirigir al login
        router.push("/login");
      });
  };

  const fetchLenderProposals = async () => {
    if (!user) return;

    setLoadingProposals(true);
    try {
      const response = await fetch("/api/proposals/lender", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        setLenderProposals([]);
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      setLenderProposals([]);
    } finally {
      setLoadingProposals(false);
    }
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const handleFilterChange = (key: keyof LenderFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMakeOffer = () => {
    updateProposal({
      company: partnerData.company,
      partner: user,
    });
    setIsCreatingOffer(true);
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
            toast.error("Error al cargar configuración de empresa");
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

  // Cargar las propuestas del lender cuando se activa la pestaña "myoffers"
  useEffect(() => {
    if (activeTab === "myoffers" && user) {
      fetchLenderProposals();
    }
  }, [activeTab, user]);

  useEffect(() => {
    // Cargar datos de usuario para todas las solicitudes
    const loadAllUserData = async () => {
      const userIds = Array.from(new Set(requests.map((req) => req.userId)));
      const dataMap: Record<string, PublicUserData> = {};

      for (const userId of userIds) {
        try {
          const response = await fetch("/api/users/public-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              dataMap[userId] = data.data;
            }
          }
        } catch (error) {
          console.error(`Error getting data for user ${userId}:`, error);
        }
      }

      setUserDataMap(dataMap);
    };

    if (requests.length > 0 && !loading) {
      loadAllUserData();
    }
  }, [requests, loading]);

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
    handleMakeOffer,
    handleCancelOffer,
    handleBackToMarket,
    updateOffer,
    refreshLoans,
    
    // Funciones de proposal
    updateProposal,
    resetProposal,
  };
};
