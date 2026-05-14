# Signup Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar la página de signup con two-panel layout, eliminar azul fuera de marca, y limpiar antipatrones técnicos.

**Architecture:** Panel izquierdo oscuro (`#0e3a45`) con copy dinámico por paso + panel derecho blanco con formulario. Step indicator rediseñado con checkmarks. Toda referencia a `blue-*` reemplazada por `#0e3a45`. Estilos PhoneInput movidos a globals.css. Helper `getRedirectPath` extraído a `lib/navigation.ts`.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, HeroUI, Vitest + Testing Library

---

## File Map

| Acción | Archivo | Responsabilidad |
|--------|---------|-----------------|
| Crear | `lib/navigation.ts` | Helper `getRedirectPath` compartido |
| Crear | `lib/navigation.test.ts` | Tests del helper |
| Modificar | `app/login/page.tsx` | Importar `getRedirectPath` de `lib/navigation.ts` |
| Modificar | `styles/globals.css` | Agregar estilos PhoneInput |
| Modificar | `app/signup/layout.tsx` | Simplificar a wrapper mínimo |
| Modificar | `components/signup/StepIndicator.tsx` | Rediseño completo con checkmarks |
| Modificar | `components/signup/StepHeaderWithStep.tsx` | Eliminar azul → `#0e3a45` |
| Modificar | `components/signup/InputField.tsx` | Focus ring `#0e3a45` |
| Modificar | `components/signup/StepContent.tsx` | CP loading color `#0e3a45` |
| Modificar | `app/signup/page.tsx` | Two-panel layout, eliminar styles injection, usar `getRedirectPath` |

---

### Task 1: Crear `lib/navigation.ts` con `getRedirectPath`

**Files:**
- Create: `lib/navigation.ts`
- Create: `lib/navigation.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```typescript
// lib/navigation.test.ts
import { describe, it, expect } from 'vitest';
import { getRedirectPath } from './navigation';

describe('getRedirectPath', () => {
  it('redirige superAdmin a /super_admin_dashboard', () => {
    expect(getRedirectPath('superAdmin')).toBe('/super_admin_dashboard');
  });

  it('redirige companyAdmin a /admin_dashboard', () => {
    expect(getRedirectPath('companyAdmin')).toBe('/admin_dashboard');
  });

  it('redirige lender a /lender', () => {
    expect(getRedirectPath('lender')).toBe('/lender');
  });

  it('redirige borrower a /user_dashboard', () => {
    expect(getRedirectPath('borrower')).toBe('/user_dashboard');
  });

  it('redirige tipo desconocido a /user_dashboard', () => {
    expect(getRedirectPath('unknown' as any)).toBe('/user_dashboard');
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

```bash
npx vitest run lib/navigation.test.ts
```

Resultado esperado: FAIL — "Cannot find module './navigation'"

- [ ] **Step 3: Implementar `lib/navigation.ts`**

```typescript
// lib/navigation.ts
import type { UserRole } from '@/types/entities/account.types';

export function getRedirectPath(userType: UserRole | string): string {
  switch (userType) {
    case 'superAdmin':
      return '/super_admin_dashboard';
    case 'companyAdmin':
      return '/admin_dashboard';
    case 'lender':
      return '/lender';
    case 'borrower':
    default:
      return '/user_dashboard';
  }
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

```bash
npx vitest run lib/navigation.test.ts
```

Resultado esperado: PASS — 5 tests passed

- [ ] **Step 5: Commit**

```bash
git add lib/navigation.ts lib/navigation.test.ts
git commit -m "feat: add getRedirectPath helper to lib/navigation"
```

---

### Task 2: Usar `getRedirectPath` en login page

**Files:**
- Modify: `app/login/page.tsx`

- [ ] **Step 1: Reemplazar la función local por el import**

En `app/login/page.tsx`, eliminar la función `getRedirectPath` local (líneas 10-22) y agregar el import:

```typescript
// Agregar al bloque de imports al inicio del archivo
import { getRedirectPath } from '@/lib/navigation';
```

Eliminar este bloque completo del archivo:
```typescript
// Helper function to get redirect path based on user type
const getRedirectPath = (userType: string): string => {
  switch (userType) {
    case "superAdmin":
      return "/super_admin_dashboard";
    case "companyAdmin":
      return "/admin_dashboard";
    case "lender":
      return "/lender";
    case "borrower":
    default:
      return "/user_dashboard";
  }
};
```

- [ ] **Step 2: Verificar que no hay errores de tipos**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores

- [ ] **Step 3: Commit**

```bash
git add app/login/page.tsx
git commit -m "refactor: use shared getRedirectPath in login page"
```

---

### Task 3: Mover estilos PhoneInput a globals.css

**Files:**
- Modify: `styles/globals.css`
- Modify: `app/signup/page.tsx` (solo eliminar el bloque de styles)

- [ ] **Step 1: Agregar estilos al final de `styles/globals.css`**

```css
/* PhoneInput overrides */
.phone-input-container {
  width: 100% !important;
}

.phone-input-container .form-control {
  width: 100% !important;
  height: 46px !important;
}

.phone-input-container .flag-dropdown {
  background-color: transparent !important;
  border: none !important;
  border-right: 1px solid #e5e7eb !important;
}

.phone-input-container .selected-flag {
  background-color: transparent !important;
}

.phone-input-flag-button-error {
  border-color: #FCA5A5 !important;
}

.phone-input-container .country-list {
  margin: 0;
  padding: 0;
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.phone-input-container .country-list .country {
  padding: 8px 12px;
}

.phone-input-container .country-list .country:hover {
  background-color: #f3f4f6;
}

.phone-input-container .country-list .country.highlight {
  background-color: #e5e7eb;
}
```

- [ ] **Step 2: Eliminar el bloque de styles injection de `app/signup/page.tsx`**

Eliminar estas líneas al final del archivo (después del componente):

```typescript
// Estilos para el componente de teléfono
const styles = `
  .phone-input-container {
    ...todo el bloque...
  }
`;

if (typeof document !== "undefined") {
  const styleElement = document.createElement("style");
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}
```

- [ ] **Step 3: Verificar que no hay errores de tipos**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores

- [ ] **Step 4: Commit**

```bash
git add styles/globals.css app/signup/page.tsx
git commit -m "fix: move PhoneInput styles to globals.css, remove document.createElement antipattern"
```

---

### Task 4: Simplificar `app/signup/layout.tsx`

**Files:**
- Modify: `app/signup/layout.tsx`

- [ ] **Step 1: Reemplazar el contenido completo del layout**

```typescript
// app/signup/layout.tsx
export default function SignUpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Verificar tipo**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores

- [ ] **Step 3: Commit**

```bash
git add app/signup/layout.tsx
git commit -m "refactor: simplify signup layout, remove duplicate background"
```

---

### Task 5: Rediseñar `StepIndicator`

**Files:**
- Modify: `components/signup/StepIndicator.tsx`

- [ ] **Step 1: Reemplazar el componente completo**

```typescript
// components/signup/StepIndicator.tsx
import React from 'react';
import { Check } from 'lucide-react';
import { StepIndicatorProps } from '@/types/signup';

const steps = [
  { number: 1, title: 'Personal' },
  { number: 2, title: 'Contacto' },
  { number: 3, title: 'Dirección' },
  { number: 4, title: 'Cuenta' },
];

const StepIndicator = ({ currentStep }: StepIndicatorProps) => {
  return (
    <nav aria-label="Progreso del registro">
      <ol className="flex items-center w-full">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isActive = step.number === currentStep;
          const isPending = step.number > currentStep;

          return (
            <li key={step.number} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCompleted
                      ? 'bg-[#0e3a45] border-[#0e3a45]'
                      : isActive
                      ? 'bg-white border-[#0e3a45]'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  ) : (
                    <span
                      className={`text-sm font-semibold ${
                        isActive ? 'text-[#0e3a45]' : 'text-gray-400'
                      }`}
                    >
                      {step.number}
                    </span>
                  )}
                </div>
                <span
                  className={`mt-1.5 text-xs font-medium ${
                    isCompleted || isActive ? 'text-[#0e3a45]' : 'text-gray-400'
                  }`}
                >
                  {step.title}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-300 ${
                    isCompleted ? 'bg-[#0e3a45]' : 'bg-gray-200'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default StepIndicator;
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores

- [ ] **Step 3: Commit**

```bash
git add components/signup/StepIndicator.tsx
git commit -m "feat: redesign StepIndicator with checkmarks and brand colors"
```

---

### Task 6: Actualizar `StepHeaderWithStep` — eliminar azul

**Files:**
- Modify: `components/signup/StepHeaderWithStep.tsx`

- [ ] **Step 1: Reemplazar el componente completo**

```typescript
// components/signup/StepHeaderWithStep.tsx
import React from 'react';
import { User, Phone, MapPin, Lock } from 'lucide-react';

interface StepHeaderWithStepProps {
  step: number;
}

const stepInfo = {
  1: { icon: User, title: 'Datos Personales', description: 'Ingresa tu información personal básica' },
  2: { icon: Phone, title: 'Contacto y RFC', description: 'Información de contacto y RFC para verificación' },
  3: { icon: MapPin, title: 'Dirección', description: 'Tu dirección de residencia' },
  4: { icon: Lock, title: 'Crear tu Cuenta', description: 'Configura tu cuenta de acceso' },
};

const StepHeaderWithStep = ({ step }: StepHeaderWithStepProps) => {
  const current = stepInfo[step as keyof typeof stepInfo];
  const Icon = current.icon;

  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0e3a45]/10">
        <Icon className="h-6 w-6 text-[#0e3a45]" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold text-gray-900">{current.title}</h2>
      <p className="mt-1 text-sm text-gray-500">{current.description}</p>
    </div>
  );
};

export default StepHeaderWithStep;
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores

- [ ] **Step 3: Commit**

```bash
git add components/signup/StepHeaderWithStep.tsx
git commit -m "fix: replace blue colors with brand color in StepHeaderWithStep"
```

---

### Task 7: Actualizar `InputField` — focus ring a `#0e3a45`

**Files:**
- Modify: `components/signup/InputField.tsx`

- [ ] **Step 1: Reemplazar la clase de focus ring en el input**

Buscar en `components/signup/InputField.tsx` la clase:
```
"border-gray-300 focus:ring-blue-500 focus:border-blue-500"
```

Reemplazar con:
```
"border-gray-300 focus:ring-[#0e3a45] focus:border-[#0e3a45]"
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores

- [ ] **Step 3: Commit**

```bash
git add components/signup/InputField.tsx
git commit -m "fix: replace blue focus ring with brand color in InputField"
```

---

### Task 8: Actualizar `StepContent` — CP loading a `#0e3a45`

**Files:**
- Modify: `components/signup/StepContent.tsx`

- [ ] **Step 1: Reemplazar color del loading de CP**

Buscar en `components/signup/StepContent.tsx`:
```
className="mt-1 text-sm text-blue-600 flex items-center gap-1"
```

Reemplazar con:
```
className="mt-1 text-sm text-[#0e3a45] flex items-center gap-1"
```

Buscar:
```
className="text-green-600 underline hover:text-green-700"
```
Son los botones de Términos y Política dentro del checkbox. Reemplazar con:
```
className="text-[#0e3a45] underline hover:opacity-70"
```

Buscar los botones del Modal:
```
className="bg-green-600 hover:bg-green-700"
```
Reemplazar con:
```
className="bg-[#0e3a45] hover:opacity-90 text-white"
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores

- [ ] **Step 3: Commit**

```bash
git add components/signup/StepContent.tsx
git commit -m "fix: replace blue and off-brand greens with brand color in StepContent"
```

---

### Task 9: Reescribir `app/signup/page.tsx` — two-panel layout

**Files:**
- Modify: `app/signup/page.tsx`

- [ ] **Step 1: Reemplazar el contenido completo de `app/signup/page.tsx`**

```typescript
// app/signup/page.tsx
"use client";

import React, { useEffect } from "react";
import { ArrowRight, ArrowLeft, AlertCircle, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import StepIndicator from "@/components/signup/StepIndicator";
import StepHeaderWithStep from "@/components/signup/StepHeaderWithStep";
import StepContent from "@/components/signup/StepContent";
import { useSignupForm } from "@/hooks/useSignupForm";
import { getRedirectPath } from "@/lib/navigation";

const leftPanelContent = {
  1: {
    title: "Cuéntanos quién eres",
    subtitle: "Tu nombre es el primer paso para conectarte con las mejores ofertas financieras.",
  },
  2: {
    title: "Datos de contacto",
    subtitle: "Necesitamos verificar tu identidad para proteger tu perfil crediticio.",
  },
  3: {
    title: "Tu domicilio",
    subtitle: "Las instituciones financieras usan tu ubicación para personalizar sus ofertas.",
  },
  4: {
    title: "Crea tu acceso",
    subtitle: "Ya casi terminas. Configura tus credenciales de acceso.",
  },
};

export default function Signup() {
  const { user } = useAuth();
  const router = useRouter();

  const {
    step,
    formData,
    errors,
    isSubmitting,
    isLoadingCP,
    handleInputChange,
    handleAddressChange,
    handlePhoneChange,
    handleStateChange,
    handleTermsChange,
    handleNextStep,
    handlePrevStep,
    handleSubmit,
  } = useSignupForm();

  useEffect(() => {
    if (user && user.type) {
      router.push(getRedirectPath(user.type));
    }
  }, [user, router]);

  const panel = leftPanelContent[step as keyof typeof leftPanelContent];

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — solo desktop */}
      <div className="hidden md:flex md:w-2/5 bg-[#0e3a45] flex-col relative overflow-hidden">
        {/* Franja superior */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />

        {/* Patrón geométrico */}
        <div className="absolute inset-0 pointer-events-none">
          <svg className="absolute right-0 top-0 h-full opacity-[0.06]" viewBox="0 0 300 800" fill="none">
            <circle cx="250" cy="150" r="180" stroke="white" strokeWidth="50" />
            <circle cx="250" cy="500" r="120" stroke="white" strokeWidth="35" />
            <circle cx="250" cy="750" r="70" stroke="white" strokeWidth="25" />
          </svg>
          <svg className="absolute left-0 bottom-0 h-2/3 opacity-[0.04]" viewBox="0 0 300 600" fill="none">
            <circle cx="50" cy="500" r="180" stroke="white" strokeWidth="50" />
            <circle cx="50" cy="250" r="100" stroke="white" strokeWidth="30" />
          </svg>
        </div>

        {/* Contenido */}
        <div className="relative z-10 flex flex-col justify-between h-full p-10">
          <div>
            <Image
              src="/img/logo-buscocredito.png"
              alt="BuscoCrédito"
              width={160}
              height={45}
              className="h-10 w-auto brightness-0 invert"
            />
          </div>

          <div className="space-y-4">
            <p className="text-green-400 text-sm font-semibold uppercase tracking-widest">
              Paso {step} de 4
            </p>
            <h2 className="text-3xl font-bold text-white leading-snug">
              {panel.title}
            </h2>
            <p className="text-white/60 text-base leading-relaxed">
              {panel.subtitle}
            </p>
          </div>

          <p className="text-white/30 text-xs">
            BuscoCrédito no otorga préstamos. Es un intermediario financiero.
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 bg-white flex flex-col">
        {/* Header mobile */}
        <div className="md:hidden flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <Image
            src="/img/logo-buscocredito.png"
            alt="BuscoCrédito"
            width={120}
            height={34}
            className="h-8 w-auto"
          />
        </div>

        <div className="flex-1 flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
          <div className="w-full max-w-md mx-auto space-y-8">
            {/* Step indicator */}
            <StepIndicator currentStep={step} />

            <form onSubmit={handleSubmit} className="space-y-8">
              <StepHeaderWithStep step={step} />

              <StepContent
                step={step}
                formData={formData}
                errors={errors}
                isLoadingCP={isLoadingCP}
                handleInputChange={handleInputChange}
                handleAddressChange={handleAddressChange}
                handlePhoneChange={handlePhoneChange}
                handleStateChange={handleStateChange}
                handleTermsChange={handleTermsChange}
              />

              {/* Botones de navegación */}
              <div className="flex justify-between items-center pt-2">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center px-5 py-2.5 border border-[#0e3a45] text-sm font-medium rounded-full text-[#0e3a45] bg-white hover:bg-[#0e3a45]/5 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-6 py-2.5 text-sm font-semibold rounded-full text-white bg-[#0e3a45] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creando cuenta...
                    </>
                  ) : step === 4 ? (
                    'Registrarse'
                  ) : (
                    <>
                      Siguiente
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </button>
              </div>

              {/* Error de envío */}
              {errors.submit && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <p className="ml-3 text-sm text-red-700">{errors.submit}</p>
                  </div>
                </div>
              )}
            </form>

            {/* Footer del form */}
            <div className="space-y-4 pt-2">
              <p className="text-center text-sm text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="font-medium text-[#0e3a45] hover:underline">
                  Inicia sesión aquí
                </Link>
              </p>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400 border-t border-gray-100 pt-4">
                <Shield className="w-3.5 h-3.5" />
                <span>Conexión segura · Tus datos están protegidos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Resultado esperado: sin errores

- [ ] **Step 3: Correr todos los tests**

```bash
npm test
```

Resultado esperado: todos los tests pasan

- [ ] **Step 4: Commit**

```bash
git add app/signup/page.tsx
git commit -m "feat: redesign signup with two-panel layout and brand colors"
```

---

### Task 10: Verificación final

**Files:** ninguno nuevo

- [ ] **Step 1: Type check completo**

```bash
npm run type-check
```

Resultado esperado: sin errores

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Resultado esperado: sin warnings nuevos

- [ ] **Step 3: Tests completos**

```bash
npm test
```

Resultado esperado: todos los tests pasan

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "chore: signup redesign complete — two-panel layout, brand consistency, no blue"
```
