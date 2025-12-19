import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { requireUser } from '../../_lib/auth';
import { handleRouteError, success, failure } from '../../_lib/responses';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' })
  : null;

const PRICE_PRO_MONTHLY = process.env.STRIPE_PRICE_PRO_MONTHLY;
const DOMAIN = process.env.APP_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { user } = auth;

    if (!stripe || !PRICE_PRO_MONTHLY) {
      return failure(503, 'SERVICE_UNAVAILABLE', 'Billing service not configured');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: user.email,
      line_items: [{ price: PRICE_PRO_MONTHLY, quantity: 1 }],
      subscription_data: {
        metadata: { userId: user.id },
      },
      success_url: `${DOMAIN}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/billing/cancel`,
      metadata: { userId: user.id },
      billing_address_collection: 'auto',
    });

    return success({ url: session.url });
  } catch (err) {
    return handleRouteError(err);
  }
}
