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
      gradient: "from-green-50 to-emerald-100",
      iconBg: "bg-green-200/50",
      iconColor: "text-green-700",
      textColor: "text-green-900",
      labelColor: "text-green-700",
    },
    {
      label: "Dif. Amortización Prom.",
      value: `${summary.avgAmortizationDiff > 0 ? "+" : ""}${summary.avgAmortizationDiff.toFixed(2)}%`,
      subtitle: `${summary.proposalsWithComparison} propuestas comparadas`,
      icon: BarChart3,
      gradient: "from-blue-50 to-blue-100",
      iconBg: "bg-blue-200/50",
      iconColor: "text-blue-700",
      textColor: "text-blue-900",
      labelColor: "text-blue-700",
    },
    {
      label: "Dif. Tasa de Interés Prom.",
      value: `${summary.avgInterestRateDiff > 0 ? "+" : ""}${summary.avgInterestRateDiff.toFixed(2)} pp`,
      subtitle: "Puntos porcentuales vs aceptada",
      icon: Percent,
      gradient: "from-amber-50 to-yellow-100",
      iconBg: "bg-amber-200/50",
      iconColor: "text-amber-700",
      textColor: "text-amber-900",
      labelColor: "text-amber-700",
    },
    {
      label: "Dif. Monto Prom.",
      value: `${summary.avgAmountDiff > 0 ? "+" : ""}${summary.avgAmountDiff.toFixed(2)}%`,
      subtitle: "Tu monto vs el aceptado",
      icon: TrendingDown,
      gradient: "from-purple-50 to-violet-100",
      iconBg: "bg-purple-200/50",
      iconColor: "text-purple-700",
      textColor: "text-purple-900",
      labelColor: "text-purple-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`bg-gradient-to-br ${card.gradient} rounded-xl p-6 shadow-sm border border-white/50`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`${card.labelColor} font-semibold text-sm uppercase tracking-wide`}>
                {card.label}
              </p>
              <p className={`text-3xl font-bold ${card.textColor} mt-1`}>
                {card.value}
              </p>
              <p className={`text-xs ${card.labelColor} mt-2`}>
                {card.subtitle}
              </p>
            </div>
            <div className={`p-4 ${card.iconBg} rounded-xl`}>
              <card.icon className={`w-8 h-8 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
