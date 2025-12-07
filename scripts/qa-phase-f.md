# INSANYCK — QA Fase F: Infraestrutura de Pagamentos Real

> **Objetivo da Fase F:** Endurecer a infraestrutura de pagamentos (Stripe + Mercado Pago) para produção, com foco em segurança, monitoramento, e preparação para ambiente real.

---

## F-01 — Mercado Pago (Modo Teste / Produção)

### Variáveis de Ambiente Necessárias

Todas as variáveis abaixo devem estar configuradas em `.env.local`:

| Variável | Descrição | Exemplo (Modo Teste) |
|----------|-----------|----------------------|
| `MP_ACCESS_TOKEN` | Access token para criar preferências e consultar pagamentos | `TEST-xxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxx` |
| `MP_PUBLIC_KEY` | Public key (usado no frontend) | `TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `MP_NOTIFICATION_URL` | URL do webhook registrada no painel do Mercado Pago | `https://yourdomain.com/api/mp/webhook` ou use ngrok/tunneling em dev |
| `BACKEND_DISABLED` | Toggle de backend (deve ser `"0"` para MP funcionar) | `0` |
| `NEXT_PUBLIC_URL` | URL pública do site (usada para back_urls) | `http://localhost:3000` (dev) ou `https://insanyck.com` (prod) |

#### Como obter as credenciais do Mercado Pago:

1. **Modo Teste:**
   - Acesse: https://www.mercadopago.com.br/developers/panel/app
   - Crie uma aplicação ou use uma existente
   - Em "Credenciais de teste", copie:
     - Public Key (começa com `TEST-...`)
     - Access Token (começa com `TEST-...`)

2. **Modo Produção (futuro):**
   - Mesma página, aba "Credenciais de produção"
   - Requer conta verificada e aprovação do Mercado Pago
   - Public Key começa com `APP_USR-...`
   - Access Token começa com `APP_USR-...`

---

### Checklist de Testes Manuais

#### 1. Segurança — BACKEND_DISABLED

- [ ] **Cenário:** Backend desabilitado
  - [ ] Configurar `.env.local` com `BACKEND_DISABLED="1"`
  - [ ] Reiniciar servidor Next.js
  - [ ] Tentar criar preferência: `POST /api/mp/create-preference`
  - [ ] **Esperado:** Resposta `503 - Backend temporarily disabled`
  - [ ] Tentar chamar webhook: `POST /api/mp/webhook`
  - [ ] **Esperado:** Resposta `503 - Backend temporarily disabled`

- [ ] **Cenário:** Backend habilitado
  - [ ] Configurar `.env.local` com `BACKEND_DISABLED="0"`
  - [ ] Reiniciar servidor Next.js
  - [ ] Confirmar que rotas MP respondem normalmente (não mais 503)

#### 2. Frontend — Criar Preferência

- [ ] **Pré-requisito:** Configurar todas as env vars do MP (modo teste)
- [ ] **Pré-requisito:** `BACKEND_DISABLED="0"`

- [ ] Navegar até o fluxo de checkout com opção Mercado Pago
  - [ ] Adicionar item ao carrinho
  - [ ] Ir para `/checkout`
  - [ ] Selecionar "Mercado Pago" como método de pagamento (se houver seletor)

- [ ] Gerar preferência de pagamento
  - [ ] Clicar em botão "Pagar com Mercado Pago" (ou similar)
  - [ ] **Esperado:** Requisição `POST /api/mp/create-preference` retorna:
    ```json
    {
      "id": "123456789-abc...",
      "init_point": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
      "sandbox_init_point": "https://sandbox.mercadopago.com.br/checkout/v1/redirect?pref_id=..."
    }
    ```
  - [ ] **Esperado:** Redirecionamento para página do Mercado Pago (modo sandbox)

- [ ] Na página do Mercado Pago (modo teste):
  - [ ] Verificar que os itens do carrinho aparecem corretamente
  - [ ] Verificar que o preço está correto
  - [ ] Usar cartão de teste: `5031 4332 1540 6351` (aprovar pagamento)
  - [ ] CVV: qualquer 3 dígitos
  - [ ] Validade: qualquer data futura
  - [ ] CPF: qualquer CPF válido (ex.: `123.456.789-01`)

#### 3. Webhook — Notificação de Pagamento

- [ ] **Pré-requisito:** Ter registrado a URL do webhook no painel do Mercado Pago
  - [ ] Dev: usar ngrok/tunnelmole/localhost.run para expor porta local
  - [ ] Prod: usar URL HTTPS real (ex.: `https://insanyck.com/api/mp/webhook`)

- [ ] Após completar pagamento de teste:
  - [ ] Aguardar webhook do Mercado Pago (pode levar alguns segundos)
  - [ ] Verificar logs do servidor para:
    ```
    [MP Webhook] Payment ID: 123456789
    [MP Webhook] Status: approved
    [MP Webhook] Order updated: {orderId}
    ```

- [ ] Verificar banco de dados (quando estiver conectado):
  - [ ] Buscar pedido pelo `orderId` (external_reference)
  - [ ] **Esperado:**
    - `status: 'paid'`
    - `stripeSessionId: 'mp_{paymentId}'` (workaround temporário até F-02)

- [ ] Cenários de erro do webhook:
  - [ ] Pagamento pendente (`status !== 'approved'`)
    - [ ] **Esperado:** Webhook retorna `200 OK` mas não atualiza pedido
  - [ ] Pedido não encontrado no banco
    - [ ] **Esperado:** Webhook retorna `404 - Order not found`
  - [ ] Webhook sem `paymentId`
    - [ ] **Esperado:** Webhook retorna `400 - Missing payment ID`

#### 4. Validação de Payload

- [ ] Testar criação de preferência com payload inválido:
  - [ ] Sem `orderId`:
    ```bash
    curl -X POST http://localhost:3000/api/mp/create-preference \
      -H "Content-Type: application/json" \
      -d '{"items": [{"title": "Test", "quantity": 1, "unit_price": 100, "currency_id": "BRL"}]}'
    ```
    - [ ] **Esperado:** `400 - Missing required fields: orderId, items`

  - [ ] Sem `items`:
    ```bash
    curl -X POST http://localhost:3000/api/mp/create-preference \
      -H "Content-Type: application/json" \
      -d '{"orderId": "test-123"}'
    ```
    - [ ] **Esperado:** `400 - Missing required fields: orderId, items`

  - [ ] Array `items` vazio:
    ```bash
    curl -X POST http://localhost:3000/api/mp/create-preference \
      -H "Content-Type: application/json" \
      -d '{"orderId": "test-123", "items": []}'
    ```
    - [ ] **Esperado:** `400 - Missing required fields: orderId, items`

#### 5. Configuração de Ambiente

- [ ] Verificar que `.env.example` está atualizado:
  - [ ] Contém todas as variáveis do MP
  - [ ] Comentários explicativos estão claros
  - [ ] Exemplos de valores estão no formato correto

- [ ] Verificar que `src/lib/env.server.ts` valida corretamente:
  - [ ] `MP_ACCESS_TOKEN`, `MP_PUBLIC_KEY`, `MP_NOTIFICATION_URL` existem no schema
  - [ ] Valores default são strings vazias (não obrigatórios, mas com default seguro)
  - [ ] Tipagem exportada está correta

#### 6. Logs e Monitoramento

- [ ] Logs mínimos e discretos (sem vazar dados sensíveis):
  - [ ] Webhook não loga payload completo em produção
  - [ ] Erros críticos são logados com contexto suficiente
  - [ ] Sucesso de pagamento é logado com `orderId` e `paymentId`

- [ ] Headers de segurança presentes:
  - [ ] `Cache-Control: no-store` em rotas MP
  - [ ] `Vary: Authorization` em rotas MP

---

### TODOs Futuros (Fase F-02+)

Deixados como comentários no código para implementação futura:

1. **Validação de assinatura do webhook:**
   - [ ] Implementar verificação HMAC SHA-256 usando `x-signature` e `x-request-id`
   - [ ] Ref: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
   - [ ] Arquivo: `src/pages/api/mp/webhook.ts` (linha ~48)

2. **Campo dedicado para `mpPaymentId`:**
   - [ ] Adicionar campo `mpPaymentId` no modelo `Order` (Prisma schema)
   - [ ] Migrar lógica que usa `stripeSessionId` com prefixo `mp_`
   - [ ] Arquivo: `src/pages/api/mp/webhook.ts` (linha ~96)

3. **Testes automatizados:**
   - [ ] E2E test para fluxo completo de checkout com MP
   - [ ] Unit tests para funções de `src/lib/mp.ts`
   - [ ] Mock de webhook do MP para testes de integração

---

## Checklist de Migração para Produção (MP)

Quando estiver pronto para usar Mercado Pago em produção:

- [ ] Obter credenciais de produção (Public Key e Access Token começando com `APP_USR-`)
- [ ] Atualizar `.env` de produção com credenciais reais
- [ ] Configurar `MP_NOTIFICATION_URL` para URL HTTPS pública
- [ ] Registrar URL do webhook no painel do Mercado Pago (modo produção)
- [ ] Testar fluxo completo em staging com credenciais de produção
- [ ] Validar que assinaturas de webhook estão sendo verificadas (F-02)
- [ ] Monitorar logs de webhook nos primeiros dias de produção
- [ ] Configurar alertas para falhas de webhook (ex.: Sentry, Datadog)

---

## Comandos Úteis

```bash
# Testar criação de preferência localmente
curl -X POST http://localhost:3000/api/mp/create-preference \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order-123",
    "items": [{
      "title": "Produto Teste",
      "quantity": 1,
      "unit_price": 100,
      "currency_id": "BRL"
    }]
  }'

# Simular webhook (após obter paymentId real)
curl -X POST http://localhost:3000/api/mp/webhook \
  -H "Content-Type: application/json" \
  -d '{"data": {"id": "123456789"}}'

# Expor localhost para receber webhooks (exemplo com ngrok)
ngrok http 3000
# Copiar URL HTTPS gerada e configurar em MP_NOTIFICATION_URL
```

---

## Contatos e Suporte

- **Documentação oficial:** https://www.mercadopago.com.br/developers/pt/docs
- **Painel de desenvolvedores:** https://www.mercadopago.com.br/developers/panel
- **Suporte:** https://www.mercadopago.com.br/developers/pt/support

---

## F-02 — Banco de Dados (Neon/Postgres + Order multi-provider)

> **Objetivo:** Ligar o banco de dados real (Neon/Postgres) de forma segura e consolidar o modelo Order para suportar múltiplos provedores de pagamento (Stripe + Mercado Pago) sem gambiarras.

---

### Variáveis de Ambiente Necessárias

Adicione ao seu `.env.local`:

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | String de conexão do Postgres/Neon | `postgresql://user:password@host/db?sslmode=require&channel_binding=require` |

**Como obter a DATABASE_URL:**

1. **Neon (recomendado):**
   - Acesse: https://neon.tech
   - Crie um projeto ou use um existente
   - Em "Connection Details", copie a connection string
   - Certifique-se de incluir `?sslmode=require` no final da URL

2. **Postgres Local:**
   - Exemplo: `postgresql://postgres:postgres@localhost:5432/insanyck`

---

### Passos de QA (para o CEO rodar localmente)

#### 1. Configuração Inicial

- [ ] **Definir DATABASE_URL**
  - [ ] Adicionar `DATABASE_URL` no arquivo `.env.local`
  - [ ] Verificar que a string de conexão está correta
  - [ ] Se estiver usando Neon, garantir que inclui `?sslmode=require`

- [ ] **Reiniciar servidor**
  - [ ] Se `npm run dev` estiver rodando, reiniciar o servidor
  - [ ] Aguardar que o servidor suba sem erros

#### 2. Teste de Conexão

- [ ] **Rodar script de verificação**
  ```bash
  npm run db:check
  ```
  - [ ] **Esperado:** Mensagem `✅ Database connection OK`
  - [ ] **Se falhar:** Verificar credenciais e firewall do Neon

#### 3. Migração Prisma

- [ ] **Criar e aplicar migração**
  ```bash
  npx prisma migrate dev --name phase_f_order_payments
  ```
  - [ ] **Esperado:** Migração criada em `prisma/migrations/`
  - [ ] **Esperado:** Migração aplicada com sucesso no banco
  - [ ] Verificar que nenhum erro aparece no console

- [ ] **Verificar geração de tipos**
  ```bash
  npx prisma generate
  ```
  - [ ] **Esperado:** Cliente Prisma regenerado com novos campos

#### 4. Validação de TypeScript

- [ ] **Rodar typecheck**
  ```bash
  npm run typecheck
  ```
  - [ ] **Esperado:** Nenhum erro de tipos
  - [ ] Se houver erros, verificar que os campos do Order estão corretos

- [ ] **Rodar lint**
  ```bash
  npm run lint
  ```
  - [ ] **Esperado:** Nenhum erro de linting

#### 5. Sanidade do Modelo Order

- [ ] **Verificar schema.prisma**
  - [ ] Abrir `prisma/schema.prisma`
  - [ ] Confirmar que o `model Order` tem:
    - [ ] `paymentProvider String @default("stripe")`
    - [ ] `stripeSessionId String? @unique` (opcional)
    - [ ] `stripePaymentIntentId String? @unique` (opcional)
    - [ ] `mpPaymentId String? @unique` (opcional)
    - [ ] `mpPreferenceId String? @unique` (opcional)

- [ ] **Verificar webhooks**
  - [ ] Abrir `src/pages/api/stripe/webhook.ts`
    - [ ] Confirmar que `order.create` inclui `paymentProvider: "stripe"`
    - [ ] Confirmar que `stripePaymentIntentId` é populado quando disponível
  - [ ] Abrir `src/pages/api/mp/webhook.ts`
    - [ ] Confirmar que `order.update` inclui `paymentProvider: "mercado_pago"`
    - [ ] Confirmar que `mpPaymentId` é usado (não mais `stripeSessionId`)

#### 6. Testes Funcionais

- [ ] **Teste de Checkout Stripe**
  - [ ] Adicionar produto ao carrinho
  - [ ] Ir para `/checkout`
  - [ ] Pagar com Stripe (modo teste)
  - [ ] Verificar que o webhook cria o pedido com:
    - [ ] `paymentProvider: "stripe"`
    - [ ] `stripeSessionId` preenchido
    - [ ] `stripePaymentIntentId` preenchido (se disponível)
  - [ ] Consultar banco de dados e verificar que o pedido foi criado corretamente

- [ ] **Teste de Checkout Mercado Pago** (quando credenciais estiverem configuradas)
  - [ ] Adicionar produto ao carrinho
  - [ ] Ir para `/checkout`
  - [ ] Pagar com Mercado Pago (modo teste)
  - [ ] Verificar que o webhook atualiza o pedido com:
    - [ ] `paymentProvider: "mercado_pago"`
    - [ ] `mpPaymentId` preenchido
    - [ ] `stripeSessionId` **não** preenchido com `"mp_..."`

#### 7. Segurança

- [ ] **Confirmar BACKEND_DISABLED**
  - [ ] Verificar que `BACKEND_DISABLED` continua respeitado nas rotas sensíveis
  - [ ] Testar com `BACKEND_DISABLED="1"` e confirmar que webhooks retornam 503

- [ ] **Verificar que DATABASE_URL não vaza**
  - [ ] Confirmar que `.env.local` está no `.gitignore`
  - [ ] Verificar que nenhum log exibe a connection string completa

---

### Campos do Modelo Order (Referência)

Após a migração, o modelo Order deve ter estes campos relacionados a pagamentos:

```prisma
model Order {
  id       String @id @default(cuid())
  userId   String?
  user     User?  @relation(fields: [userId], references: [id])
  email    String

  // INSANYCK FASE F-02 — Suporte a múltiplos provedores de pagamento
  paymentProvider       String  @default("stripe") // 'stripe' | 'mercado_pago'
  stripeSessionId       String? @unique
  stripePaymentIntentId String? @unique
  mpPaymentId           String? @unique
  mpPreferenceId        String? @unique

  status      String
  currency    String
  amountTotal Int
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  emailSentAt DateTime?

  trackingCode String?   @db.VarChar(64)
  shippedAt    DateTime?

  items OrderItem[]

  @@index([userId, createdAt])
  @@index([status, createdAt])
  @@index([paymentProvider, status])
}
```

---

### Troubleshooting

**Erro: `DATABASE_URL não está definida`**
- Verificar que `.env.local` existe e tem a variável `DATABASE_URL`
- Reiniciar o servidor Next.js após adicionar a variável

**Erro: `Database connection FAILED`**
- Verificar que a string de conexão está correta
- Se estiver usando Neon, verificar que o projeto está ativo
- Verificar firewall/VPN que possa estar bloqueando a conexão
- Tentar acessar o banco via `psql` para confirmar conectividade

**Erro de migração: `Column already exists`**
- Se os campos já existem no banco, pode precisar de uma migração vazia
- Rodar `npx prisma migrate resolve --applied <migration-name>` se necessário
- Consultar a documentação do Prisma sobre resolução de conflitos

**Erro de tipos após migração**
- Rodar `npx prisma generate` para regenerar o cliente
- Reiniciar o TypeScript server no editor (VS Code: Ctrl+Shift+P → "Restart TS Server")

---

### TODOs Futuros (Fase F-03+)

1. **Popular mpPreferenceId:**
   - [ ] Adicionar lógica para extrair `preference_id` do payload do Mercado Pago
   - [ ] Atualizar webhook para gravar no campo `mpPreferenceId`

2. **Monitoramento de banco:**
   - [ ] Configurar alertas para queries lentas (Neon Analytics)
   - [ ] Revisar índices baseado em uso real
   - [ ] Configurar connection pooling se necessário

3. **Backup e recovery:**
   - [ ] Configurar backups automáticos no Neon
   - [ ] Documentar processo de restore
   - [ ] Testar recovery em ambiente de staging

---

## F-03 — Dual Gateway (Stripe + Mercado Pago)

> **Objetivo:** Consolidar a integração Stripe + Mercado Pago com idempotência robusta, campos dedicados e limpeza de dívidas técnicas.

---

### Mudanças Implementadas

1. **Stripe Webhook** (`src/pages/api/stripe/webhook.ts`):
   - Idempotência robusta baseada em `stripePaymentIntentId` + status `paid`
   - Não processa novamente pagamentos já confirmados
   - Logs limpos e discretos

2. **Mercado Pago create-preference** (`src/pages/api/mp/create-preference.ts`):
   - Grava `mpPreferenceId` na Order após criar preferência
   - Define `paymentProvider = 'mercadopago'`

3. **Mercado Pago webhook** (`src/pages/api/mp/webhook.ts`):
   - Idempotência robusta baseada em `mpPaymentId` + status `paid`
   - Não processa novamente pagamentos já confirmados
   - Logs limpos e discretos

---

### Checklist de Testes Manuais

#### Stripe (modo teste)

- [ ] **Criar pedido com Stripe**
  - [ ] Adicionar produto ao carrinho
  - [ ] Ir para `/checkout`
  - [ ] Pagar com Stripe (cartão de teste: `4242 4242 4242 4242`)
  - [ ] Confirmar redirecionamento para `/checkout/success`

- [ ] **Verificar no banco de dados**
  - [ ] Buscar o pedido criado
  - [ ] **Esperado:**
    - `paymentProvider = 'stripe'`
    - `stripeSessionId` preenchido
    - `stripePaymentIntentId` preenchido
    - `status = 'paid'`

- [ ] **Testar idempotência do webhook**
  - [ ] Reenviar manualmente o mesmo evento de webhook do Stripe (via Stripe CLI ou dashboard)
  - [ ] **Esperado:**
    - Webhook responde `200 OK`
    - Log mostra: `[Stripe Webhook] Payment already processed for intent pi_...`
    - Pedido NÃO é alterado novamente
    - Estoque NÃO é decrementado novamente

#### Mercado Pago (modo teste/sandbox)

- [ ] **Criar preferência de pagamento**
  - [ ] Adicionar produto ao carrinho
  - [ ] Ir para `/checkout`
  - [ ] Selecionar Mercado Pago como método de pagamento
  - [ ] Clicar em "Pagar com Mercado Pago"

- [ ] **Verificar criação de preferência**
  - [ ] Confirmar que `/api/mp/create-preference` retorna sucesso
  - [ ] Verificar no banco de dados:
    - `mpPreferenceId` preenchido
    - `paymentProvider = 'mercadopago'`

- [ ] **Completar pagamento de teste**
  - [ ] Seguir fluxo de pagamento no Mercado Pago (sandbox)
  - [ ] Usar cartão de teste: `5031 4332 1540 6351`
  - [ ] Aguardar notificação do webhook

- [ ] **Verificar no banco de dados após pagamento**
  - [ ] Buscar o pedido
  - [ ] **Esperado:**
    - `mpPreferenceId` preenchido (desde create-preference)
    - `mpPaymentId` preenchido (após webhook)
    - `paymentProvider = 'mercadopago'`
    - `status = 'paid'`
    - `stripeSessionId` e `stripePaymentIntentId` são `null` (não mistura com Stripe)

- [ ] **Testar idempotência do webhook MP**
  - [ ] Reenviar (ou simular) a mesma notificação do webhook
  - [ ] **Esperado:**
    - Webhook responde `200 OK`
    - Log mostra: `[MP Webhook] Payment already processed for mpPaymentId ...`
    - Pedido NÃO é alterado novamente

---

### Validação de Segregação de Campos

- [ ] **Confirmar que não há "cross-contamination"**
  - [ ] Pedidos Stripe:
    - [ ] `stripeSessionId` e `stripePaymentIntentId` preenchidos
    - [ ] `mpPreferenceId` e `mpPaymentId` são `null`
    - [ ] `paymentProvider = 'stripe'`

  - [ ] Pedidos Mercado Pago:
    - [ ] `mpPreferenceId` e `mpPaymentId` preenchidos
    - [ ] `stripeSessionId` e `stripePaymentIntentId` são `null`
    - [ ] `paymentProvider = 'mercadopago'`

- [ ] **Confirmar limpeza de código legado**
  - [ ] Nenhum código usa `stripeSessionId` com prefixo `mp_...`
  - [ ] Campos de MP usam exclusivamente `mpPreferenceId` e `mpPaymentId`

---

### Validação de Logs e Segurança

- [ ] **Logs limpos**
  - [ ] Webhooks não logam payloads completos
  - [ ] Logs mostram apenas:
    - Event type
    - Order ID
    - Payment ID (Stripe ou MP)
    - Status da operação

- [ ] **Headers de segurança**
  - [ ] Rotas MP e Stripe têm `Cache-Control: no-store`
  - [ ] Rotas MP e Stripe têm `Vary: Authorization` (quando aplicável)

---

### Comandos de Validação

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

---

### TODOs Futuros (Fase F-04+)

1. **Migração de dados legados:**
   - [ ] Se houver pedidos antigos com `stripeSessionId` contendo `mp_...`, migrar para `mpPaymentId`
   - [ ] Script de migração one-time para limpar dados históricos

2. **Monitoramento:**
   - [ ] Adicionar métricas para webhooks duplicados (quantos foram bloqueados por idempotência)
   - [ ] Alertas para falhas consecutivas de webhook

3. **Testes automatizados:**
   - [ ] E2E test para fluxo completo Stripe com idempotência
   - [ ] E2E test para fluxo completo MP com idempotência
   - [ ] Unit tests para funções de idempotência

---

## F-04 — Segurança Mercado Pago (Assinatura + Logs)

> **Objetivo:** Garantir que apenas o Mercado Pago consiga chamar `/api/mp/webhook` em produção e que não haja logs sensíveis em produção.

---

### Mudanças Implementadas

1. **Variável de ambiente** (`src/lib/env.server.ts` e `.env.example`):
   - Adicionado `MP_WEBHOOK_SECRET` ao schema de validação
   - Default seguro (string vazia) para não quebrar dev

2. **Validação HMAC** (`src/pages/api/mp/webhook.ts`):
   - Implementada função `verifyMPWebhookSignature` usando `crypto` nativo do Node
   - Validação baseada em `x-signature` e `x-request-id` headers
   - Comparação timing-safe usando `crypto.timingSafeEqual`
   - Em produção: rejeita (401) quando assinatura é inválida ou ausente
   - Em dev: se não houver secret, apenas loga aviso e aceita

3. **Limpeza de logs** (webhooks):
   - Removidos `console.log` de caminhos de idempotência
   - Mantidos apenas `console.error` para erros críticos
   - Mantidos `console.warn` para avisos em dev

---

### Checklist de Variáveis de Ambiente

Para produção, garantir que estão configuradas:

- [ ] `MP_ACCESS_TOKEN` (Access token do Mercado Pago)
- [ ] `MP_PUBLIC_KEY` (Public key do Mercado Pago)
- [ ] `MP_NOTIFICATION_URL` (URL do webhook registrada no painel do MP)
- [ ] `MP_WEBHOOK_SECRET` (Segredo para validar assinatura do webhook)

**Como obter o `MP_WEBHOOK_SECRET`:**
1. Acessar: https://www.mercadopago.com.br/developers/panel/app
2. Selecionar sua aplicação
3. Em "Webhooks", copiar o segredo exibido (usado para validação HMAC)

---

### Checklist de Testes Manuais

#### Ambiente de Desenvolvimento

- [ ] **Sem MP_WEBHOOK_SECRET**
  - [ ] Webhook aceita chamadas sem validar assinatura
  - [ ] Log mostra: `[MP Webhook] Skipping signature validation (no MP_WEBHOOK_SECRET in dev)`

- [ ] **Com MP_WEBHOOK_SECRET configurado (mesmo em dev)**
  - [ ] Chamada com headers válidos é aceita
  - [ ] Chamada sem headers ou com assinatura inválida é rejeitada (401)

#### Ambiente de Produção (ou simulando com NODE_ENV=production)

- [ ] **MP_WEBHOOK_SECRET preenchido**
  - [ ] Chamada ao webhook sem `x-signature` ou `x-request-id` retorna:
    - Status: `401 Unauthorized`
    - Body: `{ "error": "Invalid signature" }`
    - Log: `[MP Webhook] Invalid signature or missing headers`

  - [ ] Chamada ao webhook com assinatura inválida retorna:
    - Status: `401 Unauthorized`
    - Body: `{ "error": "Invalid signature" }`
    - Log: `[MP Webhook] Invalid signature or missing headers`

  - [ ] Chamada válida (usando fluxo real do Mercado Pago):
    - [ ] Passa pela validação de assinatura
    - [ ] Atualiza Order para status `'paid'` (se ainda não pago)
    - [ ] NÃO cria pedidos duplicados (idempotência F-03 preservada)
    - [ ] NÃO loga `console.log` em caminhos normais

#### Validação de Logs

- [ ] **Produção**
  - [ ] Nenhum `console.log` em webhooks Stripe e MP
  - [ ] Apenas `console.error` para erros críticos:
    - Falha de email
    - Falha de processamento
    - Assinatura inválida
    - Order não encontrada

- [ ] **Dev**
  - [ ] `console.warn` pode aparecer para avisos úteis
  - [ ] Nenhum log de dados sensíveis (payloads completos, tokens, etc.)

---

### Comandos de Validação

```bash
# Typecheck
npm run typecheck

# Lint
npm run lint

# Build
npm run build
```

---

### Teste de Validação de Assinatura (Manual)

Para testar a validação HMAC manualmente, você pode simular uma chamada:

```bash
# 1. Obter MP_WEBHOOK_SECRET do .env.local
# 2. Gerar assinatura conforme documentação do MP:
#    manifest = "id:{data.id};request-id:{x-request-id};ts:{timestamp};"
#    hash = HMAC-SHA256(manifest, MP_WEBHOOK_SECRET)
# 3. Enviar requisição:

curl -X POST http://localhost:3000/api/mp/webhook \
  -H "Content-Type: application/json" \
  -H "x-signature: ts=1234567890,v1={hash_calculado}" \
  -H "x-request-id: abc123" \
  -d '{"data": {"id": "123456789"}}'
```

**Nota:** Para obter o hash real do Mercado Pago, use o fluxo completo de pagamento em ambiente de teste/sandbox.

---

### Diagrama de Fluxo (Validação de Assinatura)

```
┌─────────────────────────────────────────────────┐
│  Mercado Pago envia webhook                     │
│  Headers: x-signature, x-request-id             │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Webhook handler recebe requisição              │
│  - Lê body raw (para HMAC)                      │
│  - Parse JSON (para lógica)                     │
└───────────────────┬─────────────────────────────┘
                    │
                    ▼
          ┌─────────────────┐
          │ NODE_ENV=prod?  │
          └────┬────────┬───┘
               │ SIM    │ NÃO
               │        │
               ▼        └──────────────────────────┐
┌────────────────────────┐                         │
│ MP_WEBHOOK_SECRET set? │                         │
└────┬───────────┬───────┘                         │
     │ SIM       │ NÃO                              │
     │           │                                  │
     ▼           ▼                                  ▼
┌────────┐  ┌─────────┐              ┌──────────────────────┐
│ Validar│  │ Rejeitar│              │ Logar warning (dev)  │
│ HMAC   │  │ 401     │              │ Aceitar sem validar  │
└────┬───┘  └─────────┘              └──────────┬───────────┘
     │                                            │
     ▼                                            │
┌─────────────┐                                   │
│ Válido?     │                                   │
└────┬────┬───┘                                   │
     │ SIM│ NÃO                                   │
     │    │                                       │
     │    └──> Rejeitar 401                       │
     │                                            │
     └────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Processar webhook                              │
│  - Verificar idempotência (F-03)                │
│  - Atualizar Order (se necessário)              │
│  - Retornar 200 OK                              │
└─────────────────────────────────────────────────┘
```

---

### Segurança Adicional (TODOs Futuros)

1. **Rate limiting:**
   - [ ] Implementar rate limit por IP para webhook endpoint
   - [ ] Bloquear IPs suspeitos após N tentativas com assinatura inválida

2. **Monitoramento:**
   - [ ] Alertas para múltiplas falhas de validação de assinatura
   - [ ] Métricas de webhooks rejeitados vs aceitos

3. **Replay attack protection:**
   - [ ] Validar timestamp (`ts`) do header `x-signature`
   - [ ] Rejeitar webhooks com timestamp muito antigo (> 5 minutos)

---

**Última atualização:** FASE F-04
**Responsável:** Staff Engineer (Claude)
**Status:** ✅ F-01 (MP Teste) | ✅ F-02 (Banco de Dados + Order multi-provider) | ✅ F-03 (Dual Gateway + Idempotência) | ✅ F-04 (Segurança MP + Logs)
