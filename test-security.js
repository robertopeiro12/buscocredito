// Script para probar las reglas de seguridad de Firestore
// Ejecuta esto en la consola del navegador (F12) después de hacer login

async function testSecurity() {
  console.log("🧪 Iniciando pruebas de seguridad...");
  
  try {
    // 1. Intentar leer TODAS las solicitudes (debería fallar para usuarios normales)
    console.log("\n1️⃣ Probando acceso a todas las solicitudes...");
    const solicitudesRef = collection(db, 'solicitudes');
    const allSolicitudes = await getDocs(solicitudesRef);
    console.log(`📊 Solicitudes encontradas: ${allSolicitudes.size}`);
    
    // 2. Intentar leer TODAS las propuestas
    console.log("\n2️⃣ Probando acceso a todas las propuestas...");
    const propuestasRef = collection(db, 'propuestas');
    const allPropuestas = await getDocs(propuestasRef);
    console.log(`📊 Propuestas encontradas: ${allPropuestas.size}`);
    
    // 3. Intentar leer TODOS los usuarios (debería fallar)
    console.log("\n3️⃣ Probando acceso a todos los usuarios...");
    const usersRef = collection(db, 'users');
    const allUsers = await getDocs(usersRef);
    console.log(`👥 Usuarios encontrados: ${allUsers.size}`);
    
    console.log("\n✅ Pruebas completadas sin errores");
    
  } catch (error) {
    console.error("❌ Error (esto es BUENO si es permission denied):", error.message);
    
    if (error.message.includes('permission')) {
      console.log("🛡️ ¡PERFECTO! Las reglas de seguridad están funcionando");
    } else {
      console.log("⚠️ Error inesperado - revisar configuración");
    }
  }
}

// Función helper para verificar tu propio acceso
async function testOwnAccess() {
  console.log("\n🔑 Probando acceso a tus propios datos...");
  
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log("❌ No hay usuario logueado");
      return;
    }
    
    console.log(`👤 Usuario actual: ${user.uid}`);
    
    // Intentar leer tu propio perfil
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      console.log("✅ Puedes leer tu propio perfil");
      console.log("👤 Datos:", userDoc.data());
    } else {
      console.log("⚠️ No se encontró tu perfil de usuario");
    }
    
  } catch (error) {
    console.error("❌ Error accediendo a tus datos:", error.message);
  }
}

console.log("🚀 Scripts de prueba cargados!");
console.log("📝 Para probar ejecuta:");
console.log("   testSecurity() - Prueba reglas de seguridad");
console.log("   testOwnAccess() - Prueba acceso a tus datos");
