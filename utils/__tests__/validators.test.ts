import { describe, it, expect } from "vitest";
import { validateRFC, validateField } from "../validators";
import type { SignupFormData } from "@/types/signup";

// Datos base para pruebas
const baseFormData: SignupFormData = {
  name: "Juan",
  lastName: "Pérez",
  secondLastName: "López",
  rfc: "PELJ900101ABC",
  phone: "525512345678",
  birthday: "1990-01-01",
  email: "juan@example.com",
  password: "Password1",
  confirmPassword: "Password1",
  acceptedTerms: true,
  address: {
    street: "Reforma",
    exteriorNumber: "123",
    interiorNumber: "",
    colony: "Centro",
    city: "CDMX",
    state: "Ciudad de México",
    zipCode: "06600",
    country: "México",
  },
};

describe("validateRFC", () => {
  it("acepta RFC válido de persona física (13 caracteres)", () => {
    const result = validateRFC("PELJ900101ABC");
    expect(result.isValid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("acepta RFC válido de persona moral (12 caracteres)", () => {
    const result = validateRFC("ABC900101AB1");
    expect(result.isValid).toBe(true);
  });

  it("rechaza RFC con longitud incorrecta", () => {
    const result = validateRFC("PELJ9001");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("caracteres");
  });

  it("rechaza RFC con formato inválido", () => {
    const result = validateRFC("1234567890123");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("Formato de RFC inválido");
  });

  it("rechaza RFC con fecha inválida (mes 13)", () => {
    const result = validateRFC("PELJ901301ABC");
    expect(result.isValid).toBe(false);
    expect(result.error).toBe("La fecha en el RFC es inválida");
  });

  it("convierte a mayúsculas automáticamente", () => {
    const result = validateRFC("pelj900101abc");
    expect(result.isValid).toBe(true);
  });

  it("maneja espacios en blanco", () => {
    const result = validateRFC("  PELJ900101ABC  ");
    expect(result.isValid).toBe(true);
  });
});

describe("validateField", () => {
  describe("nombre y apellido", () => {
    it("rechaza nombre vacío", () => {
      const error = validateField("name", "", baseFormData);
      expect(error).toBe("Este campo es requerido");
    });

    it("acepta nombre con acentos", () => {
      const error = validateField("name", "María José", baseFormData);
      expect(error).toBeUndefined();
    });

    it("rechaza nombre con números", () => {
      const error = validateField("name", "Juan123", baseFormData);
      expect(error).toBe("Solo se permiten letras");
    });
  });

  describe("segundo apellido (opcional)", () => {
    it("acepta segundo apellido vacío", () => {
      const error = validateField("secondLastName", "", baseFormData);
      expect(error).toBeUndefined();
    });

    it("rechaza segundo apellido con números si tiene valor", () => {
      const error = validateField("secondLastName", "López123", baseFormData);
      expect(error).toBe("Solo se permiten letras");
    });
  });

  describe("email", () => {
    it("rechaza email vacío", () => {
      const error = validateField("email", "", baseFormData);
      expect(error).toBe("Email es requerido");
    });

    it("rechaza email sin @", () => {
      const error = validateField("email", "juanexample.com", baseFormData);
      expect(error).toBe("Email inválido");
    });

    it("acepta email válido", () => {
      const error = validateField("email", "juan@example.com", baseFormData);
      expect(error).toBeUndefined();
    });
  });

  describe("contraseña", () => {
    it("rechaza contraseña vacía", () => {
      const error = validateField("password", "", baseFormData);
      expect(error).toBe("Contraseña es requerida");
    });

    it("rechaza contraseña menor a 8 caracteres", () => {
      const error = validateField("password", "Pass1", baseFormData);
      expect(error).toBe("La contraseña debe tener al menos 8 caracteres");
    });

    it("rechaza contraseña sin mayúsculas/números", () => {
      const error = validateField("password", "password", baseFormData);
      expect(error).toBe(
        "La contraseña debe contener mayúsculas, minúsculas y números"
      );
    });

    it("acepta contraseña válida", () => {
      const error = validateField("password", "Password1", baseFormData);
      expect(error).toBeUndefined();
    });
  });

  describe("confirmar contraseña", () => {
    it("rechaza si no coincide", () => {
      const error = validateField("confirmPassword", "OtraPass1", baseFormData);
      expect(error).toBe("Las contraseñas no coinciden");
    });

    it("acepta si coincide", () => {
      const error = validateField(
        "confirmPassword",
        "Password1",
        baseFormData
      );
      expect(error).toBeUndefined();
    });
  });

  describe("código postal", () => {
    it("rechaza código postal vacío", () => {
      const error = validateField("address.zipCode", "", baseFormData);
      expect(error).toBe("Código postal es requerido");
    });

    it("rechaza código postal con menos de 5 dígitos", () => {
      const error = validateField("address.zipCode", "1234", baseFormData);
      expect(error).toBe("El código postal debe tener 5 dígitos");
    });

    it("acepta código postal válido", () => {
      const error = validateField("address.zipCode", "06600", baseFormData);
      expect(error).toBeUndefined();
    });
  });

  describe("fecha de nacimiento", () => {
    it("rechaza menor de 18 años", () => {
      const error = validateField("birthday", "2020-01-01", baseFormData);
      expect(error).toBe("Debes ser mayor de 18 años");
    });

    it("acepta mayor de 18 años", () => {
      const error = validateField("birthday", "1990-01-01", baseFormData);
      expect(error).toBeUndefined();
    });
  });
});
