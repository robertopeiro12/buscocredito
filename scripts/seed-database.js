/**
 * Seed script for BuscoCrédito database.
 * Creates ~100 users, ~10 companies (b_admin + b_sale workers),
 * ~150 solicitudes, ~400 propuestas (with accepted/rejected/pending),
 * and corresponding notifications.
 *
 * Usage: node scripts/seed-database.js
 *        node scripts/seed-database.js --clean   (removes seeded data first)
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ─── Load .env.local manually ───────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("❌ .env.local not found at", envPath);
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
    // Strip surrounding quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadEnv();

// ─── Init Firebase Admin ────────────────────────────────────────────────────
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Missing Firebase Admin credentials in .env.local");
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
});

const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;

// ─── Seed marker to identify generated data ─────────────────────────────────
const SEED_MARKER = "__seeded__";

// ─── Helpers ────────────────────────────────────────────────────────────────
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function uid() {
  return crypto.randomBytes(14).toString("hex");
}
function pastDate(daysAgoMin, daysAgoMax) {
  const daysAgo = randInt(daysAgoMin, daysAgoMax);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(randInt(8, 20), randInt(0, 59), randInt(0, 59));
  return d;
}

// ─── Mexican Data ───────────────────────────────────────────────────────────
const STATES = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas",
];

const CITIES = {
  "Ciudad de México": ["Coyoacán", "Benito Juárez", "Miguel Hidalgo", "Tlalpan", "Azcapotzalco"],
  "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá"],
  "Nuevo León": ["Monterrey", "San Pedro Garza García", "San Nicolás", "Apodaca"],
  "Puebla": ["Puebla", "Cholula", "Atlixco"],
  "Querétaro": ["Querétaro", "San Juan del Río", "Corregidora"],
  "Guanajuato": ["León", "Guanajuato", "Irapuato", "Celaya"],
  "Estado de México": ["Toluca", "Naucalpan", "Tlalnepantla", "Ecatepec"],
  "Yucatán": ["Mérida", "Valladolid", "Progreso"],
  "Quintana Roo": ["Cancún", "Playa del Carmen", "Chetumal"],
  "Veracruz": ["Veracruz", "Xalapa", "Coatzacoalcos"],
};

const FIRST_NAMES = [
  "Carlos", "María", "José", "Ana", "Luis", "Laura", "Juan", "Patricia",
  "Miguel", "Gabriela", "Roberto", "Fernanda", "Alejandro", "Sofía",
  "Daniel", "Valentina", "Ricardo", "Isabella", "Fernando", "Camila",
  "Eduardo", "Daniela", "Andrés", "Mariana", "Diego", "Andrea",
  "Sergio", "Carolina", "Raúl", "Paola", "Jorge", "Natalia",
  "Héctor", "Lucía", "Oscar", "Regina", "Manuel", "Jimena",
  "Francisco", "Ximena", "Pedro", "Paulina", "Arturo", "Alejandra",
  "Enrique", "Elena", "Gustavo", "Diana", "Marco", "Adriana",
];

const LAST_NAMES = [
  "García", "Rodríguez", "Martínez", "López", "González", "Hernández",
  "Pérez", "Sánchez", "Ramírez", "Torres", "Flores", "Rivera",
  "Gómez", "Díaz", "Cruz", "Morales", "Reyes", "Gutiérrez",
  "Ortiz", "Ramos", "Vargas", "Castillo", "Mendoza", "Romero",
  "Herrera", "Medina", "Aguilar", "Vega", "Castro", "Jiménez",
  "Ruiz", "Delgado", "Cervantes", "Chávez", "Salazar", "Contreras",
];

const COLONIES = [
  "Centro", "Del Valle", "Roma Norte", "Condesa", "Polanco", "Narvarte",
  "Santa Fe", "Lomas de Chapultepec", "Coyoacán", "San Ángel",
  "Industrial", "La Paz", "Reforma", "Insurgentes", "Juárez",
];

const STREETS = [
  "Av. Reforma", "Calle Insurgentes", "Blvd. Manuel Ávila Camacho",
  "Calle Hidalgo", "Av. Juárez", "Calle Morelos", "Av. Universidad",
  "Calle 5 de Mayo", "Av. Revolución", "Calle Madero",
  "Av. Constituyentes", "Calle Independencia", "Blvd. Adolfo López Mateos",
  "Calle Benito Juárez", "Av. Chapultepec",
];

const COMPANY_NAMES = [
  "Financiera del Norte", "CréditoPlus México", "Prestamex Capital",
  "Soluciones Financieras MX", "Capital Azteca", "FondeoRápido",
  "Inversiones del Bajío", "Crédito Confianza", "FinanciaTu",
  "Grupo Financiero Pacífico",
];

const PURPOSES = ["Personal", "Negocio"];
const TYPES = ["consumo", "deudas", "capital", "maquinaria"];
const FREQUENCIES = ["mensual", "quincenal", "semanal"];
const TERMS = ["6 meses", "12 meses", "18 meses", "24 meses", "36 meses", "48 meses"];
const CREDIT_CLASSIFICATIONS = ["Excelente", "Bueno", "Regular", "Bajo"];

function generateRFC() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let rfc = "";
  for (let i = 0; i < 4; i++) rfc += letters[randInt(0, 25)];
  rfc += String(randInt(70, 99));
  rfc += String(randInt(1, 12)).padStart(2, "0");
  rfc += String(randInt(1, 28)).padStart(2, "0");
  for (let i = 0; i < 3; i++) rfc += (letters + "0123456789")[randInt(0, 35)];
  return rfc;
}

function generatePhone() {
  return `+52${randInt(100, 999)}${randInt(100, 999)}${randInt(1000, 9999)}`;
}

function generateZipCode() {
  return String(randInt(10000, 99999));
}

// ─── Generate Users ─────────────────────────────────────────────────────────
function generateUsers(count) {
  const users = [];
  const usedEmails = new Set();

  for (let i = 0; i < count; i++) {
    const firstName = pick(FIRST_NAMES);
    const lastName = pick(LAST_NAMES);
    const secondLastName = pick(LAST_NAMES);
    const state = pick(STATES);
    const citiesForState = CITIES[state] || [state];
    const city = pick(citiesForState);

    let email;
    do {
      const num = randInt(1, 9999);
      email = `${firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}.${lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")}${num}@test-seed.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const score = randInt(300, 850);
    let classification;
    if (score >= 750) classification = "Excelente";
    else if (score >= 650) classification = "Bueno";
    else if (score >= 550) classification = "Regular";
    else classification = "Bajo";

    const createdAt = pastDate(7, 180);

    users.push({
      id: uid(),
      data: {
        name: firstName,
        last_name: lastName,
        second_last_name: secondLastName,
        rfc: generateRFC(),
        birthday: Timestamp.fromDate(new Date(randInt(1970, 2000), randInt(0, 11), randInt(1, 28))),
        phone: generatePhone(),
        address: {
          street: pick(STREETS),
          exteriorNumber: String(randInt(1, 500)),
          interiorNumber: Math.random() > 0.6 ? String(randInt(1, 20)) : "",
          colony: pick(COLONIES),
          city,
          state,
          country: "México",
          zipCode: generateZipCode(),
        },
        email,
        type: "user",
        creditScore: { score, classification },
        acceptedTerms: true,
        acceptedTermsAt: Timestamp.fromDate(createdAt),
        created_at: Timestamp.fromDate(createdAt),
        emailNotifications: true,
        [SEED_MARKER]: true,
      },
    });
  }
  return users;
}

// ─── Generate Companies (b_admin + b_sale workers) ──────────────────────────
function generateCompanies() {
  const companies = [];
  for (let i = 0; i < COMPANY_NAMES.length; i++) {
    const companyName = COMPANY_NAMES[i];
    const adminId = uid();
    const adminEmail = `admin.${companyName.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@test-seed.com`;
    const createdAt = pastDate(90, 365);

    // b_admin
    companies.push({
      id: adminId,
      data: {
        Empresa: companyName,
        name: companyName,
        type: "b_admin",
        email: adminEmail,
        created_at: Timestamp.fromDate(createdAt),
        [SEED_MARKER]: true,
      },
      workers: [],
      companyName,
    });

    // 2-4 b_sale workers per company
    const workerCount = randInt(2, 4);
    for (let w = 0; w < workerCount; w++) {
      const workerName = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
      const workerId = uid();
      const workerEmail = `worker${w + 1}.${companyName.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}@test-seed.com`;

      const worker = {
        id: workerId,
        data: {
          Empresa: companyName,
          Empresa_id: adminId,
          Nombre: workerName,
          email: workerEmail,
          type: "b_sale",
          created_at: Timestamp.fromDate(pastDate(30, 180)),
          [SEED_MARKER]: true,
        },
      };

      companies[companies.length - 1].workers.push(worker);
    }
  }
  return companies;
}

// ─── Generate Solicitudes ───────────────────────────────────────────────────
function generateSolicitudes(users) {
  const solicitudes = [];
  // ~60% of users create 1-3 solicitudes
  const activeUsers = users.filter(() => Math.random() < 0.6);

  for (const user of activeUsers) {
    const solCount = randInt(1, 3);
    for (let s = 0; s < solCount; s++) {
      const amount = pick([50000, 100000, 150000, 200000, 250000, 300000, 500000, 750000, 1000000]);
      const createdAt = pastDate(1, 120);

      solicitudes.push({
        id: uid(),
        data: {
          userId: user.id,
          amount,
          income: randInt(15000, 200000),
          term: pick(TERMS),
          payment: pick(FREQUENCIES),
          purpose: pick(PURPOSES),
          type: pick(TYPES),
          status: "pending", // will be updated after proposals
          createdAt: createdAt.toISOString(),
          updatedAt: createdAt.toISOString(),
          [SEED_MARKER]: true,
        },
        _createdDate: createdAt,
        _userId: user.id,
      });
    }
  }
  return solicitudes;
}

// ─── Generate Propuestas & Decide Winners ───────────────────────────────────
function generateProposals(solicitudes, companies) {
  const proposals = [];
  const notifications = [];

  // Collect all workers
  const allWorkers = [];
  for (const comp of companies) {
    for (const w of comp.workers) {
      allWorkers.push({ ...w, companyName: comp.companyName });
    }
  }

  for (const sol of solicitudes) {
    // Each solicitud gets 1-5 proposals from random companies
    const numProposals = randInt(1, 5);
    const shuffledWorkers = [...allWorkers].sort(() => Math.random() - 0.5);
    const selectedWorkers = shuffledWorkers.slice(0, Math.min(numProposals, shuffledWorkers.length));

    // Pick which companies already used (avoid duplicates per company per solicitud)
    const usedCompanies = new Set();
    const solProposals = [];

    for (const worker of selectedWorkers) {
      if (usedCompanies.has(worker.companyName)) continue;
      usedCompanies.add(worker.companyName);

      const baseAmount = sol.data.amount;
      const proposedAmount = Math.round(baseAmount * randFloat(0.7, 1.1, 2));
      const interestRate = randFloat(8, 28, 2);
      const deadline = pick([6, 12, 18, 24, 36, 48]);
      const frequency = pick(FREQUENCIES);
      const amortization = Math.round(proposedAmount / deadline * randFloat(0.95, 1.15, 2));
      const comision = Math.round(proposedAmount * randFloat(0.01, 0.05, 3));
      const medicalBalance = Math.random() > 0.3 ? randInt(500, 5000) : 0;

      const proposalDate = new Date(sol._createdDate);
      proposalDate.setDate(proposalDate.getDate() + randInt(1, 14));
      proposalDate.setHours(randInt(8, 18), randInt(0, 59));

      const proposalId = uid();

      solProposals.push({
        id: proposalId,
        data: {
          lenderId: worker.id,
          loanId: sol.id,
          solicitudId: sol.id,
          company: worker.companyName,
          partner: worker.id,
          amount: proposedAmount,
          interest_rate: interestRate,
          deadline,
          amortization_frequency: frequency,
          amortization,
          comision,
          medical_balance: medicalBalance,
          status: "pending",
          estado: "pending",
          createdAt: proposalDate.toISOString(),
          fechaCreacion: Timestamp.fromDate(proposalDate),
          updatedAt: proposalDate.toISOString(),
          requestInfo: {
            purpose: sol.data.purpose,
            type: sol.data.type,
            originalAmount: sol.data.amount,
            originalTerm: sol.data.term,
            originalPayment: sol.data.payment,
          },
          [SEED_MARKER]: true,
        },
        _worker: worker,
        _solId: sol.id,
        _userId: sol._userId,
      });

      // Notification: nueva_propuesta to the user
      notifications.push({
        id: uid(),
        data: {
          recipientId: sol._userId,
          type: "nueva_propuesta",
          title: "Nueva propuesta recibida",
          message: `${worker.companyName} ha enviado una propuesta para tu solicitud.`,
          read: Math.random() > 0.4,
          createdAt: Timestamp.fromDate(proposalDate),
          data: {
            loanId: sol.id,
            proposalId,
            amount: proposedAmount,
            interestRate,
            amortizationFrequency: frequency,
            amortization,
            term: deadline,
            comision,
            medicalBalance,
            lenderName: worker.companyName,
            purpose: sol.data.purpose,
            loanType: sol.data.type,
          },
          emailSent: true,
          [SEED_MARKER]: true,
        },
      });
    }

    proposals.push(...solProposals);

    // Decide outcome: 60% accepted, 20% all rejected, 20% still pending
    const outcome = Math.random();
    if (outcome < 0.6 && solProposals.length > 0) {
      // Accept one proposal
      const winnerIdx = randInt(0, solProposals.length - 1);
      const winner = solProposals[winnerIdx];
      winner.data.status = "accepted";
      winner.data.estado = "accepted";
      sol.data.status = "approved";
      sol.data.acceptedProposalId = winner.id;

      // Reject the rest
      for (let j = 0; j < solProposals.length; j++) {
        if (j === winnerIdx) continue;
        solProposals[j].data.status = "rejected";
        solProposals[j].data.estado = "rejected";

        // Notification: loan_assigned_other to rejected workers
        notifications.push({
          id: uid(),
          data: {
            recipientId: solProposals[j]._worker.id,
            type: "loan_assigned_other",
            title: "El Usuario ha aceptado otra propuesta",
            message: "La solicitud fue asignada a otra propuesta.",
            read: Math.random() > 0.5,
            createdAt: Timestamp.fromDate(new Date()),
            data: {
              loanId: sol.id,
              proposalId: solProposals[j].id,
              winningOffer: {
                amount: winner.data.amount,
                interestRate: winner.data.interest_rate,
                amortizationFrequency: winner.data.amortization_frequency,
                amortization: winner.data.amortization,
                term: winner.data.deadline,
                comision: winner.data.comision,
                medicalBalance: winner.data.medical_balance,
              },
            },
            emailSent: true,
            [SEED_MARKER]: true,
          },
        });
      }

      // Notification: loan_accepted to winner
      notifications.push({
        id: uid(),
        data: {
          recipientId: winner._worker.id,
          type: "loan_accepted",
          title: "¡Tu propuesta fue aceptada!",
          message: "El solicitante ha aceptado tu propuesta de crédito.",
          read: Math.random() > 0.3,
          createdAt: Timestamp.fromDate(new Date()),
          data: {
            loanId: sol.id,
            proposalId: winner.id,
            amount: winner.data.amount,
          },
          emailSent: true,
          [SEED_MARKER]: true,
        },
      });
    } else if (outcome < 0.8) {
      // All rejected
      for (const p of solProposals) {
        p.data.status = "rejected";
        p.data.estado = "rejected";
      }
      sol.data.status = "rejected";
    }
    // else: all stay pending
  }

  return { proposals, notifications };
}

// ─── Write to Firestore in batches ──────────────────────────────────────────
async function writeBatch(collectionName, items) {
  const BATCH_SIZE = 400; // Firestore limit is 500, stay under
  let written = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = items.slice(i, i + BATCH_SIZE);

    for (const item of chunk) {
      const ref = db.collection(collectionName).doc(item.id);
      batch.set(ref, item.data);
    }

    await batch.commit();
    written += chunk.length;
    process.stdout.write(`  ${collectionName}: ${written}/${items.length}\r`);
  }
  console.log(`  ✅ ${collectionName}: ${items.length} documents written`);
}

// ─── Clean seeded data ──────────────────────────────────────────────────────
async function cleanSeededData() {
  const collections = ["cuentas", "solicitudes", "propuestas", "notifications"];

  for (const col of collections) {
    const snapshot = await db.collection(col).where(SEED_MARKER, "==", true).get();
    if (snapshot.empty) {
      console.log(`  ${col}: 0 seeded documents found`);
      continue;
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
      process.stdout.write(`  ${col}: deleted ${deleted}/${docs.length}\r`);
    }
    console.log(`  🗑️  ${col}: ${docs.length} seeded documents deleted`);
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const shouldClean = args.includes("--clean");

  if (shouldClean) {
    console.log("\n🧹 Cleaning previously seeded data...");
    await cleanSeededData();
    console.log("✅ Clean complete.\n");
  }

  console.log("🌱 Generating seed data...\n");

  // 1. Generate data
  const users = generateUsers(100);
  const companies = generateCompanies();
  const solicitudes = generateSolicitudes(users);
  const { proposals, notifications } = generateProposals(solicitudes, companies);

  // Collect all cuentas (users + admins + workers)
  const allCuentas = [
    ...users,
    ...companies.map((c) => ({ id: c.id, data: c.data })),
    ...companies.flatMap((c) => c.workers),
  ];

  console.log(`  👤 Users: ${users.length}`);
  console.log(`  🏢 Companies: ${companies.length} (${companies.reduce((s, c) => s + c.workers.length, 0)} workers)`);
  console.log(`  📋 Solicitudes: ${solicitudes.length}`);
  console.log(`  💰 Propuestas: ${proposals.length}`);
  console.log(`  🔔 Notifications: ${notifications.length}`);
  console.log(`  📊 Total documents: ${allCuentas.length + solicitudes.length + proposals.length + notifications.length}\n`);

  // Summary stats
  const accepted = proposals.filter((p) => p.data.status === "accepted").length;
  const rejected = proposals.filter((p) => p.data.status === "rejected").length;
  const pending = proposals.filter((p) => p.data.status === "pending").length;
  console.log(`  Proposals breakdown: ✅ ${accepted} accepted, ❌ ${rejected} rejected, ⏳ ${pending} pending\n`);

  // 2. Write to Firestore
  console.log("📤 Writing to Firestore...\n");
  await writeBatch("cuentas", allCuentas);
  await writeBatch("solicitudes", solicitudes);
  await writeBatch("propuestas", proposals);
  await writeBatch("notifications", notifications);

  console.log("\n🎉 Seed complete! All data has the '__seeded__' marker for easy cleanup.");
  console.log("   Run with --clean to remove seeded data: node scripts/seed-database.js --clean\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
