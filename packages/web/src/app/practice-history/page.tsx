'use client';

import { useState, useMemo } from 'react';
import { usePracticeSessions, usePracticeSessionStats } from '@/hooks/usePracticeSessions';

const FILTERS = [
  { label: 'All Types', value: '' },
  { label: 'Lesson', value: 'lesson' },
  { label: 'Riff Practice', value: 'riff_practice' },
  { label: 'Jam Session', value: 'jam_session' },
  { label: 'Speed Trainer', value: 'speed_trainer' },
  { label: 'Free Play', value: 'free_play' },
];

export default function PracticeHistoryPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { sessions = [], totalPages = 1, isLoading } = usePracticeSessions(page, 10, filter);
  const { stats, isLoading: statsLoading } = usePracticeSessionStats();

  const statTiles = useMemo(
    () => [
      { label: 'XP this week', value: stats?.xp_earned_this_week || 0 },
      { label: 'XP today', value: stats?.xp_earned_today || 0 },
      { label: 'Total sessions', value: stats?.total_sessions || 0 },
      { label: 'Total minutes', value: stats?.total_practice_minutes || 0 },
    ],
    [stats]
  );

  return (
    <div className="relative max-w-6xl mx-auto px-4 pb-16 pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-52 w-52 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-60 w-60 rounded-full bg-gradient-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Logbook</p>
          <h1 className="font-display text-3xl sm:text-4xl text-white">Practice History</h1>
          <p className="text-gray-200 mt-2">
            Filter and review every session with XP and duration at a glance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              onClick={() => {
                setFilter(item.value || undefined);
                setPage(1);
              }}
              className={`rounded-full px-3 py-2 text-xs font-semibold border ${
                (filter || '') === item.value
                  ? 'border-metal-accent bg-metal-accent/20 text-white'
                  : 'border-white/10 bg-white/5 text-gray-100 hover:border-metal-accent/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {statsLoading ? (
          <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-gray-400">
            Loading stats...
          </div>
        ) : (
          statTiles.map((tile) => (
            <div
              key={tile.label}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-4"
            >
              <div className="absolute inset-0 blur-2xl opacity-60 bg-gradient-to-br from-metal-accent/20 via-purple-700/25 to-black/70" />
              <div className="relative">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{tile.label}</p>
                <p className="text-xl font-semibold text-white">{tile.value}</p>
              </div>
            </div>
          ))
        )}
      </section>

      <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl text-white">Sessions</h2>
          <span className="text-xs text-gray-400">
            Page {page} / {Math.max(1, totalPages)}
          </span>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {isLoading ? (
            <p className="text-gray-400 text-sm">Loading sessions...</p>
          ) : sessions.length > 0 ? (
            sessions.map((s) => (
              <div key={s.id} className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white capitalize">
                      {s.session_type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-gray-400">{new Date(s.started_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">XP</p>
                    <p className="text-lg font-semibold text-metal-accent">{s.xp_earned}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-300 mt-2">Duration: {Math.round(s.duration_seconds / 60)} min</p>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-sm">No sessions found.</p>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex gap-2 mt-5 justify-center">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
