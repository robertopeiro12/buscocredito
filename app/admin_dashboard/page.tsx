//page.tsx admin_dashboard
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

export default function AdminDashboard() {
  const [subaccounts, setSubaccounts] = useState<Subaccount[]>([]);
  const [user, setUser] = useState("");
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
        fetchUsers(user.uid);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

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

  const handleCreateSubaccount = () => {
    createSubaccount({ ...newSubaccount, userId: user });
    setNewSubaccount({ name: "", email: "", password: "", userId: "" });
  };

  const handleDeleteSubaccount = async (id: number) => {
    try {
      const subaccount = subaccounts.find((acc) => acc.id === id);
      if (!subaccount) {
        console.error("Subcuenta no encontrada");
        return;
      }

      // Only update the UI after successful deletion
      setSubaccounts((prevAccounts) =>
        prevAccounts.filter((account) => account.id !== id)
      );

      // Optionally refetch the accounts to ensure UI is in sync with backend
      await fetchUsers(user);
    } catch (error) {
      console.error("Error al eliminar la subcuenta:", error);
      // Optionally revert the UI change if there was an error
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
            <Card className="bg-white shadow-sm">
              <CardBody className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  Configuración de Administrador
                </h2>
                <p className="text-gray-600">
                  El contenido de configuración del administrador va aquí.
                </p>
              </CardBody>
            </Card>
          )}

          {activeTab === "help" && (
            <Card className="bg-white shadow-sm">
              <CardBody className="p-6">
                <h2 className="text-xl font-semibold mb-4">Centro de Ayuda</h2>
                <p className="text-gray-600">
                  El contenido de ayuda para administradores va aquí.
                </p>
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
            >
              Cancelar
            </Button>
            <Button color="success" onPress={handleCreateSubaccount}>
              Crear
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
