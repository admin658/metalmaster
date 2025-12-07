import React from 'react';
import { useSubscription } from '../hooks/useSubscription';

export interface SubscriptionGateProps {
  requiredPlan: 'free' | 'pro';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * SubscriptionGate component for web (Next.js)
 * Wraps premium features and shows upsell if user is on free tier
 * 
 * Usage:
 * <SubscriptionGate requiredPlan="pro">
 *   <StatsPage />
 * </SubscriptionGate>
 */
export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  requiredPlan,
  children,
  fallback
}) => {
  const { status, isPro, isLoading, error, upgradeToPro } = useSubscription();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading subscription status...</p>
        </div>
      </div>
    );
  }

  // Free tier always has access to free content
  if (requiredPlan === 'free') {
    return <>{children}</>;
  }

  // Pro content: user must be pro or lifetime
  if (isPro) {
    return <>{children}</>;
  }

  // User is on free tier but needs pro
  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-md w-full mx-auto p-8 bg-gray-800 rounded-lg border border-red-600 shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-red-600 mb-2">🎸 Premium Feature</h2>
          <p className="text-gray-300">
            This feature is only available for Metal Master Pro subscribers
          </p>
        </div>

        <div className="space-y-4 mb-6 p-4 bg-gray-900 rounded">
          <h3 className="font-semibold text-white mb-3">Pro Membership Includes:</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-center">
              <span className="mr-2 text-red-600">✓</span> Advanced stats & analytics
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-red-600">✓</span> Daily riff challenges
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-red-600">✓</span> AI tone & technique feedback
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-red-600">✓</span> Unlimited practice sessions
            </li>
            <li className="flex items-center">
              <span className="mr-2 text-red-600">✓</span> Custom jam track generation
            </li>
          </ul>
        </div>

        <button
          onClick={upgradeToPro}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          {isLoading ? 'Loading...' : 'Upgrade to Pro'}
        </button>

        {error && (
          <p className="mt-4 text-center text-red-400 text-sm">{error}</p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionGate;
