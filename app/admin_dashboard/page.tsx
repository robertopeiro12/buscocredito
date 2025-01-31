"use client";

// Firebase imports
import { auth } from "../firebase";
import {
  onAuthStateChanged,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
} from "firebase/firestore";

// React and Next.js imports
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, X } from "lucide-react";

// UI Component imports
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
  Badge,
  Avatar,
  Tooltip,
} from "@nextui-org/react";

// Icon imports
import {
  Users,
  Settings,
  HelpCircle,
  LogOut,
  PlusCircle,
  ChevronRight,
  User,
} from "lucide-react";

// Types
interface Subaccount {
  id: number;
  name: string;
  email: string;
  password: string;
  userId: string;
  status: "active" | "inactive";
  lastActive?: string;
  createdAt: string;
}

interface AdminData {
  name: string;
  email: string;
  company: string;
  avatar?: string;
  notifications?: number;
}

// Initial states
const initialSubaccountState: Omit<Subaccount, "id"> = {
  name: "",
  email: "",
  password: "",
  userId: "",
  status: "active",
  createdAt: new Date().toISOString(),
};

const initialAdminState: AdminData = {
  name: "",
  email: "",
  company: "",
  notifications: 0,
};

export default function AdminDashboard() {
  // State management
  const [subaccounts, setSubaccounts] = useState<Subaccount[]>([]);
  const [user, setUser] = useState<string>("");
  const [activeTab, setActiveTab] = useState<
    "subaccounts" | "settings" | "help"
  >("subaccounts");
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    createSubaccount?: string;
    fetch?: string;
    adminData?: string;
    signOut?: string;
    fetchSubaccounts?: string;
  }>({});

  // Modal states
  const [showSubaccountModal, setShowSubaccountModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedSubaccount, setSelectedSubaccount] =
    useState<Subaccount | null>(null);

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
    show: boolean;
  }>({
    type: "success",
    message: "",
    show: false,
  });

  // Form states
  const [newSubaccount, setNewSubaccount] = useState(initialSubaccountState);
  const [adminData, setAdminData] = useState(initialAdminState);
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();

  // Validation function
  const validateSubaccountForm = (values: {
    name: string;
    email: string;
    password: string;
  }) => {
    const errors: { [key: string]: string } = {};

    // Name validation
    if (!values.name) {
      errors.name = "El nombre es obligatorio";
    } else if (values.name.length < 3) {
      errors.name = "El nombre debe tener al menos 3 caracteres";
    } else if (values.name.length > 50) {
      errors.name = "El nombre no puede tener más de 50 caracteres";
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(values.name)) {
      errors.name = "El nombre solo puede contener letras y espacios";
    }

    // Email validation
    if (!values.email) {
      errors.email = "El correo electrónico es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
      errors.email = "El correo electrónico no es válido";
    }

    // Password validation
    if (!values.password) {
      errors.password = "La contraseña es obligatoria";
    } else if (values.password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres";
    } else if (values.password.length > 50) {
      errors.password = "La contraseña no puede tener más de 50 caracteres";
    } else if (!/\d/.test(values.password)) {
      errors.password = "La contraseña debe contener al menos un número";
    } else if (!/[A-Z]/.test(values.password)) {
      errors.password = "La contraseña debe contener al menos una mayúscula";
    } else if (!/[a-z]/.test(values.password)) {
      errors.password = "La contraseña debe contener al menos una minúscula";
    }

    return errors;
  };

  // Authentication and data fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user.uid);
        try {
          await Promise.all([
            fetchSubaccounts(user.uid),
            fetchAdminData(user.uid),
          ]);
        } catch (error) {
          console.error("Error fetching data:", error);
          setErrors({
            ...errors,
            fetch: "Error al cargar los datos. Por favor, intente de nuevo.",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        router.push("/login");
      }
    });

    return () => unsubscribe();
  }, [router, errors]);

  // Fetch admin data
  const fetchAdminData = async (userId: string) => {
    try {
      const db = getFirestore();

      const cuentasRef = collection(db, "cuentas");
      const q = query(cuentasRef, where("type", "==", "b_admin"));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const adminDoc = querySnapshot.docs[0];
        const data = adminDoc.data();
        setAdminData({
          name: data.Nombre || "",
          email: data.email || "",
          company: data.Empresa || "",
          avatar: data.avatar,
          notifications: data.notifications || 0,
        });
      } else {
        throw new Error("No se encontraron datos del administrador");
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
      setErrors({
        ...errors,
        adminData: "Error al cargar los datos del administrador",
      });
      throw error;
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
        setErrors({ ...errors, signOut: "Error al cerrar sesión" });
      });
  };

  // Fetch subaccounts with improved error handling
  const fetchSubaccounts = async (adminId: string) => {
    try {
      const db = getFirestore();
      const subaccountsRef = collection(db, "cuentas");
      const q = query(subaccountsRef, where("Empresa_id", "==", adminId));
      const querySnapshot = await getDocs(q);

      const fetchedSubaccounts: Subaccount[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedSubaccounts.push({
          id: fetchedSubaccounts.length + 1,
          name: data.Nombre,
          email: data.email,
          password: "",
          userId: doc.id,
          status: data.status || "active",
          lastActive: data.lastActive,
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });
      setSubaccounts(fetchedSubaccounts);
    } catch (error) {
      console.error("Error fetching subaccounts:", error);
      setErrors({
        ...errors,
        fetchSubaccounts: "Error al cargar las subcuentas",
      });
      throw error;
    }
  };

  // Create subaccount with improved error handling and validation
  const createSubaccount = async (newSubaccount: Omit<Subaccount, "id">) => {
    try {
      if (
        !newSubaccount.email ||
        !newSubaccount.password ||
        !newSubaccount.name
      ) {
        setErrors({
          createSubaccount: "Todos los campos son obligatorios",
        });
        return;
      }

      if (newSubaccount.password.length < 6) {
        setErrors({
          createSubaccount: "La contraseña debe tener al menos 6 caracteres",
        });
        return;
      }

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newSubaccount.email,
        newSubaccount.password
      );

      const uid = userCredential.user.uid;
      const currentDate = new Date().toISOString();

      // Create document in Firestore
      const db = getFirestore();
      const docRef = await addDoc(collection(db, "cuentas"), {
        Empresa: adminData.company,
        Empresa_id: user,
        Nombre: newSubaccount.name,
        email: newSubaccount.email,
        type: "b_sale",
        status: "active",
        createdAt: currentDate,
        lastActive: currentDate,
      });

      if (docRef.id) {
        await fetchSubaccounts(user);
        return docRef.id;
      }
    } catch (error: any) {
      console.error("Error creating subaccount:", error);

      // Handle specific Firebase Auth errors
      const errorMessages: { [key: string]: string } = {
        "auth/email-already-in-use": "El correo electrónico ya está en uso",
        "auth/invalid-email": "El correo electrónico no es válido",
        "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
        "auth/operation-not-allowed":
          "La creación de cuentas está deshabilitada",
      };

      const errorMessage = error.code
        ? errorMessages[error.code] || "Error al crear la cuenta"
        : error.message || "Error al crear la cuenta";

      throw new Error(errorMessage);
    }
  };

  // Handle subaccount creation with loading state and error handling
  const handleCreateSubaccount = async () => {
    setIsCreating(true);

    // Clear previous errors
    setErrors({});

    // Validate form
    const validationErrors = validateSubaccountForm(newSubaccount);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsCreating(false);
      return;
    }

    try {
      await createSubaccount({ ...newSubaccount, userId: user });
      setShowSubaccountModal(false);
      setNewSubaccount(initialSubaccountState);
      setNotification({
        type: "success",
        message: "Subcuenta creada exitosamente",
        show: true,
      });
    } catch (error: any) {
      // Handle Firebase specific errors
      const errorCode = error.code;
      if (errorCode === "auth/email-already-in-use") {
        setErrors({ email: "Este correo electrónico ya está registrado" });
      } else if (errorCode === "auth/invalid-email") {
        setErrors({ email: "El correo electrónico no es válido" });
      } else if (errorCode === "auth/weak-password") {
        setErrors({ password: "La contraseña es demasiado débil" });
      } else {
        setErrors({ createSubaccount: error.message });
      }

      setNotification({
        type: "error",
        message: "Error al crear la subcuenta",
        show: true,
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Delete subaccount with confirmation and error handling
  const deleteSubaccount = async (subaccountId: string) => {
    try {
      setIsLoading(true);

      // Get the subaccount email before deletion
      const db = getFirestore();
      const subaccountDoc = await getDoc(doc(db, "cuentas", subaccountId));

      if (!subaccountDoc.exists()) {
        throw new Error("La subcuenta no existe");
      }

      const subaccountEmail = subaccountDoc.data().email;

      // Call our API endpoint
      const response = await fetch("/api/deleteSubaccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subaccountId,
          email: subaccountEmail,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Error al eliminar la subcuenta");
      }

      // Update local state
      setSubaccounts((prev) =>
        prev.filter((account) => account.userId !== subaccountId)
      );
      setShowDeleteConfirmation(false);

      setNotification({
        type: "success",
        message: "La subcuenta se ha eliminado correctamente",
        show: true,
      });
    } catch (error: any) {
      console.error("Error deleting subaccount:", error);

      setNotification({
        type: "error",
        message: error.message || "Error al eliminar la subcuenta",
        show: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="space-y-3 text-center">
            <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {Object.keys(errors).length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {Object.entries(errors).map(([key, message]) => (
            <div
              key={key}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg shadow-lg"
            >
              {message}
              <button
                onClick={() =>
                  setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors[key];
                    return newErrors;
                  })
                }
                className="ml-3 text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 shadow-sm">
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              {adminData.avatar ? (
                <Avatar src={adminData.avatar} className="w-10 h-10" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
              )}
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {adminData.company}
                </h1>
                <p className="text-sm text-gray-500">{adminData.name}</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <Button
              startContent={<Users className="w-5 h-5" />}
              endContent={
                subaccounts.length > 0 && (
                  <Badge size="sm" color="primary">
                    {subaccounts.length}
                  </Badge>
                )
              }
              className={`w-full justify-between h-11 px-4 ${
                activeTab === "subaccounts"
                  ? "bg-green-50 text-green-700 hover:bg-green-100"
                  : "bg-transparent text-gray-600 hover:bg-gray-50"
              }`}
              variant="light"
              onPress={() => setActiveTab("subaccounts")}
            >
              Subcuentas
            </Button>

            <Button
              startContent={<Settings className="w-5 h-5" />}
              className={`w-full justify-between h-11 px-4 ${
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
              startContent={<HelpCircle className="w-5 h-5" />}
              className={`w-full justify-between h-11 px-4 ${
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

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <Tooltip content="Cerrar sesión">
              <Button
                startContent={<LogOut className="w-4 h-4" />}
                className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50"
                variant="light"
                onPress={handleSignOut}
              >
                Cerrar sesión
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {activeTab === "subaccounts" && "Gestionar Subcuentas"}
                  {activeTab === "settings" && "Configuración"}
                  {activeTab === "help" && "Centro de Ayuda"}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {activeTab === "subaccounts" &&
                    `${subaccounts.length} subcuentas activas`}
                  {activeTab === "settings" &&
                    "Administra tu perfil y preferencias"}
                  {activeTab === "help" &&
                    "Encuentra respuestas a tus preguntas"}
                </p>
              </div>

              {activeTab === "subaccounts" && (
                <Button
                  color="primary"
                  endContent={<PlusCircle className="w-4 h-4" />}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onPress={() => setShowSubaccountModal(true)}
                  size="lg"
                >
                  Nueva Subcuenta
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {activeTab === "subaccounts" && (
            <div className="space-y-6">
              {subaccounts.length === 0 ? (
                <Card className="bg-white">
                  <CardBody className="py-12">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay subcuentas aún
                      </h3>
                      <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        Las subcuentas te permiten dar acceso a tu equipo para
                        gestionar préstamos.
                      </p>
                      <Button
                        color="primary"
                        endContent={<PlusCircle className="w-4 h-4" />}
                        className="bg-green-600 hover:bg-green-700"
                        onPress={() => setShowSubaccountModal(true)}
                      >
                        Crear Primera Subcuenta
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ) : (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {subaccounts.map((subaccount) => (
                    <Card
                      key={subaccount.id}
                      className="bg-white hover:shadow-md transition-shadow"
                    >
                      <CardBody className="p-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {subaccount.name}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {subaccount.email}
                                </p>
                              </div>
                            </div>
                            <Badge
                              color={
                                subaccount.status === "active"
                                  ? "success"
                                  : "default"
                              }
                              variant="flat"
                              className="capitalize"
                            >
                              {subaccount.status}
                            </Badge>
                          </div>

                          <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex justify-between">
                              <span>Creado:</span>
                              <span>
                                {new Date(
                                  subaccount.createdAt
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            {subaccount.lastActive && (
                              <div className="flex justify-between">
                                <span>Última actividad:</span>
                                <span>
                                  {new Date(
                                    subaccount.lastActive
                                  ).toLocaleDateString()}
                                </span>
                              </div>
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
                              setSelectedSubaccount(subaccount);
                              setShowDeleteConfirmation(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            Eliminar
                          </Button>
                          <Button
                            color="primary"
                            variant="flat"
                            endContent={<ChevronRight className="w-4 h-4" />}
                            className="bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            Gestionar
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <Card className="bg-white max-w-4xl mx-auto">
              <CardBody className="p-8">
                <div className="flex items-center gap-8 mb-8 pb-8 border-b border-gray-200">
                  <div className="relative">
                    {adminData.avatar ? (
                      <Avatar src={adminData.avatar} className="w-24 h-24" />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="w-12 h-12 text-green-600" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                      {adminData.name}
                    </h2>
                    <p className="text-gray-500 mb-4">{adminData.company}</p>
                    <Button
                      color="primary"
                      variant="flat"
                      className="bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      Cambiar foto
                    </Button>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Información de la Empresa
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Input
                        label="Nombre de la Empresa"
                        value={adminData.company}
                        className="max-w-full"
                        readOnly
                      />
                      <Input
                        label="Correo electrónico"
                        value={adminData.email}
                        className="max-w-full"
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Seguridad
                    </h3>
                    <Button
                      color="primary"
                      variant="flat"
                      className="bg-green-100 text-green-700 hover:bg-green-200"
                    >
                      Cambiar contraseña
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Help Tab */}
          {activeTab === "help" && (
            <Card className="bg-white max-w-3xl mx-auto">
              <CardBody className="p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Centro de Ayuda
                </h2>
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Preguntas Frecuentes
                    </h3>
                    <div className="space-y-4">
                      {[
                        {
                          question: "¿Cómo creo una nueva subcuenta?",
                          answer:
                            "Para crear una nueva subcuenta, haz clic en el botón 'Nueva Subcuenta' en la parte superior derecha de la página. Completa el formulario con la información requerida y envía la solicitud.",
                        },
                        {
                          question: "¿Cómo gestiono las subcuentas existentes?",
                          answer:
                            "Puedes gestionar las subcuentas desde la sección 'Subcuentas'. Cada subcuenta tiene opciones para editar su información o eliminarla si es necesario.",
                        },
                      ].map((item, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">
                            {item.question}
                          </h4>
                          <p className="text-gray-600">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Soporte
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 mb-4">
                        ¿Necesitas ayuda adicional? Contáctanos:
                      </p>
                      <div className="space-y-2 text-gray-600">
                        <p>Email: soporte@buscocredito.com</p>
                        <p>Teléfono: (55) 1234-5678</p>
                        <p>Horario: Lunes a Viernes, 9:00 AM - 6:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </main>
      </div>

      {/* Create Subaccount Modal */}
      <Modal
        isOpen={showSubaccountModal}
        onClose={() => {
          setShowSubaccountModal(false);
          setNewSubaccount(initialSubaccountState);
          setErrors({});
        }}
      >
        <ModalContent>
          <ModalHeader className="border-b">
            <span className="text-xl font-semibold">Nueva Subcuenta</span>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="space-y-6">
              <Input
                label="Nombre Completo"
                placeholder="Ej. Juan Pérez"
                value={newSubaccount.name}
                onChange={(e) =>
                  setNewSubaccount({
                    ...newSubaccount,
                    name: e.target.value,
                  })
                }
                isRequired
                isInvalid={!!errors.name}
                errorMessage={errors.name}
                className="max-w-full"
              />
              <Input
                label="Correo Electrónico"
                placeholder="juan.perez@empresa.com"
                value={newSubaccount.email}
                onChange={(e) =>
                  setNewSubaccount({
                    ...newSubaccount,
                    email: e.target.value,
                  })
                }
                isRequired
                type="email"
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                className="max-w-full"
              />
              <Input
                label="Contraseña"
                placeholder="Mínimo 6 caracteres"
                type="password"
                value={newSubaccount.password}
                onChange={(e) =>
                  setNewSubaccount({
                    ...newSubaccount,
                    password: e.target.value,
                  })
                }
                isRequired
                isInvalid={!!errors.password}
                errorMessage={errors.password}
                description="La contraseña debe contener al menos 6 caracteres, una mayúscula, una minúscula y un número"
                className="max-w-full"
              />
            </div>
          </ModalBody>
          <ModalFooter className="border-t">
            <Button
              variant="light"
              onPress={() => {
                setShowSubaccountModal(false);
                setNewSubaccount(initialSubaccountState);
              }}
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              className="bg-green-600 hover:bg-green-700 text-white"
              onPress={handleCreateSubaccount}
              isLoading={isCreating}
            >
              {isCreating ? "Creando..." : "Crear Subcuenta"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
      >
        <ModalContent>
          <ModalHeader className="border-b">
            <span className="text-xl font-semibold">Confirmar Eliminación</span>
          </ModalHeader>
          <ModalBody className="py-6">
            <div className="flex items-center gap-4 mb-4 text-yellow-600 bg-yellow-50 p-4 rounded-lg">
              <HelpCircle className="w-6 h-6 flex-shrink-0" />
              <p>Esta acción no se puede deshacer. ¿Estás seguro?</p>
            </div>
            {selectedSubaccount && (
              <p className="text-gray-600">
                Se eliminará la subcuenta de{" "}
                <strong>{selectedSubaccount.name}</strong>
              </p>
            )}
          </ModalBody>
          <ModalFooter className="border-t">
            <Button
              variant="light"
              onPress={() => setShowDeleteConfirmation(false)}
            >
              Cancelar
            </Button>
            <Button
              color="danger"
              onPress={() =>
                selectedSubaccount &&
                deleteSubaccount(selectedSubaccount.userId)
              }
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar Subcuenta
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {notification.show && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
            notification.type === "success"
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            <p
              className={`${
                notification.type === "success"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {notification.message}
            </p>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="ml-2"
              onPress={() =>
                setNotification((prev) => ({ ...prev, show: false }))
              }
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
