// Script temporal para probar las reglas de Firestore
const admin = require('firebase-admin');

// Configurar Firebase Admin
if (!admin.apps.length) {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://buscocredito-b3f6d.firebaseio.com'
  });
}

async function testFirestoreRules() {
  const db = admin.firestore();
  
  console.log('🧪 Probando acceso a Firestore...');
  
  try {
    // Test 1: Verificar si podemos leer la colección cuentas
    const cuentasRef = db.collection('cuentas');
    const snapshot = await cuentasRef.limit(1).get();
    
    console.log('✅ Conexión a Firestore exitosa');
    console.log(`📊 Encontrados ${snapshot.size} documentos en cuentas (con límite de 1)`);
    
    // Test 2: Verificar estructura de datos
    if (!snapshot.empty) {
      const firstDoc = snapshot.docs[0];
      const data = firstDoc.data();
      console.log('📄 Estructura de ejemplo:');
      console.log({
        id: firstDoc.id,
        type: data.type || 'no definido',
        Empresa: data.Empresa || 'no definido',
        Nombre: data.Nombre || 'no definido'
      });
    }
    
    // Test 3: Verificar propuestas
    const propuestasRef = db.collection('propuestas');
    const propuestasSnapshot = await propuestasRef.limit(1).get();
    console.log(`📋 Propuestas encontradas: ${propuestasSnapshot.size}`);
    
  } catch (error) {
    console.error('❌ Error al probar Firestore:', error.message);
  }
  
  // Cerrar la aplicación
  process.exit(0);
}

testFirestoreRules();
