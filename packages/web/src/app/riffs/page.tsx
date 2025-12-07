'use client';

import { useRiffs } from '@/hooks/useMetalMasterHooks';

export default function RiffsPage() {
  const { riffs, loading } = useRiffs();

  return (
    <div className="relative max-w-6xl mx-auto px-4 pb-16 pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-52 w-52 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-60 w-60 rounded-full bg-gradient-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
      </div>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Loop • slow down • lock in</p>
          <h1 className="font-display text-3xl sm:text-4xl text-white">Riff Vault</h1>
          <p className="text-gray-200 max-w-xl mt-2">
            Heavy phrases organized by tuning and difficulty for focused practice.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-100">
          Tab + audio ready
        </span>
      </header>

      {loading ? (
        <p className="text-gray-400">Loading riffs...</p>
      ) : !riffs || riffs.length === 0 ? (
        <div className="text-gray-400 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          No riffs available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {riffs.map((riff) => (
            <div
              key={riff.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/80 p-5 shadow-lg transition hover:-translate-y-1 hover:border-metal-accent/50"
            >
              <div className="absolute inset-px rounded-[1rem] bg-gradient-to-br from-white/5 to-white/0 opacity-60" />
              <div className="relative space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl text-white">{riff.title}</h3>
                    {riff.artist && <p className="text-sm text-gray-400">{riff.artist}</p>}
                  </div>
                  <div className="flex gap-2 text-xs text-gray-200">
                    {riff.difficulty && (
                      <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">
                        {riff.difficulty}
                      </span>
                    )}
                    {riff.tuning && (
                      <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">
                        {riff.tuning}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">{riff.description}</p>
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-metal-accent">
                  Open in tab player
                  <span aria-hidden>-&gt;</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
