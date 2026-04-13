import { describe, it, expect } from "vitest";
import {
  validateRequiredFields,
  validateEmail,
  validateAmount,
  validatePaymentFrequency,
  validateLoanStatus,
  validateUserType,
  BusinessValidators,
} from "../validation";

describe("validateRequiredFields", () => {
  it("retorna válido cuando todos los campos están presentes", () => {
    const data = { name: "Juan", email: "j@test.com" };
    const result = validateRequiredFields(data, ["name", "email"]);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("retorna inválido cuando faltan campos", () => {
    const data = { name: "Juan" };
    const result = validateRequiredFields(data, ["name", "email"]);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("email es requerido");
    expect(result.missingFields).toContain("email");
  });

  it("rechaza strings vacíos", () => {
    const data = { name: "  " };
    const result = validateRequiredFields(data, ["name"]);
    expect(result.isValid).toBe(false);
  });
});

describe("validateEmail", () => {
  it("acepta email válido", () => {
    expect(validateEmail("test@example.com")).toBe(true);
  });

  it("rechaza email sin @", () => {
    expect(validateEmail("testexample.com")).toBe(false);
  });

  it("rechaza email sin dominio", () => {
    expect(validateEmail("test@")).toBe(false);
  });
});

describe("validateAmount", () => {
  it("acepta número positivo", () => {
    expect(validateAmount(100)).toBe(true);
    expect(validateAmount("500")).toBe(true);
  });

  it("rechaza 0 y negativos", () => {
    expect(validateAmount(0)).toBe(false);
    expect(validateAmount(-10)).toBe(false);
  });

  it("rechaza no numéricos", () => {
    expect(validateAmount("abc")).toBe(false);
    expect(validateAmount(null)).toBe(false);
  });
});

describe("validatePaymentFrequency", () => {
  it("acepta frecuencias válidas", () => {
    expect(validatePaymentFrequency("mensual")).toBe(true);
    expect(validatePaymentFrequency("quincenal")).toBe(true);
    expect(validatePaymentFrequency("semanal")).toBe(true);
  });

  it("rechaza frecuencias inválidas", () => {
    expect(validatePaymentFrequency("diario")).toBe(false);
    expect(validatePaymentFrequency("")).toBe(false);
  });
});

describe("validateLoanStatus", () => {
  it("acepta estados válidos", () => {
    expect(validateLoanStatus("pending")).toBe(true);
    expect(validateLoanStatus("approved")).toBe(true);
    expect(validateLoanStatus("rejected")).toBe(true);
  });

  it("rechaza estados inválidos", () => {
    expect(validateLoanStatus("cancelled")).toBe(false);
  });
});

describe("validateUserType — roles normalizados", () => {
  it("acepta los nuevos roles normalizados", () => {
    expect(validateUserType("borrower")).toBe(true);
    expect(validateUserType("lender")).toBe(true);
    expect(validateUserType("companyAdmin")).toBe(true);
    expect(validateUserType("superAdmin")).toBe(true);
  });

  it("rechaza los roles viejos", () => {
    expect(validateUserType("user")).toBe(false);
    expect(validateUserType("b_sale")).toBe(false);
    expect(validateUserType("b_admin")).toBe(false);
    expect(validateUserType("super_admin")).toBe(false);
  });
});

describe("BusinessValidators.loanRequest", () => {
  it("acepta solicitud válida", () => {
    const data = {
      amount: 100000,
      income: 30000,
      term: "12 meses",
      payment: "mensual",
      purpose: "Personal",
      type: "consumo",
    };
    const result = BusinessValidators.loanRequest(data);
    expect(result.isValid).toBe(true);
  });

  it("rechaza solicitud sin monto", () => {
    const data = {
      income: 30000,
      term: "12 meses",
      payment: "mensual",
      purpose: "Personal",
      type: "consumo",
    };
    const result = BusinessValidators.loanRequest(data);
    expect(result.isValid).toBe(false);
  });

  it("rechaza monto negativo", () => {
    const data = {
      amount: -5000,
      income: 30000,
      term: "12 meses",
      payment: "mensual",
      purpose: "Personal",
      type: "consumo",
    };
    const result = BusinessValidators.loanRequest(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("El monto debe ser un número mayor a 0");
  });

  it("rechaza frecuencia de pago inválida", () => {
    const data = {
      amount: 100000,
      income: 30000,
      term: "12 meses",
      payment: "diario",
      purpose: "Personal",
      type: "consumo",
    };
    const result = BusinessValidators.loanRequest(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Frecuencia de pago inválida");
  });
});

describe("BusinessValidators.proposal — campos normalizados", () => {
  it("acepta propuesta válida con campos camelCase", () => {
    const data = {
      amount: 100000,
      interestRate: 15.5,
      deadline: 12,
      amortizationFrequency: "mensual",
    };
    const result = BusinessValidators.proposal(data);
    expect(result.isValid).toBe(true);
  });

  it("rechaza propuesta sin interestRate (nuevo nombre)", () => {
    const data = {
      amount: 100000,
      deadline: 12,
      amortizationFrequency: "mensual",
    };
    const result = BusinessValidators.proposal(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("interestRate es requerido");
  });

  it("rechaza propuesta sin amortizationFrequency (nuevo nombre)", () => {
    const data = {
      amount: 100000,
      interestRate: 15.5,
      deadline: 12,
    };
    const result = BusinessValidators.proposal(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("amortizationFrequency es requerido");
  });

  it("rechaza frecuencia de amortización inválida", () => {
    const data = {
      amount: 100000,
      interestRate: 15.5,
      deadline: 12,
      amortizationFrequency: "bimestral",
    };
    const result = BusinessValidators.proposal(data);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain("Frecuencia de amortización inválida");
  });
});

describe("BusinessValidators.notification", () => {
  it("acepta notificación válida", () => {
    const data = {
      recipientId: "uid123",
      type: "nueva_propuesta",
      title: "Titulo",
      message: "Mensaje",
    };
    const result = BusinessValidators.notification(data);
    expect(result.isValid).toBe(true);
  });

  it("rechaza notificación sin recipientId", () => {
    const data = { type: "nueva_propuesta", title: "T", message: "M" };
    const result = BusinessValidators.notification(data);
    expect(result.isValid).toBe(false);
  });
});
