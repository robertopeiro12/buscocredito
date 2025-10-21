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
 * Migrar usuarios existentes para establecer custom claims
 */
export async function migrateUserRoles() {
  try {
    const { getAdminFirestore } = await import('./FirebaseAdmin');
    const db = getAdminFirestore();
    const auth = getAdminAuth();
    
    console.log('🔄 Starting user role migration...');
    
    // Obtener todos los usuarios de Firestore
    const usersSnapshot = await db.collection('cuentas').get();
    let migratedCount = 0;
    let errorCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const uid = doc.id;
      const userType = userData.type;
      
      if (!userType) {
        console.warn(`⚠️ User ${uid} has no type, skipping...`);
        continue;
      }
      
      try {
        // Verificar si ya tiene custom claims
        const existingClaims = await getUserClaims(uid);
        if (existingClaims.success && existingClaims.claims?.userType) {
          console.log(`✓ User ${uid} already has custom claims, skipping...`);
          continue;
        }
        
        // Establecer custom claims basados en el tipo
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
        
        await setUserRole(uid, userType as UserRole, additionalClaims);
        migratedCount++;
        
        // Pequeña pausa para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`❌ Error migrating user ${uid}:`, error);
        errorCount++;
      }
    }
    
    console.log(`✅ Migration completed: ${migratedCount} users migrated, ${errorCount} errors`);
    
    return {
      success: true,
      migratedCount,
      errorCount,
      message: `Migration completed: ${migratedCount} users migrated, ${errorCount} errors`
    };
    
  } catch (error) {
    console.error('❌ Error during user role migration:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
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