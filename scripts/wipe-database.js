/**
 * Script para limpiar TODOS los datos de Firestore.
 * Elimina documentos de: cuentas, solicitudes, propuestas, notifications.
 *
 * USO:
 *   node scripts/wipe-database.js
 *   node scripts/wipe-database.js --force   (sin confirmación interactiva)
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// ─── Cargar .env.local ─────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local no encontrado en", envPath);
    process.exit(1);
  }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

// ─── Inicializar Firebase Admin ────────────────────────────────────────────
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(
  /\\n/g,
  "\n"
);

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Faltan credenciales de Firebase Admin en .env.local");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
});

const db = admin.firestore();

const COLLECTIONS = [
  "cuentas",
  "solicitudes",
  "propuestas",
  "notifications",
];

// ─── Eliminar todos los documentos de una colección ────────────────────────
async function wipeCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  if (snapshot.empty) {
    console.log(`  ${collectionName}: 0 documentos (vacía)`);
    return 0;
  }

  const BATCH_SIZE = 400;
  let deleted = 0;
  const docs = snapshot.docs;

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = docs.slice(i, i + BATCH_SIZE);
    for (const doc of chunk) {
      batch.delete(doc.ref);
    }
    await batch.commit();
    deleted += chunk.length;
    process.stdout.write(
      `  ${collectionName}: eliminados ${deleted}/${docs.length}\r`
    );
  }
  console.log(
    `  🗑️  ${collectionName}: ${docs.length} documentos eliminados`
  );
  return docs.length;
}

// ─── Confirmación interactiva ──────────────────────────────────────────────
async function confirm() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(
      '⚠️  Escribe "BORRAR TODO" para confirmar la eliminación de TODOS los datos: ',
      (answer) => {
        rl.close();
        resolve(answer === "BORRAR TODO");
      }
    );
  });
}

// ─── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const force = args.includes("--force");

  console.log("\n🧹 LIMPIEZA DE BASE DE DATOS");
  console.log(`   Proyecto: ${projectId}`);
  console.log(`   Colecciones: ${COLLECTIONS.join(", ")}\n`);

  if (!force) {
    const confirmed = await confirm();
    if (!confirmed) {
      console.log("\n❌ Operación cancelada.\n");
      process.exit(0);
    }
  }

  console.log("\n🔥 Eliminando datos de Firestore...\n");

  let totalDeleted = 0;
  for (const col of COLLECTIONS) {
    const count = await wipeCollection(col);
    totalDeleted += count;
  }

  console.log(`\n✅ Limpieza completa. ${totalDeleted} documentos eliminados.`);
  console.log("   La base de datos está vacía.\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
