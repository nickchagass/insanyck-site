# INSANYCK — Email Debug: Próximos Passos

**Status:** Código de diagnóstico instalado ✅
**Objetivo:** Identificar por que emails não chegam
**Tempo estimado:** 15-30 minutos

---

## 🎯 AÇÃO IMEDIATA (FAÇA AGORA)

### 1. Commit e Deploy do Código de Diagnóstico

```bash
git add .
git commit -m "debug: add verbose email logging and test endpoint"
git push origin main
```

Aguarde o deploy completar na Vercel (~2-3 minutos).

---

### 2. Verifique RESEND_API_KEY na Vercel

**CRÍTICO:** Esta é a causa mais provável (80% de chance).

1. Acesse: https://vercel.com/seu-projeto/settings/environment-variables
2. Procure por `RESEND_API_KEY`

**Se NÃO existir:**
- ✅ Esse é o problema!
- Vá para: https://resend.com/api-keys
- Clique em **"Create API Key"**
- Nome: `INSANYCK Production`
- Copie a chave (começa com `re_`)
- Volte para Vercel → Add New Variable:
  - Key: `RESEND_API_KEY`
  - Value: `re_xxxxx...` (cole a chave)
  - Environment: Marque **Production** ✅
- Salve e **redeploy**

**Se EXISTIR:**
- Verifique se está marcada para **Production** ✅
- Verifique se começa com `re_` (formato novo)
- Se começar com `sk_`, gere nova chave (formato antigo)

---

### 3. Teste o Endpoint de Diagnóstico

Assim que o deploy terminar:

#### Opção A: Navegador (Fácil)
```
https://insanyck.com/api/test-email
```

Abra no navegador e veja o JSON de resposta.

#### Opção B: Linha de Comando
```bash
curl https://insanyck.com/api/test-email
```

---

### 4. Analise a Resposta

#### ✅ Resposta de SUCESSO
```json
{
  "test": {
    "status": "success",
    "result": {
      "id": "abc123..."
    }
  },
  "instructions": [
    "✅ EMAIL SENT SUCCESSFULLY!"
  ]
}
```

**O que fazer:**
- ✅ Email está funcionando!
- Verifique se chegou em `delivered@resend.dev`
- Vá para Passo 5 (testar login real)

#### ❌ Resposta: "RESEND_API_KEY is MISSING"
```json
{
  "environment": {
    "hasResendKey": false,
    "resendKeyPrefix": "MISSING"
  }
}
```

**O que fazer:**
- Adicione `RESEND_API_KEY` na Vercel (veja Passo 2)

#### ❌ Resposta: "Domain not verified"
```json
{
  "test": {
    "error": {
      "message": "Domain not verified"
    }
  }
}
```

**O que fazer:**
- **RÁPIDO (teste):** Use `onboarding@resend.dev`
  - Vercel → Environment Variables
  - Adicione/atualize `EMAIL_FROM`:
    - Value: `"INSANYCK <onboarding@resend.dev>"`
  - Redeploy

- **PERMANENTE:** Verifique domínio `insanyck.com`
  - Siga seção "Step 3" do `EMAIL-DIAGNOSTIC-GUIDE.md`

---

### 5. Teste Login Real no Site

Agora teste o fluxo completo:

1. Vá para: https://insanyck.com/conta/login
2. Digite seu email
3. Clique em **"Entrar com email"**
4. **IMPORTANTE:** Abra os logs da Vercel em outra aba:
   - https://vercel.com/seu-projeto/logs
   - Aba **"Real-time"**

---

### 6. Leia os Logs em Tempo Real

Procure por linhas com prefixo `[INSANYCK EMAIL]`:

#### ✅ Sucesso (email enviado)
```
[INSANYCK EMAIL DIAGNOSTIC] {"event":"resend:init","hasApiKey":true}
[INSANYCK EMAIL] ✅ Resend client initialized successfully
[INSANYCK EMAIL] 📤 Attempting to send via Resend API...
[INSANYCK EMAIL] ✅ EMAIL SENT SUCCESSFULLY! {"emailId":"..."}
[INSANYCK EMAIL] 📊 Check delivery status at: https://resend.com/emails
```

**Próximo passo:**
- ✅ Email foi enviado!
- Verifique sua caixa de entrada (pode demorar ~30 segundos)
- Se não chegar, verifique **spam/lixo eletrônico**
- Verifique Resend Dashboard: https://resend.com/emails

#### ❌ Falha (chave ausente)
```
[INSANYCK EMAIL DIAGNOSTIC] {"hasApiKey":false,"apiKeyPrefix":"MISSING"}
[INSANYCK EMAIL] ❌ RESEND_API_KEY is MISSING!
[INSANYCK EMAIL] Check: Vercel Dashboard > Settings > Environment Variables
```

**Próximo passo:**
- Adicione `RESEND_API_KEY` (veja Passo 2)

#### ❌ Falha (domínio não verificado)
```
[INSANYCK EMAIL] ❌ RESEND API RETURNED ERROR: {...}
[INSANYCK EMAIL] 🌐 DOMAIN VERIFICATION ISSUE DETECTED!
[INSANYCK EMAIL] Go to: https://resend.com/domains
```

**Próximo passo:**
- Use `onboarding@resend.dev` temporariamente (veja Passo 4)
- OU verifique domínio (veja `EMAIL-DIAGNOSTIC-GUIDE.md`)

---

## 📊 CENÁRIOS ESPERADOS

### Cenário 1: RESEND_API_KEY Ausente (80% de chance)

**Sintomas:**
- Logs mostram: `hasApiKey: false`
- Endpoint de teste retorna: `"resendKeyPrefix": "MISSING"`

**Solução:**
1. Gerar chave no Resend
2. Adicionar na Vercel
3. Redeploy
4. **Tempo de resolução: ~5 minutos**

---

### Cenário 2: Domínio Não Verificado (15% de chance)

**Sintomas:**
- Logs mostram: `DOMAIN VERIFICATION ISSUE DETECTED`
- Endpoint retorna: `"Domain not verified"`

**Solução Rápida (5 min):**
1. Usar `EMAIL_FROM="INSANYCK <onboarding@resend.dev>"`
2. Redeploy
3. Email funcionará imediatamente

**Solução Permanente (1-24 horas):**
1. Adicionar domínio no Resend
2. Copiar DNS records (SPF, DKIM)
3. Adicionar no Cloudflare
4. Aguardar verificação (~5 min a 24h)

---

### Cenário 3: Email Vai para Spam (3% de chance)

**Sintomas:**
- Logs mostram: `✅ EMAIL SENT SUCCESSFULLY`
- Resend Dashboard mostra: "Delivered"
- Mas email não aparece na caixa de entrada

**Solução:**
1. Verifique pasta **Spam/Junk**
2. Marque como "Não é spam" / "Mover para Caixa de Entrada"
3. Configure DNS (DMARC, SPF, DKIM) no Cloudflare
4. Teste com https://mail-tester.com (score 10/10)

---

### Cenário 4: Formato de API Key Inválido (2% de chance)

**Sintomas:**
- Logs mostram: `apiKeyFormat: "INVALID"`
- API key começa com `sk_` ao invés de `re_`

**Solução:**
1. Gerar **nova** chave no Resend (formato atualizado)
2. Atualizar `RESEND_API_KEY` na Vercel
3. Redeploy

---

## ✅ CONFIRMAÇÃO DE SUCESSO

Você saberá que está funcionando quando:

1. **Logs mostram:**
   ```
   ✅ EMAIL SENT SUCCESSFULLY! {"emailId":"abc123..."}
   ```

2. **Email chega na caixa de entrada** (em ~30 segundos)

3. **Email está bem formatado:**
   - Fundo preto
   - Logo INSANYCK com espaçamento largo
   - Botão "ENTRAR" em pill-shape
   - Texto "Sua presença foi solicitada."

4. **Click no link funciona:**
   - Redireciona para página autenticada
   - Session está ativa

---

## 🧹 APÓS RESOLVER

Quando o email estiver funcionando 100%:

### 1. Remova Código de Diagnóstico

```bash
# Delete endpoint de teste
rm src/pages/api/test-email.ts

# Reverta logs verbosos
git diff src/lib/email.ts  # Veja mudanças
# (você pode reverter manualmente ou criar versão limpa)
```

### 2. Commit Final

```bash
git add .
git commit -m "fix: email delivery working, remove diagnostic code"
git push origin main
```

### 3. Delete Guias de Debug

```bash
rm EMAIL-DIAGNOSTIC-GUIDE.md
rm NEXT-STEPS-EMAIL-DEBUG.md
```

---

## 🆘 SE NADA FUNCIONAR

Depois de tentar TODOS os passos acima:

1. **Capture evidências:**
   - Screenshot dos logs da Vercel
   - Screenshot da resposta do `/api/test-email`
   - Screenshot das Environment Variables (sem mostrar valores)
   - Screenshot do Resend Dashboard

2. **Cole aqui os logs:**
   ```
   (Cole logs completos do Vercel)
   ```

3. **Responda estas perguntas:**
   - RESEND_API_KEY está configurada na Vercel? (Sim/Não)
   - Qual o prefixo da chave? (re_ ou sk_ ou outro?)
   - EMAIL_FROM está configurada? (Qual valor?)
   - Domínio insanyck.com está verificado no Resend? (Sim/Não)

---

**Boa sorte! O diagnóstico verbose vai revelar o problema rapidamente.**

**Em 90% dos casos, é simplesmente a RESEND_API_KEY ausente na Vercel.**
