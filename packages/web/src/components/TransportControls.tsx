'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TransportControlsProps {
  api: any;
  score: any;
  durationMs: number;
  positionMs: number;
  canPlay?: boolean;
  onPlayRequest?: (delayMs: number) => void;
  onStopRequest?: () => void;
  onSpeedChange?: (speed: number) => void;
  demoOptions?: { label: string; path: string }[];
  selectedDemoPath?: string;
  onSelectDemo?: (path: string) => void;
  currentLabel?: string;
}

const formatMs = (ms: number | undefined): string => {
  if (!ms || Number.isNaN(ms)) return '0:00';
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export default function TransportControls({
  api,
  score,
  durationMs,
  positionMs,
  canPlay = true,
  onPlayRequest,
  onStopRequest,
  onSpeedChange,
  demoOptions,
  selectedDemoPath = '',
  onSelectDemo,
  currentLabel,
}: TransportControlsProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loop, setLoop] = useState(false);
  const [syncTracks, setSyncTracks] = useState(true);
  const [metronome, setMetronome] = useState(false);
  const [learnMode, setLearnMode] = useState(false);
  const [minLearnSpeed, setMinLearnSpeed] = useState(0.6);
  const [slowdownStep, setSlowdownStep] = useState(0.1);
  const [countInBeats, setCountInBeats] = useState(4);
  const [countInVolume, setCountInVolume] = useState(0.6);
  const countdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPosition = useRef(0);

  useEffect(() => {
    if (!api) return;
    setSpeed(api.playbackSpeed ?? 1);
    setLoop(Boolean(api.isLooping));
    setMetronome((api.metronomeVolume ?? 0) > 0);
    setCountInVolume(api.countInVolume ?? 0.6);
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const handleStateChanged = (state: any) => {
      setIsPlaying(state.state === 1);
    };
    api.playerStateChanged.on(handleStateChanged);

    return () => {
      api.playerStateChanged.off?.(handleStateChanged);
    };
  }, [api]);

  useEffect(() => {
    if (!learnMode) {
      lastPosition.current = positionMs;
      return;
    }
    // Detect loop wrap: position reset significantly backwards.
    if (positionMs + 500 < lastPosition.current && speed > minLearnSpeed) {
      const nextSpeed = Math.max(minLearnSpeed, parseFloat((speed - slowdownStep).toFixed(2)));
      setSpeed(nextSpeed);
      if (api) api.playbackSpeed = nextSpeed;
      onSpeedChange?.(nextSpeed);
    }
    lastPosition.current = positionMs;
  }, [positionMs, learnMode, speed, minLearnSpeed, slowdownStep, api, onSpeedChange]);

  const handlePlayPause = () => {
    if (!api) return;
    // Resume audio context if suspended (some browsers require user gesture)
    try {
      if (api.audioContext?.state === 'suspended') {
        void api.audioContext.resume();
      }
    } catch {
      // ignore
    }

    if (isPlaying) {
      onStopRequest?.();
      api.stop?.();
      return;
    }

    if (countdownTimer.current) {
      clearTimeout(countdownTimer.current);
      countdownTimer.current = null;
    }

    const bpm = score?.tempo ?? score?.playbackInfo?.tempo;
    const delayMs =
      bpm && countInBeats > 0 ? Math.round((countInBeats * 60_000) / Math.max(1, bpm)) : 0;

    api.countInVolume = countInVolume;

    if (delayMs > 0) {
      countdownTimer.current = setTimeout(() => {
        const didPlay = api.playPause ? api.playPause() : api.play?.();
        if (didPlay === false) {
          console.warn('AlphaTab play returned false (likely not ready for playback)');
        }
      }, delayMs);
      onPlayRequest?.(delayMs);
    } else {
      const didPlay = api.playPause ? api.playPause() : api.play?.();
      if (didPlay === false) {
        console.warn('AlphaTab play returned false (likely not ready for playback)');
      } else {
        onPlayRequest?.(0);
      }
    }
  };
  const handleStop = () => {
    onStopRequest?.();
    api?.stop();
  };

  const handleSpeedChange = (v: number) => {
    setSpeed(v);
    if (api) api.playbackSpeed = v;
    onSpeedChange?.(v);
  };

  const handleLoopToggle = () => {
    const newState = !loop;
    setLoop(newState);
    if (api) api.isLooping = newState;
  };

  const handleMetronomeToggle = () => {
    const next = !metronome;
    setMetronome(next);
    if (api) api.metronomeVolume = next ? 1 : 0;
  };

  const progress = durationMs > 0 ? Math.min(100, (positionMs / durationMs) * 100) : 0;

  return (
    <div className="bg-zinc-950 border-t border-red-900/30 px-4 py-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayPause}
              className={`px-4 py-2 rounded-lg font-semibold transition text-white ${
                canPlay
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
              }`}
              disabled={!canPlay}
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={handleStop}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold transition"
            >
              Stop
            </button>
          </div>

          {demoOptions?.length ? (
            <div className="flex items-center gap-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold">
                Demo
              </label>
              <select
                className="min-w-[220px] bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-100"
                value={selectedDemoPath}
                onChange={(e) => onSelectDemo?.(e.target.value)}
              >
                {demoOptions.map((file) => (
                  <option key={file.path} value={file.path}>
                    {file.label}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex gap-2">
            <button
              onClick={handleLoopToggle}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                loop
                  ? 'bg-red-600 text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              Loop
            </button>
            <button
              onClick={handleMetronomeToggle}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                metronome
                  ? 'bg-red-600/20 text-red-200 border border-red-600/50'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              Metronome
            </button>
            <button
              onClick={() => setSyncTracks(!syncTracks)}
              className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                syncTracks
                  ? 'bg-red-600/20 text-red-200 border border-red-600/50'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              Sync
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mb-1">
            Playback
          </p>
          <p className="text-lg font-mono font-bold text-red-200">
            {formatMs(positionMs)} / {formatMs(durationMs)}
          </p>
          {currentLabel ? (
            <p className="text-[11px] text-zinc-400 mt-1 truncate max-w-[220px] mx-auto">
              {currentLabel}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold w-20">
            Speed
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600"
          />
          <span className="text-sm font-semibold text-red-200 w-12 text-right">
            {(speed * 100).toFixed(0)}%
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold w-20">
            Learn Mode
          </label>
          <button
            onClick={() => setLearnMode(!learnMode)}
            className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
              learnMode
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
            }`}
          >
            {learnMode ? 'On (auto-slow)' : 'Off'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">Min</span>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.05"
              value={minLearnSpeed}
              onChange={(e) => setMinLearnSpeed(parseFloat(e.target.value))}
              className="h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 w-32"
            />
            <span className="text-sm text-red-200">{(minLearnSpeed * 100).toFixed(0)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">Step</span>
            <input
              type="range"
              min="0.02"
              max="0.2"
              step="0.01"
              value={slowdownStep}
              onChange={(e) => setSlowdownStep(parseFloat(e.target.value))}
              className="h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 w-24"
            />
            <span className="text-sm text-red-200">{Math.round(slowdownStep * 100)}%</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs uppercase tracking-widest text-zinc-500 font-semibold w-20">
            Count-In
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">Beats</span>
            <input
              type="range"
              min="0"
              max="8"
              step="1"
              value={countInBeats}
              onChange={(e) => setCountInBeats(parseInt(e.target.value, 10))}
              className="h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 w-32"
            />
            <span className="text-sm text-red-200">{countInBeats}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-zinc-400">Vol</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={countInVolume}
              onChange={(e) => {
                const v = parseFloat(e.target.value);
                setCountInVolume(v);
                if (api) api.countInVolume = v;
              }}
              className="h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-600 w-24"
            />
            <span className="text-sm text-red-200">{Math.round(countInVolume * 100)}%</span>
          </div>
        </div>

        <div className="w-full bg-zinc-800 rounded-lg h-1 overflow-hidden">
          <div
            className="bg-red-600 h-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {score && (
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Tracks: {score.tracks?.length ?? 0}</span>
          <span>BPM: {score.tempo ?? score.playbackInfo?.tempo ?? '--'}</span>
        </div>
      )}
    </div>
  );
}
