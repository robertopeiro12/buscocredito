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

  // 1. Definir rutas públicas que NO requieren token de beta
  const isPublicFile = 
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/beta/validate') || 
    pathname.includes('/favicon.ico') ||
    pathname.startsWith('/img/');

  const isBetaPage = pathname === '/beta-access';

  // 2. Verificar si existe la cookie de acceso beta
  const hasBetaAccess = request.cookies.has('buscocredito_beta');

  // 3. Lógica de redirección de Beta
  if (!hasBetaAccess && !isPublicFile && !isBetaPage) {
    // Si no tiene acceso y no es una ruta pública, redirigir al gate
    const url = request.nextUrl.clone();
    url.pathname = '/beta-access';
    return NextResponse.redirect(url);
  }

  if (hasBetaAccess && isBetaPage) {
    // Si ya tiene acceso y trata de entrar al gate, redirigir al inicio
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // 4. Continuar con la lógica de proxy existente
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
