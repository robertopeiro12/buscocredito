import "server-only";
import { getAdminAuth } from './FirebaseAdmin';

export type UserRole = 'user' | 'b_admin' | 'b_sale';

/**
 * Establecer custom claims para un usuario
 */
export async function setUserRole(uid: string, role: UserRole, additionalClaims: Record<string, any> = {}) {
  try {
    const auth = getAdminAuth();
    
    const customClaims = {
      userType: role,
      role: role, // Backward compatibility
      ...additionalClaims,
      updatedAt: new Date().toISOString()
    };
    
    await auth.setCustomUserClaims(uid, customClaims);
    
    console.log(`✅ Custom claims set for user ${uid}:`, customClaims);
    return { success: true };
  } catch (error) {
    console.error(`❌ Error setting custom claims for user ${uid}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Obtener custom claims de un usuario
 */
export async function getUserClaims(uid: string) {
  try {
    const auth = getAdminAuth();
    const user = await auth.getUser(uid);
    
    return {
      success: true,
      claims: user.customClaims || {},
      user: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified,
        disabled: user.disabled
      }
    };
  } catch (error) {
    console.error(`❌ Error getting user claims for ${uid}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

/**
 * Verificar si un usuario tiene un rol específico
 */
export async function verifyUserRole(uid: string, requiredRole: UserRole): Promise<boolean> {
  try {
    const result = await getUserClaims(uid);
    if (!result.success) return false;
    
    return result.claims?.userType === requiredRole || result.claims?.role === requiredRole;
  } catch (error) {
    console.error(`❌ Error verifying role for user ${uid}:`, error);
    return false;
  }
}



/**
 * Función para establecer claims cuando se crea un nuevo usuario
 */
export async function onUserCreated(uid: string, userData: any) {
  try {
    const userType = userData.type as UserRole;
    if (!userType) {
      throw new Error('User type is required');
    }
    
    const additionalClaims: Record<string, any> = {};
    
    if (userType === 'b_admin') {
      additionalClaims.empresa = userData.Empresa;
      additionalClaims.isAdmin = true;
    } else if (userType === 'b_sale') {
      additionalClaims.empresa = userData.Empresa;
      additionalClaims.empresaId = userData.Empresa_id;
      additionalClaims.isLender = true;
    } else if (userType === 'user') {
      additionalClaims.isUser = true;
    }
    
    return await setUserRole(uid, userType, additionalClaims);
  } catch (error) {
    console.error('❌ Error setting claims for new user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}