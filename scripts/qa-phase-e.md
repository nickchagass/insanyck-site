# QA Phase E — Checkout Success + Conta/Pedidos + Fulfillment

## ✅ Pré-requisitos

- [ ] Migração Prisma aplicada: `npx prisma migrate dev --name phase_e_shipping_fields`
- [ ] Cliente Prisma gerado: `npx prisma generate`
- [ ] Stripe CLI configurado para webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Backend habilitado: `BACKEND_DISABLED=false` ou não definido
- [ ] Usuário admin no banco (role='admin') para testes de fulfillment

## 🛒 1. Checkout Success

### 1.1 Fluxo completo Stripe → Success
- [ ] Criar sessão via `/api/checkout/create-session` (body: `{items:[{variantId:"...",qty:1}], currency:"BRL"}`)
- [ ] Completar pagamento no Stripe Checkout
- [ ] Redirecionamento para `/checkout/success?session_id=cs_...`
- [ ] Página exibe resumo correto do pedido (itens, total, moeda)
- [ ] Link "Meus pedidos" aponta para `/conta/pedidos`

### 1.2 Estado "processing"
- [ ] Acessar `/checkout/success?session_id=cs_test_inexistente`
- [ ] Exibir estado "Processando Pagamento" com spinner
- [ ] Polling automático (máx 3 tentativas, 5s intervalo)
- [ ] Mensagem de refresh manual após 2 tentativas

### 1.3 Redirecionamento
- [ ] Acessar `/checkout/success` sem `session_id` → redireciona para `/loja`

## 👤 2. Conta → Pedidos

### 2.1 Lista de pedidos
- [ ] `/conta/pedidos` requer login (redireciona `/conta/login` se guest)
- [ ] Lista exibe somente pedidos do usuário logado
- [ ] Paginação: mostra 20 pedidos por padrão
- [ ] Botões "Anterior/Próxima" funcionam corretamente
- [ ] Status visual correto: "Em preparo" (paid), "Enviado" (shippedAt)
- [ ] Formato de preço dinâmico por moeda do pedido
- [ ] Links para detalhe apontam `/conta/pedidos/{id}`

### 2.2 Detalhe do pedido
- [ ] `/conta/pedidos/{id}` mostra pedido específico
- [ ] Erro 403 se tentar acessar pedido de outro usuário
- [ ] 404 se pedido não existir
- [ ] Exibe: ID, status, itens, valores, datas (criação/envio)
- [ ] Se tem `trackingCode`, mostra botão de copiar
- [ ] Botão "Voltar aos pedidos" funciona

### 2.3 Estado vazio
- [ ] Usuário sem pedidos → componente `OrdersEmpty`
- [ ] Loading states funcionam (spinner)
- [ ] Tratamento de erro SWR (mensagem discreta)

## 🔧 3. APIs Account

### 3.1 `/api/account/orders` (GET)
- [ ] Requer autenticação (401 sem session)
- [ ] Params: `?offset=0&limit=20` (defaults corretos)
- [ ] Validação: offset≥0, limit≤50
- [ ] Retorna: `{items: [...], total, offset, limit}`
- [ ] Somente pedidos do usuário logado
- [ ] Inclui campos: trackingCode, shippedAt

### 3.2 `/api/account/orders/{id}` (GET)
- [ ] Requer autenticação (401 sem session)
- [ ] 404 se pedido não existir
- [ ] 403 se pedido não pertencer ao usuário
- [ ] Retorna objeto único com itens detalhados

## 🛡️ 4. Admin Fulfillment

### 4.1 `/api/admin/orders/mark-shipped` (POST)
- [ ] Requer admin (403 se não admin, 401 se não logado)
- [ ] Body: `{id: "order_id", trackingCode?: "ABC123"}`
- [ ] Idempotência: repetir com mesmos dados → `{idempotent: true}`
- [ ] Atualiza: `shippedAt = now()`, `trackingCode`
- [ ] Email enviado (best-effort, não falha se erro)
- [ ] Status permanece "paid"

### 4.2 Email order-shipped
- [ ] Email disparado para `order.email`
- [ ] Template inclui trackingCode se fornecido
- [ ] Locale 'pt' por padrão
- [ ] Erro de email não quebra API (log apenas)

## 🛍️ 5. Carrinho Persistente

### 5.1 `/api/cart-sync` atualizado
- [ ] GET: suporte a campos legados (productSlug, slugRef, productId)
- [ ] POST: merge guest→user ao logar
- [ ] Chave de de-dupe: `slug + variantId + sku`
- [ ] Limites: qty 1-10, arrays máx 100 itens
- [ ] Header: `Cache-Control: no-store`
- [ ] Soma quantidades sem duplicar itens

### 5.2 Merge guest→user
- [ ] Body: `{items: [...], guestItems: [...]}`
- [ ] Usuário logado + `guestItems` → mescla corretamente
- [ ] Guest sem sessionId → erro 401
- [ ] Resultado final respeitando limites min/max

## 🎨 6. UI/UX & I18n

### 6.1 Design consistency
- [ ] Páginas seguem padrão "glass/hairline" INSANYCK
- [ ] Sem quebras de layout em mobile/desktop
- [ ] Componentes `AccountLayout` funcionam
- [ ] Animações `framer-motion` suaves

### 6.2 Internacionalização
- [ ] PT/EN funcionam nas novas páginas
- [ ] Chaves i18n em `common.json` ou `account.json`
- [ ] Formatação de datas/moedas por locale
- [ ] Fallbacks para chaves ausentes

## 🏗️ 7. Infraestrutura

### 7.1 Headers e CSP
- [ ] CSP headers não quebrados (nada da Fase C afetado)
- [ ] Headers de segurança mantidos
- [ ] PWA/Service Worker funcionando

### 7.2 Build e types
- [ ] `npm run typecheck` → sem erros críticos
- [ ] `npm run lint` → warnings aceitáveis
- [ ] `npm run build` → sucesso
- [ ] Sem imports circulares

### 7.3 Performance
- [ ] SSR das páginas `/conta/pedidos` rápido
- [ ] SWR cache funcionando
- [ ] Lazy imports em `/api/cart-sync`
- [ ] Sem memory leaks no polling

## 🚀 8. Fluxo End-to-End

### 8.1 Cenário completo
1. [ ] Guest adiciona itens ao carrinho
2. [ ] Faz login (merge guest→user automático)
3. [ ] Finaliza compra via Stripe
4. [ ] Webhook cria pedido no banco
5. [ ] Success page mostra resumo
6. [ ] Acessa "Meus pedidos" → vê o pedido
7. [ ] Admin marca como enviado + tracking
8. [ ] Email "order-shipped" recebido
9. [ ] Usuário vê status "Enviado" na conta

### 8.2 Edge cases
- [ ] Webhook fora de ordem (success antes do webhook)
- [ ] Usuário acessa success de sessão muito antiga
- [ ] Admin tenta marcar pedido inexistente
- [ ] Carrinho com variantes removidas do banco
- [ ] Sessões guest muito antigas (TTL MongoDB)

## 📋 Critérios de Aprovação

- [ ] **Todos os checkboxes marcados**
- [ ] **Zero regressões nas Fases C/D**
- [ ] **Performance aceitável (< 2s loading)**
- [ ] **Acessibilidade básica (screen readers)**
- [ ] **Testes manuais em Chrome/Firefox/Safari**

---

**Data do QA:** ____________  
**Responsável:** ____________  
**Aprovado:** ☐ Sim ☐ Não  
**Observações:**

## 🔒 9. Validações de Erro (APIs de Checkout)

### 9.1 `/api/checkout/create-session` (POST)
- [ ] **400** quando `items` ausente ou vazio
- [ ] **400** quando `qty` < 1 ou > 10
- [ ] **400** quando `currency` diferente de `BRL`
- [ ] **200** com `{ url }` quando payload válido
- [ ] **Header**: `Cache-Control: no-store`

### 9.2 `/api/checkout/order-status` (GET)
- [ ] **400** quando `session_id` ausente
- [ ] **200** com `{ order: null }` para `session_id` inexistente
- [ ] **200** com `{ order: {...} }` quando pedido já criado pelo webhook
- [ ] **Header**: `Cache-Control: no-store`

> Observação: todas as respostas devem ter `Cache-Control: no-store` quando aplicável, e shape consistente com as demais APIs do projeto.

---

## 🧪 Apêndice — Snippets úteis (cURL)

> Dica: rode o app em `http://localhost:3000`. Em dev, copie o cookie de sessão **admin** (Chrome DevTools → Application → Cookies) para chamar endpoints protegidos.  
> Cookies possíveis (dependendo do ambiente):
> - `next-auth.session-token=<TOKEN>`
> - `__Secure-next-auth.session-token=<TOKEN>`

### A) Criar sessão de checkout (válido)
```bash
curl -i -X POST http://localhost:3000/api/checkout/create-session \
  -H "Content-Type: application/json" \
  --data '{
    "items":[{"variantId":"<VARIANT_ID>","qty":1}],
    "currency":"BRL"
  }'
```

Esperado: 200 com {"url":"https://checkout.stripe.com/..."}
Nota: Substitua <VARIANT_ID> por um ID válido na tabela Variant (veja no Prisma Studio).

### B) Criar sessão de checkout (inválido — qty=0)
```bash
curl -i -X POST http://localhost:3000/api/checkout/create-session \
  -H "Content-Type: application/json" \
  --data '{
    "items":[{"variantId":"<VARIANT_ID>","qty":0}],
    "currency":"BRL"
  }'
```

Esperado: 400 com erro de validação (zod).

### C) Status do pedido — faltando session_id
```bash
curl -i "http://localhost:3000/api/checkout/order-status"
```

Esperado: 400 (Invalid session_id).

### D) Status do pedido — session_id inexistente
```bash
curl -i "http://localhost:3000/api/checkout/order-status?session_id=cs_test_inexistente"
```

Esperado: 200 com {"order":null}.

### E) Fulfillment admin — marcar como enviado
```bash
curl -i -X POST http://localhost:3000/api/admin/orders/mark-shipped \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<SEU_TOKEN_DE_SESSAO_ADMIN>" \
  --data '{"id":"<ORDER_ID>","trackingCode":"AB123456BR"}'
```

Esperado: 200 com { ok: true, shipped: true, idempotent: false, ... }

Ambiente com cookie seguro:

```bash
curl -i -X POST http://localhost:3000/api/admin/orders/mark-shipped \
  -H "Content-Type: application/json" \
  -H "Cookie: __Secure-next-auth.session-token=<SEU_TOKEN_DE_SESSAO_ADMIN>" \
  --data '{"id":"<ORDER_ID>","trackingCode":"AB123456BR"}'
```

### F) Fulfillment admin — idempotência (mesmo payload)
```bash
curl -i -X POST http://localhost:3000/api/admin/orders/mark-shipped \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=<SEU_TOKEN_DE_SESSAO_ADMIN>" \
  --data '{"id":"<ORDER_ID>","trackingCode":"AB123456BR"}'
```

Esperado: 200 com { idempotent: true }.

---

## 🔐 CSP & Security baseline (check rápido)

// INSANYCK STEP E-06 — Nota de segurança

- [ ] Confirmar que os headers de segurança definidos na Fase C (CSP, X-Frame-Options, etc.) continuam ativos em produção.
- [ ] Confirmar que as rotas sensíveis de API estão com `Cache-Control: no-store` e `Vary: Authorization`.
- [ ] Endurecimento adicional de CSP e rate limiting ficam para a V2 Essencial.