# INSANYCK — Backlog Fases E/F (Hardening Futuro)

> **Nota:** Não aplicar agora. Itens para roadmap pós-Fase D.

---

## 🔐 **Fase E — Security & Monitoring**

### E1. **Auditoria Stripe Avançada**
- **Tabela `StripeEvent`:** `id`, `type`, `seenAt`, `payloadHash?`
- **Job limpeza:** eventos >30 dias
- **Logs estruturados:** JSON com context

### E2. **Auth Hardening**
- **Provider detection:** botão Google invisível se indisponível
- **Rate limiting:** login attempts por IP
- **Session rotation:** refresh tokens automático

### E3. **CSP v2**
- **Nonce-based:** scripts inline seguros
- **Report-URI:** monitoramento violações CSP
- **Strict-Transport-Security:** HSTS headers

---

## 🎨 **Fase F — UX & DevX**

### F1. **Email Tooling**
- **Rota `/dev/email-preview`:** visualizar templates em dev
- **Hot reload:** templates sem restart
- **Test suite:** snapshots HTML minimized

### F2. **Tracking Inteligente**
- **Dynamic tracking:** correios/fedex por transportadora
- **Status webhook:** atualização automática de status
- **Customer notifications:** SMS opcional

### F3. **Admin Dashboard**
- **Email queue:** retry failed emails
- **Webhook logs:** debug interface
- **User impersonation:** suporte técnico

---

## 🧪 **Fase G — Testing & Automation**

### G1. **Playwright E2E**
```typescript
// tests/auth-login.spec.ts
test('login email flow', async ({ page }) => {
  await page.goto('/conta/login');
  await page.fill('[data-testid=email]', 'test@insanyck.com');
  await page.click('[data-testid=submit]');
  await expect(page.locator('text=verifique seu e-mail')).toBeVisible();
});
```

### G2. **Email Testing**
```typescript
// tests/webhook-email.spec.ts
test('order confirmation email', async ({ page }) => {
  // Mock sendOrderConfirmation
  // Trigger webhook
  // Assert email called with correct data
});
```

### G3. **Visual Regression**
- **Email snapshots:** HTML templates
- **Component library:** Storybook integration
- **Cross-browser:** Safari/Chrome/Firefox

---

## 📊 **Fase H — Analytics & Performance**

### H1. **Email Analytics**
- **Open rates:** tracking pixels
- **Click tracking:** UTM parameters
- **Delivery status:** bounce/spam monitoring

### H2. **Auth Metrics**
- **Login success rate:** por provider
- **Session duration:** user engagement
- **Churn analysis:** inactive users

### H3. **Performance**
- **Email queue:** background jobs
- **Database optimization:** indexes auth queries
- **CDN integration:** static assets

---

## 🚀 **Fase I — Produção**

### I1. **Deployment**
- **Blue/green:** zero downtime
- **Health checks:** `/api/health` endpoint
- **Monitoring:** Sentry integration

### I2. **Backup & Recovery**
- **Database backup:** daily automated
- **Email templates:** version control
- **Config management:** env validation

### I3. **Scaling**
- **Redis sessions:** multi-instance
- **Queue system:** Bull/Agenda.js
- **Load balancing:** nginx configuration

---

## 📋 **Priorização Sugerida**

### **Sprint 1 (Pós-D):**
- E2: Auth rate limiting
- F1: Email dev preview
- G1: Playwright smoke tests

### **Sprint 2:**
- E1: Stripe event logging
- F2: Dynamic tracking
- G2: Email test coverage

### **Sprint 3:**
- E3: CSP v2 + monitoring
- F3: Admin dashboard
- H1: Email analytics

---

## 💡 **Considerações Técnicas**

### **Dependencies:**
- `@bull-board/express` — Queue dashboard
- `@sentry/nextjs` — Error monitoring  
- `nodemailer-mock` — Email testing
- `playwright` — E2E testing

### **Infrastructure:**
- **Redis:** sessions + queues
- **S3/CloudFlare:** static assets
- **DataDog/New Relic:** APM

### **Security:**
- **Vault/AWS Secrets:** credential management
- **WAF:** application firewall
- **Penetration testing:** quarterly audits

---

## ⚡ **Quick Wins (Fase E)**

### **Immediate (< 1 dia):**
1. Rate limiting: `express-rate-limit`
2. Health check: `/api/health` → DB ping
3. Email preview: dev-only route

### **Short-term (< 1 semana):**
1. Stripe event logging → PostgreSQL
2. CSP violation reporting
3. Playwright login test

### **Medium-term (< 1 mês):**
1. Admin email dashboard
2. User session management
3. Email analytics básico

---

**Status:** 📝 Backlog estruturado para roadmap pós-Fase D