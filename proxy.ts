import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Definir los tipos de usuario
type UserType = 'superAdmin' | 'companyAdmin' | 'lender' | 'borrower';

// Definir las rutas protegidas y los roles permitidos
const protectedRoutes: Record<string, UserType[]> = {
  '/super_admin_dashboard': ['superAdmin'],
  '/admin_dashboard': ['companyAdmin'],
  '/lender': ['lender'],
  '/user_dashboard': ['borrower'],
  '/worker_dashboard': ['lender'],
};

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  '/',
  '/login',
  '/signup',
  '/signup_admin',
  '/forgot-password',
  '/acerca-de',
  '/como-funciona',
  '/aviso-legal',
  '/politica-privacidad',
  '/terminos',
  '/transparencia',
  '/soluciones',
  '/prestamista',
];

// Rutas de API que no necesitan verificación de roles
const apiRoutes = ['/api/'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublicFile =
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico') ||
    pathname.startsWith('/img/');

  if (isPublicFile) return NextResponse.next();

  // Permitir todas las rutas de API
  if (apiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Permitir rutas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Permitir archivos estáticos
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Verificar si es una ruta protegida
  const matchedRoute = Object.keys(protectedRoutes).find(route =>
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    const authToken = request.cookies.get('auth-token');
    const userType = request.cookies.get('user-type');

    // Si no hay token de autenticación, redirigir a login
    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Si hay token pero no hay tipo de usuario, redirigir a login
    if (!userType) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Verificar si el tipo de usuario tiene acceso a esta ruta
    const allowedRoles = protectedRoutes[matchedRoute];
    if (!allowedRoles.includes(userType.value as UserType)) {
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
