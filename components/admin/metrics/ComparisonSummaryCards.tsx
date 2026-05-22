"use client";

import { ComparisonSummary } from "@/hooks/useProposalComparison";
import { Trophy, TrendingDown, Percent, BarChart3 } from "lucide-react";

interface Props {
  summary: ComparisonSummary;
}

export function ComparisonSummaryCards({ summary }: Props) {
  const cards = [
    {
      label: "Tasa de Éxito",
      value: `${summary.winRate.toFixed(1)}%`,
      subtitle: `${summary.totalWins} de ${summary.totalProposals} ganadas`,
      icon: Trophy,
    },
    {
      label: "Dif. Amortización Prom.",
      value: `${summary.avgAmortizationDiff > 0 ? "+" : ""}${summary.avgAmortizationDiff.toFixed(2)}%`,
      subtitle: `${summary.proposalsWithComparison} propuestas comparadas`,
      icon: BarChart3,
    },
    {
      label: "Dif. Tasa de Interés Prom.",
      value: `${summary.avgInterestRateDiff > 0 ? "+" : ""}${summary.avgInterestRateDiff.toFixed(2)} pp`,
      subtitle: "Puntos porcentuales vs aceptada",
      icon: Percent,
    },
    {
      label: "Dif. Monto Prom.",
      value: `${summary.avgAmountDiff > 0 ? "+" : ""}${summary.avgAmountDiff.toFixed(2)}%`,
      subtitle: "Tu monto vs el aceptado",
      icon: TrendingDown,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-xl">
              <card.icon className="w-6 h-6 text-gray-500" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
