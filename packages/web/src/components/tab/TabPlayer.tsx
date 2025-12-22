// packages/web/src/components/tab/TabPlayer.tsx

import React, { useState, useEffect, useRef, useMemo, FC } from 'react';
import * as Tone from 'tone';

import { GuitarAmpSimulator, GuitarAmpPreset } from '../../audio/GuitarAmpSimulator';
import NoteHighway2D from '../visual/NoteHighway2d';
import NoteHighway3D from '../visual/NoteHighway3d';
import TonePresetPanel from '../amp/TonePresetPanel';
import { createFeedbackEngine, ExpectedNote, type GradeSummary } from '../../audio/GuitarFeedbackEngine';
import RiffEvaluationResult from '../feedback/RiffEvaluationResult';
import { completeRiffXP } from '../../lib/CompleteRiffXP';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');

async function fetchUserAchievements(): Promise<{ id: string; name: string }[]> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (!token) return [];

  const res = await fetch(`${API_URL}/achievements`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error(`Failed to load achievements: ${res.status}`);

  const json = await res.json();
  return (json?.data || [])
    .map((a: any) => ({
      id: a.id || a.achievement_id || a?.achievements_library?.id,
      name: a?.achievements_library?.name || a.name,
    }))
    .filter((a: { id?: string; name?: string }) => a.id && a.name) as { id: string; name: string }[];
}

// --------------------------------------------------
// Types
// --------------------------------------------------

export type HighwayMode = '2D' | '3D';

export interface GuitarNote {
  time: number; // seconds from song start
  string: number; // 0-5 for 6 strings (low E = 0)
  fret: number; // 0+
  midi: number; // MIDI note number for AI feedback
}

interface TabPlayerProps {
  riffId: string; // Supabase / DB identifier for this riff
  notes: GuitarNote[]; // Timeline of notes for the riff
  tonePreset: GuitarAmpPreset; // Amp preset to use for this riff
}

const ampPresets: { label: string; preset: GuitarAmpPreset }[] = [
  {
    label: 'Modern Metal',
    preset: { name: 'Modern Metal', gain: 0.6, distortion: 0.75, eq: { bass: 3, mid: -2, treble: 4 }, reverb: 1.2, irUrl: null },
  },
  {
    label: 'Crunch Rhythm',
    preset: { name: 'Crunch Rhythm', gain: 0.35, distortion: 0.5, eq: { bass: 2, mid: 1, treble: 2.5 }, reverb: 0.6, irUrl: null },
  },
  {
    label: 'Clean Chorus',
    preset: { name: 'Clean Chorus', gain: 0.15, distortion: 0.2, eq: { bass: 1, mid: 0, treble: 3 }, reverb: 2.2, irUrl: null },
  },
];

// --------------------------------------------------
// TabPlayer Component
// --------------------------------------------------

const TabPlayer: FC<TabPlayerProps> = ({ riffId, notes, tonePreset }) => {
  const [mode, setMode] = useState<HighwayMode>('2D');
  const [playMode, setPlayMode] = useState<'playback' | 'rate'>('rate');
  const [currentPreset, setCurrentPreset] = useState<GuitarAmpPreset>(tonePreset);
  const [masterVolume, setMasterVolume] = useState<number>(0); // dB
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const [evalCount, setEvalCount] = useState(0);
  const [hitCount, setHitCount] = useState(0);

  const [showResult, setShowResult] = useState(false);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const [finalXP, setFinalXP] = useState(0);
  const [finalAchievements, setFinalAchievements] = useState<string[]>([]);
  const [gradeSummary, setGradeSummary] = useState<GradeSummary | null>(null);
  const [baselineAchievements, setBaselineAchievements] = useState<Set<string>>(new Set());

  const ampRef = useRef<GuitarAmpSimulator | null>(null);
  const synthRef = useRef<Tone.PolySynth | null>(null);
  const partRef = useRef<Tone.Part | null>(null);
  const feedbackRef = useRef<ReturnType<typeof createFeedbackEngine> | null>(null);
  const rafRef = useRef<number | null>(null);
  const playStartRef = useRef<number>(0);

  // Build expected note list for AI engine
  const expectedNotes: ExpectedNote[] = useMemo(
    () => notes.map((n) => ({ time: n.time, midi: n.midi })),
    [notes]
  );

  // Lazily create amp sim instance on client only
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!ampRef.current) {
      ampRef.current = new GuitarAmpSimulator();
    }
    if (ampRef.current && !synthRef.current) {
      synthRef.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.2, sustain: 0.6, release: 0.3 },
      })
        .connect(ampRef.current.input);
      synthRef.current.volume.value = 0;
    }
  }, []);

  // Prime baseline achievements so we can detect new unlocks per run
  useEffect(() => {
    async function primeAchievements() {
      try {
        const current = await fetchUserAchievements();
        setBaselineAchievements(new Set(current.map((a) => a.id)));
      } catch (err) {
        console.warn('Could not load baseline achievements', err);
      }
    }
    void primeAchievements();
  }, []);

  // Load preset when it changes
  useEffect(() => {
    async function applyPreset() {
      if (!ampRef.current) return;
      try {
        await ampRef.current.loadPreset(currentPreset);
      } catch (err) {
        console.error('Error loading preset:', err);
      }
    }
    void applyPreset();
  }, [currentPreset]);

  // Apply master volume to amp input gain
  useEffect(() => {
    if (!ampRef.current) return;
    const lin = typeof Tone.dbToGain === 'function'
      ? Tone.dbToGain(masterVolume)
      : Math.pow(10, masterVolume / 20);
    ampRef.current.input.gain.rampTo(lin, 0.05);
  }, [masterVolume]);

  // Main playback + feedback loop
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const loop = () => {
      const now = Tone.now();
      const t = Tone.Transport.seconds;
      setCurrentTime(t);

      if (feedbackRef.current) {
        const res = feedbackRef.current.evaluate(t);
        if (res) {
          setEvalCount((c) => c + 1);
          if (res.correct) {
            setHitCount((h) => h + 1);
          }
        }
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying]);

  // --------------------------------------------------
  // Handlers
  // --------------------------------------------------

  const handleStart = async () => {
    if (!ampRef.current) return;
    if (isPlaying) return;

    try {
      setShowResult(false);
      setGradeSummary(null);
      setEvalCount(0);
      setHitCount(0);

      await Tone.start(); // unlock audio on web

      // Create feedback engine once per session (best-effort; don't block playback if mic is denied)
      if (playMode === 'rate') {
        feedbackRef.current = createFeedbackEngine(expectedNotes);
        try {
          await feedbackRef.current.begin();
        } catch (err) {
          console.warn('Feedback engine unavailable, continuing without mic input', err);
          feedbackRef.current = null;
        }
      } else {
        feedbackRef.current = null;
      }

      // Align our time with Tone's clock
      playStartRef.current = Tone.now();

      // MIDI synthesis through the amp chain (no backing track)
      Tone.Transport.stop();
      Tone.Transport.cancel(0);
      if (partRef.current) {
        partRef.current.dispose();
        partRef.current = null;
      }
      partRef.current = new Tone.Part((time, value: { midi: number }) => {
        if (!synthRef.current) return;
        synthRef.current.triggerAttackRelease(`${value.midi}m`, '8n', time);
      }, notes.map((n) => ({ time: n.time, midi: n.midi })));
      partRef.current.start(0);
      Tone.Transport.seconds = 0;
      Tone.Transport.start();

      setIsPlaying(true);
    } catch (err) {
      console.error('Error starting playback:', err);
    }
  };

  const handleStop = async () => {
    if (!ampRef.current) return;
    if (!isPlaying) return;

    Tone.Transport.stop();
    Tone.Transport.cancel(0);
    synthRef.current?.releaseAll();
    if (partRef.current) {
      partRef.current.dispose();
      partRef.current = null;
    }
    setIsPlaying(false);

    // In playback-only mode, just stop playback.
    if (playMode !== 'rate') {
      setShowResult(false);
      setGradeSummary(null);
      return;
    }

    // Compute accuracy using captured grading summary (fallback to simple ratio)
    const summary = feedbackRef.current ? feedbackRef.current.summarize() : null;
    setGradeSummary(summary);
    const accuracy = summary?.gradePercent ?? (evalCount > 0 ? (hitCount / Math.max(evalCount, 1)) * 100 : 0);
    setFinalAccuracy(accuracy);

    // Send XP to Supabase
    try {
      const xp = await completeRiffXP(riffId, accuracy);
      setFinalXP(xp);

      // Pull achievements and surface any new unlocks for this run
      try {
        const latest = await fetchUserAchievements();
        const latestIds = new Set(latest.map((a) => a.id));
        const newUnlocks = latest.filter((a) => !baselineAchievements.has(a.id)).map((a) => a.name);
        setFinalAchievements(newUnlocks);
        setBaselineAchievements(latestIds);
      } catch (achErr) {
        console.warn('Could not load achievements after run', achErr);
        setFinalAchievements([]);
      }
    } catch (err) {
      console.error('Error awarding XP:', err);
    }

    setShowResult(true);
  };

  const handleRestart = async () => {
    await handleStop();
    setCurrentTime(0);
    setShowResult(false);
    await handleStart();
  };

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div
      style={{
        background: 'radial-gradient(circle at top, #1f2933, #020617)',
        borderRadius: 16,
        border: '1px solid rgba(248,113,113,0.25)',
        padding: 24,
        color: 'white',
        fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>MetalMaster Tab Player</h1>
          <p style={{ margin: 0, opacity: 0.7, fontSize: 14 }}>
            Rocksmith-style practice with real-time tone and AI feedback.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setMode('2D')}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: mode === '2D' ? '1px solid #f87171' : '1px solid #374151',
              background: mode === '2D' ? '#b91c1c' : '#020617',
              color: 'white',
              cursor: 'pointer',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            2D
          </button>
          <button
            onClick={() => setMode('3D')}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: mode === '3D' ? '1px solid #f87171' : '1px solid #374151',
              background: mode === '3D' ? '#b91c1c' : '#020617',
              color: 'white',
              cursor: 'pointer',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            3D
          </button>
        </div>
      </div>

      {/* Toggles */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ fontSize: 12, opacity: 0.7, alignSelf: 'center' }}>Play Mode:</span>
          <button
            onClick={() => {
              setPlayMode('playback');
              setShowResult(false);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: playMode === 'playback' ? '1px solid #22d3ee' : '1px solid #374151',
              background: playMode === 'playback' ? '#0ea5e9' : '#020617',
              color: 'white',
              cursor: 'pointer',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Playback Only
          </button>
          <button
            onClick={() => {
              setPlayMode('rate');
              setShowResult(false);
            }}
            style={{
              padding: '6px 12px',
              borderRadius: 999,
              border: playMode === 'rate' ? '1px solid #f87171' : '1px solid #374151',
              background: playMode === 'rate' ? '#b91c1c' : '#020617',
              color: 'white',
              cursor: 'pointer',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Rate My Shred
          </button>
        </div>
      </div>

      {/* Highway full width */}
      <div
        style={{
          padding: 12,
          borderRadius: 12,
          background: 'linear-gradient(to bottom, rgba(15,23,42,0.9), rgba(3,7,18,0.9))',
          border: '1px solid rgba(148,163,184,0.2)',
        }}
      >
        {mode === '2D' ? (
          <NoteHighway2D notes={notes} currentTime={currentTime} />
        ) : (
          <div style={{ height: 320 }}>
            <NoteHighway3D notes={notes} currentTime={currentTime} />
          </div>
        )}
      </div>

      {/* Controls + Amp */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 12,
          alignItems: 'stretch',
        }}
      >
        {/* Transport */}
        <div
          style={{
            padding: 12,
            borderRadius: 12,
            border: '1px solid rgba(148,163,184,0.3)',
            background: 'linear-gradient(to right, rgba(15,23,42,0.9), rgba(17,24,39,0.9))',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleStart}
              disabled={isPlaying}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 999,
                border: 'none',
                background: isPlaying ? '#4b5563' : 'linear-gradient(90deg,#f97316,#ef4444)',
                color: 'white',
                fontWeight: 600,
                cursor: isPlaying ? 'default' : 'pointer',
              }}
            >
              {isPlaying ? 'Playing' : 'Play'}
            </button>
            <button
              onClick={handleStop}
              disabled={!isPlaying}
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                border: '1px solid #ef4444',
                background: 'transparent',
                color: isPlaying ? '#fca5a5' : '#6b7280',
                cursor: isPlaying ? 'pointer' : 'default',
                fontWeight: 500,
              }}
            >
              Stop & Grade
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 12,
              opacity: 0.8,
            }}
          >
            <span>Time: {currentTime.toFixed(2)}s</span>
            <span>
              Hits: {hitCount} / {evalCount}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 12, opacity: 0.8 }}>Master Vol</span>
            <input
              type="range"
              min={-24}
              max={6}
              step={1}
              value={masterVolume}
              onChange={(e) => setMasterVolume(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#f97316' }}
            />
            <span style={{ width: 40, textAlign: 'right', fontSize: 12 }}>{masterVolume} dB</span>
          </div>
          {playMode === 'rate' ? (
            <p style={{ margin: 0, fontSize: 12, color: '#a7f3d0' }}>
              Rate My Shred: uses your mic for pitch detection and grades your run.
            </p>
          ) : (
            <p style={{ margin: 0, fontSize: 12, color: '#c7d2fe' }}>
              Playback Only: no mic access, just jam along to the tab.
            </p>
          )}
        </div>

        {/* Amp sim + results */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <TonePresetPanel
            preset={currentPreset}
            presets={ampPresets}
            onSelectPreset={(p) => setCurrentPreset(p)}
            onChange={(p) => setCurrentPreset(p)}
          />

          {showResult && (
            <RiffEvaluationResult
              accuracy={finalAccuracy}
              xp={finalXP}
              achievements={finalAchievements}
              summary={gradeSummary}
            />
          )}

          {showResult && (
            <button
              onClick={handleRestart}
              style={{
                marginTop: 4,
                padding: '6px 10px',
                borderRadius: 999,
                border: '1px solid #4b5563',
                background: '#020617',
                color: 'white',
                fontSize: 12,
                cursor: 'pointer',
                alignSelf: 'flex-start',
              }}
            >
              Restart Riff
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabPlayer;
