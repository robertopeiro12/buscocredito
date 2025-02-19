"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
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
  User,
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
} from "firebase/firestore";

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

interface Solicitud {
  id: string;
  purpose: string;
  type: string;
  amount: number;
  term: string;
  payment: string;
  income: number;
  accepted?: string[];
  userId: string;
}

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

export default function DashboardPage() {
  const [user, setUser] = useState("");
  const [activeTab, setActiveTab] = useState("loans");
  const [showBanksModal, setShowBanksModal] = useState(false);
  const [banksData, setBanksData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [offer_data, set_offer_Data] = useState<Offer[]>([]);
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
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user.uid);
        fetchSolicitudes(user.uid);
        fetchUserData(user.uid);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetch_offer_data = async (loanId: string) => {
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
        set_offer_Data(data.data ? JSON.parse(data.data) : null);
      }
    } catch (error) {
      console.error("Error getting data:", error);
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
        setOfferCounts(prev => ({ ...prev, [loanId]: offers.length }));
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

    const fetchedSolicitudes: Solicitud[] = [];
    querySnapshot.forEach((doc) => {
      fetchedSolicitudes.push({ id: doc.id, ...doc.data() } as Solicitud);
    });

    setSolicitudes(fetchedSolicitudes);
    
    // Fetch offer counts for each solicitud
    fetchedSolicitudes.forEach(solicitud => {
      fetchOfferCount(solicitud.id);
    });
  };

  const deleteSolicitud = async (solicitudId: string) => {
    const db = getFirestore();
    await deleteDoc(doc(db, "solicitudes", solicitudId));
    fetchSolicitudes(user);
    setShowDeleteConfirmation(false);
  };

  const addSolicitud = async (solicitud: Omit<Solicitud, 'id'>) => {
    const db = getFirestore();
    await addDoc(collection(db, "solicitudes"), {
      ...solicitud,
      userId: user,
    });
    fetchSolicitudes(user);
    setShowForm(false);
  };

  const openBanksModal = async (solicitudId: string) => {
    try {
      console.log(solicitudId);
      await fetch_offer_data(solicitudId);
      setShowBanksModal(true);
    } catch (error) {
      console.error("Error fetching offers:", error);
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        setUser("");
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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
              {solicitudes.length === 0 ? (
                <Card className="bg-white">
                  <CardBody className="py-8">
                    <div className="text-center">
                      <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No tienes préstamos activos
                      </h3>
                      <p className="text-gray-500">
                        Comienza solicitando tu primer préstamo
                      </p>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {solicitudes.map((solicitud) => (
                    <Card key={solicitud.id} className="bg-white">
                      <CardBody className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {solicitud.purpose}
                              </h3>
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
                              <span className="text-gray-500">Plazo</span>
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
                              <span className="text-gray-500">Ingresos</span>
                              <span className="text-gray-900">
                                ${solicitud.income.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="pt-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Ofertas disponibles
                              </span>
                              <span className="text-sm text-gray-500">
                                {offerCounts[solicitud.id] || 0} ofertas
                              </span>
                            </div>
                            <Progress
                              value={offerCounts[solicitud.id] ? (offerCounts[solicitud.id] * 20) : 0}
                              className="h-2"
                              color="success"
                            />
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
                          >
                            Eliminar
                          </Button>
                          <Button
                            color="primary"
                            variant="flat"
                            endContent={<ChevronRight className="w-4 h-4" />}
                            onPress={() => openBanksModal(solicitud.id)}
                          >
                            Ver Ofertas
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <Card className="bg-white max-w-4xl mx-auto">
              <CardBody className="p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
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
                        <p className="text-gray-900">{userData.email}</p>
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
                        <p className="text-sm text-gray-500">contraseña</p>
                        <p className="text-gray-900">••••••••••••</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">RFC</p>
                        <p className="text-gray-900">{userData.rfc}</p>
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
                        <p className="text-sm text-gray-500">Colonia</p>
                        <p className="text-gray-900">
                          {userData.address.colony}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Calle y Número</p>
                        <p className="text-gray-900">{`${userData.address.street} #${userData.address.number}`}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Código Postal</p>
                        <p className="text-gray-900">
                          {userData.address.zipCode}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Ciudad</p>
                        <p className="text-gray-900">{userData.address.city}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Municipio</p>
                        <p className="text-gray-900">
                          {userData.address.state}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Estado</p>
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
                          Para solicitar un préstamo, dirígete a la sección de
                          "Préstamos" y haz clic en el botón "Solicitar
                          Préstamo". Completa el formulario con la información
                          requerida y envía tu solicitud.
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          ¿Cómo funciona el proceso?
                        </h4>
                        <p className="text-gray-600">
                          Una vez enviada tu solicitud, nuestros prestamistas la
                          revisarán y te enviarán ofertas si están interesados.
                          Podrás ver todas las ofertas recibidas en la sección
                          de "Préstamos".
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
                        <li>Horario: Lunes a Viernes, 9:00 AM - 6:00 PM</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showForm && (
          <CreditForm
            addSolicitud={addSolicitud}
            resetForm={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      <Modal
        isOpen={showBanksModal}
        onClose={() => {
          setShowBanksModal(false);
          setSelectedOffer(null);
        }}
        size={selectedOffer ? "3xl" : "xl"}
        className="bg-white"
      >
        <ModalContent>
          {selectedOffer ? (
            <>
              <ModalHeader className="border-b">
                <div className="flex justify-between items-center w-full">
                  <h3 className="text-xl font-semibold">Detalles de la Oferta</h3>
                  <Button
                    variant="light"
                    onPress={() => setSelectedOffer(null)}
                    size="sm"
                  >
                    Volver a la lista
                  </Button>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Información del Préstamo</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Prestamista:</span>
                          <span className="font-medium">{selectedOffer.lender_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Monto del préstamo:</span>
                          <span className="font-medium text-green-600">${selectedOffer.amount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Tasa de interés:</span>
                          <span className="font-medium">{selectedOffer.interest_rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Plazo:</span>
                          <span className="font-medium">{selectedOffer.term}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Costos y Pagos</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Pago mensual:</span>
                          <span className="font-medium">${selectedOffer.monthly_payment?.toLocaleString()}</span>
                        </div>
                        {selectedOffer.comision !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Comisión:</span>
                            <span className="font-medium">${selectedOffer.comision?.toLocaleString()}</span>
                          </div>
                        )}
                        {selectedOffer.medical_balance !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Saldo médico:</span>
                            <span className="font-medium">${selectedOffer.medical_balance?.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {selectedOffer.amortization && Array.isArray(selectedOffer.amortization) && selectedOffer.amortization.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-4">Tabla de Amortización</h4>
                      <div className="max-h-64 overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Pago</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Capital</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Interés</th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedOffer.amortization.map((row, index) => (
                              <tr key={index}>
                                <td className="px-4 py-2 text-sm text-gray-900">{index + 1}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">${row.payment?.toLocaleString() ?? 0}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">${row.principal?.toLocaleString() ?? 0}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">${row.interest?.toLocaleString() ?? 0}</td>
                                <td className="px-4 py-2 text-sm text-gray-900">${row.balance?.toLocaleString() ?? 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </ModalBody>
            </>
          ) : (
            <>
              <ModalHeader className="border-b">Ofertas Disponibles</ModalHeader>
              <ModalBody>
                {offer_data && offer_data.length > 0 ? (
                  <ul className="divide-y divide-gray-200">
                    {offer_data.map((offer, idx) => (
                      <li 
                        key={idx} 
                        className="py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setSelectedOffer(offer)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{offer.lender_name}</h4>
                          <span className="text-green-600 font-semibold">
                            ${offer.amount?.toLocaleString()}
                          </span>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Tasa de interés:</span>
                            <span className="text-gray-900">{offer.interest_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Plazo:</span>
                            <span className="text-gray-900">{offer.term}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Pago mensual:</span>
                            <span className="text-gray-900">${offer.monthly_payment?.toLocaleString()}</span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">
                      No hay ofertas disponibles en este momento.
                    </p>
                  </div>
                )}
              </ModalBody>
            </>
          )}
          <ModalFooter className="border-t">
            <Button color="primary" onPress={() => {
              setShowBanksModal(false);
              setSelectedOffer(null);
            }}>
              Cerrar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
      >
        <ModalContent>
          <ModalHeader className="border-b">Confirmar Eliminación</ModalHeader>
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
              onPress={() => selectedSolicitud && deleteSolicitud(selectedSolicitud.id)}
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
  );
}
