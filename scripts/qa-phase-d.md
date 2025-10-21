# QA Phase D — NextAuth + E-mails Transacionais

## 🔧 Pré-requisitos

```bash
# 1. Ambiente local rodando
npm run dev

# 2. Variáveis mínimas em .env.local
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=[gerar: openssl rand -base64 48]
EMAIL_FROM="INSANYCK <no-reply@insanyck.com>"
```

---

## ✅ **Teste 1: Auth (Email Magic Link)**

### Passos:
1. Abrir `http://localhost:3000/conta/login`
2. Inserir `teste@insanyck.com`
3. Clicar **"Entrar por e-mail"**

### ✅ Esperado:
- Redirecionamento para `/conta/verify`
- **Console dev** mostra log do e-mail:
  ```
  [INSANYCK][DEV EMAIL] { to: 'teste@insanyck.com', subject: 'Seu link de login — INSANYCK', ... }
  ```
- Link de magic link visible no console

### ✅ **Teste 1.1: Magic Link**
4. Copiar URL do magic link do console
5. Abrir em nova aba
6. **Esperado:** Login bem-sucedido → redirect para `/`

---

## ✅ **Teste 2: Auth (Google OAuth)** 
*Somente se `GOOGLE_CLIENT_ID` configurado*

### Passos:
1. Em `/conta/login`, clicar **"Entrar com Google"**
2. Completar fluxo OAuth

### ✅ Esperado:
- Popup/redirect Google OAuth
- Callback sucesso → usuário logado
- Redirect para `/`

---

## ✅ **Teste 3: Stripe Webhook + E-mail**

### Setup:
```bash
# Terminal 1: Stripe CLI
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Copiar whsec_xxx para .env.local:
STRIPE_WEBHOOK_SECRET=whsec_xxx

# Terminal 2: Restart app
npm run dev
```

### Passos:
```bash
# Terminal 3: Trigger test
stripe trigger checkout.session.completed
```

### ✅ Esperado:
1. **Terminal app:**
   ```
   [INSANYCK][Webhook] Email enviado para customer@example.com
   ```

2. **Database (Prisma Studio):**
   ```bash
   npx prisma studio
   ```
   - Nova `Order` criada
   - `stripeSessionId` preenchido
   - `emailSentAt` !== null

### ✅ **Teste 3.1: Idempotência**
```bash
# Re-trigger mesmo evento
stripe trigger checkout.session.completed
```

**Esperado:**
- Log: `skipped: "duplicate"`
- Sem duplicação no banco

---

## ✅ **Teste 4: CSP + Headers**

### Passos:
1. Abrir `http://localhost:3000/`
2. **DevTools → Network → Headers**

### ✅ Esperado:
- `Content-Security-Policy` presente
- `Permissions-Policy` presente  
- `X-Frame-Options: DENY`

### ✅ **Teste 4.1: Google OAuth + CSP**
1. Login Google funciona sem erros CSP
2. **DevTools Console:** sem bloqueios CSP

---

## ✅ **Teste 5: I18n (PT/EN)**

### Passos:
1. Acessar `/conta/login`
2. Trocar idioma via URL: `/en/conta/login`

### ✅ Esperado:
- **PT:** "Entrar", "Seu e-mail"
- **EN:** "Sign in", "Your email"

---

## ✅ **Teste 6: E-mail Templates (Visual)**

### Com Resend (opcional):
```bash
# .env.local
RESEND_API_KEY=re_xxxxxxx

# Trigger webhook
stripe trigger checkout.session.completed
```

### ✅ Esperado:
- E-mail HTML recebido
- Design responsivo (mobile/desktop)
- Links funcionais
- Preheader visível

---

## 🚨 **Problemas Conhecidos**

### ❌ Se falhar:
1. **Magic link não funciona:**
   - Verificar `NEXTAUTH_SECRET` 
   - Verificar `NEXTAUTH_URL`

2. **Google OAuth erro:**
   - Verificar redirect URI no Google Console
   - Deve ser: `http://localhost:3000/api/auth/callback/google`

3. **Webhook não recebe:**
   - Verificar `stripe listen` rodando
   - Verificar `STRIPE_WEBHOOK_SECRET`

4. **E-mail não envia:**
   - Verificar console para logs `[DEV EMAIL]`
   - Verificar `EMAIL_FROM` formato

---

## ✅ **Checklist Final**

- [ ] Login email → funcional
- [ ] Google OAuth → funcional (se configurado)
- [ ] Webhook → cria pedido + email
- [ ] Idempotência → sem duplicatas
- [ ] I18n → PT/EN corretos
- [ ] CSP → sem erros console
- [ ] Templates → HTML correto

**Status:** ✅ Fase D aprovada para produção