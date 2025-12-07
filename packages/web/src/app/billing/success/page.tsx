'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function BillingSuccessPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [subscriptionUpdated, setSubscriptionUpdated] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const MAX_ATTEMPTS = 12;
  const POLL_INTERVAL = 1000;

  useEffect(() => {
    if (authLoading || !user) return;

    const checkSubscriptionStatus = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) return;

        const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
        const res = await fetch(`${apiBase}/user-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          const status = data.data?.subscription_status;
          
          if (status === 'pro' || status === 'trial') {
            setSubscriptionUpdated(true);
            setCheckingStatus(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to check subscription status:', err);
      }

      setAttempts(prev => prev + 1);
    };

    if (attempts < MAX_ATTEMPTS && !subscriptionUpdated) {
      const timer = setTimeout(() => {
        checkSubscriptionStatus();
      }, POLL_INTERVAL);

      return () => clearTimeout(timer);
    } else if (attempts >= MAX_ATTEMPTS) {
      setCheckingStatus(false);
    }
  }, [user, authLoading, attempts, subscriptionUpdated]);

  return (
    <div className="min-h-screen bg-metal-900 text-gray-100 flex items-center">
      <div className="max-w-2xl mx-auto px-4 space-y-6 text-center">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Billing</p>
          <h1 className="font-display text-3xl sm:text-4xl text-white">You&apos;re all set</h1>
          <p className="text-gray-200">
            Your purchase was successful. {checkingStatus ? 'We\'re updating your account—this can take a few seconds.' : subscriptionUpdated ? 'Your Pro subscription is now active!' : 'Your subscription may take a moment to activate. You can check your status in your profile.'}
          </p>
          {checkingStatus && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <div className="flex gap-1">
                <div className="h-2 w-2 rounded-full bg-metal-accent animate-pulse" />
                <div className="h-2 w-2 rounded-full bg-metal-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="h-2 w-2 rounded-full bg-metal-accent animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-metal-accent px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_35px_rgba(255,107,53,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(255,107,53,0.65)]"
          >
            Back to dashboard
          </Link>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-100 transition hover:border-metal-accent/60 hover:text-white hover:bg-white/10"
          >
            View profile
          </Link>
        </div>
      </div>
    </div>
  );
}
