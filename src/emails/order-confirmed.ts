// INSANYCK FASE D — Template de e-mail: Pedido confirmado (PT/EN)

interface OrderConfirmedTemplateParams {
  order: any;
  locale: 'pt' | 'en';
}

export function getOrderConfirmedTemplate({ order, locale }: OrderConfirmedTemplateParams): string {
  const copy = locale === 'pt' ? {
    title: 'Pedido confirmado',
    preheader: `Pedido #${order.id} — Obrigado pela sua compra!`,
    greeting: 'Obrigado pela sua compra!',
    message: 'Seu pedido foi confirmado e está sendo preparado. Você receberá outro e-mail quando ele for enviado.',
    orderTitle: 'Detalhes do pedido',
    orderId: `Número do pedido: #${order.id}`,
    total: `Total: ${order.total || 'R$ 0,00'}`,
    footer: 'INSANYCK — Luxury meets technology'
  } : {
    title: 'Order confirmed',
    preheader: `Order #${order.id} — Thank you for your purchase!`,
    greeting: 'Thank you for your purchase!',
    message: 'Your order has been confirmed and is being prepared. You will receive another email when it ships.',
    orderTitle: 'Order details',
    orderId: `Order number: #${order.id}`,
    total: `Total: ${order.total || '$0.00'}`,
    footer: 'INSANYCK — Luxury meets technology'
  };

  return `
<!DOCTYPE html>
<html lang="${locale}">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${copy.title}</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0a0a;color:#ffffff;">
    <!-- Preheader -->
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

                <!-- Detalhes do pedido -->
                <div style="
                  background:rgba(255,255,255,0.03);
                  border:1px solid rgba(255,255,255,0.08);
                  border-radius:12px;
                  padding:20px;
                  margin:20px 0;
                ">
                  <h2 style="margin:0 0 12px 0;font-size:18px;font-weight:600;color:#ffffff;">
                    ${copy.orderTitle}
                  </h2>
                  
                  <p style="margin:8px 0;font-size:14px;color:rgba(255,255,255,0.8);">
                    ${copy.orderId}
                  </p>
                  
                  <p style="margin:8px 0;font-size:16px;font-weight:600;color:#ffffff;">
                    ${copy.total}
                  </p>
                </div>

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