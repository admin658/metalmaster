"use client";
import type { PlayerState } from "../types";

type Props = { state: PlayerState; dispatch: (a: any) => void; };

const presets = ["Clean", "Crunch", "Thrash", "Djent", "Death", "Doom"] as const;

export default function TonePanel({}: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
        <div className="text-sm font-semibold">Presets</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800"
              onClick={() => alert(`Preset: ${p} (wire later)`)}
            >
              {p}
            </button>
          ))}
        </div>
        <div className="mt-2 text-xs text-zinc-500">Later: gate/OD/amp/cab/EQ chain controls.</div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
        <div className="text-sm font-semibold">Amp Strip (stub)</div>
        <div className="mt-2 grid gap-2">
          {["Gain", "Bass", "Mid", "Treble", "Presence", "Gate"].map((k) => (
            <label key={k} className="flex items-center gap-3 text-xs text-zinc-300">
              <span className="w-20 text-zinc-400">{k}</span>
              <input type="range" min={0} max={100} defaultValue={50} className="w-full" />
              <span className="w-10 text-right text-zinc-500">50</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
