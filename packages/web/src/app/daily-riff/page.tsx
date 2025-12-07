'use client';

import { useState } from 'react';
import { useDailyRiff, useDailyRiffStats, useCompleteDailyRiff } from '@/hooks/useDailyRiff';
import UpsellBanner from '@/components/billing/UpsellBanner';
import InlineUpsell from '@/components/billing/InlineUpsell';

export default function DailyRiffPage() {
  const { dailyRiff, isLoading: riffLoading, mutate: mutateDailyRiff } = useDailyRiff();
  const { stats, isLoading: statsLoading, mutate: mutateStats } = useDailyRiffStats();
  const { complete, isLoading: completing } = useCompleteDailyRiff();

  const [completed, setCompleted] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!dailyRiff?.id) return;

    try {
      setError(null);
      const result = await complete(dailyRiff.id);
      if (result) {
        setCompleted(true);
        setXpEarned(result.xp_earned);
        setTimeout(() => {
          mutateDailyRiff();
          mutateStats();
        }, 500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete daily riff');
    }
  };

  const alreadyCompleted = stats?.completed_today;

  return (
    <>
      <UpsellBanner />
      <div className="relative max-w-5xl mx-auto px-4 pb-16 pt-10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-0 top-0 h-52 w-52 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
          <div className="absolute right-0 top-24 h-60 w-60 rounded-full bg-gradient-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
        </div>

        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Daily challenge</p>
            <h1 className="font-display text-3xl sm:text-4xl text-white">Daily Riff</h1>
            <p className="text-gray-200 mt-2">
              One riff a day to keep your streak alive and technique sharp.
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-100">
            <span>Streak</span>
            <span className="rounded-full bg-metal-accent px-3 py-1 text-black">
              {stats?.days_completed_streak || 0} days
            </span>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {riffLoading ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 animate-pulse">
                <div className="h-8 bg-white/10 rounded mb-4" />
                <div className="h-6 bg-white/10 rounded mb-4" />
                <div className="h-32 bg-white/10 rounded" />
              </div>
            ) : dailyRiff ? (
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-6 shadow-2xl">
                <div className="absolute inset-0 opacity-60 blur-3xl bg-gradient-to-br from-metal-accent/20 via-purple-700/25 to-black/70" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                        {dailyRiff.featured_date}
                      </p>
                      <h2 className="font-display text-2xl text-white">{dailyRiff.description}</h2>
                      <p className="text-sm text-gray-300">{dailyRiff.subgenre}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-gray-200">
                      {dailyRiff.difficulty_level}
                    </span>
                  </div>

                  {dailyRiff.tab_content && (
                    <div className="rounded-2xl border border-white/10 bg-black/50 p-4 text-sm text-gray-200 font-mono overflow-x-auto">
                      <div className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-2">Tab</div>
                      <pre className="whitespace-pre-wrap break-words">{dailyRiff.tab_content}</pre>
                    </div>
                  )}

                  {dailyRiff.video_url && (
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Video</p>
                      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                        <iframe
                          width="100%"
                          height="315"
                          src={dailyRiff.video_url}
                          title="Daily Riff Video"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <InfoTile label="XP Bonus" value={`+${dailyRiff.xp_bonus} XP`} />
                    <InfoTile label="Current streak" value={`${stats?.days_completed_streak || 0} days`} tone="text-amber-400" />
                  </div>

                  {error && (
                    <div className="rounded-2xl border border-red-500/60 bg-red-900/50 px-4 py-3 text-sm text-red-100">
                      {error}
                    </div>
                  )}

                  {completed || alreadyCompleted ? (
                    <div className="rounded-2xl border border-green-500/60 bg-green-900/40 px-5 py-4 text-center">
                      <p className="text-green-100 font-semibold mb-1">Completed!</p>
                      <p className="text-3xl font-display text-green-300">+{xpEarned || dailyRiff.xp_bonus} XP</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleComplete}
                      disabled={completing}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-metal-accent px-5 py-3 text-sm font-semibold text-black shadow-[0_12px_30px_rgba(255,107,53,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(255,107,53,0.45)] disabled:opacity-60"
                    >
                      {completing ? 'Marking...' : 'Mark as Complete'}
                    </button>
                  )}

                  <div className="pt-4 border-t border-white/10">
                    <InlineUpsell title="Daily Riffs unlocked in PRO" message="Get every daily riff and advanced metrics." />
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-gray-300">
                No daily riff available today. Check back tomorrow!
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-5 shadow-xl">
              <h3 className="font-display text-lg text-white mb-3">Streak and XP</h3>
              {statsLoading ? (
                <p className="text-gray-400 text-sm">Loading stats...</p>
              ) : (
                <div className="space-y-3 text-sm text-gray-200">
                  <InfoTile label="Total completed" value={stats?.total_completed || 0} />
                  <InfoTile
                    label="Next riff"
                    value={stats?.next_riff_date ? new Date(stats.next_riff_date).toLocaleDateString() : 'Tomorrow'}
                  />
                  <InfoTile label="Completed today" value={alreadyCompleted ? 'Yes' : 'No'} tone={alreadyCompleted ? 'text-metal-accent' : ''} />
                </div>
              )}
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-5 shadow-xl">
              <h4 className="font-display text-lg text-white mb-2">Tips</h4>
              <ul className="space-y-2 text-sm text-gray-200">
                <li>Loop the hardest bar and slow it down first.</li>
                <li>Record a take to check timing before marking complete.</li>
                <li>Keep the streak alive for bonus XP.</li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </>
  );
}

function InfoTile({ label, value, tone }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{label}</p>
      <p className={`text-lg font-semibold text-white ${tone ?? ''}`}>{value}</p>
    </div>
  );
}
