"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore";
import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@nextui-org/react";
import { Search, PlusCircle, User } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SubaccountCard } from "@/components/SubaccountCard";

type Subaccount = {
  id: number;
  name: string;
  email: string;
  password: string;
  userId: string;
  Empresa: string;
};

type AdminData = {
  Empresa: string;
  email: string;
};

export default function AdminDashboard() {
  const [subaccounts, setSubaccounts] = useState<Subaccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [formErrors, setFormErrors] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [user, setUser] = useState("");
  const [adminData, setAdminData] = useState<AdminData>({
    Empresa: "",
    email: "",
  });
  const [newSubaccount, setNewSubaccount] = useState<Omit<Subaccount, "id">>({
    name: "",
    email: "",
    password: "",
    userId: "",
    Empresa: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("subaccounts");
  const filteredSubaccounts = subaccounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.uid);
        setUserEmail(user.email || ""); // Guardamos el email aquí
        fetchUsers(user.uid);
        fetchAdminData(user.uid);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  const fetchAdminData = async (userId: string) => {
    const db = getFirestore();
    try {
      const adminDoc = await getDoc(doc(db, "cuentas", userId));
      if (adminDoc.exists()) {
        const data = adminDoc.data();
        setAdminData({
          Empresa: data.Empresa || "",
          email: data.email || "",
        });
        console.log("empresa get ", data.Empresa);
      }
    } catch (error) {
      console.error("Error al obtener datos del administrador:", error);
    }
  };
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: "",
      password: "",
    };

    // Validar nombre
    if (!newSubaccount.name.trim()) {
      newErrors.name = "El nombre es requerido";
      isValid = false;
    } else if (newSubaccount.name.trim().length < 3) {
      newErrors.name = "El nombre debe tener al menos 3 caracteres";
      isValid = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newSubaccount.email) {
      newErrors.email = "El email es requerido";
      isValid = false;
    } else if (!emailRegex.test(newSubaccount.email)) {
      newErrors.email = "Email inválido";
      isValid = false;
    }

    // Validar contraseña
    if (!newSubaccount.password) {
      newErrors.password = "La contraseña es requerida";
      isValid = false;
    } else if (newSubaccount.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      isValid = false;
    }

    setFormErrors(newErrors);
    return isValid;
  };

  const fetchUsers = async (userId: string) => {
    setIsLoading(true);
    try {
      const db = getFirestore();
      const solicitudesRef = collection(db, "cuentas");
      const q = query(solicitudesRef, where("Empresa_id", "==", userId));
      const querySnapshot = await getDocs(q);
      const newSubaccounts: Subaccount[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const newSubaccountData = {
          name: data["Nombre"],
          email: data["email"],
          password: "",
          userId: doc.id,
          Empresa: data["Empresa"] || "",
        };

        newSubaccounts.push({
          ...newSubaccountData,
          id: newSubaccounts.length + 1,
        });
      });

      setSubaccounts(newSubaccounts);
    } catch (error: any) {
      toast.error("Error al cargar las subcuentas. Verifica tu conexión.", {
        icon: "🔄",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };
  const createSubaccount = async (newSubaccount: Omit<Subaccount, "id">) => {
    try {
      const response = await fetch("/api/createSubaccount", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSubaccount),
      });

      if (response.ok) {
        const data = await response.json();
        setSubaccounts([
          ...subaccounts,
          { ...newSubaccount, id: subaccounts.length + 1, userId: data.userId },
        ]);
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        console.error("Error al crear nuevo usuario:", errorData.error);
      }
    } catch (error) {
      console.error("Error al crear nuevo usuario:", error);
    }
  };

  const handleCreateSubaccount = async () => {
    if (!validateForm()) {
      toast.error("Por favor, completa todos los campos correctamente", {
        icon: "⚠️",
      });
      return;
    }

    setIsCreating(true);
    try {
      console.log("empresa name ", adminData.Empresa);
      await createSubaccount({
        ...newSubaccount,
        userId: user,
        Empresa: adminData.Empresa,
      });
      setNewSubaccount({
        name: "",
        email: "",
        password: "",
        userId: "",
        Empresa: "",
      });
      setFormErrors({ name: "", email: "", password: "" });
      toast.success("¡Subcuenta creada exitosamente!", {
        icon: "✅",
      });
    } catch (error: any) {
      toast.error("No se pudo crear la subcuenta. Intenta nuevamente.", {
        icon: "❌",
      });
    } finally {
      setIsCreating(false);
      setIsModalOpen(false);
    }
  };
  const handleDeleteSubaccount = async (id: number) => {
    try {
      const subaccount = subaccounts.find((acc) => acc.id === id);
      if (!subaccount) {
        toast.error("No se encontró la subcuenta", {
          icon: "❌",
        });
        return;
      }

      setSubaccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.id !== id)
      );
      toast.success("Subcuenta eliminada correctamente", {
        icon: "✅",
      });
      await fetchUsers(user);
    } catch (error: any) {
      toast.error("Error al eliminar la subcuenta. Intenta nuevamente.", {
        icon: "❌",
      });
      await fetchUsers(user);
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        toast.success("¡Hasta pronto! Sesión cerrada exitosamente", {
          icon: "👋",
        });
        router.push("/login");
      })
      .catch((error) => {
        toast.error("No se pudo cerrar sesión. Intenta nuevamente.", {
          icon: "❌",
        });
      });
  };
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleSignOut={handleSignOut}
      />

      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-8 py-6 flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">
              {activeTab === "subaccounts" && "Gestionar Subcuentas"}
              {activeTab === "settings" && "Configuración de Administrador"}
              {activeTab === "help" && "Centro de Ayuda"}
            </h1>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto relative">
          {activeTab === "subaccounts" && (
            <>
              <div className="space-y-6">
                <Card className="bg-white shadow-sm">
                  <CardBody className="p-4">
                    <Input
                      type="text"
                      placeholder="Buscar subcuentas..."
                      startContent={<Search className="text-gray-400" />}
                      className="w-full max-w-md"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </CardBody>
                </Card>

                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Spinner color="success" size="lg" />
                  </div>
                ) : (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredSubaccounts.map((subaccount) => (
                      <SubaccountCard
                        key={subaccount.id}
                        subaccount={subaccount}
                        onDelete={handleDeleteSubaccount}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Botón flotante para crear subcuenta */}
              <Button
                className="fixed bottom-8 right-8 shadow-lg hover:shadow-xl transition-shadow duration-200 px-6"
                color="success"
                onPress={() => setIsModalOpen(true)}
                startContent={<PlusCircle className="w-5 h-5" />}
                size="lg"
              >
                Crear Subcuenta
              </Button>
            </>
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
                      {adminData.Empresa || "Nombre de la Empresa"}
                    </h2>
                    <p className="text-gray-500">{userEmail}</p>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Datos de la Empresa */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      DATOS DE LA EMPRESA
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Nombre de la Empresa
                        </p>
                        <p className="text-gray-900">{adminData.Empresa}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">
                          Correo electrónico
                        </p>
                        <p className="text-gray-900">{adminData.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button color="primary">Modificar Información</Button>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === "help" && (
            <Card className="bg-white max-w-2xl mx-auto">
              <CardBody className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Centro de Ayuda para Administradores
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Gestión de Subcuentas
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          ¿Cómo crear una subcuenta?
                        </h4>
                        <p className="text-gray-600">
                          Para crear una subcuenta, ve a la sección de
                          "Subcuentas" y haz clic en el botón "Crear Subcuenta".
                          Completa el formulario con la información del
                          trabajador y guarda los cambios.
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">
                          ¿Cómo gestionar los permisos?
                        </h4>
                        <p className="text-gray-600">
                          Los trabajadores tendrán acceso al marketplace para
                          ver y hacer ofertas a las solicitudes de préstamo.
                          Como administrador, puedes crear y eliminar cuentas
                          según sea necesario.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Soporte Técnico
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-600 mb-2">
                        Si necesitas asistencia técnica, contáctanos:
                      </p>
                      <ul className="space-y-2 text-gray-600">
                        <li>Email: soporte@buscocredito.com</li>
                        <li>Teléfono: (55) 1234-5678</li>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Crear Subcuenta
          </ModalHeader>
          <ModalBody>
            <Input
              label="Nombre"
              placeholder="Ingrese nombre"
              value={newSubaccount.name}
              onChange={(e) =>
                setNewSubaccount({ ...newSubaccount, name: e.target.value })
              }
              isInvalid={!!formErrors.name}
              errorMessage={formErrors.name}
            />
            <Input
              label="Correo electrónico"
              placeholder="Ingrese correo electrónico"
              value={newSubaccount.email}
              onChange={(e) =>
                setNewSubaccount({ ...newSubaccount, email: e.target.value })
              }
              isInvalid={!!formErrors.email}
              errorMessage={formErrors.email}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingrese contraseña"
              value={newSubaccount.password}
              onChange={(e) =>
                setNewSubaccount({ ...newSubaccount, password: e.target.value })
              }
              isInvalid={!!formErrors.password}
              errorMessage={formErrors.password}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsModalOpen(false)}
              isDisabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              color="success"
              onPress={handleCreateSubaccount}
              isLoading={isCreating}
            >
              Crear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
