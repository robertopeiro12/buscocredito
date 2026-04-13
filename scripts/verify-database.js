/**
 * Script para verificar que la base de datos tiene los campos normalizados.
 * USO: node scripts/verify-database.js
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

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
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Faltan credenciales de Firebase Admin en .env.local");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
});

const db = admin.firestore();

// Campos viejos que NO deben existir
const OLD_FIELDS = {
  cuentas: ["Empresa", "Empresa_id", "Nombre", "last_name", "second_last_name", "created_at"],
  propuestas: ["partner", "interest_rate", "amortization_frequency", "medical_balance", "estado", "fechaCreacion"],
  solicitudes: [],
  notifications: [],
};

const OLD_ROLES = ["b_admin", "b_sale", "super_admin"];

async function verify() {
  let errors = 0;

  console.log("\n=== VERIFICACION DE BASE DE DATOS ===\n");

  // ─── Conteos ──────────────────────────────────────────────────────────
  const collections = ["cuentas", "solicitudes", "propuestas", "notifications"];
  for (const col of collections) {
    const count = (await db.collection(col).count().get()).data().count;
    console.log(`  ${col}: ${count} documentos`);
  }

  // ─── Distribucion de roles ────────────────────────────────────────────
  console.log("\n--- Distribucion de roles ---");
  const allCuentas = await db.collection("cuentas").get();
  const roles = {};
  allCuentas.forEach((doc) => {
    const t = doc.data().type || "unknown";
    roles[t] = (roles[t] || 0) + 1;
  });
  for (const [role, count] of Object.entries(roles)) {
    const marker = OLD_ROLES.includes(role) ? " ⚠️  VIEJO!" : " ✅";
    console.log(`  ${role}: ${count}${marker}`);
    if (OLD_ROLES.includes(role)) errors++;
  }

  // ─── Verificar campos viejos ──────────────────────────────────────────
  console.log("\n--- Verificacion de campos viejos ---");
  for (const [col, fields] of Object.entries(OLD_FIELDS)) {
    if (fields.length === 0) {
      console.log(`  ${col}: sin campos viejos que verificar`);
      continue;
    }

    const snapshot = await db.collection(col).get();
    let colErrors = 0;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      for (const field of fields) {
        if (data[field] !== undefined) {
          if (colErrors < 3) {
            console.log(`  ⚠️  ${col}/${docSnap.id}: campo viejo "${field}" encontrado = ${JSON.stringify(data[field]).slice(0, 50)}`);
          }
          colErrors++;
        }
      }
    }

    if (colErrors === 0) {
      console.log(`  ${col}: ✅ sin campos viejos (${snapshot.size} docs revisados)`);
    } else {
      console.log(`  ${col}: ⚠️  ${colErrors} campos viejos encontrados!`);
      errors += colErrors;
    }
  }

  // ─── Muestras de datos ────────────────────────────────────────────────
  console.log("\n--- Muestras de cuentas ---");
  const samples = await db.collection("cuentas").limit(6).get();
  for (const doc of samples.docs) {
    const d = doc.data();
    console.log(`  [${d.type}] name=${d.name || "?"} | companyName=${d.companyName || "-"} | adminId=${d.adminId || "-"} | email=${d.email || "?"}`);
  }

  console.log("\n--- Muestras de propuestas ---");
  const propSamples = await db.collection("propuestas").limit(4).get();
  for (const doc of propSamples.docs) {
    const d = doc.data();
    console.log(`  lenderId=${d.lenderId || "?"} | interestRate=${d.interestRate} | amortizationFrequency=${d.amortizationFrequency} | medicalBalance=${d.medicalBalance} | status=${d.status}`);
  }

  console.log("\n--- Muestras de solicitudes ---");
  const solSamples = await db.collection("solicitudes").limit(3).get();
  for (const doc of solSamples.docs) {
    const d = doc.data();
    console.log(`  userId=${d.userId} | amount=${d.amount} | status=${d.status} | payment=${d.payment} | term=${d.term}`);
  }

  // ─── Resultado ────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  if (errors === 0) {
    console.log("✅ VERIFICACION EXITOSA — 0 problemas encontrados");
  } else {
    console.log(`⚠️  ${errors} PROBLEMAS ENCONTRADOS`);
  }
  console.log("=".repeat(50) + "\n");

  process.exit(errors > 0 ? 1 : 0);
}

verify().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
