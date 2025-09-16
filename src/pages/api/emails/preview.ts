// INSANYCK STEP 4 · Lote 4 — Email templates preview API (secured)
import { NextApiRequest, NextApiResponse } from 'next';
import { render } from '@react-email/components';
import OrderConfirmation from '@/emails/OrderConfirmation';
import ShippingUpdate from '@/emails/ShippingUpdate';
import PasswordReset from '@/emails/PasswordReset';

type EmailType = 'order-confirmation' | 'shipping-update' | 'password-reset';

interface PreviewRequest extends NextApiRequest {
  query: {
    type: EmailType;
    token?: string;
    lang?: 'pt' | 'en';
  };
}

export default async function handler(req: PreviewRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Security: Only allow in development or with proper token
  const isProduction = process.env.NODE_ENV === 'production';
  const previewToken = process.env.EMAIL_PREVIEW_TOKEN;
  
  if (isProduction) {
    if (!previewToken) {
      return res.status(404).json({ error: 'Preview not available' });
    }
    
    if (req.query.token !== previewToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const { type, lang = 'pt' } = req.query;

  if (!type) {
    return res.status(400).json({ 
      error: 'Missing type parameter',
      availableTypes: ['order-confirmation', 'shipping-update', 'password-reset']
    });
  }

  try {
    let emailComponent;
    
    switch (type) {
      case 'order-confirmation':
        emailComponent = OrderConfirmation({
          customerName: 'Maria Silva',
          orderNumber: '#INS-2024-001',
          orderDate: new Date().toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US'),
          items: [
            {
              name: 'Oversized Classic Tee',
              variant: 'Preto • M',
              price: 12900,
              quantity: 1,
              image: '/products/oversized-classic/front.webp',
            },
            {
              name: 'Luxury Hoodie',
              variant: 'Cinza • L',
              price: 24900,
              quantity: 1,
              image: '/products/oversized-classic/front.webp',
            },
          ],
          subtotal: 37800,
          shipping: 0,
          total: 37800,
          shippingAddress: {
            name: 'Maria Silva',
            street: 'Rua Augusta, 456, Apt 12',
            city: 'São Paulo',
            state: 'SP',
            postalCode: '01305-000',
            country: 'Brasil',
          },
          language: lang,
        });
        break;

      case 'shipping-update':
        emailComponent = ShippingUpdate({
          customerName: 'João Santos',
          orderNumber: '#INS-2024-002',
          trackingNumber: 'BR987654321',
          carrier: 'Correios - SEDEX',
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US'),
          shippingAddress: {
            name: 'João Santos',
            street: 'Av. Paulista, 1000',
            city: 'São Paulo',
            state: 'SP',
            postalCode: '01310-100',
            country: 'Brasil',
          },
          items: [
            {
              name: 'Oversized Classic Tee',
              variant: 'Branco • G',
              quantity: 2,
              image: '/products/oversized-classic/front.webp',
            },
          ],
          language: lang,
        });
        break;

      case 'password-reset':
        emailComponent = PasswordReset({
          customerName: 'Ana Costa',
          resetUrl: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=sample-reset-token`,
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          expiresIn: lang === 'pt' ? '1 hora' : '1 hour',
          language: lang,
        });
        break;

      default:
        return res.status(400).json({ 
          error: 'Invalid email type',
          availableTypes: ['order-confirmation', 'shipping-update', 'password-reset']
        });
    }

    const html = render(emailComponent);
    
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Email preview error:', error);
    res.status(500).json({ 
      error: 'Failed to render email template',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}