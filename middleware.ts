import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Definir los tipos de usuario
type UserType = 'b_admin' | 'b_sale' | 'user';

// Definir las rutas protegidas y los roles permitidos
const protectedRoutes: Record<string, UserType[]> = {
  '/admin_dashboard': ['b_admin'],
  '/lender': ['b_sale'],
  '/user_dashboard': ['user'],
  '/worker_dashboard': ['b_sale'], // Si existe esta ruta
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
  '/prestamos',
  '/prestamista',
];

// Rutas de API que no necesitan verificación de roles (solo autenticación)
const apiRoutes = [
  '/api/',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Permitir todas las rutas de API (manejaremos autenticación en cada endpoint)
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
    pathname.includes('.') // archivos con extensión
  ) {
    return NextResponse.next();
  }
  
  // Verificar si es una ruta protegida
  const matchedRoute = Object.keys(protectedRoutes).find(route => 
    pathname.startsWith(route)
  );
  
  if (matchedRoute) {
    // Es una ruta protegida, verificar autenticación
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
      // Usuario no autorizado, redirigir a página de error o dashboard correcto
      const unauthorizedUrl = new URL('/unauthorized', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }
  
  return NextResponse.next();
}

export const config = {
  // Configurar qué rutas debe interceptar el middleware
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
