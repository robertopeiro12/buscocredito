const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Función manual para cargar .env.local sin la librería dotenv
function loadEnvLocal() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Quitar comillas si existen
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnvLocal();

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error('❌ Error: No se pudieron cargar las credenciales de Firebase.');
  console.log('Asegúrate de que .env.local existe y tiene NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY.');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({
    projectId,
    clientEmail,
    privateKey: privateKey.replace(/\\n/g, '\n')
  })
});

const db = admin.firestore();

async function generateMasterToken() {
  const token = "BETA-ADMIN-2026";
  
  try {
    const tokenData = {
      token: token,
      assignedTo: "Gerardo (Master Access)",
      active: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUsed: null,
      usageCount: 0,
      createdBy: "system_init"
    };

    // Intentar buscar si ya existe para no duplicar
    const existing = await db.collection('beta_tokens').where('token', '==', token).get();
    if (!existing.empty) {
      console.log(`\n✅ El token maestro ya existe.`);
      console.log(`-----------------------------------`);
      console.log(`TOKEN: ${token}`);
      console.log(`-----------------------------------\n`);
      process.exit(0);
    }

    const docRef = await db.collection('beta_tokens').add(tokenData);
    console.log(`\n✅ Token maestro generado con éxito!`);
    console.log(`-----------------------------------`);
    console.log(`TOKEN: ${token}`);
    console.log(`ID: ${docRef.id}`);
    console.log(`-----------------------------------\n`);
  } catch (error) {
    console.error('❌ Error al acceder a Firestore:', error.message);
  } finally {
    process.exit(0);
  }
}

generateMasterToken();
