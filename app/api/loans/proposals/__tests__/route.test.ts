import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";

// Mock verifyAuthentication
const mockVerifyAuth = vi.fn();
vi.mock("@/app/api/utils/auth", () => ({
  verifyAuthentication: (...args: any[]) => mockVerifyAuth(...args),
  createUnauthorizedResponse: () =>
    new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 }),
  createForbiddenResponse: () =>
    new Response(JSON.stringify({ error: "Acceso denegado" }), { status: 403 }),
}));

// Mock adminFirestore
const mockAdd = vi.fn().mockResolvedValue({ id: "propuesta-456" });
const mockGet = vi.fn();
const mockDoc = vi.fn().mockReturnValue({ get: mockGet });
const mockCollection = vi.fn().mockReturnValue({
  doc: mockDoc,
  add: mockAdd,
});
vi.mock("@/app/firebase-admin", () => ({
  adminFirestore: {
    collection: (...args: any[]) => mockCollection(...args),
  },
}));

function createRequest(body: any): NextRequest {
  return new NextRequest("http://localhost:3000/api/loans/proposals", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const validProposal = {
  solicitudId: "sol-001",
  userId: "borrower-1",
  amount: 100000,
  interestRate: 15.5,
  deadline: 12,
  amortizationFrequency: "mensual",
  amortization: 9000,
  comision: 2000,
  medicalBalance: 500,
  company: "Financiera Test",
};

describe("POST /api/loans/proposals — Crear propuesta de crédito", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza petición sin autenticación", async () => {
    mockVerifyAuth.mockResolvedValue(null);

    const res = await POST(createRequest(validProposal));
    expect(res.status).toBe(401);
  });

  it("rechaza si el usuario no es lender", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "borrower-1",
      email: "borrower@test.com",
      userType: "borrower",
    });

    const res = await POST(createRequest(validProposal));
    expect(res.status).toBe(403);
  });

  it("rechaza si el usuario es companyAdmin (no lender)", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "admin-1",
      email: "admin@test.com",
      userType: "companyAdmin",
    });

    const res = await POST(createRequest(validProposal));
    expect(res.status).toBe(403);
  });

  it("rechaza propuesta sin solicitudId", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "lender-1",
      email: "lender@test.com",
      userType: "lender",
    });

    const { solicitudId, ...noSolId } = validProposal;
    const res = await POST(createRequest(noSolId));
    expect(res.status).toBe(400);
  });

  it("rechaza propuesta sin interestRate", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "lender-1",
      email: "lender@test.com",
      userType: "lender",
    });

    const { interestRate, ...noRate } = validProposal;
    const res = await POST(createRequest(noRate));
    expect(res.status).toBe(400);
  });

  it("rechaza si la solicitud no existe", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "lender-1",
      email: "lender@test.com",
      userType: "lender",
    });

    mockGet.mockResolvedValue({ exists: false });

    const res = await POST(createRequest(validProposal));
    expect(res.status).toBe(404);
  });

  it("rechaza si la solicitud ya no está pending", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "lender-1",
      email: "lender@test.com",
      userType: "lender",
    });

    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({ status: "approved", userId: "borrower-1" }),
    });

    const res = await POST(createRequest(validProposal));
    expect(res.status).toBe(409);
  });

  it("crea propuesta exitosamente con rol lender", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "lender-1",
      email: "lender@test.com",
      userType: "lender",
    });

    mockGet.mockResolvedValue({
      exists: true,
      data: () => ({
        status: "pending",
        userId: "borrower-1",
        purpose: "Personal",
        type: "consumo",
      }),
    });

    const res = await POST(createRequest(validProposal));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.propuestaId).toBe("propuesta-456");

    // Verificar que se guardó en la colección correcta
    expect(mockCollection).toHaveBeenCalledWith("propuestas");

    // Verificar que el lenderId se asignó del usuario autenticado
    const savedData = mockAdd.mock.calls[0][0];
    expect(savedData.lenderId).toBe("lender-1");
    expect(savedData.createdAt).toBeDefined();
  });
});
