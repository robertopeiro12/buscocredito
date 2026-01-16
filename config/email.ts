// Configuración de email para desarrollo y producción
// 
// CONFIGURACIÓN REQUERIDA:
// Agregar las siguientes variables de entorno en .env.local:
//
// RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx  # API key de Resend (https://resend.com)
// EMAIL_FROM=BuscoCredito <noreply@tudominio.com>  # Email remitente (debe estar verificado en Resend)
// NEXT_PUBLIC_APP_URL=https://buscocredito.com  # URL de la aplicación
//
// NOTA: Para producción, necesitas verificar tu dominio en Resend

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
  fromEmail: process.env.EMAIL_FROM || 'noreply@buscocredito-b3f6d.firebaseapp.com',
  
  // Tipos de notificaciones que envían email
  emailNotificationTypes: [
    'nueva_propuesta',      // Nueva propuesta recibida
    'loan_accepted',        // Propuesta aceptada
    'loan_assigned_other',  // Propuesta rechazada (otra fue elegida)
  ]
};
