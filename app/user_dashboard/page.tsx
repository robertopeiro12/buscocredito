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
} from "firebase/firestore";

export default function DashboardPage() {

  const [user, setUser] = useState("");
  const [activeTab, setActiveTab] = useState("loans");
  const [showBanksModal, setShowBanksModal] = useState(false);
  const [banksData, setBanksData] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.uid);
        fetchSolicitudes(user.uid);
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router]);

  const fetchSolicitudes = async (userId) => {
    const db = getFirestore();
    const solicitudesRef = collection(db, "solicitudes");
    const q = query(solicitudesRef, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    const fetchedSolicitudes = [];
    querySnapshot.forEach((doc) => {
      fetchedSolicitudes.push({ id: doc.id, ...doc.data() });
    });

    setSolicitudes(fetchedSolicitudes);
  };

  const deleteSolicitud = async (solicitudId) => {
    const db = getFirestore();
    await deleteDoc(doc(db, "solicitudes", solicitudId));
    fetchSolicitudes(user);
    setShowDeleteConfirmation(false);
  };

  const addSolicitud = async (solicitud) => {
    const db = getFirestore();
    await addDoc(collection(db, "solicitudes"), {
      ...solicitud,
      userId: user,
    });
    fetchSolicitudes(user);
    setShowForm(false);
  };

  const openBanksModal = (banks) => {
    setBanksData(banks || []);
    setShowBanksModal(true);
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
              <Button
                color="primary"
                endContent={<PlusCircle className="w-4 h-4" />}
                className="bg-green-600 hover:bg-green-700"
                onPress={() => setShowForm(true)}
              >
                Solicitar Préstamo
              </Button>
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
                                Progreso de ofertas
                              </span>
                              <span className="text-sm text-gray-500">
                                {solicitud.accepted?.length || 0} ofertas
                              </span>
                            </div>
                            <Progress
                              value={(solicitud.accepted?.length || 0) * 20}
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
                            onPress={() => openBanksModal(solicitud.accepted)}
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
            <Card className="bg-white max-w-2xl mx-auto">
              <CardBody className="p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Información Personal
                  </h2>
                  <div className="space-y-4">
                    <Input
                      label="Nombre completo"
                      placeholder="Ingresa tu nombre"
                      variant="bordered"
                    />
                    <Input
                      label="Correo electrónico"
                      placeholder="correo@ejemplo.com"
                      type="email"
                      variant="bordered"
                    />
                    <Input
                      label="Teléfono"
                      placeholder="(123) 456-7890"
                      type="tel"
                      variant="bordered"
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4">
                    Preferencias
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">
                        Notificaciones por correo
                      </span>
                      <Button color="primary" variant="flat">
                        Configurar
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">
                        Privacidad de la cuenta
                      </span>
                      <Button color="primary" variant="flat">
                        Administrar
                      </Button>
                    </div>
                  </div>
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
        onClose={() => setShowBanksModal(false)}
        className="bg-white"
      >
        <ModalContent>
          <ModalHeader className="border-b">Ofertas Disponibles</ModalHeader>
          <ModalBody>
            {banksData.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {banksData.map((bank, idx) => (
                  <li key={idx} className="py-3 flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span className="text-gray-900">{bank}</span>
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
          <ModalFooter className="border-t">
            <Button color="primary" onPress={() => setShowBanksModal(false)}>
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
              onPress={() => deleteSolicitud(selectedSolicitud.id)}
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
