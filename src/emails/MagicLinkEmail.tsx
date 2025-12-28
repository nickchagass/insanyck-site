// src/emails/MagicLinkEmail.tsx
// INSANYCK AUTH-03-RESEND-LUXURY — Magic Link Email Template
// Padrão: Jonathan Ive meets Rick Owens — Every Pixel Deliberate

export type Locale = 'pt' | 'en';

export interface MagicLinkEmailProps {
  url: string;
  locale: Locale;
}

// Conteúdo por idioma
const content = {
  pt: {
    subject: 'Acesso INSANYCK',
    preheader: 'Sua presença foi solicitada no universo INSANYCK.',
    heading: 'Sua presença foi solicitada.',
    subheading: 'Clique abaixo para ingressar no universo INSANYCK.',
    cta: 'ENTRAR',
    expiry: 'Este acesso expira em 10 minutos.',
    disclaimer: 'Se você não solicitou este acesso, ignore este email.',
    footer: 'INSANYCK — Luxury Fashion',
  },
  en: {
    subject: 'INSANYCK Access',
    preheader: 'Your presence was requested in the INSANYCK universe.',
    heading: 'Your presence was requested.',
    subheading: 'Click below to enter the INSANYCK universe.',
    cta: 'ENTER',
    expiry: 'This access expires in 10 minutes.',
    disclaimer: 'If you didn\'t request this, you can safely ignore this email.',
    footer: 'INSANYCK — Luxury Fashion',
  },
} as const;

export function renderMagicLinkEmail({ url, locale }: MagicLinkEmailProps): {
  subject: string;
  html: string;
  text: string;
} {
  const t = content[locale] || content.pt;

  const html = `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="dark">
  <meta name="supported-color-schemes" content="dark">
  <title>${t.subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    /* Dark mode support */
    :root { color-scheme: dark; supported-color-schemes: dark; }
    body, .body { background-color: #000000 !important; }

    /* Reset */
    body { margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }

    /* Link reset */
    a { color: #ffffff; text-decoration: none; }

    /* Responsive */
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 24px !important; }
      .button { padding: 14px 32px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

  <!-- Preheader (hidden text for preview) -->
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${t.preheader}
    &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;
  </div>

  <!-- Wrapper Table -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color: #000000;">
    <tr>
      <td align="center" style="padding: 48px 16px;">

        <!-- Container -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="520" class="container" style="max-width: 520px; width: 100%;">

          <!-- Atmospheric Gradient (Cold Spotlight) -->
          <tr>
            <td style="height: 80px; background: linear-gradient(180deg, rgba(30, 35, 50, 0.15) 0%, transparent 100%);"></td>
          </tr>

          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 0 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 24px; font-weight: 400; letter-spacing: 0.3em; color: rgba(255, 255, 255, 0.92); text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    INSANYCK
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr>
            <td style="height: 48px;"></td>
          </tr>

          <!-- Message -->
          <tr>
            <td align="center" style="padding: 0 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="font-size: 18px; line-height: 1.7; color: rgba(255, 255, 255, 0.85); text-align: center; letter-spacing: 0.02em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    ${t.heading}
                  </td>
                </tr>
                <tr>
                  <td style="height: 12px;"></td>
                </tr>
                <tr>
                  <td style="font-size: 15px; line-height: 1.6; color: rgba(255, 255, 255, 0.55); text-align: center; letter-spacing: 0.01em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    ${t.subheading}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr>
            <td style="height: 40px;"></td>
          </tr>

          <!-- CTA Button (Portal Dimensional) -->
          <tr>
            <td align="center" style="padding: 0 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius: 9999px; border: 1px solid rgba(255, 255, 255, 0.2);">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${url}" style="height: 52px; v-text-anchor: middle; width: 180px;" arcsize="50%" strokecolor="#333333" fillcolor="#0a0a0a">
                      <w:anchorlock/>
                      <center style="color: #ffffff; font-family: sans-serif; font-size: 14px; font-weight: 500; letter-spacing: 0.15em;">
                        ${t.cta}
                      </center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a href="${url}" target="_blank" class="button" style="display: inline-block; padding: 16px 48px; font-size: 14px; font-weight: 500; letter-spacing: 0.15em; color: rgba(255, 255, 255, 0.95); text-decoration: none; text-transform: uppercase; background: linear-gradient(180deg, rgba(255, 255, 255, 0.06) 0%, rgba(255, 255, 255, 0.02) 100%); border-radius: 9999px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);">
                      ${t.cta}
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr>
            <td style="height: 32px;"></td>
          </tr>

          <!-- Expiry Notice -->
          <tr>
            <td align="center" style="padding: 0 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 12px; color: rgba(255, 255, 255, 0.4); text-align: center; letter-spacing: 0.02em; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    ${t.expiry}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr>
            <td style="height: 56px;"></td>
          </tr>

          <!-- Divider -->
          <tr>
            <td align="center" style="padding: 0 80px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="height: 1px; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr>
            <td style="height: 32px;"></td>
          </tr>

          <!-- Disclaimer -->
          <tr>
            <td align="center" style="padding: 0 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 11px; color: rgba(255, 255, 255, 0.25); text-align: center; line-height: 1.6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    ${t.disclaimer}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer -->
          <tr>
            <td style="height: 40px;"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 0 48px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size: 10px; color: rgba(255, 255, 255, 0.15); text-align: center; letter-spacing: 0.2em; text-transform: uppercase; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
                    ${t.footer}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Bottom Padding -->
          <tr>
            <td style="height: 48px;"></td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`.trim();

  // Plain text version (equally deliberate)
  const text = `
${t.heading}

${t.subheading}

${t.cta}: ${url}

${t.expiry}

---

${t.disclaimer}

${t.footer}
`.trim();

  return {
    subject: t.subject,
    html,
    text,
  };
}

// Legacy export for compatibility
export function getSignInTemplate({ url, locale }: { url: string; locale: Locale }): string {
  return renderMagicLinkEmail({ url, locale }).html;
}
