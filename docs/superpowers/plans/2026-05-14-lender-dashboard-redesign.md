# Lender Dashboard Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Visually align the lender dashboard with the borrower dashboard design system — brand color `#0e3a45` throughout, BuscoCrédito logo in sidebar, refined card typography, no blue anywhere.

**Architecture:** Pure visual pass — 6 files modified, zero new routes or API calls. All data fields preserved. Changes are isolated to Tailwind classes, a few structural tweaks (accent bars, label style), and replacing two placeholder tabs with real content.

**Tech Stack:** Next.js App Router, React, Tailwind CSS v4, HeroUI, Framer Motion, Lucide React, `next/image`

**Spec:** `docs/superpowers/specs/2026-05-14-lender-dashboard-redesign.md`

---

## File Map

| File | What changes |
|---|---|
| `components/features/dashboard/LenderSidebar.tsx` | Logo, active states, width, footer |
| `app/lender/page.tsx` | `ml-72→ml-64`, settings tab, help tab |
| `components/lender/LoanRequestCard.tsx` | Accent bar, colors, label style, income format |
| `components/lender/LenderFilters.tsx` | Border color, clear button color |
| `components/lender/MarketplaceView.tsx` | Empty state colors, modal top border |
| `components/lender/MyOffersView.tsx` | Accent bars, colors, label style, empty state |

---

## Task 1: LenderSidebar

**Files:**
- Modify: `components/features/dashboard/LenderSidebar.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
"use client";

import { Button } from "@heroui/react";
import Image from "next/image";
import { Store, FileText, Settings, HelpCircle, BarChart3, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";

type LenderSidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companyName: string;
  userId: string;
};

export function LenderSidebar({
  activeTab,
  setActiveTab,
  companyName,
  userId,
}: LenderSidebarProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!userId) return;
    const db = getFirestore();
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("recipientId", "==", userId),
      where("read", "==", false)
    );
    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      setUnreadCount(snapshot.docs.length);
    });
    return () => unsubscribe();
  }, [userId]);

  const getButtonClass = (tab: string) =>
    `w-full justify-start h-12 px-4 mb-2 transition-all duration-200 ease-in-out ${
      activeTab === tab
        ? "bg-[#0e3a45]/[0.08] text-[#0e3a45] border-r-[3px] border-[#0e3a45] font-semibold"
        : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const navItems = [
    { icon: Store, label: "Mercado", id: "marketplace", description: "Solicitudes disponibles" },
    { icon: FileText, label: "Mis Ofertas", id: "myoffers", description: "Propuestas enviadas" },
    { icon: BarChart3, label: "Métricas", id: "metrics", description: "Estadísticas y análisis" },
    { icon: Bell, label: "Notificaciones", id: "notifications", description: "Alertas y actualizaciones", badge: unreadCount },
    { icon: Settings, label: "Configuración", id: "settings", description: "Perfil y preferencias" },
    { icon: HelpCircle, label: "Ayuda", id: "help", description: "Soporte y FAQ" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-sm h-screen fixed left-0 top-0 z-10 hidden md:block">
      <div className="flex flex-col h-full">
        <div className="px-5 py-5 border-b border-gray-100">
          <Image
            src="/img/logo-buscocredito.png"
            alt="BuscoCrédito"
            width={160}
            height={68}
            className="h-11 w-auto"
            priority
          />
          <p className="text-sm font-semibold text-gray-800 truncate mt-2">{companyName}</p>
          <p className="text-[11px] uppercase tracking-wide text-gray-400 mt-0.5 font-medium">
            Panel de Prestamista
          </p>
        </div>

        <nav className="flex-1 px-4 py-6">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                startContent={
                  <div className="relative">
                    <item.icon className="w-5 h-5" />
                    {item.badge && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </div>
                }
                className={getButtonClass(item.id)}
                variant="light"
                onPress={() => setActiveTab(item.id)}
              >
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="font-semibold text-sm">{item.label}</span>
                  <span className="text-xs opacity-75 truncate w-full text-left">
                    {item.description}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="px-4 py-2.5 bg-[#0e3a45]/5 rounded-lg flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <p className="text-[11px] text-[#0e3a45]/60 font-medium tracking-wide">
              Plataforma segura
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "LenderSidebar" | head -10
```
Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add components/features/dashboard/LenderSidebar.tsx
git commit -m "feat: align LenderSidebar with brand design system"
```

---

## Task 2: page.tsx — layout offset + settings + help tabs

**Files:**
- Modify: `app/lender/page.tsx`

- [ ] **Step 1: Fix the layout margin offset**

In `app/lender/page.tsx`, line ~87, change:
```tsx
// before
<div className="flex-1 ml-72">
```
```tsx
// after
<div className="flex-1 ml-64">
```

- [ ] **Step 2: Replace the settings tab content**

Find this block (around line 161–177):
```tsx
{lenderState.activeTab === "settings" && (
  <div className="max-w-4xl mx-auto">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuración de Cuenta</h1>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Información de la Empresa</h2>
          <p className="text-gray-600">Nombre: {partnerData.company}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Configuraciones</h2>
          <p className="text-gray-600">Próximamente: notificaciones, preferencias, y más.</p>
        </div>
      </div>
    </div>
  </div>
)}
```

Replace with:
```tsx
{lenderState.activeTab === "settings" && (
  <div className="max-w-4xl mx-auto">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="h-1 bg-green-500 w-full" />
      <div className="p-6 space-y-8">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Información de la Empresa
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0e3a45]/[0.08] flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-[#0e3a45]" />
            </div>
            <div>
              <p className="text-base font-semibold text-gray-900">{partnerData.company}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#0e3a45]/[0.08] text-[#0e3a45] uppercase tracking-wide">
                  Prestamista
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-green-100 text-green-700 uppercase tracking-wide">
                  Activa
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Notificaciones
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0e3a45]/[0.08] flex items-center justify-center">
                  <Mail className="w-4 h-4 text-[#0e3a45]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Notificaciones por correo</p>
                  <p className="text-xs text-gray-500">Recibe alertas cuando una propuesta cambie de estado</p>
                </div>
              </div>
              <Switch
                color="success"
                size="sm"
                defaultSelected
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#0e3a45]/[0.08] flex items-center justify-center">
                  <Bell className="w-4 h-4 text-[#0e3a45]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Notificaciones en la plataforma</p>
                  <p className="text-xs text-gray-500">Siempre recibirás notificaciones dentro del panel</p>
                </div>
              </div>
              <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                Siempre activas
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg p-3 text-center">
            Para modificar información de la empresa, contacta a tu administrador.
          </p>
        </div>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 3: Replace the help tab content**

Find this block (around line 179–195):
```tsx
{lenderState.activeTab === "help" && (
  <div className="max-w-4xl mx-auto">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Centro de Ayuda</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-3">¿Cómo funciona?</h3>
          <p className="text-green-700">Encuentra solicitudes de préstamo y envía propuestas competitivas.</p>
        </div>
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Soporte Técnico</h3>
          <p className="text-blue-700">¿Tienes problemas? Contáctanos para recibir ayuda personalizada.</p>
        </div>
      </div>
    </div>
  </div>
)}
```

Replace with:
```tsx
{lenderState.activeTab === "help" && (
  <div className="max-w-4xl mx-auto">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="h-1 bg-green-500 w-full" />
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Centro de Ayuda</h1>
        <p className="text-sm text-gray-500 mb-6">Recursos y soporte para prestamistas</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-5 bg-[#0e3a45]/[0.04] border border-[#0e3a45]/10 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-[#0e3a45]/[0.08] flex items-center justify-center mb-3">
              <BookOpen className="w-4 h-4 text-[#0e3a45]" />
            </div>
            <h3 className="text-sm font-semibold text-[#0e3a45] mb-2">¿Cómo funciona?</h3>
            <p className="text-sm text-gray-600">
              Explora el mercado, evalúa solicitudes de préstamo y envía propuestas competitivas. 
              Cuando un solicitante acepta tu oferta, recibes sus datos de contacto directamente.
            </p>
          </div>
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <div className="w-9 h-9 rounded-lg bg-gray-200 flex items-center justify-center mb-3">
              <HeadphonesIcon className="w-4 h-4 text-gray-600" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Soporte Técnico</h3>
            <p className="text-sm text-gray-600 mb-3">
              ¿Tienes problemas con la plataforma? Nuestro equipo está disponible para ayudarte.
            </p>
            <p className="text-xs font-medium text-gray-500">
              soporte@buscocredito.mx
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
```

- [ ] **Step 4: Add missing imports at the top of `app/lender/page.tsx`**

Add these imports (they aren't currently imported in the file):
```tsx
import { Building2, Mail, Bell, BookOpen, Headphones as HeadphonesIcon } from "lucide-react";
import { Switch } from "@heroui/react";
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "lender/page" | head -10
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add app/lender/page.tsx
git commit -m "feat: fix lender layout offset and replace placeholder settings/help tabs"
```

---

## Task 3: LoanRequestCard (marketplace)

**Files:**
- Modify: `components/lender/LoanRequestCard.tsx`

- [ ] **Step 1: Replace the entire file**

```tsx
import React from "react";
import { Button, Card, Chip, CardBody } from "@heroui/react";
import { DollarSign, MapPin, User } from "lucide-react";
import type { LoanRequest, PublicUserData } from "@/app/lender/types/loan.types";

interface LoanRequestCardProps {
  request: LoanRequest;
  userData: PublicUserData | undefined;
  index: number;
  onMakeOffer: (requestId: string) => void;
}

const LoanRequestCard = ({ request, userData, index, onMakeOffer }: LoanRequestCardProps) => {
  return (
    <Card className="overflow-hidden border border-gray-100 hover:border-[#0e3a45]/20 hover:shadow-md transition-all duration-200">
      <div className="h-1 bg-green-500 w-full" />
      <CardBody className="p-0">
        <div className="p-5 border-b border-gray-100">
          <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">
            Solicitud #{index + 1}
          </p>
          <p className="text-3xl font-bold text-[#0e3a45]">
            ${request.amount.toLocaleString("es-MX")}
          </p>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mb-3">
              <DollarSign className="w-3.5 h-3.5" />
              Detalles del Crédito
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Monto</p>
                <p className="text-sm font-semibold text-gray-800">
                  ${request.amount.toLocaleString("es-MX")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Ingresos Mensuales</p>
                <p className="text-sm font-semibold text-gray-800">
                  ${Number(request.income).toLocaleString("es-MX")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Frecuencia de Pago</p>
                <p className="text-sm font-semibold text-gray-800 capitalize">{request.payment}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Plazo</p>
                <p className="text-sm font-semibold text-gray-800">{request.term}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Propósito</p>
                <p className="text-sm font-semibold text-gray-800">{request.purpose || "No especificado"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Tipo</p>
                <p className="text-sm font-semibold text-gray-800">{request.type || "No especificado"}</p>
              </div>
            </div>
          </div>

          {userData?.creditScore && (
            <div className="bg-[#0e3a45]/[0.04] rounded-lg px-3 py-2.5 flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wide text-gray-500 font-semibold">Score Crediticio</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0e3a45]">{userData.creditScore.score}</span>
                <Chip
                  size="sm"
                  variant="flat"
                  className={
                    userData.creditScore.classification === "Excelente"
                      ? "bg-emerald-100 text-emerald-800"
                      : userData.creditScore.classification === "Bueno"
                      ? "bg-green-100 text-green-800"
                      : userData.creditScore.classification === "Regular"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {userData.creditScore.classification}
                </Chip>
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 flex items-center gap-1.5 mb-3">
              <User className="w-3.5 h-3.5" />
              Solicitante
            </h4>
            <div className="grid grid-cols-3 gap-x-4 gap-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">País</p>
                <p className="text-sm font-semibold text-gray-800">{userData?.country || "N/D"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Estado</p>
                <p className="text-sm font-semibold text-gray-800">{userData?.state || "N/D"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Ciudad</p>
                <p className="text-sm font-semibold text-gray-800">{userData?.city || "N/D"}</p>
              </div>
            </div>
          </div>

          <Button
            className="w-full bg-[#0e3a45] text-white hover:opacity-90"
            onClick={() => onMakeOffer(request.id)}
          >
            Hacer Oferta
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default LoanRequestCard;
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "LoanRequestCard" | head -10
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/lender/LoanRequestCard.tsx
git commit -m "feat: redesign lender LoanRequestCard with brand colors and refined typography"
```

---

## Task 4: LenderFilters

**Files:**
- Modify: `components/lender/LenderFilters.tsx`

- [ ] **Step 1: Update card border and clear button**

Change the Card opening tag (line ~32):
```tsx
// before
<Card className="mb-6 p-4 shadow-sm border border-gray-100">
```
```tsx
// after
<Card className="mb-6 p-4 shadow-sm border border-[#0e3a45]/10">
```

Change the clear filters button (around line ~170):
```tsx
// before
<Button
  size="sm"
  variant="ghost"
  onClick={onClearFilters}
  className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800"
>
  <SlidersHorizontal className="w-4 h-4" />
  Limpiar filtros
</Button>
```
```tsx
// after
<Button
  size="sm"
  variant="ghost"
  onClick={onClearFilters}
  className="flex items-center justify-center gap-2 text-[#0e3a45] hover:bg-[#0e3a45]/[0.05]"
>
  <SlidersHorizontal className="w-4 h-4" />
  Limpiar filtros
</Button>
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "LenderFilters" | head -10
```
Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add components/lender/LenderFilters.tsx
git commit -m "feat: align LenderFilters border and button to brand color"
```

---

## Task 5: MarketplaceView

**Files:**
- Modify: `components/lender/MarketplaceView.tsx`

- [ ] **Step 1: Fix the empty state (remove blue)**

Find the empty state block (around line ~106–128). Replace:
```tsx
<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
  <Store className="w-12 h-12 text-blue-600" />
</div>
```
```tsx
<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#0e3a45]/[0.06] flex items-center justify-center">
  <Store className="w-12 h-12 text-[#0e3a45]" />
</div>
```

- [ ] **Step 2: Fix the empty state button (remove blue)**

Find:
```tsx
<Button
  color="primary"
  size="md"
  onClick={onClearFilters}
  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2"
>
  Limpiar Filtros
</Button>
```
Replace with:
```tsx
<Button
  size="md"
  onClick={onClearFilters}
  className="bg-[#0e3a45] hover:opacity-90 text-white font-semibold px-6 py-2"
>
  Limpiar Filtros
</Button>
```

- [ ] **Step 3: Add top border accent to the ProposalForm modal container**

Find (around line ~159):
```tsx
<div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
```
Replace with:
```tsx
<div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-t-4 border-green-500">
```

- [ ] **Step 4: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "MarketplaceView" | head -10
```
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add components/lender/MarketplaceView.tsx
git commit -m "feat: remove blue from MarketplaceView empty state and add modal accent"
```

---

## Task 6: MyOffersView

**Files:**
- Modify: `components/lender/MyOffersView.tsx`

- [ ] **Step 1: Fix the proposal counter chip**

Find (around line ~140):
```tsx
<div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
  <span className="text-sm text-gray-600">
    {lenderProposals.length} propuestas enviadas
  </span>
</div>
```
Replace with:
```tsx
<div className="flex items-center bg-[#0e3a45]/[0.06] px-3 py-1.5 rounded-full border border-[#0e3a45]/10">
  <span className="text-sm font-medium text-[#0e3a45]">
    {lenderProposals.length} propuestas enviadas
  </span>
</div>
```

- [ ] **Step 2: Add accent bar and fix colors on each proposal Card**

Find the proposal card (around line ~176):
```tsx
<Card
  key={proposal.id}
  className="shadow-md hover:shadow-lg transition-shadow duration-200"
>
  <CardBody className="p-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {proposal.requestInfo?.purpose || "Sin propósito"}
        </h3>
        <p className="text-sm text-gray-500">
          {proposal.requestInfo?.type || "Préstamo"}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-lg font-semibold text-green-600 mb-2">
          ${proposal.amount?.toLocaleString()}
        </span>
```

Replace with:
```tsx
<Card
  key={proposal.id}
  className="overflow-hidden border border-gray-100 hover:border-[#0e3a45]/20 hover:shadow-md transition-all duration-200"
>
  <div className="h-1 bg-green-500 w-full" />
  <CardBody className="p-6">
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-0.5">
          {proposal.requestInfo?.purpose || "Sin propósito"}
        </h3>
        <p className="text-xs text-gray-500">
          {proposal.requestInfo?.type || "Préstamo"}
        </p>
      </div>
      <div className="flex flex-col items-end">
        <span className="text-lg font-bold text-[#0e3a45] mb-2">
          ${proposal.amount?.toLocaleString("es-MX")}
        </span>
```

- [ ] **Step 3: Update the field labels inside each card**

In the `<div className="space-y-3">` block, update all label spans from:
```tsx
<span className="text-gray-500 text-sm">Monto:</span>
```
to the pattern:
```tsx
<span className="text-[10px] uppercase tracking-wide text-gray-400 font-semibold">Monto</span>
```

Apply this pattern to ALL labels in the space-y-3 block:
- `Monto:` → `Monto`
- `Propósito de préstamo:` → `Propósito`
- `Tipo de préstamo:` → `Tipo`
- `Tasa de interés:` → `Tasa de interés`
- `Plazo del préstamo:` → `Plazo`
- `Frecuencia de pago:` → `Frecuencia`
- `Fecha de propuesta:` → `Fecha`
- `Seguro de vida saldo deudor:` → `Seguro vida`
- `Amortización:` → `Amortización`
- `Comisión por apertura:` → `Comisión apertura`

And all values from `<span className="font-medium">` to `<span className="text-sm font-semibold text-gray-800">`.

- [ ] **Step 4: Fix empty state**

Find:
```tsx
<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
  <CreditCard className="w-12 h-12 text-green-600" />
</div>
```
Replace:
```tsx
<div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#0e3a45]/[0.06] flex items-center justify-center">
  <CreditCard className="w-12 h-12 text-[#0e3a45]" />
</div>
```

Find the "Explorar Mercado" button:
```tsx
className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-2 shadow-md hover:shadow-lg transition-all duration-200"
```
Replace:
```tsx
className="bg-[#0e3a45] hover:opacity-90 text-white font-semibold px-6 py-2 shadow-sm transition-all duration-200"
```

- [ ] **Step 5: Type-check**

```bash
npx tsc --noEmit 2>&1 | grep "MyOffersView" | head -10
```
Expected: no output.

- [ ] **Step 6: Final full type-check**

```bash
npx tsc --noEmit 2>&1 | grep "error" | head -20
```
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add components/lender/MyOffersView.tsx
git commit -m "feat: redesign MyOffersView cards with brand colors and refined typography"
```
