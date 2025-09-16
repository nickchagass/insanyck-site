// INSANYCK STEP 4 · Lote 4 — Password reset email template
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

interface PasswordResetProps {
  customerName?: string;
  resetUrl?: string;
  ipAddress?: string;
  userAgent?: string;
  expiresIn?: string;
  language?: 'pt' | 'en';
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : process.env.NODE_ENV === 'production'
  ? 'https://insanyck.com'
  : 'http://localhost:3000';

const text = {
  pt: {
    preview: 'Redefinir sua senha INSANYCK',
    title: 'Redefinir senha',
    greeting: 'Solicitação de redefinição de senha',
    description: 'Recebemos uma solicitação para redefinir a senha da sua conta INSANYCK.',
    instructions: 'Para redefinir sua senha, clique no botão abaixo:',
    resetButton: 'Redefinir senha',
    expiresIn: 'Este link expira em',
    securityInfo: 'Informações de segurança',
    ipAddress: 'Endereço IP',
    userAgent: 'Navegador',
    notYou: 'Não foi você?',
    notYouDescription: 'Se você não solicitou esta alteração, ignore este e-mail. Sua senha permanecerá inalterada.',
    footer: 'Por motivos de segurança, este link expirará automaticamente.',
    questions: 'Dúvidas sobre segurança? Entre em contato conosco',
  },
  en: {
    preview: 'Reset your INSANYCK password',
    title: 'Reset password',
    greeting: 'Password reset request',
    description: 'We received a request to reset the password for your INSANYCK account.',
    instructions: 'To reset your password, click the button below:',
    resetButton: 'Reset password',
    expiresIn: 'This link expires in',
    securityInfo: 'Security information',
    ipAddress: 'IP address',
    userAgent: 'Browser',
    notYou: 'Wasn\'t you?',
    notYouDescription: 'If you didn\'t request this change, ignore this email. Your password will remain unchanged.',
    footer: 'For security reasons, this link will expire automatically.',
    questions: 'Security questions? Contact us',
  },
};

export default function PasswordReset({
  customerName = 'Cliente',
  resetUrl = `${baseUrl}/auth/reset-password?token=example-token`,
  ipAddress = '192.168.1.1',
  userAgent = 'Chrome 91.0.4472.124',
  expiresIn = '1 hora',
  language = 'pt',
}: PasswordResetProps) {
  const t = text[language];

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
            {/* Security Icon */}
            <Section style={iconSection}>
              <div style={securityIcon}>🔐</div>
            </Section>

            <Heading style={h1}>{t.title}</Heading>
            <Text style={text1}>
              {customerName}, {t.greeting.toLowerCase()}.
            </Text>
            <Text style={description}>
              {t.description}
            </Text>
            <Text style={instructions}>
              {t.instructions}
            </Text>

            {/* CTA */}
            <Section style={buttonSection}>
              <Link href={resetUrl} style={button}>
                {t.resetButton}
              </Link>
            </Section>

            {/* Expiration Notice */}
            <Section style={expirationNotice}>
              <Text style={expirationText}>
                <strong>{t.expiresIn}:</strong> {expiresIn}
              </Text>
            </Section>

            {/* Security Info */}
            <Hr style={hr} />
            <Section style={securitySection}>
              <Heading style={h2}>{t.securityInfo}</Heading>
              <Text style={securityDetails}>
                <strong>{t.ipAddress}:</strong> {ipAddress}<br />
                <strong>{t.userAgent}:</strong> {userAgent}
              </Text>
            </Section>

            {/* Not You Section */}
            <Hr style={hr} />
            <Section style={notYouSection}>
              <Heading style={h2}>{t.notYou}</Heading>
              <Text style={notYouText}>
                {t.notYouDescription}
              </Text>
            </Section>

            {/* Footer */}
            <Hr style={hr} />
            <Text style={footer}>
              {t.footer}
            </Text>
            <Text style={footer}>
              {t.questions} <Link href={`${baseUrl}/contato`} style={link}>security@insanyck.com</Link>
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

const securityIcon = {
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
};

const description = {
  color: '#cccccc',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 24px',
};

const instructions = {
  color: '#cccccc',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 32px',
};

const buttonSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
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

const expirationNotice = {
  backgroundColor: '#1a1a1a',
  borderRadius: '12px',
  padding: '16px',
  marginBottom: '32px',
  textAlign: 'center' as const,
};

const expirationText = {
  color: '#ffffff',
  fontSize: '14px',
  margin: '0',
};

const hr = {
  borderColor: '#333333',
  margin: '32px 0',
};

const securitySection = {
  marginBottom: '32px',
};

const securityDetails = {
  color: '#cccccc',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
  backgroundColor: '#1a1a1a',
  padding: '16px',
  borderRadius: '12px',
};

const notYouSection = {
  marginBottom: '32px',
};

const notYouText = {
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