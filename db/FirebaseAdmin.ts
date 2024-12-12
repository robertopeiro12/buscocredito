import admin from 'firebase-admin';
import "server-only"
const serviceAccount = require('../serviceAccountKey.json');


export function initAdmin(){
  if(admin.apps.length > 0){
    return admin.app();
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://buscocredito-b3f6d.firebaseio.com'
  });
}




