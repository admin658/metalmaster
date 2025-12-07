'use client';

import { useJamTracks } from '@/hooks/useMetalMasterHooks';
export const dynamic = "force-dynamic";
export default function JamPage() {
  const { jamTracks, loading } = useJamTracks();

  return (
    <div className="relative max-w-6xl mx-auto px-4 pb-16 pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-52 w-52 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-60 w-60 rounded-full bg-gradient-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
      </div>

      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Backings and grooves</p>
          <h1 className="font-display text-3xl sm:text-4xl text-white">Jam Deck</h1>
          <p className="text-gray-200 max-w-xl mt-2">
            Choose a key, set your tempo, and jam with tight metal backings.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-100">
          Loop • Slowdown • Record
        </span>
      </header>

      {loading ? (
        <p className="text-gray-400">Loading jam tracks...</p>
      ) : !jamTracks || jamTracks.length === 0 ? (
        <div className="text-gray-400 bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          No jam tracks available yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jamTracks.map((track) => (
            <div
              key={track.id}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/80 p-5 shadow-lg transition hover:-translate-y-1 hover:border-metal-accent/50"
            >
              <div className="absolute inset-px rounded-[1rem] bg-gradient-to-br from-white/5 to-white/0 opacity-60" />
              <div className="relative space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-xl text-white">{track.title}</h3>
                    <p className="text-sm text-gray-400">{track.key}</p>
                  </div>
                  <div className="flex gap-2 text-xs text-gray-200">
                    {track.tempo && (
                      <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">
                        {track.tempo} BPM
                      </span>
                    )}
                    {track.duration && (
                      <span className="rounded-full bg-white/10 px-3 py-1 font-semibold">
                        {track.duration}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed">{track.description}</p>
                {track.audio_url ? (
                  <audio className="mt-2 w-full" controls preload="metadata" src={track.audio_url}>
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <p className="text-xs text-gray-400">Audio preview coming soon.</p>
                )}
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
