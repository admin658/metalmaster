'use client';

import { useMemo, useState } from 'react';
import { useAchievementsLibrary, useUserAchievements, useAchievementsProgress } from '@/hooks/useAchievements';

type TabKey = 'progress' | 'earned';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'progress', label: 'In progress' },
  { key: 'earned', label: 'Earned' },
];

export default function AchievementsPage() {
  const [tab, setTab] = useState<TabKey>('progress');
  const { achievements: library, isLoading: libraryLoading } = useAchievementsLibrary();
  const { achievements: earned, isLoading: earnedLoading } = useUserAchievements();
  const { progress, isLoading: progressLoading } = useAchievementsProgress();

  const earnedIds = useMemo(
    () => new Set(earned?.map((item: any) => item.achievement_id) || []),
    [earned]
  );

  return (
    <div className="relative max-w-6xl mx-auto px-4 pb-16 pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-52 w-52 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-60 w-60 rounded-full bg-gradient-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
      </div>

      <header className="flex items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Badges and milestones</p>
          <h1 className="font-display text-3xl sm:text-4xl text-white">Achievements</h1>
        </div>
        <div className="flex gap-2">
          {tabs.map((item) => (
            <button
              key={item.key}
              onClick={() => setTab(item.key)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === item.key
                  ? 'bg-metal-accent text-black shadow-[0_12px_30px_rgba(255,107,53,0.35)]'
                  : 'border border-white/10 bg-white/5 text-gray-100 hover:border-metal-accent/50'
              }`}
            >
              {item.label}
              {item.key === 'earned' && (
                <span className="ml-2 rounded-full bg-black/30 px-2 py-0.5 text-xs text-white">
                  {earned?.length || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </header>

      {tab === 'progress' ? (
        <ProgressGrid
          isLoading={progressLoading || libraryLoading}
          progress={progress}
          library={library}
          earnedIds={earnedIds}
        />
      ) : (
        <EarnedGrid isLoading={earnedLoading} earned={earned} />
      )}
    </div>
  );
}

type ProgressGridProps = {
  isLoading: boolean;
  progress: any[];
  library: any[];
  earnedIds: Set<string>;
};

function ProgressGrid({ isLoading, progress, library, earnedIds }: ProgressGridProps) {
  if (isLoading) {
    return <div className="text-gray-400">Loading achievements...</div>;
  }

  const progressList = progress && progress.length > 0 ? progress : library || [];

  if (!progressList || progressList.length === 0) {
    return <div className="text-gray-400">No achievements available</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {progressList.map((achievement: any) => {
        const percent = achievement.progress_percentage ?? 0;
        const earned = achievement.earned || earnedIds.has(achievement.achievement_id);
        const badgeTone = earned ? 'bg-green-500/20 text-green-200' : 'bg-white/10 text-gray-200';

        return (
          <div
            key={achievement.achievement_id || achievement.id}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/80 p-5 shadow-xl"
          >
            <div className={`absolute inset-0 opacity-60 blur-2xl bg-gradient-to-br ${earned ? 'from-green-500/30 via-metal-accent/20 to-black/60' : 'from-white/5 via-white/0 to-black/40'}`} />
            <div className="relative flex items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeTone}`}>
                    {earned ? 'Earned' : 'In progress'}
                  </span>
                  <span className="text-[11px] uppercase tracking-[0.24em] text-gray-400">Badge</span>
                </div>
                <h3 className="font-display text-xl text-white">{achievement.name || achievement.title}</h3>
                <p className="text-gray-200 text-sm leading-relaxed">{achievement.description}</p>
              </div>
              <div className="rounded-xl bg-white/5 px-3 py-2 text-center">
                <p className="text-xs uppercase tracking-wide text-gray-400">XP</p>
                <p className="text-lg font-semibold text-metal-accent">{achievement.xp_value || achievement.xp || 0}</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span>Progress</span>
                <span className={earned ? 'text-metal-accent font-semibold' : 'text-gray-300'}>
                  {percent}% {earned ? '(complete)' : ''}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${earned ? 'bg-metal-accent' : 'bg-white/50'}`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
              {earned && achievement.earned_date && (
                <p className="mt-3 text-xs text-gray-300">
                  Earned on <span className="text-metal-accent font-semibold">{new Date(achievement.earned_date).toLocaleDateString()}</span>
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

type EarnedGridProps = {
  isLoading: boolean;
  earned: any[];
};

function EarnedGrid({ isLoading, earned }: EarnedGridProps) {
  if (isLoading) {
    return <div className="text-gray-400">Loading achievements...</div>;
  }

  if (!earned || earned.length === 0) {
    return (
      <div className="text-gray-400 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
        No achievements earned yet. Keep practicing!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {earned.map((achievement: any) => (
        <div
          key={achievement.id}
          className="relative overflow-hidden rounded-2xl border border-metal-accent/60 bg-gradient-to-br from-metal-accent/10 via-gray-900/70 to-black/70 p-5 shadow-xl"
        >
          <div className="absolute inset-px rounded-[1rem] bg-gradient-to-br from-white/10 to-white/0 opacity-70" />
          <div className="relative space-y-3">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-metal-accent px-3 py-1 text-xs font-semibold text-black">Earned</span>
              <span className="text-xs uppercase tracking-[0.18em] text-gray-200">
                {new Date(achievement.earned_at).toLocaleDateString()}
              </span>
            </div>
            <h3 className="font-display text-xl text-white">
              {achievement.achievements_library?.name}
            </h3>
            <p className="text-gray-200 text-sm leading-relaxed">
              {achievement.achievements_library?.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
