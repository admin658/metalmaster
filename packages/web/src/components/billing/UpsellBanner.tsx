"use client";

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';

export const UpsellBanner: React.FC = () => {
  const { status, isPro, isLoading, upgradeToPro } = useSubscription();

  if (isLoading || isPro || status !== 'free') return null;

  return (
    <div className="w-full bg-black/70 backdrop-blur-sm border-b border-red-900">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <div className="text-sm text-gray-200">Unlock full metal power — daily riffs, full stats, speed trainer history & AI tone.</div>
        <div>
          <button
            onClick={upgradeToPro}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold py-2 px-3 rounded"
          >
            Upgrade to PRO
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpsellBanner;
