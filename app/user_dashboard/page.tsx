"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Progress,
} from "@nextui-org/react";
import {
  CreditCard,
  HelpCircle,
  Settings,
  LogOut,
  PlusCircle,
  ChevronRight,
  User as UserIcon,
  RefreshCw,
} from "lucide-react";
import CreditForm from "@/components/CreditForm";
import { AnimatePresence, motion } from "framer-motion";
import {
  doc,
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  addDoc,
  getDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { useRetry } from "@/hooks/useRetry";
import ErrorNotification from "@/components/ErrorNotification";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useNotification } from "@/components/NotificationProvider";

interface Address {
  street: string;
  number: string;
  colony: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}

interface UserData {
  name: string;
  last_name: string;
  second_last_name: string;
  email: string;
  rfc: string;
  birthday: any; // You might want to make this more specific
  phone: string;
  address: Address;
}

interface SolicitudData {
  id: string;
  userId: string;
  purpose: string;
  type: string;
  amount: number;
  term: string;
  payment: string;
  income: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt?: string;
  comision?: number;
  acceptedOfferId?: string;
}

type NewSolicitudData = Omit<SolicitudData, "id">;

interface Offer {
  lender_name: string;
  amount: number;
  interest_rate: number;
  term: string;
  monthly_payment: number;
  amortization?: {
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
  medical_balance?: number;
  comision?: number;
}

interface CreditFormProps {
  addSolicitud: (data: CreditFormData) => void;
  resetForm: () => void;
}

interface CreditFormData {
  purpose: string;
  type: string;
  amount: number;
  term: string;
  payment: string;
  income: string;
}

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RefreshCw className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Algo salió mal
        </h2>
        <p className="text-gray-600 mb-6">
          {error.message ||
            "Ha ocurrido un error inesperado. Por favor, intenta recargar la página."}
        </p>
        <div className="space-y-3">
          <Button
            color="primary"
            className="w-full"
            onPress={resetErrorBoundary}
          >
            Intentar de nuevo
          </Button>
          <Button
            variant="light"
            className="w-full"
            onPress={() => window.location.reload()}
          >
            Recargar página
          </Button>
        </div>
      </div>
    </div>
  );
}

const formatDate = (timestamp: Timestamp | null) => {
  if (!timestamp) return "";
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState("loans");
  const [showBanksModal, setShowBanksModal] = useState(false);
  const [selectedSolicitudId, setSelectedSolicitudId] = useState<string | null>(
    null
  );
  const [banksData, setBanksData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [solicitudes, setSolicitudes] = useState<SolicitudData[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] =
    useState<SolicitudData | null>(null);
  const [offer_data, set_offer_Data] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState({
    initial: true,
    loans: false,
    settings: false,
    offers: false,
  });
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
      number: "",
      colony: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },
  });
  const [offerCounts, setOfferCounts] = useState<{ [key: string]: number }>({});
  const router = useRouter();
  const [errors, setErrors] = useState<{
    loans: string | null;
    settings: string | null;
    offers: string | null;
  }>({
    loans: null,
    settings: null,
    offers: null,
  });
  const { showNotification } = useNotification();

  const { execute: executeFetchSolicitudes } = useRetry(
    () => fetchSolicitudes(user?.uid || ""),
    { maxAttempts: 3 }
  );

  const { execute: executeFetchUserData } = useRetry(
    () => fetchUserData(user?.uid || ""),
    { maxAttempts: 3 }
  );

  const { execute: executeFetchOfferData } = useRetry<void>(
    async () => {
      if (!selectedSolicitudId) return;
      await fetch_offer_data(selectedSolicitudId);
    },
    { maxAttempts: 3 }
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          setIsLoading((prev) => ({ ...prev, loans: true }));
          await fetchSolicitudes(user.uid);
          setIsLoading((prev) => ({ ...prev, settings: true }));
          await fetchUserData(user.uid);
        } catch (error) {
          if (error instanceof Error) {
            setErrors((prev) => ({
              ...prev,
              loans:
                "Error al cargar los préstamos. Por favor, intenta de nuevo.",
              settings:
                "Error al cargar la configuración. Por favor, intenta de nuevo.",
            }));
          }
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

  const fetch_offer_data = async (loanId: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, offers: true }));
      const response = await fetch("/api/fetch_loan_offer", {
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
      set_offer_Data(data.data ? JSON.parse(data.data) : null);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        offers: "Error al cargar las ofertas. Por favor, intenta de nuevo.",
      }));
    } finally {
      setIsLoading((prev) => ({ ...prev, offers: false }));
    }
  };

  const fetchUserData = async (userId: string) => {
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, "cuentas", userId));
    if (userDoc.exists()) {
      setUserData(userDoc.data() as UserData);
    }
  };

  const fetchOfferCount = async (loanId: string) => {
    try {
      const response = await fetch("/api/fetch_loan_offer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ loanId }),
      });

      if (response.ok) {
        const data = await response.json();
        const offers = data.data ? JSON.parse(data.data) : [];
        setOfferCounts((prev) => ({ ...prev, [loanId]: offers.length }));
      }
    } catch (error) {
      console.error("Error getting offer count:", error);
    }
  };

  const fetchSolicitudes = async (userId: string) => {
    const db = getFirestore();
    const solicitudesRef = collection(db, "solicitudes");
    const q = query(solicitudesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const fetchedSolicitudes: SolicitudData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      fetchedSolicitudes.push({
        id: doc.id,
        userId: data.userId,
        purpose: data.purpose,
        type: data.type,
        amount: data.amount,
        term: data.term,
        payment: data.payment,
        income: data.income,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        comision: data.comision,
        acceptedOfferId: data.acceptedOfferId,
      });
    });

    setSolicitudes(fetchedSolicitudes);

    // Fetch offer counts for each solicitud
    fetchedSolicitudes.forEach((solicitud) => {
      fetchOfferCount(solicitud.id);
    });
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

    const db = getFirestore();
    await addDoc(collection(db, "solicitudes"), solicitudData);
    fetchSolicitudes(user?.uid || "");
    setShowForm(false);
  };

  const acceptOffer = async (solicitudId: string, offerId: string) => {
    try {
      setIsLoading((prev) => ({ ...prev, offers: true }));
      const db = getFirestore();
      
      await updateDoc(doc(db, "solicitudes", solicitudId), {
        status: "approved",
        acceptedOfferId: offerId,
        updatedAt: new Date().toISOString(),
      });
      
      await fetchSolicitudes(user?.uid || "");
      
      const updatedSolicitud = solicitudes.find(s => s.id === solicitudId);
      if (updatedSolicitud) {
        setSelectedSolicitud(updatedSolicitud);
      }
      
      showNotification({
        type: "success",
        message: "Oferta aceptada",
        description: "Has aceptado la oferta correctamente.",
      });
      
      // Redirect to the list of loans and clear the selected solicitud
      setSelectedSolicitudId(null);
      setSelectedSolicitud(null);
      
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        offers: "Error al aceptar la oferta. Por favor, intenta de nuevo.",
      }));
      
      showNotification({
        type: "error",
        message: "Error al aceptar la oferta",
        description: "Por favor, intenta nuevamente más tarde.",
      });
    } finally {
      setIsLoading((prev) => ({ ...prev, offers: false }));
    }
  };

  const openBanksModal = async (solicitudId: string) => {
    const solicitud = solicitudes.find(s => s.id === solicitudId);
    if (solicitud) {
      setSelectedSolicitud(solicitud);
    }
    
    setSelectedSolicitudId(solicitudId);
    try {
      await executeFetchOfferData();
      if (offer_data && offer_data.length > 0) {
        showNotification({
          type: "info",
          message: "Ofertas disponibles",
          description: "Se han encontrado ofertas para tu solicitud.",
        });
      } else {
        showNotification({
          type: "warning",
          message: "Sin ofertas disponibles",
          description:
            "No se encontraron ofertas para tu solicitud en este momento.",
        });
      }
    } catch (error) {
      showNotification({
        type: "error",
        message: "Error al obtener ofertas",
        description:
          "No se pudieron cargar las ofertas. Por favor, intenta más tarde.",
      });
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
        // Reset the state here
        setErrors({
          loans: null,
          settings: null,
          offers: null,
        });
      }}
    >
      <div className="flex min-h-screen bg-gray-50">
        <AnimatePresence>
          {errors.loans && (
            <ErrorNotification
              message={errors.loans}
              onClose={() => handleErrorClose("loans")}
            />
          )}
          {errors.settings && (
            <ErrorNotification
              message={errors.settings}
              onClose={() => handleErrorClose("settings")}
            />
          )}
          {errors.offers && (
            <ErrorNotification
              message={errors.offers}
              onClose={() => handleErrorClose("offers")}
            />
          )}
        </AnimatePresence>

        {isLoading.initial ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="space-y-4 w-full max-w-md p-4">
              <div className="h-8 bg-gray-200 rounded-md animate-pulse w-3/4 mx-auto" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md p-6 animate-pulse"
                  >
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Sidebar */}
            <div className="w-64 bg-white border-r border-gray-200">
              <div className="flex flex-col h-full">
                <div className="p-6">
                  <h1 className="text-xl font-semibold text-gray-900">
                    BuscoCredito
                  </h1>
                </div>
                <nav className="flex-1 px-3 space-y-1">
                  <Button
                    startContent={<CreditCard className="w-4 h-4" />}
                    className={`w-full justify-start h-11 px-4 ${
                      activeTab === "loans"
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-transparent text-gray-600 hover:bg-gray-50"
                    }`}
                    variant="light"
                    onPress={() => setActiveTab("loans")}
                  >
                    Préstamos
                  </Button>
                  <Button
                    startContent={<Settings className="w-4 h-4" />}
                    className={`w-full justify-start h-11 px-4 ${
                      activeTab === "settings"
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-transparent text-gray-600 hover:bg-gray-50"
                    }`}
                    variant="light"
                    onPress={() => setActiveTab("settings")}
                  >
                    Configuración
                  </Button>
                  <Button
                    startContent={<HelpCircle className="w-4 h-4" />}
                    className={`w-full justify-start h-11 px-4 ${
                      activeTab === "help"
                        ? "bg-green-50 text-green-700 hover:bg-green-100"
                        : "bg-transparent text-gray-600 hover:bg-gray-50"
                    }`}
                    variant="light"
                    onPress={() => setActiveTab("help")}
                  >
                    Ayuda
                  </Button>
                </nav>
                <div className="p-4 border-t border-gray-200">
                  <Button
                    startContent={<LogOut className="w-4 h-4" />}
                    className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
                    variant="light"
                    onPress={handleSignOut}
                  >
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <header className="bg-white border-b border-gray-200">
                <div className="px-8 py-6">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-semibold text-gray-900">
                      {activeTab === "loans" && "Préstamos"}
                      {activeTab === "settings" && "Configuración"}
                      {activeTab === "help" && "Centro de Ayuda"}
                    </h1>
                    {activeTab === "loans" && (
                      <Button
                        color="primary"
                        endContent={<PlusCircle className="w-4 h-4" />}
                        className="bg-green-600 hover:bg-green-700"
                        onPress={() => setShowForm(true)}
                      >
                        Solicitar Préstamo
                      </Button>
                    )}
                  </div>
                </div>
              </header>

              <main className="p-8">
                {activeTab === "loans" && (
                  <div className="space-y-6">
                    {isLoading.loans ? (
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                          <Card key={i} className="bg-white">
                            <CardBody className="p-6">
                              <div className="space-y-4 animate-pulse">
                                <div className="flex justify-between items-start">
                                  <div className="space-y-2">
                                    <div className="h-5 bg-gray-200 rounded w-32" />
                                    <div className="h-4 bg-gray-200 rounded w-24" />
                                  </div>
                                  <div className="h-6 bg-gray-200 rounded w-20" />
                                </div>
                                <div className="space-y-3">
                                  <div className="h-4 bg-gray-200 rounded w-full" />
                                  <div className="h-4 bg-gray-200 rounded w-full" />
                                  <div className="h-4 bg-gray-200 rounded w-full" />
                                </div>
                                <div className="pt-4">
                                  <div className="h-2 bg-gray-200 rounded w-full" />
                                </div>
                              </div>
                            </CardBody>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {selectedSolicitudId && offer_data && offer_data.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h2 className="text-xl font-semibold text-gray-900">
                                {selectedSolicitud?.acceptedOfferId
                                  ? "Oferta Aceptada"
                                  : "Ofertas Disponibles"}
                              </h2>
                              <Button
                                variant="light"
                                onPress={() => {
                                  setSelectedSolicitudId(null);
                                  setSelectedSolicitud(null);
                                }}
                                size="sm"
                                endContent={<ChevronRight className="w-4 h-4 rotate-180" />}
                              >
                                Volver a Préstamos
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {selectedSolicitud?.acceptedOfferId
                                ? offer_data
                                    .filter((offer) => offer.id === selectedSolicitud.acceptedOfferId)
                                    .map((offer, idx) => (
                                      <Card key={idx} className="w-full border-2 border-green-500">
                                        <CardBody className="p-6">
                                          <div className="space-y-6">
                                            {/* Header Section with Accepted Badge */}
                                            <div className="flex justify-between items-start">
                                              <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                  <h4 className="text-xl font-semibold text-gray-900">
                                                    {offer.lender_name}
                                                  </h4>
                                                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                    Aceptada
                                                  </span>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                  {offer.term}
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">
                                                  ${offer.amount?.toLocaleString()}
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                  {offer.interest_rate}% interés
                                                </p>
                                              </div>
                                            </div>

                                            {/* Rest of the offer details - same as before */}
                                            <div className="grid grid-cols-1 gap-6 pt-4 border-t">
                                              <div className="space-y-4">
                                                <h5 className="font-medium text-gray-900">
                                                  Información del Préstamo
                                                </h5>
                                                <div className="space-y-3">
                                                  <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">
                                                      Pago mensual:
                                                    </span>
                                                    <span className="font-medium">
                                                      $
                                                      {offer.monthly_payment?.toLocaleString()}
                                                    </span>
                                                  </div>
                                                  {offer.comision !== undefined && (
                                                    <div className="flex justify-between text-sm">
                                                      <span className="text-gray-500">
                                                        Comisión:
                                                      </span>
                                                      <span className="font-medium">
                                                        $
                                                        {offer.comision?.toLocaleString()}
                                                      </span>
                                                    </div>
                                                  )}
                                                  {offer.medical_balance !==
                                                    undefined && (
                                                    <div className="flex justify-between text-sm">
                                                      <span className="text-gray-500">
                                                        Saldo médico:
                                                      </span>
                                                      <span className="font-medium">
                                                        $
                                                        {offer.medical_balance?.toLocaleString()}
                                                      </span>
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Amortization table - same as before */}
                                              {offer.amortization &&
                                                Array.isArray(offer.amortization) &&
                                                offer.amortization.length > 0 && (
                                                  <div className="space-y-4">
                                                    <h5 className="font-medium text-gray-900">
                                                      Tabla de Amortización
                                                    </h5>
                                                    <div className="max-h-48 overflow-y-auto">
                                                      <table className="min-w-full divide-y divide-gray-200">
                                                        <thead className="bg-gray-50">
                                                          <tr>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                                              Mes
                                                            </th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                                              Pago
                                                            </th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                                              Capital
                                                            </th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                                              Interés
                                                            </th>
                                                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">
                                                              Saldo
                                                            </th>
                                                          </tr>
                                                        </thead>
                                                        <tbody className="bg-white divide-y divide-gray-200">
                                                          {offer.amortization.map(
                                                            (row, index) => (
                                                              <tr key={index}>
                                                                <td className="px-3 py-2 text-xs text-gray-900">
                                                                  {index + 1}
                                                                </td>
                                                                <td className="px-3 py-2 text-xs text-gray-900">
                                                                  $
                                                                  {row.payment?.toLocaleString() ??
                                                                    0}
                                                                </td>
                                                                <td className="px-3 py-2 text-xs text-gray-900">
                                                                  $
                                                                  {row.principal?.toLocaleString() ??
                                                                    0}
                                                                </td>
                                                                <td className="px-3 py-2 text-xs text-gray-900">
                                                                  $
                                                                  {row.interest?.toLocaleString() ??
                                                                    0}
                                                                </td>
                                                                <td className="px-3 py-2 text-xs text-gray-900">
                                                                  $
                                                                  {row.balance?.toLocaleString() ??
                                                                    0}
                                                                </td>
                                                              </tr>
                                                            )
                                                          )}
                                                        </tbody>
                                                      </table>
                                                    </div>
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                        </CardBody>
                                      </Card>
                                    ))
                                : offer_data.map((offer, idx) => (
                                  <Card key={idx} className="w-full">
                                    <CardBody className="p-6">
                                      <div className="space-y-6">
                                        {/* Header Section */}
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <h4 className="text-xl font-semibold text-gray-900">
                                              {offer.lender_name}
                                            </h4>
                                            <p className="text-sm text-gray-500">
                                              {offer.term}
                                            </p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-2xl font-bold text-green-600">
                                              ${offer.amount?.toLocaleString()}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              {offer.interest_rate}% interés
                                            </p>
                                          </div>
                                        </div>

                                        {/* Main Info Grid */}
                                        <div className="grid grid-cols-1 gap-6 pt-4 border-t">
                                          <div className="space-y-4">
                                            <h5 className="font-medium text-gray-900">
                                              Información del Préstamo
                                            </h5>
                                            <div className="space-y-3">
                                              <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">
                                                  Pago mensual:
                                                </span>
                                                <span className="font-medium">
                                                  $
                                                  {offer.monthly_payment?.toLocaleString()}
                                                </span>
                                              </div>
                                              {offer.comision !== undefined && (
                                                <div className="flex justify-between text-sm">
                                                  <span className="text-gray-500">
                                                    Comisión:
                                                  </span>
                                                  <span className="font-medium">
                                                    $
                                                    {offer.comision?.toLocaleString()}
                                                  </span>
                                                </div>
                                              )}
                                              {offer.medical_balance !==
                                                undefined && (
                                                <div className="flex justify-between text-sm">
                                                  <span className="text-gray-500">
                                                    Saldo médico:
                                                  </span>
                                                  <span className="font-medium">
                                                    $
                                                    {offer.medical_balance?.toLocaleString()}
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                          </div>

                                          {/* Accept Offer Button */}
                                          <Button
                                            color="success"
                                            className="w-full mt-4"
                                            onPress={() => acceptOffer(selectedSolicitudId!, offer.id)}
                                            isLoading={isLoading.offers}
                                          >
                                            Aceptar Oferta
                                          </Button>
                                        </div>
                                      </div>
                                    </CardBody>
                                  </Card>
                                ))}
                            </div>
                          </div>
                        ) : (
                          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {solicitudes.map((solicitud) => (
                              <Card key={solicitud.id} className={`bg-white ${solicitud.acceptedOfferId ? 'border-2 border-green-500' : ''}`}>
                                <CardBody className="p-6">
                                  <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <h3 className="text-lg font-semibold text-gray-900">
                                            {solicitud.purpose}
                                          </h3>
                                          {solicitud.acceptedOfferId && (
                                            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                              Aceptada
                                            </span>
                                          )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                          {solicitud.type}
                                        </p>
                                      </div>
                                      <span className="text-lg font-semibold text-green-600">
                                        ${solicitud.amount.toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">
                                          Plazo
                                        </span>
                                        <span className="text-gray-900">
                                          {solicitud.term}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">
                                          Forma de Pago
                                        </span>
                                        <span className="text-gray-900">
                                          {solicitud.payment}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">
                                          Ingresos
                                        </span>
                                        <span className="text-gray-900">
                                          ${solicitud.income.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="pt-4">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">
                                          {solicitud.acceptedOfferId ? 'Oferta aceptada' : 'Ofertas disponibles'}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                          {solicitud.acceptedOfferId 
                                            ? '1 oferta' 
                                            : `${offerCounts[solicitud.id] || 0} ofertas`}
                                        </span>
                                      </div>
                                      {!solicitud.acceptedOfferId && (
                                        <Progress
                                          value={
                                            offerCounts[solicitud.id]
                                              ? offerCounts[solicitud.id] * 20
                                              : 0
                                          }
                                          className="h-2"
                                          color="success"
                                        />
                                      )}
                                    </div>
                                  </div>
                                </CardBody>
                                <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                                  <div className="flex justify-between w-full">
                                    <Button
                                      color="danger"
                                      variant="light"
                                      onPress={() => {
                                        setSelectedSolicitud(solicitud);
                                        setShowDeleteConfirmation(true);
                                      }}
                                      isDisabled={!!solicitud.acceptedOfferId}
                                    >
                                      Eliminar
                                    </Button>
                                    <Button
                                      color="primary"
                                      variant="flat"
                                      endContent={
                                        <ChevronRight className="w-4 h-4" />
                                      }
                                      onPress={() =>
                                        openBanksModal(solicitud.id)
                                      }
                                    >
                                      {solicitud.acceptedOfferId ? 'Ver Oferta' : 'Ver Ofertas'}
                                    </Button>
                                  </div>
                                </CardFooter>
                              </Card>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "settings" && (
                  <>
                    {isLoading.settings ? (
                      <Card className="bg-white max-w-4xl mx-auto">
                        <CardBody className="p-6">
                          <div className="flex items-center gap-6 mb-6">
                            <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
                            <div className="space-y-3 flex-1">
                              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse" />
                              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                            </div>
                          </div>
                          <div className="space-y-8">
                            <div>
                              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                              <div className="grid grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                  <div key={i} className="space-y-2">
                                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                                    <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ) : (
                      <Card className="bg-white max-w-4xl mx-auto">
                        <CardBody className="p-6">
                          <div className="flex items-center gap-6 mb-6">
                            <div className="relative">
                              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                                <UserIcon className="w-12 h-12 text-gray-400" />
                              </div>
                            </div>
                            <div>
                              <h2 className="text-2xl font-semibold text-gray-900">
                                {`${userData.name} ${userData.last_name} ${userData.second_last_name}`}
                              </h2>
                            </div>
                          </div>

                          <div className="space-y-8">
                            {/* Datos Personales */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                DATOS PERSONALES
                              </h3>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    correo electrónico
                                  </p>
                                  <p className="text-gray-900">
                                    {userData.email}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    fecha nacimiento
                                  </p>
                                  <p className="text-gray-900">
                                    {formatDate(userData.birthday)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    contraseña
                                  </p>
                                  <p className="text-gray-900">••••••••••••</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">RFC</p>
                                  <p className="text-gray-900">
                                    {userData.rfc}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Domicilio */}
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                                DOMICILIO
                              </h3>
                              <div className="grid grid-cols-2 gap-6">
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Colonia
                                  </p>
                                  <p className="text-gray-900">
                                    {userData.address.colony}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Calle y Número
                                  </p>
                                  <p className="text-gray-900">{`${userData.address.street} #${userData.address.number}`}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Código Postal
                                  </p>
                                  <p className="text-gray-900">
                                    {userData.address.zipCode}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Ciudad
                                  </p>
                                  <p className="text-gray-900">
                                    {userData.address.city}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Municipio
                                  </p>
                                  <p className="text-gray-900">
                                    {userData.address.state}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-500">
                                    Estado
                                  </p>
                                  <p className="text-gray-900">
                                    {userData.address.state}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 flex justify-between">
                            <Button color="primary" variant="flat">
                              Inhabilitar
                            </Button>
                            <Button color="primary">Modificar</Button>
                          </div>
                        </CardBody>
                      </Card>
                    )}
                  </>
                )}

                {activeTab === "help" && (
                  <Card className="bg-white max-w-2xl mx-auto">
                    <CardBody className="p-6">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Centro de Ayuda
                      </h2>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Preguntas Frecuentes
                          </h3>
                          <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">
                                ¿Cómo solicito un préstamo?
                              </h4>
                              <p className="text-gray-600">
                                Para solicitar un préstamo, dirígete a la
                                sección de "Préstamos" y haz clic en el botón
                                "Solicitar Préstamo". Completa el formulario con
                                la información requerida y envía tu solicitud.
                              </p>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-lg">
                              <h4 className="font-medium text-gray-900 mb-2">
                                ¿Cómo funciona el proceso?
                              </h4>
                              <p className="text-gray-600">
                                Una vez enviada tu solicitud, nuestros
                                prestamistas la revisarán y te enviarán ofertas
                                si están interesados. Podrás ver todas las
                                ofertas recibidas en la sección de "Préstamos".
                              </p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Contacto
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-600 mb-2">
                              Si necesitas asistencia adicional, no dudes en
                              contactarnos:
                            </p>
                            <ul className="space-y-2 text-gray-600">
                              <li>Email: soporte@buscocredito.com</li>
                              <li>Teléfono: +1 (555) 123-4567</li>
                              <li>
                                Horario: Lunes a Viernes, 9:00 AM - 6:00 PM
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                )}
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
                onPress={() =>
                  selectedSolicitud &&
                  handleDeleteSolicitud(selectedSolicitud.id)
                }
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
      </div>
    </ErrorBoundary>
  );
}
