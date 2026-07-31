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
const mockCollection = vi.fn().mockReturnValue({ where: mockWhereToken });

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: () => ({
    collection: (...args: any[]) => mockCollection(...args),
  }),
}));

function createRequest(body: any): NextRequest {
  return new NextRequest("http://localhost:3000/api/auth/validate-bank-token", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/auth/validate-bank-token — validar token de alta de empresa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("responde 400 si no se envía token", async () => {
    const res = await POST(createRequest({}));

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.valid).toBe(false);
    // No debe llegar a consultar Firestore
    expect(mockCollection).not.toHaveBeenCalled();
  });

  it("responde 400 si el token es cadena vacía", async () => {
    const res = await POST(createRequest({ token: "" }));

    expect(res.status).toBe(400);
    expect(mockCollection).not.toHaveBeenCalled();
  });

  it("rechaza un token inexistente sin revelar por qué", async () => {
    mockGet.mockResolvedValue({ empty: true, docs: [] });

    const res = await POST(createRequest({ token: "token-inventado" }));
    const body = await res.json();

    expect(body.valid).toBe(false);
    expect(body.tokenId).toBeUndefined();
  });

  it("solo considera tokens sin usar", async () => {
    mockGet.mockResolvedValue({ empty: true, docs: [] });

    await POST(createRequest({ token: "token-quemado" }));

    expect(mockCollection).toHaveBeenCalledWith("bank_signup_tokens");
    expect(mockWhereToken).toHaveBeenCalledWith("token", "==", "token-quemado");
    expect(mockWhereUsed).toHaveBeenCalledWith("used", "==", false);
  });

  it("acepta un token válido y devuelve su id", async () => {
    mockGet.mockResolvedValue({
      empty: false,
      docs: [
        {
          id: "token-doc-1",
          data: () => ({ description: "Alta Banco Azteca" }),
        },
      ],
    });

    const res = await POST(createRequest({ token: "token-bueno" }));
    const body = await res.json();

    expect(body.valid).toBe(true);
    expect(body.tokenId).toBe("token-doc-1");
    expect(body.description).toBe("Alta Banco Azteca");
  });

  it("responde 500 si Firestore falla", async () => {
    mockGet.mockRejectedValue(new Error("Firestore caído"));

    const res = await POST(createRequest({ token: "token-bueno" }));

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.valid).toBe(false);
  });
});
