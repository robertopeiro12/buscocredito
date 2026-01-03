import "server-only";

// Email service for sending notifications
// Uses Resend API for reliable email delivery

export interface EmailNotificationData {
  recipientEmail: string;
  recipientName: string;
  type: 'nueva_propuesta' | 'loan_accepted' | 'loan_assigned_other' | 'loan_rejected' | 'general';
  title: string;
  message: string;
  data?: {
    loanId?: string;
    proposalId?: string;
    amount?: number;
    interestRate?: number;
    amortizationFrequency?: string;
    term?: number;
    comision?: number;
    medicalBalance?: number;
    winningOffer?: {
      amount?: number;
      interestRate?: number;
      amortizationFrequency?: string;
      term?: number;
      comision?: number;
      medicalBalance?: number;
    };
  };
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Generate email templates based on notification type
function generateEmailTemplate(data: EmailNotificationData): EmailTemplate {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://buscocredito.com';
  const dashboardUrl = `${baseUrl}/user_dashboard`;
  
  const commonStyles = `
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
    .header .logo { font-size: 32px; margin-bottom: 10px; }
    .content { padding: 30px; }
    .content h2 { color: #1f2937; margin-top: 0; }
    .content p { color: #4b5563; line-height: 1.6; }
    .highlight-box { background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 20px 0; }
    .detail-item { background-color: #f9fafb; padding: 12px; border-radius: 8px; }
    .detail-item .label { font-size: 12px; color: #6b7280; text-transform: uppercase; }
    .detail-item .value { font-size: 18px; font-weight: 600; color: #1f2937; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { color: #6b7280; font-size: 12px; margin: 5px 0; }
    .warning-box { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .success-box { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
  `;

  switch (data.type) {
    case 'nueva_propuesta':
      return {
        subject: `💰 Nueva propuesta recibida - ${data.data?.amount?.toLocaleString('es-MX') || ''} MXN`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><style>${commonStyles}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">💰</div>
                <h1>¡Nueva Propuesta!</h1>
              </div>
              <div class="content">
                <h2>Hola ${data.recipientName},</h2>
                <p>${data.message}</p>
                
                <div class="highlight-box">
                  <h3 style="margin-top: 0; color: #059669;">Detalles de la propuesta:</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #d1fae5;">
                        <strong>Monto:</strong>
                      </td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #d1fae5; text-align: right;">
                        $${data.data?.amount?.toLocaleString('es-MX') || 'N/A'} MXN
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #d1fae5;">
                        <strong>Tasa de interés:</strong>
                      </td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #d1fae5; text-align: right;">
                        ${data.data?.interestRate || 'N/A'}%
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; border-bottom: 1px solid #d1fae5;">
                        <strong>Plazo:</strong>
                      </td>
                      <td style="padding: 8px 0; border-bottom: 1px solid #d1fae5; text-align: right;">
                        ${data.data?.term || 'N/A'} meses
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;">
                        <strong>Frecuencia de pago:</strong>
                      </td>
                      <td style="padding: 8px 0; text-align: right;">
                        ${data.data?.amortizationFrequency || 'N/A'}
                      </td>
                    </tr>
                  </table>
                </div>
                
                <p style="text-align: center;">
                  <a href="${dashboardUrl}" class="cta-button">Ver Propuesta</a>
                </p>
                
                <p style="color: #6b7280; font-size: 14px;">
                  Ingresa a tu dashboard para revisar todos los detalles y tomar una decisión.
                </p>
              </div>
              <div class="footer">
                <p>Este correo fue enviado automáticamente por BuscoCredito</p>
                <p>© ${new Date().getFullYear()} BuscoCredito. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Hola ${data.recipientName},

${data.message}

Detalles de la propuesta:
- Monto: $${data.data?.amount?.toLocaleString('es-MX') || 'N/A'} MXN
- Tasa de interés: ${data.data?.interestRate || 'N/A'}%
- Plazo: ${data.data?.term || 'N/A'} meses
- Frecuencia de pago: ${data.data?.amortizationFrequency || 'N/A'}

Ingresa a tu dashboard para revisar: ${dashboardUrl}

--
BuscoCredito
        `
      };

    case 'loan_accepted':
      return {
        subject: `✅ ¡Tu propuesta fue aceptada!`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><style>${commonStyles}</style></head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #047857 100%);">
                <div class="logo">✅</div>
                <h1>¡Propuesta Aceptada!</h1>
              </div>
              <div class="content">
                <h2>¡Felicidades ${data.recipientName}!</h2>
                <p>${data.message}</p>
                
                <div class="success-box">
                  <h3 style="margin-top: 0; color: #047857;">Detalles de la propuesta aceptada:</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0;"><strong>Monto:</strong></td>
                      <td style="text-align: right;">$${data.data?.amount?.toLocaleString('es-MX') || 'N/A'} MXN</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0;"><strong>Tasa:</strong></td>
                      <td style="text-align: right;">${data.data?.interestRate || 'N/A'}%</td>
                    </tr>
                  </table>
                </div>
                
                <p style="text-align: center;">
                  <a href="${dashboardUrl}" class="cta-button">Ver Detalles</a>
                </p>
              </div>
              <div class="footer">
                <p>Este correo fue enviado automáticamente por BuscoCredito</p>
                <p>© ${new Date().getFullYear()} BuscoCredito. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
¡Felicidades ${data.recipientName}!

${data.message}

Detalles:
- Monto: $${data.data?.amount?.toLocaleString('es-MX') || 'N/A'} MXN
- Tasa: ${data.data?.interestRate || 'N/A'}%

Ver detalles: ${dashboardUrl}

--
BuscoCredito
        `
      };

    case 'loan_assigned_other':
      return {
        subject: `ℹ️ Actualización sobre tu propuesta`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><style>${commonStyles}</style></head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                <div class="logo">ℹ️</div>
                <h1>Actualización de Propuesta</h1>
              </div>
              <div class="content">
                <h2>Hola ${data.recipientName},</h2>
                <p>${data.message}</p>
                
                <div class="warning-box">
                  <p style="margin: 0; color: #92400e;">
                    El solicitante ha seleccionado otra propuesta para su préstamo.
                    No te desanimes, hay nuevas solicitudes esperándote.
                  </p>
                </div>
                
                <p style="text-align: center;">
                  <a href="${baseUrl}/lender" class="cta-button" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">Ver Nuevas Solicitudes</a>
                </p>
              </div>
              <div class="footer">
                <p>Este correo fue enviado automáticamente por BuscoCredito</p>
                <p>© ${new Date().getFullYear()} BuscoCredito. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Hola ${data.recipientName},

${data.message}

El solicitante ha seleccionado otra propuesta. No te desanimes, hay nuevas solicitudes disponibles.

Ver nuevas solicitudes: ${baseUrl}/lender

--
BuscoCredito
        `
      };

    default:
      return {
        subject: data.title,
        html: `
          <!DOCTYPE html>
          <html>
          <head><style>${commonStyles}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <div class="logo">📢</div>
                <h1>${data.title}</h1>
              </div>
              <div class="content">
                <h2>Hola ${data.recipientName},</h2>
                <p>${data.message}</p>
                <p style="text-align: center;">
                  <a href="${dashboardUrl}" class="cta-button">Ir al Dashboard</a>
                </p>
              </div>
              <div class="footer">
                <p>Este correo fue enviado automáticamente por BuscoCredito</p>
                <p>© ${new Date().getFullYear()} BuscoCredito. Todos los derechos reservados.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Hola ${data.recipientName},

${data.message}

Ir al dashboard: ${dashboardUrl}

--
BuscoCredito
        `
      };
  }
}

// Send email using Resend API
export async function sendEmailNotification(data: EmailNotificationData): Promise<{ success: boolean; error?: string; id?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.warn('⚠️ RESEND_API_KEY not configured. Email notifications disabled.');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const template = generateEmailTemplate(data);
    const fromEmail = process.env.EMAIL_FROM || 'BuscoCredito <noreply@buscocredito.com>';

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [data.recipientEmail],
        subject: template.subject,
        html: template.html,
        text: template.text,
        tags: [
          { name: 'notification_type', value: data.type },
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error sending email:', errorData);
      return { success: false, error: errorData.message || 'Failed to send email' };
    }

    const result = await response.json();
    console.log(`✅ Email sent successfully to ${data.recipientEmail}:`, result.id);
    return { success: true, id: result.id };

  } catch (error: any) {
    console.error('❌ Error sending email notification:', error);
    return { success: false, error: error.message };
  }
}

// Batch send emails (useful for notifying multiple lenders)
export async function sendBatchEmailNotifications(
  notifications: EmailNotificationData[]
): Promise<{ sent: number; failed: number; results: Array<{ email: string; success: boolean; error?: string }> }> {
  const results = await Promise.allSettled(
    notifications.map(notification => sendEmailNotification(notification))
  );

  const processedResults = results.map((result, index) => ({
    email: notifications[index].recipientEmail,
    success: result.status === 'fulfilled' && result.value.success,
    error: result.status === 'rejected' 
      ? result.reason?.message 
      : (result.status === 'fulfilled' && !result.value.success ? result.value.error : undefined)
  }));

  return {
    sent: processedResults.filter(r => r.success).length,
    failed: processedResults.filter(r => !r.success).length,
    results: processedResults
  };
}
