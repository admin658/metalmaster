import { Router } from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { authenticate } from '../middleware/auth';

const router = Router();

console.log('📋 Billing Routes - Checking environment variables:');
console.log('   STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('   STRIPE_PRICE_PRO_MONTHLY:', process.env.STRIPE_PRICE_PRO_MONTHLY);
console.log('   STRIPE_WEBHOOK_SECRET exists:', !!process.env.STRIPE_WEBHOOK_SECRET);

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-11-17' as any
}) : null;

console.log('✅ Stripe client initialized:', !!stripe);

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseService = supabaseUrl && supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

console.log('✅ Supabase service initialized:', !!supabaseService);

// price IDs you get from Stripe Dashboard
const PRICE_PRO_MONTHLY = process.env.STRIPE_PRICE_PRO_MONTHLY!;
const DOMAIN = process.env.APP_URL || 'http://localhost:3000';


// 1. Create checkout session
router.post('/create-checkout-session', authenticate, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Billing service not configured',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    const userId = req.user?.id;
    const email = req.user?.email;
    
    if (!userId || !email) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_creation: 'always',
      customer_email: email,
      line_items: [{ price: PRICE_PRO_MONTHLY, quantity: 1 }],
      success_url: `${DOMAIN}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${DOMAIN}/billing/cancel`,
      metadata: { userId },
      billing_address_collection: 'auto'
    } as any);

    return res.json({
      success: true,
      data: { url: session.url },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (err: any) {
    console.error('Stripe error:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'STRIPE_ERROR',
        message: err.message || 'Failed to create checkout session',
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }
});


// 2. Billing Portal
router.post('/create-portal-session', authenticate, async (req, res) => {
  try {
    if (!stripe) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Billing service not configured',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    if (!supabaseService) {
      return res.status(503).json({
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Database service not configured',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Not authenticated',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    // Fetch stripe_customer_id from database
    const { data, error: fetchError } = await supabaseService
      .from('user_stats')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (fetchError || !data?.stripe_customer_id) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_SUBSCRIPTION',
          message: 'User does not have an active Stripe customer ID. Please upgrade first.',
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
        },
      });
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: data.stripe_customer_id,
      return_url: `${DOMAIN}/profile`
    } as any);

    return res.json({
      success: true,
      data: { url: portal.url },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  } catch (err: any) {
    console.error('Billing portal error:', err);
    return res.status(500).json({
      success: false,
      error: {
        code: 'STRIPE_ERROR',
        message: err.message || 'Failed to create portal session',
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  }
});

export default router;
