import express, { Router } from 'express';
import Stripe from 'stripe';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const router = Router();
let stripe: Stripe | null | undefined;
let supabaseService: ReturnType<typeof createClient> | null | undefined;

function getStripe(): Stripe | null {
  if (stripe !== undefined) return stripe;
  stripe = process.env.STRIPE_SECRET_KEY
    ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17' as any })
    : null;
  return stripe;
}

function getSupabaseService() {
  if (supabaseService !== undefined) return supabaseService;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Service-role client to perform RLS-protected updates from the webhook path.
  supabaseService =
    supabaseUrl && supabaseServiceRoleKey
      ? createClient(supabaseUrl, supabaseServiceRoleKey)
      : null;
  return supabaseService;
}

type SubscriptionStatus = 'free' | 'pro' | 'trial' | 'lifetime';

async function resolveUserId({
  metadataUserId,
  customerId,
  customerEmail,
}: {
  metadataUserId?: string | null;
  customerId?: string | null;
  customerEmail?: string | null;
}): Promise<{ userId: string | null; email: string | null }> {
  const supabaseService = getSupabaseService();
  if (!supabaseService) return { userId: null, email: customerEmail ?? null };

  if (metadataUserId) {
    return { userId: metadataUserId, email: customerEmail ?? null };
  }

  // Try linking via stored stripe_customer_id
  if (customerId) {
    const { data } = await supabaseService
      .from('user_stats')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    if (data?.user_id) {
      return { userId: data.user_id as string, email: customerEmail ?? null };
    }
  }

  // Try resolving email from Stripe if we only have the customer id
  let email = customerEmail ?? null;
  const stripe = getStripe();
  if (!email && customerId && stripe) {
    try {
      const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
      email = (customer.email || null) as string | null;
    } catch (err) {
      console.warn('Failed to retrieve Stripe customer:', err);
    }
  }

  if (email) {
    const { data } = await supabaseService.from('users').select('id').eq('email', email).maybeSingle();
    if (data?.id) {
      return { userId: data.id as string, email };
    }
  }

  return { userId: null, email: email ?? null };
}

function subscriptionStatusFromStripe(status: Stripe.Subscription.Status): SubscriptionStatus {
  if (status === 'active' || status === 'trialing') return 'pro';
  return 'free';
}

router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
  const stripe = getStripe();
  if (!stripe) {
    console.warn('Stripe webhook received but Stripe is not configured');
    return res.status(503).json({ error: 'Billing service not configured' });
  }

  const supabaseService = getSupabaseService();
  if (!supabaseService) {
    console.error('Stripe webhook cannot run: missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL');
    return res.status(503).json({ error: 'Billing service misconfigured' });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook cannot verify signature: STRIPE_WEBHOOK_SECRET is missing');
    return res.status(503).json({ error: 'Billing webhook secret not configured' });
  }

  const sig = req.headers['stripe-signature']!;
  let event;

  try {
    // Stripe requires the raw request payload for signature verification.
    const requestBody = Buffer.isBuffer(req.body)
      ? req.body
      : req.body instanceof Uint8Array
      ? Buffer.from(req.body)
      : typeof req.body === 'string'
      ? req.body
      : JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(requestBody, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    console.log(`✓ Webhook signature verified: ${event.type}`);
  } catch (err: any) {
    if (process.env.NODE_ENV !== 'production') {
      const bodyBuffer = Buffer.isBuffer(req.body)
        ? req.body
        : req.body instanceof Uint8Array
        ? Buffer.from(req.body)
        : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      const bodyHash = crypto.createHash('sha256').update(bodyBuffer).digest('hex');
      console.error('Webhook signature debug:', {
        bodyType: req.body?.constructor?.name ?? typeof req.body,
        bodyLength: bodyBuffer.length,
        bodyHash,
      });
    }
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle checkout completion (Stripe Buy Button / Checkout)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = (session.customer as string) || null;
      const customerEmail = session.customer_details?.email || session.customer_email || null;

      if (session.mode === 'subscription' && session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const { userId, email } = await resolveUserId({
          metadataUserId: session.metadata?.userId || subscription.metadata?.userId,
          customerId,
          customerEmail,
        });

        if (!userId) {
          console.warn('Checkout completed but user could not be resolved', {
            customerId,
            customerEmail: email,
            subscriptionId: subscription.id,
            sessionMetadata: session.metadata,
            subscriptionMetadata: subscription.metadata,
          });
          return res.json({ received: true });
        }

        const status = subscriptionStatusFromStripe(subscription.status);
        const { error } = await supabaseService
          .from('user_stats')
          .update({ subscription_status: status, stripe_customer_id: customerId })
          .eq('user_id', userId);

        if (error) {
          console.error('Failed to update subscription after checkout', { userId, error });
        } else {
          console.log(`✓ Checkout completed → user ${userId} → ${status}`);
        }
      }
    }

    // Handle subscription created
    if (event.type === 'customer.subscription.created') {
      const subscription = event.data.object as Stripe.Subscription;
      const { userId, email } = await resolveUserId({
        metadataUserId: subscription.metadata?.userId,
        customerId: subscription.customer as string,
        customerEmail: (subscription as any).customer_email || null,
      });
      const customerId = subscription.customer as string;

      if (!userId) {
        console.warn('Subscription created but no user could be resolved:', {
          subscriptionId: subscription.id,
          customerId,
          email,
        });
        return res.json({ received: true });
      }

      const status = subscriptionStatusFromStripe(subscription.status);

      const { error } = await supabaseService
        .from('user_stats')
        .update({ subscription_status: status, stripe_customer_id: customerId })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to update subscription for user:', userId, error);
      } else {
        console.log(`✓ Subscription created for user ${userId} → ${status}`);
      }
    }

    // Handle subscription updated
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      const { userId, email } = await resolveUserId({
        metadataUserId: subscription.metadata?.userId,
        customerId: subscription.customer as string,
        customerEmail: (subscription as any).customer_email || null,
      });
      const customerId = subscription.customer as string;

      if (!userId) {
        console.warn('Subscription updated but no user could be resolved:', {
          subscriptionId: subscription.id,
          customerId,
          email,
        });
        return res.json({ received: true });
      }

      // Determine status based on subscription state
      const status: SubscriptionStatus = subscriptionStatusFromStripe(subscription.status);

      const { error } = await supabaseService
        .from('user_stats')
        .update({ subscription_status: status, stripe_customer_id: customerId })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to update subscription for user:', userId, error);
      } else {
        console.log(`✓ Subscription updated for user ${userId} → ${status}`);
      }
    }

    // Handle subscription deleted/cancelled
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const { userId, email } = await resolveUserId({
        metadataUserId: subscription.metadata?.userId,
        customerId: subscription.customer as string,
        customerEmail: (subscription as any).customer_email || null,
      });

      if (!userId) {
        console.warn('Subscription deleted but no user could be resolved:', {
          subscriptionId: subscription.id,
          customerEmail: email,
        });
        return res.json({ received: true });
      }

      const { error } = await supabaseService
        .from('user_stats')
        .update({ subscription_status: 'free' })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to downgrade user:', userId, error);
      } else {
        console.log(`✓ Subscription cancelled for user ${userId} → free`);
      }
    }

    return res.json({ received: true });
  } catch (err: any) {
    console.error('Webhook processing error:', err);
    return res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
