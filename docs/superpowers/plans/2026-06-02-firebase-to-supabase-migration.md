# Firebase → Supabase Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Firebase Auth + Firestore with Supabase Auth + PostgreSQL, maintaining all existing functionality.

**Architecture:** Supabase Auth handles sessions via `@supabase/ssr` cookies (replacing manual `auth-token`/`user-type` cookies). User roles live in `user_metadata` of Supabase Auth. Database logic moves from Firestore NoSQL to PostgreSQL with RLS blocking direct client access — all mutations go through API routes. Real-time via Supabase Realtime only where it matters: notifications, lender marketplace, borrower proposals.

**Tech Stack:** Next.js 16, Supabase JS v2, `@supabase/ssr`, TypeScript, Tailwind, HeroUI

**Decisions locked in:**
- Roles stored in `auth.users.user_metadata.userType` — no separate roles table
- RLS: authenticated users can only read/write their own rows; service role (server-side) bypasses RLS
- Real-time ON: `notifications`, `solicitudes` (lender marketplace), `propuestas` (borrower)
- Real-time OFF: super admin dashboard, admin dashboard (fetch on load is enough)

---

## Files changed

| File | Action |
|------|--------|
| `lib/supabase/client.ts` | CREATE — browser Supabase client |
| `lib/supabase/server.ts` | CREATE — server Supabase client (API routes, Server Components) |
| `lib/supabase/admin.ts` | CREATE — service role client (replaces FirebaseAdmin) |
| `lib/supabase/types.ts` | CREATE — generated DB types (run `supabase gen types`) |
| `supabase/migrations/001_initial_schema.sql` | CREATE — full PostgreSQL schema |
| `supabase/migrations/002_rls_policies.sql` | CREATE — Row Level Security |
| `contexts/AuthContext.tsx` | MODIFY — replace Firebase Auth with Supabase Auth |
| `app/login/page.tsx` | MODIFY — use Supabase signIn |
| `app/signup/page.tsx` | MODIFY — use Supabase signUp |
| `app/signup_admin/page.tsx` | MODIFY — use Supabase signUp |
| `app/forgot-password/page.tsx` | MODIFY — use Supabase resetPasswordForEmail |
| `app/auth/action/page.tsx` | MODIFY — handle Supabase email confirmation/reset |
| `proxy.ts` | MODIFY — read session from Supabase SSR cookie |
| `lib/auth-middleware.ts` | MODIFY — verify Supabase JWT |
| `app/api/utils/auth.ts` | MODIFY — verify Supabase JWT |
| `app/api/auth/*` | MODIFY — all auth routes |
| `app/api/superadmin/*` | MODIFY — use Supabase admin client |
| `app/api/proposals/*` | MODIFY — use Supabase |
| `app/api/loans/*` | MODIFY — use Supabase |
| `app/api/notifications/*` + legacy routes | MODIFY — use Supabase |
| `app/api/users/*` | MODIFY — use Supabase |
| `app/api/beta/*` + `app/api/superadmin/beta-tokens/*` | MODIFY — use Supabase |
| `hooks/useSuperAdminDashboard.ts` | MODIFY — remove Firestore listeners, use fetch |
| `hooks/useLenderDashboard.ts` | MODIFY — replace Firestore with Supabase Realtime |
| `app/firebase/` | DELETE — entire directory |
| `db/` | DELETE — entire directory |
| `package.json` | MODIFY — remove firebase + firebase-admin, add @supabase/supabase-js + @supabase/ssr |

---

## Task 1: Install Supabase, create project, configure env vars

**Files:**
- Modify: `package.json`
- Create: `.env.local` (additions)

- [ ] **Step 1: Install Supabase packages**

```bash
npm install @supabase/supabase-js @supabase/ssr
npm install -D supabase
```

- [ ] **Step 2: Create Supabase project**

Go to https://supabase.com/dashboard → New project. Note:
- Project URL (e.g. `https://xxxx.supabase.co`)
- Anon public key
- Service role secret key (Settings → API)

- [ ] **Step 3: Add env vars to `.env.local`**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

- [ ] **Step 4: Initialize Supabase CLI**

```bash
npx supabase init
npx supabase link --project-ref xxxx
```

- [ ] **Step 5: Verify connection**

```bash
npx supabase status
```
Expected: shows linked project URL.

---

## Task 2: Database schema migration

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/001_initial_schema.sql

-- accounts (replaces cuentas)
CREATE TABLE accounts (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('superAdmin', 'companyAdmin', 'lender', 'borrower')),
  name TEXT,
  last_name TEXT,
  second_last_name TEXT,
  rfc TEXT,
  birthday DATE,
  phone TEXT,
  company_name TEXT,
  admin_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  address JSONB,
  credit_score JSONB,
  accepted_terms BOOLEAN DEFAULT FALSE,
  accepted_terms_at TIMESTAMPTZ,
  email_notifications BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  deactivated_at TIMESTAMPTZ,
  deactivated_by UUID REFERENCES accounts(id),
  reactivated_at TIMESTAMPTZ,
  reactivated_by UUID REFERENCES accounts(id),
  purpose TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- loan_requests (replaces solicitudes)
CREATE TABLE loan_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  income DECIMAL(12, 2),
  term TEXT,
  payment_frequency TEXT CHECK (payment_frequency IN ('mensual', 'quincenal', 'semanal')),
  purpose TEXT CHECK (purpose IN ('Personal', 'Negocio')),
  loan_type TEXT CHECK (loan_type IN ('consumo', 'deudas', 'capital', 'maquinaria')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  accepted_proposal_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- loan_proposals (replaces propuestas)
CREATE TABLE loan_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lender_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  loan_id UUID NOT NULL REFERENCES loan_requests(id) ON DELETE CASCADE,
  company TEXT,
  amount DECIMAL(12, 2),
  interest_rate DECIMAL(5, 2),
  deadline INTEGER,
  amortization_frequency TEXT,
  amortization DECIMAL(12, 2),
  comision DECIMAL(12, 2),
  medical_balance DECIMAL(12, 2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  request_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- FK circular: loan_requests.accepted_proposal_id → loan_proposals.id
ALTER TABLE loan_requests
  ADD CONSTRAINT fk_accepted_proposal
  FOREIGN KEY (accepted_proposal_id) REFERENCES loan_proposals(id) ON DELETE SET NULL;

-- notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT FALSE,
  email_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- signup_tokens (replaces bank_signup_tokens)
CREATE TABLE signup_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  description TEXT,
  used BOOLEAN DEFAULT FALSE,
  used_by UUID REFERENCES accounts(id),
  used_by_company TEXT,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- beta_access_tokens (replaces beta_tokens)
CREATE TABLE beta_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  assigned_to TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  last_used TIMESTAMPTZ,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- deletion_audit_logs (replaces deletion_logs)
CREATE TABLE deletion_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deleted_user_id UUID NOT NULL,
  deleted_user_email TEXT,
  deleted_user_type TEXT,
  deleted_by UUID NOT NULL REFERENCES accounts(id),
  deleted_at TIMESTAMPTZ DEFAULT NOW(),
  user_data JSONB
);

-- Indexes
CREATE INDEX idx_accounts_type ON accounts(type);
CREATE INDEX idx_accounts_admin_id ON accounts(admin_id);
CREATE INDEX idx_accounts_created_at ON accounts(created_at);
CREATE INDEX idx_loan_requests_user_id ON loan_requests(user_id);
CREATE INDEX idx_loan_requests_status ON loan_requests(status);
CREATE INDEX idx_loan_requests_created_at ON loan_requests(created_at);
CREATE INDEX idx_loan_proposals_loan_id ON loan_proposals(loan_id);
CREATE INDEX idx_loan_proposals_lender_id ON loan_proposals(lender_id);
CREATE INDEX idx_loan_proposals_status ON loan_proposals(status);
CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(recipient_id, is_read);
CREATE INDEX idx_signup_tokens_token ON signup_tokens(token);
CREATE INDEX idx_beta_tokens_token ON beta_access_tokens(token);

-- updated_at auto-update trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_updated_at BEFORE UPDATE ON accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER loan_requests_updated_at BEFORE UPDATE ON loan_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER loan_proposals_updated_at BEFORE UPDATE ON loan_proposals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

- [ ] **Step 2: Apply the migration**

```bash
npx supabase db push
```
Expected: "Applying migration 001_initial_schema.sql... done"

---

## Task 3: RLS policies

**Files:**
- Create: `supabase/migrations/002_rls_policies.sql`

- [ ] **Step 1: Create the RLS migration**

```sql
-- supabase/migrations/002_rls_policies.sql

-- Enable RLS on all tables
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE signup_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE beta_access_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE deletion_audit_logs ENABLE ROW LEVEL SECURITY;

-- accounts: users can read/update their own row only
CREATE POLICY "accounts_select_own" ON accounts
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "accounts_update_own" ON accounts
  FOR UPDATE USING (auth.uid() = id);

-- loan_requests: borrowers can CRUD their own; lenders can read pending
CREATE POLICY "loan_requests_own" ON loan_requests
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "loan_requests_lender_read" ON loan_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM accounts
      WHERE accounts.id = auth.uid()
      AND accounts.type IN ('lender', 'companyAdmin', 'superAdmin')
    )
  );

-- loan_proposals: lenders own their proposals; borrowers read proposals on their loans
CREATE POLICY "loan_proposals_lender_own" ON loan_proposals
  FOR ALL USING (auth.uid() = lender_id);
CREATE POLICY "loan_proposals_borrower_read" ON loan_proposals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM loan_requests
      WHERE loan_requests.id = loan_proposals.loan_id
      AND loan_requests.user_id = auth.uid()
    )
  );

-- notifications: users read/update their own
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (auth.uid() = recipient_id);

-- tokens: no direct client access (service role only)
-- (no policies = blocked for all authenticated users from client)
```

- [ ] **Step 2: Apply**

```bash
npx supabase db push
```

---

## Task 4: Supabase client files

**Files:**
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/admin.ts`

- [ ] **Step 1: Browser client** (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 2: Server client** (`lib/supabase/server.ts`)

```typescript
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}
```

- [ ] **Step 3: Admin/service role client** (`lib/supabase/admin.ts`)

```typescript
import "server-only";
import { createClient } from "@supabase/supabase-js";

// Bypasses RLS — only use in server-side API routes
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

- [ ] **Step 4: Generate TypeScript types**

```bash
npx supabase gen types typescript --linked > lib/supabase/types.ts
```

- [ ] **Step 5: Commit**

```bash
git add supabase/ lib/supabase/ .env.local
git commit -m "feat: add Supabase schema, RLS policies, and client files"
```

---

## Task 5: Update proxy.ts

The proxy reads `auth-token` + `user-type` cookies manually. Supabase SSR stores the session in its own cookie automatically. We need to read that session and extract `userType` from `user_metadata`.

**Files:**
- Modify: `proxy.ts`

- [ ] **Step 1: Replace proxy.ts**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

type UserType = "superAdmin" | "companyAdmin" | "lender" | "borrower";

const protectedRoutes: Record<string, UserType[]> = {
  "/super_admin_dashboard": ["superAdmin"],
  "/admin_dashboard": ["companyAdmin"],
  "/lender": ["lender"],
  "/user_dashboard": ["borrower"],
  "/worker_dashboard": ["lender"],
};

const publicRoutes = [
  "/", "/login", "/signup", "/signup_admin", "/forgot-password",
  "/acerca-de", "/como-funciona", "/aviso-legal", "/politica-privacidad",
  "/terminos", "/transparencia", "/soluciones", "/prestamista",
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let response = NextResponse.next({ request });

  // Create Supabase client that can read/write SSR cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  const isPublicFile =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/beta/validate") ||
    pathname.includes("/favicon.ico") ||
    pathname.startsWith("/img/");

  const isBetaPage = pathname === "/beta-access";
  const hasBetaAccess = request.cookies.has("buscocredito_beta");

  if (!hasBetaAccess && !isPublicFile && !isBetaPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/beta-access";
    return NextResponse.redirect(url);
  }

  if (hasBetaAccess && isBetaPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith("/api/")) return response;
  if (publicRoutes.includes(pathname)) return response;
  if (pathname.startsWith("/_next/") || pathname.startsWith("/static/") || pathname.includes(".")) return response;

  const matchedRoute = Object.keys(protectedRoutes).find((route) =>
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userType = user.user_metadata?.userType as UserType;
    const allowedRoles = protectedRoutes[matchedRoute];

    if (!userType || !allowedRoles.includes(userType)) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

- [ ] **Step 2: Commit**

```bash
git add proxy.ts
git commit -m "feat: update proxy.ts to use Supabase SSR session"
```

---

## Task 6: Update AuthContext

**Files:**
- Modify: `contexts/AuthContext.tsx`

- [ ] **Step 1: Replace AuthContext.tsx**

```typescript
"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { getRedirectPath } from "@/lib/navigation";
import type { AuthUser, AuthContextType } from "@/types/entities/account.types";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(sessionToAuthUser(session.user));
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? sessionToAuthUser(session.user) : null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const sessionToAuthUser = (supabaseUser: any): AuthUser => ({
    uid: supabaseUser.id,
    email: supabaseUser.email,
    type: supabaseUser.user_metadata?.userType || "borrower",
    companyName: supabaseUser.user_metadata?.companyName,
    adminId: supabaseUser.user_metadata?.adminId,
  });

  const getErrorMessage = (error: any): string => {
    const msg = error?.message?.toLowerCase() || "";
    if (msg.includes("invalid login credentials")) return "Email o contraseña incorrectos";
    if (msg.includes("too many requests")) return "Demasiados intentos fallidos. Intenta más tarde";
    if (msg.includes("email not confirmed")) return "Confirma tu email antes de iniciar sesión";
    if (msg.includes("network")) return "Error de conexión. Verifica tu internet";
    return "Error al iniciar sesión. Intenta nuevamente";
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const userType = data.user.user_metadata?.userType || "borrower";
      router.push(getRedirectPath(userType));
    } catch (err: any) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/action?type=recovery`,
      });
      if (error) throw error;
    } catch (err: any) {
      const msg = err?.message?.toLowerCase() || "";
      if (msg.includes("user not found")) {
        setError("No existe una cuenta con este correo electrónico");
      } else {
        setError("Ocurrió un error al enviar el correo de recuperación");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
```

- [ ] **Step 2: Commit**

```bash
git add contexts/AuthContext.tsx
git commit -m "feat: replace Firebase Auth with Supabase Auth in AuthContext"
```

---

## Task 7: Update API auth utilities

All API routes use either `lib/auth-middleware.ts` or `app/api/utils/auth.ts` to verify tokens. Both need to switch from Firebase JWT to Supabase JWT.

**Files:**
- Modify: `app/api/utils/auth.ts`
- Modify: `lib/auth-middleware.ts`

- [ ] **Step 1: Update `app/api/utils/auth.ts`**

```typescript
import { createClient } from "@/lib/supabase/server";

export type AuthenticatedUser = {
  uid: string;
  email: string | null;
  userType: string;
};

export async function verifyAuthentication(
  request: Request
): Promise<AuthenticatedUser | null> {
  try {
    // Try Bearer token first (for programmatic API calls)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.split("Bearer ")[1];
      const supabase = await createClient();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return null;
      return {
        uid: user.id,
        email: user.email ?? null,
        userType: user.user_metadata?.userType || "",
      };
    }

    // Fall back to SSR session cookie
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return {
      uid: user.id,
      email: user.email ?? null,
      userType: user.user_metadata?.userType || "",
    };
  } catch {
    return null;
  }
}
```

- [ ] **Step 2: Update `lib/auth-middleware.ts`**

```typescript
import { createAdminClient } from "@/lib/supabase/admin";
import type { NextRequest } from "next/server";

export type AuthUser = {
  uid: string;
  email: string | null;
  userType: string;
};

export async function verifyAuthToken(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.split("Bearer ")[1];
  const supabase = createAdminClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  return {
    uid: user.id,
    email: user.email ?? null,
    userType: user.user_metadata?.userType || "",
  };
}

export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<AuthUser | null> => {
    const user = await verifyAuthToken(request);
    if (!user) return null;
    if (!allowedRoles.includes(user.userType)) return null;
    return user;
  };
}

export const requireLender = requireRole(["lender"]);
export const requireAdmin = requireRole(["companyAdmin"]);
export const requireSuperAdmin = requireRole(["superAdmin"]);
```

- [ ] **Step 3: Commit**

```bash
git add app/api/utils/auth.ts lib/auth-middleware.ts
git commit -m "feat: update API auth utilities to verify Supabase JWT"
```

---

## Task 8: Migrate signup flow

Signup creates users in Firebase Auth + a Firestore `cuentas` document. In Supabase, we call `supabase.auth.signUp()` with `user_metadata` containing the role, then insert into `accounts` table.

**Files:**
- Create: `app/api/auth/signup/route.ts`
- Modify: `app/signup/page.tsx` (API call only — no UI changes)
- Modify: `app/signup_admin/page.tsx` (API call only)

- [ ] **Step 1: Create signup API route** (`app/api/auth/signup/route.ts`)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSuccessResponse, createErrorResponse } from "@/app/api/utils/response";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password, userType, name, lastName, companyName, adminId, phone, acceptedTerms } = body;

  if (!email || !password || !userType || !name) {
    return createErrorResponse("Missing required fields", 400);
  }

  const supabase = createAdminClient();

  // Create Supabase Auth user with role in user_metadata
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email confirmation in dev
    user_metadata: {
      userType,
      companyName: companyName || null,
      adminId: adminId || null,
    },
  });

  if (authError || !authData.user) {
    return createErrorResponse(authError?.message || "Failed to create user", 400);
  }

  // Insert into accounts table
  const { error: dbError } = await supabase.from("accounts").insert({
    id: authData.user.id,
    email,
    type: userType,
    name,
    last_name: lastName || null,
    phone: phone || null,
    company_name: companyName || null,
    admin_id: adminId || null,
    accepted_terms: acceptedTerms || false,
    accepted_terms_at: acceptedTerms ? new Date().toISOString() : null,
  });

  if (dbError) {
    // Rollback auth user if DB insert fails
    await supabase.auth.admin.deleteUser(authData.user.id);
    return createErrorResponse("Failed to create account", 500);
  }

  return createSuccessResponse({ uid: authData.user.id });
}
```

- [ ] **Step 2: Update signup pages to call new API**

In `app/signup/page.tsx` and `app/signup_admin/page.tsx`, find the signup submission handler and replace any Firebase `createUserWithEmailAndPassword` calls with:

```typescript
const response = await fetch("/api/auth/signup", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email,
    password,
    userType: "borrower", // or "companyAdmin" for admin signup
    name,
    lastName,
    phone,
    acceptedTerms,
  }),
});
const data = await response.json();
if (!data.success) throw new Error(data.error);

// Sign in after signup
const supabase = createClient();
await supabase.auth.signInWithPassword({ email, password });
```

- [ ] **Step 3: Commit**

```bash
git add app/api/auth/signup/ app/signup/page.tsx app/signup_admin/page.tsx
git commit -m "feat: migrate signup flow to Supabase"
```

---

## Task 9: Migrate remaining auth API routes

**Files:**
- Modify: `app/api/auth/me/route.ts`
- Modify: `app/api/auth/setup-user-claims/route.ts` (repurpose for setting user_metadata)
- Modify: `app/api/auth/use-bank-token/route.ts`
- Modify: `app/api/auth/validate-bank-token/route.ts`

- [ ] **Step 1: Update `/api/auth/me`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function GET(request: NextRequest) {
  const authUser = await verifyAuthentication(request);
  if (!authUser) return createErrorResponse("Unauthorized", 401);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", authUser.uid)
    .single();

  if (error || !data) return createErrorResponse("User not found", 404);

  return NextResponse.json({ success: true, user: data });
}
```

- [ ] **Step 2: Update `/api/auth/setup-user-claims`** (now sets user_metadata)

```typescript
import { NextRequest } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSuccessResponse, createErrorResponse } from "@/app/api/utils/response";

export async function POST(request: NextRequest) {
  const authUser = await verifyAuthentication(request);
  if (!authUser) return createErrorResponse("Unauthorized", 401);

  const { userId, userData } = await request.json();
  const supabase = createAdminClient();

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: {
      userType: userData.type,
      companyName: userData.companyName || null,
      adminId: userData.adminId || null,
    },
  });

  if (error) return createErrorResponse(error.message, 500);
  return createSuccessResponse({ message: "User metadata updated" });
}
```

- [ ] **Step 3: Update `/api/auth/validate-bank-token`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (!token) return createErrorResponse("Token required", 400);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("signup_tokens")
    .select("*")
    .eq("token", token)
    .eq("used", false)
    .single();

  if (error || !data) return createErrorResponse("Token inválido o ya utilizado", 400);

  return NextResponse.json({ success: true, valid: true, description: data.description });
}
```

- [ ] **Step 4: Update `/api/auth/use-bank-token`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function POST(request: NextRequest) {
  const authUser = await verifyAuthentication(request);
  if (!authUser) return createErrorResponse("Unauthorized", 401);

  const { token } = await request.json();
  const supabase = createAdminClient();

  const { data: tokenData, error: tokenError } = await supabase
    .from("signup_tokens")
    .select("*")
    .eq("token", token)
    .eq("used", false)
    .single();

  if (tokenError || !tokenData) return createErrorResponse("Token inválido", 400);

  const { data: account } = await supabase
    .from("accounts")
    .select("company_name")
    .eq("id", authUser.uid)
    .single();

  await supabase
    .from("signup_tokens")
    .update({
      used: true,
      used_by: authUser.uid,
      used_by_company: account?.company_name || null,
      used_at: new Date().toISOString(),
    })
    .eq("id", tokenData.id);

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/auth/
git commit -m "feat: migrate auth API routes to Supabase"
```

---

## Task 10: Migrate superadmin API routes

**Files:**
- Modify: `app/api/superadmin/accounts/route.ts`
- Modify: `app/api/superadmin/accounts/[uid]/route.ts`
- Modify: `app/api/superadmin/system/route.ts`
- Modify: `app/api/superadmin/tokens/route.ts`
- Modify: `app/api/superadmin/beta-tokens/route.ts`
- Modify: `app/api/superadmin/beta-tokens/[id]/route.ts`

- [ ] **Step 1: Helper — verify superAdmin role**

Add this helper at the top of each superadmin route file (or extract to `app/api/superadmin/utils.ts`):

```typescript
// app/api/superadmin/utils.ts
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createErrorResponse } from "@/app/api/utils/response";
import { NextRequest, NextResponse } from "next/server";

export async function verifySuperAdmin(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return { error: createErrorResponse("Unauthorized", 401) };
  if (user.userType !== "superAdmin") return { error: createErrorResponse("Forbidden", 403) };
  return { user };
}
```

- [ ] **Step 2: Migrate `accounts/route.ts` (GET — list all accounts)**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "../utils";

export async function GET(request: NextRequest) {
  const { error, user } = await verifySuperAdmin(request);
  if (error) return error;

  const supabase = createAdminClient();

  const { data: accounts, error: dbError } = await supabase
    .from("accounts")
    .select("*")
    .order("created_at", { ascending: false });

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  // Get disabled status from Supabase Auth
  const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
  const authMap = new Map(authUsers.map((u) => [u.id, u]));

  const enriched = accounts.map((acc) => ({
    ...acc,
    disabled: authMap.get(acc.id)?.banned_until ? true : !acc.is_active,
    lastLoginAt: authMap.get(acc.id)?.last_sign_in_at || null,
  }));

  return NextResponse.json({ success: true, accounts: enriched });
}
```

- [ ] **Step 3: Migrate `accounts/[uid]/route.ts` (PUT activate/deactivate, DELETE)**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "../../utils";

export async function PUT(request: NextRequest, { params }: { params: { uid: string } }) {
  const { error } = await verifySuperAdmin(request);
  if (error) return error;

  const { action } = await request.json();
  const supabase = createAdminClient();
  const isActive = action === "activate";

  await supabase.from("accounts").update({ is_active: isActive }).eq("id", params.uid);

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest, { params }: { params: { uid: string } }) {
  const { error, user } = await verifySuperAdmin(request);
  if (error) return error;

  const supabase = createAdminClient();

  // Log deletion before deleting
  const { data: account } = await supabase.from("accounts").select("*").eq("id", params.uid).single();
  if (account) {
    await supabase.from("deletion_audit_logs").insert({
      deleted_user_id: params.uid,
      deleted_user_email: account.email,
      deleted_user_type: account.type,
      deleted_by: user!.uid,
      user_data: account,
    });
  }

  // Delete auth user (cascades to accounts via FK)
  await supabase.auth.admin.deleteUser(params.uid);

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Migrate tokens routes**

`app/api/superadmin/tokens/route.ts` (GET list, POST create, DELETE):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "../utils";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const { error } = await verifySuperAdmin(request);
  if (error) return error;

  const supabase = createAdminClient();
  const { data } = await supabase.from("signup_tokens").select("*").order("created_at", { ascending: false });
  return NextResponse.json({ success: true, tokens: data || [] });
}

export async function POST(request: NextRequest) {
  const { error } = await verifySuperAdmin(request);
  if (error) return error;

  const { description } = await request.json();
  const token = `TOK-${crypto.randomBytes(4).toString("hex").toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

  const supabase = createAdminClient();
  const { data } = await supabase.from("signup_tokens").insert({ token, description: description || null }).select().single();

  return NextResponse.json({ success: true, token: data?.token });
}

export async function DELETE(request: NextRequest) {
  const { error } = await verifySuperAdmin(request);
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  const supabase = createAdminClient();
  await supabase.from("signup_tokens").delete().eq("id", id);
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Migrate beta-tokens routes**

`app/api/superadmin/beta-tokens/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "../utils";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const { error } = await verifySuperAdmin(request);
  if (error) return error;

  const supabase = createAdminClient();
  const { data } = await supabase.from("beta_access_tokens").select("*").order("created_at", { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(request: NextRequest) {
  const { error } = await verifySuperAdmin(request);
  if (error) return error;

  const { assignedTo } = await request.json();
  if (!assignedTo) return NextResponse.json({ error: "assignedTo required" }, { status: 400 });

  const token = `BETA-${crypto.randomBytes(2).toString("hex").toUpperCase()}-${crypto.randomBytes(2).toString("hex").toUpperCase()}`;

  const supabase = createAdminClient();
  await supabase.from("beta_access_tokens").insert({ token, assigned_to: assignedTo });
  return NextResponse.json({ success: true });
}
```

`app/api/superadmin/beta-tokens/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "../../utils";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const { error } = await verifySuperAdmin(request);
  if (error) return error;

  const { active } = await request.json();
  const supabase = createAdminClient();
  await supabase.from("beta_access_tokens").update({ active }).eq("id", params.id);
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 6: Migrate system route**

`app/api/superadmin/system/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifySuperAdmin } from "../utils";

export async function GET(request: NextRequest) {
  const { error } = await verifySuperAdmin(request);
  if (error) return error;

  const supabase = createAdminClient();
  const tables = ["accounts", "loan_requests", "loan_proposals", "notifications"];

  const counts = await Promise.all(
    tables.map(async (table) => {
      const { count } = await supabase.from(table).select("*", { count: "exact", head: true });
      return { name: table, documentCount: count || 0 };
    })
  );

  return NextResponse.json({
    success: true,
    database: { collections: counts, totalDocuments: counts.reduce((s, c) => s + c.documentCount, 0) },
    server: { status: "healthy", uptime: process.uptime(), lastChecked: new Date().toISOString(), nodeVersion: process.version, platform: process.platform },
  });
}
```

- [ ] **Step 7: Commit**

```bash
git add app/api/superadmin/
git commit -m "feat: migrate superadmin API routes to Supabase"
```

---

## Task 11: Migrate proposals API routes

**Files:**
- Modify: `app/api/proposals/lender/route.ts`
- Modify: `app/api/proposals/status/route.ts`
- Modify: `app/api/proposals/winning/route.ts`
- Modify: `app/api/createPropuesta/route.ts`

- [ ] **Step 1: Migrate `proposals/lender` (POST — get lender's proposals)**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function POST(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);
  if (user.userType !== "lender") return createErrorResponse("Forbidden", 403);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("loan_proposals")
    .select("*, loan_requests(*)")
    .eq("lender_id", user.uid)
    .order("created_at", { ascending: false });

  if (error) return createErrorResponse(error.message, 500);
  return NextResponse.json({ success: true, proposals: data });
}
```

- [ ] **Step 2: Migrate `proposals/status` (PUT — accept/reject a proposal)**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function PUT(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);

  const { proposalId, status, loanId } = await request.json();
  if (!proposalId || !status || !loanId) return createErrorResponse("Missing fields", 400);

  const supabase = createAdminClient();

  // Verify ownership — borrower must own the loan
  const { data: loan } = await supabase.from("loan_requests").select("user_id").eq("id", loanId).single();
  if (!loan || loan.user_id !== user.uid) return createErrorResponse("Forbidden", 403);

  if (status === "accepted") {
    // Accept this proposal
    await supabase.from("loan_proposals").update({ status: "accepted" }).eq("id", proposalId);
    // Reject all other proposals for this loan
    await supabase.from("loan_proposals")
      .update({ status: "rejected" })
      .eq("loan_id", loanId)
      .neq("id", proposalId);
    // Mark loan as approved
    await supabase.from("loan_requests")
      .update({ status: "approved", accepted_proposal_id: proposalId })
      .eq("id", loanId);
  } else {
    await supabase.from("loan_proposals").update({ status }).eq("id", proposalId);
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Migrate `proposals/winning` (GET — get winning proposal for a loan)**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function GET(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const loanId = searchParams.get("loanId");
  if (!loanId) return createErrorResponse("loanId required", 400);

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("loan_proposals")
    .select("*")
    .eq("loan_id", loanId)
    .eq("status", "accepted")
    .single();

  return NextResponse.json({ success: true, proposal: data || null });
}
```

- [ ] **Step 4: Migrate `createPropuesta`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function POST(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);
  if (user.userType !== "lender") return createErrorResponse("Forbidden", 403);

  const body = await request.json();
  const { loanId, amount, interestRate, deadline, amortizationFrequency, amortization, comision, medicalBalance } = body;

  if (!loanId || !amount || !interestRate) return createErrorResponse("Missing required fields", 400);

  const supabase = createAdminClient();

  const { data: account } = await supabase.from("accounts").select("company_name").eq("id", user.uid).single();
  const { data: loan } = await supabase.from("loan_requests").select("*").eq("id", loanId).single();
  if (!loan) return createErrorResponse("Loan not found", 404);

  const { data, error } = await supabase.from("loan_proposals").insert({
    lender_id: user.uid,
    loan_id: loanId,
    company: account?.company_name || null,
    amount,
    interest_rate: interestRate,
    deadline,
    amortization_frequency: amortizationFrequency,
    amortization,
    comision: comision || 0,
    medical_balance: medicalBalance || 0,
    request_info: {
      purpose: loan.purpose,
      loan_type: loan.loan_type,
      originalAmount: loan.amount,
      originalTerm: loan.term,
      originalPayment: loan.payment_frequency,
    },
  }).select().single();

  if (error) return createErrorResponse(error.message, 500);

  // Create notification for borrower
  await supabase.from("notifications").insert({
    recipient_id: loan.user_id,
    type: "nueva_propuesta",
    title: "Nueva propuesta de crédito",
    message: `${account?.company_name || "Un prestamista"} te envió una oferta`,
    data: { loanId, proposalId: data.id, amount, interestRate, lenderName: account?.company_name },
  });

  return NextResponse.json({ success: true, proposalId: data.id });
}
```

- [ ] **Step 5: Commit**

```bash
git add app/api/proposals/ app/api/createPropuesta/
git commit -m "feat: migrate proposals API routes to Supabase"
```

---

## Task 12: Migrate loans and solicitudes API routes

**Files:**
- Modify: `app/api/loans/route.ts`
- Modify: `app/api/loans/status/route.ts`
- Modify: `app/api/loans/offers/route.ts`
- Modify: `app/api/loans/proposals/route.ts`
- Modify: `app/api/loans/accept/route.ts`
- Modify: `app/api/createSolicitud/route.ts`
- Modify: `app/api/solicitudes/delete/route.ts`

- [ ] **Step 1: Migrate `createSolicitud`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function POST(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);
  if (user.userType !== "borrower") return createErrorResponse("Forbidden", 403);

  const { amount, income, term, payment, purpose, type } = await request.json();
  if (!amount || !term || !purpose) return createErrorResponse("Missing required fields", 400);

  const supabase = createAdminClient();
  const { data, error } = await supabase.from("loan_requests").insert({
    user_id: user.uid,
    amount,
    income: income || null,
    term,
    payment_frequency: payment,
    purpose,
    loan_type: type,
  }).select().single();

  if (error) return createErrorResponse(error.message, 500);
  return NextResponse.json({ success: true, loanId: data.id });
}
```

- [ ] **Step 2: Migrate `loans/route.ts` (GET — borrower's loans or marketplace)**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function GET(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);

  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const marketplace = searchParams.get("marketplace");

  let query = supabase.from("loan_requests").select("*, accounts(name, email)");

  if (marketplace && ["lender", "companyAdmin"].includes(user.userType)) {
    query = query.eq("status", "pending");
  } else {
    query = query.eq("user_id", user.uid);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) return createErrorResponse(error.message, 500);
  return NextResponse.json({ success: true, loans: data });
}
```

- [ ] **Step 3: Migrate remaining loans routes**

`app/api/loans/offers/route.ts` — proposals for a specific loan (borrower view):

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function GET(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);

  const { searchParams } = new URL(request.url);
  const loanId = searchParams.get("loanId");
  if (!loanId) return createErrorResponse("loanId required", 400);

  const supabase = createAdminClient();

  // Verify ownership
  const { data: loan } = await supabase.from("loan_requests").select("user_id").eq("id", loanId).single();
  if (!loan || loan.user_id !== user.uid) return createErrorResponse("Forbidden", 403);

  const { data, error } = await supabase
    .from("loan_proposals")
    .select("*")
    .eq("loan_id", loanId)
    .order("created_at", { ascending: false });

  if (error) return createErrorResponse(error.message, 500);
  return NextResponse.json({ success: true, offers: data });
}
```

`app/api/solicitudes/delete/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function DELETE(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);

  const { loanId } = await request.json();
  const supabase = createAdminClient();

  const { data: loan } = await supabase.from("loan_requests").select("user_id").eq("id", loanId).single();
  if (!loan || loan.user_id !== user.uid) return createErrorResponse("Forbidden", 403);

  await supabase.from("loan_requests").delete().eq("id", loanId);
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add app/api/loans/ app/api/createSolicitud/ app/api/solicitudes/
git commit -m "feat: migrate loans and solicitudes API routes to Supabase"
```

---

## Task 13: Migrate notifications API routes

**Files:**
- Modify: `app/api/notifications/route.ts`
- Modify: `app/api/notifications/clear/route.ts`
- Modify: `app/api/notifications/clear-read/route.ts`
- Modify: `app/api/getNotifications/route.ts`
- Modify: `app/api/markNotificationRead/route.ts`
- Modify: `app/api/getUnreadCount/route.ts`
- Modify: `app/api/clearNotifications/route.ts`

- [ ] **Step 1: Migrate `notifications/route.ts` (GET)**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function GET(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", user.uid)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return createErrorResponse(error.message, 500);
  return NextResponse.json({ success: true, notifications: data });
}
```

- [ ] **Step 2: Migrate mark as read and clear routes**

`app/api/markNotificationRead/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function POST(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);

  const { notificationId } = await request.json();
  const supabase = createAdminClient();

  await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("recipient_id", user.uid); // ownership check

  return NextResponse.json({ success: true });
}
```

`app/api/notifications/clear-read/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function DELETE(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);

  const supabase = createAdminClient();
  await supabase.from("notifications").delete().eq("recipient_id", user.uid).eq("is_read", true);
  return NextResponse.json({ success: true });
}
```

`app/api/getUnreadCount/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function GET(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);

  const supabase = createAdminClient();
  const { count } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("recipient_id", user.uid)
    .eq("is_read", false);

  return NextResponse.json({ success: true, count: count || 0 });
}
```

- [ ] **Step 3: Apply same pattern to remaining legacy notification routes**

`app/api/getNotifications/route.ts` and `app/api/clearNotifications/route.ts` follow the exact same pattern as above — replace Firestore calls with `supabase.from("notifications")` equivalent.

- [ ] **Step 4: Commit**

```bash
git add app/api/notifications/ app/api/getNotifications/ app/api/markNotificationRead/ app/api/getUnreadCount/ app/api/clearNotifications/
git commit -m "feat: migrate notifications API routes to Supabase"
```

---

## Task 14: Migrate users and remaining API routes

**Files:**
- Modify: `app/api/users/profile/route.ts`
- Modify: `app/api/users/profile/update/route.ts`
- Modify: `app/api/users/preferences/route.ts`
- Modify: `app/api/users/subaccounts/route.ts`
- Modify: `app/api/users/subaccounts/delete/route.ts`
- Modify: `app/api/users/offers/route.ts`
- Modify: `app/api/users/public-profile/route.ts`
- Modify: remaining legacy routes in `app/api/`

- [ ] **Step 1: Migrate `users/profile/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function GET(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", user.uid)
    .single();

  if (error || !data) return createErrorResponse("Profile not found", 404);
  return NextResponse.json({ success: true, profile: data });
}
```

- [ ] **Step 2: Migrate `users/profile/update/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function PUT(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);

  const body = await request.json();
  const allowed = ["name", "last_name", "second_last_name", "phone", "address", "rfc", "birthday", "purpose"];
  const updates = Object.fromEntries(Object.entries(body).filter(([k]) => allowed.includes(k)));

  const supabase = createAdminClient();
  const { error } = await supabase.from("accounts").update(updates).eq("id", user.uid);
  if (error) return createErrorResponse(error.message, 500);
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Migrate `users/subaccounts/route.ts`** (companyAdmin creating lender workers)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyAuthentication } from "@/app/api/utils/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createErrorResponse } from "@/app/api/utils/response";

export async function GET(request: NextRequest) {
  const user = await verifyAuthentication(request);
  if (!user) return createErrorResponse("Unauthorized", 401);
  if (user.userType !== "companyAdmin") return createErrorResponse("Forbidden", 403);

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("accounts")
    .select("*")
    .eq("admin_id", user.uid)
    .eq("type", "lender");

  return NextResponse.json({ success: true, subaccounts: data || [] });
}
```

- [ ] **Step 4: Apply Supabase pattern to all remaining legacy routes**

For every remaining route in `app/api/` that still uses Firebase:
- Replace `getAdminFirestore()` → `createAdminClient()` from `@/lib/supabase/admin`
- Replace `db.collection("cuentas").doc(uid).get()` → `supabase.from("accounts").select("*").eq("id", uid).single()`
- Replace `db.collection("solicitudes")` → `supabase.from("loan_requests")`
- Replace `db.collection("propuestas")` → `supabase.from("loan_proposals")`
- Replace Firebase Auth token verification → `verifyAuthentication(request)` from `@/app/api/utils/auth`

- [ ] **Step 5: Commit**

```bash
git add app/api/users/ app/api/admin/ app/api/lender/ app/api/institution/
git commit -m "feat: migrate remaining API routes to Supabase"
```

---

## Task 15: Migrate beta validation route

**Files:**
- Modify: `app/api/beta/validate/route.ts`

- [ ] **Step 1: Migrate beta validate**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { token } = await request.json();
  if (!token) return NextResponse.json({ valid: false }, { status: 400 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("beta_access_tokens")
    .select("id, usage_count")
    .eq("token", token.trim().toUpperCase())
    .eq("active", true)
    .single();

  if (error || !data) return NextResponse.json({ valid: false });

  // Increment usage count
  await supabase
    .from("beta_access_tokens")
    .update({ usage_count: data.usage_count + 1, last_used: new Date().toISOString() })
    .eq("id", data.id);

  return NextResponse.json({ valid: true });
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/beta/
git commit -m "feat: migrate beta validation route to Supabase"
```

---

## Task 16: Real-time — Supabase Realtime for notifications

Replace Firestore `onSnapshot` on notifications with Supabase Realtime channel subscription.

**Files:**
- Modify: whichever hook/component subscribes to notifications (check `hooks/` for `onSnapshot` on `notifications`)

- [ ] **Step 1: Find current notification listener**

```bash
grep -rn "onSnapshot\|collection.*notifications" hooks/ components/ app/ --include="*.ts" --include="*.tsx" | grep -v node_modules
```

- [ ] **Step 2: Replace with Supabase Realtime**

In the file that currently listens to notifications (likely a hook or the notification component):

```typescript
import { createClient } from "@/lib/supabase/client";

// Inside a useEffect:
const supabase = createClient();

// Initial fetch
const { data } = await supabase
  .from("notifications")
  .select("*")
  .eq("recipient_id", userId)
  .order("created_at", { ascending: false })
  .limit(50);
setNotifications(data || []);

// Real-time subscription
const channel = supabase
  .channel("notifications")
  .on(
    "postgres_changes",
    {
      event: "INSERT",
      schema: "public",
      table: "notifications",
      filter: `recipient_id=eq.${userId}`,
    },
    (payload) => {
      setNotifications((prev) => [payload.new as Notification, ...prev]);
    }
  )
  .subscribe();

return () => { supabase.removeChannel(channel); };
```

- [ ] **Step 3: Enable Realtime on the notifications table in Supabase**

Go to Supabase Dashboard → Database → Replication → enable `notifications` table for realtime.

Or via SQL:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

- [ ] **Step 4: Commit**

```bash
git commit -am "feat: replace Firestore notifications listener with Supabase Realtime"
```

---

## Task 17: Real-time — lender marketplace and borrower proposals

**Files:**
- Modify: `hooks/useLenderDashboard.ts` (marketplace — new solicitudes)
- Modify: whichever hook renders borrower proposals

- [ ] **Step 1: Enable Realtime on loan_requests and loan_proposals**

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE loan_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE loan_proposals;
```

- [ ] **Step 2: Replace lender marketplace listener in `hooks/useLenderDashboard.ts`**

Find the `onSnapshot` on `solicitudes` and replace:

```typescript
const supabase = createClient();

// Initial load
const { data } = await supabase
  .from("loan_requests")
  .select("*, accounts(name, phone, credit_score)")
  .eq("status", "pending")
  .order("created_at", { ascending: false });
setRequests(data || []);

// Real-time: new solicitudes appear in marketplace immediately
const channel = supabase
  .channel("marketplace")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "loan_requests", filter: "status=eq.pending" },
    () => {
      // Refetch on any change
      supabase
        .from("loan_requests")
        .select("*, accounts(name, phone, credit_score)")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .then(({ data }) => setRequests(data || []));
    }
  )
  .subscribe();

return () => { supabase.removeChannel(channel); };
```

- [ ] **Step 3: Replace borrower proposals listener**

Find the hook that watches proposals for a borrower's loan and replace with:

```typescript
const channel = supabase
  .channel(`proposals-${loanId}`)
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "loan_proposals", filter: `loan_id=eq.${loanId}` },
    (payload) => {
      setProposals((prev) => [...prev, payload.new as LoanProposal]);
    }
  )
  .subscribe();

return () => { supabase.removeChannel(channel); };
```

- [ ] **Step 4: Commit**

```bash
git commit -am "feat: replace Firestore real-time listeners with Supabase Realtime"
```

---

## Task 18: Update super admin hook (remove Firestore listeners)

**Files:**
- Modify: `hooks/useSuperAdminDashboard.ts`

- [ ] **Step 1: Replace Firestore listeners with Supabase fetch**

Remove the three `onSnapshot` useEffects for `cuentas`, `solicitudes`, `propuestas`. Replace with a single fetch function that calls the migrated API route:

```typescript
const fetchData = useCallback(async () => {
  if (!isAuthorized) return;
  setIsLoading(true);
  try {
    const token = await getAuthToken();
    const res = await fetch("/api/superadmin/accounts", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    const { accounts } = await res.json();
    setAccounts(accounts);
  } catch (err) {
    console.error("fetchData error:", err);
  } finally {
    setIsLoading(false);
  }
}, [isAuthorized, getAuthToken]);

useEffect(() => {
  if (isAuthorized) fetchData();
}, [isAuthorized, fetchData]);
```

- [ ] **Step 2: Update `getAuthToken` to use Supabase**

```typescript
const getAuthToken = useCallback(async () => {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");
  return session.access_token;
}, []);
```

- [ ] **Step 3: Commit**

```bash
git add hooks/useSuperAdminDashboard.ts
git commit -m "feat: update super admin hook to use Supabase fetch instead of Firestore listeners"
```

---

## Task 19: Remove Firebase completely

**Files:**
- Delete: `app/firebase/` (entire directory)
- Delete: `db/` (entire directory)
- Modify: `package.json`

- [ ] **Step 1: Verify no remaining Firebase imports**

```bash
grep -rn "from 'firebase\|from \"firebase\|from '@/app/firebase\|from \"@/app/firebase\|from '@/db/\|from \"@/db/" \
  --include="*.ts" --include="*.tsx" \
  app/ components/ hooks/ contexts/ lib/ \
  | grep -v node_modules
```

Expected: no output. If any files appear, migrate them following the patterns in Tasks 7-17.

- [ ] **Step 2: Delete Firebase files**

```bash
rm -rf app/firebase/
rm -rf db/
```

- [ ] **Step 3: Remove Firebase packages**

```bash
npm uninstall firebase firebase-admin
```

- [ ] **Step 4: Verify build**

```bash
npm run type-check
```
Expected: no errors.

```bash
npm run build
```
Expected: successful build.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "chore: remove Firebase — migration to Supabase complete"
```

---

## Final verification

- [ ] Login works (borrower, lender, companyAdmin, superAdmin)
- [ ] Signup works (borrower, bank admin with token)
- [ ] Password reset email arrives
- [ ] Route protection works (wrong role → /unauthorized)
- [ ] Super admin dashboard loads accounts data
- [ ] Lender sees pending solicitudes in marketplace
- [ ] Borrower creates solicitud and sees proposals in real-time
- [ ] Notifications arrive in real-time
- [ ] Beta gate still works
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
