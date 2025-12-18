"use client";
import type { PlayerState } from "../types";

type Props = { state: PlayerState; dispatch: (a: any) => void; };

export default function ToolsPanel({}: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
        <div className="text-sm font-semibold">Tuning (stub)</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Standard", "Drop D", "Drop C", "Custom"].map((x) => (
            <button
              key={x}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800"
              onClick={() => alert(`Tuning: ${x} (wire later)`)}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
        <div className="text-sm font-semibold">Utilities</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Transpose", "Lefty Mode", "Export PDF", "Share Loop"].map((x) => (
            <button
              key={x}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800"
              onClick={() => alert(`${x} (wire later)`)}
            >
              {x}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
