// INSANYCK STEP 4 · Lote 4 — Shipping update email template
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface ShippingUpdateProps {
  customerName?: string;
  orderNumber?: string;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items?: Array<{
    name: string;
    variant?: string;
    quantity: number;
    image?: string;
  }>;
  language?: 'pt' | 'en';
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NODE_ENV === 'production'
  ? 'https://insanyck.com'
  : 'http://localhost:3000';

const text = {
  pt: {
    preview: 'Seu pedido INSANYCK foi enviado',
    title: 'Pedido enviado',
    greeting: 'Seu pedido está a caminho',
    description: 'Seu pedido foi despachado e está a caminho do endereço de entrega.',
    orderNumber: 'Pedido nº',
    trackingNumber: 'Código de rastreamento',
    carrier: 'Transportadora',
    estimatedDelivery: 'Previsão de entrega',
    shippingTo: 'Envio para',
    items: 'Itens enviados',
    trackPackage: 'Rastrear pedido',
    footer: 'Você receberá uma notificação quando seu pedido for entregue.',
    questions: 'Dúvidas? Entre em contato conosco',
  },
  en: {
    preview: 'Your INSANYCK order has shipped',
    title: 'Order shipped',
    greeting: 'Your order is on the way',
    description: 'Your order has been dispatched and is on its way to the delivery address.',
    orderNumber: 'Order #',
    trackingNumber: 'Tracking number',
    carrier: 'Carrier',
    estimatedDelivery: 'Estimated delivery',
    shippingTo: 'Shipping to',
    items: 'Items shipped',
    trackPackage: 'Track package',
    footer: 'You\'ll receive a notification when your order is delivered.',
    questions: 'Questions? Contact us',
  },
};

export default function ShippingUpdate({
  customerName = 'Cliente',
  orderNumber = '#INS-2024-001',
  trackingNumber = 'BR123456789',
  carrier = 'Correios',
  estimatedDelivery = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
  shippingAddress = {
    name: 'Cliente INSANYCK',
    street: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '01234-567',
    country: 'Brasil',
  },
  items = [
    {
      name: 'Oversized Classic Tee',
      variant: 'Preto • M',
      quantity: 1,
      image: '/products/oversized-classic/front.webp',
    },
  ],
  language = 'pt',
}: ShippingUpdateProps) {
  const t = text[language];

  const getTrackingUrl = () => {
    if (carrier.toLowerCase().includes('correios')) {
      return `https://www2.correios.com.br/sistemas/rastreamento/ctrl/ctrlRastreamento.cfm?codigo=${trackingNumber}`;
    }
    return '#';
  };

  return (
    <Html>
      <Head />
      <Preview>{t.preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${baseUrl}/brand/logo.svg`}
              width="120"
              height="40"
              alt="INSANYCK"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            {/* Shipping Icon */}
            <Section style={iconSection}>
              <div style={shippingIcon}>📦</div>
            </Section>

            <Heading style={h1}>{t.title}</Heading>
            <Text style={text1}>
              {customerName}, {t.greeting.toLowerCase()}!
            </Text>
            <Text style={description}>
              {t.description}
            </Text>

            {/* Tracking Info */}
            <Section style={trackingInfo}>
              <Text style={infoRow}>
                <strong>{t.orderNumber}:</strong> {orderNumber}
              </Text>
              <Text style={infoRow}>
                <strong>{t.trackingNumber}:</strong> {trackingNumber}
              </Text>
              <Text style={infoRow}>
                <strong>{t.carrier}:</strong> {carrier}
              </Text>
              <Text style={infoRow}>
                <strong>{t.estimatedDelivery}:</strong> {estimatedDelivery}
              </Text>
            </Section>

            {/* CTA */}
            <Section style={buttonSection}>
              <Link href={getTrackingUrl()} style={button}>
                {t.trackPackage}
              </Link>
            </Section>

            {/* Items */}
            <Hr style={hr} />
            <Section style={itemsSection}>
              <Heading style={h2}>{t.items}</Heading>
              {items.map((item, index) => (
                <Section key={index} style={itemRow}>
                  <Img
                    src={`${baseUrl}${item.image}`}
                    width="60"
                    height="60"
                    alt={item.name}
                    style={itemImage}
                  />
                  <Section style={itemDetails}>
                    <Text style={itemName}>{item.name}</Text>
                    <Text style={itemVariant}>{item.variant}</Text>
                    <Text style={itemQuantity}>Qtd: {item.quantity}</Text>
                  </Section>
                </Section>
              ))}
            </Section>

            {/* Shipping Address */}
            <Hr style={hr} />
            <Section style={shippingSection}>
              <Heading style={h2}>{t.shippingTo}</Heading>
              <Text style={address}>
                {shippingAddress.name}<br />
                {shippingAddress.street}<br />
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
                {shippingAddress.country}
              </Text>
            </Section>

            {/* Footer */}
            <Hr style={hr} />
            <Text style={footer}>
              {t.footer}
            </Text>
            <Text style={footer}>
              {t.questions} <Link href={`${baseUrl}/contato`} style={link}>support@insanyck.com</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#0a0a0a',
  fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 0',
  textAlign: 'center' as const,
};

const logo = {
  filter: 'invert(1)',
};

const content = {
  backgroundColor: '#111111',
  border: '1px solid #333333',
  borderRadius: '16px',
  padding: '32px',
};

const iconSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const shippingIcon = {
  fontSize: '48px',
  lineHeight: '1',
};

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
};

const text1 = {
  color: '#cccccc',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const description = {
  color: '#cccccc',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 32px',
  textAlign: 'center' as const,
};

const trackingInfo = {
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  padding: '24px',
  marginBottom: '32px',
};

const infoRow = {
  color: '#cccccc',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 8px',
};

const buttonSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  color: '#000000',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 32px',
};

const hr = {
  borderColor: '#333333',
  margin: '32px 0',
};

const itemsSection = {
  marginBottom: '32px',
};

const itemRow = {
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
  padding: '16px',
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
};

const itemImage = {
  borderRadius: '8px',
  marginRight: '16px',
};

const itemDetails = {
  flex: '1',
};

const itemName = {
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 4px',
};

const itemVariant = {
  color: '#999999',
  fontSize: '14px',
  margin: '0 0 4px',
};

const itemQuantity = {
  color: '#cccccc',
  fontSize: '14px',
  margin: '0',
};

const shippingSection = {
  marginBottom: '32px',
};

const address = {
  color: '#cccccc',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
};

const footer = {
  color: '#999999',
  fontSize: '14px',
  lineHeight: '20px',
  textAlign: 'center' as const,
  margin: '0 0 16px',
};

const link = {
  color: '#ffffff',
  textDecoration: 'underline',
};