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
const mockAdd = vi.fn().mockResolvedValue({ id: "solicitud-123" });
const mockCollection = vi.fn().mockReturnValue({ add: mockAdd });
vi.mock("@/app/firebase-admin", () => ({
  adminFirestore: {
    collection: (...args: any[]) => mockCollection(...args),
  },
}));

function createRequest(body: any): NextRequest {
  return new NextRequest("http://localhost:3000/api/loans", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/loans — Crear solicitud de préstamo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza petición sin autenticación", async () => {
    mockVerifyAuth.mockResolvedValue(null);

    const res = await POST(createRequest({ amount: 100000 }));
    expect(res.status).toBe(401);

    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("rechaza si el usuario no es borrower", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "lender-1",
      email: "lender@test.com",
      userType: "lender",
    });

    const res = await POST(
      createRequest({
        amount: 100000,
        income: 30000,
        term: "12 meses",
        payment: "mensual",
        purpose: "Personal",
        type: "consumo",
      })
    );
    expect(res.status).toBe(403);
  });

  it("rechaza solicitud con datos incompletos", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "borrower-1",
      email: "borrower@test.com",
      userType: "borrower",
    });

    const res = await POST(createRequest({ amount: 100000 }));
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.success).toBe(false);
  });

  it("crea solicitud exitosamente con rol borrower", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "borrower-1",
      email: "borrower@test.com",
      userType: "borrower",
    });

    const solicitudData = {
      amount: 100000,
      income: 30000,
      term: "12 meses",
      payment: "mensual",
      purpose: "Personal",
      type: "consumo",
    };

    const res = await POST(createRequest(solicitudData));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.solicitudId).toBe("solicitud-123");

    // Verificar que se guardó con los campos correctos
    expect(mockCollection).toHaveBeenCalledWith("solicitudes");
    const savedData = mockAdd.mock.calls[0][0];
    expect(savedData.userId).toBe("borrower-1");
    expect(savedData.status).toBe("pending");
    expect(savedData.amount).toBe(100000);
    expect(savedData.createdAt).toBeDefined();
  });

  it("rechaza monto inválido (negativo)", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "borrower-1",
      email: "borrower@test.com",
      userType: "borrower",
    });

    const res = await POST(
      createRequest({
        amount: -5000,
        income: 30000,
        term: "12 meses",
        payment: "mensual",
        purpose: "Personal",
        type: "consumo",
      })
    );
    expect(res.status).toBe(400);
  });
});
