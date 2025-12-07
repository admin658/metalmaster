# Subscription Implementation - Quick Reference

## 🎯 What Was Built

| Component | Location | Status |
|-----------|----------|--------|
| Web Subscription Hook | `packages/web/src/hooks/useSubscription.ts` | ✅ |
| Web Gate Component | `packages/web/src/components/SubscriptionGate.tsx` | ✅ |
| Mobile Subscription Hook | `packages/mobile/src/hooks/useSubscription.ts` | ✅ |
| Mobile Gate Component | `packages/mobile/src/components/SubscriptionGate.tsx` | ✅ |
| API Billing Routes | `packages/api/src/routes/billing.routes.ts` | ✅ (prev) |
| Stripe Webhook Handler | `packages/api/src/routes/billing.webhook.ts` | ✅ (prev) |
| Web Integration Guide | `SUBSCRIPTION_GATE_WEB_INTEGRATION.md` | ✅ |
| Mobile Integration Guide | `SUBSCRIPTION_GATE_MOBILE_INTEGRATION.md` | ✅ |
| Implementation Checklist | `SUBSCRIPTION_IMPLEMENTATION_SUMMARY.md` | ✅ |

## 🚀 Quick Start Integration (5 min)

### 1. Wrap a Premium Page (Web)
```tsx
// packages/web/src/app/stats/page.tsx
import { SubscriptionGate } from '@/components/SubscriptionGate';
import StatsContent from '@/components/stats/StatsContent';

export default function StatsPage() {
  return (
    <SubscriptionGate requiredTier="pro">
      <StatsContent />
    </SubscriptionGate>
  );
}
```

### 2. Wrap a Premium Screen (Mobile)
```tsx
// packages/mobile/src/screens/SpeedTrainerScreen.tsx
import { SubscriptionGate } from '../components/SubscriptionGate';
import SpeedTrainerContent from '../components/SpeedTrainerContent';

export default function SpeedTrainerScreen() {
  return (
    <SubscriptionGate requiredTier="pro">
      <SpeedTrainerContent />
    </SubscriptionGate>
  );
}
```

### 3. Add Environment Variables
```bash
# .env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID=price_...

# .env.local (web)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# app.json (mobile)
{
  "expo": {
    "extra": { "apiUrl": "http://localhost:3000/api" }
  }
}
```

### 4. Verify Database
```sql
-- Ensure user_stats has subscription_status column
SELECT column_name FROM information_schema.columns 
WHERE table_name='user_stats' AND column_name='subscription_status';

-- If missing, run:
-- ALTER TABLE user_stats ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'free';
```

## 📊 User Flow

```
Free User              Pro User
│                      │
├─ Visits /stats       ├─ Visits /stats
├─ Gate checks status  ├─ Gate checks status
│  (returns 'free')    │  (returns 'pro')
├─ Shows Upsell Modal  ├─ Shows Stats Page
├─ Clicks Upgrade      └─ Sees all features
├─ Goes to Stripe      
├─ Completes Payment   
├─ Webhook Updates DB  
│  (status → 'pro')    
└─ Refreshes Page      
   └─ Now sees Stats!  
```

## 🔧 Hooks API

### `useSubscription()` 
```typescript
const { status, isLoading, error } = useSubscription();
// status: 'free' | 'pro'
// isLoading: boolean (fetching from API)
// error: string | null
// Uses ApiResponse<UserStats> for type-safe API calls
```

### `useCheckout()`
```typescript
const { startCheckout, isLoading, error } = useCheckout();
// startCheckout: async () => void
// isLoading: boolean
// error: string | null

// Usage:
// <button onClick={startCheckout}>Upgrade</button>
```

## 🎨 Component API

### `<SubscriptionGate />`
```tsx
<SubscriptionGate
  requiredTier="pro"           // required: 'free' | 'pro'
  fallback={<CustomUpsell />}  // optional: custom upsell UI
>
  <PremiumFeature />
</SubscriptionGate>
```

## ✅ Verification Checklist

- [ ] Web builds: `yarn workspace @metalmaster/web build`
- [ ] API builds: `yarn workspace @metalmaster/api build`
- [ ] Free user sees upsell on premium page
- [ ] Upsell button works (opens Stripe)
- [ ] Stripe test checkout completes
- [ ] Webhook fires and updates DB
- [ ] Pro user sees full feature after refresh
- [ ] Mobile gate works (tap Upgrade → opens Stripe in browser)

## 📍 File Locations

**Core Files:**
- Web Hook: `packages/web/src/hooks/useSubscription.ts`
- Web Gate: `packages/web/src/components/SubscriptionGate.tsx`
- Mobile Hook: `packages/mobile/src/hooks/useSubscription.ts`
- Mobile Gate: `packages/mobile/src/components/SubscriptionGate.tsx`

**Documentation:**
- Web Examples: `SUBSCRIPTION_GATE_WEB_INTEGRATION.md`
- Mobile Examples: `SUBSCRIPTION_GATE_MOBILE_INTEGRATION.md`
- Full Checklist: `SUBSCRIPTION_IMPLEMENTATION_SUMMARY.md`

**API (Previous Commits):**
- Routes: `packages/api/src/routes/billing.routes.ts`
- Webhook: `packages/api/src/routes/billing.webhook.ts`

## 🔑 Stripe Setup (5 min)

1. Get API keys from [stripe.com/dashboard](https://stripe.com/dashboard)
   - Secret: `sk_test_...` or `sk_live_...`
   - Publishable: `pk_test_...` or `pk_live_...`
   - Webhook Secret: [Developers → Webhooks]

2. Create Price
   - Product: "Metal Master Pro"
   - Price: e.g., $9.99/month
   - Copy Price ID: `price_...`

3. Configure Webhook
   - Endpoint: `https://your-api/api/billing/webhook`
   - Events: `customer.subscription.created`, `customer.subscription.updated`

4. Add to `.env`
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   STRIPE_PRICE_ID=price_...
   ```

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Cannot fetch subscription" | Check `NEXT_PUBLIC_API_URL` or `REACT_APP_API_URL` |
| Free user not seeing upsell | Verify `useSubscription()` returns 'free' (check Network tab) |
| Stripe button doesn't open | Check `.env` has `STRIPE_PRICE_ID` |
| Webhook not updating DB | Check Stripe webhook signature (`STRIPE_WEBHOOK_SECRET`) |
| Mobile shows blank screen | Verify Expo environment has `apiUrl` in app.json |

## 📚 Read Next

1. **Implementation Summary:** `SUBSCRIPTION_IMPLEMENTATION_SUMMARY.md` (detailed checklist)
2. **Web Integration Examples:** `SUBSCRIPTION_GATE_WEB_INTEGRATION.md` (5 page examples)
3. **Mobile Integration Examples:** `SUBSCRIPTION_GATE_MOBILE_INTEGRATION.md` (5 screen examples)

---

**Created:** Nov 25, 2025 | **Status:** Ready for Integration | **Commits:** 9fc6031, 89f2ff1, 2d70ad4
