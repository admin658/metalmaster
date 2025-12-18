"use client";

import type { PlayerState, RackTab } from "./types";
import PracticePanel from "./panels/PracticePanel";
import TonePanel from "./panels/TonePanel";
import MixerPanel from "./panels/MixerPanel";
import ToolsPanel from "./panels/ToolsPanel";

type Props = {
  state: PlayerState;
  dispatch: (a: any) => void;
};

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-xl border px-3 py-2 text-xs font-semibold",
        active ? "border-red-500/60 bg-red-950/40 text-zinc-100" : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function BottomRack({ state, dispatch }: Props) {
  const setTab = (tab: RackTab) => dispatch({ type: "SET_RACK_TAB", tab });

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <TabButton active={state.rackTab === "practice"} label="Practice" onClick={() => setTab("practice")} />
        <TabButton active={state.rackTab === "tone"} label="Tone" onClick={() => setTab("tone")} />
        <TabButton active={state.rackTab === "mixer"} label="Mixer" onClick={() => setTab("mixer")} />
        <TabButton active={state.rackTab === "tools"} label="Tools" onClick={() => setTab("tools")} />

        <div className="ml-auto flex items-center gap-2">
          <button
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs hover:bg-zinc-800 lg:hidden"
            onClick={() => dispatch({ type: "TOGGLE_COACH" })}
          >
            Coach
          </button>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
        {state.rackTab === "practice" && <PracticePanel state={state} dispatch={dispatch} />}
        {state.rackTab === "tone" && <TonePanel state={state} dispatch={dispatch} />}
        {state.rackTab === "mixer" && <MixerPanel state={state} dispatch={dispatch} />}
        {state.rackTab === "tools" && <ToolsPanel state={state} dispatch={dispatch} />}
      </div>
    </section>
  );
}
