import admin from 'firebase-admin';
import "server-only"
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://buscocredito-b3f6d.firebaseio.com'
});

export const auth2 = admin.auth();
export const db2 = admin.firestore();