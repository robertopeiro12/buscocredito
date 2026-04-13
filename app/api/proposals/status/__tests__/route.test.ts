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

// Mock Firestore batch operations
const mockBatchUpdate = vi.fn();
const mockBatchCommit = vi.fn().mockResolvedValue(undefined);
const mockBatch = vi.fn().mockReturnValue({
  update: mockBatchUpdate,
  commit: mockBatchCommit,
});

const mockUpdate = vi.fn();
const mockDocGet = vi.fn();
const mockDocRef = { update: mockUpdate };
const mockDoc = vi.fn().mockReturnValue({ get: mockDocGet, update: mockUpdate });

const mockWhereGet = vi.fn();
const mockWhereStatus = vi.fn().mockReturnValue({ get: mockWhereGet });
const mockWhere = vi.fn().mockReturnValue({ where: mockWhereStatus });

const mockCollection = vi.fn().mockReturnValue({
  doc: mockDoc,
  where: mockWhere,
});

vi.mock("@/db/FirebaseAdmin", () => ({
  initAdmin: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collection: (...args: any[]) => mockCollection(...args),
    batch: mockBatch,
  }),
}));

function createRequest(body: any): NextRequest {
  return new NextRequest("http://localhost:3000/api/proposals/status", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/proposals/status — Aceptar/rechazar propuesta", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza petición sin autenticación", async () => {
    mockVerifyAuth.mockResolvedValue(null);

    const res = await POST(
      createRequest({
        proposalId: "prop-1",
        loanId: "loan-1",
        status: "accepted",
      })
    );
    expect(res.status).toBe(401);
  });

  it("rechaza si faltan campos requeridos", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "borrower-1",
      email: "b@test.com",
      userType: "borrower",
    });

    const res = await POST(createRequest({ proposalId: "prop-1" }));
    expect(res.status).toBe(400);
  });

  it("rechaza si la solicitud no existe", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "borrower-1",
      email: "b@test.com",
      userType: "borrower",
    });

    mockDocGet.mockResolvedValue({ exists: false });

    const res = await POST(
      createRequest({
        proposalId: "prop-1",
        loanId: "loan-1",
        status: "accepted",
      })
    );
    expect(res.status).toBe(404);
  });

  it("rechaza si el usuario no es dueño de la solicitud", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "borrower-2",
      email: "b2@test.com",
      userType: "borrower",
    });

    mockDocGet.mockResolvedValue({
      exists: true,
      data: () => ({ userId: "borrower-1" }),
    });

    const res = await POST(
      createRequest({
        proposalId: "prop-1",
        loanId: "loan-1",
        status: "accepted",
      })
    );
    expect(res.status).toBe(403);
  });

  it("acepta propuesta exitosamente y rechaza las demás", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "borrower-1",
      email: "b@test.com",
      userType: "borrower",
    });

    // Solicitud pertenece al borrower
    mockDocGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ userId: "borrower-1", purpose: "Personal", type: "consumo" }),
    });

    // Otras propuestas pendientes
    mockWhereGet.mockResolvedValue({
      docs: [
        { id: "prop-1", ref: { id: "prop-1" }, data: () => ({}) },
        { id: "prop-2", ref: { id: "prop-2" }, data: () => ({}) },
      ],
    });

    // Propuesta ganadora
    mockDocGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        lenderId: "lender-1",
        amount: 100000,
        interestRate: 15,
        amortizationFrequency: "mensual",
        amortization: 9000,
        deadline: 12,
        comision: 2000,
        medicalBalance: 500,
      }),
    });

    const res = await POST(
      createRequest({
        proposalId: "prop-1",
        loanId: "loan-1",
        status: "accepted",
      })
    );
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);

    // Verificar que batch.commit fue llamado
    expect(mockBatchCommit).toHaveBeenCalled();
  });
});
