import admin from 'firebase-admin';
import "server-only"

export function initAdmin(){
  if(admin.apps.length > 0){
    return admin.app();
  }

  try {
    // Verificar que las variables de entorno estén disponibles
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials in environment variables');
    }

    const app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n')
      }),
      databaseURL: `https://${projectId}-default-rtdb.firebaseio.com`
    });
    
    console.log('✅ Firebase Admin SDK inicializado correctamente');
    return app;
  } catch (error) {
    console.error('❌ Error inicializando Firebase Admin SDK:', error);
    throw error;
  }
}

/**
 * Obtener instancia de Firestore Admin
 */
export function getAdminFirestore() {
  initAdmin();
  return admin.firestore();
}

/**
 * Obtener instancia de Auth Admin  
 */
export function getAdminAuth() {
  initAdmin();
  return admin.auth();
}