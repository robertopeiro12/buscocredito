"use client";

import { useRef } from "react";
import { Line } from "react-chartjs-2";
import { ProposalComparisonItem } from "@/hooks/useProposalComparison";

interface Props {
  comparisons: ProposalComparisonItem[];
}

export function AmortizationComparisonChart({ comparisons }: Props) {
  // Unified filter: same set as InterestRateComparisonChart so "#N" always refers to the same proposal
  const withComparison = comparisons.filter(
    (c) => c.hasAccepted && !c.adminWon
  );

  // Ref updated every render — prevents stale closures in Chart.js tooltip callbacks
  const ref = useRef(withComparison);
  ref.current = withComparison;

  if (withComparison.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <p className="text-sm font-semibold text-gray-700 mb-1">Diferencia de Amortización</p>
        <p className="text-sm text-gray-400">
          Aparecerán cuando haya solicitudes con propuestas aceptadas por otras empresas.
        </p>
      </div>
    );
  }

  const data = withComparison.map((c) => c.amortizationDiff);
  const validData = data.filter((v): v is number => v !== null);
  const avgDiff = validData.length > 0
    ? validData.reduce((a, b) => a + b, 0) / validData.length
    : 0;

  const chartData = {
    labels: withComparison.map((c) => `#${c.proposalIndex}`),
    datasets: [
      {
        label: "Diferencia de Amortización (%)",
        data,
        borderColor: "rgb(99, 102, 241)",
        backgroundColor: "rgba(99, 102, 241, 0.08)",
        borderWidth: 2.5,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: data.map((v) =>
          v === null ? "#94a3b8" : v > 0 ? "rgb(244, 63, 94)" : "rgb(16, 185, 129)"
        ),
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
            if (context.raw === null) return "Diferencia: N/D";
            const val = context.raw as number;
            return `Diferencia: ${val > 0 ? "+" : ""}${val.toFixed(2)}%`;
          },
          afterLabel: (context: any) => {
            const label = context.label || "";
            const propIdx = parseInt(label.replace("#", "")) || 0;
            const item = ref.current.find((c) => c.proposalIndex === propIdx);
            if (!item) return [];
            return [
              `Tu amortización: $${item.adminAmortization.toLocaleString("es-MX")}`,
              item.acceptedAmortization !== null
                ? `Aceptada: $${item.acceptedAmortization.toLocaleString("es-MX")}`
                : "Aceptada: N/D",
            ];
          },
        },
      },
    },
    scales: {
      y: {
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
        <p className="text-sm font-semibold text-gray-700">Diferencia de Amortización</p>
        <div className="flex items-center gap-4 mt-1.5">
          <span className="text-[11px] text-gray-400">
            Promedio:&nbsp;
            <span className={`font-semibold ${avgDiff > 0 ? "text-rose-500" : "text-emerald-500"}`}>
              {avgDiff > 0 ? "+" : ""}{avgDiff.toFixed(2)}%
            </span>
          </span>
          <span className="text-[11px] text-gray-400">
            Negativo = tu amortización fue <span className="text-emerald-600 font-medium">menor que la aceptada</span> (favorable)
          </span>
        </div>
      </div>

      <div className="h-72">
        <Line data={chartData} options={options as any} />
      </div>
    </div>
  );
}
