"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSubscription } from '@/hooks/useSubscription';
import ProBenefits from './ProBenefits';

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const features = [
  'Daily Riff every day',
  'Unlimited Speed Trainer sessions',
  'Full practice heatmap',
  'AI Tone Assistant',
  'AI Feedback & Tab Generator',
];

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ open, onClose }) => {
  const { upgradeToPro } = useSubscription();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative max-w-lg w-full mx-4 p-6 bg-gradient-to-br from-gray-900/90 to-black/90 border border-red-900 rounded-lg shadow-xl glassmorphism">
        <h2 className="text-2xl font-bold text-metal-accent mb-4">Go PRO. Become a Shred Overlord.</h2>

        <div className="mb-6">
          <ProBenefits />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => upgradeToPro()}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Upgrade Now
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold py-2 px-4 rounded border border-gray-700"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );

  // create portal to body
  return createPortal(modal, document.body);
};

export default UpgradeModal;
