# Stripe Subscription Implementation - Deployment Checklist

## Pre-Deployment Configuration

### Stripe Setup
- [ ] Create Stripe account at https://stripe.com
- [ ] Get API keys from Stripe Dashboard → Developers → API Keys
  - [ ] Copy "Secret Key" (starts with `sk_test_` or `sk_live_`)
  - [ ] Copy "Publishable Key" (starts with `pk_test_` or `pk_live_`)
- [ ] Create subscription product:
  - [ ] Go to Products → Create Product
  - [ ] Name: "Metal Master Pro"
  - [ ] Type: Service
  - [ ] Create a monthly price
  - [ ] Copy Price ID (starts with `price_`)
- [ ] Set up webhook:
  - [ ] Go to Developers → Webhooks → Add endpoint
  - [ ] Endpoint URL: `https://yourdomain.com/api/billing/webhook`
  - [ ] Select events:
    - [ ] `customer.subscription.created`
    - [ ] `customer.subscription.updated`
    - [ ] `customer.subscription.deleted`
  - [ ] Copy "Signing Secret" (starts with `whsec_`)

### Database Configuration
- [ ] Verify Supabase `user_stats` table has `subscription_status` column
- [ ] Column type: `enum` with values: `['free', 'pro', 'trial', 'lifetime']`
- [ ] Column default: `'free'`
- [ ] Update RLS policy to allow webhook updates (if needed)

### Environment Variables - Development

**File: `packages/api/.env`**
```dotenv
STRIPE_SECRET_KEY=sk_test_51234567890
STRIPE_WEBHOOK_SECRET=whsec_test_1234567890
STRIPE_PRICE_PRO_MONTHLY=price_1234567890
APP_URL=http://localhost:3000
```

**File: `.env` (root)**
```dotenv
STRIPE_SECRET_KEY=sk_test_51234567890
STRIPE_WEBHOOK_SECRET=whsec_test_1234567890
STRIPE_PRICE_PRO_MONTHLY=price_1234567890
APP_URL=http://localhost:3000
```

### Environment Variables - Production

**File: `packages/api/.env.production`**
```dotenv
STRIPE_SECRET_KEY=sk_live_51234567890
STRIPE_WEBHOOK_SECRET=whsec_live_1234567890
STRIPE_PRICE_PRO_MONTHLY=price_1234567890
APP_URL=https://yourdomain.com
```

---

## Testing Checklist

### Local Testing with Stripe Test Mode

#### 1. Backend
- [ ] Start API: `yarn workspace @metalmaster/api dev`
- [ ] Install Stripe CLI: https://stripe.com/docs/stripe-cli
- [ ] Start webhook listener: `stripe listen --forward-to localhost:3000/api/billing/webhook`
- [ ] Test endpoint:
  ```bash
  curl -X POST http://localhost:3000/api/billing/create-checkout-session \
    -H "Authorization: Bearer YOUR_TEST_TOKEN" \
    -H "Content-Type: application/json"
  ```
  - [ ] Response has `success: true`
  - [ ] Response has `data.url` with Stripe checkout URL
- [ ] Test webhook:
  ```bash
  stripe trigger customer.subscription.created
  ```
  - [ ] Webhook event received in terminal
  - [ ] No errors in API logs

#### 2. Web Frontend
- [ ] Start web: `yarn workspace @metalmaster/web dev`
- [ ] Navigate to: http://localhost:3001/stats
  - [ ] Should see SubscriptionGate with "Upgrade to Pro" button (if not authenticated as pro)
  - [ ] Loading spinner should appear briefly
- [ ] Click "Upgrade to Pro"
  - [ ] Redirected to Stripe checkout
  - [ ] Stripe logo visible
- [ ] Use test card: `4242 4242 4242 4242`
  - [ ] Expiry: 12/25
  - [ ] CVC: 123
  - [ ] Complete payment
  - [ ] Redirected to `/billing/success`
- [ ] Navigate back to stats
  - [ ] Content should now be visible (subscription updated)

#### 3. Mobile Frontend
- [ ] Start mobile: `yarn workspace @metalmaster/mobile start`
- [ ] Open in Expo Go or iOS simulator
- [ ] Navigate to Stats screen
  - [ ] Should see SubscriptionGate with "Upgrade to Pro" button
  - [ ] Loading indicator should appear briefly
- [ ] Tap "Upgrade to Pro"
  - [ ] Should open Stripe checkout in browser
  - [ ] Use test card: `4242 4242 4242 4242`
  - [ ] Complete payment
- [ ] Return to app
  - [ ] Re-fetch data
  - [ ] Stats content should be visible

### Test Cases

#### Case 1: Free User Tries to Access Pro Feature
- [ ] Expected: SubscriptionGate shows upsell UI
- [ ] Expected: "Upgrade to Pro" button is clickable
- [ ] Actual: ✅ / ❌

#### Case 2: User Upgrades to Pro
- [ ] Expected: Stripe checkout appears
- [ ] Expected: Payment succeeds with test card
- [ ] Expected: Webhook updates subscription status
- [ ] Expected: SubscriptionGate shows protected content
- [ ] Actual: ✅ / ❌

#### Case 3: User Manages Billing
- [ ] Expected: Click "Manage Billing" opens portal
- [ ] Expected: Can view subscription in Stripe portal
- [ ] Actual: ✅ / ❌

#### Case 4: Webhook Processing
- [ ] Expected: `customer.subscription.created` → status = 'pro'
- [ ] Expected: `customer.subscription.updated` → status updated
- [ ] Expected: `customer.subscription.deleted` → status = 'free'
- [ ] Actual: ✅ / ❌

#### Case 5: Error Handling
- [ ] Expected: Invalid token → 401 error
- [ ] Expected: Invalid stripe key → 500 error with proper message
- [ ] Expected: Network error → graceful fallback
- [ ] Actual: ✅ / ❌

---

## Production Deployment Steps

### 1. Switch to Live Stripe Keys
- [ ] Update `packages/api/.env.production` with `sk_live_*` keys
- [ ] Update deployment platform environment variables
- [ ] Ensure webhook secret is updated in deployment

### 2. Deploy Backend
```bash
yarn workspace @metalmaster/api build
# Deploy dist/ folder to production
```
- [ ] API is running
- [ ] Health check: `GET /health` returns 200
- [ ] Webhook endpoint is accessible: `POST /api/billing/webhook`

### 3. Deploy Web
```bash
yarn workspace @metalmaster/web build
yarn workspace @metalmaster/web start
```
- [ ] Stats page loads
- [ ] Subscription gate works
- [ ] Checkout button redirects to Stripe (live)

### 4. Deploy Mobile
```bash
yarn workspace @metalmaster/mobile build
```
- [ ] App builds without errors
- [ ] Upload to App Store / Google Play
- [ ] Test on real devices

### 5. Configure Stripe Webhook
- [ ] Update webhook URL in Stripe Dashboard to production domain
- [ ] Test webhook delivery from Stripe Dashboard
- [ ] Verify events are processed in production logs

### 6. Monitor
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Monitor webhook processing in logs
- [ ] Check for failed subscription updates
- [ ] Monitor Stripe events dashboard

---

## Post-Deployment Verification

### 1. Live Payment Test
- [ ] Create test account in production
- [ ] Navigate to pro feature
- [ ] Complete actual Stripe payment with real payment method
- [ ] Verify subscription status updated in database
- [ ] Verify feature access granted

### 2. Webhook Verification
- [ ] Wait for Stripe webhook delivery
- [ ] Check API logs for webhook processing
- [ ] Verify `user_stats.subscription_status` changed
- [ ] Check Stripe Events dashboard shows 200 response

### 3. User Communication
- [ ] Email sent to user confirming subscription (configured in Stripe)
- [ ] Customer receipt link works
- [ ] Billing portal accessible from app

---

## Common Issues & Solutions

### Issue: Webhook Not Processing

**Symptoms:**
- Subscription created but `user_stats.subscription_status` still 'free'
- No webhook logs in API

**Solutions:**
1. [ ] Check webhook secret in `.env` matches Stripe Dashboard
2. [ ] Verify webhook endpoint URL is correct and accessible
3. [ ] Check API logs: `yarn workspace @metalmaster/api dev 2>&1 | grep webhook`
4. [ ] Use Stripe CLI to test: `stripe trigger customer.subscription.created`
5. [ ] Check Stripe Events Dashboard for errors
6. [ ] Verify Supabase RLS allows webhook user to update `user_stats`

### Issue: Checkout Redirect Not Working

**Symptoms:**
- Click upgrade button but nothing happens
- Error in browser console

**Solutions:**
1. [ ] Check `STRIPE_SECRET_KEY` is set and valid
2. [ ] Check `STRIPE_PRICE_PRO_MONTHLY` is set and valid
3. [ ] Verify auth token is being sent in Authorization header
4. [ ] Check API response: `curl -X POST http://localhost:3000/api/billing/create-checkout-session -H "Authorization: Bearer YOUR_TOKEN"`
5. [ ] Verify response has `data.url` field

### Issue: SubscriptionGate Always Shows Upsell

**Symptoms:**
- Even after upgrading, gate still shows free tier UI
- `isPro` is always false

**Solutions:**
1. [ ] Check subscription_status updated in Supabase
2. [ ] Check API `/user-stats` returns correct subscription_status
3. [ ] Hard refresh browser (Ctrl+Shift+Delete)
4. [ ] Clear browser cache
5. [ ] Check useSubscription hook fetches fresh data (uses `ApiResponse<UserStats>` with proper type safety)
6. [ ] Verify auth token is valid and user_id matches

---

## Rollback Plan

If critical issues occur:

### Immediate Actions
1. [ ] Disable subscription checks in SubscriptionGate (set all to `requiredPlan="free"`)
2. [ ] Disable webhook processing (comment out in `billing.webhook.ts`)
3. [ ] Communicate with users
4. [ ] Roll back to previous deployment

### Investigation
1. [ ] Check API logs for errors
2. [ ] Check Supabase query logs
3. [ ] Check Stripe Events dashboard for webhook failures
4. [ ] Check application error tracking (Sentry, etc.)

### Fix & Redeploy
1. [ ] Fix identified issue
2. [ ] Test locally with Stripe CLI
3. [ ] Deploy to staging for verification
4. [ ] Deploy to production
5. [ ] Re-enable features gradually

---

## Monitoring & Maintenance

### Weekly
- [ ] Check Stripe Events dashboard for failed webhooks
- [ ] Monitor API error logs
- [ ] Check webhook processing latency
- [ ] Verify subscription status accuracy

### Monthly
- [ ] Review subscription metrics (MRR, churn, etc.)
- [ ] Check for performance issues
- [ ] Update Stripe test cards if expired
- [ ] Review user feedback on upgrade flow

### Quarterly
- [ ] Review Stripe fees and pricing
- [ ] Analyze conversion funnel
- [ ] A/B test messaging if needed
- [ ] Update documentation

---

## Support Contacts

- **Stripe Support**: https://support.stripe.com
- **Supabase Support**: https://supabase.com/support
- **API Logs**: `packages/api/src/middleware/request-logger.ts`
- **Error Tracking**: Configure Sentry or similar

---

**Last Updated:** November 25, 2025  
**Status:** ✅ Ready for Production
