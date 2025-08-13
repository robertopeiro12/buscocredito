// Configuración de email para desarrollo local
export const emailConfig = {
  // Configuraciones básicas para desarrollo
  actionCodeSettings: {
    // Se usará window.location.origin automáticamente (localhost:3000)
    handleCodeInApp: false,
  },

  // Instrucciones para diferentes proveedores
  spamInstructions: {
    gmail: 'Revisa las pestañas "Promociones" y "Spam"',
    outlook: 'Busca en "Correo no deseado"',
    yahoo: 'Revisa "Bulk" y "Spam"',
    generic: 'Revisa tu carpeta de spam o correo no deseado'
  },

  // Configuración temporal para desarrollo
  supportEmail: 'soporte@buscocredito.com',
  fromEmail: 'noreply@buscocredito-b3f6d.firebaseapp.com' // Este se usa en desarrollo
};
