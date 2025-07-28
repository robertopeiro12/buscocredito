"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useAdminGuard } from "@/hooks/useRoleGuard";
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
import { AdminSidebar } from "@/components/features/dashboard/AdminSidebar";
import { SubaccountCard } from "@/components/features/dashboard/SubaccountCard";
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
  chartOptions?: {
    bar?: any;
    pie?: any;
    interestRate?: any;
  };
};

export default function AdminDashboard() {
  // TODOS LOS HOOKS PRIMERO
  const { isAuthorized, isLoading: isCheckingAuth } = useAdminGuard();
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
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // VARIABLES COMPUTADAS DESPUÉS DE TODOS LOS HOOKS
  const filteredSubaccounts = subaccounts.filter(
    (account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Función fetchUsers usando API en lugar de consulta directa
  const fetchUsers = async (userId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/getSubcuentas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Para incluir cookies de autenticación
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const newSubaccounts: Subaccount[] = data.subcuentas.map((sub: any, index: number) => ({
        id: index + 1,
        name: sub.name,
        email: sub.email,
        password: "", // No enviamos contraseñas
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

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user.uid);
        setUserEmail(user.email || ""); // Guardamos el email aquí
        fetchUsers(user.uid);
        // Cambiar fetchAdminData por función inline
        const db = getFirestore();
        try {
          getDoc(doc(db, "cuentas", user.uid)).then((adminDoc) => {
            if (adminDoc.exists()) {
              const data = adminDoc.data();
              setAdminData({
                Empresa: data.Empresa || "",
                email: data.email || "",
              });
            }
          });
        } catch (error) {
          console.error("Error al obtener datos del administrador:", error);
        }
      } else {
        router.push("/login");
      }
    });
  }, [router]);

  useEffect(() => {
    if (user && activeTab === "metrics") {
      setIsLoadingMetrics(true);

      // Pequeño retraso para garantizar transiciones suaves
      const timeoutId = setTimeout(() => {
        const fetchMetricsData = async (userId: string) => {
          try {
            const db = getFirestore();
            const now = new Date();
            let startDate = new Date();
            let previousPeriodStartDate = new Date();
            let previousPeriodEndDate = new Date();

            // Ajustar las fechas según el rango seleccionado
            if (selectedTimeRange === "month") {
              // Último mes: desde el día actual del mes pasado hasta hoy
              startDate = new Date(now);
              startDate.setMonth(now.getMonth() - 1);

              // Periodo anterior: el mes antes del mes actual
              previousPeriodStartDate = new Date(startDate);
              previousPeriodStartDate.setMonth(startDate.getMonth() - 1);
              previousPeriodEndDate = new Date(startDate);
              previousPeriodEndDate.setDate(
                previousPeriodEndDate.getDate() - 1
              );
            } else if (selectedTimeRange === "quarter") {
              // CORRECCIÓN: Último trimestre = 3 meses contando el actual
              const currentMonth = now.getMonth();
              const currentYear = now.getFullYear();

              // Si estamos en marzo (2), necesitamos enero (0), febrero (1) y marzo (2)
              const firstMonthOfQuarter = (currentMonth - 2 + 12) % 12; // Para manejar cuando el mes es enero o febrero
              const firstYearOfQuarter =
                firstMonthOfQuarter > currentMonth
                  ? currentYear - 1
                  : currentYear;

              // Establecemos el primer día del primer mes del trimestre
              startDate = new Date(firstYearOfQuarter, firstMonthOfQuarter, 1);

              // Toast para mostrar al usuario
              toast.success(
                `Mostrando datos del trimestre: ${getMonthName(
                  firstMonthOfQuarter + 1
                )} a ${getMonthName(currentMonth + 1)}`,
                {
                  duration: 3000,
                }
              );

              // Periodo anterior: los 3 meses antes del trimestre actual
              previousPeriodStartDate = new Date(startDate);
              previousPeriodStartDate.setMonth(
                previousPeriodStartDate.getMonth() - 3
              );
              previousPeriodEndDate = new Date(startDate);
              previousPeriodEndDate.setDate(
                previousPeriodEndDate.getDate() - 1
              );
            } else if (selectedTimeRange === "year") {
              // Último año: 12 meses atrás hasta hoy
              startDate = new Date(now);
              startDate.setFullYear(now.getFullYear() - 1);

              // Periodo anterior: el año antes del año actual
              previousPeriodStartDate = new Date(startDate);
              previousPeriodStartDate.setFullYear(startDate.getFullYear() - 1);
              previousPeriodEndDate = new Date(startDate);
              previousPeriodEndDate.setDate(
                previousPeriodEndDate.getDate() - 1
              );
            } else if (selectedTimeRange === "custom") {
              startDate = new Date(customDateRange.startDate);
              const endDate = new Date(customDateRange.endDate);

              // Para periodo personalizado, calculamos un periodo previo de igual duración
              const duration = endDate.getTime() - startDate.getTime();
              previousPeriodEndDate = new Date(startDate);
              previousPeriodEndDate.setDate(
                previousPeriodEndDate.getDate() - 1
              );
              previousPeriodStartDate = new Date(previousPeriodEndDate);
              previousPeriodStartDate.setTime(
                previousPeriodEndDate.getTime() - duration
              );
            }

            const startTimestamp = Timestamp.fromDate(startDate);
            const endTimestamp =
              selectedTimeRange === "custom"
                ? Timestamp.fromDate(new Date(customDateRange.endDate))
                : Timestamp.fromDate(now);
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

            const subaccountsRef = collection(db, "cuentas");
            const subQ = query(
              subaccountsRef,
              where("Empresa_id", "==", userId)
            );
            const subSnapshot = await getDocs(subQ);

            const workerIds: string[] = [];
            subSnapshot.forEach((doc) => {
              workerIds.push(doc.id);
            });

            for (const workerId of workerIds) {
              try {
                // Consultar propuestas del periodo actual
                let currentQ;
                if (selectedTimeRange === "custom") {
                  currentQ = query(
                    proposalsRef,
                    where("partner", "==", workerId),
                    where("createdAt", ">=", startTimestamp),
                    where("createdAt", "<=", endTimestamp)
                  );
                } else {
                  currentQ = query(
                    proposalsRef,
                    where("partner", "==", workerId),
                    where("createdAt", ">=", startTimestamp)
                  );
                }
                const currentSnapshot = await getDocs(currentQ);

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
            const monthlyData = generateMonthlyData(currentProposals);

            // Configuración común para todos los gráficos
            const commonChartOptions = {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: "bottom" as const,
                  labels: {
                    boxWidth: 15,
                    padding: 15,
                    font: {
                      size: 12,
                      family: "'Inter', sans-serif",
                    },
                  },
                },
                tooltip: {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  titleColor: "#1f2937",
                  bodyColor: "#4b5563",
                  borderColor: "#e5e7eb",
                  borderWidth: 1,
                  padding: 12,
                  displayColors: false,
                  callbacks: {
                    label: (context: any) => {
                      const value = context.raw as number;
                      const total = context.dataset.data.reduce(
                        (a: number, b: number) => a + b,
                        0
                      );
                      const percentage = Math.round((value / total) * 100);
                      return `${context.label}: ${value} (${percentage}%)`;
                    },
                  },
                },
              },
            };

            // Configuración común para gráficos de barras
            const commonBarOptions = {
              ...commonChartOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                  },
                  ticks: {
                    font: {
                      family: "'Inter', sans-serif",
                      size: 11,
                    },
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    font: {
                      family: "'Inter', sans-serif",
                      size: 11,
                    },
                  },
                },
              },
            };

            // Actualizar las opciones de los gráficos existentes
            const barChartOptions = {
              ...commonBarOptions,
              plugins: {
                ...commonBarOptions.plugins,
                legend: {
                  display: false,
                },
                tooltip: {
                  ...commonBarOptions.plugins.tooltip,
                  titleFont: {
                    size: 14,
                    weight: "bold",
                    family: "'Inter', sans-serif",
                  },
                  bodyFont: {
                    size: 13,
                    family: "'Inter', sans-serif",
                  },
                  padding: 14,
                  boxPadding: 6,
                },
              },
              scales: {
                ...commonBarOptions.scales,
                y: {
                  ...commonBarOptions.scales.y,
                  ticks: {
                    ...commonBarOptions.scales.y.ticks,
                    font: {
                      size: 12,
                      weight: "500",
                      family: "'Inter', sans-serif",
                    },
                    color: "#64748b",
                  },
                  grid: {
                    color: "rgba(226, 232, 240, 0.7)",
                    borderDash: [3, 3],
                  },
                },
                x: {
                  ...commonBarOptions.scales.x,
                  ticks: {
                    ...commonBarOptions.scales.x.ticks,
                    font: {
                      size: 12,
                      weight: "500",
                      family: "'Inter', sans-serif",
                    },
                    color: "#64748b",
                  },
                },
              },
              animation: {
                duration: 800,
                easing: "easeOutQuart",
              },
            };

            // Opciones específicas para el gráfico de tasa de interés
            const interestRateChartOptions = {
              ...barChartOptions,
              scales: {
                ...barChartOptions.scales,
                y: {
                  ...barChartOptions.scales.y,
                  beginAtZero: true,
                  suggestedMax: Math.max(metrics.averageInterestRate * 1.5, 5),
                  ticks: {
                    callback: (value: any) => {
                      return value.toFixed(2) + "%";
                    },
                  },
                },
              },
            };

            const pieChartOptions = {
              ...commonChartOptions,
              plugins: {
                ...commonChartOptions.plugins,
                legend: {
                  position: "bottom" as const,
                  labels: {
                    boxWidth: 12,
                    padding: 16,
                    font: {
                      size: 12,
                      weight: "500",
                      family: "'Inter', sans-serif",
                    },
                    color: "#475569",
                    usePointStyle: true,
                    pointStyle: "circle",
                  },
                },
                tooltip: {
                  ...commonChartOptions.plugins.tooltip,
                  titleFont: {
                    size: 14,
                    weight: "bold",
                    family: "'Inter', sans-serif",
                  },
                  bodyFont: {
                    size: 13,
                    family: "'Inter', sans-serif",
                  },
                  padding: 14,
                  boxPadding: 6,
                },
              },
              animation: {
                animateRotate: true,
                animateScale: true,
                duration: 800,
                easing: "easeOutQuart",
              },
            };

            // Actualizar los datos de los gráficos con las nuevas opciones
            setMetricsData({
              ...metrics,
              percentageChanges,
              monthlyData,
              previousPeriodMetrics: previousMetrics,
              chartOptions: {
                bar: barChartOptions,
                pie: pieChartOptions,
                interestRate: interestRateChartOptions,
              },
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

        fetchMetricsData(user);
      }, 100);

      // Limpieza del timeout en caso de desmontaje
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [user, activeTab, selectedTimeRange, customDateRange]);

  // CONDICIONALES DESPUÉS DE TODOS LOS HOOKS
  // Mostrar loading mientras verifica permisos
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  // Si no está autorizado, el hook ya manejó la redirección
  if (!isAuthorized) {
    return null;
  }

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
    let validInterestRateCount = 0;

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
      if (proposal.interest_rate) {
        const interestRateValue = parseFloat(proposal.interest_rate.toString());
        if (!isNaN(interestRateValue)) {
          totalInterestRate += interestRateValue;
          validInterestRateCount++;
        }
      }
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
      validInterestRateCount > 0
        ? parseFloat((totalInterestRate / validInterestRateCount).toFixed(2))
        : 0;
    const averageAmount =
      proposals.length > 0
        ? parseFloat((totalAmount / proposals.length).toFixed(2))
        : 0;

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
    return parseFloat((((current - previous) / previous) * 100).toFixed(2));
  };

  // Función para generar datos de los últimos meses
  const generateMonthlyData = (proposals: any[]) => {
    const now = new Date();
    const result: { [key: string]: any } = {};

    // Para el trimestre, forzamos los tres meses específicos
    if (selectedTimeRange === "quarter") {
      // Obtener mes y año actual
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      // Forzar la creación de los últimos 3 meses exactamente, independientemente de los datos
      // Ejemplo: si estamos en marzo (2), necesitamos enero (0), febrero (1) y marzo (2)
      for (let i = 0; i < 3; i++) {
        // Calculamos el mes correcto (incluso si cruza años)
        const targetMonth = (currentMonth - 2 + i + 12) % 12;

        // Ajustar el año si el mes calculado es después de diciembre
        const targetYear =
          currentMonth - 2 + i < 0 ? currentYear - 1 : currentYear;

        // Crear la clave del mes-año y asignar objeto vacío de datos
        const monthKey = `${targetMonth + 1}-${targetYear}`;
        result[monthKey] = { proposals: 0, commissions: 0 };
      }
    } else {
      // Para los otros rangos, usamos la lógica normal
      let startPeriod = new Date();

      if (selectedTimeRange === "month") {
        startPeriod.setMonth(now.getMonth() - 1);
      } else if (selectedTimeRange === "year") {
        startPeriod.setFullYear(now.getFullYear() - 1);
      } else if (selectedTimeRange === "custom") {
        startPeriod = new Date(customDateRange.startDate);
      }

      // Inicializamos los meses del rango con datos vacíos
      const currentDate = new Date();
      let iterDate = new Date(startPeriod);

      while (iterDate <= currentDate) {
        const monthYear = `${
          iterDate.getMonth() + 1
        }-${iterDate.getFullYear()}`;
        result[monthYear] = { proposals: 0, commissions: 0 };
        iterDate.setMonth(iterDate.getMonth() + 1);
      }
    }

    // Poblar con datos reales de propuestas solo para las claves que ya existen
    proposals.forEach((proposal) => {
      if (proposal.createdAt) {
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

        // Solo agregamos datos a los meses ya inicializados en el objeto result
        if (result[monthYear]) {
          result[monthYear].proposals += 1;

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
  const getMonthName = (monthNumber: number, year?: number) => {
    const monthsShort = [
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

    const monthsFull = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];

    // Usar nombre completo para el trimestre para mayor claridad
    if (selectedTimeRange === "quarter") {
      if (year) {
        return `${monthsFull[monthNumber - 1]} ${year}`;
      }
      return monthsFull[monthNumber - 1];
    }

    // Si es año o personalizado y abarca más de un año, incluimos el año
    if (
      (selectedTimeRange === "year" || selectedTimeRange === "custom") &&
      year
    ) {
      return `${monthsShort[monthNumber - 1]} ${year}`;
    }

    return monthsShort[monthNumber - 1];
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
    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (customDateRange.startDate > customDateRange.endDate) {
      toast.error("La fecha de inicio debe ser anterior a la fecha de fin", {
        icon: "⚠️",
        duration: 3000,
      });
      return;
    }

    // Cerrar el modal y forzar la actualización de los datos
    setIsDateRangeModalOpen(false);
    setIsLoadingMetrics(true);

    // El efecto useEffect se encargará de actualizar los datos
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
                <div className="bg-gray-50 p-1 rounded-lg shadow-sm border border-gray-100 flex gap-1">
                  <Button
                    size="sm"
                    color={
                      selectedTimeRange === "month" ? "primary" : "default"
                    }
                    variant={selectedTimeRange === "month" ? "solid" : "light"}
                    className={`font-medium px-3 py-1 rounded-md transition-all duration-200 ${
                      selectedTimeRange === "month" ? "shadow-sm" : ""
                    }`}
                    onPress={() => setSelectedTimeRange("month")}
                  >
                    Último mes
                  </Button>
                  <Button
                    size="sm"
                    color={
                      selectedTimeRange === "quarter" ? "primary" : "default"
                    }
                    variant={
                      selectedTimeRange === "quarter" ? "solid" : "light"
                    }
                    className={`font-medium px-3 py-1 rounded-md transition-all duration-200 ${
                      selectedTimeRange === "quarter" ? "shadow-sm" : ""
                    }`}
                    onPress={() => setSelectedTimeRange("quarter")}
                  >
                    Último trimestre
                  </Button>
                  <Button
                    size="sm"
                    color={selectedTimeRange === "year" ? "primary" : "default"}
                    variant={selectedTimeRange === "year" ? "solid" : "light"}
                    className={`font-medium px-3 py-1 rounded-md transition-all duration-200 ${
                      selectedTimeRange === "year" ? "shadow-sm" : ""
                    }`}
                    onPress={() => setSelectedTimeRange("year")}
                  >
                    Último año
                  </Button>
                  <Button
                    size="sm"
                    color={
                      selectedTimeRange === "custom" ? "primary" : "default"
                    }
                    variant={selectedTimeRange === "custom" ? "solid" : "light"}
                    className={`font-medium px-3 py-1 rounded-md transition-all duration-200 ${
                      selectedTimeRange === "custom" ? "shadow-sm" : ""
                    }`}
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
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden border border-gray-100">
                      <CardBody className="p-0">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-gray-100">
                          <h3 className="text-lg font-semibold text-green-800">
                            Total de Propuestas
                          </h3>
                        </div>
                        <div className="h-64 flex flex-col justify-center items-center p-6">
                          <div className="mb-4 text-5xl font-bold text-green-600 transition-all duration-500 ease-in-out">
                            {metricsData.totalProposals}
                          </div>
                          <div
                            className={`text-sm font-medium ${
                              metricsData.percentageChanges.totalProposals >= 0
                                ? "text-green-600"
                                : "text-red-500"
                            } flex items-center gap-1 mb-4`}
                          >
                            {metricsData.percentageChanges.totalProposals >=
                            0 ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M12 13a1 1 0 110 2H7a1 1 0 01-1-1v-5a1 1 0 112 0v2.586l4.293-4.293a1 1 0 011.414 0L16 9.586l4.293-4.293a1 1 0 111.414 1.414l-5 5a1 1 0 01-1.414 0L12 8.414l-3.293 3.293a1 1 0 01-1.414 0V13z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                            {metricsData.percentageChanges.totalProposals > 0
                              ? "+"
                              : ""}
                            {metricsData.percentageChanges.totalProposals.toFixed(
                              0
                            )}
                            % respecto al período anterior
                          </div>
                          <div className="mt-2 w-full h-36">
                            {Object.keys(metricsData.monthlyData).length >
                              0 && (
                              <Bar
                                data={{
                                  labels: Object.entries(
                                    metricsData.monthlyData
                                  )
                                    .sort((a, b) => {
                                      const [month1, year1] = a[0]
                                        .split("-")
                                        .map(Number);
                                      const [month2, year2] = b[0]
                                        .split("-")
                                        .map(Number);
                                      return (
                                        year1 * 12 +
                                        month1 -
                                        (year2 * 12 + month2)
                                      );
                                    })
                                    .map(([key]) => {
                                      const [month, year] = key
                                        .split("-")
                                        .map(Number);
                                      return getMonthName(month, year);
                                    }),
                                  datasets: [
                                    {
                                      label: "Propuestas",
                                      data: Object.entries(
                                        metricsData.monthlyData
                                      )
                                        .sort((a, b) => {
                                          const [month1, year1] = a[0]
                                            .split("-")
                                            .map(Number);
                                          const [month2, year2] = b[0]
                                            .split("-")
                                            .map(Number);
                                          return (
                                            year1 * 12 +
                                            month1 -
                                            (year2 * 12 + month2)
                                          );
                                        })
                                        .map(([_, data]) => data.proposals),
                                      backgroundColor:
                                        "rgba(16, 185, 129, 0.8)",
                                      borderColor: "rgb(5, 150, 105)",
                                      borderWidth: 1,
                                      borderRadius: 6,
                                      hoverBackgroundColor:
                                        "rgba(16, 185, 129, 1)",
                                    },
                                  ],
                                }}
                                options={{
                                  ...metricsData.chartOptions?.bar,
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      suggestedMax: Math.max(
                                        metricsData.totalProposals * 1.5,
                                        5
                                      ),
                                      ticks: {
                                        callback: (value: any) => {
                                          return value.toFixed(0);
                                        },
                                        font: {
                                          size: 12,
                                          weight: "500",
                                          family: "'Inter', sans-serif",
                                        },
                                        color: "#64748b",
                                      },
                                      grid: {
                                        color: "rgba(226, 232, 240, 0.7)",
                                        borderDash: [3, 3],
                                      },
                                    },
                                    x: metricsData.chartOptions?.bar?.scales?.x,
                                  },
                                  plugins: {
                                    ...metricsData.chartOptions?.bar?.plugins,
                                    tooltip: {
                                      ...metricsData.chartOptions?.bar?.plugins
                                        ?.tooltip,
                                      callbacks: {
                                        label: (context: any) => {
                                          return `Propuestas: ${context.raw.toFixed(
                                            0
                                          )}`;
                                        },
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
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden border border-gray-100">
                      <CardBody className="p-0">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
                          <h3 className="text-lg font-semibold text-blue-800">
                            Distribución por Tipo de Préstamo
                          </h3>
                        </div>
                        <div className="h-64 flex flex-col justify-center items-center p-6">
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
                                        "rgba(59, 130, 246, 0.85)",
                                        "rgba(16, 185, 129, 0.85)",
                                        "rgba(139, 92, 246, 0.85)",
                                        "rgba(245, 158, 11, 0.85)",
                                        "rgba(239, 68, 68, 0.85)",
                                      ],
                                      borderColor: [
                                        "rgb(30, 64, 175)",
                                        "rgb(5, 150, 105)",
                                        "rgb(109, 40, 217)",
                                        "rgb(180, 83, 9)",
                                        "rgb(185, 28, 28)",
                                      ],
                                      borderWidth: 1,
                                      hoverOffset: 6,
                                    },
                                  ],
                                }}
                                options={metricsData.chartOptions?.pie}
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
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden border border-gray-100">
                      <CardBody className="p-0">
                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 border-b border-gray-100">
                          <h3 className="text-lg font-semibold text-purple-800">
                            Distribución por Propósito
                          </h3>
                        </div>
                        <div className="h-64 flex flex-col justify-center items-center p-6">
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
                                        "rgba(245, 158, 11, 0.85)",
                                        "rgba(239, 68, 68, 0.85)",
                                        "rgba(99, 102, 241, 0.85)",
                                        "rgba(20, 184, 166, 0.85)",
                                        "rgba(236, 72, 153, 0.85)",
                                      ],
                                      borderColor: [
                                        "rgb(180, 83, 9)",
                                        "rgb(185, 28, 28)",
                                        "rgb(79, 70, 229)",
                                        "rgb(13, 148, 136)",
                                        "rgb(219, 39, 119)",
                                      ],
                                      borderWidth: 1,
                                      hoverOffset: 6,
                                    },
                                  ],
                                }}
                                options={metricsData.chartOptions?.pie}
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
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden border border-gray-100">
                      <CardBody className="p-0">
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 border-b border-gray-100">
                          <h3 className="text-lg font-semibold text-yellow-800">
                            Distribución por Frecuencia de Pago
                          </h3>
                        </div>
                        <div className="h-64 flex flex-col justify-center items-center p-6">
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
                                        "rgba(245, 158, 11, 0.85)",
                                        "rgba(239, 68, 68, 0.85)",
                                        "rgba(245, 158, 11, 0.85)",
                                        "rgba(139, 92, 246, 0.85)",
                                        "rgba(239, 68, 68, 0.85)",
                                      ],
                                      borderColor: [
                                        "rgb(180, 83, 9)",
                                        "rgb(185, 28, 28)",
                                        "rgb(180, 83, 9)",
                                        "rgb(109, 40, 217)",
                                        "rgb(185, 28, 28)",
                                      ],
                                      borderWidth: 1,
                                      hoverOffset: 6,
                                    },
                                  ],
                                }}
                                options={metricsData.chartOptions?.pie}
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
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden border border-gray-100">
                      <CardBody className="p-0">
                        <div className="bg-gradient-to-r from-teal-50 to-lime-50 p-4 border-b border-gray-100">
                          <h3 className="text-lg font-semibold text-teal-800">
                            Tasa de Interés Promedio
                          </h3>
                        </div>
                        <div className="h-64 flex flex-col justify-center items-center p-6">
                          <div className="text-4xl font-bold text-teal-600 text-center mb-2">
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
                                    const [month1, year1] = a[0]
                                      .split("-")
                                      .map(Number);
                                    const [month2, year2] = b[0]
                                      .split("-")
                                      .map(Number);
                                    return (
                                      year1 * 12 +
                                      month1 -
                                      (year2 * 12 + month2)
                                    );
                                  })
                                  .map(([key]) => {
                                    const [month, year] = key
                                      .split("-")
                                      .map(Number);
                                    return getMonthName(month, year);
                                  }),
                                datasets: [
                                  {
                                    label: "Tasa Promedio (%)",
                                    data: Object.entries(
                                      metricsData.monthlyData
                                    )
                                      .sort((a, b) => {
                                        const [month1, year1] = a[0]
                                          .split("-")
                                          .map(Number);
                                        const [month2, year2] = b[0]
                                          .split("-")
                                          .map(Number);
                                        return (
                                          year1 * 12 +
                                          month1 -
                                          (year2 * 12 + month2)
                                        );
                                      })
                                      .map(([_, data]) => {
                                        if (data.proposals > 0) {
                                          // Usar el valor exacto del promedio en vez de uno aleatorio
                                          return metricsData.averageInterestRate;
                                        }
                                        return 0;
                                      }),
                                    backgroundColor: "rgba(14, 165, 233, 0.8)",
                                    borderColor: "rgb(3, 105, 161)",
                                    borderWidth: 1,
                                    borderRadius: 6,
                                  },
                                ],
                              }}
                              options={{
                                ...metricsData.chartOptions?.bar,
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    suggestedMax: Math.max(
                                      metricsData.averageInterestRate * 1.5,
                                      5
                                    ),
                                    ticks: {
                                      callback: (value: any) => {
                                        return value.toFixed(2) + "%";
                                      },
                                      font: {
                                        size: 12,
                                        weight: "500",
                                        family: "'Inter', sans-serif",
                                      },
                                      color: "#64748b",
                                    },
                                    grid: {
                                      color: "rgba(226, 232, 240, 0.7)",
                                      borderDash: [3, 3],
                                    },
                                  },
                                  x: metricsData.chartOptions?.bar?.scales?.x,
                                },
                                plugins: {
                                  ...metricsData.chartOptions?.bar?.plugins,
                                  tooltip: {
                                    callbacks: {
                                      label: (context: any) => {
                                        return `Tasa: ${context.raw.toFixed(
                                          2
                                        )}%`;
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
                    <Card className="bg-white shadow-sm hover:shadow-md transition-shadow duration-300 rounded-xl overflow-hidden border border-gray-100">
                      <CardBody className="p-0">
                        <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 border-b border-gray-100">
                          <h3 className="text-lg font-semibold text-pink-800">
                            Monto Promedio de Propuestas
                          </h3>
                        </div>
                        <div className="h-64 flex flex-col justify-center items-center p-6">
                          <div className="mb-2 text-4xl font-bold text-pink-600 text-center">
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
                                    const [month1, year1] = a[0]
                                      .split("-")
                                      .map(Number);
                                    const [month2, year2] = b[0]
                                      .split("-")
                                      .map(Number);
                                    return (
                                      year1 * 12 +
                                      month1 -
                                      (year2 * 12 + month2)
                                    );
                                  })
                                  .map(([key]) => {
                                    const [month, year] = key
                                      .split("-")
                                      .map(Number);
                                    return getMonthName(month, year);
                                  }),
                                datasets: [
                                  {
                                    label: "Monto Promedio",
                                    data: Object.entries(
                                      metricsData.monthlyData
                                    )
                                      .sort((a, b) => {
                                        const [month1, year1] = a[0]
                                          .split("-")
                                          .map(Number);
                                        const [month2, year2] = b[0]
                                          .split("-")
                                          .map(Number);
                                        return (
                                          year1 * 12 +
                                          month1 -
                                          (year2 * 12 + month2)
                                        );
                                      })
                                      .map(([_, data]) => {
                                        if (data.proposals > 0) {
                                          // Usar el valor exacto del promedio en vez de uno aleatorio
                                          return metricsData.averageAmount;
                                        }
                                        return 0;
                                      }),
                                    backgroundColor: "rgba(14, 165, 233, 0.8)",
                                    borderColor: "rgb(3, 105, 161)",
                                    borderWidth: 1,
                                    borderRadius: 6,
                                  },
                                ],
                              }}
                              options={{
                                ...metricsData.chartOptions?.bar,
                                scales: {
                                  y: {
                                    beginAtZero: true,
                                    suggestedMax: Math.max(
                                      metricsData.averageAmount * 1.5,
                                      5
                                    ),
                                    ticks: {
                                      callback: (value: any) => {
                                        return (
                                          "$" + value.toLocaleString("es-MX")
                                        );
                                      },
                                      font: {
                                        size: 12,
                                        weight: "500",
                                        family: "'Inter', sans-serif",
                                      },
                                      color: "#64748b",
                                    },
                                    grid: {
                                      color: "rgba(226, 232, 240, 0.7)",
                                      borderDash: [3, 3],
                                    },
                                  },
                                  x: metricsData.chartOptions?.bar?.scales?.x,
                                },
                                plugins: {
                                  ...metricsData.chartOptions?.bar?.plugins,
                                  tooltip: {
                                    callbacks: {
                                      label: (context: any) => {
                                        return `Monto: $${context.raw.toLocaleString(
                                          "es-MX"
                                        )} MXN`;
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
        classNames={{
          base: "rounded-xl shadow-xl",
          header: "border-b border-gray-100",
          body: "py-6",
          footer: "border-t border-gray-100",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <div className="text-lg font-semibold text-gray-900">
              Seleccionar Rango de Fechas
            </div>
            <div className="text-xs text-gray-500">
              Elige un período personalizado para analizar tus métricas
            </div>
          </ModalHeader>
          <ModalBody>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full"
                  classNames={{
                    input: "bg-gray-50 border border-gray-200",
                    inputWrapper:
                      "bg-gray-50 hover:bg-gray-100 transition-colors",
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full"
                  classNames={{
                    input: "bg-gray-50 border border-gray-200",
                    inputWrapper:
                      "bg-gray-50 hover:bg-gray-100 transition-colors",
                  }}
                />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button
              color="danger"
              variant="light"
              onPress={() => setIsDateRangeModalOpen(false)}
              className="rounded-md"
            >
              Cancelar
            </Button>
            <Button
              color="primary"
              onPress={handleDateRangeConfirm}
              className="rounded-md shadow-sm"
            >
              Aplicar Filtro
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
