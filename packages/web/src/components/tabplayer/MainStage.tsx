"use client";

import type { PlayerState } from "./types";
import SectionMap from "./SectionMap";
import AlphaTabCanvas from "./AlphaTabCanvas";

type Props = {
  state: PlayerState;
  dispatch: (a: any) => void;
  scoreUrl: string;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
};

export default function MainStage({
  state,
  dispatch,
  scoreUrl,
  isFullscreen,
  onToggleFullscreen,
}: Props) {
  return (
    <section className="flex min-h-[420px] flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-sm">
      <SectionMap state={state} dispatch={dispatch} />

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={onToggleFullscreen}
          className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-800"
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>
      </div>

      <div className="relative min-h-[340px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <AlphaTabCanvas
          state={state}
          dispatch={dispatch}
          scoreUrl={scoreUrl}
          isFullscreen={isFullscreen}
        />
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-zinc-400">
        <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1">
          Track: <span className="text-zinc-100">{state.activeTrackId}</span>
        </span>
        <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1">
          Focus: <span className="text-zinc-100">{state.focusMode ? "On" : "Off"}</span>
        </span>
        <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1">
          Loop: <span className="text-zinc-100">{state.loopEnabled ? "On" : "Off"}</span>
        </span>
      </div>
    </section>
  );
}
