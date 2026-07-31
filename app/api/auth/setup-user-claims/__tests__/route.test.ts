import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../route";

const mockVerifyIdToken = vi.fn();
vi.mock("firebase-admin/auth", () => ({
  getAuth: () => ({
    verifyIdToken: (...args: any[]) => mockVerifyIdToken(...args),
  }),
}));

vi.mock("@/db/FirebaseAdmin", () => ({
  initAdmin: vi.fn().mockResolvedValue(undefined),
}));

const mockUserDocGet = vi.fn();
const mockUserDocUpdate = vi.fn().mockResolvedValue(undefined);
const mockDoc = vi.fn().mockReturnValue({
  get: mockUserDocGet,
  update: mockUserDocUpdate,
});
const mockCollection = vi.fn().mockReturnValue({ doc: mockDoc });

vi.mock("@/app/firebase-admin", () => ({
  adminFirestore: {
    collection: (...args: any[]) => mockCollection(...args),
  },
}));

const mockOnUserCreated = vi.fn();
vi.mock("@/db/AuthManager", () => ({
  onUserCreated: (...args: any[]) => mockOnUserCreated(...args),
}));

function createRequest(
  body: any,
  opts: { cookie?: string; bearer?: string } = {}
): NextRequest {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (opts.cookie) headers["cookie"] = `auth-token=${opts.cookie}`;
  if (opts.bearer) headers["Authorization"] = `Bearer ${opts.bearer}`;

  return new NextRequest("http://localhost:3000/api/auth/setup-user-claims", {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  });
}

const validUserData = { name: "Roberto", email: "r@test.com" };

describe("POST /api/auth/setup-user-claims — asignación de rol", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnUserCreated.mockResolvedValue({ success: true });
  });

  describe("autenticación", () => {
    it("rechaza petición sin cookie ni Bearer", async () => {
      const res = await POST(
        createRequest({ userId: "user-1", userData: validUserData })
      );
      expect(res.status).toBe(401);
    });

    it("rechaza petición con token inválido", async () => {
      mockVerifyIdToken.mockRejectedValue(new Error("token expirado"));

      const res = await POST(
        createRequest(
          { userId: "user-1", userData: validUserData },
          { cookie: "token-basura" }
        )
      );
      expect(res.status).toBe(401);
    });

    it("acepta autenticación por Bearer cuando no hay cookie", async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: "user-1" });
      mockUserDocGet.mockResolvedValue({
        exists: true,
        data: () => ({ type: "borrower" }),
      });

      const res = await POST(
        createRequest(
          { userId: "user-1", userData: validUserData },
          { bearer: "token-bueno" }
        )
      );
      expect(res.status).toBe(200);
    });
  });

  describe("autorización", () => {
    it("impide configurar los claims de OTRO usuario", async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: "atacante-1" });

      const res = await POST(
        createRequest(
          { userId: "victima-1", userData: validUserData },
          { cookie: "token-bueno" }
        )
      );

      expect(res.status).toBe(403);
      // El guard debe cortar ANTES de tocar Firestore o asignar claims
      expect(mockOnUserCreated).not.toHaveBeenCalled();
    });
  });

  describe("el tipo de usuario viene de Firestore, nunca del cliente", () => {
    it("ignora un type inyectado en el body y usa el de Firestore", async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: "user-1" });
      mockUserDocGet.mockResolvedValue({
        exists: true,
        data: () => ({ type: "borrower" }),
      });

      const res = await POST(
        createRequest(
          {
            userId: "user-1",
            // El cliente intenta escalar privilegios
            userData: { ...validUserData, type: "superAdmin" },
          },
          { cookie: "token-bueno" }
        )
      );

      expect(res.status).toBe(200);

      const [, payload] = mockOnUserCreated.mock.calls[0];
      expect(payload.type).toBe("borrower");
      expect(payload.type).not.toBe("superAdmin");

      const body = await res.json();
      expect(body.data.userType).toBe("borrower");
    });
  });

  describe("estado del usuario en Firestore", () => {
    it("responde 404 si el usuario no existe en cuentas", async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: "user-1" });
      mockUserDocGet.mockResolvedValue({ exists: false });

      const res = await POST(
        createRequest(
          { userId: "user-1", userData: validUserData },
          { cookie: "token-bueno" }
        )
      );

      expect(res.status).toBe(404);
      expect(mockOnUserCreated).not.toHaveBeenCalled();
    });

    it("responde 400 si el documento no tiene type", async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: "user-1" });
      mockUserDocGet.mockResolvedValue({
        exists: true,
        data: () => ({ name: "Roberto" }),
      });

      const res = await POST(
        createRequest(
          { userId: "user-1", userData: validUserData },
          { cookie: "token-bueno" }
        )
      );

      expect(res.status).toBe(400);
      expect(mockOnUserCreated).not.toHaveBeenCalled();
    });
  });

  describe("validación de campos", () => {
    it("responde 400 si falta userData", async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: "user-1" });

      const res = await POST(
        createRequest({ userId: "user-1" }, { cookie: "token-bueno" })
      );
      expect(res.status).toBe(400);
    });

    it("responde 400 si userData no trae email", async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: "user-1" });

      const res = await POST(
        createRequest(
          { userId: "user-1", userData: { name: "Roberto" } },
          { cookie: "token-bueno" }
        )
      );
      expect(res.status).toBe(400);
    });
  });

  describe("camino feliz", () => {
    it("asigna claims y actualiza el timestamp", async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: "user-1" });
      mockUserDocGet.mockResolvedValue({
        exists: true,
        data: () => ({ type: "companyAdmin" }),
      });

      const res = await POST(
        createRequest(
          { userId: "user-1", userData: validUserData },
          { cookie: "token-bueno" }
        )
      );

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.userType).toBe("companyAdmin");
      expect(mockOnUserCreated).toHaveBeenCalledWith(
        "user-1",
        expect.objectContaining({ type: "companyAdmin" })
      );
      expect(mockUserDocUpdate).toHaveBeenCalled();
    });

    it("responde 500 si onUserCreated falla", async () => {
      mockVerifyIdToken.mockResolvedValue({ uid: "user-1" });
      mockUserDocGet.mockResolvedValue({
        exists: true,
        data: () => ({ type: "borrower" }),
      });
      mockOnUserCreated.mockResolvedValue({
        success: false,
        error: "Firebase caído",
      });

      const res = await POST(
        createRequest(
          { userId: "user-1", userData: validUserData },
          { cookie: "token-bueno" }
        )
      );
      expect(res.status).toBe(500);
    });
  });
});
