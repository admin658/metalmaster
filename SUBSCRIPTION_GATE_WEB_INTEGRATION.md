/**
 * INTEGRATION GUIDE: Using SubscriptionGate in Your Web Pages
 * 
 * Pattern: Wrap premium pages with <SubscriptionGate requiredTier="pro">
 */

// ============================================================================
// 1. STATS PAGE (packages/web/src/app/stats/page.tsx)
// ============================================================================

import { SubscriptionGate } from '@/components/SubscriptionGate';
import StatsOverview from '@/components/stats/StatsOverview';

export default function StatsPage() {
  return (
    <SubscriptionGate requiredTier="pro">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-8">📊 Your Stats</h1>
        <StatsOverview />
      </div>
    </SubscriptionGate>
  );
}

// ============================================================================
// 2. SPEED TRAINER PAGE (packages/web/src/app/speed-trainer/page.tsx)
// ============================================================================

import { SubscriptionGate } from '@/components/SubscriptionGate';

export default function SpeedTrainerPage() {
  return (
    <SubscriptionGate requiredTier="pro">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-8">⚡ Speed Trainer</h1>
        {/* Speed trainer UI */}
      </div>
    </SubscriptionGate>
  );
}

// ============================================================================
// 3. DAILY RIFF PAGE (packages/web/src/app/daily-riff/page.tsx)
// ============================================================================

import { SubscriptionGate } from '@/components/SubscriptionGate';

export default function DailyRiffPage() {
  return (
    <SubscriptionGate requiredTier="pro">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-8">📅 Daily Riff Challenge</h1>
        {/* Daily riff UI */}
      </div>
    </SubscriptionGate>
  );
}

// ============================================================================
// 4. AI TONE ASSISTANT PAGE (NEW - packages/web/src/app/ai-tone/page.tsx)
// ============================================================================

import { SubscriptionGate } from '@/components/SubscriptionGate';

export default function AITonePage() {
  return (
    <SubscriptionGate requiredTier="pro">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-8">🎛️ AI Tone Assistant</h1>
        {/* AI tone UI */}
      </div>
    </SubscriptionGate>
  );
}

// ============================================================================
// 5. AI FEEDBACK PAGE (NEW - packages/web/src/app/ai-feedback/page.tsx)
// ============================================================================

import { SubscriptionGate } from '@/components/SubscriptionGate';

export default function AIFeedbackPage() {
  return (
    <SubscriptionGate requiredTier="pro">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-white mb-8">🎸 AI Technique Feedback</h1>
        {/* AI feedback UI */}
      </div>
    </SubscriptionGate>
  );
}

// ============================================================================
// ALTERNATIVE: Conditional Rendering (for mixed free/pro features)
// ============================================================================

import { useSubscription } from '@/hooks/useSubscription';
// useSubscription uses ApiResponse<UserStats> for type safety

export default function FeaturePage() {
  const { status } = useSubscription();

  return (
    <div className="container mx-auto p-6">
      {/* Free section - always visible */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">📚 Lessons</h2>
        {/* Free lessons UI */}
      </div>

      {/* Pro section - conditional */}
      {status === 'pro' ? (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-red-600 mb-4">✨ Premium Lessons</h2>
          {/* Premium lessons UI */}
        </div>
      ) : (
        <div className="mt-8 p-4 bg-gray-800 rounded border border-red-600">
          <p className="text-gray-300">
            Premium lessons are available for Pro members.{' '}
            <a href="/upgrade" className="text-red-600 hover:underline">
              Upgrade now
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
