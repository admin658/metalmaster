# Stripe Subscription Billing Implementation - Complete

## Overview

Full **Stripe subscription billing** and **subscription gating** has been successfully implemented across the Metal Master monorepo (backend API, web app, and mobile app). All components use the standardized API response format and type-safe patterns.

---

## 1. BACKEND (packages/api)

### 1.1 Billing Routes

**File:** `packages/api/src/routes/billing.routes.ts`

**Endpoints:**

- `POST /api/billing/create-checkout-session` - Creates Stripe checkout session
- `POST /api/billing/create-portal-session` - Creates Stripe billing portal session

**Features:**

- Both endpoints require `authenticate` middleware
- Standardized API response format: `{ success, data, meta }`
- User ID from authenticated session included in metadata
- Redirects use environment variables `STRIPE_PRICE_PRO_MONTHLY` and `APP_URL`

**Response Format:**

```typescript
{
  "success": true,
  "data": { "url": "https://checkout.stripe.com/..." },
  "meta": { "timestamp": "2025-11-25T...", "version": "1.0.0" }
}
```

### 1.2 Billing Webhook

**File:** `packages/api/src/routes/billing.webhook.ts`

**Events Handled:**

- `customer.subscription.created` - Upgrade user to 'pro'
- `customer.subscription.updated` - Update subscription status
- `customer.subscription.deleted` - Downgrade user to 'free'

**Features:**

- Verifies Stripe webhook signature using `STRIPE_WEBHOOK_SECRET`
- Extracts `userId` from subscription metadata
- Updates Supabase `user_stats.subscription_status` enum
- Proper error logging and status handling
- Distinguishes between 'active', 'trialing', and cancelled subscriptions

### 1.3 API Registration

**File:** `packages/api/src/index.ts`

**Setup:**

- Webhook route registered **BEFORE** JSON parser for Stripe signature verification
- Billing routes registered at `/api/billing`
- All routes properly typed and error-handled

---

## 2. SHARED TYPES & VALIDATION

### 2.1 Types

**File:** `packages/shared-types/src/user-stats.types.ts`

**New Type:**

```typescript
export type SubscriptionStatus = 'free' | 'pro' | 'trial' | 'lifetime';
```

**Updated Interface:**

```typescript
export interface UserStats {
  // ... existing fields
  subscription_status: SubscriptionStatus;
}
```

### 2.2 Validation Schemas

**File:** `packages/shared-validation/src/user-stats.schemas.ts`

**New Schema:**

```typescript
export const SubscriptionStatusSchema = z
  .enum(['free', 'pro', 'trial', 'lifetime'])
  .default('free');
```

**Updated Schema:**

```typescript
export const UserStatsSchema = z.object({
  // ... existing fields
  subscription_status: SubscriptionStatusSchema,
});
```

---

## 3. WEB CLIENT (packages/web)

### 3.1 useSubscription Hook

**File:** `packages/web/src/hooks/useSubscription.ts`

**Features:**

- Fetches subscription status from `/api/user-stats` via SWR pattern with proper type safety (`ApiResponse<UserStats>`)
- Returns: `{ status, isPro, isLoading, error, upgradeToPro, manageBilling }`
- `isPro` computed property: `status === 'pro' || status === 'lifetime'`
- `upgradeToPro()` - Redirects to Stripe checkout
- `manageBilling()` - Redirects to Stripe billing portal
- Error handling with proper type checking (`instanceof Error`)

**Return Type:**

```typescript
export interface UseSubscriptionReturn {
  status: SubscriptionStatus;
  isPro: boolean;
  isLoading: boolean;
  error: string | null;
  upgradeToPro: () => Promise<void>;
  manageBilling: () => Promise<void>;
}
```

### 3.2 SubscriptionGate Component

**File:** `packages/web/src/components/SubscriptionGate.tsx`

**Props:**

- `requiredPlan: 'free' | 'pro'` - Feature gate tier
- `children: React.ReactNode` - Protected content
- `fallback?: React.ReactNode` - Optional custom upsell UI

**Behavior:**

- Free tier always has access to 'free' content
- Pro/lifetime users have access to 'pro' content
- Free users see upsell panel with benefits list
- Loading state shows spinner
- Upgrade button calls `upgradeToPro()`

**Styling:**

- Tailwind-based dark theme (metal aesthetic)
- Red accent color (`#dc2626`)
- Responsive grid layout
- Benefits list with checkmarks

### 3.3 Page Gates

**Files Modified:**

- `packages/web/src/app/stats/page.tsx` - Wrapped with `<SubscriptionGate requiredPlan="pro">`
- `packages/web/src/app/speed-trainer/page.tsx` - Wrapped with `<SubscriptionGate requiredPlan="pro">`

---

## 4. MOBILE CLIENT (packages/mobile)

### 4.1 useSubscription Hook

**File:** `packages/mobile/src/hooks/useSubscription.ts`

**Features:**

- Fetches subscription status from `/api/user-stats` with proper type safety (`ApiResponse<UserStats>`)
- Uses `SecureStore` for auth token retrieval
- Returns: `{ status, isPro, isLoading, error, upgradeToPro, manageBilling }`
- `isPro` computed property: `status === 'pro' || status === 'lifetime'`
- `upgradeToPro()` - Uses `Linking.openURL()` to open Stripe checkout in browser
- `manageBilling()` - Uses `Linking.openURL()` to open billing portal
- Error handling with proper type checking (`instanceof Error`)

**Return Type:**

```typescript
export interface UseSubscriptionReturn {
  status: SubscriptionStatus;
  isPro: boolean;
  isLoading: boolean;
  error: string | null;
  upgradeToPro: () => Promise<void>;
  manageBilling: () => Promise<void>;
}
```

### 4.2 SubscriptionGate Component

**File:** `packages/mobile/src/components/SubscriptionGate.tsx`

**Props:**

- `requiredPlan: 'free' | 'pro'` - Feature gate tier
- `children: React.ReactNode` - Protected content
- `fallback?: React.ReactNode` - Optional custom upsell UI

**Behavior:**

- Free tier always has access to 'free' content
- Pro/lifetime users have access to 'pro' content
- Free users see upsell panel with benefits list
- Loading state shows `ActivityIndicator`
- Upgrade button calls `upgradeToPro()`

**Styling:**

- React Native StyleSheet (dark theme)
- Red accent color (`#dc2626`)
- ScrollView for content scrollability
- Benefits list with checkmarks

### 4.3 Screen Gates

**Files Modified:**

- `packages/mobile/src/screens/StatsScreen.tsx` - Wrapped content with `<SubscriptionGate requiredPlan="pro">`
- `packages/mobile/src/screens/SpeedTrainerScreen.tsx` - Wrapped content with `<SubscriptionGate requiredPlan="pro">`

---

## 5. ENVIRONMENT VARIABLES

### 5.1 Root .env (`f:\metalmaster\.env`)

```dotenv
# Add this to your .env file (do not commit .env to git)
STRIPE_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX  # Place your Stripe secret key in a .env file (never commit to git)
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
APP_URL=https://metalmasterapp.com
```

### 5.2 API .env (`packages/api/.env`)

```dotenv
STRIPE_SECRET_KEY=sk_test_51SbOdrJyNnFGCer3qoNkxbfmpLCBNgXxiP0RMoRA6GmA1E2U6rW0Wr91Kil5CA4MYEAA4A1aSZWBCRMlFxv6v0YW00ionNIDQV
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_PRO_MONTHLY=price_xxx
APP_URL=http://localhost:3000
```

**To Update for Production:**

1. Get Stripe API keys from Stripe Dashboard
2. Set `sk_live_*` for production or `sk_test_*` for testing
3. Configure webhook secret from Stripe Webhooks settings
4. Set product price ID (must be subscription mode)
5. Configure APP_URL to your domain

---

## 6. DATABASE INTEGRATION

### 6.1 Supabase Table

**Table:** `public.user_stats`

**Column:**

```sql
subscription_status ENUM ('free', 'pro', 'trial', 'lifetime') DEFAULT 'free'
```

**Webhook Updates:**

- When Stripe sends webhook events, this field is updated
- Checked by all client apps via `/api/user-stats` endpoint
- Used by `useSubscription` hook to determine access

---

## 7. DATA FLOW

### 7.1 Upgrade Flow

```
User clicks "Upgrade to Pro"
  ↓
upgradeToPro() called
  ↓
POST /api/billing/create-checkout-session
  ↓
API creates Stripe checkout session with userId in metadata
  ↓
Returns checkout URL in response
  ↓
Client redirects to Stripe Checkout
  ↓
User completes payment
  ↓
Stripe sends webhook to /api/billing/webhook
  ↓
Webhook verifies signature and updates user_stats.subscription_status = 'pro'
  ↓
useSubscription hook detects change on next fetch
  ↓
SubscriptionGate component updates and grants access
```

### 7.2 Managed Billing Flow

```
User clicks "Manage Billing"
  ↓
manageBilling() called
  ↓
POST /api/billing/create-portal-session
  ↓
API creates Stripe portal session
  ↓
Returns portal URL in response
  ↓
Client opens billing portal
  ↓
User can view/update subscription from Stripe UI
```

---

## 8. TESTING CHECKLIST

### Backend

- [ ] `POST /api/billing/create-checkout-session` returns `{ success, data.url, meta }`
- [ ] `POST /api/billing/create-portal-session` returns `{ success, data.url, meta }`
- [ ] Webhook endpoint verifies Stripe signature
- [ ] Webhook updates `user_stats.subscription_status` on events
- [ ] Auth middleware validates JWT tokens

### Web

- [ ] `useSubscription()` hook fetches data correctly
- [ ] `isPro` property returns true for 'pro' and 'lifetime' statuses
- [ ] SubscriptionGate shows children for authorized users
- [ ] SubscriptionGate shows upsell for free users
- [ ] "Upgrade to Pro" button redirects to Stripe checkout
- [ ] Stats page is gated to 'pro' users
- [ ] Speed trainer page is gated to 'pro' users

### Mobile

- [ ] `useSubscription()` hook fetches data correctly
- [ ] `isPro` property returns true for 'pro' and 'lifetime' statuses
- [ ] SubscriptionGate shows children for authorized users
- [ ] SubscriptionGate shows upsell for free users
- [ ] "Upgrade to Pro" button opens Stripe checkout in browser
- [ ] Stats screen is gated to 'pro' users
- [ ] Speed trainer screen is gated to 'pro' users

---

## 9. DEPLOYMENT NOTES

### Before Going Live

1. **Create Stripe Product:**

   - Go to Stripe Dashboard → Products
   - Create subscription product "Metal Master Pro"
   - Add monthly price
   - Copy Price ID to `STRIPE_PRICE_PRO_MONTHLY`

2. **Set Up Webhook:**

   - Stripe Dashboard → Webhooks
   - Add endpoint: `https://yourdomain.com/api/billing/webhook`
   - Select events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy Signing Secret to `STRIPE_WEBHOOK_SECRET`

3. **Configure Environment:**

   - Update `.env` with live Stripe keys (use `sk_live_*`)
   - Set `APP_URL` to production domain
   - Ensure Supabase `user_stats` table has `subscription_status` column

4. **Test Payment:**
   - Use Stripe test mode with test cards
   - Verify webhook is received and processed
   - Confirm `user_stats.subscription_status` updates

### RLS Policies

Ensure Supabase RLS allows updates to `user_stats`:

```sql
CREATE POLICY "Allow updates from webhook"
  ON user_stats
  USING (true)
  WITH CHECK (true);
```

Or more restrictively:

```sql
CREATE POLICY "Allow authenticated users to read own stats"
  ON user_stats
  USING (auth.uid() = user_id);
```

---

## 10. KEY FILES SUMMARY

| File                                                   | Purpose                     | Status      |
| ------------------------------------------------------ | --------------------------- | ----------- |
| `packages/api/src/routes/billing.routes.ts`            | Checkout & portal endpoints | ✅ Updated  |
| `packages/api/src/routes/billing.webhook.ts`           | Webhook handler             | ✅ Enhanced |
| `packages/api/src/index.ts`                            | Route registration          | ✅ Verified |
| `packages/shared-types/src/user-stats.types.ts`        | Subscription type           | ✅ Added    |
| `packages/shared-validation/src/user-stats.schemas.ts` | Zod schemas                 | ✅ Added    |
| `packages/web/src/hooks/useSubscription.ts`            | Web hook                    | ✅ Enhanced |
| `packages/web/src/components/SubscriptionGate.tsx`     | Web gate component          | ✅ Enhanced |
| `packages/web/src/app/stats/page.tsx`                  | Stats page                  | ✅ Gated    |
| `packages/web/src/app/speed-trainer/page.tsx`          | Speed trainer page          | ✅ Gated    |
| `packages/mobile/src/hooks/useSubscription.ts`         | Mobile hook                 | ✅ Enhanced |
| `packages/mobile/src/components/SubscriptionGate.tsx`  | Mobile gate component       | ✅ Enhanced |
| `packages/mobile/src/screens/StatsScreen.tsx`          | Stats screen                | ✅ Gated    |
| `packages/mobile/src/screens/SpeedTrainerScreen.tsx`   | Speed trainer screen        | ✅ Gated    |
| `packages/api/.env`                                    | API env vars                | ✅ Updated  |

---

## 11. FUTURE ENHANCEMENTS

- [ ] Add annual billing option
- [ ] Implement subscription tiers (Basic, Pro, Premium)
- [ ] Add usage-based billing
- [ ] Create billing success/cancel pages
- [ ] Add subscription analytics dashboard
- [ ] Implement coupon/discount system
- [ ] Add gift subscriptions
- [ ] Create lifetime access option
- [ ] Implement dunning (failed payment recovery)

---

## 12. SUPPORT & TROUBLESHOOTING

**Issue:** Checkout button not working

- Check `STRIPE_SECRET_KEY` and `STRIPE_PRICE_PRO_MONTHLY` are set
- Verify auth token is being sent in Authorization header

**Issue:** Webhook not updating subscription

- Verify webhook secret in `.env` matches Stripe
- Check Stripe webhook endpoint is reachable
- Verify `user_stats` table exists and has `subscription_status` column
- Check Supabase RLS policies allow updates

**Issue:** Users seeing upsell after upgrade

- Wait 5-10 seconds for webhook to process
- Hard refresh browser or app
- Check Supabase for subscription_status update

---

**Implementation Date:** November 25, 2025  
**Status:** ✅ Complete and Ready for Testing
