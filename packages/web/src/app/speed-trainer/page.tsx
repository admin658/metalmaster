"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import {
  useSpeedTrainerSessions,
  useSpeedTrainerProgress,
  useCreateSpeedTrainerSession,
  useUpdateSpeedTrainerSession,
} from '@/hooks/useSpeedTrainer';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import UpsellBanner from '@/components/billing/UpsellBanner';
import InlineUpsell from '@/components/billing/InlineUpsell';

const EXERCISE_TYPES = ['metronome', 'chugging', 'tremolo', 'downpicking', 'sweep_picking', 'tapping'];

export default function SpeedTrainerPage() {
  return (
    <>
      <UpsellBanner />
      <SubscriptionGate requiredPlan="pro">
        <SpeedTrainerContent />
      </SubscriptionGate>
    </>
  );
}

function SpeedTrainerContent() {
  const [page, setPage] = useState(1);
  const { sessions = [], total = 0, totalPages = 1, isLoading: sessionsLoading, mutate: mutateSessions } =
    useSpeedTrainerSessions(page, 10);
  const { create } = useCreateSpeedTrainerSession();
  const { update } = useUpdateSpeedTrainerSession();

  const [selectedExercise, setSelectedExercise] = useState('metronome');
  const [startingBpm, setStartingBpm] = useState(80);
  const [targetBpm, setTargetBpm] = useState(160);
  const [currentBpm, setCurrentBpm] = useState(80);
  const [isRunning, setIsRunning] = useState(false);
  const [duration, setDuration] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [autoIncrement, setAutoIncrement] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null as any);

  const { progress = [] } = useSpeedTrainerProgress(selectedExercise);
  const bestSession = progress[0];

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playMetronomeClick = () => {
    const ctx = initAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.frequency.value = 800;
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.start(now);
    osc.stop(now + 0.1);
  };

  const startSession = async () => {
    try {
      const session = await create({
        exercise_type: selectedExercise,
        starting_bpm: startingBpm,
        target_bpm: targetBpm,
        auto_increment_enabled: autoIncrement,
        notes: `Training ${selectedExercise}`,
      });

      if (session) {
        setCurrentSession(session.id);
        setCurrentBpm(startingBpm);
        setDuration(0);
        setIsRunning(true);
        mutateSessions();
      }
    } catch (err) {
      console.error('Failed to create session:', err);
    }
  };

  const stopSession = () => {
    setIsRunning(false);
    if (currentSession && audioContextRef.current?.state === 'running') {
      audioContextRef.current.suspend();
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current as any);
    }
  };

  const endSession = async () => {
    if (!currentSession) return;
    try {
      await update(currentSession, {
        ending_bpm: currentBpm,
        duration_seconds: duration,
        accuracy_percentage: accuracy,
      });
      mutateSessions();
      setCurrentSession(null);
      setIsRunning(false);
    } catch (err) {
      console.error('Failed to end session:', err);
    }
  };

  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      playMetronomeClick();
      setDuration((prev) => prev + 1);

      if (autoIncrement && currentBpm < targetBpm) {
        const newBpm = Math.min(currentBpm + 1, targetBpm);
        setCurrentBpm(newBpm);
      }
    }, 60000 / Math.max(1, currentBpm));

    timerRef.current = interval as any;
    return () => window.clearInterval(interval as any);
  }, [isRunning, currentBpm, targetBpm, autoIncrement]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const quickStats = useMemo(
    () => [
      { label: 'Current BPM', value: currentBpm, tone: 'from-metal-accent/30 via-orange-500/20 to-black/60' },
      {
        label: 'Target BPM',
        value: targetBpm,
        tone: 'from-purple-700/25 via-slate-800/50 to-black/60',
      },
      { label: 'Accuracy', value: `${accuracy}%`, tone: 'from-amber-500/25 via-amber-500/15 to-black/50' },
      { label: 'Duration', value: formatTime(duration), tone: 'from-teal-500/25 via-slate-800/50 to-black/60' },
    ],
    [currentBpm, targetBpm, accuracy, duration]
  );

  return (
    <div className="relative max-w-6xl mx-auto px-4 pb-16 pt-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-52 w-52 rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-amber-300/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-60 w-60 rounded-full bg-gradient-to-tr from-purple-800/25 via-slate-800/50 to-black/60 blur-3xl" />
      </div>

      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-gray-400">Tempo discipline</p>
          <h1 className="font-display text-3xl sm:text-4xl text-white">Speed Trainer</h1>
          <p className="text-gray-200 max-w-xl mt-2">
            Build down-pick stamina, gallops, and tremolo speed with guided tempo ramps.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-100">
          Metronome • Auto ramp • Session logs
        </span>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-6 shadow-2xl">
          <div className="absolute inset-0 blur-3xl opacity-60 bg-gradient-to-br from-metal-accent/20 via-purple-700/25 to-black/70" />
          <div className="relative grid gap-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-300">Active session</p>
                <h2 className="font-display text-4xl text-white">{currentBpm} BPM</h2>
                <p className="text-sm text-gray-300">Starting at {startingBpm} → Target {targetBpm}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Duration</p>
                <p className="text-2xl font-semibold text-white">{formatTime(duration)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Exercise Type">
                <select
                  value={selectedExercise}
                  onChange={(e) => setSelectedExercise((e.target as HTMLSelectElement).value)}
                  disabled={isRunning}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
                >
                  {EXERCISE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label={`Accuracy: ${accuracy}%`}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={accuracy}
                  onChange={(e) => setAccuracy(parseInt((e.target as HTMLInputElement).value || '100'))}
                  className="w-full accent-metal-accent"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Starting BPM">
                <input
                  type="number"
                  value={startingBpm}
                  onChange={(e) =>
                    setStartingBpm(Math.max(40, Math.min(300, parseInt((e.target as HTMLInputElement).value || '80'))))
                  }
                  disabled={isRunning}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
                />
              </FormField>
              <FormField label="Target BPM">
                <input
                  type="number"
                  value={targetBpm}
                  onChange={(e) =>
                    setTargetBpm(Math.max(40, Math.min(300, parseInt((e.target as HTMLInputElement).value || '160'))))
                  }
                  disabled={isRunning}
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white"
                />
              </FormField>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={autoIncrement}
                  onChange={(e) => setAutoIncrement((e.target as HTMLInputElement).checked)}
                  disabled={isRunning}
                  className="h-4 w-4 rounded border-white/20 bg-black/40"
                />
                Auto increment BPM each click
              </label>
              <div className="flex gap-3">
                {!isRunning ? (
                  <button
                    onClick={startSession}
                    className="inline-flex items-center gap-2 rounded-full bg-metal-accent px-5 py-2.5 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(255,107,53,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(255,107,53,0.45)]"
                  >
                    Start Training
                  </button>
                ) : (
                  <>
                    <button
                      onClick={stopSession}
                      className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-gray-100 transition hover:border-metal-accent/60"
                    >
                      Pause
                    </button>
                    <button
                      onClick={endSession}
                      className="rounded-full border border-red-500/60 bg-red-600/80 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(220,38,38,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_35px_rgba(220,38,38,0.35)]"
                    >
                      End Session
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-5 shadow-xl">
            <h3 className="font-display text-xl text-white mb-3">Highlights</h3>
            {bestSession ? (
              <div className="space-y-3 text-sm text-gray-200">
                <StatLine label="Personal best" value={`${bestSession.personal_best_bpm} BPM`} />
                <StatLine label="Average BPM" value={`${bestSession.average_bpm} BPM`} />
                <StatLine label="Total sessions" value={bestSession.total_sessions} />
                <StatLine
                  label="Last session"
                  value={new Date(bestSession.last_session_date).toLocaleDateString()}
                />
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No sessions yet. Start training!</p>
            )}
            <div className="mt-5">
              <InlineUpsell title="Unlimited Speed Trainer in PRO" message="Remove session caps and save full history." />
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 via-white/0 to-white/5 p-5 shadow-xl">
            <h4 className="font-display text-lg text-white mb-3">Quick stats</h4>
            <div className="grid grid-cols-2 gap-3">
              {quickStats.map((item) => (
                <div
                  key={item.label}
                  className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/70 via-gray-900/60 to-black/70 p-3"
                >
                  <div className={`absolute inset-0 blur-2xl opacity-70 bg-gradient-to-br ${item.tone}`} />
                  <div className="relative">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">{item.label}</p>
                    <p className="text-lg font-semibold text-white">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-white">Recent sessions</h3>
            <span className="text-xs text-gray-400">Latest 10</span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sessions.slice(0, 10).map((session) => (
              <div key={session.id} className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">
                    {session.exercise_type.charAt(0).toUpperCase() + session.exercise_type.slice(1).replace('_', ' ')}
                  </span>
                  <span className="text-xs text-gray-400">{new Date(session.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-xs text-gray-300 mt-1">
                  {session.current_bpm} BPM • {session.accuracy_percentage}% Accuracy
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/70 p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg text-white">All sessions</h3>
            <span className="text-xs text-gray-400">
              Page {page} of {Math.max(1, totalPages)}
            </span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {sessionsLoading ? (
              <div className="text-gray-400 text-sm">Loading sessions...</div>
            ) : sessions.length > 0 ? (
              sessions.map((session) => (
                <div key={session.id} className="rounded-xl border border-white/10 bg-black/30 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">
                      {session.exercise_type.charAt(0).toUpperCase() + session.exercise_type.slice(1).replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-400">{new Date(session.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="text-xs text-gray-300 mt-1">
                    {session.current_bpm} BPM • {session.accuracy_percentage}% Accuracy
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No sessions yet. Start training!</p>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex gap-2 mt-4 justify-center">
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
        </div>
      </section>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2 text-sm text-gray-300">
      <span className="text-xs uppercase tracking-[0.18em] text-gray-400">{label}</span>
      {children}
    </label>
  );
}

function StatLine({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-400 text-xs uppercase tracking-[0.18em]">{label}</span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </div>
  );
}
