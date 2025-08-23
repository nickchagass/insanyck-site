# INSANYCK — Deploy Guide & Stripe Integration

## 📋 Pre-Deploy Checklist

### Environment Variables
Ensure all required variables are set in your deployment platform:

```bash
# Core Application
DATABASE_URL="postgresql://..." 
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-32-char-secret" # Generate: openssl rand -base64 32
NEXT_PUBLIC_URL="https://yourdomain.com"

# Stripe Integration (REQUIRED for Etapa 11)
STRIPE_PUBLISHABLE_KEY="pk_live_..." # Production keys
STRIPE_SECRET_KEY="sk_live_..."      # Keep secure!
STRIPE_WEBHOOK_SECRET="whsec_..."    # From webhook config
STRIPE_API_VERSION="2025-07-30.basil"

# Optional
NODE_ENV="production"
```

### Build Validation
```bash
npm run typecheck  # Check TypeScript
npm run build      # Production build
npm run start      # Test production server
```

## 🚀 Deployment Steps

### 1. Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables via dashboard or CLI:
vercel env add STRIPE_SECRET_KEY
vercel env add DATABASE_URL
# ... (add all required vars)

# Redeploy with env vars
vercel --prod
```

### 2. Other Platforms
- **Railway**: Connect GitHub, set env vars in dashboard
- **Render**: Auto-deploy from GitHub, configure build settings
- **Digital Ocean**: Use App Platform with environment variables

### 3. Stripe Webhook Configuration
After deploy, configure your webhook endpoint:

1. Go to https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## 🧪 Development Testing

### Local Stripe Webhook (Development)
```bash
# Install Stripe CLI
# Windows: scoop install stripe
# Mac: brew install stripe/stripe-cli/stripe
# Linux: https://stripe.com/docs/stripe-cli#install

# Login to Stripe
stripe login

# Start local webhook forwarding
stripe listen --forward-to http://localhost:3000/api/stripe/webhook

# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger payment_intent.payment_failed

# Expected: Orders created in DB, logs in console
```

### Production Testing (Safe Mode)
1. Use Stripe test keys in production initially
2. Test complete flow: add to cart → checkout → success
3. Verify orders appear in admin panel: `/admin/orders`
4. Check webhook logs in Stripe dashboard
5. Switch to live keys when ready

## 🔒 Security Considerations

### Environment Protection
- Never commit `.env.local` or `.env.production`
- Use different secrets for each environment
- Rotate `NEXTAUTH_SECRET` regularly

### Stripe Security
- Use webhook secrets for verification
- Never trust client-side price data
- All pricing comes from DB/Stripe
- Implement rate limiting if needed

## 📊 Monitoring & Logs

### Key Metrics to Monitor
- Checkout success rate
- Webhook processing time
- Database connection health
- Order creation failures

### Log Patterns to Watch
```bash
# Success patterns
[INSANYCK][ENV] Environment validation successful
[INSANYCK][Stripe] Initialized with API version: 2025-07-30.basil

# Error patterns
[INSANYCK][Checkout] Server environment not ready
[INSANYCK][Webhook] Server environment not ready
```

## 🔄 Updates & Maintenance

### Stripe API Version Updates
1. Test new version in development
2. Update `STRIPE_API_VERSION` in env
3. Monitor for breaking changes
4. Update webhook handling if needed

### Database Migrations
- Use Prisma migrations: `npx prisma migrate deploy`
- Backup before major schema changes
- Test in staging environment first

## 🆘 Troubleshooting

### Common Issues

**Build Fails**
- Check TypeScript errors: `npm run typecheck`
- Verify all environment variables are set
- Clear Next.js cache: `rm -rf .next`

**Webhook Not Working**
- Verify endpoint URL in Stripe dashboard
- Check webhook secret matches environment
- Review webhook logs in Stripe dashboard
- Ensure proper event selection

**Orders Not Creating**
- Check database connection
- Verify Prisma schema matches DB
- Review server logs for errors
- Test with Stripe CLI locally

---

**Support**: Check server logs and Stripe dashboard for detailed error messages.