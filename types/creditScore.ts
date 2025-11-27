// Tipos para el sistema de score crediticio

export interface CreditScore {
  score: number;           // 413-754
  classification: string;  // "Alto Riesgo", "Regular", "Bueno", "Excelente"
}

export interface CreditScoreColors {
  background: string;
  text: string;
  border: string;
}

export type CreditScoreClassification = 
  | "Alto Riesgo" 
  | "Regular" 
  | "Bueno" 
  | "Excelente";

export interface CreditScoreRange {
  min: number;
  max: number;
  classification: CreditScoreClassification;
  colors: CreditScoreColors;
}