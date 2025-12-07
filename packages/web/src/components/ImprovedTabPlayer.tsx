import type { TabSong } from '@metalmaster/shared-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import GuitarTabRenderer from './GuitarTabRenderer';

interface ImprovedTabPlayerProps {
  song?: TabSong;
  width?: number;
  height?: number;
  // When provided, the player will act as a remote UI: delegate play/pause/seek/tempo to parent
  onRequestPlay?: (delayMs?: number) => void;
  onRequestPause?: () => void;
  onRequestStop?: () => void;
  onRequestSeek?: (t: number) => void;
  onRequestTempoChange?: (multiplier: number) => void;
  // External timeline control (seconds). If present, the player uses this time for display
  externalCurrentTime?: number;
  // External playing state
  isExternalPlaying?: boolean;
}

interface WebkitWindow extends Window {
  webkitAudioContext?: typeof AudioContext;
}

// Small utility to play a short click at a given AudioContext time
// `destination` allows routing through a master gain for volume control.
const scheduleClick = (ctx: AudioContext, destination: AudioNode, when: number, volume = 0.25) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = 1000;
  gain.gain.value = 0;
  osc.connect(gain);
  gain.connect(destination);

  const attack = 0.002;
  const release = 0.03;
  gain.gain.setValueAtTime(0, when);
  gain.gain.linearRampToValueAtTime(volume, when + attack);
  gain.gain.linearRampToValueAtTime(0, when + attack + release);

  osc.start(when);
  osc.stop(when + attack + release + 0.01);
};

const ImprovedTabPlayer: React.FC<ImprovedTabPlayerProps> = (props) => {
  const { song, width = 900, height = 260 } = props;
  const propsRef = useRef<ImprovedTabPlayerProps | null>(null);
  useEffect(() => {
    propsRef.current = props;
  }, [props]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [tempoMultiplier, setTempoMultiplier] = useState(1); // 1 = original bpm
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(0);
  const [masterVolume, setMasterVolume] = useState(0.85);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const startRef = useRef<number>(0); // audioContext.currentTime that maps to song time 0
  const rafRef = useRef<number | null>(null);
  const scheduledBeatIdx = useRef<number>(0);

  const beats = song?.beats ?? [];

  // Map from song time -> playback time and vice versa using tempoMultiplier
  const songTimeToWallTime = useCallback(
    (songTime: number) => startRef.current + songTime / Math.max(1e-6, tempoMultiplier),
    [tempoMultiplier]
  );
  const wallTimeToSongTime = useCallback(
    (wallTime: number) => (wallTime - startRef.current) * Math.max(1e-6, tempoMultiplier),
    [tempoMultiplier]
  );

  // Start playback
  const play = useCallback(async () => {
    if (!song) return;
    // If parent provided a handler, delegate to it (and do not start internal audio)
    if (propsRef.current?.onRequestPlay) {
      propsRef.current.onRequestPlay();
      setIsPlaying(true);
      return;
    }
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        (window as WebkitWindow).webkitAudioContext)();
      const ctx = audioCtxRef.current;
      // create master gain for global volume control
      masterGainRef.current = ctx.createGain();
      masterGainRef.current.gain.value = masterVolume;
      masterGainRef.current.connect(ctx.destination);
    }
    const ctx = audioCtxRef.current!;
    await ctx.resume();

    // set startRef such that wallTimeToSongTime(now) === currentTime
    startRef.current = ctx.currentTime - currentTime / Math.max(1e-6, tempoMultiplier);

    // set the scheduled beat index to the first beat at or after currentTime
    scheduledBeatIdx.current = beats.findIndex((b) => b.timeSeconds >= currentTime);
    if (scheduledBeatIdx.current === -1) scheduledBeatIdx.current = beats.length;

    setIsPlaying(true);
  }, [beats, currentTime, song, tempoMultiplier, masterVolume]);

  const pause = useCallback(() => {
    // If parent provided handler, delegate
    if (propsRef.current?.onRequestPause) {
      propsRef.current.onRequestPause();
      setIsPlaying(false);
      return;
    }
    if (!audioCtxRef.current) return;
    // freeze currentTime to the song time mapped from wall clock
    const now = audioCtxRef.current.currentTime;
    setCurrentTime(wallTimeToSongTime(now));
    setIsPlaying(false);
  }, [wallTimeToSongTime]);

  const stop = useCallback(() => {
    if (propsRef.current?.onRequestStop) {
      propsRef.current.onRequestStop();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    scheduledBeatIdx.current = 0;
  }, []);

  // Seek to time (in song seconds)
  const seek = useCallback(
    (t: number) => {
      const clamped = Math.max(0, Math.min(t, song?.durationSeconds ?? t));
      // If parent provided handler, delegate
      if (propsRef.current?.onRequestSeek) {
        propsRef.current.onRequestSeek(clamped);
        setCurrentTime(clamped);
        return;
      }
      setCurrentTime(clamped);
      if (audioCtxRef.current && isPlaying) {
        // adjust startRef so that current song time maps to now
        startRef.current =
          audioCtxRef.current.currentTime - clamped / Math.max(1e-6, tempoMultiplier);
        scheduledBeatIdx.current = beats.findIndex((b) => b.timeSeconds >= clamped);
        if (scheduledBeatIdx.current === -1) scheduledBeatIdx.current = beats.length;
      }
    },
    [beats, isPlaying, song?.durationSeconds, tempoMultiplier]
  );

  // Main RAF loop: update currentTime and schedule clicks ahead
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const scheduleWindow = 0.5; // seconds ahead to schedule

    const step = () => {
      const now = ctx.currentTime;
      const songTime = wallTimeToSongTime(now);
      // Allow rewinds/seeks to move backward instead of forcing monotonic time
      setCurrentTime(Math.max(0, songTime));

      // Schedule beats within the window
      while (scheduledBeatIdx.current < beats.length) {
        const beat = beats[scheduledBeatIdx.current];
        const beatWallTime = songTimeToWallTime(beat.timeSeconds);
        if (beatWallTime <= now + scheduleWindow) {
          // schedule click at beatWallTime via masterGain
          scheduleClick(ctx, masterGainRef.current ?? ctx.destination, beatWallTime);
          scheduledBeatIdx.current += 1;
          continue;
        }
        break;
      }

      // Loop handling
      if (loopEnabled && loopEnd > loopStart && songTime >= loopEnd) {
        // rewind to loopStart
        startRef.current = ctx.currentTime - loopStart / Math.max(1e-6, tempoMultiplier);
        scheduledBeatIdx.current = beats.findIndex((b) => b.timeSeconds >= loopStart);
        if (scheduledBeatIdx.current === -1) scheduledBeatIdx.current = beats.length;
        setCurrentTime(loopStart);
      }

      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [
    isPlaying,
    beats,
    loopEnabled,
    loopStart,
    loopEnd,
    songTimeToWallTime,
    wallTimeToSongTime,
    song,
  ]);

  // Cleanup audio context on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {
          // Intentionally ignore errors when closing AudioContext on unmount
        }
        audioCtxRef.current = null;
        masterGainRef.current = null;
      }
    };
  }, []);

  // Reflect masterVolume into the audio graph
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      try {
        masterGainRef.current.gain.setValueAtTime(masterVolume, audioCtxRef.current.currentTime);
      } catch {
        // Ignore errors when setting volume (may occur if context is suspended)
      }
    }
  }, [masterVolume]);

  // Keyboard shortcuts: Space => play/pause, ArrowLeft/Right => seek
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        const displayPlaying = propsRef.current?.isExternalPlaying ?? isPlaying;
        if (displayPlaying) pause();
        else void play();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const displayTime = propsRef.current?.externalCurrentTime ?? currentTime;
        seek(Math.max(0, displayTime - 5));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        const displayTime = propsRef.current?.externalCurrentTime ?? currentTime;
        seek(Math.min(song?.durationSeconds ?? 0, displayTime + 5));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPlaying, pause, play, seek, currentTime, song?.durationSeconds]);

  if (!song) {
    return <div className="text-zinc-200">No song loaded</div>;
  }

  return (
    <div style={{ width }} className="text-zinc-100 space-y-3">
      {/* Main playback controls - large and prominent */}
      <div className="flex items-center gap-3 bg-black/40 rounded-xl px-4 py-3 border border-red-600/20">
        {(() => {
          const displayPlaying = propsRef.current?.isExternalPlaying ?? isPlaying;
          return (
            <button
              onClick={() => (displayPlaying ? pause() : void play())}
              aria-label="play-pause"
              className="px-6 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-lg shadow-lg shadow-red-600/40 transition-all hover:shadow-red-600/60"
            >
              {displayPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
          );
        })()}
        <button
          onClick={stop}
          className="px-5 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 border border-zinc-700 font-semibold transition-colors"
        >
          ⏹ Stop
        </button>

        {/* Timeline display */}
        <div className="ml-auto text-right text-sm text-zinc-300 font-mono min-w-[120px]">
          <div className="text-xs text-zinc-500 uppercase tracking-wide">Playback</div>
          <div className="text-lg font-bold text-white">
            {(() => {
              const displayTime = propsRef.current?.externalCurrentTime ?? currentTime;
              return `${displayTime.toFixed(1)}s / ${(song.durationSeconds ?? 0).toFixed(1)}s`;
            })()}
          </div>
        </div>
      </div>

      {/* Timeline slider - large and easy to interact with */}
      <div className="space-y-2 bg-black/40 rounded-xl px-4 py-4 border border-zinc-700/30">
        {(() => {
          const displayTime = propsRef.current?.externalCurrentTime ?? currentTime;
          return (
            <>
              <input
                type="range"
                min={0}
                max={song.durationSeconds ?? 0}
                step={0.01}
                value={displayTime}
                onChange={(e) => seek(Number(e.target.value))}
                className="w-full accent-red-500 h-2 rounded-lg appearance-none bg-zinc-800 cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(220, 38, 38) 0%, rgb(220, 38, 38) ${
                    (displayTime / (song.durationSeconds ?? 1)) * 100
                  }%, rgb(39, 39, 42) ${
                    (displayTime / (song.durationSeconds ?? 1)) * 100
                  }%, rgb(39, 39, 42) 100%)`,
                }}
                aria-label="seek"
              />
              <div className="flex justify-between text-xs text-zinc-400 font-mono">
                <span>
                  {Math.floor(displayTime / 60)}:
                  {`${Math.floor(displayTime % 60)}`.padStart(2, '0')}
                </span>
                <span>
                  {Math.floor((song.durationSeconds ?? 0) / 60)}:
                  {`${Math.floor((song.durationSeconds ?? 0) % 60)}`.padStart(2, '0')}
                </span>
              </div>
            </>
          );
        })()}
      </div>

      {/* Secondary controls - organized in rows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Tempo Control */}
        <div className="bg-black/40 rounded-xl px-4 py-3 border border-zinc-700/30 space-y-2">
          <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Tempo
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.01}
              value={tempoMultiplier}
              onChange={(e) => {
                const v = Number(e.target.value);
                setTempoMultiplier(v);
                if (propsRef.current?.onRequestTempoChange)
                  propsRef.current.onRequestTempoChange(v);
              }}
              className="flex-1 accent-red-500 h-2 rounded-lg appearance-none bg-zinc-800"
              aria-label="tempo"
            />
            <div className="text-right min-w-20">
              <div className="text-lg font-bold text-red-400">
                {(tempoMultiplier * (song?.bpm ?? 120)).toFixed(0)}
              </div>
              <div className="text-xs text-zinc-500">BPM</div>
            </div>
          </div>
        </div>

        {/* Volume Control */}
        <div className="bg-black/40 rounded-xl px-4 py-3 border border-zinc-700/30 space-y-2">
          <label className="block text-xs uppercase tracking-wider text-zinc-400 font-semibold">
            Master Volume
          </label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              className="flex-1 accent-red-500 h-2 rounded-lg appearance-none bg-zinc-800"
              aria-label="master volume"
            />
            <div className="text-right min-w-[60px]">
              <div className="text-lg font-bold text-cyan-400">
                {Math.round(masterVolume * 100)}%
              </div>
            </div>
          </div>
        </div>

        {/* Loop Controls */}
        <div className="bg-black/40 rounded-xl px-4 py-3 border border-zinc-700/30 space-y-3 md:col-span-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={loopEnabled}
              onChange={(e) => setLoopEnabled(e.target.checked)}
              className="w-5 h-5 rounded accent-red-500 cursor-pointer"
            />
            <span className="text-sm font-semibold text-zinc-200">Enable Loop Range</span>
          </label>

          {loopEnabled && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-700/30">
              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                  Loop Start (s)
                </label>
                <input
                  type="number"
                  value={Number(loopStart.toFixed(2))}
                  onChange={(e) => setLoopStart(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono text-sm"
                  step={0.1}
                  aria-label="loop start"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block mb-2">
                  Loop End (s)
                </label>
                <input
                  type="number"
                  value={Number(loopEnd.toFixed(2))}
                  onChange={(e) => setLoopEnd(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-100 font-mono text-sm"
                  step={0.1}
                  aria-label="loop end"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab rendering area - largest visual element */}
      <div className="rounded-2xl overflow-hidden border border-red-600/30 shadow-[0_0_50px_rgba(220,38,38,0.15)] bg-linear-to-b from-zinc-950 to-zinc-900">
        <GuitarTabRenderer song={song} width={width} height={height} currentTime={currentTime} />
      </div>
    </div>
  );
};

export default ImprovedTabPlayer;
