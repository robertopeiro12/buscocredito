import React from "react";
import { Card, CardBody, Chip } from "@heroui/react";
import { CreditScore } from "@/types/creditScore";
import { getCreditScoreColors } from "@/utils/creditScore";

interface CreditScoreDisplayProps {
  creditScore: CreditScore;
  variant?: "card" | "inline" | "compact";
  className?: string;
}

export const CreditScoreDisplay = ({
  creditScore,
  variant = "card",
  className = "",
}: CreditScoreDisplayProps) => {
  const colors = getCreditScoreColors(creditScore.score);

  // Variant: Inline (para usar en grids de detalles)
  if (variant === "inline") {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <p className="font-medium text-gray-800">{creditScore.score}</p>
        <Chip
          size="sm"
          className={`${colors.background} ${colors.text}`}
          variant="flat"
        >
          {creditScore.classification}
        </Chip>
      </div>
    );
  }

  // Variant: Compact (para usar en cards pequeñas)
  if (variant === "compact") {
    return (
      <div className={`${className}`}>
        <p className="text-sm text-gray-500">Score</p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-lg font-bold text-green-600">
            {creditScore.score}
          </p>
          <Chip
            size="sm"
            className={`${colors.background} ${colors.text}`}
            variant="flat"
          >
            {creditScore.classification}
          </Chip>
        </div>
      </div>
    );
  }

  // Variant: Card (default - para secciones principales)
  return (
    <Card
      className={`bg-white shadow-sm border border-gray-100 hover:border-gray-200 transition-all duration-200 ${className}`}
    >
      <CardBody className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Score Crediticio</p>
            <p className="text-2xl font-bold text-green-600">
              {creditScore.score}
            </p>
          </div>
          <Chip
            className={`${colors.background} ${colors.text}`}
            variant="flat"
          >
            {creditScore.classification}
          </Chip>
        </div>
      </CardBody>
    </Card>
  );
};
