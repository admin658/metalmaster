'use client';

import { useMemo } from 'react';
import { useUserStats, useUserStatsSummary, useUserHeatmap, useUserSkills } from '@/hooks/useUserStats';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import UpsellBanner from '@/components/billing/UpsellBanner';

export default function StatsPage() {
  return (
    <>
      <UpsellBanner />
      <SubscriptionGate requiredPlan="pro">
        <div className="relative max-w-6xl mx-auto px-4 pb-16 pt-10">
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-0 top-0 h-52 w-52 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
            <div className="absolute right-0 top-24 h-60 w-60 rounded-full bg-gradient-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
          </div>

          <header className="mb-8">
            <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Progress pulse</p>
            <h1 className="font-display text-3xl sm:text-4xl text-white">Your Stats</h1>
            <p className="text-gray-200 mt-2">Track XP, streaks, skills, and practice time.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <XPAndLevelCard />
            <div className="lg:col-span-2">
              <SkillScoresCard />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PracticeHeatmap />
            <PracticeSummaryCard />
          </div>
        </div>
      </SubscriptionGate>
    </>
  );
}

function XPAndLevelCard() {
  const { stats, isLoading } = useUserStats();

  if (isLoading) {
    return <SkeletonCard className="h-64" />;
  }

  if (!stats) {
    return <CardBody><p className="text-gray-400 text-sm">No stats available</p></CardBody>;
  }

  const nextLevelXP = Math.ceil(stats.total_xp * 1.1);
  const progressPercentage = Math.min(100, (stats.total_xp / nextLevelXP) * 100);

  return (
    <CardBody>
      <h2 className="font-display text-xl text-white mb-4">XP & Level</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-display text-metal-accent">{stats.level}</p>
            <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Current Level</p>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-300">{stats.level_tier}</p>
            <p className="text-2xl font-semibold text-white">{stats.total_xp.toLocaleString()} XP</p>
            <p className="text-xs text-gray-400">Total XP</p>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progress to next level</span>
            <span className="text-metal-accent font-semibold">{Math.floor(progressPercentage)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-metal-accent/60 to-metal-accent"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/10">
          <InfoStat label="Current streak" value={`${stats.current_streak_days} days`} accent />
          <InfoStat label="Longest streak" value={`${stats.longest_streak_days} days`} />
        </div>
      </div>
    </CardBody>
  );
}

function SkillScoresCard() {
  const { skills, isLoading } = useUserSkills();

  if (isLoading) {
    return <SkeletonCard className="h-72" />;
  }

  const skillColors: Record<string, string> = {
    accuracy: 'from-blue-500/60 to-blue-600/40',
    speed: 'from-red-500/60 to-red-600/40',
    rhythm_consistency: 'from-green-500/60 to-green-600/40',
    tone_knowledge: 'from-purple-500/60 to-purple-600/40',
  };

  return (
    <CardBody>
      <h3 className="font-display text-xl text-white mb-4">Skill scores</h3>
      <div className="space-y-4">
        {skills && skills.length > 0 ? (
          skills.map((skill) => (
            <div key={skill.category}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white capitalize">
                    {skill.category.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {skill.progress_last_7_days >= 0 ? '+' : '-'}
                    {Math.abs(skill.progress_last_7_days)}% this week
                  </p>
                </div>
                <span className="text-lg font-semibold text-metal-accent">{skill.current_score}/100</span>
              </div>
              <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${skillColors[skill.category] || 'from-metal-accent/60 to-metal-accent'}`}
                  style={{ width: `${skill.current_score}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">No skill data available yet. Keep practicing!</p>
        )}
      </div>
    </CardBody>
  );
}

function PracticeHeatmap() {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 30);

  const startDateStr = startDate.toISOString().split('T')[0];
  const endDateStr = today.toISOString().split('T')[0];

  const { heatmap, isLoading } = useUserHeatmap(startDateStr, endDateStr);

  if (isLoading) {
    return <SkeletonCard className="h-64" />;
  }

  const heatmapMap = new Map(heatmap?.map((h) => [h.date, h.practice_minutes]) || []);
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
    if (!minutes) return 'bg-white/10';
    const ratio = minutes / maxMinutes;
    if (ratio < 0.25) return 'bg-yellow-900/70';
    if (ratio < 0.5) return 'bg-yellow-700/70';
    if (ratio < 0.75) return 'bg-metal-accent/70';
    return 'bg-metal-accent';
  };

  return (
    <CardBody>
      <h3 className="font-display text-xl text-white mb-4">Practice heatmap (Last 30 days)</h3>
      <div className="space-y-2">
        {weeks.map((week, i) => (
          <div key={i} className="flex gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                className={`w-6 h-6 rounded ${getIntensity(day.minutes)}`}
                title={`${day.date}: ${day.minutes} min`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex gap-2 items-center text-xs text-gray-400 mt-4">
        <span>Less</span>
        <div className="bg-white/10 w-3 h-3 rounded" />
        <div className="bg-yellow-900/70 w-3 h-3 rounded" />
        <div className="bg-metal-accent/70 w-3 h-3 rounded" />
        <div className="bg-metal-accent w-3 h-3 rounded" />
        <span>More</span>
      </div>
    </CardBody>
  );
}

function PracticeSummaryCard() {
  const { summary, isLoading } = useUserStatsSummary();

  const tiles = useMemo(
    () => [
      { label: 'Total practice time', value: summary ? `${Math.floor((summary.total_practice_minutes || 0) / 60)}h ${(summary.total_practice_minutes || 0) % 60}m` : '--' },
      { label: 'Lessons completed', value: summary?.total_lessons_completed ?? 0 },
      { label: 'XP this week', value: summary?.this_week?.xp_earned ?? 0 },
      { label: 'Time this week', value: `${Math.round((summary?.this_week?.practice_minutes || 0) / 60)}h` },
      { label: 'XP today', value: summary?.today?.xp_earned ?? 0 },
      { label: 'Time today', value: `${summary?.today?.practice_minutes || 0}m` },
    ],
    [summary]
  );

  if (isLoading) {
    return <SkeletonCard className="h-64" />;
  }

  if (!summary) {
    return <CardBody><p className="text-gray-400 text-sm">No summary available</p></CardBody>;
  }

  return (
    <CardBody>
      <h3 className="font-display text-xl text-white mb-4">Practice summary</h3>
      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-xl border border-white/10 bg-black/30 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{tile.label}</p>
            <p className="text-lg font-semibold text-white">{tile.value}</p>
          </div>
        ))}
      </div>
    </CardBody>
  );
}

function CardBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-6 shadow-xl">
      <div className="absolute inset-0 blur-3xl opacity-50 bg-gradient-to-br from-metal-accent/15 via-purple-700/20 to-black/70" />
      <div className="relative">{children}</div>
    </div>
  );
}

function InfoStat({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{label}</p>
      <p className={`text-lg font-semibold ${accent ? 'text-metal-accent' : 'text-white'}`}>{value}</p>
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return <div className={`rounded-3xl border border-white/10 bg-white/5 animate-pulse ${className ?? ''}`} />;
}
