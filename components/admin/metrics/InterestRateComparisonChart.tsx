"use client";

import { Line } from "react-chartjs-2";
import { ProposalComparisonItem } from "@/hooks/useProposalComparison";

interface Props {
  comparisons: ProposalComparisonItem[];
  companyName: string;
}

export function InterestRateComparisonChart({ comparisons, companyName }: Props) {
  // Filter to proposals with accepted comparisons
  const withComparison = comparisons.filter(
    (c) => c.hasAccepted && !c.adminWon && c.acceptedInterestRate !== null
  );

  if (withComparison.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Tasa de Interés: Tu Propuesta vs Aceptada
        </h3>
        <p className="text-sm text-gray-500">
          No hay datos de comparación disponibles.
        </p>
      </div>
    );
  }

  const labels = withComparison.map((c) => `#${c.proposalIndex}`);

  const chartData = {
    labels,
    datasets: [
      {
        label: `Propuesta Aceptada`,
        data: withComparison.map((c) => c.acceptedInterestRate || 0),
        borderColor: "rgb(17, 24, 39)",
        backgroundColor: "rgba(17, 24, 39, 0.05)",
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: "rgb(17, 24, 39)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: false,
      },
      {
        label: companyName || "Tu Propuesta",
        data: withComparison.map((c) => c.adminInterestRate),
        borderColor: "rgb(14, 58, 69)",
        backgroundColor: "rgba(14, 58, 69, 0.05)",
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: "rgb(14, 58, 69)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle" as const,
          padding: 20,
          font: { size: 12, family: "'Inter', sans-serif", weight: "500" as const },
          color: "#475569",
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1f2937",
        bodyColor: "#4b5563",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
          },
          afterBody: (contexts: any[]) => {
            const idx = contexts[0]?.dataIndex;
            if (idx === undefined) return [];
            const item = withComparison[idx];
            const diff = item.interestRateDiff;
            if (diff === null) return [];
            const sign = diff > 0 ? "+" : "";
            return [`Diferencia: ${sign}${diff.toFixed(2)} pp`];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Tasa (%)",
          font: { size: 12, family: "'Inter', sans-serif", weight: "600" as const },
          color: "#64748b",
        },
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

  // Calculate averages
  const avgAdmin =
    withComparison.reduce((s, c) => s + c.adminInterestRate, 0) / withComparison.length;
  const avgAccepted =
    withComparison.reduce((s, c) => s + (c.acceptedInterestRate || 0), 0) / withComparison.length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Tasa de Interés: Tu Propuesta vs Aceptada
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Comparación directa por cada solicitud competida
          </p>
        </div>
        <div className="flex gap-6 text-right">
          <div>
            <p className="text-lg font-bold text-[#0e3a45]">
              {avgAdmin.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500">Tu promedio</p>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">
              {avgAccepted.toFixed(2)}%
            </p>
            <p className="text-xs text-gray-500">Aceptada prom.</p>
          </div>
        </div>
      </div>
      <div className="h-72">
        <Line data={chartData} options={options as any} />
      </div>
    </div>
  );
}
