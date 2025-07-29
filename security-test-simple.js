// 🧪 Prueba rápida de seguridad
// Copia y pega esto en la consola del navegador (F12)

async function quickSecurityTest() {
  console.log("🔐 Iniciando prueba de seguridad...");
  
  try {
    // Importar Firebase (debería estar disponible globalmente)
    const { collection, getDocs } = await import('firebase/firestore');
    const { db } = await import('./app/firebase.ts');
    
    console.log("📊 Intentando leer TODAS las solicitudes...");
    const solicitudesRef = collection(db, 'solicitudes');
    const allSolicitudes = await getDocs(solicitudesRef);
    
    console.log(`✅ Solicitudes que puedes ver: ${allSolicitudes.size}`);
    console.log("📝 Lista de solicitudes:");
    
    allSolicitudes.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${doc.id}, Usuario: ${data.userId}, Monto: $${data.amount || 'N/A'}`);
    });
    
    // Verificar si todas las solicitudes son tuyas
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (currentUser) {
      const ownSolicitudes = allSolicitudes.docs.filter(doc => doc.data().userId === currentUser.uid);
      console.log(`\n👤 Tu ID: ${currentUser.uid}`);
      console.log(`🔒 Solicitudes tuyas: ${ownSolicitudes.length}/${allSolicitudes.size}`);
      
      if (ownSolicitudes.length === allSolicitudes.size) {
        console.log("✅ ¡PERFECTO! Solo puedes ver tus propias solicitudes");
      } else {
        console.log("⚠️ ADVERTENCIA: Puedes ver solicitudes de otros usuarios");
      }
    }
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.message.includes('permission')) {
      console.log("🛡️ ¡EXCELENTE! Las reglas de seguridad están bloqueando acceso no autorizado");
    }
  }
}

// Ejecutar automáticamente
quickSecurityTest();
