"use client";

import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';

interface InlineUpsellProps {
  title?: string;
  message?: string;
}

export const InlineUpsell: React.FC<InlineUpsellProps> = ({
  title = 'Go PRO for more shredding',
  message = 'Unlock daily riffs, advanced stats, and AI tools.'
}) => {
  const { status, isPro, isLoading, upgradeToPro } = useSubscription();

  if (isLoading || isPro || status !== 'free') return null;

  return (
    <div className="flex items-center justify-between bg-gradient-to-r from-gray-800 to-gray-900 border border-red-800 rounded-lg p-4">
      <div>
        <h4 className="text-sm font-semibold text-metal-accent">{title}</h4>
        <p className="text-xs text-gray-300">{message}</p>
      </div>
      <div>
        <button
          onClick={upgradeToPro}
          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-semibold"
        >
          Upgrade to PRO
        </button>
      </div>
    </div>
  );
};

export default InlineUpsell;
