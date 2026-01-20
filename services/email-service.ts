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
        subject: `Nueva Propuesta de Préstamo - ${data.data?.amount?.toLocaleString('es-MX') || ''} MXN`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><style>${commonStyles}</style></head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Nueva Propuesta Recibida</h1>
              </div>
              <div class="content">
                <h2>Estimado/a ${data.recipientName},</h2>
                <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
                  Has recibido una nueva propuesta de préstamo. A continuación encontrarás todos los detalles de la oferta:
                </p>
                
                <div class="highlight-box">
                  <h3 style="margin-top: 0; color: #059669; font-size: 18px; margin-bottom: 20px;">Información de la Propuesta</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                        Cantidad que te prestan:
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        $${data.data?.amount?.toLocaleString('es-MX') || 'N/A'} MXN
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                        Comisión por apertura:
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        $${data.data?.comision?.toLocaleString('es-MX') || 'N/A'} MXN
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                        Tasa de interés:
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        ${data.data?.interestRate || 'N/A'}% anual
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                        Plazo:
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        ${data.data?.term || 'N/A'} meses
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px;">
                        Frecuencia de pago:
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        ${data.data?.amortizationFrequency || 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; color: #6b7280; font-size: 14px;">
                        Seguro de vida saldo deudor:
                      </td>
                      <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        $${data.data?.medicalBalance?.toLocaleString('es-MX') || 'N/A'} MXN
                      </td>
                    </tr>
                  </table>
                </div>
                
                <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; margin: 24px 0;">
                  <p style="margin: 0; color: #374151; font-size: 15px; text-align: center;">
                    <strong>Monto del pago:</strong> Pagarás <span style="color: #10b981; font-weight: 700;">${data.data?.amortizationFrequency || 'N/A'}</span> durante <span style="color: #10b981; font-weight: 700;">${data.data?.term || 'N/A'} meses</span>
                  </p>
                </div>
                
                <p style="text-align: center; margin: 32px 0;">
                  <a href="${dashboardUrl}" class="cta-button">Ver Propuesta Completa</a>
                </p>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 24px;">
                  Ingresa a tu panel de control para revisar todos los detalles de esta propuesta y tomar una decisión informada sobre tu préstamo.
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
Estimado/a ${data.recipientName},

Has recibido una nueva propuesta de préstamo.

INFORMACIÓN DE LA PROPUESTA

Cantidad que te prestan: $${data.data?.amount?.toLocaleString('es-MX') || 'N/A'} MXN
Comisión por apertura: $${data.data?.comision?.toLocaleString('es-MX') || 'N/A'} MXN
Tasa de interés: ${data.data?.interestRate || 'N/A'}% anual
Plazo: ${data.data?.term || 'N/A'} meses
Frecuencia de pago: ${data.data?.amortizationFrequency || 'N/A'}
Seguro de vida saldo deudor: $${data.data?.medicalBalance?.toLocaleString('es-MX') || 'N/A'} MXN

Pagarás ${data.data?.amortizationFrequency || 'N/A'} durante ${data.data?.term || 'N/A'} meses

Ingresa a tu panel de control para revisar: ${dashboardUrl}

--
BuscoCredito
© ${new Date().getFullYear()} BuscoCredito. Todos los derechos reservados.
        `
      };

    case 'loan_accepted':
      return {
        subject: `Propuesta Aceptada - ${data.data?.amount?.toLocaleString('es-MX') || ''} MXN`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><style>${commonStyles}</style></head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #10b981 0%, #047857 100%);">
                <h1>Propuesta Aceptada</h1>
              </div>
              <div class="content">
                <h2>Estimado/a ${data.recipientName},</h2>
                <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
                  Nos complace informarle que el solicitante ha seleccionado su oferta de <strong>$${data.data?.amount?.toLocaleString('es-MX') || 'N/A'} MXN</strong> con una tasa de interés del <strong>${data.data?.interestRate || 'N/A'}%</strong>.
                </p>
                
                <div class="success-box">
                  <h3 style="margin-top: 0; color: #047857; font-size: 18px; margin-bottom: 20px;">Detalles de la Propuesta</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; color: #374151; font-size: 14px;">
                        Monto:
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        $${data.data?.amount?.toLocaleString('es-MX') || 'N/A'} MXN
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; color: #374151; font-size: 14px;">
                        Tasa de interés:
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        ${data.data?.interestRate || 'N/A'}%
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; color: #374151; font-size: 14px;">
                        Plazo:
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        ${data.data?.term || 'N/A'} meses
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; color: #374151; font-size: 14px;">
                        Frecuencia de pago:
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        ${data.data?.amortizationFrequency || 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; color: #374151; font-size: 14px;">
                        Monto de amortización:
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        $${data.data?.amount?.toLocaleString('es-MX') || 'N/A'} MXN
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; color: #374151; font-size: 14px;">
                        Comisión por apertura:
                      </td>
                      <td style="padding: 12px 0; border-bottom: 1px solid #d1fae5; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        $${data.data?.comision?.toLocaleString('es-MX') || 'N/A'} MXN
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 12px 0; color: #374151; font-size: 14px;">
                        Seguro vida saldo deudor:
                      </td>
                      <td style="padding: 12px 0; text-align: right; font-weight: 600; color: #1f2937; font-size: 16px;">
                        $${data.data?.medicalBalance?.toLocaleString('es-MX') || 'N/A'} MXN
                      </td>
                    </tr>
                  </table>
                </div>
                
                <p style="text-align: center; margin: 32px 0;">
                  <a href="${dashboardUrl}" class="cta-button">Ver Detalles Completos</a>
                </p>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 24px;">
                  Acceda a su panel de control para gestionar esta propuesta y coordinar los siguientes pasos con el solicitante.
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
Estimado/a ${data.recipientName},

Nos complace informarle que el solicitante ha seleccionado su oferta de $${data.data?.amount?.toLocaleString('es-MX') || 'N/A'} MXN con una tasa de interés del ${data.data?.interestRate || 'N/A'}%.

DETALLES DE LA PROPUESTA

Monto: $${data.data?.amount?.toLocaleString('es-MX') || 'N/A'} MXN
Tasa de interés: ${data.data?.interestRate || 'N/A'}%
Plazo: ${data.data?.term || 'N/A'} meses
Frecuencia de pago: ${data.data?.amortizationFrequency || 'N/A'}
Monto de amortización: $${data.data?.amount?.toLocaleString('es-MX') || 'N/A'} MXN
Comisión por apertura: $${data.data?.comision?.toLocaleString('es-MX') || 'N/A'} MXN
Seguro vida saldo deudor: $${data.data?.medicalBalance?.toLocaleString('es-MX') || 'N/A'} MXN

Acceda a su panel de control: ${dashboardUrl}

--
BuscoCredito
© ${new Date().getFullYear()} BuscoCredito. Todos los derechos reservados.
        `
      };

    case 'loan_assigned_other':
      return {
        subject: `Actualización sobre tu Propuesta`,
        html: `
          <!DOCTYPE html>
          <html>
          <head><style>${commonStyles}</style></head>
          <body>
            <div class="container">
              <div class="header" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
                <h1>Actualización de Propuesta</h1>
              </div>
              <div class="content">
                <h2>Estimado/a ${data.recipientName},</h2>
                <p style="font-size: 16px; color: #374151; margin-bottom: 24px;">
                  Le informamos que el solicitante ha seleccionado otra oferta para su préstamo.
                </p>
                
                <div class="warning-box">
                  <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 500;">
                    El usuario ha seleccionado otra oferta
                  </p>
                </div>

                <h3 style="color: #1f2937; font-size: 18px; margin-top: 32px; margin-bottom: 16px;">La oferta ganadora fue:</h3>
                
                <div style="background-color: #f3f4f6; border-left: 4px solid #6b7280; padding: 20px; margin: 20px 0; border-radius: 4px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #d1d5db; color: #4b5563; font-size: 14px;">
                        Monto:
                      </td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #d1d5db; text-align: right; font-weight: 600; color: #374151; font-size: 15px;">
                        $${data.data?.winningOffer?.amount?.toLocaleString('es-MX') || 'N/A'} MXN
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #d1d5db; color: #4b5563; font-size: 14px;">
                        Tasa de interés:
                      </td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #d1d5db; text-align: right; font-weight: 600; color: #374151; font-size: 15px;">
                        ${data.data?.winningOffer?.interestRate || 'N/A'}%
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #d1d5db; color: #4b5563; font-size: 14px;">
                        Plazo:
                      </td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #d1d5db; text-align: right; font-weight: 600; color: #374151; font-size: 15px;">
                        ${data.data?.winningOffer?.term || 'N/A'} meses
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #d1d5db; color: #4b5563; font-size: 14px;">
                        Frecuencia de pago:
                      </td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #d1d5db; text-align: right; font-weight: 600; color: #374151; font-size: 15px;">
                        ${data.data?.winningOffer?.amortizationFrequency || 'N/A'}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; border-bottom: 1px solid #d1d5db; color: #4b5563; font-size: 14px;">
                        Comisión por apertura:
                      </td>
                      <td style="padding: 10px 0; border-bottom: 1px solid #d1d5db; text-align: right; font-weight: 600; color: #374151; font-size: 15px;">
                        $${data.data?.winningOffer?.comision?.toLocaleString('es-MX') || 'N/A'} MXN
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #4b5563; font-size: 14px;">
                        Seguro vida saldo deudor:
                      </td>
                      <td style="padding: 10px 0; text-align: right; font-weight: 600; color: #374151; font-size: 15px;">
                        $${data.data?.winningOffer?.medicalBalance?.toLocaleString('es-MX') || 'N/A'} MXN
                      </td>
                    </tr>
                  </table>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 24px 0;">
                  Agradecemos su participación en este proceso. Le invitamos a revisar nuevas solicitudes de préstamo disponibles en la plataforma.
                </p>
                
                <p style="text-align: center; margin: 32px 0;">
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
Estimado/a ${data.recipientName},

Le informamos que el solicitante ha seleccionado otra oferta para su préstamo.

EL USUARIO HA SELECCIONADO OTRA OFERTA

LA OFERTA GANADORA FUE:

Monto: $${data.data?.winningOffer?.amount?.toLocaleString('es-MX') || 'N/A'} MXN
Tasa de interés: ${data.data?.winningOffer?.interestRate || 'N/A'}%
Plazo: ${data.data?.winningOffer?.term || 'N/A'} meses
Frecuencia de pago: ${data.data?.winningOffer?.amortizationFrequency || 'N/A'}
Comisión por apertura: $${data.data?.winningOffer?.comision?.toLocaleString('es-MX') || 'N/A'} MXN
Seguro vida saldo deudor: $${data.data?.winningOffer?.medicalBalance?.toLocaleString('es-MX') || 'N/A'} MXN

Agradecemos su participación. Le invitamos a revisar nuevas solicitudes disponibles.

Ver nuevas solicitudes: ${baseUrl}/lender

--
BuscoCredito
© ${new Date().getFullYear()} BuscoCredito. Todos los derechos reservados.
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
                <h1>${data.title}</h1>
              </div>
              <div class="content">
                <h2>Estimado/a ${data.recipientName},</h2>
                <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-bottom: 24px;">
                  ${data.message}
                </p>
                
                <p style="text-align: center; margin: 32px 0;">
                  <a href="${dashboardUrl}" class="cta-button">Acceder al Panel de Control</a>
                </p>
                
                <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 24px;">
                  Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.
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
Estimado/a ${data.recipientName},

${data.message}

Acceder al panel de control: ${dashboardUrl}

Si tiene alguna pregunta o necesita asistencia, no dude en contactarnos.

--
BuscoCredito
© ${new Date().getFullYear()} BuscoCredito. Todos los derechos reservados.
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
