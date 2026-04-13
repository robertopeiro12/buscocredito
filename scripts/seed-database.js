/**
 * Seed script realista para BuscoCredito.
 * Genera datos que reflejan el mercado de creditos personales en Mexico.
 *
 * Fuentes de datos:
 *   - Buro de Credito: Score 300-850, 50% >550, 25% >650
 *   - CONDUSEF: Tasas 9%-60%, plazos 6-60 meses
 *   - INEGI: Ingreso promedio $7,674, variacion por estado
 *   - Banxico: Tasa referencia 7%
 *   - Mercado: Comisiones 0-8%, montos $5,000-$1,000,000
 *
 * Correlaciones implementadas:
 *   - Ingreso correlacionado con estado (norte > sur)
 *   - Monto solicitado <= 6x ingreso mensual
 *   - Score crediticio correlacionado con ingreso y edad
 *   - Tasa de interes inversamente proporcional al score
 *   - Probabilidad de aprobacion correlacionada con score
 *   - Montos de propuesta ajustados al perfil de riesgo
 *
 * ALL accounts get real Firebase Auth (password: Test1234!)
 *
 * Usage: node scripts/seed-database.js
 *        node scripts/seed-database.js --clean
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ─── Load .env.local ────────────────────────────────────────────────────────
function loadEnv() {
  const envPath = path.resolve(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) { console.error(".env.local not found"); process.exit(1); }
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
if (!projectId || !clientEmail || !privateKey) { console.error("Missing Firebase credentials"); process.exit(1); }

admin.initializeApp({ credential: admin.credential.cert({ projectId, clientEmail, privateKey }) });
const db = admin.firestore();
const auth = admin.auth();
const Timestamp = admin.firestore.Timestamp;

const PASSWORD = "Test1234!";
const SEED = "isSeeded";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ─── Helpers ────────────────────────────────────────────────────────────────
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function pickWeighted(items) {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) { r -= item.weight; if (r <= 0) return item.value; }
  return items[items.length - 1].value;
}
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randFloat(min, max) { return Math.random() * (max - min) + min; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
// Normal distribution (Box-Muller)
function randNormal(mean, stddev) {
  const u1 = Math.random(); const u2 = Math.random();
  return mean + stddev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}
function pastDate(daysMin, daysMax) {
  const d = new Date(); d.setDate(d.getDate() - randInt(daysMin, daysMax));
  d.setHours(randInt(7, 21), randInt(0, 59), randInt(0, 59)); return d;
}
function hexId() { return crypto.randomBytes(14).toString("hex"); }

// ─── DATOS REALES DE MEXICO ────────────────────────────────────────────────

// Estados ponderados por poblacion y actividad crediticia (INEGI 2025)
const STATES = [
  { value: "Estado de Mexico",   weight: 13.4, avgIncome: 9500,  cities: ["Toluca", "Naucalpan", "Tlalnepantla", "Ecatepec", "Huixquilucan", "Atizapan"] },
  { value: "Ciudad de Mexico",   weight: 10.0, avgIncome: 16000, cities: ["Benito Juarez", "Coyoacan", "Miguel Hidalgo", "Tlalpan", "Azcapotzalco", "Iztapalapa", "Cuauhtemoc", "Alvaro Obregon"] },
  { value: "Jalisco",            weight: 7.5,  avgIncome: 11500, cities: ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonala", "Puerto Vallarta"] },
  { value: "Nuevo Leon",         weight: 7.0,  avgIncome: 15500, cities: ["Monterrey", "San Pedro Garza Garcia", "San Nicolas", "Apodaca", "Santa Catarina"] },
  { value: "Veracruz",           weight: 5.0,  avgIncome: 7500,  cities: ["Veracruz", "Xalapa", "Coatzacoalcos", "Boca del Rio"] },
  { value: "Puebla",             weight: 5.0,  avgIncome: 8000,  cities: ["Puebla", "Cholula", "Atlixco", "Tehuacan"] },
  { value: "Guanajuato",         weight: 4.5,  avgIncome: 9000,  cities: ["Leon", "Irapuato", "Celaya", "Guanajuato", "Salamanca"] },
  { value: "Chihuahua",          weight: 3.0,  avgIncome: 12000, cities: ["Chihuahua", "Ciudad Juarez", "Delicias"] },
  { value: "Queretaro",          weight: 3.5,  avgIncome: 13000, cities: ["Queretaro", "San Juan del Rio", "Corregidora"] },
  { value: "Sonora",             weight: 2.5,  avgIncome: 11000, cities: ["Hermosillo", "Ciudad Obregon", "Nogales"] },
  { value: "Coahuila",           weight: 2.5,  avgIncome: 12500, cities: ["Saltillo", "Torreon", "Monclova"] },
  { value: "Baja California",    weight: 3.0,  avgIncome: 13000, cities: ["Tijuana", "Mexicali", "Ensenada"] },
  { value: "Yucatan",            weight: 2.0,  avgIncome: 9500,  cities: ["Merida", "Valladolid", "Progreso"] },
  { value: "Quintana Roo",       weight: 2.0,  avgIncome: 11000, cities: ["Cancun", "Playa del Carmen", "Chetumal"] },
  { value: "Tabasco",            weight: 1.5,  avgIncome: 8500,  cities: ["Villahermosa", "Cardenas", "Comalcalco"] },
  { value: "Sinaloa",            weight: 2.0,  avgIncome: 10000, cities: ["Culiacan", "Mazatlan", "Los Mochis"] },
  { value: "Aguascalientes",     weight: 1.5,  avgIncome: 10500, cities: ["Aguascalientes", "Jesus Maria"] },
  { value: "Oaxaca",             weight: 1.5,  avgIncome: 6500,  cities: ["Oaxaca de Juarez", "Salina Cruz", "Juchitan"] },
  { value: "Chiapas",            weight: 1.2,  avgIncome: 5800,  cities: ["Tuxtla Gutierrez", "San Cristobal", "Tapachula"] },
  { value: "Guerrero",           weight: 1.0,  avgIncome: 6000,  cities: ["Acapulco", "Chilpancingo", "Zihuatanejo"] },
  { value: "Tamaulipas",         weight: 2.0,  avgIncome: 11000, cities: ["Reynosa", "Tampico", "Nuevo Laredo", "Matamoros"] },
  { value: "Michoacan",          weight: 2.5,  avgIncome: 7500,  cities: ["Morelia", "Uruapan", "Zamora", "Lazaro Cardenas"] },
  { value: "San Luis Potosi",    weight: 1.5,  avgIncome: 9000,  cities: ["San Luis Potosi", "Ciudad Valles", "Soledad"] },
  { value: "Hidalgo",            weight: 1.5,  avgIncome: 8000,  cities: ["Pachuca", "Tulancingo", "Tula"] },
  { value: "Morelos",            weight: 1.5,  avgIncome: 9000,  cities: ["Cuernavaca", "Jiutepec", "Cuautla"] },
];

const FIRST_NAMES_M = ["Carlos", "Jose", "Luis", "Juan", "Miguel", "Roberto", "Alejandro", "Daniel", "Ricardo", "Fernando", "Eduardo", "Andres", "Diego", "Sergio", "Raul", "Jorge", "Hector", "Oscar", "Manuel", "Francisco", "Pedro", "Arturo", "Enrique", "Gustavo", "Marco", "Antonio", "David", "Adrian", "Ivan", "Gabriel"];
const FIRST_NAMES_F = ["Maria", "Ana", "Laura", "Patricia", "Gabriela", "Fernanda", "Sofia", "Valentina", "Isabella", "Camila", "Daniela", "Mariana", "Andrea", "Carolina", "Paola", "Natalia", "Lucia", "Regina", "Jimena", "Ximena", "Paulina", "Alejandra", "Elena", "Diana", "Adriana", "Guadalupe", "Veronica", "Monica", "Claudia", "Teresa"];
const LAST_NAMES = ["Garcia", "Rodriguez", "Martinez", "Lopez", "Gonzalez", "Hernandez", "Perez", "Sanchez", "Ramirez", "Torres", "Flores", "Rivera", "Gomez", "Diaz", "Cruz", "Morales", "Reyes", "Gutierrez", "Ortiz", "Ramos", "Vargas", "Castillo", "Mendoza", "Romero", "Herrera", "Medina", "Aguilar", "Vega", "Castro", "Jimenez", "Ruiz", "Delgado", "Cervantes", "Chavez", "Salazar", "Contreras", "Nunez", "Dominguez", "Estrada", "Cortes"];
const COLONIES = ["Centro", "Del Valle", "Roma Norte", "Roma Sur", "Condesa", "Polanco", "Narvarte", "Santa Fe", "Industrial", "La Paz", "Reforma", "Insurgentes", "Juarez", "Doctores", "Obrera", "Lindavista", "Claveria", "Portales", "San Angel", "Pedregal"];
const STREETS = ["Av. Reforma", "Calle Insurgentes", "Blvd. Manuel Avila Camacho", "Calle Hidalgo", "Av. Juarez", "Calle Morelos", "Av. Universidad", "Calle 5 de Mayo", "Av. Revolucion", "Calle Madero", "Av. Constituyentes", "Calle Independencia", "Av. Chapultepec", "Calle Allende", "Av. Division del Norte", "Calle Cuauhtemoc"];

// Financieras reales de Mexico (nombres ficticios inspirados en reales)
const COMPANIES = [
  { name: "CrediFin del Norte",      baseRate: 18, maxRate: 38, region: "norte", commission: [2, 4] },
  { name: "Prestamos Azteca MX",     baseRate: 22, maxRate: 45, region: "nacional", commission: [3, 6] },
  { name: "Capital Express SOFOM",   baseRate: 15, maxRate: 35, region: "nacional", commission: [1.5, 3.5] },
  { name: "Soluciones Financieras+", baseRate: 20, maxRate: 42, region: "centro", commission: [2.5, 5] },
  { name: "FondeoRapido Fintech",    baseRate: 9,  maxRate: 28, region: "nacional", commission: [0, 2] },
  { name: "Inversiones del Bajio",   baseRate: 16, maxRate: 36, region: "bajio", commission: [2, 4.5] },
  { name: "Credito Confianza SAPI",  baseRate: 19, maxRate: 40, region: "nacional", commission: [2, 4] },
  { name: "NuevoCredito Digital",    baseRate: 10, maxRate: 30, region: "nacional", commission: [0, 1.5] },
  { name: "Financiera del Sureste",  baseRate: 24, maxRate: 55, region: "sur", commission: [3, 7] },
  { name: "Grupo Patrimonial MX",    baseRate: 14, maxRate: 32, region: "nacional", commission: [1, 3] },
];

// Plazos ponderados (mas comunes en el mercado mexicano)
const TERMS_WEIGHTED = [
  { value: "6 meses",  weight: 5 },
  { value: "12 meses", weight: 30 },
  { value: "18 meses", weight: 15 },
  { value: "24 meses", weight: 25 },
  { value: "36 meses", weight: 18 },
  { value: "48 meses", weight: 5 },
  { value: "60 meses", weight: 2 },
];

// Frecuencia de pago (quincenal es la mas comun en Mexico por nomina)
const FREQ_WEIGHTED = [
  { value: "quincenal", weight: 50 },
  { value: "mensual",   weight: 35 },
  { value: "semanal",   weight: 15 },
];

// Propositos ponderados
const PURPOSE_WEIGHTED = [
  { value: "Personal", weight: 65 },
  { value: "Negocio",  weight: 35 },
];

// Tipos de credito ponderados (basado en demanda real)
const TYPE_WEIGHTED = [
  { value: "Credito al consumo",                  weight: 35 },
  { value: "Liquidacion deudas",                  weight: 25 },
  { value: "Capital de trabajo",                  weight: 25 },
  { value: "Adquisicion de maquinaria o equipo",  weight: 15 },
];

// ─── FUNCIONES DE GENERACION CORRELACIONADA ────────────────────────────────

// Generar ingreso correlacionado con estado y edad
function generateIncome(stateData, age) {
  const baseIncome = stateData.avgIncome;
  // Edad afecta ingreso: pico entre 35-50
  const ageFactor = age < 25 ? 0.5 : age < 30 ? 0.7 : age < 35 ? 0.85 : age < 45 ? 1.0 : age < 55 ? 0.95 : 0.8;
  const income = randNormal(baseIncome * ageFactor, baseIncome * 0.35);
  return Math.round(clamp(income, 5000, 120000));
}

// Generar score crediticio correlacionado con ingreso y edad
// Buro de Credito Mexico: 50% de poblacion >550, 25% >650
function generateCreditScore(income, age) {
  // Base: mediana en 570 (realista para Mexico)
  const base = 570;
  // Ingreso aporta hasta +120 puntos (de 5k a 120k)
  const incomeBonus = ((income - 5000) / 115000) * 120;
  // Edad: experiencia crediticia
  const ageBonus = age < 25 ? -40 : age < 30 ? -10 : age < 40 ? 10 : age < 55 ? 25 : 15;
  const raw = randNormal(base + incomeBonus + ageBonus, 75);
  const score = Math.round(clamp(raw, 300, 850));

  let classification;
  if (score >= 700) classification = "Excelente";
  else if (score >= 620) classification = "Bueno";
  else if (score >= 550) classification = "Regular";
  else classification = "Bajo";

  return { score, classification };
}

// Generar monto de solicitud correlacionado con ingreso
function generateLoanAmount(income) {
  // En Mexico, montos tipicos van de 1-6x ingreso mensual
  const multiplier = randFloat(1, 6);
  const raw = income * multiplier;
  // Redondear a miles
  const rounded = Math.round(raw / 5000) * 5000;
  return clamp(rounded, 10000, 1000000);
}

// Generar tasa de interes basada en score y tipo de financiera
function generateInterestRate(creditScore, company) {
  // Score excelente (700+) obtiene tasa base, score bajo obtiene tasa maxima
  const scoreRatio = clamp((creditScore - 300) / 550, 0, 1); // 0 = peor, 1 = mejor
  const range = company.maxRate - company.baseRate;
  const rate = company.maxRate - (scoreRatio * range * 0.8); // No llega al minimo siempre
  const jitter = randFloat(-2, 2);
  return parseFloat(clamp(rate + jitter, company.baseRate, company.maxRate).toFixed(2));
}

// Determinar si una solicitud debe ser aprobada basado en score
function shouldApprove(creditScore) {
  if (creditScore >= 700) return Math.random() < 0.85;
  if (creditScore >= 620) return Math.random() < 0.65;
  if (creditScore >= 550) return Math.random() < 0.40;
  return Math.random() < 0.15;
}

function generateRFC(firstName, lastName, birthday) {
  const L = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const d = birthday;
  let rfc = (lastName.slice(0, 2) + firstName.slice(0, 1) + (L[randInt(0, 25)])).toUpperCase();
  rfc += String(d.getFullYear()).slice(2);
  rfc += String(d.getMonth() + 1).padStart(2, "0");
  rfc += String(d.getDate()).padStart(2, "0");
  for (let i = 0; i < 3; i++) rfc += (L + "0123456789")[randInt(0, 35)];
  return rfc;
}

// ─── Create Auth User ──────────────────────────────────────────────────────
async function createAuthUser(email, displayName) {
  try {
    return (await auth.createUser({ email, password: PASSWORD, displayName, emailVerified: true })).uid;
  } catch (e) {
    if (e.code === "auth/email-already-exists") return (await auth.getUserByEmail(email)).uid;
    throw e;
  }
}

// ─── CREATE BORROWERS ──────────────────────────────────────────────────────
async function createBorrowers(count) {
  const users = [];
  const usedEmails = new Set();
  console.log(`  Creando ${count} solicitantes con Auth...`);

  for (let i = 0; i < count; i++) {
    const isMale = Math.random() < 0.48;
    const firstName = pick(isMale ? FIRST_NAMES_M : FIRST_NAMES_F);
    const lastName = pick(LAST_NAMES);
    const secondLastName = pick(LAST_NAMES);
    const stateData = pickWeighted(STATES.map(s => ({ value: s, weight: s.weight })));
    const city = pick(stateData.cities);
    const age = Math.round(clamp(randNormal(35, 10), 20, 65));
    const birthday = new Date(2026 - age, randInt(0, 11), randInt(1, 28));
    const income = generateIncome(stateData, age);
    const creditScore = generateCreditScore(income, age);

    let email;
    do {
      const n = randInt(1, 9999);
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${n}@test-seed.com`;
    } while (usedEmails.has(email));
    usedEmails.add(email);

    const uid = await createAuthUser(email, `${firstName} ${lastName} ${secondLastName}`);
    await auth.setCustomUserClaims(uid, { userType: "borrower", role: "borrower", isBorrower: true, updatedAt: new Date().toISOString() });

    users.push({
      id: uid,
      _income: income,
      _creditScore: creditScore.score,
      _age: age,
      _state: stateData.value,
      data: {
        name: firstName,
        lastName,
        secondLastName,
        rfc: generateRFC(firstName, lastName, birthday),
        birthday: Timestamp.fromDate(birthday),
        phone: `+52${randInt(55, 99)}${randInt(1000, 9999)}${randInt(1000, 9999)}`,
        address: {
          street: pick(STREETS),
          exteriorNumber: String(randInt(1, 999)),
          interiorNumber: Math.random() > 0.65 ? String(randInt(1, 30)) : "",
          colony: pick(COLONIES),
          city,
          state: stateData.value,
          country: "Mexico",
          zipCode: String(randInt(1000, 99999)).padStart(5, "0"),
        },
        email,
        type: "borrower",
        creditScore,
        acceptedTerms: true,
        acceptedTermsAt: Timestamp.fromDate(pastDate(7, 180)),
        createdAt: Timestamp.fromDate(pastDate(7, 180)),
        emailNotifications: Math.random() < 0.7,
        [SEED]: true,
      },
    });

    if ((i + 1) % 10 === 0) process.stdout.write(`    ${i + 1}/${count}\r`);
    if ((i + 1) % 20 === 0) await delay(500);
  }
  console.log(`    ${count}/${count} solicitantes creados`);
  return users;
}

// ─── CREATE COMPANIES ──────────────────────────────────────────────────────
async function createCompanies() {
  const companies = [];
  console.log(`  Creando ${COMPANIES.length} financieras con Auth...`);

  for (const comp of COMPANIES) {
    const adminEmail = `admin.${comp.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@test-seed.com`;
    const adminUid = await createAuthUser(adminEmail, comp.name);
    await auth.setCustomUserClaims(adminUid, { userType: "companyAdmin", role: "companyAdmin", companyName: comp.name, isAdmin: true, updatedAt: new Date().toISOString() });

    const company = {
      id: adminUid,
      data: { companyName: comp.name, name: comp.name, type: "companyAdmin", email: adminEmail, createdAt: Timestamp.fromDate(pastDate(180, 730)), [SEED]: true },
      workers: [],
      companyName: comp.name,
      _config: comp,
    };

    const workerCount = randInt(2, 4);
    for (let w = 0; w < workerCount; w++) {
      const wName = `${pick(Math.random() < 0.5 ? FIRST_NAMES_M : FIRST_NAMES_F)} ${pick(LAST_NAMES)}`;
      const wEmail = `worker${w + 1}.${comp.name.toLowerCase().replace(/[^a-z0-9]/g, "")}@test-seed.com`;
      const wUid = await createAuthUser(wEmail, wName);
      await auth.setCustomUserClaims(wUid, { userType: "lender", role: "lender", companyName: comp.name, adminId: adminUid, isLender: true, updatedAt: new Date().toISOString() });

      company.workers.push({
        id: wUid,
        data: { companyName: comp.name, adminId: adminUid, name: wName, email: wEmail, type: "lender", createdAt: Timestamp.fromDate(pastDate(30, 365)), [SEED]: true },
      });
    }
    companies.push(company);
    console.log(`    ${comp.name}: 1 admin + ${workerCount} lenders`);
    await delay(300);
  }
  return companies;
}

// ─── GENERATE SOLICITUDES (correlacionadas) ─────────────────────────────────
function generateSolicitudes(users) {
  const solicitudes = [];
  // 55% de usuarios solicitan credito (realista)
  const active = users.filter(() => Math.random() < 0.55);

  for (const user of active) {
    const solCount = user._creditScore > 620 ? randInt(1, 2) : randInt(1, 3);
    for (let s = 0; s < solCount; s++) {
      const amount = generateLoanAmount(user._income);
      const purpose = pickWeighted(PURPOSE_WEIGHTED);
      const type = pickWeighted(TYPE_WEIGHTED);
      const term = pickWeighted(TERMS_WEIGHTED);
      const payment = pickWeighted(FREQ_WEIGHTED);
      const created = pastDate(1, 150);

      solicitudes.push({
        id: hexId(),
        data: {
          userId: user.id,
          amount,
          income: user._income,
          term,
          payment,
          purpose,
          type,
          status: "pending",
          acceptedProposalId: null,
          createdAt: created.toISOString(),
          updatedAt: created.toISOString(),
          [SEED]: true,
        },
        _created: created,
        _userId: user.id,
        _creditScore: user._creditScore,
        _income: user._income,
      });
    }
  }
  return solicitudes;
}

// ─── GENERATE PROPOSALS (correlacionadas con riesgo) ────────────────────────
function generateProposals(solicitudes, companies) {
  const proposals = [];
  const notifications = [];
  const allWorkers = companies.flatMap(c => c.workers.map(w => ({ ...w, companyName: c.companyName, _config: c._config })));

  for (const sol of solicitudes) {
    // Numero de propuestas depende del score: buen score atrae mas ofertas
    const maxProps = sol._creditScore > 650 ? randInt(2, 5) : sol._creditScore > 550 ? randInt(1, 3) : randInt(0, 2);
    if (maxProps === 0) { sol.data.status = "rejected"; continue; }

    const shuffled = [...allWorkers].sort(() => Math.random() - 0.5);
    const usedCompanies = new Set();
    const solProposals = [];

    for (const worker of shuffled) {
      if (solProposals.length >= maxProps) break;
      if (usedCompanies.has(worker.companyName)) continue;
      usedCompanies.add(worker.companyName);

      const cfg = worker._config;
      const interestRate = generateInterestRate(sol._creditScore, cfg);
      // Monto ofrecido: puede diferir del solicitado (85%-110%)
      const amountFactor = sol._creditScore > 650 ? randFloat(0.9, 1.1) : randFloat(0.7, 1.0);
      const amount = Math.round((sol.data.amount * amountFactor) / 1000) * 1000;
      const termMonths = parseInt(sol.data.term) || 12;
      const deadline = termMonths;
      const frequency = sol.data.payment;
      const amortization = Math.round(amount / deadline);
      const commissionPct = randFloat(cfg.commission[0], cfg.commission[1]);
      const comision = Math.round(amount * commissionPct / 100);
      // Seguro de vida: correlacionado con monto
      const medicalBalance = amount > 100000 ? randInt(800, 3500) : amount > 50000 ? randInt(300, 1500) : randInt(0, 500);

      const propDate = new Date(sol._created);
      propDate.setDate(propDate.getDate() + randInt(1, 7));
      propDate.setHours(randInt(8, 18), randInt(0, 59));

      const propId = hexId();
      solProposals.push({
        id: propId,
        data: {
          lenderId: worker.id,
          loanId: sol.id,
          solicitudId: sol.id,
          company: worker.companyName,
          amount,
          interestRate,
          deadline,
          amortizationFrequency: frequency,
          amortization,
          comision,
          medicalBalance,
          status: "pending",
          createdAt: propDate.toISOString(),
          updatedAt: propDate.toISOString(),
          requestInfo: {
            purpose: sol.data.purpose,
            type: sol.data.type,
            originalAmount: sol.data.amount,
            originalTerm: sol.data.term,
            originalPayment: sol.data.payment,
          },
          [SEED]: true,
        },
        _worker: worker,
      });

      notifications.push({
        id: hexId(),
        data: {
          recipientId: sol._userId, type: "nueva_propuesta",
          title: "Nueva propuesta recibida",
          message: `${worker.companyName} ha enviado una propuesta por $${amount.toLocaleString()} para tu solicitud.`,
          read: Math.random() > 0.45, readAt: null, emailSent: true, emailId: null,
          createdAt: Timestamp.fromDate(propDate),
          data: { loanId: sol.id, proposalId: propId, amount, interestRate, amortizationFrequency: frequency, amortization, term: deadline, comision, medicalBalance, lenderName: worker.companyName, purpose: sol.data.purpose, loanType: sol.data.type },
          [SEED]: true,
        },
      });
    }
    proposals.push(...solProposals);

    // Decidir resultado basado en score crediticio
    // Logica: si hay propuestas y se aprueba, siempre hay un ganador.
    // Esto asegura que las "Perdidas" tengan datos de comparacion.
    if (solProposals.length === 0) {
      sol.data.status = "rejected";
    } else if (shouldApprove(sol._creditScore)) {
      // ACEPTAR: el borrower elige la mejor tasa. Las demas quedan "rejected" CON ganador.
      solProposals.sort((a, b) => a.data.interestRate - b.data.interestRate);
      const winner = solProposals[0];
      winner.data.status = "accepted";
      sol.data.status = "approved";
      sol.data.acceptedProposalId = winner.id;

      for (let j = 1; j < solProposals.length; j++) {
        solProposals[j].data.status = "rejected";
        notifications.push({ id: hexId(), data: {
          recipientId: solProposals[j]._worker.id, type: "loan_assigned_other",
          title: "El usuario ha aceptado otra propuesta",
          message: "La solicitud fue asignada a otra propuesta.",
          read: Math.random() > 0.5, readAt: null, emailSent: true, emailId: null,
          createdAt: Timestamp.fromDate(new Date()),
          data: { loanId: sol.id, proposalId: solProposals[j].id, winningOffer: { amount: winner.data.amount, interestRate: winner.data.interestRate, amortizationFrequency: winner.data.amortizationFrequency, amortization: winner.data.amortization, term: winner.data.deadline, comision: winner.data.comision, medicalBalance: winner.data.medicalBalance } },
          [SEED]: true,
        }});
      }
      notifications.push({ id: hexId(), data: {
        recipientId: winner._worker.id, type: "loan_accepted",
        title: "Tu propuesta fue aceptada!",
        message: `El solicitante acepto tu propuesta de $${winner.data.amount.toLocaleString()} al ${winner.data.interestRate}% anual.`,
        read: Math.random() > 0.3, readAt: null, emailSent: true, emailId: null,
        createdAt: Timestamp.fromDate(new Date()),
        data: { loanId: sol.id, proposalId: winner.id, amount: winner.data.amount },
        [SEED]: true,
      }});
    } else {
      // NO APROBADO: quedan como pending (el borrower aun no decide)
      // No rechazamos todo — en la vida real, el borrower simplemente no responde
      // Esto deja las propuestas "Pendiente" en lugar de "Perdida sin ganador"
    }
  }
  return { proposals, notifications };
}

// ─── Firestore batch write ──────────────────────────────────────────────────
async function writeBatch(col, items) {
  const BS = 400; let w = 0;
  for (let i = 0; i < items.length; i += BS) {
    const batch = db.batch();
    items.slice(i, i + BS).forEach(it => batch.set(db.collection(col).doc(it.id), it.data));
    await batch.commit();
    w += Math.min(BS, items.length - i);
    process.stdout.write(`  ${col}: ${w}/${items.length}\r`);
  }
  console.log(`  ${col}: ${items.length} docs`);
}

// ─── Clean ──────────────────────────────────────────────────────────────────
async function cleanAll() {
  for (const col of ["cuentas", "solicitudes", "propuestas", "notifications"]) {
    const snap = await db.collection(col).where(SEED, "==", true).get();
    if (snap.empty) { console.log(`  ${col}: 0`); continue; }
    let d = 0;
    for (let i = 0; i < snap.docs.length; i += 400) {
      const batch = db.batch();
      snap.docs.slice(i, i + 400).forEach(doc => batch.delete(doc.ref));
      await batch.commit(); d += Math.min(400, snap.docs.length - i);
    }
    console.log(`  ${col}: ${snap.docs.length} eliminados`);
  }
  // Delete all Auth users
  console.log("\n  Eliminando Auth users...");
  let total = 0; let more = true;
  while (more) {
    const r = await auth.listUsers(1000);
    if (r.users.length === 0) break;
    const res = await auth.deleteUsers(r.users.map(u => u.uid));
    total += res.successCount;
    if (r.users.length < 1000) more = false;
  }
  console.log(`  Auth: ${total} eliminados`);
}

// ─── Main ───────────────────────────────────────────────────────────────────
async function main() {
  const shouldClean = process.argv.includes("--clean");

  if (shouldClean) {
    console.log("\nLimpiando datos anteriores...\n");
    await cleanAll();
    console.log("\nLimpieza completa.\n");
  }

  console.log("Generando datos realistas del mercado mexicano...\n");

  // 0. SuperAdmin
  console.log("  Creando superAdmin...");
  const saEmail = "superadmin@buscocredito.test";
  const saUid = await createAuthUser(saEmail, "Super Administrador");
  await auth.setCustomUserClaims(saUid, { userType: "superAdmin", role: "superAdmin", isAdmin: true, updatedAt: new Date().toISOString() });
  const saDoc = { id: saUid, data: { name: "Super Administrador", email: saEmail, type: "superAdmin", createdAt: new Date().toISOString(), [SEED]: true } };
  console.log(`    ${saEmail}`);

  // 1. Users + Companies
  const users = await createBorrowers(100);
  const companies = await createCompanies();

  // 2. Generate correlated data
  const solicitudes = generateSolicitudes(users);
  const { proposals, notifications } = generateProposals(solicitudes, companies);

  const allCuentas = [saDoc, ...users, ...companies.map(c => ({ id: c.id, data: c.data })), ...companies.flatMap(c => c.workers)];
  const wc = companies.reduce((s, c) => s + c.workers.length, 0);
  const accepted = proposals.filter(p => p.data.status === "accepted").length;
  const rejected = proposals.filter(p => p.data.status === "rejected").length;
  const pending = proposals.filter(p => p.data.status === "pending").length;
  const avgRate = proposals.length > 0 ? (proposals.reduce((s, p) => s + p.data.interestRate, 0) / proposals.length).toFixed(1) : 0;
  const avgAmount = solicitudes.length > 0 ? Math.round(solicitudes.reduce((s, sol) => s + sol.data.amount, 0) / solicitudes.length) : 0;

  console.log(`\n  === Resumen ===`);
  console.log(`  Solicitantes: ${users.length} | Financieras: ${companies.length} (${wc} lenders)`);
  console.log(`  Solicitudes: ${solicitudes.length} | Propuestas: ${proposals.length}`);
  console.log(`  Aceptadas: ${accepted} | Rechazadas: ${rejected} | Pendientes: ${pending}`);
  console.log(`  Tasa promedio: ${avgRate}% | Monto promedio: $${avgAmount.toLocaleString()}`);
  console.log(`  Notificaciones: ${notifications.length}\n`);

  // Score distribution
  const scoreRanges = { "300-549 (Bajo)": 0, "550-619 (Regular)": 0, "620-699 (Bueno)": 0, "700+ (Excelente)": 0 };
  users.forEach(u => {
    if (u._creditScore >= 700) scoreRanges["700+ (Excelente)"]++;
    else if (u._creditScore >= 620) scoreRanges["620-699 (Bueno)"]++;
    else if (u._creditScore >= 550) scoreRanges["550-619 (Regular)"]++;
    else scoreRanges["300-549 (Bajo)"]++;
  });
  console.log("  Distribucion de scores:");
  for (const [range, count] of Object.entries(scoreRanges)) {
    console.log(`    ${range}: ${count} (${Math.round(count / users.length * 100)}%)`);
  }

  console.log("\nEscribiendo en Firestore...\n");
  await writeBatch("cuentas", allCuentas);
  await writeBatch("solicitudes", solicitudes);
  await writeBatch("propuestas", proposals);
  await writeBatch("notifications", notifications);

  const authCount = (await auth.listUsers(1000)).users.length;
  console.log("\n" + "=".repeat(55));
  console.log("  SEED COMPLETO — Datos realistas del mercado mexicano");
  console.log("=".repeat(55));
  console.log(`\n  ${authCount} usuarios en Firebase Auth (password: ${PASSWORD})`);
  console.log(`\n  Cuentas ejemplo:`);
  console.log(`    SuperAdmin:    ${saEmail}`);
  console.log(`    Solicitante:   ${users[0].data.email}`);
  console.log(`    Admin Empresa: ${companies[0].data.email}`);
  console.log(`    Prestamista:   ${companies[0].workers[0].data.email}`);
  console.log(`\n  Limpiar: node scripts/seed-database.js --clean`);
  console.log("=".repeat(55) + "\n");

  process.exit(0);
}

main().catch(err => { console.error("Seed failed:", err); process.exit(1); });
