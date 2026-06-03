"use client";

import { ComparisonSummary } from "@/hooks/useProposalComparison";
import { Trophy, TrendingDown, Percent, BarChart3 } from "lucide-react";
import { ProfessionalMetricsCard } from "./ProfessionalMetricsCard";

interface Props {
  summary: ComparisonSummary;
}

export function ComparisonSummaryCards({ summary }: Props) {
  const cards = [
    {
      label: "Tasa de Éxito",
      subtitle: `${summary.totalWins} de ${summary.totalProposals} ganadas`,
      value: `${summary.winRate.toFixed(1)}%`,
      icon: Trophy,
      variant: "success" as const,
    },
    {
      label: "Dif. Amortización Prom.",
      subtitle: `${summary.proposalsWithComparison} propuestas comparadas`,
      value: `${summary.avgAmortizationDiff > 0 ? "+" : ""}${summary.avgAmortizationDiff.toFixed(2)}%`,
      icon: BarChart3,
      variant: "info" as const,
    },
    {
      label: "Dif. Tasa de Interés Prom.",
      subtitle: "Puntos porcentuales vs aceptada",
      value: `${summary.avgInterestRateDiff > 0 ? "+" : ""}${summary.avgInterestRateDiff.toFixed(2)} pp`,
      icon: Percent,
      variant: "warning" as const,
    },
    {
      label: "Dif. Monto Prom.",
      subtitle: "Tu monto vs el aceptado",
      value: `${summary.avgAmountDiff > 0 ? "+" : ""}${summary.avgAmountDiff.toFixed(2)}%`,
      icon: TrendingDown,
      variant: "primary" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {cards.map((card) => (
        <ProfessionalMetricsCard
          key={card.label}
          title={card.label}
          subtitle={card.subtitle}
          value={card.value}
          icon={card.icon}
          variant={card.variant}
        />
      ))}
    </div>
  );
}
