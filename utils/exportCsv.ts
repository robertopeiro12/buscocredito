/**
 * Utility to export data as CSV files
 */

type CsvRow = Record<string, string | number | boolean | null | undefined>;

/**
 * Converts an array of objects to a CSV string
 */
export function toCsv(rows: CsvRow[], columns?: { key: string; label: string }[]): string {
  if (rows.length === 0) return "";

  const keys = columns ? columns.map((c) => c.key) : Object.keys(rows[0]);
  const headers = columns ? columns.map((c) => c.label) : keys;

  const escape = (val: unknown): string => {
    const str = val == null ? "" : String(val);
    // Wrap in quotes if it contains comma, quote, or newline
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    headers.map(escape).join(","),
    ...rows.map((row) => keys.map((key) => escape(row[key])).join(",")),
  ];

  return lines.join("\n");
}

/**
 * Triggers a file download in the browser
 */
export function downloadCsv(csvContent: string, filename: string) {
  // Add BOM for proper UTF-8 encoding in Excel
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export metrics summary data as CSV
 */
export function exportMetricsSummary(
  metricsData: {
    totalProposals: number;
    averageInterestRate: number;
    averageAmount: number;
    totalCommissions: number;
    loanTypeDistribution: Record<string, number>;
    purposeDistribution: Record<string, number>;
    paymentFrequencyDistribution: Record<string, number>;
    monthlyData: Record<string, { proposals: number; commissions: number }>;
  },
  companyName: string,
  timeRange: string
) {
  const rows: CsvRow[] = [];

  // General summary
  rows.push({
    Categoría: "Resumen General",
    Métrica: "Total de Propuestas",
    Valor: metricsData.totalProposals,
  });
  rows.push({
    Categoría: "Resumen General",
    Métrica: "Tasa de Interés Promedio (%)",
    Valor: metricsData.averageInterestRate,
  });
  rows.push({
    Categoría: "Resumen General",
    Métrica: "Monto Promedio ($)",
    Valor: metricsData.averageAmount,
  });
  rows.push({
    Categoría: "Resumen General",
    Métrica: "Total Comisiones ($)",
    Valor: metricsData.totalCommissions,
  });

  // Loan type distribution
  Object.entries(metricsData.loanTypeDistribution).forEach(([type, count]) => {
    rows.push({
      Categoría: "Distribución por Tipo de Préstamo",
      Métrica: type,
      Valor: count,
    });
  });

  // Purpose distribution
  Object.entries(metricsData.purposeDistribution).forEach(([purpose, count]) => {
    rows.push({
      Categoría: "Distribución por Propósito",
      Métrica: purpose,
      Valor: count,
    });
  });

  // Payment frequency distribution
  Object.entries(metricsData.paymentFrequencyDistribution).forEach(
    ([freq, count]) => {
      rows.push({
        Categoría: "Distribución por Frecuencia de Pago",
        Métrica: freq,
        Valor: count,
      });
    }
  );

  // Monthly data
  Object.entries(metricsData.monthlyData).forEach(([month, data]) => {
    rows.push({
      Categoría: "Datos Mensuales",
      Métrica: `${month} - Propuestas`,
      Valor: data.proposals,
    });
    rows.push({
      Categoría: "Datos Mensuales",
      Métrica: `${month} - Comisiones ($)`,
      Valor: data.commissions,
    });
  });

  const columns = [
    { key: "Categoría", label: "Categoría" },
    { key: "Métrica", label: "Métrica" },
    { key: "Valor", label: "Valor" },
  ];

  const csv = toCsv(rows, columns);
  const date = new Date().toISOString().split("T")[0];
  downloadCsv(csv, `${companyName}_metricas_${timeRange}_${date}.csv`);
}

/**
 * Export raw proposals data as CSV
 */
export function exportProposalsData(
  proposals: Array<{
    id: string;
    company?: string;
    amount?: number;
    interest_rate?: number;
    comision?: number;
    commission?: number;
    deadline?: number;
    amortization_frequency?: string;
    amortization?: number;
    status?: string;
    partner?: string;
    createdAt?: any;
    requestInfo?: {
      type?: string;
      purpose?: string;
      originalPayment?: string;
    };
  }>,
  companyName: string
) {
  const rows = proposals.map((p) => {
    let dateStr = "";
    if (p.createdAt) {
      const d = p.createdAt.toDate ? p.createdAt.toDate() : new Date(p.createdAt);
      if (!isNaN(d.getTime())) {
        dateStr = d.toISOString().split("T")[0];
      }
    }

    return {
      ID: p.id,
      Empresa: p.company || companyName,
      Monto: p.amount || 0,
      "Tasa de Interés (%)": p.interest_rate || 0,
      "Comisión ($)": p.comision || p.commission || 0,
      "Plazo (meses)": p.deadline || "",
      "Frecuencia de Pago": p.amortization_frequency || "",
      Amortización: p.amortization || "",
      Estado: p.status || "",
      "Tipo de Préstamo": p.requestInfo?.type || "",
      Propósito: p.requestInfo?.purpose || "",
      "Fecha de Creación": dateStr,
    };
  });

  const csv = toCsv(rows);
  const date = new Date().toISOString().split("T")[0];
  downloadCsv(csv, `${companyName}_propuestas_${date}.csv`);
}

/**
 * Export worker stats as CSV
 */
export function exportWorkerStats(
  workers: Array<{
    id: string;
    name: string;
    email: string;
    stats: {
      totalPropuestas: number;
      solicitudesApproved: number;
      solicitudesRejected: number;
      solicitudesPending: number;
      approvalRate: number;
      lastActivity: string | null;
      isActive: boolean;
    };
  }>,
  companyName: string
) {
  const rows = workers.map((w) => ({
    Nombre: w.name,
    Email: w.email,
    "Total Propuestas": w.stats.totalPropuestas,
    Aprobadas: w.stats.solicitudesApproved,
    Rechazadas: w.stats.solicitudesRejected,
    Pendientes: w.stats.solicitudesPending,
    "Tasa de Aprobación (%)": w.stats.approvalRate,
    Activo: w.stats.isActive ? "Sí" : "No",
    "Última Actividad": w.stats.lastActivity || "Sin actividad",
  }));

  const csv = toCsv(rows);
  const date = new Date().toISOString().split("T")[0];
  downloadCsv(csv, `${companyName}_trabajadores_${date}.csv`);
}
