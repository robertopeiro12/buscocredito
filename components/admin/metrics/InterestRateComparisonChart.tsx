"use client";

import { useRef } from "react";
import { Line } from "react-chartjs-2";
import { ProposalComparisonItem } from "@/hooks/useProposalComparison";

interface Props {
  comparisons: ProposalComparisonItem[];
  companyName: string;
}

export function InterestRateComparisonChart({ comparisons, companyName }: Props) {
  // Unified filter: same set as AmortizationComparisonChart so "#N" always refers to the same proposal
  const withComparison = comparisons.filter(
    (c) => c.hasAccepted && !c.adminWon
  );

  // Ref updated every render — prevents stale closures in Chart.js tooltip callbacks
  const ref = useRef(withComparison);
  ref.current = withComparison;

  if (withComparison.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-sm font-semibold text-gray-700 mb-1">Tasa de Interés vs Competencia</p>
        <p className="text-sm text-gray-400">No hay datos de comparación disponibles.</p>
      </div>
    );
  }

  const avgAdmin =
    withComparison.reduce((s, c) => s + c.adminInterestRate, 0) / withComparison.length;
  const avgAccepted =
    withComparison.reduce((s, c) => s + (c.acceptedInterestRate || 0), 0) / withComparison.length;

  const chartData = {
    labels: withComparison.map((c) => `#${c.proposalIndex}`),
    datasets: [
      {
        label: companyName || "Tu Propuesta",
        data: withComparison.map((c) => c.adminInterestRate),
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.08)",
        borderWidth: 2.5,
        tension: 0.4,
        pointBackgroundColor: "rgb(99, 102, 241)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
      },
      {
        label: "Propuesta Aceptada",
        data: withComparison.map((c) => c.acceptedInterestRate ?? null),
        borderColor: "rgb(244, 63, 94)",
        backgroundColor: "rgba(244, 63, 94, 0.06)",
        borderWidth: 2.5,
        tension: 0.4,
        pointBackgroundColor: "rgb(244, 63, 94)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        spanGaps: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        align: "start" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "circle" as const,
          padding: 20,
          font: { size: 11, weight: "500" as const },
          color: "#64748b",
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        titleColor: "#1f2937",
        bodyColor: "#4b5563",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 10,
        callbacks: {
          title: (contexts: any[]) => {
            const label = contexts[0]?.label || "";
            const propIdx = parseInt(label.replace("#", "")) || 0;
            const item = ref.current.find((c) => c.proposalIndex === propIdx);
            if (!item) return label;
            return `${label} · ${item.requestType || item.requestPurpose || "Sin tipo"}`;
          },
          label: (context: any) => {
            const label = context.label || "";
            const propIdx = parseInt(label.replace("#", "")) || 0;
            const item = ref.current.find((c) => c.proposalIndex === propIdx);
            const rate = context.raw !== null ? `${(context.raw as number).toFixed(2)}%` : "N/D";
            if (!item) return `${context.dataset.label}: ${rate}`;
            // Show each dataset's own amount — they differ between admin and accepted proposals
            const monto = context.datasetIndex === 0
              ? `$${item.adminAmount.toLocaleString("es-MX")}`
              : `$${(item.acceptedAmount ?? 0).toLocaleString("es-MX")}`;
            return `${context.dataset.label}: ${rate} · ${monto}`;
          },
          afterBody: (contexts: any[]) => {
            const label = contexts[0]?.label || "";
            const propIdx = parseInt(label.replace("#", "")) || 0;
            const item = ref.current.find((c) => c.proposalIndex === propIdx);
            if (!item || item.interestRateDiff === null) return [];
            const diff = item.interestRateDiff;
            return [`Diferencia: ${diff > 0 ? "+" : ""}${diff.toFixed(2)} pp`];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "rgba(0,0,0,0.04)", borderDash: [3, 3] as number[] },
        ticks: {
          callback: (value: any) => `${value}%`,
          font: { size: 10 },
          color: "#94a3b8",
        },
      },
      x: {
        grid: { display: false },
        ticks: {
          font: { size: 10 },
          color: "#94a3b8",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-4">
        <p className="text-sm font-semibold text-gray-700">Tasa de Interés vs Competencia</p>
        <div className="flex items-center gap-4 mt-1.5">
          <span className="text-[11px] text-gray-400">
            Tu prom:&nbsp;
            <span className="font-semibold text-indigo-500">{avgAdmin.toFixed(2)}%</span>
          </span>
          <span className="text-[11px] text-gray-400">
            Aceptada prom:&nbsp;
            <span className="font-semibold text-rose-500">{avgAccepted.toFixed(2)}%</span>
          </span>
        </div>
      </div>

      <div className="h-72">
        <Line data={chartData} options={options as any} />
      </div>
    </div>
  );
}
