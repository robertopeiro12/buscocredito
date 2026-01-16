"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase";
import { getFirestore, collection, onSnapshot, query } from "firebase/firestore";
import type {
  AccountInfo,
  SystemStats,
  SuperAdminDashboardState,
  AccountActionResult,
} from "@/types/superadmin";
import toast from "react-hot-toast";

interface DatabaseInfo {
  collections: { name: string; documentCount: number }[];
  totalDocuments: number;
}

interface ServerHealth {
  status: "healthy" | "degraded" | "down";
  uptime: number;
  lastChecked: string;
  nodeVersion?: string;
  platform?: string;
}

export function useSuperAdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // State
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null);
  const [serverHealth, setServerHealth] = useState<ServerHealth | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Real-time data state
  const [solicitudesData, setSolicitudesData] = useState<any[]>([]);
  const [propuestasCount, setPropuestasCount] = useState(0);
  
  // UI State
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "super_admin" | "b_admin" | "b_sale" | "user">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "disabled">("all");
  const [selectedAccount, setSelectedAccount] = useState<AccountInfo | null>(null);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "delete" | "deactivate" | "activate";
    account: AccountInfo;
  } | null>(null);

  // Authorization check
  useEffect(() => {
    const checkAuthorization = async () => {
      if (authLoading) return;

      if (!user) {
        router.push("/login");
        return;
      }

      if (user.type !== "super_admin") {
        router.push("/unauthorized");
        return;
      }

      setIsAuthorized(true);
      setIsCheckingAuth(false);
    };

    checkAuthorization();
  }, [user, authLoading, router]);

  // Get auth token
  const getAuthToken = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("Not authenticated");
    return currentUser.getIdToken();
  }, []);

  // Real-time listener for accounts (cuentas collection)
  useEffect(() => {
    if (!isAuthorized) return;

    const db = getFirestore();
    const accountsQuery = query(collection(db, "cuentas"));

    const unsubscribe = onSnapshot(
      accountsQuery,
      (snapshot) => {
        const accountsList: AccountInfo[] = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            uid: doc.id,
            email: data.email || null,
            name: data.Nombre || data.name || "Sin nombre",
            type: data.type || "user",
            Empresa: data.Empresa,
            Empresa_id: data.Empresa_id,
            createdAt: data.created_at?.toDate?.()?.toISOString() || data.createdAt,
            lastLoginAt: data.lastLoginAt,
            isActive: data.isActive !== false,
            disabled: data.isActive === false,
            phone: data.phone,
            address: data.address,
          };
        });
        
        setAccounts(accountsList);
        setIsLoading(false);
        console.log("📊 Accounts updated in real-time:", accountsList.length);
      },
      (err) => {
        console.error("Error listening to accounts:", err);
        setError("Error al cargar las cuentas en tiempo real");
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAuthorized]);

  // Real-time listener for solicitudes
  useEffect(() => {
    if (!isAuthorized) return;

    const db = getFirestore();
    const solicitudesQuery = query(collection(db, "solicitudes"));

    const unsubscribe = onSnapshot(
      solicitudesQuery,
      (snapshot) => {
        const solicitudes = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSolicitudesData(solicitudes);
        console.log("📊 Solicitudes updated in real-time:", solicitudes.length);
      },
      (err) => {
        console.error("Error listening to solicitudes:", err);
      }
    );

    return () => unsubscribe();
  }, [isAuthorized]);

  // Real-time listener for propuestas
  useEffect(() => {
    if (!isAuthorized) return;

    const db = getFirestore();
    const propuestasQuery = query(collection(db, "propuestas"));

    const unsubscribe = onSnapshot(
      propuestasQuery,
      (snapshot) => {
        setPropuestasCount(snapshot.size);
        console.log("📊 Propuestas updated in real-time:", snapshot.size);
      },
      (err) => {
        console.error("Error listening to propuestas:", err);
      }
    );

    return () => unsubscribe();
  }, [isAuthorized]);

  // Compute stats from real-time data
  const computedStats = useMemo((): SystemStats | null => {
    if (accounts.length === 0 && solicitudesData.length === 0) return stats;

    const pendingSolicitudes = solicitudesData.filter(
      (s) => s.status === "pending" || !s.status
    ).length;
    const approvedSolicitudes = solicitudesData.filter(
      (s) => s.status === "approved" || s.status === "accepted"
    ).length;
    const rejectedSolicitudes = solicitudesData.filter(
      (s) => s.status === "rejected"
    ).length;

    // Calculate recent signups (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentSignups = accounts.filter((acc) => {
      if (!acc.createdAt) return false;
      const createdDate = new Date(acc.createdAt);
      return createdDate >= sevenDaysAgo;
    }).length;

    // Calculate recent logins (last 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);
    const recentLogins = accounts.filter((acc) => {
      if (!acc.lastLoginAt) return false;
      const loginDate = new Date(acc.lastLoginAt);
      return loginDate >= oneDayAgo;
    }).length;

    return {
      totalAccounts: accounts.length,
      activeAccounts: accounts.filter((acc) => !acc.disabled).length,
      disabledAccounts: accounts.filter((acc) => acc.disabled).length,
      accountsByType: {
        super_admin: accounts.filter((acc) => acc.type === "super_admin").length,
        b_admin: accounts.filter((acc) => acc.type === "b_admin").length,
        b_sale: accounts.filter((acc) => acc.type === "b_sale").length,
        user: accounts.filter((acc) => acc.type === "user").length,
      },
      totalSolicitudes: solicitudesData.length,
      totalPropuestas: propuestasCount,
      pendingSolicitudes,
      approvedSolicitudes,
      rejectedSolicitudes,
      recentSignups,
      recentLogins,
    };
  }, [accounts, solicitudesData, propuestasCount, stats]);

  // Fetch accounts and stats (for initial load or manual refresh)
  const fetchAccountsAndStats = useCallback(async () => {
    if (!isAuthorized) return;

    setIsLoading(true);
    setError(null);

    try {
      const token = await getAuthToken();

      const response = await fetch("/api/superadmin/accounts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch accounts");
      }

      const data = await response.json();
      // API data will be overwritten by real-time listeners, but useful for initial disabled status
      setStats(data.stats);
    } catch (err: any) {
      console.error("Error fetching accounts:", err);
      setError(err.message);
      toast.error("Error al cargar los datos");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthorized, getAuthToken]);

  // Fetch system info
  const fetchSystemInfo = useCallback(async () => {
    if (!isAuthorized) return;

    try {
      const token = await getAuthToken();

      const response = await fetch("/api/superadmin/system", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch system info");
      }

      const data = await response.json();
      setDatabaseInfo(data.database);
      setServerHealth(data.server);
    } catch (err: any) {
      console.error("Error fetching system info:", err);
    }
  }, [isAuthorized, getAuthToken]);

  // Deactivate account
  const deactivateAccount = useCallback(
    async (uid: string): Promise<AccountActionResult> => {
      try {
        const token = await getAuthToken();

        const response = await fetch(`/api/superadmin/accounts/${uid}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "deactivate" }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to deactivate account");
        }

        toast.success("Cuenta desactivada exitosamente");
        // Real-time listener will update the data automatically
        return { success: true, message: data.message };
      } catch (err: any) {
        toast.error(err.message || "Error al desactivar la cuenta");
        return { success: false, message: "", error: err.message };
      }
    },
    [getAuthToken]
  );

  // Activate account
  const activateAccount = useCallback(
    async (uid: string): Promise<AccountActionResult> => {
      try {
        const token = await getAuthToken();

        const response = await fetch(`/api/superadmin/accounts/${uid}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ action: "activate" }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to activate account");
        }

        toast.success("Cuenta activada exitosamente");
        // Real-time listener will update the data automatically
        return { success: true, message: data.message };
      } catch (err: any) {
        toast.error(err.message || "Error al activar la cuenta");
        return { success: false, message: "", error: err.message };
      }
    },
    [getAuthToken]
  );

  // Delete account
  const deleteAccount = useCallback(
    async (uid: string): Promise<AccountActionResult> => {
      try {
        const token = await getAuthToken();

        const response = await fetch(`/api/superadmin/accounts/${uid}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to delete account");
        }

        toast.success("Cuenta eliminada exitosamente");
        // Real-time listener will update the data automatically
        return { success: true, message: data.message };
      } catch (err: any) {
        toast.error(err.message || "Error al eliminar la cuenta");
        return { success: false, message: "", error: err.message };
      }
    },
    [getAuthToken]
  );

  // Filtered accounts
  const filteredAccounts = useMemo(() => {
    return accounts.filter((account) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        account.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.Empresa?.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType = filterType === "all" || account.type === filterType;

      // Status filter
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && !account.disabled) ||
        (filterStatus === "disabled" && account.disabled);

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [accounts, searchTerm, filterType, filterStatus]);

  // Handle confirm action
  const handleConfirmAction = useCallback(async () => {
    if (!confirmAction) return;

    const { type, account } = confirmAction;

    if (type === "delete") {
      await deleteAccount(account.uid);
    } else if (type === "deactivate") {
      await deactivateAccount(account.uid);
    } else if (type === "activate") {
      await activateAccount(account.uid);
    }

    setIsConfirmModalOpen(false);
    setConfirmAction(null);
  }, [confirmAction, deleteAccount, deactivateAccount, activateAccount]);

  // Initial data fetch
  useEffect(() => {
    if (isAuthorized) {
      fetchAccountsAndStats();
      fetchSystemInfo();
    }
  }, [isAuthorized, fetchAccountsAndStats, fetchSystemInfo]);

  // Sign out handler
  const handleSignOut = useCallback(async () => {
    try {
      const { signOut } = await import("firebase/auth");
      await signOut(auth);
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "user-type=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error al cerrar sesión");
    }
  }, [router]);

  return {
    // Auth states
    isAuthorized,
    isCheckingAuth,
    userEmail: user?.email,

    // Data
    accounts,
    filteredAccounts,
    stats: computedStats,
    databaseInfo,
    serverHealth,

    // Loading states
    isLoading,
    error,

    // UI state
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    filterStatus,
    setFilterStatus,
    selectedAccount,
    setSelectedAccount,
    isAccountModalOpen,
    setIsAccountModalOpen,
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    confirmAction,
    setConfirmAction,

    // Actions
    fetchAccountsAndStats,
    fetchSystemInfo,
    deactivateAccount,
    activateAccount,
    deleteAccount,
    handleConfirmAction,
    handleSignOut,
  };
}
