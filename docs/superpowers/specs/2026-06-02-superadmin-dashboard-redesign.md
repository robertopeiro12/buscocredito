# Super Admin Dashboard Redesign

**Date:** 2026-06-02  
**Goal:** Make the super admin dashboard visually and structurally consistent with the lender, admin, and borrower dashboards. Identity is communicated through the sidebar label "Panel Super Admin" — no separate color scheme.

---

## Context

The other dashboards (lender, companyAdmin, borrower) share a common pattern:
- Fixed `w-64` white sidebar with logo, nav items, logout at bottom
- `flex-1 ml-64` content area on `bg-gray-50`
- Brand color `#0e3a45` for active nav states (right border + tinted bg)
- Green accent bar `h-1 bg-green-500` on cards/panels
- No sticky top header — just a title + description per tab inside the content area
- Never blue — brand rule from `CLAUDE.md`

The current super admin dashboard breaks all of these: purple theme, gradient sidebar header, separate sticky `SuperAdminHeader`, blue/indigo/cyan stats cards.

---

## Design

### 1. Layout — `app/super_admin_dashboard/page.tsx`

Replace the current `flex flex-col` (SuperAdminHeader on top + content below) with:

```tsx
<div className="flex min-h-screen bg-gray-50">
  <SuperAdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onSignOut={handleSignOut} />
  <div className="flex-1 ml-64">
    <main className="px-4 lg:px-6 pb-4 lg:pb-6 pt-4 lg:pt-6">
      {renderContent()}
    </main>
  </div>
</div>
```

- Remove `SuperAdminHeader` usage entirely from the page
- Remove `isMobileMenuOpen` state (no header toggle needed)
- Each tab in `renderContent()` gets its own title + description + `border-b` divider

### 2. SuperAdminSidebar — `components/superadmin/SuperAdminSidebar.tsx`

Replace the purple gradient header block with the same logo + label pattern as `AdminSidebarUpdated`:

```tsx
<div className="px-5 py-5 border-b border-gray-100">
  <Image src="/img/logo-buscocredito.png" alt="BuscoCrédito" width={160} height={68} className="h-11 w-auto" priority />
  <p className="text-[11px] uppercase tracking-wide text-gray-400 mt-0.5 font-medium">
    Panel Super Admin
  </p>
</div>
```

Active state (same as all other sidebars):
```
bg-[#0e3a45]/[0.08] text-[#0e3a45] border-r-[3px] border-[#0e3a45] font-semibold
```

Inactive state:
```
bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900
```

Logout button at bottom — already present, keep as-is.

Remove: purple gradient, Shield icon header, `🔒 Super Admin Access` badge.

### 3. Tab headers inside `renderContent()`

Each tab currently has an inline `<h2>`. Wrap with the standard pattern:

```tsx
<div className="mb-4 pb-4 border-b border-gray-200">
  <h1 className="text-xl font-bold text-gray-900 mb-0.5">{title}</h1>
  <p className="text-gray-500 text-sm">{description}</p>
</div>
```

Tab titles and descriptions:
| Tab | Title | Description |
|-----|-------|-------------|
| overview | Resumen del Sistema | Vista general de cuentas y actividad |
| accounts | Gestión de Cuentas | Administra y supervisa todas las cuentas |
| tokens | Tokens de Registro | Gestiona tokens de acceso para instituciones |
| beta | Accesos Beta | Controla el acceso a la demo privada |
| stats | Estadísticas | Métricas detalladas de la plataforma |
| database | Base de Datos | Información de colecciones de Firestore |
| system | Estado del Sistema | Salud y rendimiento del servidor |
| settings | Configuración | Ajustes avanzados del sistema |

### 4. StatsCards — `components/superadmin/StatsCards.tsx`

Color replacements — no structural changes:

| Current | Replace with |
|---------|-------------|
| `bg-blue-*` / `text-blue-*` | `bg-[#0e3a45]/[0.08]` / `text-[#0e3a45]` |
| `bg-purple-*` / `text-purple-*` | `bg-[#0e3a45]/[0.08]` / `text-[#0e3a45]` |
| `bg-indigo-*` / `text-indigo-*` | `bg-[#0e3a45]/[0.08]` / `text-[#0e3a45]` |
| `bg-cyan-*` / `text-cyan-*` | `bg-gray-100` / `text-gray-700` |
| `bg-green-*` / `text-green-*` | keep (success states) |
| `bg-red-*` / `text-red-*` | keep (error/disabled states) |
| `bg-yellow-*` / `text-yellow-*` | keep (pending/warning states) |
| `bg-emerald-*` / `text-emerald-*` | keep (approved states) |

Add `h-1 bg-green-500` accent bar at top of each Card (same as other dashboard cards).

User type distribution circles: replace `bg-purple-600`, `bg-blue-600`, `bg-cyan-600` with `bg-[#0e3a45]`, `bg-[#0e3a45]/80`, `bg-[#0e3a45]/60`.

### 5. Other components — color sweep

Files to sweep for purple/blue → brand colors:
- `components/superadmin/AccountsTable.tsx`
- `components/superadmin/AccountDetailModal.tsx`
- `components/superadmin/SystemInfoCards.tsx`
- `components/superadmin/TokenManagement.tsx`
- `components/superadmin/BetaManagement.tsx`
- `components/superadmin/ConfirmActionModal.tsx`

Rule: any `purple-*`, `blue-*`, `indigo-*`, `violet-*` → `[#0e3a45]` or `gray-*`. Keep green/red/yellow for semantic meaning.

### 6. SuperAdminHeader.tsx

Keep the file (used for the mobile `<Menu>` toggle button pattern), but remove the `onSignOut` desktop button (already done). The header is no longer rendered in the page.

---

## Files changed

| File | Change |
|------|--------|
| `app/super_admin_dashboard/page.tsx` | New layout, remove header, add tab title pattern |
| `components/superadmin/SuperAdminSidebar.tsx` | Replace purple header with logo + label |
| `components/superadmin/StatsCards.tsx` | Color sweep + green accent bars |
| `components/superadmin/AccountsTable.tsx` | Color sweep |
| `components/superadmin/AccountDetailModal.tsx` | Color sweep |
| `components/superadmin/SystemInfoCards.tsx` | Color sweep |
| `components/superadmin/TokenManagement.tsx` | Color sweep |
| `components/superadmin/BetaManagement.tsx` | Color sweep |
| `components/superadmin/ConfirmActionModal.tsx` | Color sweep |

## Out of scope

- Functionality changes — zero
- Routing or auth changes — zero
- Adding new tabs or features — zero
- Mobile layout — sidebar stays `hidden md:block` as-is
