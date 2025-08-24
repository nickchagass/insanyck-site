# INSANYCK — Stripe Development Setup

## Overview

This guide explains how to set up Stripe CLI for local development testing, especially for webhook endpoints.

## Prerequisites

1. Stripe account (test mode)
2. Stripe CLI installed locally
3. Local development environment running on `http://localhost:3000`

## Installation

### Install Stripe CLI

**Windows:**
```bash
# Using Scoop
scoop install stripe

# Or download from https://github.com/stripe/stripe-cli/releases
```

**macOS:**
```bash
# Using Homebrew
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
# Download and install from GitHub releases
wget https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_x86_64.tar.gz
tar -xvf stripe_linux_x86_64.tar.gz
sudo mv stripe /usr/local/bin/
```

## Configuration

### 1. Login to Stripe

```bash
stripe login
```

This will open your browser to authenticate with your Stripe account.

### 2. Test the Installation

```bash
stripe --version
stripe config --list
```

## Webhook Development Setup

### 1. Start the Webhook Listener

In a separate terminal, run:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This command will:
- Listen for all Stripe events in your account
- Forward them to your local webhook endpoint
- Display a webhook signing secret (starts with `whsec_`)

### 2. Copy the Webhook Secret

From the output, copy the webhook signing secret and add it to your `.env.local`:

```bash
# Example output:
# > Ready! Your webhook signing secret is whsec_1234567890abcdef...

# Add to .env.local:
STRIPE_WEBHOOK_SECRET="whsec_1234567890abcdef..."
```

### 3. Required Environment Variables

Ensure these variables are set in your `.env.local`:

```bash
# Stripe Keys (from https://dashboard.stripe.com/test/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51..."  # Client-side (public)
STRIPE_SECRET_KEY="sk_test_51..."                    # Server-side (private)

# Webhook Secret (from stripe listen command)
STRIPE_WEBHOOK_SECRET="whsec_..."

# API Version (pinned for consistency)
STRIPE_API_VERSION="2025-07-30.basil"
```

## Testing Webhooks

### 1. Test Payment Flow

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. In another terminal, start the Stripe listener:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. Create a test checkout session through your app

4. Monitor the webhook events in the Stripe CLI terminal

### 2. Trigger Test Events

You can manually trigger webhook events for testing:

```bash
# Trigger a successful payment
stripe trigger checkout.session.completed

# Trigger a failed payment
stripe trigger payment_intent.payment_failed

# List all available events
stripe trigger --help
```

### 3. View Event Logs

```bash
# View recent events
stripe events list

# View specific event details
stripe events retrieve evt_1234567890
```

## Webhook Endpoint Details

**Endpoint:** `/api/stripe/webhook`
**Method:** `POST`
**Content-Type:** `application/json`

The webhook handler:
- Verifies the signature using `STRIPE_WEBHOOK_SECRET`
- Processes `checkout.session.completed` events
- Logs events in development mode
- Returns `{ received: true }` on success

## Common Events

| Event | Description | When it's triggered |
|-------|-------------|-------------------|
| `checkout.session.completed` | Checkout successful | Customer completes payment |
| `payment_intent.succeeded` | Payment confirmed | Payment is successfully processed |
| `invoice.payment_succeeded` | Invoice paid | Subscription or invoice payment |
| `customer.subscription.created` | New subscription | Customer subscribes to a plan |

## Development Workflow

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Start webhook listener:**
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. **Test payment flows:**
   - Use test card numbers (e.g., `4242424242424242`)
   - Complete checkout processes
   - Monitor webhook events in terminal

4. **Debug webhook issues:**
   ```bash
   # View webhook attempts
   stripe events list --type=checkout.session.completed
   
   # Retry failed webhook
   stripe events resend evt_1234567890
   ```

## Production Considerations

When deploying to production:

1. **Create production webhook endpoint** in Stripe Dashboard:
   - URL: `https://yourdomain.com/api/stripe/webhook`
   - Events: Select specific events you need

2. **Update environment variables:**
   - Use live keys (`pk_live_*`, `sk_live_*`)
   - Use production webhook secret from Dashboard

3. **Test thoroughly:**
   - Use live card processing in test mode first
   - Monitor webhook delivery in Stripe Dashboard

## Troubleshooting

### Common Issues

**"Webhook signature verification failed"**
- Ensure `STRIPE_WEBHOOK_SECRET` matches the CLI output
- Check that the raw body is being passed to `stripe.webhooks.constructEvent`

**"Connection refused"**
- Ensure Next.js dev server is running on port 3000
- Check that the webhook URL is correct

**"No webhook secret found"**
- Copy the secret from `stripe listen` output
- Restart your development server after adding the secret

### Debug Commands

```bash
# Check Stripe CLI configuration
stripe config --list

# Test webhook endpoint directly
curl -X POST localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# View recent webhook attempts
stripe events list --limit 10
```

## Resources

- [Stripe CLI Documentation](https://stripe.com/docs/stripe-cli)
- [Testing Webhooks](https://stripe.com/docs/webhooks/test)
- [Webhook Event Reference](https://stripe.com/docs/api/events/types)
- [Test Card Numbers](https://stripe.com/docs/testing#cards)