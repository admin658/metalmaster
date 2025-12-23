'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AchievementsIcon, HistoryIcon, LeaderboardIcon, StatsIcon } from '@/components/icons';
import { useLeaderboard, type LeaderboardEntry } from '@/hooks/useLeaderboard';
import { useAuth } from '@/hooks/useAuth';

type Period = 'weekly' | 'all_time';

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('weekly');
  const { entries, topThree, isLoading, error } = useLeaderboard(period);
  const { user } = useAuth();

  const orderedEntries = useMemo(
    () =>
      [...entries]
        .sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0))
        .map((entry, index) => ({ ...entry, rank: index + 1 })),
    [entries]
  );

  const aggregates = useMemo(() => {
    const totalXp = orderedEntries.reduce((sum, entry) => sum + (entry.xp || 0), 0);
    const avgStreak = orderedEntries.length
      ? Math.round(
          orderedEntries.reduce((sum, entry) => sum + (entry.streak_days || 0), 0) /
            orderedEntries.length
        )
      : 0;
    const topTone = orderedEntries.reduce((max, entry) => Math.max(max, entry.tone_score || 0), 0);
    return { totalXp, avgStreak, topTone };
  }, [orderedEntries]);

  const yourName = useMemo(() => {
    if (!user) return '';
    const fromEmail = (user.email || '').split('@')[0] || '';
    return user.username || fromEmail;
  }, [user]);

  const yourRow = useMemo(() => {
    if (!user) return null;
    return orderedEntries.find(
      (entry) =>
        entry.user_id === user.id ||
        (!!yourName && entry.username.toLowerCase() === yourName.toLowerCase())
    );
  }, [orderedEntries, user, yourName]);

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-52 w-52 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-60 w-60 rounded-full bg-gradient-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
      </div>

      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Competition</p>
          <h1 className="font-display text-3xl sm:text-4xl text-white">Leaderboard</h1>
          <p className="text-gray-200 max-w-2xl">
            Climb the weekly XP and streak ladder. Streak multipliers and tone scores keep the board
            honest, with top performers featured in the hall of fame.
          </p>
          <div className="flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200">
            <span className="rounded-full border border-amber-200/40 bg-amber-200/10 px-3 py-1">
              Live board
            </span>
            <span className="rounded-full border border-amber-200/40 bg-amber-200/10 px-3 py-1">
              Streak multipliers
            </span>
            <span className="rounded-full border border-amber-200/40 bg-amber-200/10 px-3 py-1">
              Tone score weighted
            </span>
          </div>
        </div>
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <PeriodToggle value="weekly" active={period === 'weekly'} onClick={() => setPeriod('weekly')} />
          <PeriodToggle value="all-time" active={period === 'all_time'} onClick={() => setPeriod('all_time')} />
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}. Showing fallback board while the API wakes up.
        </div>
      )}

      <Spotlight isLoading={isLoading} entries={topThree} period={period} />

      <div className="my-6 grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total XP on board"
          value={`${aggregates.totalXp.toLocaleString()} XP`}
          Icon={StatsIcon}
        />
        <StatCard title="Avg streak" value={`${aggregates.avgStreak} days`} Icon={HistoryIcon} />
        <StatCard title="Top tone score" value={`${aggregates.topTone}/100`} Icon={AchievementsIcon} />
      </div>

      <LeaderboardList
        entries={orderedEntries}
        isLoading={isLoading}
        highlightId={yourRow?.id}
        period={period}
      />

      <YourPlacement userName={yourName} row={yourRow} />
    </div>
  );
}

function PeriodToggle({
  value,
  active,
  onClick,
}: {
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${
        active
          ? 'border-amber-300/70 bg-amber-300/20 text-amber-100 shadow-[0_12px_30px_rgba(255,191,71,0.15)]'
          : 'border-white/10 bg-white/5 text-gray-200 hover:border-amber-300/50 hover:text-amber-100'
      }`}
    >
      {value}
      {active && <span className="text-amber-200">&rarr;</span>}
    </button>
  );
}

function Spotlight({
  entries,
  isLoading,
  period,
}: {
  entries: LeaderboardEntry[];
  isLoading: boolean;
  period: Period;
}) {
  const title = period === 'weekly' ? 'This week' : 'All time';

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Spotlight</p>
          <h2 className="font-display text-xl text-white">{title} top performers</h2>
        </div>
        <Link
          href="/auth/signup"
          className="hidden sm:inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-100 transition hover:border-amber-300/70"
        >
          Join the race
          <span className="text-amber-300">-&gt;</span>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {isLoading
          ? Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className="h-32 rounded-2xl border border-white/10 bg-white/5 animate-pulse"
              />
            ))
          : entries.map((entry, idx) => (
              <div
                key={entry.id}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#171921] via-[#10121a] to-black p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,107,53,0.08),transparent_40%)] opacity-70" />
                <div className="relative flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-300/15 text-lg font-display text-amber-100 border border-amber-200/40">
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-white">{entry.username}</p>
                    <p className="text-xs text-gray-400">
                      {entry.location || 'Unknown'} • {entry.streak_days} day streak
                    </p>
                    <p className="text-lg font-semibold text-metal-accent">{entry.xp.toLocaleString()} XP</p>
                  </div>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}

function StatCard({
  title,
  value,
  Icon,
}: {
  title: string;
  value: string;
  Icon: typeof LeaderboardIcon;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#13141b] via-[#0f1117] to-black p-4">
      <div className="absolute inset-px rounded-[1rem] bg-gradient-to-br from-white/5 to-transparent opacity-60" />
      <div className="relative flex items-center gap-3">
        <div className="rounded-xl bg-white/5 p-3 text-amber-200 shadow-inner shadow-black/40">
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">{title}</p>
          <p className="text-lg font-semibold text-white">{value}</p>
        </div>
      </div>
    </div>
  );
}

function LeaderboardList({
  entries,
  isLoading,
  highlightId,
  period,
}: {
  entries: Array<LeaderboardEntry & { rank: number }>;
  isLoading: boolean;
  highlightId?: string;
  period: Period;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-white/10 bg-gradient-to-br from-[#13141b] via-[#0f1117] to-black p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Full board</p>
          <h3 className="font-display text-xl text-white">Top players {period === 'weekly' ? 'this week' : 'all time'}</h3>
        </div>
      </div>

      <div className="grid grid-cols-[3rem_1fr_1fr_1fr] gap-3 text-xs uppercase tracking-[0.2em] text-gray-400">
        <span>#</span>
        <span>Player</span>
        <span>XP</span>
        <span>Streak</span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-12 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className={`grid grid-cols-[3rem_1fr_1fr_1fr] items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-3 transition hover:border-amber-300/40 ${
                highlightId === entry.id ? 'border-amber-300/70 bg-amber-300/10' : ''
              }`}
            >
              <span className="text-sm font-semibold text-amber-100">{entry.rank}</span>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-300/10 text-sm font-display text-amber-100 border border-amber-200/30">
                  {entry.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">{entry.username}</span>
                  <span className="text-[11px] uppercase tracking-[0.2em] text-gray-500">
                    {entry.location || 'Worldwide'}
                  </span>
                </div>
              </div>
              <span className="text-sm font-semibold text-metal-accent">{entry.xp.toLocaleString()} XP</span>
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <span>{entry.streak_days} days</span>
                {entry.tone_score !== undefined && (
                  <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] text-gray-100">
                    Tone {entry.tone_score}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function YourPlacement({ userName, row }: { userName: string; row: (LeaderboardEntry & { rank: number }) | null }) {
  if (!userName) {
    return (
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-gray-200">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Want your name here?</p>
          <p className="font-semibold text-white">Sign up, keep a streak alive, and you will show up automatically.</p>
        </div>
        <Link
          href="/auth/signup"
          className="inline-flex items-center gap-2 rounded-full border border-amber-300/50 bg-amber-300/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-300/80"
        >
          Create account
          <span className="text-amber-200">-&gt;</span>
        </Link>
      </div>
    );
  }

  if (!row) {
    return (
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-gray-200">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400">You</p>
        <p className="font-semibold text-white">
          Keep practicing—your runs this week will place you on the board automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-2xl border border-amber-300/60 bg-amber-300/10 px-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-300/20 text-sm font-display text-amber-100 border border-amber-200/50">
            {userName.slice(0, 1).toUpperCase()}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-xs uppercase tracking-[0.2em] text-amber-200">Your placement</span>
            <span className="text-sm font-semibold text-white">
              #{row.rank} • {row.xp.toLocaleString()} XP • {row.streak_days} day streak
            </span>
          </div>
        </div>
        {row.tone_score !== undefined && (
          <span className="rounded-full bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-100 border border-amber-200/40">
            Tone {row.tone_score}
          </span>
        )}
      </div>
    </div>
  );
}
