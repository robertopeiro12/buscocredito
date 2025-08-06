import { NextRequest } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/db/FirebaseAdmin';

export interface AuthUser {
  uid: string;
  email: string;
  role: 'user' | 'lender' | 'admin' | 'worker';
  companyName?: string;
  verified?: boolean;
}

/**
 * Verificar token de autenticación y obtener datos del usuario
 */
export async function verifyAuthToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    // Obtener token del header Authorization
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    if (!token) {
      return null;
    }

    // Verificar token con Firebase Admin
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Obtener datos del usuario desde Firestore
    const db = getAdminFirestore();
    const userDoc = await db.collection('cuentas').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      console.error('Usuario no encontrado en Firestore:', decodedToken.uid);
      return null;
    }

    const userData = userDoc.data();
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      role: userData?.role || 'user',
      companyName: userData?.companyName,
      verified: userData?.verified || false
    };
  } catch (error) {
    console.error('Error verificando token:', error);
    return null;
  }
}

/**
 * Middleware para verificar roles específicos
 */
export function requireRole(allowedRoles: string[]) {
  return async (request: NextRequest): Promise<AuthUser | Response> => {
    const user = await verifyAuthToken(request);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Token de autenticación inválido o expirado' }), 
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return new Response(
        JSON.stringify({ 
          error: 'Permisos insuficientes', 
          required: allowedRoles,
          current: user.role 
        }), 
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return user;
  };
}

/**
 * Middleware específico para lenders
 */
export const requireLender = requireRole(['lender', 'admin']);

/**
 * Middleware específico para admins
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Middleware específico para workers
 */
export const requireWorker = requireRole(['worker', 'admin']);

/**
 * Middleware para usuarios verificados
 */
export async function requireVerifiedUser(request: NextRequest): Promise<AuthUser | Response> {
  const user = await verifyAuthToken(request);
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'Token de autenticación inválido o expirado' }), 
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!user.verified && user.role !== 'admin') {
    return new Response(
      JSON.stringify({ 
        error: 'Cuenta no verificada. Contacta al administrador para verificar tu cuenta.' 
      }), 
      { status: 403, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return user;
}

/**
 * Verificar si el usuario puede acceder a un recurso específico
 */
export async function verifyResourceAccess(
  user: AuthUser, 
  resourceType: 'propuesta' | 'solicitud' | 'notification' | 'subcuenta',
  resourceId: string,
  action: 'read' | 'write' | 'delete' = 'read'
): Promise<boolean> {
  try {
    const db = getAdminFirestore();
    
    switch (resourceType) {
      case 'propuesta':
        const propuestaDoc = await db.collection('propuestas').doc(resourceId).get();
        if (!propuestaDoc.exists) return false;
        
        const propuestaData = propuestaDoc.data();
        
        // Admins pueden acceder a todo
        if (user.role === 'admin') return true;
        
        // Lenders pueden acceder a sus propias propuestas
        if (user.role === 'lender' && propuestaData?.lenderId === user.uid) return true;
        
        // Users pueden leer propuestas dirigidas a ellos
        if (user.role === 'user' && propuestaData?.userId === user.uid && action === 'read') return true;
        
        return false;

      case 'solicitud':
        const solicitudDoc = await db.collection('solicitudes').doc(resourceId).get();
        if (!solicitudDoc.exists) return false;
        
        const solicitudData = solicitudDoc.data();
        
        // Admins pueden acceder a todo
        if (user.role === 'admin') return true;
        
        // Users pueden acceder a sus propias solicitudes
        if (user.role === 'user' && solicitudData?.userId === user.uid) return true;
        
        // Lenders pueden leer todas las solicitudes
        if (user.role === 'lender' && action === 'read') return true;
        
        return false;

      case 'notification':
        const notificationDoc = await db.collection('notifications').doc(resourceId).get();
        if (!notificationDoc.exists) return false;
        
        const notificationData = notificationDoc.data();
        
        // Solo el usuario destinatario y admins pueden acceder
        return user.role === 'admin' || notificationData?.userId === user.uid;

      case 'subcuenta':
        const subcuentaDoc = await db.collection('subcuentas').doc(resourceId).get();
        if (!subcuentaDoc.exists) return false;
        
        const subcuentaData = subcuentaDoc.data();
        
        // Solo el propietario y admins pueden acceder
        return user.role === 'admin' || subcuentaData?.userId === user.uid;

      default:
        return false;
    }
  } catch (error) {
    console.error('Error verificando acceso al recurso:', error);
    return false;
  }
}
