import admin from 'firebase-admin';

// Lazy initialization function
function initializeFirebaseAdmin() {
  if (!admin.apps.length) {
    try {
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (!projectId || !clientEmail || !privateKey) {
        throw new Error('Missing Firebase Admin credentials. Ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.');
      }

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n')
        }),
      });
    } catch (error) {
      console.error('Firebase admin initialization error', error);
      throw error;
    }
  }
  return admin;
}

// Lazy getter for adminFirestore
let firestoreInstance: admin.firestore.Firestore | null = null;

export const getAdminFirestore = () => {
  if (!firestoreInstance) {
    initializeFirebaseAdmin();
    firestoreInstance = admin.firestore();
  }
  return firestoreInstance;
};

// For backward compatibility, create a getter
export const adminFirestore = new Proxy({} as admin.firestore.Firestore, {
  get(target, prop) {
    const firestore = getAdminFirestore();
    const value = (firestore as any)[prop];
    return typeof value === 'function' ? value.bind(firestore) : value;
  }
});

// Lazy getter for admin
export const getAdmin = () => {
  initializeFirebaseAdmin();
  return admin;
};

export default admin; 