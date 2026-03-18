"use client";

import { Line } from "react-chartjs-2";
import { ProposalComparisonItem } from "@/hooks/useProposalComparison";

interface Props {
  comparisons: ProposalComparisonItem[];
}

export function AmortizationComparisonChart({ comparisons }: Props) {
  // Filter to only proposals that have a comparison (lost to another company)
  const withComparison = comparisons.filter(
    (c) => c.hasAccepted && !c.adminWon && c.amortizationDiff !== null
  );

  if (withComparison.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Diferencia de Amortización vs Propuesta Aceptada
        </h3>
        <p className="text-sm text-gray-500">
          No hay datos de comparación disponibles. Aparecerán cuando haya
          solicitudes con propuestas aceptadas por otras empresas.
        </p>
      </div>
    );
  }

  const labels = withComparison.map((c) => `#${c.proposalIndex}`);
  const data = withComparison.map((c) => c.amortizationDiff || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Diferencia de Amortización (%)",
        data,
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: data.map((v) =>
          v > 0 ? "rgb(239, 68, 68)" : "rgb(34, 197, 94)"
        ),
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#4b5563",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            const val = context.raw as number;
            const sign = val > 0 ? "+" : "";
            return `Diferencia: ${sign}${val.toFixed(2)}%`;
          },
          afterLabel: (context: any) => {
            const item = withComparison[context.dataIndex];
            return [
              `Tu amortización: $${item.adminAmortization.toLocaleString()}`,
              `Aceptada: $${item.acceptedAmortization?.toLocaleString()}`,
              `Empresa ganadora: ${item.acceptedCompany || "N/A"}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        grid: { color: "rgba(0, 0, 0, 0.05)", borderDash: [3, 3] as number[] },
        ticks: {
          callback: (value: any) => `${value}%`,
          font: { size: 11, family: "'Inter', sans-serif" },
          color: "#64748b",
        },
      },
      x: {
        title: {
          display: true,
          text: "Propuesta",
          font: { size: 12, family: "'Inter', sans-serif", weight: "600" as const },
          color: "#64748b",
        },
        grid: { display: false },
        ticks: {
          font: { size: 11, family: "'Inter', sans-serif" },
          color: "#64748b",
        },
      },
    },
  };

  const avgDiff =
    data.reduce((a, b) => a + b, 0) / data.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Diferencia de Amortización vs Propuesta Aceptada
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Valores negativos = tu amortización fue menor (más competitiva)
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {avgDiff > 0 ? "+" : ""}
            {avgDiff.toFixed(2)}%
          </p>
          <p className="text-xs text-gray-500">Promedio</p>
        </div>
      </div>
      <div className="h-72">
        <Line data={chartData} options={options as any} />
      </div>
    </div>
  );
}
