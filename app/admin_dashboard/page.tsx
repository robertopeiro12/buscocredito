"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
};

type AdminData = {
  company_name: string;
  email: string;
};

export default function AdminDashboard() {
  const [subaccounts, setSubaccounts] = useState<Subaccount[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [user, setUser] = useState("");
  const [adminData, setAdminData] = useState<AdminData>({
    company_name: "",
    email: "",
  });
  const [newSubaccount, setNewSubaccount] = useState<Omit<Subaccount, "id">>({
    name: "",
    email: "",
    password: "",
    userId: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("subaccounts");
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
      const adminDoc = await getDoc(doc(db, "empresas", userId));
      if (adminDoc.exists()) {
        const data = adminDoc.data();
        setAdminData({
          company_name: data.company_name || "",
          email: data.email || "",
        });
      }
    } catch (error) {
      console.error("Error al obtener datos del administrador:", error);
    }
  };

  const fetchUsers = async (userId: string) => {
    setIsLoading(true);
    const db = getFirestore();
    const solicitudesRef = collection(db, "cuentas");
    const q = query(solicitudesRef, where("Empresa_id", "==", userId));

    try {
      const querySnapshot = await getDocs(q);
      const newSubaccounts: Subaccount[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const newSubaccountData = {
          name: data["Nombre"],
          email: data["email"],
          password: "",
          userId: doc.id,
        };

        newSubaccounts.push({
          ...newSubaccountData,
          id: newSubaccounts.length + 1,
        });
      });

      setSubaccounts(newSubaccounts);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
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
    setIsCreating(true); // Iniciamos el loading
    try {
      await createSubaccount({ ...newSubaccount, userId: user });
      setNewSubaccount({ name: "", email: "", password: "", userId: "" });
    } catch (error) {
      console.error("Error al crear subcuenta:", error);
    } finally {
      setIsCreating(false); // Terminamos el loading
      setIsModalOpen(false);
    }
  };

  const handleDeleteSubaccount = async (id: number) => {
    try {
      const subaccount = subaccounts.find((acc) => acc.id === id);
      if (!subaccount) {
        console.error("Subcuenta no encontrada");
        return;
      }

      setSubaccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.id !== id)
      );

      await fetchUsers(user);
    } catch (error) {
      console.error("Error al eliminar la subcuenta:", error);
      await fetchUsers(user);
    }
  };

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        router.push("/login");
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error);
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
            <div className="flex items-center space-x-4">
              {activeTab === "subaccounts" && (
                <Button
                  color="success"
                  endContent={<PlusCircle className="w-4 h-4" />}
                  onPress={() => setIsModalOpen(true)}
                >
                  Crear Subcuenta
                </Button>
              )}
              <Button
                isIconOnly
                color="default"
                variant="light"
                aria-label="User profile"
              >
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          {activeTab === "subaccounts" && (
            <div className="space-y-6">
              <Card className="bg-white shadow-sm">
                <CardBody className="p-4">
                  <Input
                    type="text"
                    placeholder="Buscar subcuentas..."
                    startContent={<Search className="text-gray-400" />}
                    className="w-full max-w-md"
                  />
                </CardBody>
              </Card>

              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner color="success" size="lg" />
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {subaccounts.map((subaccount) => (
                    <SubaccountCard
                      key={subaccount.id}
                      subaccount={subaccount}
                      onDelete={handleDeleteSubaccount}
                    />
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
                      {adminData.company_name || "Nombre de la Empresa"}
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
                        <p className="text-gray-900">
                          {adminData.company_name}
                        </p>
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
            />
            <Input
              label="Correo electrónico"
              placeholder="Ingrese correo electrónico"
              value={newSubaccount.email}
              onChange={(e) =>
                setNewSubaccount({ ...newSubaccount, email: e.target.value })
              }
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Ingrese contraseña"
              value={newSubaccount.password}
              onChange={(e) =>
                setNewSubaccount({ ...newSubaccount, password: e.target.value })
              }
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
