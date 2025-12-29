# PRE-FLIGHT AUDIT REPORT — F-MP
## INSANYCK Museum Edition × Claude Sonnet 4.5

**Data:** 2025-12-28
**Executor:** Claude Code
**Status:** ✅ PASS (com gaps identificados)

---

## 1. MAPA DE ARQUIVOS

### Checkout Pages
| Arquivo | Existe | Ação | Observação |
|---------|--------|------|------------|
| src/pages/checkout/index.tsx | ❌ NÃO | **CRIAR** | Hoje o checkout é redirect direto (sem página intermediária) |
| src/pages/checkout/success.tsx | ✅ SIM | **MODIFICAR** | Adaptar para MP (hoje busca apenas stripeSessionId) |
| src/pages/checkout/cancel.tsx | ✅ SIM | **MANTER** | Já funcional, sem modificações necessárias |
| src/pages/checkout/pending.tsx | ❌ NÃO | **CRIAR** | Para fluxo de espera do PIX |

### Checkout APIs
| Arquivo | Existe | Ação | Observação |
|---------|--------|------|------------|
| src/pages/api/checkout/create-session.ts | ✅ SIM | **MODIFICAR** | Hoje chama Stripe direto (linha 212). Tornar híbrido: receber `locale` → escolher provider |
| src/pages/api/checkout/order-status.ts | ✅ SIM | **MODIFICAR** | Hoje busca apenas por `stripeSessionId` (linha 30). Adicionar fallback para `mpPaymentId` |

### MercadoPago APIs
| Arquivo | Existe | Ação | Observação |
|---------|--------|------|------------|
| src/pages/api/mp/create-preference.ts | ✅ SIM | **MODIFICAR** | Existe mas é genérico (init_point redirect). **NÃO tem suporte PIX QR específico** |
| src/pages/api/mp/webhook.ts | ✅ SIM | **MANTER** | Já funcional (linhas 183-214: atualiza Order com mpPaymentId) |
| src/pages/api/mp/payment-status.ts | ❌ NÃO | **CRIAR** | Necessário para polling de status do PIX |

### Stripe APIs (BUNKER 🔒)
| Arquivo | Status |
|---------|--------|
| src/pages/api/stripe/checkout.ts | 🔒 **BUNKER — NÃO TOCAR** |
| src/pages/api/stripe/webhook.ts | 🔒 **BUNKER — NÃO TOCAR** |
| src/lib/stripe.ts | 🔒 **BUNKER — NÃO TOCAR** |

---

## 2. FLUXO ATUAL (AS-IS)

```
┌─────────────────┐
│ CartDrawer.tsx  │ (linha 202: menciona "Pix" mas não usa)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ useCheckout()   │ Hook (linha 23: POST /api/checkout/create-session)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ /api/checkout/create-session.ts                         │
│                                                          │
│ ❌ NÃO tem lógica de locale/provider                    │
│ ✅ Recebe email do getServerSession (linha 102)         │
│ ✅ Resolve items do banco (linhas 116-149)              │
│ ❌ Chama Stripe DIRETAMENTE (linha 212)                 │
│ ❌ NÃO cria Order no banco (só sessão Stripe)           │
│                                                          │
│ Retorna: { url: stripeSession.url }                     │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ window redirect │ → Stripe Checkout (hosted)
└─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ /checkout/success.tsx                                   │
│                                                          │
│ getServerSideProps:                                     │
│   - Recebe query.session_id (linha 231)                │
│   - Busca Order por stripeSessionId (linha 247)        │
│   - Se não encontrar: isProcessing = true              │
│                                                          │
│ Cliente:                                                 │
│   - Polling a cada 5s (linha 49)                        │
│   - Chama /api/checkout/order-status                    │
│   - Namespace i18n: "success", "common", "nav"          │
└─────────────────────────────────────────────────────────┘
```

### Descobertas sobre create-session:
- [x] Chama Stripe diretamente? **SIM** (linha 212: `stripe.checkout.sessions.create`)
- [x] Cria Order no banco? **NÃO** (apenas cria sessão Stripe, Order é criado pelo webhook)
- [x] Recebe email do usuário? **SIM** (linha 102: `getServerSession`, linha 218: `customer_email`)
- [x] Tem lógica de locale/provider? **NÃO** (Stripe-only, sem roteamento)

---

## 3. CAPACIDADES MP EXISTENTES

### lib/mp.ts
- [x] `createPreference()` — cria preferência genérica (linha 44)
- [x] `getPaymentById()` — busca pagamento por ID (linha 62)
- [ ] `createPixPayment()` — ❌ **NÃO EXISTE**
- [ ] `getPaymentStatus()` — ❌ **NÃO EXISTE**

### create-preference.ts
- [ ] Suporta PIX específico? **NÃO** (sem grep match para "pix|qr_code")
- [ ] Retorna qr_code? **NÃO**
- [ ] Retorna qr_code_base64? **NÃO**
- [x] O que faz hoje? Cria preferência genérica e retorna `init_point` (linha 69-73)

**CONCLUSÃO**: Precisamos adicionar endpoint específico para PIX QR ou estender create-preference.

---

## 4. DEPENDÊNCIAS

### NPM Packages
| Package | Instalado | Versão | Observação |
|---------|-----------|--------|------------|
| mercadopago | ❌ NÃO | - | **NECESSÁRIO** (backend SDK para PIX API) |
| @mercadopago/sdk-react | ❌ NÃO | - | **OPCIONAL** (se usar Bricks, mas podemos fazer QR manual) |
| framer-motion | ✅ SIM | ^12.23.12 | Já disponível |
| zustand | ✅ SIM | ^5.0.7 | Já disponível |
| swr | ✅ SIM | ^2.3.4 | Para polling (alternativa a useEffect) |
| react-window | ✅ SIM | ^1.8.11 | Já usado no CartDrawer |

### Node.js
- **Versão instalada:** v24.11.1 ✅
- **NPM:** 11.6.2 ✅

### Instalação Necessária
```bash
npm install mercadopago@^2.0.15
```

**Justificativa**: Backend SDK oficial do MP é obrigatório para acessar a API de PIX QR (`POST /v1/payments`) e obter `qr_code_base64`.

---

## 5. AUTENTICAÇÃO / EMAIL

### Como funciona hoje:
- [x] Checkpoint 1: `create-session.ts` usa `getServerSession` (linha 102)
- [x] Checkpoint 2: Email é enviado para Stripe como `customer_email` (linha 218)
- [ ] Checkout exige login? **NÃO** (linha 218: `|| undefined` = guest checkout OK)

### Para MP payer:
**Problema**: MP `payer.email` é obrigatório para criar preferência.

**Soluções possíveis**:

| Opção | Prós | Contras | Recomendação |
|-------|------|---------|--------------|
| A. Usuário logado (getServerSession) | Sem friction, UX premium | Só funciona se logado | ✅ **USAR COMO PRIMÁRIO** |
| B. Input no checkout Museum | Funciona para guests | Adiciona campo ao formulário | ✅ **FALLBACK** |
| C. Email hardcoded "guest@insanyck.com" | Zero friction | Pode violar ToS do MP | ❌ **NÃO USAR** |

**DECISÃO RECOMENDADA**:
```typescript
// Em create-session híbrido:
const session = await getServerSession(req, res, authOptions);
const email = session?.user?.email || req.body.email; // fallback do form

if (!email && provider === 'mercadopago') {
  return res.status(400).json({ error: 'Email required for MercadoPago' });
}
```

---

## 6. i18n

### Chaves Existentes (checkout.json PT)
- [x] `checkout.title` ✅
- [x] `checkout.sections.payment` ✅
- [ ] `checkout.tabs.pix` ❌ **NÃO EXISTE**
- [ ] `checkout.tabs.card` ❌ **NÃO EXISTE**
- [ ] `checkout.pix.qrTitle` ❌ **NÃO EXISTE**

### Chaves a Adicionar

#### public/locales/pt/checkout.json
```json
{
  "tabs": {
    "pix": "PIX",
    "card": "Cartão",
    "international": "Internacional (Stripe)"
  },
  "pix": {
    "qrTitle": "Pague com PIX",
    "qrSubtitle": "Escaneie o QR Code ou copie o código",
    "qrExpires": "Expira em",
    "copyCode": "Copiar código PIX",
    "copied": "Copiado!",
    "waiting": "Aguardando pagamento...",
    "instructions": "Abra o app do seu banco, escolha Pix QR Code e aponte a câmera"
  },
  "card": {
    "title": "Pagamento com cartão",
    "processing": "Processando..."
  },
  "provider": {
    "stripe": "Pagamento internacional",
    "mercadopago": "Pagamento nacional"
  }
}
```

#### public/locales/en/checkout.json
```json
{
  "tabs": {
    "pix": "PIX (Brazil)",
    "card": "Card",
    "international": "International (Stripe)"
  },
  "pix": {
    "qrTitle": "Pay with PIX",
    "qrSubtitle": "Scan the QR Code or copy the code",
    "qrExpires": "Expires in",
    "copyCode": "Copy PIX code",
    "copied": "Copied!",
    "waiting": "Waiting for payment...",
    "instructions": "Open your bank app, choose Pix QR Code and point the camera"
  },
  "card": {
    "title": "Card payment",
    "processing": "Processing..."
  },
  "provider": {
    "stripe": "International payment",
    "mercadopago": "National payment"
  }
}
```

---

## 7. COMPONENTES MUSEUM EDITION

### Componentes Existentes
| Componente | Caminho | Status | Observação |
|------------|---------|--------|------------|
| GlassCard | src/components/ui/GlassCard.tsx | ✅ EXISTE | Usa `.glass-card-museum`, specular opcional |
| CheckoutSteps | src/components/checkout/CheckoutSteps.tsx | ✅ EXISTE | 3 etapas (Dados, Entrega, Pagamento) |

### CSS Tokens (globals.css)
| Token/Classe | Linha | Status |
|--------------|-------|--------|
| `.glass-card-museum` | 3501 | ✅ EXISTE |
| `.ins-panel` | 1588 | ✅ EXISTE |
| `.btn-jewel` | 3076 | ✅ EXISTE |
| `.btn-jewel-primary` | 3257 | ✅ EXISTE |
| `.btn-jewel-secondary` | 3343 | ✅ EXISTE |
| `.museum-atmosphere` | 3481 | ✅ EXISTE |

**CONCLUSÃO**: Design system completo e pronto para uso. Nenhum CSS adicional necessário.

---

## 8. SCOPE LOCK FINAL

### ✅ CRIAR (arquivos novos)

```
src/pages/checkout/index.tsx
  └─ Página principal do checkout com tabs (PIX/Card/Internacional)
  └─ Usa GlassCard, CheckoutSteps
  └─ Renderização condicional por locale (PT → MP tabs, EN → Stripe direct)

src/pages/checkout/pending.tsx
  └─ Página de espera para PIX (QR + polling)

src/pages/api/mp/payment-status.ts
  └─ GET /api/mp/payment-status?paymentId={id}
  └─ Chama lib/mp.getPaymentById()
  └─ Retorna { status, transaction_amount }

src/components/checkout/PixPayment.tsx
  └─ Componente de QR Code PIX (Museum Edition)
  └─ Props: { qrCode, qrCodeBase64, expiresAt, amount }
  └─ Copy-to-clipboard com feedback

src/components/checkout/PaymentTabs.tsx
  └─ Tabs Museum Edition (PIX/Card)
  └─ Usa tokens DS, glassmorphism

src/hooks/usePaymentStatus.ts
  └─ Hook de polling para status do PIX
  └─ SWR com revalidateOnInterval
```

### ✏️ MODIFICAR (arquivos existentes)

```
src/pages/api/checkout/create-session.ts
  └─ Tornar HÍBRIDO:
      - Se locale === "pt" → usar MP (criar Order, chamar create-preference)
      - Se locale === "en" → usar Stripe (comportamento atual)
  └─ CRÍTICO: criar Order ANTES de chamar provider (para external_reference)

src/pages/api/mp/create-preference.ts
  └─ OPCIONAL: Adicionar suporte PIX específico (se decidirmos usar Bricks)
  └─ OU: criar endpoint separado /api/mp/create-pix-payment

src/lib/mp.ts
  └─ Adicionar função createPixPayment():
      - POST /v1/payments (não /checkout/preferences)
      - Retorna qr_code, qr_code_base64, in_store_order_id
      - Documentação: https://www.mercadopago.com.br/developers/pt/docs/checkout-api/integration-configuration/integrate-with-pix

src/pages/checkout/success.tsx
  └─ Adaptar getServerSideProps:
      - Tentar buscar por stripeSessionId (atual)
      - Se não encontrar, tentar por mpPaymentId (query.payment_id)
  └─ Polling já existe (linha 44-67), apenas garantir que funciona para MP

src/hooks/useCheckout.ts
  └─ VERIFICAR: se precisamos passar locale para create-session
  └─ Linha 28: adicionar locale: i18n.language ao body

src/components/CartDrawer.tsx
  └─ VERIFICAR: linha 202 já menciona "Pix"
  └─ Possivelmente nenhuma mudança necessária

public/locales/pt/checkout.json
public/locales/en/checkout.json
  └─ Adicionar chaves conforme seção 6
```

### 🔒 BUNKER (não tocar)

```
src/lib/stripe.ts
src/pages/api/stripe/checkout.ts
src/pages/api/stripe/webhook.ts
tailwind.config.*
next.config.*
tsconfig.*
prisma/schema.prisma (sem mudanças de schema confirmadas)
```

---

## 9. PATCH PLAN (ordem de execução)

### Fase 1: Backend Foundation (sem quebrar nada)
1. ✅ **Instalação de dependências**
   ```bash
   npm install mercadopago@^2.0.15
   ```

2. 📝 **Adicionar chaves i18n** (PT + EN)
   - `public/locales/pt/checkout.json`
   - `public/locales/en/checkout.json`

3. 🆕 **Criar /api/mp/payment-status.ts**
   - GET endpoint para polling
   - Wrapper de `getPaymentById()`

4. ✏️ **Modificar lib/mp.ts**
   - Adicionar `createPixPayment()` com tipagem completa
   - Interface `MPPixPaymentResponse { qr_code, qr_code_base64, ... }`

5. ✏️ **Modificar /api/checkout/create-session.ts** (CRÍTICO)
   - Adicionar lógica híbrida (locale → provider)
   - Criar Order ANTES de chamar provider
   - Se PT + MP: chamar createPixPayment(), gravar mpPaymentId
   - Se EN + Stripe: comportamento atual (mas também criar Order)

### Fase 2: Frontend (com fallback)
6. 🆕 **Criar componente PixPayment.tsx**
   - QR Code renderizado (base64 img)
   - Copy-to-clipboard
   - Timer de expiração
   - Museum Edition glass card

7. 🆕 **Criar componente PaymentTabs.tsx**
   - Tabs glassmorphism
   - Renderização condicional por locale

8. 🆕 **Criar hook usePaymentStatus.ts**
   - SWR com polling a cada 3s
   - Stop quando status === "approved"

9. 🆕 **Criar /checkout/index.tsx**
   - Renderização condicional:
     - PT: tabs (PIX/Card MP)
     - EN: redirect direto Stripe (ou mini-form)
   - Usa CheckoutSteps, GlassCard, PaymentTabs

10. 🆕 **Criar /checkout/pending.tsx**
    - Página de espera PIX
    - QR Code + polling de status
    - Redirect para success quando approved

11. ✏️ **Modificar /checkout/success.tsx**
    - getServerSideProps: buscar por stripeSessionId OU mpPaymentId
    - Suportar query.payment_id (além de session_id)

### Fase 3: Integração (com safe switch)
12. ✏️ **Modificar useCheckout.ts** (se necessário)
    - Passar locale para create-session
    - Ou: se locale === "pt", redirecionar para /checkout (nova página)
    - Ou: manter redirect direto (create-session decide internamente)

13. ✅ **Testar fluxo completo PT (PIX + Card MP)**
    - Criar pedido → receber QR → simular pagamento → success

14. ✅ **Testar fluxo completo EN (Stripe)**
    - Garantir que não quebramos nada

15. ✅ **Validar BUNKER intacto**
    - `git diff src/lib/stripe.ts` → vazio
    - `git diff src/pages/api/stripe/` → vazio

---

## 10. RISCOS IDENTIFICADOS

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **Quebrar fluxo Stripe existente** | Média | Alto | Criar Order antes de chamar qualquer provider. Testar EN separadamente. |
| **MP PIX expiração (15 min)** | Alta | Médio | Implementar timer visível + retry flow. |
| **Email obrigatório no MP** | Alta | Médio | Validar email antes de criar preferência. Fallback para input. |
| **Webhook MP x Stripe conflitarem** | Baixa | Alto | Usar campos separados: `stripeSessionId` / `mpPaymentId`. Nunca sobrescrever. |
| **Polling excessivo (DDoS self-inflicted)** | Média | Médio | SWR com max 3s interval + timeout após 5 min. |
| **Usuário fechar página durante PIX** | Alta | Baixo | Salvar mpPaymentId em localStorage? Ou aceitar que perde (webhook salva Order). |

---

## 11. DECISÕES PENDENTES (para o dono do produto)

### D1: Método de integração PIX
- [ ] **Opção A**: PIX via API direta (`POST /v1/payments`) → QR próprio (Museum Edition) ✅ **RECOMENDADO**
- [ ] **Opção B**: PIX via Bricks SDK (`@mercadopago/sdk-react`) → componente MP pronto

**Trade-offs**:
| Critério | Opção A (API direta) | Opção B (Bricks) |
|----------|----------------------|------------------|
| Controle visual | Total (Museum Edition) | Limitado (estilos MP) |
| Complexidade backend | Média (criar endpoint PIX) | Baixa (usa create-preference) |
| Complexidade frontend | Média (QR manual + polling) | Baixa (componente pronto) |
| Manutenção | Nós mantemos tudo | Depende de SDK externo |

**RECOMENDAÇÃO**: **Opção A** (API direta) para manter identidade visual Museum Edition.

---

### D2: Cartão MP — Bricks ou redirect?
- [ ] **Opção A**: Cartão via Bricks CardPayment (formulário embutido)
- [ ] **Opção B**: Cartão via redirect (init_point da preferência) ✅ **MAIS SIMPLES**

**Trade-offs**:
| Critério | Opção A (Bricks) | Opção B (Redirect) |
|----------|------------------|---------------------|
| UX | Premium (sem sair do site) | OK (redirect MP) |
| Complexidade | Alta (tokenização + 3DS) | Baixa (MP cuida de tudo) |
| PCI Compliance | Nós + MP | 100% MP |

**RECOMENDAÇÃO**: **Opção B** (redirect) para MVP. Migrar para Bricks depois se necessário.

---

### D3: Checkout exige login?
- [ ] **Opção A**: Exigir login (email garantido)
- [ ] **Opção B**: Permitir guest (pedir email no form) ✅ **ATUAL**

**RECOMENDAÇÃO**: Manter **Opção B** (guest OK) para não aumentar friction. Pedir email em campo dedicado se user não estiver logado.

---

### D4: Feature flag para rollback?
- [ ] **Opção A**: Feature flag `ENABLE_MP=true/false` (env var)
- [ ] **Opção B**: Sem flag, confiar no código híbrido ✅ **RECOMENDADO**

**RECOMENDAÇÃO**: **Opção B**. O código híbrido (locale → provider) é naturalmente seguro. Se EN continua usando Stripe, zero risco. Se PT quebrar, fix forward.

---

### D5: Estratégia de Order creation
- [ ] **Opção A**: Criar Order em create-session (antes de chamar provider) ✅ **RECOMENDADO**
- [ ] **Opção B**: Criar Order apenas no webhook (comportamento atual)

**RECOMENDAÇÃO**: **Opção A**. Precisamos de `orderId` como `external_reference` do MP. Logo, criar Order antes, com status `pending`. Webhook atualiza para `paid`.

---

## 12. DIAGRAMA TO-BE (pós-implementação)

```
┌─────────────────┐
│ CartDrawer.tsx  │ (linha 189: handleCheckout)
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ useCheckout() hook                                      │
│                                                          │
│ DECISÃO 1: Usar checkout page OU redirect direto?      │
│                                                          │
│ Opção A: if (locale === "pt") → redirect /checkout     │
│ Opção B: sempre POST /api/checkout/create-session      │
│          (deixa API decidir)                            │
└────────┬────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ /api/checkout/create-session (HÍBRIDO)                 │
│                                                          │
│ 1. Resolve items (banco)                               │
│ 2. getServerSession → email                            │
│ 3. CREATE Order (status: pending)                      │
│ 4. if (locale === "pt"):                               │
│      → createPixPayment()                              │
│      → Gravar mpPaymentId na Order                     │
│      → Retornar { qr_code, qr_code_base64, ... }       │
│    else:                                                │
│      → stripe.checkout.sessions.create()               │
│      → Gravar stripeSessionId na Order                 │
│      → Retornar { url }                                │
└────────┬────────────────────────────────────────────────┘
         │
         ├─────────────────┬─────────────────┐
         │                 │                 │
         ▼ (PT)            ▼ (EN)            ▼ (futuro: card MP)
┌─────────────────┐ ┌─────────────┐ ┌──────────────────┐
│ /checkout       │ │ Stripe      │ │ MP init_point    │
│ (nova página)   │ │ Checkout    │ │ (redirect)       │
│                 │ │ (hosted)    │ └──────────────────┘
│ Tabs:           │ └─────────────┘
│ - PIX           │
│ - Cartão        │
│                 │
│ PixPayment:     │
│ - QR Code       │
│ - Copy button   │
│ - Polling 3s    │
│ - Timer         │
└─────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ usePaymentStatus() polling                              │
│ → GET /api/mp/payment-status?paymentId={id}            │
│ → Se approved: redirect /checkout/success?payment_id=  │
└─────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ /checkout/success.tsx (ADAPTADO)                       │
│                                                          │
│ getServerSideProps:                                     │
│   const sessionId = query.session_id; // Stripe        │
│   const paymentId = query.payment_id; // MP            │
│                                                          │
│   let order = await prisma.order.findFirst({           │
│     where: {                                            │
│       OR: [                                             │
│         { stripeSessionId: sessionId },                │
│         { mpPaymentId: paymentId }                     │
│       ]                                                 │
│     }                                                   │
│   });                                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 13. PRÓXIMOS PASSOS

1. ✅ **Aprovar este relatório** (decisões D1-D5)
2. 📦 **Instalar dependências** (`npm install mercadopago`)
3. 🚀 **Executar PROMPT B** (implementação Fase 1-3)

---

## ANEXOS

### A. Exemplo de Response do PIX API

```json
{
  "id": 123456789,
  "status": "pending",
  "status_detail": "pending_waiting_payment",
  "transaction_amount": 199.90,
  "currency_id": "BRL",
  "date_created": "2025-12-28T10:30:00.000Z",
  "date_last_updated": "2025-12-28T10:30:00.000Z",
  "point_of_interaction": {
    "type": "PIX",
    "transaction_data": {
      "qr_code": "00020101021226...",
      "qr_code_base64": "iVBORw0KGgoAAAANS...",
      "ticket_url": "https://www.mercadopago.com.br/payments/123456789/ticket?caller_id=..."
    }
  }
}
```

### B. Estimativa de Arquivos Modificados

| Tipo | Criar | Modificar | Total |
|------|-------|-----------|-------|
| Pages | 2 | 1 | 3 |
| APIs | 1 | 2 | 3 |
| Components | 2 | 0 | 2 |
| Hooks | 1 | 1 | 2 |
| Libs | 0 | 1 | 1 |
| i18n | 0 | 2 | 2 |
| **TOTAL** | **6** | **7** | **13** |

---

**FIM DO RELATÓRIO**

Aguardando aprovação para executar **PROMPT B** (implementação).
