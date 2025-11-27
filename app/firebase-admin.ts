import admin from 'firebase-admin';

// Check if Firebase app is already initialized to prevent multiple initializations
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const adminFirestore = admin.firestore();
export default admin; 