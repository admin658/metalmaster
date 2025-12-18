"use client";

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useUserStats, useUserStatsSummary, useUserHeatmap, useUserSkills } from '@/hooks/useUserStats';
import { useAchievementsStats } from '@/hooks/useAchievements';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { stats, isLoading: statsLoading } = useUserStats();
  const { summary, isLoading: summaryLoading } = useUserStatsSummary();
  const { stats: achievementStats } = useAchievementsStats();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      router.push('/auth/login');
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setLoggingOut(false);
    }
  };

  const keyStats = useMemo(
    () => [
      {
        label: 'Level',
        value: stats?.level ?? '—',
        tone: 'from-metal-accent/20 via-orange-500/20 to-black/60',
      },
      {
        label: 'XP',
        value: summary?.total_xp ?? 0,
        tone: 'from-purple-700/20 via-slate-800/50 to-black/60',
      },
      {
        label: 'Current streak',
        value: `${summary?.current_streak_days || 0} days`,
        tone: 'from-amber-500/25 via-amber-500/15 to-black/50',
      },
      {
        label: 'Practice time',
        value: `${Math.floor((summary?.total_practice_minutes || 0) / 60)}h`,
        tone: 'from-teal-500/25 via-slate-800/50 to-black/60',
      },
    ],
    [stats, summary]
  );

  return (
    <div className="relative max-w-6xl mx-auto px-4 pb-16 pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-52 w-52 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
        <div className="absolute right-0 top-16 h-60 w-60 rounded-full bg-gradient-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
      </div>

      <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-metal-accent/20 via-orange-500/20 to-black/60 border border-white/10 text-2xl font-display text-metal-accent">
            {user?.email?.[0]?.toUpperCase() || 'M'}
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Profile</p>
            <h1 className="font-display text-3xl text-white">Welcome back</h1>
            {user?.email && <p className="text-sm text-gray-300">{user.email}</p>}
            {stats && (
              <p className="text-sm text-gray-300">
                Level {stats.level} • {stats.level_tier}
              </p>
            )}
          </div>
        </div>
        {user && (
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-red-500/60 bg-red-600/80 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(220,38,38,0.35)] disabled:opacity-60"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </button>
        )}
      </header>

      {user ? (
        <div className="space-y-6">
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {keyStats.map((item) => (
              <div
                key={item.label}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-4 shadow-lg"
              >
                <div className={`absolute inset-0 blur-2xl opacity-70 bg-gradient-to-br ${item.tone}`} />
                <div className="relative space-y-1">
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{item.label}</p>
                  <p className="text-2xl font-semibold text-white">{item.value}</p>
                </div>
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PracticeSummaryCard summary={summary} isLoading={summaryLoading} />
            <SkillScoresCard />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PracticeHeatmap />
            <AchievementsPreview stats={achievementStats} />
          </section>
        </div>
      ) : (
        <div className="text-gray-400 bg-white/5 border border-white/10 rounded-2xl p-6">
          Not logged in.{' '}
          <a href="/auth/login" className="text-metal-accent hover:underline">
            Log in here
          </a>{' '}
          or{' '}
          <a href="/auth/signup" className="text-metal-accent hover:underline">
            sign up
          </a>
          .
        </div>
      )}
    </div>
  );
}

function SkillScoresCard() {
  const { skills, isLoading } = useUserSkills();

  if (isLoading) return <SkeletonCard />;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-6 shadow-xl">
      <h3 className="font-display text-xl text-white mb-4">Skill scores</h3>
      <div className="space-y-4">
        {skills?.map((skill: any) => (
          <div key={skill.category}>
            <div className="flex justify-between mb-1">
              <span className="text-sm text-gray-300 capitalize">
                {skill.category.replace('_', ' ')}
              </span>
              <span className="text-sm font-semibold text-metal-accent">
                {skill.current_score}/100
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-metal-accent h-2 rounded-full transition-all duration-500"
                style={{ width: `${skill.current_score}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {skill.progress_last_7_days > 0 ? '+' : ''}
              {skill.progress_last_7_days}% this week
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PracticeHeatmap() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 30);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = today.toISOString().split('T')[0];

  const { heatmap, isLoading } = useUserHeatmap(startDateStr, endDateStr);

  if (isLoading) return <SkeletonCard />;

  const heatmapMap = new Map(heatmap?.map((h: any) => [h.date, h.practice_minutes]) || []);

  const weeks = [];
  for (let i = 0; i < 30; i += 7) {
    const week = [];
    for (let j = 0; j < 7 && i + j < 30; j++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i + j);
      const dateStr = d.toISOString().split('T')[0];
      const minutes = heatmapMap.get(dateStr) || 0;
      week.push({ date: dateStr, minutes });
    }
    weeks.push(week);
  }

  const maxMinutes = Math.max(...Array.from(heatmapMap.values()), 60);
  const getIntensity = (minutes: number) => {
    const ratio = minutes / maxMinutes;
    if (!minutes) return 'bg-white/10';
    if (ratio < 0.25) return 'bg-yellow-900';
    if (ratio < 0.5) return 'bg-yellow-700';
    if (ratio < 0.75) return 'bg-metal-accent/70';
    return 'bg-metal-accent';
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-6 shadow-xl">
      <h3 className="font-display text-xl text-white mb-4">Practice heatmap (Last 30 days)</h3>
      <div className="space-y-2">
        {weeks.map((week, i) => (
          <div key={i} className="flex gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-6 h-6 rounded ${getIntensity(day.minutes)} transition-colors`}
                title={`${day.date}: ${day.minutes} min`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-center text-xs text-gray-400 mt-4">
        <span>Less</span>
        <div className="bg-white/10 w-3 h-3 rounded" />
        <div className="bg-yellow-900 w-3 h-3 rounded" />
        <div className="bg-metal-accent/70 w-3 h-3 rounded" />
        <div className="bg-metal-accent w-3 h-3 rounded" />
        <span>More</span>
      </div>
    </div>
  );
}

function AchievementsPreview({ stats }: { stats: any }) {
  if (!stats) return <SkeletonCard />;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-xl text-white">Achievements</h3>
        <a href="/achievements" className="text-sm text-metal-accent hover:underline">
          View all
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Earned</p>
          <p className="text-3xl font-semibold text-metal-accent">{stats.total_achievements || 0}</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">XP multiplier</p>
          <p className="text-3xl font-semibold text-white">{stats.cumulative_xp_multiplier || 1}x</p>
        </div>
      </div>
    </div>
  );
}

function PracticeSummaryCard({ summary, isLoading }: { summary: any; isLoading: boolean }) {
  if (isLoading) return <SkeletonCard />;

  return (
    <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-6 shadow-xl">
      <h3 className="font-display text-xl text-white mb-4">Practice summary</h3>
      <div className="grid grid-cols-2 gap-4">
        <StatBlock label="Total XP" value={summary?.total_xp || 0} accent />
        <StatBlock label="Current level" value={summary?.level || 1} />
        <StatBlock label="Current streak" value={`${summary?.current_streak_days || 0} days`} accentTone="text-amber-400" />
        <StatBlock
          label="Practice time"
          value={`${Math.floor((summary?.total_practice_minutes || 0) / 60)}h`}
        />
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">This week</p>
          <div className="flex gap-4">
            <StatBlock label="XP" value={summary?.this_week?.xp_earned || 0} compact accent />
            <StatBlock
              label="Time"
              value={`${Math.round((summary?.this_week?.practice_minutes || 0) / 60)}h`}
              compact
            />
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Today</p>
          <div className="flex gap-4">
            <StatBlock label="XP" value={summary?.today?.xp_earned || 0} compact accent />
            <StatBlock label="Time" value={`${summary?.today?.practice_minutes || 0}m`} compact />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  accent,
  compact,
  accentTone,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
  compact?: boolean;
  accentTone?: string;
}) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p
        className={`font-semibold text-white ${compact ? 'text-base' : 'text-xl'} ${
          accent ? 'text-metal-accent' : accentTone || ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function SkeletonCard() {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-6 h-40 animate-pulse" />;
}
