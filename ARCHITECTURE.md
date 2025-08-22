## Rotas principais
- /, /loja, /produto/[slug], /checkout, /conta/*, /favoritos, /buscar

## Arquivos-chave reais
- i18n: `next-i18next.config.js`
- Stripe server: `src/lib/stripeServer.ts` (lê STRIPE_API_VERSION do .env)
- Estilos: `src/styles/globals.css`
- Páginas: `src/pages/**`
