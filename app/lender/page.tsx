// app/lender/page.tsx
"use client";

import { useState } from "react";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../firebase";
import { LenderSidebar } from "@/components/features/dashboard/LenderSidebar";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  doc,
  getFirestore,
  collection,
  onSnapshot,
  getDoc,
} from "firebase/firestore";

import {
  Input,
  Select,
  SelectItem,
  Button,
  Card,
  Chip,
  CardBody,
} from "@nextui-org/react";
import {
  Search,
  SlidersHorizontal,
  DollarSign,
  Clock,
  Calendar,
  MapPin,
  Target,
  User,
  Briefcase,
  CreditCard,
  Wallet,
  RefreshCw,
} from "lucide-react";

// Hooks
import { useLoan } from "@/hooks/useLoans";
import { useProposal } from "./hooks/useProposal";

// Components
import LoanRequestList from "@/components/features/loans/LoanRequestList";
import LoanRequestDetails from "@/components/features/loans/LoanRequestDetails";
import { ProposalForm } from "@/components/features/loans/ProposalForm";

// Types
import type {
  PublicUserData,
  LoanRequest,
} from "@/app/lender/types/loan.types";

export default function LenderPage() {
  const router = useRouter();
  const [user, setUser] = useState<string>("");
  const [activeTab, setActiveTab] = useState("marketplace");
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null
  );
  const [isCreatingOffer, setIsCreatingOffer] = useState(false);
  const [partnerData, setPartnerData] = useState({
    name: "",
    company: "",
    company_id: "",
  });

  const [filters, setFilters] = useState({
    search: "",
    amount: "all",
    term: "all",
  });
  const [userData, setUserData] = useState<PublicUserData | null>(null);
  const [lenderProposals, setLenderProposals] = useState<any[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(false);

  const {
    loans: requests,
    loading,
    fetchLoans: refreshLoans,
  } = useLoan({
    companyName: partnerData.company,
    status: "pending",
    enableRealtime: true,
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

  // Cargar datos de usuario para todas las solicitudes al inicio
  const [userDataMap, setUserDataMap] = useState<
    Record<string, PublicUserData>
  >({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (userAuth) => {
      if (userAuth) {
        setUser(userAuth.uid);
        getPartnerData(userAuth.uid);
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
  useEffect(() => {
    // Cargar datos de usuario para todas las solicitudes
    const loadAllUserData = async () => {
      const userIds = Array.from(new Set(requests.map((req) => req.userId)));
      const dataMap: Record<string, PublicUserData> = {};

      for (const userId of userIds) {
        try {
          const response = await fetch("/api/getUserOfferData", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          });

          if (response.ok) {
            const data = await response.json();
            if (data.data) {
              dataMap[userId] = JSON.parse(data.data);
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

  const getPartnerData = async (uid: string) => {
    const db = getFirestore();
    const docRef = doc(db, "cuentas", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setPartnerData({
        name: docSnap.data().Nombre,
        company: docSnap.data().Empresa,
        company_id: docSnap.data().company_id,
      });
    }
  };

  const getUserData = async (userId: string) => {
    try {
      const response = await fetch("/api/getUserOfferData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.data ? JSON.parse(data.data) : null);
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
      const response = await fetch("/api/addOfferAcepted", {
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
    signOut(auth)
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  // Cargar las propuestas del lender cuando se activa la pestaña "myoffers"
  useEffect(() => {
    if (activeTab === "myoffers" && user) {
      fetchLenderProposals();
    }
  }, [activeTab, user]);

  const fetchLenderProposals = async () => {
    if (!user) return;

    setLoadingProposals(true);
    try {
      const response = await fetch("/api/getLenderProposals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lenderId: user }),
      });

      if (response.ok) {
        const data = await response.json();
        setLenderProposals(data.data || []);
      } else {
        console.error("Error fetching proposals:", response.statusText);
        toast.error("Error al cargar tus propuestas");
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      toast.error("Error al cargar tus propuestas");
    } finally {
      setLoadingProposals(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <LenderSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleSignOut={handleSignOut}
        companyName={partnerData.company}
      />

      <div className="flex-1">
        {activeTab === "marketplace" && (
          <div className="p-8">
            {/* Barra de Filtros y Contador de solicitudes - Solo mostrar cuando no se está creando una oferta */}
            {!isCreatingOffer && (
              <>
                {/* Barra de Filtros */}
                <Card className="mb-6 p-4 shadow-sm border border-gray-100">
                  <div className="flex flex-wrap gap-4">
                    <Input
                      type="text"
                      placeholder="Buscar por monto o plazo..."
                      startContent={
                        <Search className="w-4 h-4 text-gray-400" />
                      }
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      className="w-full md:w-72"
                      classNames={{
                        inputWrapper: "bg-white border-gray-200",
                      }}
                    />
                    <Select
                      placeholder="Monto"
                      size="sm"
                      selectedKeys={[filters.amount]}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          amount: e.target.value,
                        }))
                      }
                      className="w-full md:w-48"
                      classNames={{
                        trigger: "bg-white border-gray-200",
                      }}
                    >
                      <SelectItem key="all">Todos los montos</SelectItem>
                      <SelectItem key="0-50000">Hasta $50,000</SelectItem>
                      <SelectItem key="50000-100000">
                        $50,000 - $100,000
                      </SelectItem>
                      <SelectItem key="100000+">Más de $100,000</SelectItem>
                    </Select>
                    <Select
                      placeholder="Plazo"
                      size="sm"
                      selectedKeys={[filters.term]}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          term: e.target.value,
                        }))
                      }
                      className="w-full md:w-48"
                      classNames={{
                        trigger: "bg-white border-gray-200",
                      }}
                    >
                      <SelectItem key="all">Todos los plazos</SelectItem>
                      <SelectItem key="1-12">1-12 meses</SelectItem>
                      <SelectItem key="13-24">13-24 meses</SelectItem>
                      <SelectItem key="25+">Más de 24 meses</SelectItem>
                    </Select>
                    <Button
                      variant="flat"
                      startContent={<SlidersHorizontal className="w-4 h-4" />}
                      onClick={() =>
                        setFilters({
                          search: "",
                          amount: "all",
                          term: "all",
                        })
                      }
                      className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                      Limpiar filtros
                    </Button>
                  </div>
                </Card>

                {/* Contador de solicitudes */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                    <CreditCard className="w-5 h-5 mr-2 text-gray-500" />
                    Solicitudes de Préstamo
                  </h2>
                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                    <span className="text-sm text-gray-600">
                      {filteredRequests.length} de {requests.length} disponibles
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Contenido Principal */}
            {!selectedRequestId ? (
              <>
                {/* Grid de solicitudes */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredRequests.map((request, index) => {
                    // Obtener datos del usuario para esta solicitud
                    const userData = userDataMap[request.userId];

                    return (
                      <Card
                        key={request.id}
                        className="overflow-hidden shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-200"
                      >
                        {/* Encabezado de la tarjeta */}
                        <CardBody className="p-0">
                          <div className="p-5 border-b border-gray-100">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-semibold text-gray-700">
                                Solicitud #{index + 1}
                              </h3>
                              <Chip
                                color="default"
                                variant="flat"
                                size="sm"
                                className="bg-gray-100 text-gray-600"
                              >
                                Nueva
                              </Chip>
                            </div>
                            <p className="text-3xl font-bold mt-2 text-green-600">
                              ${request.amount.toLocaleString()}
                            </p>
                          </div>

                          <div className="p-5">
                            {/* Detalles de la solicitud */}
                            <div className="mb-6">
                              <h4 className="text-md font-semibold mb-3 flex items-center border-b border-gray-100 pb-2 text-gray-700">
                                <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                                Detalles de la Solicitud
                              </h4>

                              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Monto Solicitado
                                  </p>
                                  <p className="font-medium text-gray-800">
                                    ${request.amount.toLocaleString()}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm text-gray-500">
                                    Ingresos Anuales Comprobables
                                  </p>
                                  <p className="font-medium text-gray-800">
                                    ${request.income.toLocaleString()}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm text-gray-500">
                                    Frecuencia de Pago
                                  </p>
                                  <p className="font-medium text-gray-800 capitalize">
                                    {request.payment}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm text-gray-500">Plazo</p>
                                  <p className="font-medium text-gray-800">
                                    {request.term}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm text-gray-500">
                                    Propósito
                                  </p>
                                  <p className="font-medium text-gray-800">
                                    {request.purpose || "No especificado"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm text-gray-500">Tipo</p>
                                  <p className="font-medium text-gray-800">
                                    {request.type || "No especificado"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Información del solicitante */}
                            <div className="mb-5">
                              <h4 className="text-md font-semibold mb-3 flex items-center border-b border-gray-100 pb-2 text-gray-700">
                                <User className="h-4 w-4 text-gray-500 mr-2" />
                                Información del Solicitante
                              </h4>

                              <div className="grid grid-cols-3 gap-x-4 gap-y-3">
                                <div>
                                  <p className="text-sm text-gray-500">País</p>
                                  <p className="font-medium text-gray-800">
                                    {userData?.country || "No disponible"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm text-gray-500">
                                    Estado
                                  </p>
                                  <p className="font-medium text-gray-800">
                                    {userData?.state || "No disponible"}
                                  </p>
                                </div>

                                <div>
                                  <p className="text-sm text-gray-500">
                                    Ciudad
                                  </p>
                                  <p className="font-medium text-gray-800">
                                    {userData?.city || "No disponible"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Botón de acción */}
                            <Button
                              color="success"
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => {
                                handleSelectRequest(request.id);
                                updateProposal({
                                  company: partnerData.company,
                                  partner: user,
                                });
                                setIsCreatingOffer(true);
                              }}
                            >
                              <Target className="h-4 w-4 mr-2" />
                              Hacer Oferta
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              // Vista de detalles o formulario de propuesta
              <motion.div layout className="max-w-4xl mx-auto">
                {isCreatingOffer ? (
                  <ProposalForm
                    proposal={proposalData}
                    loading={submitting}
                    error={submitError}
                    onUpdate={updateProposal}
                    onSubmit={handleSubmitOffer}
                    onCancel={() => {
                      setIsCreatingOffer(false);
                      setSelectedRequestId(null);
                      resetProposal();
                    }}
                  />
                ) : (
                  <Card className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold">
                        Detalles de la Solicitud
                      </h2>
                      <Button
                        variant="light"
                        onClick={() => setSelectedRequestId(null)}
                      >
                        Volver al mercado
                      </Button>
                    </div>
                    <LoanRequestDetails
                      request={selectedRequest}
                      userData={userData}
                      onMakeOffer={() => {
                        updateProposal({
                          company: partnerData.company,
                          partner: user,
                          amount: selectedRequest?.amount || 0,
                          amortization_frequency:
                            selectedRequest?.payment || "mensual",
                        });
                        setIsCreatingOffer(true);
                      }}
                    />
                  </Card>
                )}
              </motion.div>
            )}
          </div>
        )}

        {/* Resto de las pestañas se mantienen igual */}
        {activeTab === "myoffers" && (
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Mis Ofertas</h1>
            </div>

            {loadingProposals ? (
              <div className="flex items-center justify-center h-64">
                {/* <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"> */}
                <div className="w-16 h-16 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
              </div>
            ) : lenderProposals.length === 0 ? (
              <div className="text-center p-10 bg-white rounded-lg shadow">
                <div className="text-5xl text-gray-300 mb-4">📝</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No has enviado propuestas
                </h3>
                <p className="text-gray-600 mb-6">
                  Cuando envíes propuestas a los solicitantes, aparecerán aquí.
                </p>
                <Button
                  color="success"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => setActiveTab("marketplace")}
                >
                  Ir al mercado
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {lenderProposals.map((proposal) => (
                  <Card key={proposal.id} className="shadow-md">
                    <CardBody className="p-6">
                      <div className="flex justify-between items-start mb-4 ">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {proposal.requestInfo?.purpose || "Sin propósito"}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {proposal.requestInfo?.type || "Préstamo"}
                          </p>
                        </div>
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-semibold text-green-600">
                            ${proposal.amount?.toLocaleString()}
                          </span>
                          <Chip
                            className={`text-white text-sm ${
                              proposal.status === "pending"
                                ? "bg-gray-500"
                                : proposal.status === "accepted"
                                ? "bg-green-500"
                                : "bg-red-500"
                            }`}
                          >
                            {proposal.status === "pending"
                              ? "Pendiente"
                              : proposal.status === "accepted"
                              ? "Aceptada"
                              : "Rechazada"}
                          </Chip>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">
                            Tasa de interés:
                          </span>
                          <span className="font-medium">
                            {proposal.interest_rate}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">
                            Plazo del prestamo:
                          </span>
                          <span className="font-medium">
                            {proposal.deadline} meses
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Amortizacion:</span>
                          <span className="font-medium">
                            ${proposal.amortization}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">
                            Frequencia de pago:
                          </span>
                          <span className="font-medium">
                            {proposal.amortization_frequency}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Comision:</span>
                          <span className="font-medium">
                            ${proposal.comision}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Seguro de vida:</span>
                          <span className="font-medium">
                            ${proposal.medical_balance}
                          </span>
                        </div>
                        {proposal.createdAt && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Enviada el:</span>
                            <span className="font-medium">
                              {new Date(
                                proposal.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          </div>
        )}

        {activeTab === "help" && (
          <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900">Ayuda</h1>
          </div>
        )}
      </div>
    </div>
  );
}
