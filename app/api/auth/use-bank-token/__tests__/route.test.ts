import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";

vi.mock("@/db/FirebaseAdmin", () => ({
  initAdmin: vi.fn().mockResolvedValue(undefined),
}));

const mockGet = vi.fn();
const mockLimit = vi.fn().mockReturnValue({ get: mockGet });
const mockWhereUsed = vi.fn().mockReturnValue({ limit: mockLimit });
const mockWhereToken = vi.fn().mockReturnValue({ where: mockWhereUsed });

const mockUpdate = vi.fn().mockResolvedValue(undefined);
const mockDoc = vi.fn().mockReturnValue({ update: mockUpdate });

const mockCollection = vi.fn().mockReturnValue({
  where: mockWhereToken,
  doc: mockDoc,
});

// La transacción: leer y escribir tienen que ser una sola operación indivisible,
// o dos peticiones simultáneas pueden quemar el mismo token dos veces.
const mockTxGet = vi.fn();
const mockTxUpdate = vi.fn();
const mockRunTransaction = vi.fn(async (fn: any) =>
  fn({ get: mockTxGet, update: mockTxUpdate })
);

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collection: (...args: any[]) => mockCollection(...args),
    runTransaction: (fn: any) => mockRunTransaction(fn),
  }),
}));

function createRequest(body: any): NextRequest {
  return new NextRequest("http://localhost:3000/api/auth/use-bank-token", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function tokenEncontrado() {
  mockTxGet.mockResolvedValue({
    empty: false,
    docs: [
      { id: "token-doc-1", ref: { id: "token-doc-1" }, data: () => ({}) },
    ],
  });
}

function tokenNoEncontrado() {
  mockTxGet.mockResolvedValue({ empty: true, docs: [] });
}

describe("POST /api/auth/use-bank-token — quemar token de alta de empresa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validación de entrada", () => {
    it("responde 400 si falta el token", async () => {
      const res = await POST(createRequest({ usedBy: "user-1" }));

      expect(res.status).toBe(400);
      expect(mockTxUpdate).not.toHaveBeenCalled();
    });

    it("responde 400 si falta usedBy", async () => {
      const res = await POST(createRequest({ token: "token-bueno" }));

      expect(res.status).toBe(400);
      expect(mockTxUpdate).not.toHaveBeenCalled();
    });
  });

  describe("token inválido o ya usado", () => {
    it("responde 400 y no escribe nada", async () => {
      tokenNoEncontrado();

      const res = await POST(
        createRequest({ token: "token-quemado", usedBy: "user-1" })
      );

      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(mockTxUpdate).not.toHaveBeenCalled();
    });

    it("solo busca entre tokens sin usar", async () => {
      tokenNoEncontrado();

      await POST(createRequest({ token: "token-x", usedBy: "user-1" }));

      expect(mockWhereToken).toHaveBeenCalledWith("token", "==", "token-x");
      expect(mockWhereUsed).toHaveBeenCalledWith("used", "==", false);
    });
  });

  describe("camino feliz", () => {
    it("marca el token como usado y registra quién lo usó", async () => {
      tokenEncontrado();

      const res = await POST(
        createRequest({
          token: "token-bueno",
          usedBy: "user-1",
          companyName: "Banco Azteca",
        })
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);

      const [, payload] = mockTxUpdate.mock.calls[0];
      expect(payload.used).toBe(true);
      expect(payload.usedBy).toBe("user-1");
      expect(payload.usedByCompany).toBe("Banco Azteca");
      expect(payload.usedAt).toBeInstanceOf(Date);
    });

    it("acepta que no venga companyName y lo guarda como null", async () => {
      tokenEncontrado();

      const res = await POST(
        createRequest({ token: "token-bueno", usedBy: "user-1" })
      );

      expect(res.status).toBe(200);
      const [, payload] = mockTxUpdate.mock.calls[0];
      expect(payload.usedByCompany).toBeNull();
    });
  });

  describe("atomicidad", () => {
    it("lee y escribe dentro de una transacción", async () => {
      mockTxGet.mockResolvedValue({
        empty: false,
        docs: [{ id: "token-doc-1", ref: { id: "token-doc-1" }, data: () => ({}) }],
      });

      await POST(
        createRequest({ token: "token-bueno", usedBy: "user-1" })
      );

      // Sin transacción, dos peticiones simultáneas pasan ambas el filtro
      // used == false antes de que cualquiera escriba, y el token se quema dos veces.
      expect(mockRunTransaction).toHaveBeenCalled();
      expect(mockTxUpdate).toHaveBeenCalled();
      // La escritura NO debe salir por fuera de la transacción
      expect(mockUpdate).not.toHaveBeenCalled();
    });
  });

  it("responde 500 si la escritura falla", async () => {
    tokenEncontrado();
    mockRunTransaction.mockRejectedValueOnce(new Error("Firestore caído"));

    const res = await POST(
      createRequest({ token: "token-bueno", usedBy: "user-1" })
    );

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
  });
});
