// app/actions/stripeActions.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-11-17.clover' });
const DOMAIN = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// 1. Create Checkout Session
export async function createCheckoutSession({ priceId, userId }: { priceId: string; userId: string }) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${DOMAIN}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${DOMAIN}/billing/cancel`,
    client_reference_id: userId,
    metadata: { user_id: userId },
  });
  return { url: session.url };
}

// 2. Handle Stripe Webhook Events
export async function handleStripeWebhook(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const rawBody = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  // 3. Sync subscription status into Supabase
  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const userId = subscription.metadata.user_id;
    const status = subscription.status;
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.from('users').update({ stripe_status: status }).eq('id', userId);
  }

  return new Response('Webhook received', { status: 200 });
}
