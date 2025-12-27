# Subscription System - Quick Developer Guide

## For Frontend Developers

### Check User Subscription Status

**Web:**
```tsx
import { useSubscription } from '@/hooks/useSubscription';
// useSubscription uses ApiResponse<UserStats> for type-safe API calls

export function MyComponent() {
  const { status, isPro, isLoading, error } = useSubscription();
  
  if (isLoading) return <div>Loading...</div>;
  if (isPro) return <div>Pro features available!</div>;
  return <div>Free tier user</div>;
}
```

**Mobile:**
```tsx
import { useSubscription } from '@/hooks/useSubscription';
// useSubscription uses ApiResponse<UserStats> for type-safe API calls

export function MyScreen() {
  const { status, isPro, isLoading, error } = useSubscription();
  
  if (isLoading) return <ActivityIndicator />;
  if (isPro) return <ProContent />;
  return <FreeContent />;
}
```

### Gate Features Behind Paywall

**Web:**
```tsx
import { SubscriptionGate } from '@/components/SubscriptionGate';

export function AnalyticsPage() {
  return (
    <SubscriptionGate requiredPlan="pro">
      <AdvancedAnalytics />
    </SubscriptionGate>
  );
}
```

**Mobile:**
```tsx
import { SubscriptionGate } from '@/components/SubscriptionGate';

export function AnalyticsScreen() {
  return (
    <SubscriptionGate requiredPlan="pro">
      <AdvancedAnalytics />
    </SubscriptionGate>
  );
}
```

### Trigger Upgrade

```tsx
const { upgradeToPro } = useSubscription();

<button onClick={upgradeToPro}>
  Upgrade Now
</button>
```

### Custom Upsell UI

```tsx
<SubscriptionGate 
  requiredPlan="pro"
  fallback={<CustomPaywall />}
>
  <ProFeature />
</SubscriptionGate>
```

---

## For Backend Developers

### Verify Webhook Processing

The webhook automatically handles:
- ✅ `customer.subscription.created` → Update `user_stats.subscription_status = 'pro'`
- ✅ `customer.subscription.updated` → Update status based on subscription state
- ✅ `customer.subscription.deleted` → Update `user_stats.subscription_status = 'free'`

### Check Subscription in Route

```typescript
import { authenticate } from '../middleware/auth';
import { supabase } from '../index';

router.get('/pro-only', authenticate, async (req, res) => {
  const userId = req.user?.id;
  
  const { data: stats } = await supabase
    .from('user_stats')
    .select('subscription_status')
    .eq('user_id', userId)
    .single();
  
  if (stats?.subscription_status === 'pro') {
    return res.json({ success: true, data: { message: 'Access granted' } });
  }
  
  return res.status(403).json({ 
    success: false, 
    error: { code: 'FORBIDDEN', message: 'Pro subscription required' }
  });
});
```

### Test Webhook Locally

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run: `stripe listen --forward-to localhost:3000/api/billing/webhook`
3. Trigger event: `stripe trigger customer.subscription.created`
4. Verify it prints in your terminal and API logs

---

## Environment Variables Needed

Add to `.env`:

```dotenv
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx_or_sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
APP_URL=http://localhost:3000  # or production domain
```

---

## Type Definitions

```typescript
// From @metalmaster/shared-types
type SubscriptionStatus = 'free' | 'pro' | 'trial' | 'lifetime';

interface UserStats {
  user_id: string;
  total_xp: number;
  level: number;
  subscription_status: SubscriptionStatus;  // ← NEW
  // ... other fields
}
```

---

## Common Tasks

### Add New Pro Feature

1. Create component/page
2. Wrap with SubscriptionGate:
   ```tsx
   <SubscriptionGate requiredPlan="pro">
     <NewFeature />
   </SubscriptionGate>
   ```
3. Done! Users see upsell if not pro

### Check Subscription in Code

```tsx
const { isPro } = useSubscription();
if (isPro) {
  // Show pro feature
}
```

### Allow Free Users Limited Access

Set `requiredPlan="free"` (shows feature to everyone):
```tsx
<SubscriptionGate requiredPlan="free">
  <Feature />
</SubscriptionGate>
```

---

## API Endpoints

### Create Checkout Session
```
POST /api/billing/create-checkout-session
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": { "url": "https://checkout.stripe.com/..." },
  "meta": { "timestamp": "...", "version": "1.0.0" }
}
```

### Create Billing Portal Session
```
POST /api/billing/create-portal-session
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": { "url": "https://billing.stripe.com/..." },
  "meta": { "timestamp": "...", "version": "1.0.0" }
}
```

### Get User Stats (includes subscription)
```
GET /api/user-stats
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "user_id": "...",
    "total_xp": 1000,
    "subscription_status": "pro",
    // ... other fields
  },
  "meta": { ... }
}
```

---

## Testing Stripe Locally

### Test Card Numbers
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Expiry: Any future date (e.g., `12/25`)
CVC: Any 3 digits

### Test Webhook

```bash
# Start listening
stripe listen --forward-to localhost:3000/api/billing/webhook

# In another terminal, trigger event
stripe trigger customer.subscription.created

# Watch logs for webhook processing
```

---

## Debugging

### Check Supabase Update
```sql
SELECT user_id, subscription_status, updated_at 
FROM user_stats 
WHERE user_id = 'your-user-id'
ORDER BY updated_at DESC 
LIMIT 1;
```

### Check Stripe Webhook Events
Stripe Dashboard → Developers → Webhooks → View events

### Check API Logs
```bash
# API is running with request-logger middleware
# Should see POST /api/billing/webhook logged
yarn workspace @metalmaster/api dev
```

### Check Frontend Hook
```tsx
const { status, isPro, error } = useSubscription();
console.log('Subscription:', { status, isPro, error });
```

---

## Key Files Reference

- **Backend routes**: `packages/api/src/routes/billing.*`
- **Web hook**: `packages/web/src/hooks/useSubscription.ts`
- **Web gate**: `packages/web/src/components/SubscriptionGate.tsx`
- **Mobile hook**: `packages/mobile/src/hooks/useSubscription.ts`
- **Mobile gate**: `packages/mobile/src/components/SubscriptionGate.tsx`
- **Types**: `packages/shared-types/src/user-stats.types.ts`
- **Schemas**: `packages/shared-validation/src/user-stats.schemas.ts`

---

**Questions?** Check the full implementation guide at: `STRIPE_SUBSCRIPTION_IMPLEMENTATION.md`
