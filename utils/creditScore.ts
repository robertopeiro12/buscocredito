import { CreditScore, CreditScoreClassification, CreditScoreRange } from "@/types/creditScore";

// Definir los rangos según la clasificación oficial
const SCORE_RANGES: CreditScoreRange[] = [
  {
    min: 413,
    max: 586,
    classification: "Alto Riesgo",
    colors: {
      background: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200"
    }
  },
  {
    min: 587,
    max: 667,
    classification: "Regular",
    colors: {
      background: "bg-orange-100",
      text: "text-orange-800", 
      border: "border-orange-200"
    }
  },
  {
    min: 668,
    max: 700,
    classification: "Bueno",
    colors: {
      background: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200"
    }
  },
  {
    min: 701,
    max: 754,
    classification: "Excelente",
    colors: {
      background: "bg-emerald-100",
      text: "text-emerald-800",
      border: "border-emerald-200"
    }
  }
];

/**
 * Clasifica un score en su categoría correspondiente
 */
export function classifyCreditScore(score: number): CreditScoreClassification {
  const range = SCORE_RANGES.find(range => 
    score >= range.min && score <= range.max
  );
  
  return range?.classification || "Alto Riesgo";
}

/**
 * Obtiene los colores para un score específico
 */
export function getCreditScoreColors(score: number) {
  const range = SCORE_RANGES.find(range => 
    score >= range.min && score <= range.max
  );
  
  return range?.colors || SCORE_RANGES[0].colors;
}

/**
 * Genera un score crediticio inicial
 * Por defecto genera 620 (Regular) para todos los nuevos usuarios
 */
export function generateInitialCreditScore(): CreditScore {
  const score = 620; // Score por defecto
  const classification = classifyCreditScore(score);
  
  return {
    score,
    classification
  };
}

/**
 * Valida que un score esté dentro del rango permitido
 */
export function isValidCreditScore(score: number): boolean {
  return score >= 413 && score <= 754;
}

/**
 * Crea un objeto CreditScore completo desde un número
 */
export function createCreditScore(score: number): CreditScore {
  if (!isValidCreditScore(score)) {
    throw new Error(`Score ${score} está fuera del rango válido (413-754)`);
  }
  
  return {
    score,
    classification: classifyCreditScore(score)
  };
}