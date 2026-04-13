import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import toast from "react-hot-toast";

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

interface UseAdminMetricsProps {
  user: string;
  activeTab: string;
  selectedTimeRange: string;
  customDateRange: {
    startDate: Date;
    endDate: Date;
  };
}

export const useAdminMetrics = ({
  user,
  activeTab,
  selectedTimeRange,
  customDateRange,
}: UseAdminMetricsProps) => {
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
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [rawProposals, setRawProposals] = useState<any[]>([]);

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
        proposal.amortizationFrequency ||
        proposal.requestInfo?.originalPayment ||
        "Desconocido";
      paymentFrequencies[paymentFrequency] =
        (paymentFrequencies[paymentFrequency] || 0) + 1;

      // Sumar interés, monto y comisiones
      if (proposal.interestRate) {
        const interestRateValue = parseFloat(proposal.interestRate.toString());
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

  // Función principal para obtener métricas
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

      // Set end date for custom range
      const endDate = selectedTimeRange === "custom" 
        ? new Date(customDateRange.endDate) 
        : now;

      // Obtener todas las propuestas de los trabajadores (periodo actual)
      const proposalsRef = collection(db, "propuestas");
      const currentProposals: any[] = [];
      const previousProposals: any[] = [];

      const subaccountsRef = collection(db, "cuentas");
      const subQ = query(
        subaccountsRef,
        where("adminId", "==", userId)
      );
      const subSnapshot = await getDocs(subQ);

      const workerIds: string[] = [];
      subSnapshot.forEach((doc) => {
        workerIds.push(doc.id);
      });

      // Helper function to parse date from various formats
      const parseProposalDate = (proposal: any): Date | null => {
        // Try createdAt first (could be Timestamp, Date, or string)
        if (proposal.createdAt) {
          if (proposal.createdAt.toDate) {
            return proposal.createdAt.toDate();
          }
          if (proposal.createdAt instanceof Date) {
            return proposal.createdAt;
          }
          if (typeof proposal.createdAt === 'string') {
            const parsed = new Date(proposal.createdAt);
            if (!isNaN(parsed.getTime())) return parsed;
          }
        }
        // Try fechaCreacion (could be Timestamp, Date, or string)
        if (proposal.fechaCreacion) {
          if (proposal.fechaCreacion.toDate) {
            return proposal.fechaCreacion.toDate();
          }
          if (proposal.fechaCreacion instanceof Date) {
            return proposal.fechaCreacion;
          }
          if (typeof proposal.fechaCreacion === 'string') {
            const parsed = new Date(proposal.fechaCreacion);
            if (!isNaN(parsed.getTime())) return parsed;
          }
        }
        return null;
      };

      for (const workerId of workerIds) {
        try {
          // Fetch all proposals for this worker (without date filter)
          const proposalQ = query(
            proposalsRef,
            where("lenderId", "==", workerId)
          );
          const proposalSnapshot = await getDocs(proposalQ);

          proposalSnapshot.forEach((doc) => {
            const data = doc.data();
            const proposalDate = parseProposalDate(data);
            
            if (proposalDate) {
              // Check if in current period
              if (proposalDate >= startDate && proposalDate <= endDate) {
                currentProposals.push({
                  id: doc.id,
                  ...data,
                });
              }
              // Check if in previous period
              else if (proposalDate >= previousPeriodStartDate && proposalDate <= previousPeriodEndDate) {
                previousProposals.push({
                  id: doc.id,
                  ...data,
                });
              }
            } else {
              // If no valid date, include in current proposals to avoid data loss
              currentProposals.push({
                id: doc.id,
                ...data,
              });
            }
          });
        } catch (error) {
          console.error(
            `Error al consultar propuestas para el trabajador ${workerId}:`,
            error
          );
        }
      }

      // Store raw proposals for export
      setRawProposals(currentProposals);

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

  useEffect(() => {
    if (user && activeTab === "metrics") {
      setIsLoadingMetrics(true);

      // Pequeño retraso para garantizar transiciones suaves
      const timeoutId = setTimeout(() => {
        fetchMetricsData(user);
      }, 100);

      // Limpieza del timeout en caso de desmontaje
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [user, activeTab, selectedTimeRange, customDateRange.startDate, customDateRange.endDate]);

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

  return {
    metricsData,
    isLoadingMetrics,
    rawProposals,
    getMonthName,
    getTopDistributionItems,
    calculatePercentage,
  };
};
