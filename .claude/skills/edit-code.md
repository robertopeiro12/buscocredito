# edit-code

Skill for editing the BuscoCredito codebase following established structure, conventions, and self-validation.

## Trigger

When the user asks to add, modify, or refactor code in this project (components, hooks, API routes, types, utils, services, db functions).

## Instructions

You are editing a **Next.js 16 + React 19 + TypeScript + Firebase/Firestore + Tailwind CSS + HeroUI** project. Spanish-language UI, all comments in Spanish.

### 1. UNDERSTAND BEFORE EDITING

Before making any change:
- **Read the target file(s)** completely.
- **Read related types** in `/types/` to understand the data model.
- **Read related hooks/utils/services** that interact with the code you're changing.
- If touching an API route, read `/app/api/utils/auth.ts` for the auth pattern.

### 2. FILE PLACEMENT RULES

Follow this exact structure — never create files outside these conventions:

| What you're creating | Where it goes | Naming |
|---|---|---|
| Page | `/app/<route>/page.tsx` | kebab-case route dirs, always `page.tsx` |
| API Route | `/app/api/<endpointName>/route.ts` | camelCase folder, always `route.ts` |
| Reusable UI component | `/components/common/ui/<Name>.tsx` | PascalCase |
| Layout component | `/components/common/layout/<Name>.tsx` | PascalCase |
| Feature component | `/components/features/<feature>/<Name>.tsx` | PascalCase |
| Role-specific component | `/components/<role>/<Name>.tsx` | PascalCase (`admin/`, `lender/`, `superadmin/`) |
| Hook | `/hooks/use<Feature>.ts` | camelCase with `use` prefix |
| Lender-specific hook | `/app/lender/hooks/use<Feature>.ts` | camelCase with `use` prefix |
| Utility function | `/utils/<name>.ts` | camelCase |
| Type definitions | `/types/entities/<domain>.types.ts` or `/types/<feature>.ts` | camelCase, `.types.ts` suffix for entities |
| DB function | `/db/<Name>.ts` | PascalCase |
| Service | `/services/<name>-service.ts` | kebab-case with `-service` suffix |
| Config | `/config/<name>.ts` | camelCase |
| Context | `/contexts/<Name>Context.tsx` | PascalCase with `Context` suffix |

### 3. CODE PATTERNS TO FOLLOW

#### Components
```tsx
"use client"; // Only if component uses hooks, event handlers, or browser APIs

import { useState } from 'react'; // React imports first
import { Button } from '@heroui/react'; // UI library imports second
import { SomeType } from '@/types/...'; // Internal types third
import { someUtil } from '@/utils/...'; // Internal utils fourth

interface ComponentNameProps {
  // Props interface defined above the component
}

export default function ComponentName({ prop1, prop2 }: ComponentNameProps) {
  // Hook calls at top
  // Handlers next
  // Return JSX
}
```

#### API Routes
```ts
import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { initAdmin } from '@/db/FirebaseAdmin';
import { verifyAuthentication, createUnauthorizedResponse } from '../utils/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuthentication(request);
    if (!user) return createUnauthorizedResponse();

    // Role check if needed
    if (user.userType !== 'expected_role') {
      return new Response(
        JSON.stringify({ error: 'Acceso denegado' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await initAdmin();
    // Business logic...
    return NextResponse.json({ data }, { status: 200 });
  } catch (e) {
    console.error('Error in <endpoint>:', e);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
```

#### Hooks
```ts
import { useState, useEffect, useCallback } from 'react';
import { auth } from '@/app/firebase';
import type { SomeType } from '@/types/...';

interface UseFeatureOptions {
  // Options interface
}

export function useFeature(options: UseFeatureOptions = {}) {
  const [data, setData] = useState<SomeType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Return { data, loading, error, ...actions }
}
```

### 4. CRITICAL CONVENTIONS

- **Path alias:** Always use `@/` for imports (maps to project root).
- **"use client":** Required on any component that uses React hooks, event handlers, or browser APIs. Omit for server components.
- **"server-only":** Import at top of all API route files.
- **User roles:** `'super_admin' | 'b_admin' | 'b_sale' | 'user'` — always check with `user.userType`.
- **Firebase init:** Call `await initAdmin()` in API routes before any Firestore operation.
- **Error messages in Spanish:** `'Acceso denegado'`, `'Error interno del servidor'`, `'No autorizado'`.
- **Firestore collections:** `'solicitudes'` (loan requests), `'propuestas'` (proposals), `'users'` (users), `'admin'` (companies).
- **Toast notifications:** Use `react-hot-toast` (`toast.success()`, `toast.error()`).
- **No test files exist** — validation relies on type-check and lint (see step 5).

### 5. SELF-VALIDATION (MANDATORY)

After every edit, run these checks **in order**. Stop and fix if any step fails before proceeding to the next:

```bash
# Step 1: TypeScript type checking — catches type errors across the project
npm run type-check 2>&1 | head -50

# Step 2: Build check — ensures the app compiles for production (run for significant changes)
npm run build 2>&1 | tail -30
```

**Validation rules:**
- **Step 1 (type-check):** MUST pass with zero errors. If it fails, fix all type errors before continuing.
- **Step 2 (build):** Run for any change that adds new files, modifies exports, or changes API routes. If it fails, read the error and fix it.

**Note:** ESLint is not currently configured for ESLint v9 (project has `.eslintrc.json` but ESLint 9 requires `eslint.config.mjs`). Skip lint until the user migrates the config.

If a check reveals pre-existing errors unrelated to your change, note them to the user but do not fix them unless asked.

### 6. IMPORT ORDER

Always follow this import order, with a blank line between groups:

1. `"server-only"` or `"use client"` directive (no blank line after)
2. React / Next.js imports
3. Third-party library imports (HeroUI, Firebase, chart.js, etc.)
4. Internal types (`@/types/...`)
5. Internal utilities/services (`@/utils/...`, `@/services/...`, `@/db/...`)
6. Internal components (`@/components/...`)
7. Relative imports (`./`, `../`)

### 7. CHANGE SCOPE

- Only edit what was requested. Do not refactor surrounding code.
- Do not add docstrings, comments, or type annotations to code you did not change.
- Do not add error handling for impossible scenarios.
- Do not create abstractions for one-off operations.
- Prefer editing existing files over creating new ones.
