import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { auth } from "@/app/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useAdminGuard } from "./useRoleGuard";
import { useAdminMetrics } from "./useAdminMetrics";
import {
  getFirestore,
  getDoc,
  doc,
} from "firebase/firestore";

// Types
export type Subaccount = {
  id: number;
  name: string;
  email: string;
  password: string;
  userId: string;
  Empresa: string;
};

export type AdminData = {
  Empresa: string;
  email: string;
};

export type FormErrors = {
  name: string;
  email: string;
  password: string;
};

export function useAdminDashboard() {
  const router = useRouter();
  const { isAuthorized, isLoading: isCheckingAuth } = useAdminGuard();

  // Authentication states
  const [user, setUser] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [adminData, setAdminData] = useState<AdminData>({
    Empresa: "",
    email: "",
  });

  // UI states
  const [activeTab, setActiveTab] = useState("subaccounts");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Subaccounts states
  const [subaccounts, setSubaccounts] = useState<Subaccount[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newSubaccount, setNewSubaccount] = useState<Omit<Subaccount, "id">>({
    name: "",
    email: "",
    password: "",
    userId: "",
    Empresa: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: "",
    email: "",
    password: "",
  });

  // Metrics states
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
  });

  // Hook de métricas
  const { 
    metricsData, 
    isLoadingMetrics, 
    getMonthName, 
    getTopDistributionItems, 
    calculatePercentage 
  } = useAdminMetrics({
    user,
    activeTab,
    selectedTimeRange,
    customDateRange,
  });

  // Computed values
  const filteredSubaccounts = subaccounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Authentication effect
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.uid);
        setUserEmail(user.email || "");
        fetchUsers(user.uid);
        fetchAdminData(user.uid);
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  // Fetch admin data
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
      }
    } catch (error) {
      console.error("Error al obtener datos del administrador:", error);
    }
  };

  // Fetch users function
  const fetchUsers = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/getSubcuentas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const newSubaccounts: Subaccount[] = data.subcuentas.map((sub: any, index: number) => ({
        id: index + 1,
        name: sub.name,
        email: sub.email,
        password: "",
        userId: sub.userId,
        Empresa: sub.Empresa,
      }));

      setSubaccounts(newSubaccounts);
    } catch (error: any) {
      console.error('fetchUsers: Error occurred:', error);
      toast.error("Error al cargar las subcuentas. Verifica tu conexión.", {
        icon: "🔄",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    let isValid = true;
    const newErrors: FormErrors = {
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

  // Create subaccount
  const createSubaccount = async (newSubaccount: Omit<Subaccount, "id">) => {
    try {
      const response = await fetch("/api/users/subaccounts", {
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

  // Handle create subaccount
  const handleCreateSubaccount = async () => {
    if (!validateForm()) {
      toast.error("Por favor, completa todos los campos correctamente", {
        icon: "⚠️",
      });
      return;
    }

    setIsCreating(true);
    try {
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

  // Handle delete subaccount
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

  // Handle sign out
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

  // Date range handlers
  const handleOpenDateRangeModal = () => {
    setSelectedTimeRange("custom");
    setIsDateRangeModalOpen(true);
  };

  const handleDateRangeConfirm = () => {
    if (customDateRange.startDate > customDateRange.endDate) {
      toast.error("La fecha de inicio debe ser anterior a la fecha de fin", {
        icon: "⚠️",
        duration: 3000,
      });
      return;
    }
    setIsDateRangeModalOpen(false);
  };

  // Utility functions
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("es-MX", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  return {
    // Auth states
    isAuthorized,
    isCheckingAuth,
    user,
    userEmail,
    adminData,

    // UI states
    activeTab,
    setActiveTab,
    isModalOpen,
    setIsModalOpen,
    isLoading,
    isCreating,

    // Subaccounts states
    subaccounts,
    filteredSubaccounts,
    searchTerm,
    setSearchTerm,
    newSubaccount,
    setNewSubaccount,
    formErrors,

    // Metrics states
    selectedTimeRange,
    setSelectedTimeRange,
    isDateRangeModalOpen,
    setIsDateRangeModalOpen,
    customDateRange,
    setCustomDateRange,

    // Metrics data from useAdminMetrics
    metricsData,
    isLoadingMetrics,
    getMonthName,
    getTopDistributionItems,
    calculatePercentage,

    // Action handlers
    handleCreateSubaccount,
    handleDeleteSubaccount,
    handleSignOut,
    handleOpenDateRangeModal,
    handleDateRangeConfirm,

    // Utility functions
    formatDate,
  };
}
