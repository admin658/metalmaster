'use client';

import { useEffect, useMemo, useState } from 'react';
import { sectionForBar } from './sectionUtils';
import type { PlayerState } from './types';
import { useCoach } from './useCoach';

type Props = { state: PlayerState; dispatch: (a: any) => void };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function CoachPanel({ state, dispatch }: Props) {
  const completionPct = state.durationSeconds
    ? Math.min(100, Math.round((state.positionSeconds / state.durationSeconds) * 100))
    : 0;

  const section = sectionForBar(state.sections, state.currentBarNumber);
  const sectionProgressPct =
    section && section.bars[1] - section.bars[0] + 1 > 0
      ? Math.min(
          100,
          Math.round(
            ((state.currentBarNumber - section.bars[0]) / (section.bars[1] - section.bars[0] + 1)) *
              100
          )
        )
      : 0;

  const effectiveBpm = Math.round(state.bpm * state.speed);
  const loopLabel =
    state.loopEnabled && (state.loopInSeconds !== null || state.loopOutSeconds !== null)
      ? `${formatSeconds(state.loopInSeconds ?? 0)} - ${formatSeconds(
          state.loopOutSeconds ?? Math.max(state.loopInSeconds ?? 0, state.positionSeconds)
        )}`
      : state.loopEnabled
      ? 'Loop on (range not set)'
      : 'Loop off';

  const loopLength =
    state.loopInSeconds !== null && state.loopOutSeconds !== null
      ? state.loopOutSeconds - state.loopInSeconds
      : null;
  const loopSeconds = loopLength !== null && loopLength > 0 ? loopLength : null;

  const nextStepSpeed = Math.round(clamp(state.speed + 0.05, 0.5, 1.25) * 100) / 100;
  const downStepSpeed = Math.round(clamp(state.speed - 0.05, 0.5, 1.25) * 100) / 100;
  const nextStepBpm = Math.round(state.bpm * nextStepSpeed);

  const focusCue = state.loopEnabled
    ? 'Stay in the loop for 3 clean passes, then bump speed +5%.'
    : 'Set a loop around the tricky bars, then climb in 5% steps.';

  const sectionCue = section
    ? `You are in ${section.label} (bars ${section.bars[0]}-${section.bars[1]}). Aim to finish this section at ${effectiveBpm} BPM.`
    : 'Scroll to a section and set a loop to focus practice.';

  const goals = useMemo(
    () => [
      {
        id: 'accuracy',
        label: `2 clean loops at ${Math.round(state.bpm * 0.9)} BPM (90%)`,
      },
      {
        id: 'push',
        label: `Hit ${nextStepBpm} BPM (+5%) once the loop feels solid`,
      },
      {
        id: 'metronome',
        label: state.metronomeEnabled
          ? 'Keep metronome on for 1 more section'
          : 'Turn metronome on for the next section',
      },
      {
        id: 'section',
        label: section
          ? `Finish ${section.label} bars ${section.bars[0]}-${section.bars[1]}`
          : 'Pick a section and finish it end-to-end',
      },
    ],
    [state.bpm, state.metronomeEnabled, section, nextStepBpm]
  );

  const [completedGoals, setCompletedGoals] = useState<Set<string>>(new Set());
  const toggleGoal = (id: string) => {
    setCompletedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const resetGoals = () => setCompletedGoals(new Set());
  const goalsDonePct = goals.length ? Math.round((completedGoals.size / goals.length) * 100) : 0;

  const setLoopAroundCursor = () => {
    const center = Math.max(0, state.positionSeconds);
    const span = 8; // seconds window
    const start = Math.max(0, center - span / 2);
    const end = state.durationSeconds
      ? Math.min(state.durationSeconds, start + span)
      : start + span;

    dispatch({ type: 'SET_LOOP_IN', seconds: start });
    dispatch({ type: 'SET_LOOP_OUT', seconds: end });
    dispatch({ type: 'TOGGLE_LOOP_ON' });
  };

  const clearLoop = () => {
    dispatch({ type: 'SET_LOOP_IN', seconds: null });
    dispatch({ type: 'SET_LOOP_OUT', seconds: null });
    dispatch({ type: 'TOGGLE_LOOP_OFF' });
  };

  const bumpSpeed = (delta: number) => {
    dispatch({ type: 'SET_SPEED', speed: clamp(state.speed + delta, 0.5, 1.25) });
  };

  const metronomeCue = state.metronomeEnabled
    ? 'Metronome is ON — keep it for timing.'
    : 'Turn metronome on for the next reps.';
  const { startListening, stopListening, listening, error: coachError } = useCoach(state, dispatch);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    let mounted = true;
    const enumerate = async () => {
      try {
        const list = await navigator.mediaDevices.enumerateDevices();
        if (!mounted) return;
        setDevices(list.filter((d) => d.kind === 'audioinput'));
      } catch (e) {
        // ignore
      }
    };
    enumerate();
    return () => {
      mounted = false;
    };
  }, []);

  const refreshDevices = async () => {
    try {
      // request permission to get labels
      const s = await navigator.mediaDevices.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
    } catch (e) {
      // permission denied or no devices
    }
    try {
      const list = await navigator.mediaDevices.enumerateDevices();
      setDevices(list.filter((d) => d.kind === 'audioinput'));
    } catch (e) {
      // ignore
    }
  };

  // cleanup any pending grading timers on unmount
  useEffect(() => {
    return () => {
      try {
        const t = (window as any).__mm_grade_start_timer;
        if (t) clearTimeout(t);
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const expectedNotesLabel = state.coachExpectedMidis.length
    ? Array.from(new Set(state.coachExpectedMidis.map(midiToNoteName))).join(', ')
    : 'Move playhead to a note';
  const lastPitchLabel = state.coachLastMidi ? midiToNoteName(state.coachLastMidi) : '—';

  return (
    <div className="h-full rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Coach</div>
        <div className="text-xs text-zinc-500">real-time cues</div>
      </div>

      <div className="mt-3 grid gap-3">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Live Coach</span>
            <span
              className={['text-[11px]', listening ? 'text-green-400' : 'text-zinc-500'].join(' ')}
            >
              {listening ? 'listening via mic' : 'idle'}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
              <span className="text-xs text-zinc-400">Input</span>
              <select
                className="bg-transparent text-sm focus:outline-none"
                value={state.coachInputDeviceId ?? ''}
                onChange={async (e) => {
                  const next = e.target.value || null;
                  dispatch({ type: 'SET_COACH_INPUT_DEVICE', deviceId: next });
                  try {
                    // persist selection
                    localStorage.setItem('mm_coach_input_device', next ?? '');
                  } catch (err) {
                    // ignore
                  }

                  // pre-acquire permission / warm microphone for this device
                  try {
                    const c: MediaStreamConstraints = next
                      ? { audio: { deviceId: { exact: next } } }
                      : { audio: true };
                    const s = await navigator.mediaDevices.getUserMedia(
                      c as MediaStreamConstraints
                    );
                    s.getTracks().forEach((t) => t.stop());
                    // refresh device list to populate labels
                    const list = await navigator.mediaDevices.enumerateDevices();
                    setDevices(list.filter((d) => d.kind === 'audioinput'));
                  } catch (err: any) {
                    dispatch({
                      type: 'SET_COACH_LISTENING',
                      listening: false,
                      error: err?.message || 'Microphone permission denied',
                    });
                  }
                }}
              >
                <option value="">Default</option>
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || d.deviceId}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={refreshDevices}
                className="ml-2 rounded-md bg-white/5 px-2 py-1 text-xs text-zinc-300 hover:bg-white/10"
              >
                Refresh
              </button>
            </label>
            <button
              className="rounded-xl border border-green-700/60 bg-green-900/40 px-3 py-2 text-xs font-semibold text-green-100 hover:bg-green-900"
              onClick={async () => {
                if (listening) return;

                // pre-request mic permission so browser prompt doesn't interfere with count-in
                try {
                  const c: MediaStreamConstraints = state.coachInputDeviceId
                    ? { audio: { deviceId: { exact: state.coachInputDeviceId } } }
                    : { audio: true };
                  const prem = await navigator.mediaDevices.getUserMedia(
                    c as MediaStreamConstraints
                  );
                  prem.getTracks().forEach((t) => t.stop());
                } catch (e) {
                  // allow startListening to handle permission errors
                }

                // compute count-in delay based on BPM and time signature
                const bpm = state.bpm || 120;
                let beatsPerBar = 4;
                try {
                  const ts = state.timeSig || '4/4';
                  beatsPerBar = parseInt(ts.split('/')[0] ?? '4', 10) || 4;
                } catch {
                  beatsPerBar = 4;
                }
                const countInBars = (state.countInBars as number) || 1;
                const delayMs = Math.round((countInBars * beatsPerBar * 60000) / Math.max(1, bpm));

                // show a brief visual cue by dispatching a coach error-like message (re-uses UI slot)
                dispatch({
                  type: 'SET_COACH_LISTENING',
                  listening: false,
                  error: `Grading in ${Math.round(delayMs / 1000)}s…`,
                });

                // wait for count-in then start listening
                const startTimer = window.setTimeout(() => {
                  // clear the temporary message
                  dispatch({ type: 'SET_COACH_LISTENING', listening: true, error: null });
                  void startListening();

                  // determine listen duration: use loop range if set, otherwise 4 bars
                  let listenMs = 4 * beatsPerBar * Math.round(60000 / Math.max(1, bpm));
                  if (
                    state.loopEnabled &&
                    state.loopInSeconds !== null &&
                    state.loopOutSeconds !== null
                  ) {
                    listenMs = Math.max(
                      250,
                      Math.round((state.loopOutSeconds - state.loopInSeconds) * 1000)
                    );
                  }

                  // stop listening automatically after listenMs
                  window.setTimeout(() => {
                    stopListening();
                  }, listenMs);
                }, delayMs);

                // clear timers on unmount (handled by effect cleanup below)
                // store timer on window so it's reachable in cleanup
                (window as any).__mm_grade_start_timer = startTimer;
              }}
              disabled={listening}
            >
              Grade me
            </button>
            <button
              className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold text-zinc-100 hover:bg-zinc-900 disabled:opacity-60"
              onClick={stopListening}
              disabled={!listening && state.coachSamples === 0}
            >
              Stop & grade
            </button>
            <div className="text-[11px] text-zinc-500">
              Expected: <span className="text-zinc-200">{expectedNotesLabel}</span>{' '}
              <span className="text-zinc-500">({Math.round(state.coachBeatWindowMs)}ms beat)</span>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-300">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2">
              <div className="text-zinc-500">Accuracy</div>
              <div className="text-lg font-semibold text-zinc-50">
                {Math.round(state.coachAccuracy)}%
              </div>
              <div className="text-[11px] text-zinc-500">
                {state.coachHits} hits / {state.coachSamples} heard
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2">
              <div className="text-zinc-500">Pitch check</div>
              <div className="text-lg font-semibold text-zinc-50">{lastPitchLabel}</div>
              <div className="text-[11px] text-zinc-500">
                {state.coachLastPitchHz
                  ? `${state.coachLastPitchHz.toFixed(1)} Hz`
                  : 'Waiting for input'}
              </div>
            </div>
          </div>
          {coachError && (
            <div className="mt-2 rounded-xl border border-amber-500/60 bg-amber-950/40 px-3 py-2 text-xs text-amber-100">
              {coachError}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
          <div className="text-xs text-zinc-400">Session Progress</div>
          <div className="mt-2 h-3 overflow-hidden rounded-full bg-zinc-800">
            <div className="h-full bg-green-400/80" style={{ width: `${completionPct}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs text-zinc-500">
            <span>{formatSeconds(state.positionSeconds)} elapsed</span>
            <span>{formatSeconds(state.durationSeconds)} total</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="text-xs text-zinc-400">Current Focus</div>
            <div className="mt-2 grid grid-cols-1 gap-2 text-xs text-zinc-300">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2">
                <div className="text-zinc-500">Section</div>
                <div className="font-semibold">{section ? section.label : 'Not set'}</div>
                {section && (
                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
                    <div
                      className="h-full bg-blue-400/80"
                      style={{ width: `${sectionProgressPct}%` }}
                    />
                  </div>
                )}
                {section && (
                  <div className="mt-1 text-[11px] text-zinc-500">
                    Bars {section.bars[0]}-{section.bars[1]}
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2">
                <div className="text-zinc-500">Effective BPM</div>
                <div className="font-semibold">{effectiveBpm} BPM</div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  {Math.round(state.speed * 100)}% of {state.bpm} BPM
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2">
                <div className="text-zinc-500">Loop</div>
                <div className="font-semibold leading-tight">{loopLabel}</div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  {loopSeconds ? `${loopSeconds.toFixed(1)}s window • ` : ''}
                  {focusCue}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-2">
                <div className="text-zinc-500">Metronome</div>
                <div className="font-semibold">{state.metronomeEnabled ? 'On' : 'Off'}</div>
                <div className="mt-1 text-[11px] text-zinc-500">
                  {state.countInBars} bar count-in • bar {state.currentBarNumber}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Coach Actions</span>
              <span className="text-[11px] text-zinc-500">quick helpers</span>
            </div>
            <div className="mt-2 grid gap-2 text-xs">
              <button
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-left font-semibold text-zinc-100 hover:bg-zinc-900"
                onClick={setLoopAroundCursor}
                title="Set an 8s loop around the current playhead"
              >
                Loop current phrase (±4s)
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-left font-semibold text-zinc-100 hover:bg-zinc-900"
                  onClick={() => bumpSpeed(0.05)}
                  title="Increase speed by 5%"
                >
                  +5% → {nextStepBpm} BPM
                </button>
                <button
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-left font-semibold text-zinc-100 hover:bg-zinc-900"
                  onClick={() => bumpSpeed(-0.05)}
                  title="Decrease speed by 5%"
                >
                  -5% → {Math.round(state.bpm * downStepSpeed)} BPM
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-left text-zinc-100 hover:bg-zinc-900"
                  onClick={() => dispatch({ type: 'SET_SPEED', speed: 1 })}
                  title="Reset to base tempo"
                >
                  Reset speed (100%)
                </button>
                <button
                  className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-left text-zinc-100 hover:bg-zinc-900"
                  onClick={clearLoop}
                  title="Clear loop range"
                >
                  Clear loop
                </button>
              </div>
              <div className="text-[11px] text-zinc-500">{metronomeCue}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Practice Checklist</span>
              <button
                className="rounded border border-zinc-800 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800"
                onClick={resetGoals}
                type="button"
              >
                Reset
              </button>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div className="h-full bg-green-400/80" style={{ width: `${goalsDonePct}%` }} />
            </div>
            <div className="mt-2 space-y-2 text-xs text-zinc-300">
              {goals.map((goal) => {
                const done = completedGoals.has(goal.id);
                return (
                  <label
                    key={goal.id}
                    className={[
                      'flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2',
                      done
                        ? 'border-green-600/60 bg-green-900/30'
                        : 'border-zinc-800 bg-zinc-950 hover:bg-zinc-900',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 accent-red-500"
                      checked={done}
                      onChange={() => toggleGoal(goal.id)}
                    />
                    <span className="leading-snug">{goal.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
            <div className="text-xs text-zinc-400">Coach Notes</div>
            <ul className="mt-2 space-y-2 text-xs text-zinc-300">
              <li>{sectionCue}</li>
              <li>{focusCue}</li>
              <li>{metronomeCue}</li>
              <li>
                Streak: {state.streak} days • XP on deck: {state.xpPreview} (est.)
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatSeconds(seconds: number | null | undefined) {
  if (!seconds || Number.isNaN(seconds)) return '0:00';
  const s = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function midiToNoteName(midi: number) {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const index = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${names[index]}${octave}`;
}
