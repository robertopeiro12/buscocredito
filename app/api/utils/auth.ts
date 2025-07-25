import "server-only";
import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initAdmin } from '@/db/FirebaseAdmin';

export interface AuthenticatedUser {
  uid: string;
  email: string;
  userType: string;
}

export async function verifyAuthentication(request: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    // Inicializar Firebase Admin
    await initAdmin();
    
    // Obtener el token de las cookies
    const authToken = request.cookies.get('auth-token')?.value;
    const userType = request.cookies.get('user-type')?.value;
    
    if (!authToken || !userType) {
      return null;
    }
    
    // Verificar el token con Firebase Admin
    const auth = getAuth();
    const decodedToken = await auth.verifyIdToken(authToken);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      userType: userType
    };
  } catch (error) {
    console.error('Error verifying authentication:', error);
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
