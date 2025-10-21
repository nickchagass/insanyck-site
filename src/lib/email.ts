// INSANYCK FASE D — Abstração de e-mails (Resend/SES/Dev)

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

interface SignInEmailParams {
  to: string;
  url: string;
  locale: 'pt' | 'en';
}

interface OrderEmailParams {
  to: string;
  order: any;
  locale: 'pt' | 'en';
  trackingCode?: string;
}

export async function sendSignInEmail({ to, url, locale }: SignInEmailParams) {
  const { getSignInTemplate } = await import('@/emails/sign-in');
  const subject = locale === 'pt' ? 'Seu link de login — INSANYCK' : 'Your sign-in link — INSANYCK';
  const html = getSignInTemplate({ url, locale });
  await sendMail({ to, subject, html });
}

export async function sendOrderConfirmation({ to, order, locale }: OrderEmailParams) {
  const { getOrderConfirmedTemplate } = await import('@/emails/order-confirmed');
  const subject = locale === 'pt' ? 'Pedido confirmado — INSANYCK' : 'Order confirmed — INSANYCK';
  const html = getOrderConfirmedTemplate({ order, locale });
  await sendMail({ to, subject, html });
}

export async function sendOrderShipped({ to, order, trackingCode, locale }: OrderEmailParams) {
  const { getOrderShippedTemplate } = await import('@/emails/order-shipped');
  const subject = locale === 'pt' ? 'Pedido enviado — INSANYCK' : 'Order shipped — INSANYCK';
  const html = getOrderShippedTemplate({ order, trackingCode, locale });
  await sendMail({ to, subject, html });
}

async function sendMail({ to, subject, html }: EmailParams) {
  // Resend (priority)
  if (process.env.RESEND_API_KEY) {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({ 
        from: process.env.EMAIL_FROM || 'INSANYCK <no-reply@insanyck.com>', 
        to, 
        subject, 
        html 
      });
      console.log(`[INSANYCK][Email] Sent via Resend to ${to}`);
      return;
    } catch (error) {
      console.error('[INSANYCK][Email] Resend failed:', error);
    }
  }

  // SES fallback
  if (process.env.SES_REGION && process.env.SES_ACCESS_KEY_ID && process.env.SES_SECRET_ACCESS_KEY) {
    try {
      const { default: nodemailer } = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: `email-smtp.${process.env.SES_REGION}.amazonaws.com`,
        port: 587,
        secure: false,
        auth: {
          user: process.env.SES_ACCESS_KEY_ID,
          pass: process.env.SES_SECRET_ACCESS_KEY,
        },
      });
      await transporter.sendMail({ 
        from: process.env.EMAIL_FROM || 'INSANYCK <no-reply@insanyck.com>', 
        to, 
        subject, 
        html 
      });
      console.log(`[INSANYCK][Email] Sent via SES to ${to}`);
      return;
    } catch (error) {
      console.error('[INSANYCK][Email] SES failed:', error);
    }
  }

  // Dev fallback (log)
  console.log('[INSANYCK][DEV EMAIL]', { 
    to, 
    subject, 
    html: html.slice(0, 200) + '...',
    preview: `http://localhost:3000/dev/email-preview?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}`
  });
}