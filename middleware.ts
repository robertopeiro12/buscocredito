import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type UserRole = 'borrower' | 'lender' | 'companyAdmin' | 'superAdmin';

const protectedRoutes: Record<string, UserRole[]> = {
  '/user_dashboard': ['borrower'],
  '/lender': ['lender'],
  '/admin_dashboard': ['companyAdmin'],
  '/super_admin_dashboard': ['superAdmin'],
  '/institution_dashboard': ['companyAdmin', 'superAdmin'],
};

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
  '/prestamos',
  '/prestamista',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes — auth handled per-endpoint
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Static assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  const matchedRoute = Object.keys(protectedRoutes).find(route =>
    pathname.startsWith(route)
  );

  if (matchedRoute) {
    const authToken = request.cookies.get('auth-token');
    const userType = request.cookies.get('user-type');

    if (!authToken) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!userType) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const allowedRoles = protectedRoutes[matchedRoute];
    if (!allowedRoles.includes(userType.value as UserRole)) {
      const unauthorizedUrl = new URL('/login', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
