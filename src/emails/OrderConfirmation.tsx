// INSANYCK STEP 4 · Lote 4 — Order confirmation email template
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

interface OrderConfirmationProps {
  customerName?: string;
  orderNumber?: string;
  orderDate?: string;
  items?: Array<{
    name: string;
    variant?: string;
    price: number;
    quantity: number;
    image?: string;
  }>;
  subtotal?: number;
  shipping?: number;
  total?: number;
  shippingAddress?: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  language?: 'pt' | 'en';
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NODE_ENV === 'production'
  ? 'https://insanyck.com'
  : 'http://localhost:3000';

const text = {
  pt: {
    preview: 'Seu pedido INSANYCK foi confirmado',
    title: 'Pedido confirmado',
    greeting: 'Obrigado por sua compra',
    orderInfo: 'Informações do pedido',
    orderNumber: 'Pedido nº',
    orderDate: 'Data',
    items: 'Itens',
    subtotal: 'Subtotal',
    shipping: 'Envio',
    total: 'Total',
    shippingTo: 'Envio para',
    footer: 'Você receberá uma atualização quando seu pedido for enviado.',
    questions: 'Dúvidas? Entre em contato conosco',
    viewOrder: 'Ver pedido',
  },
  en: {
    preview: 'Your INSANYCK order has been confirmed',
    title: 'Order confirmed',
    greeting: 'Thank you for your purchase',
    orderInfo: 'Order information',
    orderNumber: 'Order #',
    orderDate: 'Date',
    items: 'Items',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    shippingTo: 'Shipping to',
    footer: 'You\'ll receive an update when your order ships.',
    questions: 'Questions? Contact us',
    viewOrder: 'View order',
  },
};

export default function OrderConfirmation({
  customerName = 'Cliente',
  orderNumber = '#INS-2024-001',
  orderDate = new Date().toLocaleDateString('pt-BR'),
  items = [
    {
      name: 'Oversized Classic Tee',
      variant: 'Preto • M',
      price: 12900,
      quantity: 1,
      image: '/products/oversized-classic/front.webp',
    },
  ],
  subtotal = 12900,
  shipping = 0,
  total = 12900,
  shippingAddress = {
    name: 'Cliente INSANYCK',
    street: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    postalCode: '01234-567',
    country: 'Brasil',
  },
  language = 'pt',
}: OrderConfirmationProps) {
  const t = text[language];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat(language === 'pt' ? 'pt-BR' : 'en-US', {
      style: 'currency',
      currency: language === 'pt' ? 'BRL' : 'USD',
    }).format(price / 100);
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
            <Heading style={h1}>{t.title}</Heading>
            <Text style={text1}>
              {customerName}, {t.greeting.toLowerCase()}!
            </Text>

            {/* Order Info */}
            <Section style={orderInfo}>
              <Heading style={h2}>{t.orderInfo}</Heading>
              <Text style={orderDetails}>
                <strong>{t.orderNumber}:</strong> {orderNumber}<br />
                <strong>{t.orderDate}:</strong> {orderDate}
              </Text>
            </Section>

            {/* Items */}
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
                    <Text style={itemPrice}>
                      {formatPrice(item.price)} × {item.quantity}
                    </Text>
                  </Section>
                </Section>
              ))}
            </Section>

            {/* Totals */}
            <Hr style={hr} />
            <Section style={totals}>
              <Text style={totalRow}>
                <span>{t.subtotal}:</span>
                <span>{formatPrice(subtotal)}</span>
              </Text>
              <Text style={totalRow}>
                <span>{t.shipping}:</span>
                <span>{shipping === 0 ? 'Grátis' : formatPrice(shipping)}</span>
              </Text>
              <Text style={totalRowFinal}>
                <span>{t.total}:</span>
                <span>{formatPrice(total)}</span>
              </Text>
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

            {/* CTA */}
            <Section style={buttonSection}>
              <Link href={`${baseUrl}/account/orders?order=${orderNumber}`} style={button}>
                {t.viewOrder}
              </Link>
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

const h1 = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 24px',
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
  margin: '0 0 32px',
};

const orderInfo = {
  marginBottom: '32px',
};

const orderDetails = {
  color: '#cccccc',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
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

const itemPrice = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const hr = {
  borderColor: '#333333',
  margin: '32px 0',
};

const totals = {
  marginBottom: '32px',
};

const totalRow = {
  color: '#cccccc',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 8px',
  display: 'flex',
  justifyContent: 'space-between',
};

const totalRowFinal = {
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '8px 0 0',
  display: 'flex',
  justifyContent: 'space-between',
  borderTop: '1px solid #333333',
  paddingTop: '16px',
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
  padding: '12px 24px',
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