// Test script para verificar Firebase Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

console.log('🔍 Testing Firebase Admin SDK...');

// Inicializar Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://buscocredito-b3f6d.firebaseio.com'
});

async function testAdminSDK() {
  try {
    console.log('📊 Firebase Admin SDK inicializado');
    
    const db = admin.firestore();
    console.log('📊 Firestore instancia obtenida');
    
    // Test 1: Intentar leer una colección
    const propuestasRef = db.collection('propuestas');
    const snapshot = await propuestasRef.limit(1).get();
    
    console.log('✅ Consulta exitosa. Documentos encontrados:', snapshot.docs.length);
    
    if (snapshot.docs.length > 0) {
      const doc = snapshot.docs[0];
      console.log('📄 Primer documento:', doc.id);
      console.log('📊 Data:', doc.data());
    }
    
    // Test 2: Intentar leer colección de notificaciones
    const notificationsRef = db.collection('notifications');
    const notificationSnapshot = await notificationsRef.limit(1).get();
    
    console.log('✅ Consulta de notificaciones exitosa. Documentos:', notificationSnapshot.docs.length);
    
    console.log('🎉 Firebase Admin SDK está funcionando correctamente!');
    console.log('🔍 El problema puede estar en la configuración de Next.js o en las imports');
    
  } catch (error) {
    console.error('❌ Error en Firebase Admin SDK:', error);
    console.error('📋 Error code:', error.code);
    console.error('📋 Error message:', error.message);
  } finally {
    process.exit(0);
  }
}

testAdminSDK();
