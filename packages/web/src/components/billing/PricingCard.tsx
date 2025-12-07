'use client';

import React, { useEffect, useState } from 'react';
import { useSubscription } from '@/hooks/useSubscription';

interface PricingCardProps {
  priceLabel: string;
  trialEnabled?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ priceLabel, trialEnabled }) => {
  const { isPro, upgradeToPro, upgradePending, isLoading } = useSubscription();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-200">FREE</h3>
          <div className="text-3xl font-bold text-gray-100 mt-4">$0</div>
          <ul className="mt-4 text-sm text-gray-300 space-y-2">
            <li>Limited daily riffs</li>
            <li>Basic stats</li>
            <li>Limited speed trainer</li>
          </ul>
        </div>

        <div className="col-span-2 bg-linear-to-br from-gray-900 to-black rounded-lg p-6 border border-red-700 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-metal-accent">PRO</h2>
              <div className="text-sm text-gray-300 mt-1">All features unlocked</div>
            </div>
            <div className="text-right">
              <div className="text-4xl font-extrabold text-white">{priceLabel}</div>
              {trialEnabled && <div className="text-xs text-yellow-400">Start Free Trial</div>}
            </div>
          </div>

          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-200">
            <li>Daily Riff every day</li>
            <li>Unlimited Speed Trainer</li>
            <li>Full practice heatmap</li>
            <li>AI Tone Assistant & Feedback</li>
            <li>AI Tab Generator</li>
            <li>Priority support</li>
          </ul>

          <div className="mt-6 flex gap-3 items-center flex-wrap">
            {!isPro ? (
              mounted && (
                <button
                  onClick={upgradeToPro}
                  disabled={isLoading || upgradePending}
                  className="bg-metal-accent hover:bg-orange-600 text-black font-bold py-3 px-6 rounded transition disabled:opacity-60"
                >
                  {upgradePending ? 'Redirecting...' : isLoading ? 'Loading...' : 'Upgrade to Pro'}
                </button>
              )
            ) : (
              <span className="text-sm font-semibold text-green-300">You&apos;re already on PRO.</span>
            )}
            <button
              onClick={() => window.location.href = '/pricing'}
              className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-3 px-4 rounded border border-gray-700"
            >
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingCard;
