# Super Admin Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the super admin dashboard visually and structurally consistent with the lender/admin/borrower dashboards — same layout, same brand colors, label "Panel Super Admin" as the only identity marker.

**Architecture:** Replace the purple gradient sidebar header with a logo + label block. Remove `SuperAdminHeader` from the page layout. Sweep all `purple-*`, `blue-*`, `indigo-*`, `cyan-*` color classes to brand colors (`#0e3a45`, `gray-*`). No logic changes.

**Tech Stack:** Next.js 16, React, HeroUI, Tailwind CSS v4, Lucide React

---

## Files changed

| File | Change |
|------|--------|
| `components/superadmin/SuperAdminSidebar.tsx` | Replace purple header with logo + "Panel Super Admin" label; brand active states |
| `app/super_admin_dashboard/page.tsx` | Remove SuperAdminHeader + isMobileMenuOpen; new layout; tab title/description headers |
| `components/superadmin/StatsCards.tsx` | Color sweep + green accent bars on cards |
| `components/superadmin/AccountDetailModal.tsx` | Avatar gradient + blue stats → brand colors |
| `components/superadmin/SystemInfoCards.tsx` | purple/blue/indigo info blocks → brand colors |
| `components/superadmin/TokenManagement.tsx` | purple Key icon → brand color |

---

## Task 1: Redesign SuperAdminSidebar

**Files:**
- Modify: `components/superadmin/SuperAdminSidebar.tsx`

- [ ] **Step 1: Replace purple gradient header with logo + label**

Replace the entire header section (the `<div className="p-6 border-b...">` block with Shield icon and gradient) with:

```tsx
import Image from "next/image";
// ... keep other imports, remove Shield from lucide imports

// Replace header block:
<div className="px-5 py-5 border-b border-gray-100">
  <Image
    src="/img/logo-buscocredito.png"
    alt="BuscoCrédito"
    width={160}
    height={68}
    className="h-11 w-auto"
    priority
  />
  <p className="text-[11px] uppercase tracking-wide text-gray-400 mt-0.5 font-medium">
    Panel Super Admin
  </p>
</div>
```

- [ ] **Step 2: Update active/inactive button classes**

Replace `getButtonClass` to match other sidebars exactly:

```tsx
const getButtonClass = (tab: string) =>
  `w-full justify-start h-12 px-4 mb-2 transition-all duration-200 ease-in-out ${
    activeTab === tab
      ? "bg-[#0e3a45]/[0.08] text-[#0e3a45] border-r-[3px] border-[#0e3a45] font-semibold"
      : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
  }`;
```

- [ ] **Step 3: Remove purple footer badge, keep logout**

Remove the `🔒 Super Admin Access` purple badge block:
```tsx
// DELETE this block:
<div className="px-4 py-2 mt-2 bg-purple-50 rounded-lg">
  <p className="text-xs text-purple-600 text-center font-medium">
    🔒 Super Admin Access
  </p>
</div>
```
Keep the `<Button>` Cerrar Sesión as-is.

- [ ] **Step 4: Verify TypeScript**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep "SuperAdminSidebar"
```
Expected: no output (no errors).

- [ ] **Step 5: Commit**

```bash
git add components/superadmin/SuperAdminSidebar.tsx
git commit -m "feat: redesign SuperAdminSidebar to match brand design system"
```

---

## Task 2: Refactor page layout — remove SuperAdminHeader

**Files:**
- Modify: `app/super_admin_dashboard/page.tsx`

- [ ] **Step 1: Remove SuperAdminHeader import and isMobileMenuOpen state**

```tsx
// REMOVE these lines:
import { useState } from "react";           // remove if only used for isMobileMenuOpen
// ...
SuperAdminHeader,                           // remove from superadmin imports
// ...
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
```

- [ ] **Step 2: Replace the outer return layout**

Replace the entire `return (...)` block's outer structure. From:
```tsx
return (
  <div className="min-h-screen bg-gray-50">
    <SuperAdminSidebar ... />
    {isMobileMenuOpen && ( ... mobile overlay ... )}
    <div className="md:ml-64">
      <SuperAdminHeader ... />
      <main className="p-4 md:p-6 lg:p-8">
        {error && ( ... )}
        {renderContent()}
      </main>
    </div>
    <AccountDetailModal ... />
    <ConfirmActionModal ... />
  </div>
);
```

To:
```tsx
return (
  <div className="flex min-h-screen bg-gray-50">
    <SuperAdminSidebar
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onSignOut={handleSignOut}
    />

    <div className="flex-1 ml-64">
      <main className="px-4 lg:px-6 pb-4 lg:pb-6 pt-4 lg:pt-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        )}
        {renderContent()}
      </main>
    </div>

    <AccountDetailModal
      account={selectedAccount}
      isOpen={isAccountModalOpen}
      onClose={() => {
        setIsAccountModalOpen(false);
        setSelectedAccount(null);
      }}
      onActivate={handleActivate}
      onDeactivate={handleDeactivate}
      onDelete={handleDelete}
    />

    <ConfirmActionModal
      isOpen={isConfirmModalOpen}
      confirmAction={confirmAction}
      onConfirm={handleConfirmAction}
      onClose={() => {
        setIsConfirmModalOpen(false);
        setConfirmAction(null);
      }}
    />
  </div>
);
```

- [ ] **Step 3: Add tab title/description header to each renderContent() case**

Add this helper above `renderContent`:
```tsx
const TAB_META: Record<string, { title: string; description: string }> = {
  overview:  { title: "Resumen del Sistema",        description: "Vista general de cuentas y actividad de la plataforma" },
  accounts:  { title: "Gestión de Cuentas",         description: "Administra y supervisa todas las cuentas registradas" },
  tokens:    { title: "Tokens de Registro",         description: "Gestiona tokens de acceso para nuevas instituciones" },
  beta:      { title: "Accesos Beta",               description: "Controla el acceso a la demo privada" },
  stats:     { title: "Estadísticas",               description: "Métricas detalladas de la plataforma" },
  database:  { title: "Base de Datos",              description: "Información de colecciones de Firestore" },
  system:    { title: "Estado del Sistema",         description: "Salud y rendimiento del servidor" },
  settings:  { title: "Configuración",              description: "Ajustes avanzados del sistema" },
};
```

Add this component inside `renderContent()`, at the top of every case before its content:
```tsx
const TabHeader = () => {
  const meta = TAB_META[activeTab];
  if (!meta) return null;
  return (
    <div className="mb-4 pb-4 border-b border-gray-200">
      <h1 className="text-xl font-bold text-gray-900 mb-0.5">{meta.title}</h1>
      <p className="text-gray-500 text-sm">{meta.description}</p>
    </div>
  );
};
```

Then each case becomes:
```tsx
case "overview":
  return (
    <div className="space-y-6">
      <TabHeader />
      <div className="flex justify-end">
        <Button size="sm" variant="bordered" startContent={<RefreshCw className="w-4 h-4" />}
          onPress={() => { fetchAccountsAndStats(); fetchSystemInfo(); }}>
          Actualizar
        </Button>
      </div>
      <StatsCards stats={stats} isLoading={isLoading} />
    </div>
  );

case "accounts":
  return (
    <div className="space-y-6">
      <TabHeader />
      <AccountsTable ... />   {/* keep all props as-is */}
    </div>
  );

case "tokens":
  return (
    <div className="space-y-6">
      <TabHeader />
      <TokenManagement />
    </div>
  );

case "beta":
  return (
    <div className="space-y-6">
      <TabHeader />
      <BetaManagement getAuthToken={getAuthToken} />
    </div>
  );

case "stats":
  return (
    <div className="space-y-6">
      <TabHeader />
      <StatsCards stats={stats} isLoading={isLoading} />
    </div>
  );

case "database":
  return (
    <div className="space-y-6">
      <TabHeader />
      <div className="flex justify-end">
        <Button size="sm" variant="bordered" startContent={<RefreshCw className="w-4 h-4" />}
          onPress={fetchSystemInfo}>
          Actualizar
        </Button>
      </div>
      <SystemInfoCards databaseInfo={databaseInfo} serverHealth={null} isLoading={isLoading} />
    </div>
  );

case "system":
  return (
    <div className="space-y-6">
      <TabHeader />
      <div className="flex justify-end">
        <Button size="sm" variant="bordered" startContent={<RefreshCw className="w-4 h-4" />}
          onPress={fetchSystemInfo}>
          Actualizar
        </Button>
      </div>
      <SystemInfoCards databaseInfo={null} serverHealth={serverHealth} isLoading={isLoading} />
    </div>
  );

case "settings":
  return (
    <div className="space-y-6">
      <TabHeader />
      <Card>
        <CardBody>
          <p className="text-gray-500">La configuración avanzada estará disponible próximamente.</p>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Zona de Precaución</span>
            </div>
            <p className="text-sm text-yellow-600 mt-2">
              Las opciones de configuración que afectan a todo el sistema estarán protegidas con confirmación adicional.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
```

- [ ] **Step 4: Remove unused imports**

After refactoring, remove from imports:
- `SuperAdminHeader` from the superadmin import block
- `CardHeader` if no longer used
- Any other imports the linter flags as unused

- [ ] **Step 5: Verify TypeScript**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep "super_admin_dashboard"
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
git add app/super_admin_dashboard/page.tsx
git commit -m "feat: replace SuperAdminHeader with sidebar-only layout, add tab headers"
```

---

## Task 3: Color sweep — StatsCards

**Files:**
- Modify: `components/superadmin/StatsCards.tsx`

- [ ] **Step 1: Update mainStats color objects**

Replace the color fields in `mainStats` array:
```tsx
const mainStats = [
  {
    title: "Total Cuentas",
    value: stats.totalAccounts,
    icon: Users,
    iconBg: "bg-[#0e3a45]/[0.08]",
    iconColor: "text-[#0e3a45]",
    valueColor: "text-[#0e3a45]",
  },
  {
    title: "Cuentas Activas",
    value: stats.activeAccounts,
    icon: UserCheck,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    valueColor: "text-green-600",
  },
  {
    title: "Cuentas Desactivadas",
    value: stats.disabledAccounts,
    icon: UserX,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    valueColor: "text-red-600",
  },
  {
    title: "Registros Recientes",
    value: stats.recentSignups,
    subtitle: "Últimos 7 días",
    icon: TrendingUp,
    iconBg: "bg-[#0e3a45]/[0.08]",
    iconColor: "text-[#0e3a45]",
    valueColor: "text-[#0e3a45]",
  },
];
```

- [ ] **Step 2: Update solicitudStats color objects**

```tsx
const solicitudStats = [
  {
    title: "Total Solicitudes",
    value: stats.totalSolicitudes,
    icon: FileText,
    iconBg: "bg-[#0e3a45]/[0.08]",
    iconColor: "text-[#0e3a45]",
    valueColor: "text-[#0e3a45]",
  },
  {
    title: "Pendientes",
    value: stats.pendingSolicitudes,
    icon: Clock,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-600",
    valueColor: "text-yellow-600",
  },
  {
    title: "Aprobadas",
    value: stats.approvedSolicitudes,
    icon: CheckCircle,
    iconBg: "bg-green-50",
    iconColor: "text-green-600",
    valueColor: "text-green-600",
  },
  {
    title: "Rechazadas",
    value: stats.rejectedSolicitudes,
    icon: XCircle,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    valueColor: "text-red-600",
  },
];
```

- [ ] **Step 3: Update userTypeStats circles**

```tsx
const userTypeStats = [
  { title: "Super Admins",   value: stats.accountsByType.superAdmin,  color: "bg-[#0e3a45]" },
  { title: "Admin Empresa",  value: stats.accountsByType.companyAdmin, color: "bg-[#0e3a45]/80" },
  { title: "Prestamistas",   value: stats.accountsByType.lender,      color: "bg-[#0e3a45]/60" },
  { title: "Solicitantes",   value: stats.accountsByType.borrower,    color: "bg-green-600" },
];
```

- [ ] **Step 4: Update card render to use new field names + add accent bar**

Replace the card JSX in both `mainStats` and `solicitudStats` grids:
```tsx
{mainStats.map((stat, index) => (
  <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
    <div className="h-1 bg-green-500 w-full" />
    <CardBody className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{stat.title}</p>
          <p className={`text-3xl font-bold ${stat.valueColor}`}>
            {stat.value.toLocaleString()}
          </p>
          {stat.subtitle && (
            <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${stat.iconBg}`}>
          <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
        </div>
      </div>
    </CardBody>
  </Card>
))}
```
Apply the same pattern to `solicitudStats`.

- [ ] **Step 5: Update section header icon colors**

```tsx
// "Resumen de Cuentas" header:
<Users className="w-5 h-5 text-[#0e3a45]" />

// "Resumen de Solicitudes" header:
<FileText className="w-5 h-5 text-[#0e3a45]" />

// "Distribución por Tipo" header:
<Activity className="w-5 h-5 text-[#0e3a45]" />
```

- [ ] **Step 6: Remove unused color fields from type definition (if any)**

Remove `color`, `bgColor`, `textColor` fields from stat objects if they were the old ones. The new objects use `iconBg`, `iconColor`, `valueColor`.

- [ ] **Step 7: Verify TypeScript**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep "StatsCards"
```
Expected: no output.

- [ ] **Step 8: Commit**

```bash
git add components/superadmin/StatsCards.tsx
git commit -m "feat: update StatsCards colors to brand design system"
```

---

## Task 4: Color sweep — AccountDetailModal

**Files:**
- Modify: `components/superadmin/AccountDetailModal.tsx`

- [ ] **Step 1: Replace avatar gradient**

```tsx
// FROM:
<div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">

// TO:
<div className="w-12 h-12 rounded-full bg-[#0e3a45] flex items-center justify-center">
```

- [ ] **Step 2: Replace blue stats (solicitudes/propuestas counts)**

Find the stats section (around line 168) and replace:
```tsx
// FROM:
<FileText className="w-4 h-4 text-blue-500" />
// ...
<span className="text-lg font-bold text-blue-600">

// TO:
<FileText className="w-4 h-4 text-[#0e3a45]" />
// ...
<span className="text-lg font-bold text-[#0e3a45]">
```

Apply the same replacement for any other `text-blue-*` / `bg-blue-*` occurrences in this file.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep "AccountDetailModal"
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/superadmin/AccountDetailModal.tsx
git commit -m "feat: update AccountDetailModal colors to brand design system"
```

---

## Task 5: Color sweep — SystemInfoCards + TokenManagement

**Files:**
- Modify: `components/superadmin/SystemInfoCards.tsx`
- Modify: `components/superadmin/TokenManagement.tsx`

- [ ] **Step 1: SystemInfoCards — replace purple/blue/indigo info blocks**

Find and replace all color violations:
```tsx
// Server health block — uptime
// FROM: bg-blue-50 / text-blue-600 / text-blue-700
// TO:   bg-[#0e3a45]/[0.06] / text-[#0e3a45] / text-[#0e3a45]

// FROM: bg-purple-50 / text-purple-600 / text-purple-700
// TO:   bg-gray-50 / text-gray-700 / text-gray-600

// FROM: bg-indigo-50 / text-indigo-600 / text-indigo-700
// TO:   bg-gray-50 / text-gray-700 / text-gray-600

// Server icon in header:
// FROM: <Server className="w-5 h-5 text-purple-500" />
// TO:   <Server className="w-5 h-5 text-[#0e3a45]" />

// Database section:
// FROM: <Database className="w-5 h-5 text-indigo-500" />
//       <p className="text-3xl font-bold text-indigo-600">
// TO:   <Database className="w-5 h-5 text-[#0e3a45]" />
//       <p className="text-3xl font-bold text-[#0e3a45]">
```

- [ ] **Step 2: TokenManagement — replace purple Key icon**

```tsx
// FROM: <Key className="w-5 h-5 text-purple-600" />
// TO:   <Key className="w-5 h-5 text-[#0e3a45]" />
```

Also sweep the rest of TokenManagement for any other `purple-*` or `blue-*`:
```bash
grep -n "purple\|blue\|indigo" components/superadmin/TokenManagement.tsx
```
Replace any found with `[#0e3a45]` or `gray-*` as appropriate.

- [ ] **Step 3: Verify TypeScript**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep -v "node_modules" | head -10
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add components/superadmin/SystemInfoCards.tsx components/superadmin/TokenManagement.tsx
git commit -m "feat: update SystemInfoCards and TokenManagement colors to brand design system"
```

---

## Final verification

- [ ] **Full type-check**

```bash
npx tsc --noEmit --skipLibCheck 2>&1 | grep -v "node_modules"
```
Expected: no output.

- [ ] **Confirm no brand color violations remain**

```bash
grep -rn "purple-\|blue-\|indigo-\|violet-\|cyan-" components/superadmin/ --include="*.tsx" | grep -v "node_modules"
```
Expected: no output (all violations cleared).
