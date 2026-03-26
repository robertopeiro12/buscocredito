# BuscoCredito

Next.js 16 + React 19 + TypeScript + Firebase/Firestore + Tailwind CSS + HeroUI loan marketplace platform.

## Quick reference

- **Dev server:** `npm run dev`
- **Type check:** `npm run type-check`
- **Build:** `npm run build`
- **Format:** `npm run format`

## Key conventions

- Use `@/` path alias for all imports
- `"use client"` only on interactive components; `"server-only"` on all API routes
- User roles: `super_admin`, `b_admin`, `b_sale`, `user`
- Firestore collections: `solicitudes`, `propuestas`, `users`, `admin`
- UI language is Spanish; comments in Spanish
- Toast via `react-hot-toast`
- See `.claude/skills/edit-code.md` for full editing conventions and self-validation steps
