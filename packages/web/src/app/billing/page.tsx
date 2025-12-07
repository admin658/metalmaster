'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

export default function BillingPage() {
  const { isPro, isLoading, error, upgradeToPro, manageBilling, portalPending, upgradePending } = useSubscription();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-metal-900 text-gray-100 pb-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-56 w-56 rounded-full bg-linear-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
        <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-linear-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
      </div>

      <div className="max-w-5xl mx-auto px-4 pt-12 space-y-10">
        <header className="space-y-3">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Billing & Subscription</p>
          <h1 className="font-display text-3xl sm:text-4xl text-white">Keep your tools unlocked</h1>
          <p className="text-gray-200 max-w-2xl">
            Manage your Metal Master subscription, view your status, and jump into billing portal when needed.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-gray-900/80 via-gray-900/60 to-black/80 p-6 shadow-2xl">
            <div className="absolute inset-0 blur-3xl opacity-60 bg-linear-to-br from-metal-accent/20 via-purple-700/25 to-black/70" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Current Plan</p>
                  <h2 className="font-display text-2xl text-white">{isPro ? 'PRO' : 'Free'}</h2>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPro ? 'bg-metal-accent text-black' : 'bg-white/10 text-gray-200'}`}>
                  {isLoading ? 'Loading...' : isPro ? 'Active' : 'Free tier'}
                </span>
              </div>
              <p className="text-gray-200 text-sm">
                {isPro
                  ? 'You have full access to Daily Riffs, advanced analytics, and the AlphaTab tools.'
                  : 'Upgrade to unlock unlimited riffs, full practice analytics, and priority support.'}
              </p>

              {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-200 text-sm px-3 py-2">{error}</div>}

              <div className="flex flex-wrap gap-3">
                {!isPro && mounted && (
                  <button
                    onClick={upgradeToPro}
                    disabled={isLoading || upgradePending}
                    className="inline-flex items-center gap-2 rounded-full bg-metal-accent px-5 py-3 text-sm font-semibold text-black shadow-[0_10px_35px_rgba(255,107,53,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_40px_rgba(255,107,53,0.65)] disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-[0_10px_35px_rgba(255,107,53,0.55)]"
                  >
                    {upgradePending ? 'Redirecting...' : isLoading ? 'Loading...' : 'Upgrade to Pro'}
                  </button>
                )}
                {isPro && (
                  <button
                    onClick={manageBilling}
                    disabled={isLoading || portalPending}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-100 transition hover:border-metal-accent/60 hover:text-white hover:bg-white/10 disabled:opacity-60"
                  >
                    {portalPending ? 'Opening...' : isLoading ? 'Preparing...' : 'Manage billing'}
                  </button>
                )}
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-gray-100 transition hover:border-metal-accent/60 hover:text-white hover:bg-white/10"
                >
                  View plans
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl space-y-4">
            <h3 className="font-display text-xl text-white">What you get with PRO</h3>
            <ul className="space-y-2 text-sm text-gray-200">
              {[
                'Unlimited Daily Riffs and Speed Trainer sessions',
                'Full practice analytics, streaks, and stats',
                'AlphaTab Lab with advanced playback controls',
                'Priority support and faster feature access',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-metal-accent" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-gray-200">
              <p className="font-semibold text-white">Need help?</p>
              <p className="text-gray-300">If you run into billing issues, contact support and include your account email.</p>
              <Link href="mailto:support@metalmaster.app" className="text-metal-accent font-semibold underline-offset-4 hover:underline">
                support@metalmaster.app
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
