import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { supabaseAdmin } from '../../_lib/supabase';
import { failure } from '../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17' as any })
  : null;

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
  if (!supabaseAdmin) return { userId: null, email: customerEmail ?? null };

  if (metadataUserId) {
    return { userId: metadataUserId, email: customerEmail ?? null };
  }

  if (customerId) {
    const { data } = await supabaseAdmin
      .from('user_stats')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .maybeSingle();
    if (data?.user_id) {
      return { userId: data.user_id as string, email: customerEmail ?? null };
    }
  }

  let email = customerEmail ?? null;
  if (!email && customerId && stripe) {
    try {
      const customer = (await stripe.customers.retrieve(customerId)) as Stripe.Customer;
      email = (customer.email || null) as string | null;
    } catch (err) {
      console.warn('Failed to retrieve Stripe customer:', err);
    }
  }

  if (email) {
    const { data } = await supabaseAdmin.from('users').select('id').eq('email', email).maybeSingle();
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

export async function POST(req: NextRequest) {
  if (!stripe) {
    console.warn('Stripe webhook received but Stripe is not configured');
    return failure(503, 'SERVICE_UNAVAILABLE', 'Billing service not configured');
  }

  if (!supabaseAdmin) {
    console.error('Stripe webhook cannot run: missing SUPABASE_SERVICE_ROLE_KEY or SUPABASE_URL');
    return failure(503, 'SERVICE_UNAVAILABLE', 'Billing service misconfigured');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook cannot verify signature: STRIPE_WEBHOOK_SECRET is missing');
    return failure(503, 'SERVICE_UNAVAILABLE', 'Billing webhook secret not configured');
  }

  const sig = req.headers.get('stripe-signature')!;
  let event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err: any) {
    console.error('Webhook signature error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
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
          return new Response(JSON.stringify({ received: true }), { status: 200 });
        }

        const status = subscriptionStatusFromStripe(subscription.status);
        const { error } = await supabaseAdmin
          .from('user_stats')
          .update({ subscription_status: status, stripe_customer_id: customerId })
          .eq('user_id', userId);

        if (error) {
          console.error('Failed to update subscription after checkout', { userId, error });
        }
      }
    }

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
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const status = subscriptionStatusFromStripe(subscription.status);
      const { error } = await supabaseAdmin
        .from('user_stats')
        .update({ subscription_status: status, stripe_customer_id: customerId })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to update subscription for user:', userId, error);
      }
    }

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
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const status: SubscriptionStatus = subscriptionStatusFromStripe(subscription.status);
      const { error } = await supabaseAdmin
        .from('user_stats')
        .update({ subscription_status: status, stripe_customer_id: customerId })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to update subscription for user:', userId, error);
      }
    }

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
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      const { error } = await supabaseAdmin
        .from('user_stats')
        .update({ subscription_status: 'free' })
        .eq('user_id', userId);

      if (error) {
        console.error('Failed to downgrade user:', userId, error);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), { status: 500 });
  }
}
