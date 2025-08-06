import admin from 'firebase-admin';
import "server-only"
const serviceAccount = require('../serviceAccountKey.json');

export function initAdmin(){
  if(admin.apps.length > 0){
    return admin.app();
  }

  try {
    const app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: 'https://buscocredito-b3f6d.firebaseio.com'
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