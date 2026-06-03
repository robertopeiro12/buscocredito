# Signup Page Redesign

**Date:** 2026-05-14  
**Status:** Approved

## Objetivo

Rediseñar la página de signup para eliminar inconsistencias de marca (azul no pertenece al sistema de color), adoptar un layout two-panel más profesional para fintech, y limpiar antipatrones técnicos.

## Layout General

### Desktop (md+)
- Dos columnas fijas que llenan `min-h-screen`
- **Panel izquierdo (40%):** fondo sólido `#0e3a45`, sticky
- **Panel derecho (60%):** blanco, scroll con el formulario

### Mobile
- Una sola columna — solo el panel derecho (formulario)
- Logo y step indicator compactos al tope

## Panel Izquierdo

- Franja `h-1` verde en la parte superior (consistente con login)
- Patrón geométrico de círculos concéntricos con outline, opacidad baja (mismo estilo que login)
- Título y subtítulo dinámicos por paso:

| Paso | Título | Subtítulo |
|------|--------|-----------|
| 1 | Cuéntanos quién eres | Tu nombre es el primer paso para conectarte con las mejores ofertas financieras. |
| 2 | Datos de contacto | Necesitamos verificar tu identidad para proteger tu perfil crediticio. |
| 3 | Tu domicilio | Las instituciones financieras usan tu ubicación para personalizar sus ofertas. |
| 4 | Crea tu acceso | Ya casi terminas. Configura tus credenciales de acceso. |

## Panel Derecho

- Step indicator horizontal arriba en colores `#0e3a45`
- Formulario centrado `max-w-md`
- Botones Anterior/Siguiente en `#0e3a45` con texto blanco
- Link "¿Ya tienes cuenta?" en `#0e3a45`
- Señal de confianza al pie (candado + "Conexión segura · Tus datos están protegidos")

## Step Indicator (rediseño)

- 4 nodos conectados por líneas horizontales
- **Completado:** círculo relleno `#0e3a45` + checkmark blanco
- **Activo:** círculo con borde `#0e3a45` + número en `#0e3a45`
- **Pendiente:** círculo gris + número gris
- Línea conectora: `#0e3a45` para tramos completados, gris para pendientes
- Labels debajo: "Personal", "Contacto", "Dirección", "Cuenta"

## Sistema de Color Unificado

Eliminar todo uso de `blue-*`. Reemplazos:

| Elemento | Antes | Después |
|----------|-------|---------|
| Botón Siguiente | `bg-blue-600` | `bg-[#0e3a45]` |
| Focus ring inputs | `focus:ring-blue-500` | `focus:ring-[#0e3a45]` |
| Ícono de paso | `bg-blue-100 text-blue-600` | `bg-[#0e3a45]/10 text-[#0e3a45]` |
| Link a login | `text-blue-600` | `text-[#0e3a45]` |
| CP loading spinner | `text-blue-600` | `text-[#0e3a45]` |
| Header gradiente | `from-green-600 to-blue-600` | eliminado (panel sólido) |
| Valid fields | `border-green-300 text-green-600` | se mantiene |

## Correcciones Técnicas

### Estilos PhoneInput
- Mover bloque `document.createElement("style")` del final de `page.tsx` a `styles/globals.css`
- Eliminar el bloque de inyección manual — antipatrón en Next.js, no funciona en SSR

### Redirect helper
- Extraer `getRedirectPath(userType)` a `lib/navigation.ts` como export nombrado (archivo nuevo, client-safe)
- Importarlo en `app/login/page.tsx` y `app/signup/page.tsx` — elimina duplicación
- No va en `lib/auth.ts` porque ese archivo es server-only (usa Firebase Admin + cookies)

### Layout duplicado
- `app/signup/layout.tsx` queda como wrapper mínimo sin background
- El background lo define el panel del two-panel en `page.tsx`

## Archivos Modificados

| Archivo | Tipo de cambio |
|---------|---------------|
| `app/signup/layout.tsx` | Simplificar wrapper |
| `app/signup/page.tsx` | Two-panel layout, eliminar styles injection, usar getRedirectPath |
| `app/login/page.tsx` | Usar getRedirectPath importado |
| `components/signup/StepIndicator.tsx` | Rediseño completo |
| `components/signup/StepHeaderWithStep.tsx` | Eliminar azul |
| `components/signup/StepContent.tsx` | CP loading en `#0e3a45` |
| `components/signup/InputField.tsx` | Focus ring en `#0e3a45` |
| `lib/navigation.ts` | Nuevo archivo — export `getRedirectPath` |
| `styles/globals.css` | Agregar estilos PhoneInput |

## Lo que NO cambia

- Lógica de validación
- Hook `useSignupForm`
- Modales de Términos y Privacidad
- Campos, pasos y su contenido
