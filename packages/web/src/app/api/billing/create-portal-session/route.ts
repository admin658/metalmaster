import { NextRequest } from 'next/server';
import Stripe from 'stripe';
import { requireUser } from '../../_lib/auth';
import { handleRouteError, success, failure } from '../../_lib/responses';
import { supabaseAdmin } from '../../_lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-11-17.clover' })
  : null;
const DOMAIN = process.env.APP_URL || 'http://localhost:3000';

export async function POST(req: NextRequest) {
  try {
    const auth = await requireUser(req);
    if ('error' in auth) return auth.error;
    const { user } = auth;

    if (!stripe) {
      return failure(503, 'SERVICE_UNAVAILABLE', 'Billing service not configured');
    }

    if (!supabaseAdmin) {
      return failure(503, 'SERVICE_UNAVAILABLE', 'Database service not configured');
    }

    const { data, error: fetchError } = await supabaseAdmin
      .from('user_stats')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError || !data?.stripe_customer_id) {
      return failure(400, 'NO_SUBSCRIPTION', 'User does not have an active Stripe customer ID. Please upgrade first.');
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${DOMAIN}/profile`,
    } as any);

    return success({ url: portal.url });
  } catch (err) {
    return handleRouteError(err);
  }
}
