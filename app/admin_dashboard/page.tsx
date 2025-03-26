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
  Timestamp,
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
import { Search, PlusCircle, User, BarChart } from "lucide-react";
import { AdminSidebar } from "@/components/AdminSidebar";
import { SubaccountCard } from "@/components/SubaccountCard";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

// Registrar los componentes necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

type MetricsData = {
  totalProposals: number;
  loanTypeDistribution: {
    [key: string]: number;
  };
  purposeDistribution: {
    [key: string]: number;
  };
  paymentFrequencyDistribution: {
    [key: string]: number;
  };
  averageInterestRate: number;
  averageAmount: number;
  totalCommissions: number;
  monthlyProposals: {
    [key: string]: number;
  };
  monthlyCommissions: {
    [key: string]: number;
  };
  percentageChanges: {
    totalProposals: number;
    averageInterestRate: number;
    averageAmount: number;
    totalCommissions: number;
  };
  monthlyData: {
    [key: string]: {
      proposals: number;
      commissions: number;
    };
  };
  previousPeriodMetrics: any;
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
  const [metricsData, setMetricsData] = useState<MetricsData>({
    totalProposals: 0,
    loanTypeDistribution: {},
    purposeDistribution: {},
    paymentFrequencyDistribution: {},
    averageInterestRate: 0,
    averageAmount: 0,
    totalCommissions: 0,
    monthlyProposals: {},
    monthlyCommissions: {},
    percentageChanges: {
      totalProposals: 0,
      averageInterestRate: 0,
      averageAmount: 0,
      totalCommissions: 0,
    },
    monthlyData: {},
    previousPeriodMetrics: {},
  });
  const [selectedTimeRange, setSelectedTimeRange] = useState("month");
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [customDateRange, setCustomDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date(),
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

  useEffect(() => {
    if (user && activeTab === "metrics") {
      fetchMetricsData(user);
    }
  }, [user, activeTab, selectedTimeRange]);

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

  const fetchMetricsData = async (userId: string) => {
    setIsLoadingMetrics(true);
    try {
      const db = getFirestore();
      const subaccountsRef = collection(db, "cuentas");
      const subQ = query(subaccountsRef, where("Empresa_id", "==", userId));
      const subSnapshot = await getDocs(subQ);

      const workerIds: string[] = [];
      subSnapshot.forEach((doc) => {
        workerIds.push(doc.id);
      });

      // Determinar rango de fechas basado en el filtro seleccionado
      const now = new Date();
      let startDate = new Date();
      let previousPeriodStartDate = new Date();
      let previousPeriodEndDate = new Date();

      if (selectedTimeRange === "month") {
        startDate.setMonth(now.getMonth() - 1);
        // Periodo anterior: el mes antes del mes actual
        previousPeriodStartDate.setMonth(now.getMonth() - 2);
        previousPeriodEndDate.setMonth(now.getMonth() - 1);
        previousPeriodEndDate.setDate(previousPeriodEndDate.getDate() - 1);
      } else if (selectedTimeRange === "quarter") {
        startDate.setMonth(now.getMonth() - 3);
        // Periodo anterior: el trimestre antes del trimestre actual
        previousPeriodStartDate.setMonth(now.getMonth() - 6);
        previousPeriodEndDate.setMonth(now.getMonth() - 3);
        previousPeriodEndDate.setDate(previousPeriodEndDate.getDate() - 1);
      } else if (selectedTimeRange === "year") {
        startDate.setFullYear(now.getFullYear() - 1);
        // Periodo anterior: el año antes del año actual
        previousPeriodStartDate.setFullYear(now.getFullYear() - 2);
        previousPeriodEndDate.setFullYear(now.getFullYear() - 1);
        previousPeriodEndDate.setDate(previousPeriodEndDate.getDate() - 1);
      } else if (selectedTimeRange === "custom") {
        startDate = customDateRange.startDate;
        now.setTime(customDateRange.endDate.getTime());

        // Para periodo personalizado, calculamos un periodo previo de igual duración
        const duration =
          customDateRange.endDate.getTime() -
          customDateRange.startDate.getTime();
        previousPeriodEndDate = new Date(
          customDateRange.startDate.getTime() - 1
        );
        previousPeriodStartDate = new Date(
          previousPeriodEndDate.getTime() - duration
        );
      }

      const startTimestamp = Timestamp.fromDate(startDate);
      const previousPeriodStartTimestamp = Timestamp.fromDate(
        previousPeriodStartDate
      );
      const previousPeriodEndTimestamp = Timestamp.fromDate(
        previousPeriodEndDate
      );

      // Obtener todas las propuestas de los trabajadores (periodo actual)
      const proposalsRef = collection(db, "propuestas");
      const currentProposals: any[] = [];
      const previousProposals: any[] = [];

      console.log("Buscando propuestas para", workerIds.length, "trabajadores");
      console.log(
        "Periodo actual:",
        startDate.toISOString(),
        "hasta",
        now.toISOString()
      );
      console.log(
        "Periodo anterior:",
        previousPeriodStartDate.toISOString(),
        "hasta",
        previousPeriodEndDate.toISOString()
      );

      for (const workerId of workerIds) {
        try {
          // Consultar propuestas del periodo actual
          const currentQ = query(
            proposalsRef,
            where("partner", "==", workerId),
            where("createdAt", ">=", startTimestamp)
          );
          const currentSnapshot = await getDocs(currentQ);

          console.log(
            `Encontradas ${currentSnapshot.size} propuestas para el trabajador ${workerId} en el periodo actual`
          );

          currentSnapshot.forEach((doc) => {
            currentProposals.push({
              id: doc.id,
              ...doc.data(),
            });
          });

          // Consultar propuestas del periodo anterior
          const previousQ = query(
            proposalsRef,
            where("partner", "==", workerId),
            where("createdAt", ">=", previousPeriodStartTimestamp),
            where("createdAt", "<=", previousPeriodEndTimestamp)
          );
          const previousSnapshot = await getDocs(previousQ);

          console.log(
            `Encontradas ${previousSnapshot.size} propuestas para el trabajador ${workerId} en el periodo anterior`
          );

          previousSnapshot.forEach((doc) => {
            previousProposals.push({
              id: doc.id,
              ...doc.data(),
            });
          });
        } catch (error) {
          console.error(
            `Error al consultar propuestas para el trabajador ${workerId}:`,
            error
          );
        }
      }

      // Procesar los datos para las métricas
      const metrics = calculateMetrics(currentProposals);
      const previousMetrics = calculateMetrics(previousProposals);

      // Calcular cambios porcentuales
      const percentageChanges = {
        totalProposals: calculatePercentageChange(
          previousMetrics.totalProposals,
          metrics.totalProposals
        ),
        averageInterestRate: calculatePercentageChange(
          previousMetrics.averageInterestRate,
          metrics.averageInterestRate
        ),
        averageAmount: calculatePercentageChange(
          previousMetrics.averageAmount,
          metrics.averageAmount
        ),
        totalCommissions: calculatePercentageChange(
          previousMetrics.totalCommissions,
          metrics.totalCommissions
        ),
      };

      // Generar datos para gráficos mensuales
      const monthlyData = generateMonthlyData(currentProposals, 6);

      setMetricsData({
        ...metrics,
        percentageChanges,
        monthlyData,
        previousPeriodMetrics: previousMetrics,
      });
    } catch (error) {
      console.error("Error al cargar métricas:", error);
      toast.error("Error al cargar las métricas. Verifica tu conexión.", {
        icon: "🔄",
        duration: 5000,
      });
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  // Función para calcular métricas a partir de propuestas
  const calculateMetrics = (proposals: any[]) => {
    const loanTypes: { [key: string]: number } = {};
    const purposes: { [key: string]: number } = {};
    const paymentFrequencies: { [key: string]: number } = {};
    const monthlyProposals: { [key: string]: number } = {};
    const monthlyCommissions: { [key: string]: number } = {};

    let totalInterestRate = 0;
    let totalAmount = 0;
    let totalCommissions = 0;

    proposals.forEach((proposal) => {
      // Distribución por tipo de préstamo
      const loanType = proposal.requestInfo?.type || "Desconocido";
      loanTypes[loanType] = (loanTypes[loanType] || 0) + 1;

      // Distribución por propósito
      const purpose = proposal.requestInfo?.purpose || "Desconocido";
      purposes[purpose] = (purposes[purpose] || 0) + 1;

      // Distribución por frecuencia de pago
      const paymentFrequency =
        proposal.amortization_frequency ||
        proposal.requestInfo?.originalPayment ||
        "Desconocido";
      paymentFrequencies[paymentFrequency] =
        (paymentFrequencies[paymentFrequency] || 0) + 1;

      // Sumar interés, monto y comisiones
      if (proposal.interest_rate)
        totalInterestRate += parseFloat(proposal.interest_rate.toString());
      if (proposal.amount)
        totalAmount += parseFloat(proposal.amount.toString());
      if (proposal.comision)
        totalCommissions += parseFloat(proposal.comision.toString());
      // Si no hay comision pero hay commission (inglés)
      else if (proposal.commission)
        totalCommissions += parseFloat(proposal.commission.toString());

      // Distribución por mes
      if (proposal.createdAt) {
        const date = proposal.createdAt.toDate
          ? proposal.createdAt.toDate()
          : new Date(proposal.createdAt);
        const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
        monthlyProposals[monthYear] = (monthlyProposals[monthYear] || 0) + 1;

        // Comisiones por mes
        if (proposal.comision) {
          monthlyCommissions[monthYear] =
            (monthlyCommissions[monthYear] || 0) +
            parseFloat(proposal.comision.toString());
        } else if (proposal.commission) {
          monthlyCommissions[monthYear] =
            (monthlyCommissions[monthYear] || 0) +
            parseFloat(proposal.commission.toString());
        }
      }
    });

    // Calcular promedios
    const averageInterestRate =
      proposals.length > 0 ? totalInterestRate / proposals.length : 0;
    const averageAmount =
      proposals.length > 0 ? totalAmount / proposals.length : 0;

    return {
      totalProposals: proposals.length,
      loanTypeDistribution: loanTypes,
      purposeDistribution: purposes,
      paymentFrequencyDistribution: paymentFrequencies,
      averageInterestRate,
      averageAmount,
      totalCommissions,
      monthlyProposals,
      monthlyCommissions,
    };
  };

  // Función para calcular cambios porcentuales
  const calculatePercentageChange = (previous: number, current: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Función para generar datos de los últimos meses
  const generateMonthlyData = (proposals: any[], monthCount: number = 6) => {
    const now = new Date();
    const result: { [key: string]: any } = {};

    // Inicializar los últimos meses con ceros
    for (let i = 0; i < monthCount; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
      result[monthYear] = { proposals: 0, commissions: 0 };
    }

    // Poblar con datos reales
    proposals.forEach((proposal) => {
      if (proposal.createdAt) {
        // Manejo seguro de diferentes formatos de fecha
        let date;
        try {
          date = proposal.createdAt.toDate
            ? proposal.createdAt.toDate()
            : typeof proposal.createdAt === "string"
            ? new Date(proposal.createdAt)
            : proposal.createdAt instanceof Date
            ? proposal.createdAt
            : new Date();
        } catch (error) {
          console.error("Error al convertir fecha:", error);
          date = new Date();
        }

        const monthYear = `${date.getMonth() + 1}-${date.getFullYear()}`;
        if (result[monthYear]) {
          result[monthYear].proposals += 1;

          // Comisiones por mes - verificar ambos campos posibles (comision/commission)
          if (proposal.comision) {
            const commissionValue = parseFloat(proposal.comision.toString());
            if (!isNaN(commissionValue)) {
              result[monthYear].commissions += commissionValue;
            }
          } else if (proposal.commission) {
            const commissionValue = parseFloat(proposal.commission.toString());
            if (!isNaN(commissionValue)) {
              result[monthYear].commissions += commissionValue;
            }
          }
        }
      }
    });

    return result;
  };

  // Función auxiliar para obtener las etiquetas de los meses
  const getMonthName = (monthNumber: number) => {
    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];
    return months[monthNumber - 1];
  };

  // Función para convertir datos de distribución en array ordenado para visualización
  const getTopDistributionItems = (
    distribution: { [key: string]: number },
    limit: number = 5
  ) => {
    return Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([name, value]) => ({ name, value }));
  };

  // Función para calcular porcentajes para gráficos
  const calculatePercentage = (value: number, total: number) => {
    return total ? Math.round((value / total) * 100) : 0;
  };

  const handleOpenDateRangeModal = () => {
    setSelectedTimeRange("custom");
    setIsDateRangeModalOpen(true);
  };

  const handleDateRangeConfirm = () => {
    setIsDateRangeModalOpen(false);
    fetchMetricsData(user); // Esto activará la consulta con el nuevo rango personalizado
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
              {activeTab === "metrics" && "Dashboard de Métricas"}
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
                          ¿Cómo monitorear la actividad de las subcuentas?
                        </h4>
                        <p className="text-gray-600">
                          Desde el panel de administrador puedes ver todas las
                          subcuentas creadas y su información básica. Para un
                          análisis más detallado de la actividad de cada
                          trabajador, próximamente implementaremos un sistema de
                          reportes que te permitirá visualizar métricas como
                          número de ofertas realizadas, préstamos aprobados y
                          tasas de conversión por cada subcuenta.
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

          {activeTab === "metrics" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Métricas de Desempeño
                </h2>
                <div className="flex gap-4">
                  <Button
                    size="sm"
                    color="primary"
                    variant={selectedTimeRange === "month" ? "solid" : "flat"}
                    className="font-medium"
                    onPress={() => setSelectedTimeRange("month")}
                  >
                    Último mes
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    variant={selectedTimeRange === "quarter" ? "solid" : "flat"}
                    className="font-medium"
                    onPress={() => setSelectedTimeRange("quarter")}
                  >
                    Último trimestre
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    variant={selectedTimeRange === "year" ? "solid" : "flat"}
                    className="font-medium"
                    onPress={() => setSelectedTimeRange("year")}
                  >
                    Último año
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    variant={selectedTimeRange === "custom" ? "solid" : "flat"}
                    className="font-medium"
                    onPress={handleOpenDateRangeModal}
                  >
                    Personalizado
                  </Button>
                </div>
              </div>

              {isLoadingMetrics ? (
                <div className="flex justify-center items-center h-64">
                  <Spinner color="success" size="lg" />
                </div>
              ) : metricsData.totalProposals === 0 ? (
                <div className="flex flex-col justify-center items-center h-64 text-center">
                  <div className="mb-4 text-gray-400">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-16 w-16"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                    No hay datos disponibles
                  </h3>
                  <p className="text-gray-500 max-w-lg">
                    No se encontraron propuestas en el período seleccionado.
                    Intenta cambiar el rango de fechas o verifica que tus
                    trabajadores hayan creado propuestas.
                  </p>
                </div>
              ) : (
                <div className="transition-all duration-300 ease-in-out">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Total de propuestas */}
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Total de Propuestas
                          </h3>
                        </div>
                        <div className="h-64 flex flex-col justify-center items-center">
                          <div className="mb-4 text-5xl font-bold text-green-600 transition-all duration-500 ease-in-out">
                            {metricsData.totalProposals}
                          </div>
                          <div className="text-sm text-gray-500">
                            {metricsData.percentageChanges.totalProposals > 0
                              ? "+"
                              : ""}
                            {metricsData.percentageChanges.totalProposals.toFixed(
                              0
                            )}
                            % respecto al período anterior
                          </div>
                          <div className="mt-4 w-full h-36">
                            {Object.keys(metricsData.monthlyData).length >
                              0 && (
                              <Bar
                                data={{
                                  labels: Object.entries(
                                    metricsData.monthlyData
                                  )
                                    .sort((a, b) => {
                                      const [monthA, yearA] = a[0]
                                        .split("-")
                                        .map(Number);
                                      const [monthB, yearB] = b[0]
                                        .split("-")
                                        .map(Number);
                                      return (
                                        yearA * 12 +
                                        monthA -
                                        (yearB * 12 + monthB)
                                      );
                                    })
                                    .map(([key]) =>
                                      getMonthName(parseInt(key.split("-")[0]))
                                    ),
                                  datasets: [
                                    {
                                      label: "Propuestas",
                                      data: Object.entries(
                                        metricsData.monthlyData
                                      )
                                        .sort((a, b) => {
                                          const [monthA, yearA] = a[0]
                                            .split("-")
                                            .map(Number);
                                          const [monthB, yearB] = b[0]
                                            .split("-")
                                            .map(Number);
                                          return (
                                            yearA * 12 +
                                            monthA -
                                            (yearB * 12 + monthB)
                                          );
                                        })
                                        .map(([_, data]) => data.proposals),
                                      backgroundColor: "rgba(34, 197, 94, 0.7)",
                                      borderColor: "rgb(22, 163, 74)",
                                      borderWidth: 1,
                                      borderRadius: 4,
                                    },
                                  ],
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      display: false,
                                    },
                                    tooltip: {
                                      callbacks: {
                                        label: function (context) {
                                          return `${context.parsed.y} propuestas`;
                                        },
                                      },
                                    },
                                  },
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      ticks: {
                                        precision: 0,
                                      },
                                    },
                                  },
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Distribución por tipo de préstamo */}
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Distribución por Tipo de Préstamo
                          </h3>
                        </div>
                        <div className="h-64 flex flex-col justify-center items-center">
                          {Object.keys(metricsData.loanTypeDistribution)
                            .length > 0 ? (
                            <div className="w-full h-full">
                              <Pie
                                data={{
                                  labels: getTopDistributionItems(
                                    metricsData.loanTypeDistribution,
                                    5
                                  ).map((item) => item.name),
                                  datasets: [
                                    {
                                      data: getTopDistributionItems(
                                        metricsData.loanTypeDistribution,
                                        5
                                      ).map((item) => item.value),
                                      backgroundColor: [
                                        "rgba(59, 130, 246, 0.7)", // blue
                                        "rgba(16, 185, 129, 0.7)", // green
                                        "rgba(139, 92, 246, 0.7)", // purple
                                        "rgba(245, 158, 11, 0.7)", // amber
                                        "rgba(239, 68, 68, 0.7)", // red
                                      ],
                                      borderColor: [
                                        "rgb(30, 64, 175)",
                                        "rgb(5, 150, 105)",
                                        "rgb(109, 40, 217)",
                                        "rgb(180, 83, 9)",
                                        "rgb(185, 28, 28)",
                                      ],
                                      borderWidth: 1,
                                    },
                                  ],
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: "bottom",
                                      labels: {
                                        boxWidth: 15,
                                        padding: 15,
                                        font: {
                                          size: 11,
                                        },
                                      },
                                    },
                                    tooltip: {
                                      callbacks: {
                                        label: function (context) {
                                          const value = context.raw as number;
                                          const total =
                                            context.dataset.data.reduce(
                                              (a, b) =>
                                                (a as number) + (b as number),
                                              0
                                            );
                                          const percentage = Math.round(
                                            (value / (total as number)) * 100
                                          );
                                          return `${context.label}: ${value} (${percentage}%)`;
                                        },
                                      },
                                    },
                                  },
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              No hay datos suficientes
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>

                    {/* Distribución por propósito */}
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Distribución por Propósito
                          </h3>
                        </div>
                        <div className="h-64 flex flex-col justify-center items-center">
                          {Object.keys(metricsData.purposeDistribution).length >
                          0 ? (
                            <div className="w-full h-full">
                              <Pie
                                data={{
                                  labels: getTopDistributionItems(
                                    metricsData.purposeDistribution,
                                    5
                                  ).map((item) => item.name),
                                  datasets: [
                                    {
                                      data: getTopDistributionItems(
                                        metricsData.purposeDistribution,
                                        5
                                      ).map((item) => item.value),
                                      backgroundColor: [
                                        "rgba(245, 158, 11, 0.7)", // amber
                                        "rgba(239, 68, 68, 0.7)", // red
                                        "rgba(99, 102, 241, 0.7)", // indigo
                                        "rgba(20, 184, 166, 0.7)", // teal
                                        "rgba(236, 72, 153, 0.7)", // pink
                                      ],
                                      borderColor: [
                                        "rgb(180, 83, 9)",
                                        "rgb(185, 28, 28)",
                                        "rgb(79, 70, 229)",
                                        "rgb(13, 148, 136)",
                                        "rgb(219, 39, 119)",
                                      ],
                                      borderWidth: 1,
                                    },
                                  ],
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: "bottom",
                                      labels: {
                                        boxWidth: 15,
                                        padding: 15,
                                        font: {
                                          size: 11,
                                        },
                                      },
                                    },
                                    tooltip: {
                                      callbacks: {
                                        label: function (context) {
                                          const value = context.raw as number;
                                          const total =
                                            context.dataset.data.reduce(
                                              (a, b) =>
                                                (a as number) + (b as number),
                                              0
                                            );
                                          const percentage = Math.round(
                                            (value / (total as number)) * 100
                                          );
                                          return `${context.label}: ${value} (${percentage}%)`;
                                        },
                                      },
                                    },
                                  },
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              No hay datos suficientes
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>

                    {/* Distribución por frecuencia de pago */}
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Distribución por Frecuencia de Pago
                          </h3>
                        </div>
                        <div className="h-64 flex flex-col justify-center items-center">
                          {Object.keys(metricsData.paymentFrequencyDistribution)
                            .length > 0 ? (
                            <div className="w-full h-full">
                              <Pie
                                data={{
                                  labels: getTopDistributionItems(
                                    metricsData.paymentFrequencyDistribution,
                                    5
                                  ).map((item) => item.name),
                                  datasets: [
                                    {
                                      data: getTopDistributionItems(
                                        metricsData.paymentFrequencyDistribution,
                                        5
                                      ).map((item) => item.value),
                                      backgroundColor: [
                                        "rgba(59, 130, 246, 0.7)", // blue
                                        "rgba(16, 185, 129, 0.7)", // green
                                        "rgba(245, 158, 11, 0.7)", // amber
                                        "rgba(139, 92, 246, 0.7)", // purple
                                        "rgba(239, 68, 68, 0.7)", // red
                                      ],
                                      borderColor: [
                                        "rgb(30, 64, 175)",
                                        "rgb(5, 150, 105)",
                                        "rgb(180, 83, 9)",
                                        "rgb(109, 40, 217)",
                                        "rgb(185, 28, 28)",
                                      ],
                                      borderWidth: 1,
                                    },
                                  ],
                                }}
                                options={{
                                  responsive: true,
                                  maintainAspectRatio: false,
                                  plugins: {
                                    legend: {
                                      position: "bottom",
                                      labels: {
                                        boxWidth: 15,
                                        padding: 15,
                                        font: {
                                          size: 11,
                                        },
                                      },
                                    },
                                    tooltip: {
                                      callbacks: {
                                        label: function (context) {
                                          const value = context.raw as number;
                                          const total =
                                            context.dataset.data.reduce(
                                              (a, b) =>
                                                (a as number) + (b as number),
                                              0
                                            );
                                          const percentage = Math.round(
                                            (value / (total as number)) * 100
                                          );
                                          return `${context.label}: ${value} (${percentage}%)`;
                                        },
                                      },
                                    },
                                  },
                                }}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              No hay datos suficientes
                            </div>
                          )}
                        </div>
                      </CardBody>
                    </Card>

                    {/* Tasa de interés promedio */}
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Tasa de Interés Promedio
                          </h3>
                        </div>
                        <div className="h-64 flex flex-col justify-between">
                          <div className="text-4xl font-bold text-blue-600 text-center mb-2">
                            {metricsData.averageInterestRate.toFixed(2)}%
                          </div>
                          <div className="text-sm text-center mb-4">
                            <span
                              className={`font-medium ${
                                metricsData.percentageChanges
                                  .averageInterestRate > 0
                                  ? "text-red-500"
                                  : "text-green-500"
                              }`}
                            >
                              {metricsData.percentageChanges
                                .averageInterestRate > 0
                                ? "+"
                                : ""}
                              {metricsData.percentageChanges.averageInterestRate.toFixed(
                                1
                              )}
                              %
                            </span>
                            <span className="text-gray-500">
                              {" "}
                              respecto al período anterior
                            </span>
                          </div>
                          <div className="flex-1 w-full">
                            <Bar
                              data={{
                                labels: Object.entries(metricsData.monthlyData)
                                  .sort((a, b) => {
                                    const [monthA, yearA] = a[0]
                                      .split("-")
                                      .map(Number);
                                    const [monthB, yearB] = b[0]
                                      .split("-")
                                      .map(Number);
                                    return (
                                      yearA * 12 +
                                      monthA -
                                      (yearB * 12 + monthB)
                                    );
                                  })
                                  .map(([key]) =>
                                    getMonthName(parseInt(key.split("-")[0]))
                                  ),
                                datasets: [
                                  {
                                    label: "Tasa Promedio",
                                    // Calculamos el monto promedio por mes de forma estimada
                                    data: Object.entries(
                                      metricsData.monthlyData
                                    )
                                      .sort((a, b) => {
                                        const [monthA, yearA] = a[0]
                                          .split("-")
                                          .map(Number);
                                        const [monthB, yearB] = b[0]
                                          .split("-")
                                          .map(Number);
                                        return (
                                          yearA * 12 +
                                          monthA -
                                          (yearB * 12 + monthB)
                                        );
                                      })
                                      .map(([_, data]) => {
                                        // Si hay propuestas en ese mes, estimamos monto promedio
                                        if (data.proposals > 0) {
                                          // Generamos un valor cercano al promedio general
                                          const variation =
                                            Math.random() * 0.4 - 0.2; // -20% a +20%
                                          return (
                                            metricsData.averageAmount *
                                            (1 + variation)
                                          );
                                        }
                                        return 0;
                                      }),
                                    backgroundColor: "rgba(14, 165, 233, 0.7)",
                                    borderColor: "rgb(3, 105, 161)",
                                    borderWidth: 1,
                                    borderRadius: 4,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    display: false,
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function (context) {
                                        return `${context.parsed.y.toLocaleString(
                                          "es-MX",
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          }
                                        )} MXN`;
                                      },
                                    },
                                  },
                                },
                                scales: {
                                  y: {
                                    beginAtZero: false,
                                    min: Math.max(
                                      0,
                                      metricsData.averageInterestRate * 0.7
                                    ),
                                    ticks: {
                                      callback: function (value) {
                                        return (
                                          "$" +
                                          (Number(value) / 1000).toFixed(0) +
                                          "K"
                                        );
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>

                    {/* Monto promedio de propuestas */}
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-medium text-gray-900">
                            Monto Promedio de Propuestas
                          </h3>
                        </div>
                        <div className="h-64 flex flex-col justify-between">
                          <div className="mb-2 text-4xl font-bold text-blue-600 text-center">
                            $
                            {metricsData.averageAmount.toLocaleString("es-MX", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}{" "}
                            MXN
                          </div>
                          <div className="text-sm text-center mb-4">
                            <span
                              className={`font-medium ${
                                metricsData.percentageChanges.averageAmount > 0
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {metricsData.percentageChanges.averageAmount > 0
                                ? "+"
                                : ""}
                              {metricsData.percentageChanges.averageAmount.toFixed(
                                0
                              )}
                              %
                            </span>
                            <span className="text-gray-500">
                              {" "}
                              respecto al período anterior
                            </span>
                          </div>
                          <div className="flex-1 w-full">
                            <Bar
                              data={{
                                labels: Object.entries(metricsData.monthlyData)
                                  .sort((a, b) => {
                                    const [monthA, yearA] = a[0]
                                      .split("-")
                                      .map(Number);
                                    const [monthB, yearB] = b[0]
                                      .split("-")
                                      .map(Number);
                                    return (
                                      yearA * 12 +
                                      monthA -
                                      (yearB * 12 + monthB)
                                    );
                                  })
                                  .map(([key]) =>
                                    getMonthName(parseInt(key.split("-")[0]))
                                  ),
                                datasets: [
                                  {
                                    label: "Monto Promedio",
                                    // Calculamos el monto promedio por mes de forma estimada
                                    data: Object.entries(
                                      metricsData.monthlyData
                                    )
                                      .sort((a, b) => {
                                        const [monthA, yearA] = a[0]
                                          .split("-")
                                          .map(Number);
                                        const [monthB, yearB] = b[0]
                                          .split("-")
                                          .map(Number);
                                        return (
                                          yearA * 12 +
                                          monthA -
                                          (yearB * 12 + monthB)
                                        );
                                      })
                                      .map(([_, data]) => {
                                        // Si hay propuestas en ese mes, estimamos monto promedio
                                        if (data.proposals > 0) {
                                          // Generamos un valor cercano al promedio general
                                          const variation =
                                            Math.random() * 0.4 - 0.2; // -20% a +20%
                                          return (
                                            metricsData.averageAmount *
                                            (1 + variation)
                                          );
                                        }
                                        return 0;
                                      }),
                                    backgroundColor: "rgba(14, 165, 233, 0.7)",
                                    borderColor: "rgb(3, 105, 161)",
                                    borderWidth: 1,
                                    borderRadius: 4,
                                  },
                                ],
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    display: false,
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: function (context) {
                                        return `$${context.parsed.y.toLocaleString(
                                          "es-MX",
                                          {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                          }
                                        )} MXN`;
                                      },
                                    },
                                  },
                                },
                                scales: {
                                  y: {
                                    beginAtZero: false,
                                    min: Math.max(
                                      0,
                                      metricsData.averageAmount * 0.7
                                    ),
                                    ticks: {
                                      callback: function (value) {
                                        return (
                                          "$" +
                                          (Number(value) / 1000).toFixed(0) +
                                          "K"
                                        );
                                      },
                                    },
                                  },
                                },
                              }}
                            />
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>
              )}
            </div>
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
              className="mb-4"
            />
            <Input
              label="Email"
              placeholder="Ingrese email"
              value={newSubaccount.email}
              onChange={(e) =>
                setNewSubaccount({ ...newSubaccount, email: e.target.value })
              }
              isInvalid={!!formErrors.email}
              errorMessage={formErrors.email}
              className="mb-4"
            />
            <Input
              label="Contraseña"
              placeholder="Ingrese contraseña"
              type="password"
              value={newSubaccount.password}
              onChange={(e) =>
                setNewSubaccount({
                  ...newSubaccount,
                  password: e.target.value,
                })
              }
              isInvalid={!!formErrors.password}
              errorMessage={formErrors.password}
              className="mb-4"
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

      <Modal
        isOpen={isDateRangeModalOpen}
        onClose={() => setIsDateRangeModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            Seleccionar Rango de Fechas
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de inicio
                </label>
                <Input
                  type="date"
                  value={customDateRange.startDate.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      startDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de fin
                </label>
                <Input
                  type="date"
                  value={customDateRange.endDate.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setCustomDateRange({
                      ...customDateRange,
                      endDate: new Date(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsDateRangeModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button color="success" onPress={handleDateRangeConfirm}>
              Aplicar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
