"use client";
import type { PlayerState } from "../types";

type Props = { state: PlayerState; dispatch: (a: any) => void; };

export default function PracticePanel({ state, dispatch }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
        <div className="text-sm font-semibold">Loop</div>
        <div className="mt-2 flex flex-wrap gap-2">
          <button
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800"
            onClick={() => dispatch({ type: "SET_LOOP_IN", seconds: state.positionSeconds })}
          >
            Set In
          </button>
          <button
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800"
            onClick={() => dispatch({ type: "SET_LOOP_OUT", seconds: state.positionSeconds + 10 })}
          >
            Set Out (+10s)
          </button>
          <button
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800"
            onClick={() => {
              dispatch({ type: "SET_LOOP_IN", seconds: null });
              dispatch({ type: "SET_LOOP_OUT", seconds: null });
            }}
          >
            Clear
          </button>
        </div>
        <div className="mt-2 text-xs text-zinc-400">
          In: {state.loopInSeconds ?? "—"} | Out: {state.loopOutSeconds ?? "—"} | Enabled:{" "}
          <span className="text-zinc-100">{state.loopEnabled ? "Yes" : "No"}</span>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
        <div className="text-sm font-semibold">Speed Trainer</div>
        <div className="mt-2 flex items-center gap-2">
          <input
            className="w-full"
            type="range"
            min={0.5}
            max={1.25}
            step={0.01}
            value={state.speed}
            onChange={(e) => dispatch({ type: "SET_SPEED", speed: Number(e.target.value) })}
          />
          <div className="w-14 text-right text-xs tabular-nums">{Math.round(state.speed * 100)}%</div>
        </div>
        <div className="mt-2 text-xs text-zinc-500">Later: start/target/step + “advance on perfect”.</div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
        <div className="text-sm font-semibold">Metronome</div>
        <div className="mt-2 flex items-center gap-2">
          <button
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800"
            onClick={() => dispatch({ type: "TOGGLE_METRONOME" })}
          >
            {state.metronomeEnabled ? "Metronome: On" : "Metronome: Off"}
          </button>
          <span className="text-xs text-zinc-400">BPM: {state.bpm}</span>
        </div>
        <div className="mt-2 text-xs text-zinc-500">
          Toggles AlphaTab metronome playback volume.
        </div>
      </div>
    </div>
  );
}
