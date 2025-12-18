"use client";

import type { PlayerState } from "./types";
import SectionMap from "./SectionMap";
import AlphaTabCanvas from "./AlphaTabCanvas";

type Props = {
  state: PlayerState;
  dispatch: (a: any) => void;
  scoreUrl: string;
};

export default function MainStage({ state, dispatch, scoreUrl }: Props) {
  return (
    <section className="flex min-h-[420px] flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-3 shadow-sm">
      <SectionMap state={state} dispatch={dispatch} />

      <div className="relative min-h-[340px] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
        <AlphaTabCanvas state={state} dispatch={dispatch} scoreUrl={scoreUrl} />
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
