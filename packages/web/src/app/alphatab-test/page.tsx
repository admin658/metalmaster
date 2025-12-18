'use client';

import { useMemo, useState } from 'react';
import AlphaTabWrapper from '@/components/AlphaTabWrapper';

type EventLogEntry = {
  type: string;
  message?: string;
  at: number;
};

type AlphaTabApiInstance = {
  audioContext?: AudioContext;
  playPause?: () => boolean;
  play?: () => void;
};

const demoTab = '/tabs/metallica-mercyful_fate.gp3';

export default function AlphaTabTestPage() {
  const [api, setApi] = useState<AlphaTabApiInstance | null>(null);
  const [status, setStatus] = useState<{ scoreLoaded: boolean; playbackReady: boolean; error: string | null }>({
    scoreLoaded: false,
    playbackReady: false,
    error: null,
  });
  const [positionMs, setPositionMs] = useState(0);
  const [events, setEvents] = useState<EventLogEntry[]>([]);

  const appendEvent = (type: string, message?: string) => {
    setEvents((prev) => [{ type, message, at: Date.now() }, ...prev].slice(0, 15));
  };

  const handlePlay = () => {
    if (!api) return;
    try {
      if (api.audioContext?.state === 'suspended') {
        void api.audioContext.resume();
      }
    } catch {
      // ignore resume errors
    }
    const didPlay = api.playPause ? api.playPause() : api.play?.();
    appendEvent('play', didPlay === false ? 'play returned false (not ready?)' : 'play triggered');
  };

  const playbackSummary = useMemo(() => {
    if (status.error) return status.error;
    if (status.playbackReady) return 'Ready for playback';
    if (status.scoreLoaded) return 'Score loaded, waiting on synth';
    return 'Loading score...';
  }, [status]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Diagnostics</p>
        <h1 className="text-3xl font-bold text-white">AlphaTab Readiness Test</h1>
        <p className="text-sm text-gray-300">
          Minimal repro for playback readiness. Loads a demo tab and exposes the core events we expect (&quot;ready for playback&quot;,
          soundfont fetch, and Play).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-950/60 shadow-xl">
          <AlphaTabWrapper
            fileSource={demoTab}
            className="w-full h-[55vh] bg-zinc-900"
            onApiReady={(instance) => {
              setApi(instance);
              appendEvent('api', 'AlphaTab API ready');
            }}
            onScoreLoaded={() => {
              setStatus((s) => ({ ...s, scoreLoaded: true }));
              appendEvent('score', 'Score loaded');
            }}
            onPlaybackReady={() => {
              setStatus((s) => ({ ...s, playbackReady: true, error: null }));
              appendEvent('ready', 'Ready for playback');
            }}
            onError={(message) => {
              setStatus((s) => ({ ...s, error: message, playbackReady: false }));
              appendEvent('error', message);
            }}
            onPositionChanged={(ms) => setPositionMs(ms)}
          />
        </div>

        <div className="rounded-2xl border border-white/10 bg-linear-to-br from-gray-900/80 via-gray-900/60 to-black/80 shadow-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 font-semibold">Playback</p>
              <p className="text-sm text-gray-200">{playbackSummary}</p>
            </div>
            <button
              onClick={handlePlay}
              disabled={!api}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 text-white font-semibold transition"
            >
              Play / Pause
            </button>
          </div>

          <div className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-1">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-semibold">State</p>
            <p className="text-sm text-gray-200">Score loaded: {status.scoreLoaded ? 'yes' : 'no'}</p>
            <p className="text-sm text-gray-200">Playback ready: {status.playbackReady ? 'yes' : 'no'}</p>
            <p className="text-sm text-gray-200">Position: {(positionMs / 1000).toFixed(2)}s</p>
            {status.error && <p className="text-sm text-red-300">Error: {status.error}</p>}
          </div>

          <div className="rounded-lg border border-white/10 bg-black/40 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400 font-semibold">Recent events</p>
              <span className="text-[11px] text-gray-500">{events.length} shown</span>
            </div>
            <div className="space-y-1 max-h-64 overflow-auto pr-1">
              {events.map((evt) => (
                <div key={`${evt.type}-${evt.at}`} className="text-xs text-gray-200">
                  <span className="text-red-300 font-semibold mr-2">{evt.type}</span>
                  <span className="text-gray-400">{new Date(evt.at).toLocaleTimeString()}</span>
                  {evt.message ? <span className="text-gray-300"> — {evt.message}</span> : null}
                </div>
              ))}
              {events.length === 0 && <p className="text-xs text-gray-500">No events yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
