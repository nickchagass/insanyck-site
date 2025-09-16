# E2E Testing com Playwright

Este documento descreve como executar e manter os testes end-to-end (E2E) do projeto INSANYCK usando Playwright.

## 🎯 Objetivo

Os testes E2E garantem que as funcionalidades críticas da aplicação funcionem corretamente:

- **Smoke tests**: Verificam que as rotas principais carregam sem erro
- **Visual regression**: Detectam mudanças indesejadas na UI através de snapshots
- **Integração**: Testam fluxos completos como navegação e interações básicas

## 🏗️ Estrutura

```
tests/e2e/
├── __screenshots__/          # Snapshots visuais (baseline)
├── home.spec.ts             # Testes da página inicial
├── sacola.spec.ts           # Testes da página do carrinho
├── favoritos.spec.ts        # Testes da lista de desejos
├── pdp.spec.ts              # Testes da página de produto
└── checkout.spec.ts         # Testes do checkout
```

## 🚀 Como executar

### Desenvolvimento local

1. **Build e start da aplicação:**
   ```bash
   npm run build
   npm run start
   ```

2. **Executar os testes:**
   ```bash
   # Com servidor já rodando
   BASE_URL=http://localhost:3000 npm run test:e2e
   
   # Ou deixar o Playwright gerenciar o servidor (modo dev)
   npm run test:e2e
   ```

3. **Executar com interface gráfica:**
   ```bash
   npx playwright test --ui
   ```

### Comandos úteis

```bash
# Executar testes específicos
npx playwright test home.spec.ts

# Executar em modo debug
npx playwright test --debug

# Executar com relatório HTML
npm run test:e2e:ci
npx playwright show-report

# Ver traces de execução
npx playwright show-trace test-results/[pasta-do-teste]/trace.zip
```

## 📸 Visual Snapshots

### Criando baseline inicial

⚠️ **Execute em `main` para criar a baseline oficial:**

```bash
# 1. Certifique-se de estar em main
git checkout main
git pull origin main

# 2. Gere os snapshots de referência
npm run build && npm run start &
BASE_URL=http://localhost:3000 npm run test:e2e:update

# 3. Commit da baseline
git add tests/e2e/__screenshots__
git commit -m "test: baseline visual snapshots"
git push
```

### Atualizando snapshots

Quando mudanças intencionais na UI são feitas:

```bash
# Atualizar todos os snapshots
npm run test:e2e:update

# Atualizar snapshots específicos
npx playwright test home.spec.ts --update-snapshots

# Revisar diferenças antes de atualizar
npx playwright test --reporter=html
npx playwright show-report
```

## 🔧 Configuração

### playwright.config.ts

- **Timeout:** 30s por teste, 5s para expects
- **Retries:** 2x no CI, 0x localmente  
- **Browser:** Chrome desktop (1366x900)
- **Snapshots:** Threshold de 0.3% para tolerância
- **Traces/Videos:** Apenas em falhas

### Variáveis de ambiente

Para desenvolvimento local, definir em `.env.local`:

```bash
BASE_URL=http://localhost:3000
NODE_ENV=production
```

## 🔍 Debugging

### Traces e videos

Quando um teste falha, são gerados:

- **Trace:** `test-results/[teste]/trace.zip`
- **Video:** `test-results/[teste]/video.webm` 
- **Screenshots:** `test-results/[teste]/test-failed-1.png`

```bash
# Ver trace interativo
npx playwright show-trace test-results/home-Home-Page-should-load-home-page-successfully-chromium/trace.zip
```

### Modo debug

```bash
# Abre browser com DevTools
npx playwright test --debug home.spec.ts

# Debug de um teste específico
npx playwright test --debug --grep "should load home page"
```

## 🎭 CI/CD

### GitHub Actions

Os testes rodam automaticamente:

- **Trigger:** PRs para `main` e pushes para `main`
- **Ambiente:** Ubuntu + Node 20 + Chromium
- **Artifacts:** HTML report e traces/videos em caso de falha

### Estratégia de falhas

1. **Flakiness:** Max 2 retries no CI
2. **Timeout:** 20min total por job
3. **Artifacts:** Mantidos por 7 dias
4. **Reports:** HTML sempre gerado, mesmo em sucesso

## 📊 Interpretando resultados

### Status de saída

- ✅ **0:** Todos os testes passaram
- ❌ **1:** Há testes falhando
- ⚠️ **2:** Alguns testes foram skipados

### Relatório HTML

```bash
npx playwright show-report
```

Mostra:
- Timeline de execução
- Screenshots de falhas
- Comparação de visual diffs
- Traces interativos

## 🛠️ Manutenção

### Quando atualizar snapshots

- ✅ Mudanças intencionais de design/layout
- ✅ Correções de bugs visuais  
- ✅ Novos componentes ou features
- ❌ Diferenças causadas por fonts/rendering do sistema
- ❌ Pequenas variações de pixels sem impacto

### Política de threshold

- **0.2%:** Componentes estáveis (header, footer)
- **0.3%:** Componentes com animações/3D
- **0.5%:** Páginas complexas (PDP, checkout)

Ajustar em `playwright.config.ts` conforme necessidade.

### Troubleshooting comum

**"Snapshot comparison failed":**
```bash
# Ver a diferença
npx playwright test --reporter=html
# Se legítima, atualizar
npx playwright test --update-snapshots
```

**"Timeout waiting for element":**
- Aumentar `actionTimeout` para elementos lentos
- Usar `page.waitForLoadState('networkidle')` para SPAs
- Adicionar `data-testid` se seletores forem instáveis

**"Browser not found":**
```bash
npx playwright install chromium
```

## 🔗 Links úteis

- [Playwright Docs](https://playwright.dev/)
- [Visual Comparisons](https://playwright.dev/docs/test-screenshots)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Best Practices](https://playwright.dev/docs/ci)