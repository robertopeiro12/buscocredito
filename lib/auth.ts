import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { getAdminAuth } from '@/db/FirebaseAdmin';

// Tipos de usuario del sistema
export type UserRole = 'b_admin' | 'b_sale' | 'user';

// Interfaz para datos del usuario autenticado
export interface AuthenticatedUser {
  uid: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
}

// Resultado de autenticación
export interface AuthResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
}

/**
 * Verifica el token de Firebase y obtiene los datos del usuario
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthResult> {
  try {
    // Obtener token del header Authorization o cookies
    let token: string | undefined;
    
    // Prioridad 1: Header Authorization
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Prioridad 2: Cookie auth-token
    if (!token) {
      const cookieStore = await cookies();
      const authCookie = cookieStore.get('auth-token');
      token = authCookie?.value;
    }
    
    if (!token) {
      return {
        success: false,
        error: 'No authentication token provided'
      };
    }
    
    // Verificar token con Firebase Admin
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    // Obtener rol del usuario (desde custom claims o default)
    const role = (decodedToken.role as UserRole) || 'user';
    
    return {
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email || '',
        role,
        isVerified: decodedToken.email_verified || false
      }
    };
    
  } catch (error) {
    console.error('Error verifying auth token:', error);
    return {
      success: false,
      error: 'Invalid or expired token'
    };
  }
}

/**
 * Middleware de autorización para endpoints de API
 */
export function requireAuth(allowedRoles?: UserRole[]) {
  return async (request: NextRequest): Promise<AuthResult> => {
    const authResult = await verifyAuthToken(request);
    
    if (!authResult.success || !authResult.user) {
      return authResult;
    }
    
    // Si se especifican roles permitidos, verificar autorización
    if (allowedRoles && !allowedRoles.includes(authResult.user.role)) {
      return {
        success: false,
        error: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`
      };
    }
    
    return authResult;
  };
}

/**
 * Helper para endpoints que requieren rol de lender (b_sale)
 */
export const requireLenderAuth = requireAuth(['b_sale']);

/**
 * Helper para endpoints que requieren rol de admin (b_admin)
 */
export const requireAdminAuth = requireAuth(['b_admin']);

/**
 * Helper para endpoints que requieren rol de usuario (user)
 */
export const requireUserAuth = requireAuth(['user']);

/**
 * Helper para endpoints que requieren cualquier usuario autenticado
 */
export const requireAnyAuth = requireAuth();

/**
 * Crear respuesta de error de autenticación
 */
export function createAuthErrorResponse(error: string, status: number = 401) {
  return new Response(
    JSON.stringify({
      success: false,
      error,
      message: 'Authentication failed'
    }),
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

/**
 * Verificar si el usuario tiene acceso a un recurso específico
 */
export function hasResourceAccess(
  user: AuthenticatedUser,
  resourceOwnerId: string,
  allowedRoles: UserRole[] = []
): boolean {
  // Los admins tienen acceso a todo
  if (user.role === 'b_admin') {
    return true;
  }
  
  // Si el usuario es dueño del recurso
  if (user.uid === resourceOwnerId) {
    return true;
  }
  
  // Si el usuario tiene un rol permitido
  if (allowedRoles.includes(user.role)) {
    return true;
  }
  
  return false;
}
