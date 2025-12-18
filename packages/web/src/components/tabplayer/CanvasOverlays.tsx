"use client";

import type { PlayerState } from "./types";

type Props = {
  state: PlayerState;
  dispatch: (a: any) => void;
};

function Chip({
  on,
  label,
  onClick,
}: {
  on: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "rounded-full border px-3 py-1 text-xs",
        on ? "border-red-500/60 bg-red-950/40 text-zinc-100" : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

export default function CanvasOverlays({ state, dispatch }: Props) {
  return (
    <>
      {/* Top-left chips */}
      <div className="absolute left-3 top-3 flex flex-wrap gap-2">
        <Chip on={state.showPalmMute} label="PM" onClick={() => dispatch({ type: "TOGGLE_UI", key: "showPalmMute" })} />
        <Chip on={state.showAccents} label="Accents" onClick={() => dispatch({ type: "TOGGLE_UI", key: "showAccents" })} />
        <Chip on={state.showFingering} label="Fingering" onClick={() => dispatch({ type: "TOGGLE_UI", key: "showFingering" })} />
        <Chip on={state.showRhythmHints} label="Rhythm" onClick={() => dispatch({ type: "TOGGLE_UI", key: "showRhythmHints" })} />
        <Chip on={state.showStringNames} label="Strings" onClick={() => dispatch({ type: "TOGGLE_UI", key: "showStringNames" })} />
      </div>

      {/* Top-right controls */}
      <div className="absolute right-3 top-3 flex items-center gap-2">
        <button
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs hover:bg-zinc-800"
          onClick={() => dispatch({ type: "TOGGLE_UI", key: "focusMode" })}
        >
          {state.focusMode ? "Focus: On" : "Focus: Off"}
        </button>

        <button
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs hover:bg-zinc-800"
          title="Layout toggle (stub)"
        >
          Layout
        </button>
      </div>
    </>
  );
}
