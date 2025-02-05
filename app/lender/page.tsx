// app/lender/page.tsx
"use client";

import { useState } from "react";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut } from "lucide-react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect } from "react";
import { auth } from "../firebase";
import { LenderSidebar } from "@/components/LenderSidebar";
import { useRouter } from "next/navigation";
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
} from "@nextui-org/react";
import {
  Search,
  SlidersHorizontal,
  DollarSign,
  Clock,
  Calendar,
} from "lucide-react";

// Hooks
import { useLoans } from "./hooks/useLoans";
import { useProposal } from "./hooks/useProposal";

// Components
import LoanRequestList from "@/components/LoanRequestList";
import LoanRequestDetails from "@/components/LoanRequestDetails";
import { ProposalForm } from "@/components/ProposalForm";

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

  const { loans: requests, loading } = useLoans();
  const selectedRequest = selectedRequestId
    ? requests.find((r) => r.id === selectedRequestId)
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.uid);
        getPartnerData(user.uid);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const getPartnerData = async (uid: string) => {
    const db = getFirestore();
    const docRef = doc(db, "cuentas", uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setPartnerData({
        name: docSnap.data().name,
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

  const handleSubmitOffer = async () => {
    const success = await submitProposal();
    if (success) {
      setIsCreatingOffer(false);
      resetProposal();
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
            {/* Barra de Filtros */}
            <Card className="mb-6 p-4">
              <div className="flex flex-wrap gap-4">
                {/* Los filtros se mantienen igual */}
                <Input
                  type="text"
                  placeholder="Buscar por monto o plazo..."
                  startContent={<Search className="w-4 h-4 text-gray-400" />}
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full md:w-72"
                />
                <Select
                  placeholder="Monto"
                  size="sm"
                  selectedKeys={[filters.amount]}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, amount: e.target.value }))
                  }
                  className="w-full md:w-48"
                >
                  <SelectItem key="all">Todos los montos</SelectItem>
                  <SelectItem key="0-50000">Hasta $50,000</SelectItem>
                  <SelectItem key="50000-100000">$50,000 - $100,000</SelectItem>
                  <SelectItem key="100000+">Más de $100,000</SelectItem>
                </Select>
                <Select
                  placeholder="Plazo"
                  size="sm"
                  selectedKeys={[filters.term]}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, term: e.target.value }))
                  }
                  className="w-full md:w-48"
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
                >
                  Limpiar filtros
                </Button>
              </div>
            </Card>

            {/* Contenido Principal */}
            {!selectedRequestId ? (
              <>
                {/* Contador de solicitudes */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">Solicitudes</h2>
                  <p className="text-sm text-gray-500">
                    {filteredRequests.length} de {requests.length} disponibles
                  </p>
                </div>

                {/* Grid de solicitudes filtradas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRequests.map((request, index) => (
                    <motion.div
                      key={request.id}
                      onClick={() => handleSelectRequest(request.id)}
                      className="bg-white rounded-lg shadow hover:shadow-md transition-all duration-200 cursor-pointer p-6"
                      whileHover={{ translateY: -4 }}
                      whileTap={{ translateY: 0 }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold">
                            Solicitud #{index + 1}
                          </h3>
                          <p className="text-[#2EA043] font-medium text-2xl mt-1">
                            ${request.amount.toLocaleString()}
                          </p>
                        </div>
                        <Chip color="success" variant="flat" size="sm">
                          Nueva
                        </Chip>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            Plazo:{" "}
                            <span className="font-medium">{request.term}</span>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Pago:{" "}
                            <span className="font-medium">
                              {request.payment}
                            </span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
                          partner: partnerData.name,
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
            <h1 className="text-2xl font-bold text-gray-900">Mis Ofertas</h1>
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
