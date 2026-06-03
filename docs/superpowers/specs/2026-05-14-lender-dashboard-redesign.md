# Lender Dashboard Redesign — Spec

**Date:** 2026-05-14  
**Scope:** Visual alignment of the lender panel with the borrower dashboard design system. No new backend. No new routes. Option C (full visual pass + refined cards + settings/help content).

---

## Context

The lender dashboard (`/lender`) shares a codebase with the borrower dashboard (`/user_dashboard`) but has diverged visually. The borrower side uses `#0e3a45` consistently; the lender side mixes `green-600` gradients, `blue-*` classes, and inconsistent active states. The goal is one coherent design language across both panels.

**Anti-AI-slop constraint:** Every component must feel like it was designed for a financial tool — dense, purposeful, typographically deliberate. No floating generic cards, no blue-purple gradients, no cookie-cutter layouts.

---

## Design System Reference

| Token | Value |
|---|---|
| Brand primary | `#0e3a45` |
| Active bg | `bg-[#0e3a45]/[0.08]` |
| Hover bg | `hover:bg-[#0e3a45]/[0.04]` |
| Active border | `border-r-[3px] border-[#0e3a45]` |
| Card accent bar | `h-1 bg-green-500` (top of card) |
| Success semantic | `green-*` — only for accepted/positive states |
| Error semantic | `red-*` — only for rejected/error states |
| Warning semantic | `yellow-*` — only for pending states |
| Blue | **Never** |

---

## Section 1 — LenderSidebar

**File:** `components/features/dashboard/LenderSidebar.tsx`

### Changes
- Width: `w-72` → `w-64` (aligned with `DashboardSidebar`)
- Header: Replace the green gradient icon + company name block with:
  - BuscoCrédito logo (`/img/logo-buscocredito.png`, same `Image` component as borrower sidebar, `h-11 w-auto`)
  - Below logo: company name in `text-sm font-semibold text-gray-800 truncate`
  - Below company name: `"Panel de Prestamista"` in `text-[11px] uppercase tracking-wide text-gray-400 mt-0.5`
- Active tab style: `bg-[#0e3a45]/[0.08] text-[#0e3a45] border-r-[3px] border-[#0e3a45] font-semibold`
- Inactive tab style: `text-gray-500 hover:bg-gray-50 hover:text-gray-900`
- Remove all `from-green-50 to-green-100` gradients
- Footer: `bg-[#0e3a45]/5` with green pulse dot + "Plataforma segura" — identical to borrower sidebar

**Consequence in `app/lender/page.tsx`:** `ml-72` → `ml-64`

---

## Section 2 — LoanRequestCard (marketplace)

**File:** `components/lender/LoanRequestCard.tsx`

### Changes
- Top accent bar: `h-1 bg-green-500` at the very top of the card (before `CardBody`)
- Header block:
  - `"Solicitud #N"` in `text-xs uppercase tracking-wide text-gray-400` (label, not hero)
  - Amount in `text-3xl font-bold text-[#0e3a45]` (hero element, replaces `text-green-600`)
- Details section labels: `text-xs uppercase tracking-wide text-gray-400` with values in `text-sm font-semibold text-gray-800`
- Score crediticio: pulled out of the grid into its own highlighted row — `bg-[#0e3a45]/[0.04] rounded-lg px-3 py-2` with the Chip inline
- Solicitante section: `MapPin` icon for location fields, same label style as details
- All section dividers: `border-t border-gray-100`
- "Hacer Oferta" button: `bg-[#0e3a45] text-white hover:opacity-90` (removes `bg-green-600`)
- Income field: `Number(request.income).toLocaleString("es-MX")` (fixes missing comma formatting — same fix applied to borrower card)

---

## Section 3 — MarketplaceView + LenderFilters

**Files:** `components/lender/MarketplaceView.tsx`, `components/lender/LenderFilters.tsx`

### LenderFilters
- Filter card border: `border-[#0e3a45]/10` 
- "Limpiar filtros" button: `text-[#0e3a45] hover:bg-[#0e3a45]/[0.05]`
- No layout changes

### MarketplaceView empty state
- Remove `from-blue-100 to-blue-200` gradient — replace with `bg-[#0e3a45]/[0.06]`
- Remove `text-blue-600` — replace with `text-[#0e3a45]`
- "Limpiar Filtros" button: `bg-[#0e3a45] text-white` (removes `bg-blue-600`)

### ProposalForm modal overlay
- Add `border-t-4 border-green-500` to the white modal container

---

## Section 4 — MyOffersView

**File:** `components/lender/MyOffersView.tsx`

### Changes
- Proposal counter chip: `bg-[#0e3a45]/[0.06] text-[#0e3a45] border border-[#0e3a45]/10`
- Each card: `h-1 bg-green-500` accent bar at top
- Amount (`$X,XXX`): `text-[#0e3a45] font-bold` (removes `text-green-600`)
- Card field labels: `text-xs uppercase tracking-wide text-gray-400`
- Status chips: keep semantic colors (yellow/green/red) — not changed
- Contact info block (accepted): keeps `bg-green-50` — semantic success color, correct
- "Ver Razón" button: keeps `color="danger"` — semantic error context, correct
- Empty state icon: `bg-[#0e3a45]/[0.06] text-[#0e3a45]` (removes `from-green-100 to-green-200 text-green-600`)
- "Explorar Mercado" button: `bg-[#0e3a45] text-white` (removes `bg-green-600`)
- All data fields preserved exactly — zero information removed
- Pagination: verify `MarketplacePagination` active page uses `#0e3a45`

---

## Section 5 — Settings & Help tabs

**File:** `app/lender/page.tsx` (inline tab content)

### Settings tab
Replace the plain placeholder with a structured card:
- Card with `h-1 bg-green-500` accent bar
- Section "Información de la Empresa":
  - Company name with `Building2` icon
  - Role chip: `"Prestamista"` in `bg-[#0e3a45]/[0.08] text-[#0e3a45]`
  - Account status badge: `"Activa"` in `bg-green-100 text-green-700`
- Section "Notificaciones":
  - Email notifications switch — same pattern as `UserSettings` (calls `/api/users/preferences`)
  - In-platform notifications: "Siempre activas" badge (same as borrower)
- Footer note: `"Para modificar información de la empresa, contacta a tu administrador"` in `text-sm text-gray-500 bg-gray-50 rounded-lg p-3`

### Help tab  
Replace the blue card with:
- Card "¿Cómo funciona?": `bg-[#0e3a45]/[0.06] border border-[#0e3a45]/10` with `text-[#0e3a45]` heading
- Card "Soporte Técnico": `bg-gray-50 border border-gray-200` — neutral, no blue
- Remove all `blue-*` classes

---

## File Change Map

| File | Type of change |
|---|---|
| `components/features/dashboard/LenderSidebar.tsx` | Header + active states + footer + width |
| `app/lender/page.tsx` | `ml-72→ml-64`, settings tab content, help tab content |
| `components/lender/LoanRequestCard.tsx` | Colors, label style, accent bar, income format |
| `components/lender/MarketplaceView.tsx` | Empty state colors, modal border |
| `components/lender/LenderFilters.tsx` | Border + button color |
| `components/lender/MyOffersView.tsx` | Colors, label style, accent bars, empty state |

---

## What Is NOT Changing

- All data fields in every component — zero information removed
- All functionality, hooks, API calls, Firestore queries
- Grid layouts and component structure
- Semantic status colors (yellow/green/red chips for proposal status)
- Pagination component internals
- `LenderHeader.tsx` mobile nav (low priority, not in scope)
