import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "../route";

// Mock verifyAuthentication
const mockVerifyAuth = vi.fn();
vi.mock("@/app/api/utils/auth", () => ({
  verifyAuthentication: (...args: any[]) => mockVerifyAuth(...args),
  createUnauthorizedResponse: () =>
    new Response(JSON.stringify({ error: "No autorizado" }), { status: 401 }),
  createForbiddenResponse: () =>
    new Response(JSON.stringify({ error: "Acceso denegado" }), { status: 403 }),
}));

// Mock Firestore
const mockQueryGet = vi.fn();
const mockWhere = vi.fn().mockReturnValue({ get: mockQueryGet });
const mockCollection = vi.fn().mockReturnValue({ where: mockWhere });

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collection: (...args: any[]) => mockCollection(...args),
  }),
}));

function createRequest(): NextRequest {
  return new NextRequest("http://localhost:3000/api/getSubcuentas", {
    method: "GET",
  });
}

describe("GET /api/getSubcuentas — Obtener subcuentas de admin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rechaza petición sin autenticación", async () => {
    mockVerifyAuth.mockResolvedValue(null);

    const res = await GET(createRequest());
    expect(res.status).toBe(401);
  });

  it("rechaza si el usuario no es companyAdmin", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "lender-1",
      email: "lender@test.com",
      userType: "lender",
    });

    const res = await GET(createRequest());
    expect(res.status).toBe(403);
  });

  it("rechaza si el usuario es borrower", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "borrower-1",
      email: "borrower@test.com",
      userType: "borrower",
    });

    const res = await GET(createRequest());
    expect(res.status).toBe(403);
  });

  it("retorna subcuentas con campos normalizados para companyAdmin", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "admin-1",
      email: "admin@test.com",
      userType: "companyAdmin",
    });

    const mockDocs = [
      {
        id: "lender-1",
        data: () => ({
          name: "Juan Prestamista",
          email: "juan@test.com",
          companyName: "Financiera Test",
          type: "lender",
        }),
      },
      {
        id: "lender-2",
        data: () => ({
          name: "Ana Prestamista",
          email: "ana@test.com",
          companyName: "Financiera Test",
          type: "lender",
        }),
      },
    ];

    mockQueryGet.mockResolvedValue({
      forEach: (cb: (doc: any) => void) => mockDocs.forEach(cb),
    });

    const res = await GET(createRequest());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.subcuentas).toHaveLength(2);

    // Verificar que usa campo normalizado 'adminId'
    expect(mockWhere).toHaveBeenCalledWith("adminId", "==", "admin-1");

    // Verificar campos normalizados en respuesta
    expect(body.subcuentas[0].name).toBe("Juan Prestamista");
    expect(body.subcuentas[0].companyName).toBe("Financiera Test");
    expect(body.subcuentas[0].email).toBe("juan@test.com");
  });

  it("retorna array vacío si no hay subcuentas", async () => {
    mockVerifyAuth.mockResolvedValue({
      uid: "admin-1",
      email: "admin@test.com",
      userType: "companyAdmin",
    });

    mockQueryGet.mockResolvedValue({
      forEach: () => {},
    });

    const res = await GET(createRequest());
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.subcuentas).toHaveLength(0);
  });
});
