/**
 * seed-activity.js
 *
 * Genera solicitudes, propuestas y notificaciones usando las cuentas
 * que YA existen en Firestore. NO crea usuarios nuevos en Firebase Auth.
 *
 * Usage:
 *   node scripts/seed-activity.js          # genera datos
 *   node scripts/seed-activity.js --clean  # borra datos de prueba y regenera
 *   node scripts/seed-activity.js --wipe   # solo borra, no regenera
 */

const admin = require("firebase-admin");
const fs    = require("fs");
const path  = require("path");
const crypto = require("crypto");

// ─── Load .env.local ──────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) { console.error(".env.local not found"); process.exit(1); }
  fs.readFileSync(envPath, "utf-8").split("\n").forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith("#")) return;
    const eq = t.indexOf("=");
    if (eq === -1) return;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  });
}
loadEnv();

const projectId   = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey  = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) { console.error("Missing Firebase credentials"); process.exit(1); }

admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;

const SEED_TAG = "isActivitySeed";
const delay = ms => new Promise(r => setTimeout(r, ms));

// ─── Helpers ──────────────────────────────────────────────────────────────────
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => Math.random() * (max - min) + min;
const hexId = () => crypto.randomBytes(14).toString("hex");
function pastDate(daysMin, daysMax) {
  const d = new Date();
  d.setDate(d.getDate() - randInt(daysMin, daysMax));
  d.setHours(randInt(8, 20), randInt(0, 59), randInt(0, 59));
  return d;
}

const LOAN_TYPES   = ["consumo", "deudas", "capital", "maquinaria"];
const PURPOSES     = ["Personal", "Negocio"];
const TERMS        = ["6 meses", "12 meses", "18 meses", "24 meses", "36 meses"];
const FREQUENCIES  = ["Mensual", "Quincenal", "Semanal"];

// ─── Read existing accounts ───────────────────────────────────────────────────
async function loadAccounts() {
  console.log("  Leyendo cuentas existentes...");
  const snap = await db.collection("cuentas").get();

  const borrowers = [];
  const lenders   = [];

  snap.forEach(doc => {
    const d = doc.data();
    if (d.type === "borrower") borrowers.push({ id: doc.id, email: d.email, name: d.name });
    if (d.type === "lender")   lenders.push({ id: doc.id, email: d.email, name: d.name, company: d.companyName || "Empresa" });
  });

  console.log(`    ${borrowers.length} borrowers, ${lenders.length} lenders`);
  if (borrowers.length === 0) { console.error("No hay borrowers en cuentas. Crea al menos uno primero."); process.exit(1); }
  if (lenders.length === 0)   { console.error("No hay lenders en cuentas. Crea al menos uno primero."); process.exit(1); }

  return { borrowers, lenders };
}

// ─── Generate solicitudes ─────────────────────────────────────────────────────
function makeSolicitudes(borrowers, count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const borrower = pick(borrowers);
    const amount   = Math.round(randInt(10000, 250000) / 1000) * 1000;
    const created  = pastDate(5, 120);
    result.push({
      id: hexId(),
      data: {
        userId:            borrower.id,
        amount,
        income:            randInt(8000, 35000),
        term:              pick(TERMS),
        payment:           pick(FREQUENCIES),
        purpose:           pick(PURPOSES),
        type:              pick(LOAN_TYPES),
        status:            "pending",
        acceptedProposalId: null,
        acceptedOfferId:   null,
        createdAt:         created.toISOString(),
        updatedAt:         created.toISOString(),
        [SEED_TAG]:        true,
      },
      _borrowerId: borrower.id,
      _created:    created,
      _amount:     amount,
    });
  }
  return result;
}

// ─── Generate proposals + notifications ──────────────────────────────────────
function makeProposalsAndNotifications(solicitudes, lenders, acceptRatio) {
  const proposals     = [];
  const notifications = [];

  for (const sol of solicitudes) {
    // Pick 2-5 lenders randomly (no repeats)
    const shuffled    = [...lenders].sort(() => Math.random() - 0.5);
    const participants = shuffled.slice(0, randInt(2, Math.min(5, lenders.length)));
    const solProposals = [];

    for (const lender of participants) {
      const interestRate = Math.round(randFloat(12, 48) * 100) / 100;
      const deadline     = parseInt(sol.data.term) || 12;
      const amount       = Math.round((sol._amount * randFloat(0.85, 1.1)) / 1000) * 1000;
      const amortization = Math.round(amount / deadline);
      const comision     = Math.round(amount * randFloat(0.01, 0.05));
      const medicalBalance = randInt(0, 1500);
      const propDate     = new Date(sol._created);
      propDate.setDate(propDate.getDate() + randInt(1, 5));
      const propId = hexId();

      solProposals.push({
        id: propId,
        data: {
          lenderId:             lender.id,
          loanId:               sol.id,
          solicitudId:          sol.id,
          company:              lender.company,
          amount,
          interestRate,
          deadline,
          amortizationFrequency: sol.data.payment,
          amortization,
          comision,
          medicalBalance,
          status:               "pending",
          createdAt:            propDate.toISOString(),
          updatedAt:            propDate.toISOString(),
          requestInfo: {
            purpose:         sol.data.purpose,
            type:            sol.data.type,
            originalAmount:  sol.data.amount,
            originalTerm:    sol.data.term,
            originalPayment: sol.data.payment,
          },
          [SEED_TAG]: true,
        },
        _lender:   lender,
        _propDate: propDate,
      });

      // nueva_propuesta notification to borrower
      notifications.push({
        id: hexId(),
        data: {
          recipientId: sol._borrowerId,
          type:        "nueva_propuesta",
          title:       "Nueva propuesta recibida",
          message:     `${lender.company} envió una propuesta por $${amount.toLocaleString()}.`,
          read:        Math.random() > 0.5,
          emailSent:   true,
          createdAt:   Timestamp.fromDate(propDate),
          data: {
            loanId: sol.id, proposalId: propId,
            amount, interestRate,
            amortizationFrequency: sol.data.payment,
            amortization, term: deadline, comision, medicalBalance,
            lenderName: lender.company,
            purpose: sol.data.purpose, loanType: sol.data.type,
          },
          [SEED_TAG]: true,
        },
      });
    }

    proposals.push(...solProposals);

    // Decide outcome
    const shouldAccept = Math.random() < acceptRatio && solProposals.length >= 2;

    if (shouldAccept) {
      // Winner = lowest interest rate
      solProposals.sort((a, b) => a.data.interestRate - b.data.interestRate);
      const winner = solProposals[0];
      winner.data.status    = "accepted";
      sol.data.status       = "approved";
      sol.data.acceptedProposalId = winner.id;
      sol.data.acceptedOfferId    = winner.id;
      sol.data.updatedAt    = new Date().toISOString();

      // loan_accepted → winner
      notifications.push({
        id: hexId(),
        data: {
          recipientId: winner._lender.id,
          type:        "loan_accepted",
          title:       "¡Tu propuesta fue aceptada!",
          message:     `El solicitante aceptó tu propuesta de $${winner.data.amount.toLocaleString()} al ${winner.data.interestRate}% anual.`,
          read:        Math.random() > 0.4,
          emailSent:   true,
          createdAt:   Timestamp.fromDate(new Date()),
          data: {
            loanId: sol.id, proposalId: winner.id,
            amount: winner.data.amount, interestRate: winner.data.interestRate,
            amortizationFrequency: winner.data.amortizationFrequency,
            amortization: winner.data.amortization,
            term: winner.data.deadline,
            comision: winner.data.comision,
            medicalBalance: winner.data.medicalBalance,
            purpose: sol.data.purpose, loanType: sol.data.type,
          },
          [SEED_TAG]: true,
        },
      });

      // loan_assigned_other → all losers (includes BOTH winningOffer AND competitorOffer)
      for (let j = 1; j < solProposals.length; j++) {
        const loser = solProposals[j];
        loser.data.status   = "rejected";
        loser.data.updatedAt = new Date().toISOString();

        notifications.push({
          id: hexId(),
          data: {
            recipientId: loser._lender.id,
            type:        "loan_assigned_other",
            title:       "El usuario ha aceptado otra propuesta",
            message:     "La solicitud fue asignada a otra propuesta.",
            read:        Math.random() > 0.5,
            emailSent:   true,
            createdAt:   Timestamp.fromDate(new Date()),
            data: {
              loanId: sol.id,
              purpose: sol.data.purpose,
              loanType: sol.data.type,
              // Both fields required for Inteligencia Competitiva
              winningOffer: {
                amount:               winner.data.amount,
                interestRate:         winner.data.interestRate,
                amortizationFrequency: winner.data.amortizationFrequency,
                amortization:         winner.data.amortization,
                term:                 winner.data.deadline,
                comision:             winner.data.comision,
                medicalBalance:       winner.data.medicalBalance,
              },
              competitorOffer: {
                amount:               loser.data.amount,
                interestRate:         loser.data.interestRate,
                amortizationFrequency: loser.data.amortizationFrequency,
                amortization:         loser.data.amortization,
                term:                 loser.data.deadline,
                comision:             loser.data.comision,
                medicalBalance:       loser.data.medicalBalance,
              },
            },
            [SEED_TAG]: true,
          },
        });
      }
    }
  }

  return { proposals, notifications };
}

// ─── Batch write ──────────────────────────────────────────────────────────────
async function writeBatch(col, items) {
  if (items.length === 0) { console.log(`  ${col}: 0 docs`); return; }
  const BS = 400;
  for (let i = 0; i < items.length; i += BS) {
    const batch = db.batch();
    items.slice(i, i + BS).forEach(it => batch.set(db.collection(col).doc(it.id), it.data));
    await batch.commit();
  }
  console.log(`  ${col}: ${items.length} docs escritos`);
}

// ─── Wipe seeded activity ─────────────────────────────────────────────────────
async function wipeActivity() {
  console.log("\nBorrando datos de prueba anteriores...");
  for (const col of ["solicitudes", "propuestas", "notifications"]) {
    const snap = await db.collection(col).where(SEED_TAG, "==", true).get();
    if (snap.empty) { console.log(`  ${col}: 0`); continue; }
    for (let i = 0; i < snap.docs.length; i += 400) {
      const batch = db.batch();
      snap.docs.slice(i, i + 400).forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
    console.log(`  ${col}: ${snap.docs.length} eliminados`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args     = process.argv.slice(2);
  const doClean  = args.includes("--clean");
  const doWipe   = args.includes("--wipe");

  if (doWipe) { await wipeActivity(); console.log("\nListo.\n"); process.exit(0); }
  if (doClean) await wipeActivity();

  console.log("\nCargando cuentas existentes...\n");
  const { borrowers, lenders } = await loadAccounts();

  // Config — ajusta estos números según necesites
  const SOLICITUDES_COUNT = 300;  // cuántas solicitudes crear
  const ACCEPT_RATIO      = 0.65; // 65% de solicitudes se aprueban (generan loan_assigned_other)

  console.log(`\nGenerando ${SOLICITUDES_COUNT} solicitudes con ratio de aceptación ${Math.round(ACCEPT_RATIO * 100)}%...\n`);

  const solicitudes = makeSolicitudes(borrowers, SOLICITUDES_COUNT);
  const { proposals, notifications } = makeProposalsAndNotifications(solicitudes, lenders, ACCEPT_RATIO);

  const accepted  = proposals.filter(p => p.data.status === "accepted").length;
  const rejected  = proposals.filter(p => p.data.status === "rejected").length;
  const pending   = proposals.filter(p => p.data.status === "pending").length;
  const lossNotifs = notifications.filter(n => n.data.type === "loan_assigned_other").length;

  console.log(`  Solicitudes:    ${solicitudes.length}`);
  console.log(`  Propuestas:     ${proposals.length} (${accepted} aceptadas, ${rejected} rechazadas, ${pending} pendientes)`);
  console.log(`  Notificaciones: ${notifications.length} (${lossNotifs} loan_assigned_other con competitorOffer)`);

  console.log("\nEscribiendo en Firestore...\n");
  await writeBatch("solicitudes", solicitudes);
  await writeBatch("propuestas", proposals);
  await writeBatch("notifications", notifications);

  console.log("\n" + "=".repeat(50));
  console.log("  SEED COMPLETO");
  console.log("=".repeat(50));
  console.log(`\n  Cada lender con propuestas rechazadas ya tiene`);
  console.log(`  notificaciones loan_assigned_other con winningOffer`);
  console.log(`  + competitorOffer → Inteligencia Competitiva activa.`);
  console.log(`\n  Para limpiar: node scripts/seed-activity.js --wipe`);
  console.log("=".repeat(50) + "\n");

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
