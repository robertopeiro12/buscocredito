import "server-only";
import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/db/FirebaseAdmin';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  userType: string;
}

/**
 * Función unificada de autenticación que maneja tanto cookies como Bearer tokens
 * @param request - NextRequest object
 * @returns AuthenticatedUser | null
 */
export async function verifyAuthentication(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Inicializar Firebase Admin
    await initAdmin();
    const auth = getAuth();
    
    // Método 1: Intentar autenticación por cookies (sistema nuevo)
    const authToken = request.cookies.get('auth-token')?.value;
    const userType = request.cookies.get('user-type')?.value;
    
    if (authToken && userType) {
      try {
        const decodedToken = await auth.verifyIdToken(authToken);
        return {
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          userType: userType
        };
      } catch (cookieError) {
        console.log('Cookie auth failed, trying Bearer token...');
      }
    }
    
    // Método 2: Intentar autenticación por Bearer token (sistema legacy)
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        
        // Para Bearer tokens, necesitamos obtener el userType de la base de datos
        // Por ahora, asumimos 'user' para compatibilidad legacy
        return {
          uid: decodedToken.uid,
          email: decodedToken.email || '',
          userType: 'user' // Default para Bearer tokens legacy
        };
      } catch (bearerError) {
        console.log('Bearer auth failed');
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying authentication:', error);
    return null;
  }
}

/**
 * Función legacy para verificar solo Bearer tokens
 * @deprecated Usar verifyAuthentication() en su lugar
 */
export async function verifyBearerToken(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    await initAdmin();
    
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split('Bearer ')[1];
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(token);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      userType: 'user' // Default para Bearer tokens
    };
  } catch (error) {
    console.error('Error verifying bearer token:', error);
    return null;
  }
}

export function createUnauthorizedResponse() {
  return new Response(
    JSON.stringify({ error: 'No autorizado' }), 
    { 
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}

export function createForbiddenResponse(message: string = 'Acceso denegado') {
  return new Response(
    JSON.stringify({ error: message }), 
    { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    }
  );
}
