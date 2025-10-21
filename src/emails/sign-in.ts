// INSANYCK FASE D — Template de e-mail: Login por e-mail (PT/EN) — compatível (inline CSS + tables)

interface SignInTemplateParams {
  url: string;
  locale: 'pt' | 'en';
}

export function getSignInTemplate({ url, locale }: SignInTemplateParams): string {
  const copy = locale === 'pt' ? {
    title: 'Entrar na INSANYCK',
    preheader: 'Seu link seguro de acesso',
    greeting: 'Olá!',
    message: 'Clique no botão abaixo para entrar na sua conta INSANYCK com segurança.',
    button: 'Entrar com link seguro',
    plain: 'Se o botão não funcionar, copie e cole este link no seu navegador:',
    warning: 'Se você não solicitou este e-mail, pode ignorá-lo com segurança.',
    footer: 'INSANYCK — Luxury meets technology'
  } : {
    title: 'Sign in to INSANYCK',
    preheader: 'Your secure sign-in link',
    greeting: 'Hello!',
    message: 'Click the button below to securely sign in to your INSANYCK account.',
    button: 'Sign in with secure link',
    plain: 'If the button does not work, copy and paste this link into your browser:',
    warning: 'If you did not request this email, you can safely ignore it.',
    footer: 'INSANYCK — Luxury meets technology'
  };

  // Observação: usamos tabelas e estilos inline para compatibilidade máxima (Gmail/Outlook).
  // Também incluímos preheader invisível e link de fallback em texto.
  return `
<!DOCTYPE html>
<html lang="${locale}">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${copy.title}</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0a0a;color:#ffffff;">
    <!-- Preheader (invisível) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${copy.preheader}
    </div>

    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="background:#0a0a0a;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" style="max-width:600px;background:transparent;" cellPadding="0" cellSpacing="0">
            <tr>
              <td style="
                background:rgba(255,255,255,0.05);
                border:1px solid rgba(255,255,255,0.12);
                border-radius:16px;
                padding:32px;
              ">
                <h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;font-weight:700;color:#ffffff;text-align:center;">
                  ${copy.title}
                </h1>
                <p style="margin:12px 0 8px 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.95);">
                  ${copy.greeting}
                </p>
                <p style="margin:8px 0 20px 0;font-size:16px;line-height:1.6;color:rgba(255,255,255,0.9);">
                  ${copy.message}
                </p>

                <!-- Botão -->
                <table role="presentation" align="center" cellPadding="0" cellSpacing="0" style="margin:0 auto 16px auto;">
                  <tr>
                    <td align="center" bgcolor="#ffffff" style="border-radius:12px;">
                      <a href="${url}" style="
                        display:inline-block;
                        padding:14px 28px;
                        font-size:16px;
                        font-weight:700;
                        text-decoration:none;
                        color:#0a0a0a;
                        background:#ffffff;
                        border-radius:12px;
                      " target="_blank">
                        ${copy.button}
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Link em texto (fallback) -->
                <p style="margin:14px 0 6px 0;font-size:14px;line-height:1.6;color:rgba(255,255,255,0.75);">
                  ${copy.plain}
                </p>
                <p style="
                  margin:0 0 18px 0;
                  word-break:break-all;
                  font-size:13px;
                  line-height:1.6;
                  color:rgba(255,255,255,0.8);
                ">
                  <a href="${url}" style="color:#ffffff;text-decoration:underline;" target="_blank">${url}</a>
                </p>

                <p style="margin:18px 0 0 0;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.7);">
                  ${copy.warning}
                </p>

                <div style="
                  margin-top:24px;
                  padding-top:16px;
                  border-top:1px solid rgba(255,255,255,0.12);
                  text-align:center;
                  font-size:13px;
                  color:rgba(255,255,255,0.65);
                ">
                  ${copy.footer}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}