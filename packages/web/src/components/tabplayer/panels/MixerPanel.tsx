"use client";
import { useAlphaTabControllerOptional } from "../AlphaTabContext";
import type { PlayerState } from "../types";

type Props = { state: PlayerState; dispatch: (a: any) => void; };

export default function MixerPanel({ state, dispatch }: Props) {
  const alpha = useAlphaTabControllerOptional();

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {state.tracks.map((t, index) => {
        const active = t.id === state.activeTrackId;
        return (
          <div key={t.id} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">{t.name}</div>
                <div className="text-xs text-zinc-500">{t.instrument}</div>
              </div>
              <button
                className={[
                  "rounded-xl border px-3 py-2 text-xs",
                  active ? "border-red-500/60 bg-red-950/40" : "border-zinc-800 bg-zinc-900 hover:bg-zinc-800",
                ].join(" ")}
                onClick={() => {
                  if (alpha) alpha.setTrack(index);
                  else dispatch({ type: "SET_ACTIVE_TRACK_INDEX", index });
                }}
                title="Select track"
              >
                {active ? "Active" : "Select"}
              </button>
            </div>

            <div className="mt-3 grid gap-2 text-xs text-zinc-300">
              <label className="flex items-center gap-3">
                <span className="w-12 text-zinc-400">Vol</span>
                <input className="w-full" type="range" min={0} max={100} defaultValue={80} />
                <span className="w-10 text-right text-zinc-500">80</span>
              </label>
              <label className="flex items-center gap-3">
                <span className="w-12 text-zinc-400">Pan</span>
                <input className="w-full" type="range" min={-50} max={50} defaultValue={0} />
                <span className="w-10 text-right text-zinc-500">0</span>
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}
