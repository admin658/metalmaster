"use client";

import { useAlphaTabControllerOptional } from "./AlphaTabContext";
import type { PlayerState } from "./types";

type Props = {
  state: PlayerState;
  dispatch: (a: any) => void;
};

export default function SectionMap({ state, dispatch }: Props) {
  const alpha = useAlphaTabControllerOptional();

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-2">
      <div className="flex items-center gap-2 overflow-x-auto">
        {state.sections.map((s) => {
          const active = s.id === state.activeSectionId;
          return (
            <button
              key={s.id}
              onClick={() => {
                dispatch({ type: "JUMP_SECTION", sectionId: s.id });
                alpha?.jumpToBar(s.bars[0]); // 🎯 exact bar start
              }}
              className={[
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs whitespace-nowrap",
                active
                  ? "border-red-500/60 bg-red-950/40 text-zinc-100"
                  : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800",
              ].join(" ")}
              title={`${s.label} (Bars ${s.bars[0]}–${s.bars[1]})`}
            >
              <span className="font-semibold">{s.label}</span>
              <span className="text-zinc-400">
                Bars {s.bars[0]}–{s.bars[1]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="ml-auto flex flex-wrap items-center gap-2">
        {[
          { key: "showPalmMute", label: "PM" },
          { key: "showAccents", label: "Accents" },
          { key: "showFingering", label: "Fingering" },
          { key: "showRhythmHints", label: "Rhythm" },
          { key: "showStringNames", label: "Strings" },
          { key: "showStandardNotation", label: "Std Notation" },
        ].map((item) => {
          const on = (state as any)[item.key];
          return (
            <button
              key={item.key}
              onClick={() => dispatch({ type: "TOGGLE_UI", key: item.key as any })}
              className={[
                "rounded-full border px-3 py-1 text-xs",
                on
                  ? "border-red-500/60 bg-red-950/40 text-zinc-100"
                  : "border-zinc-800 bg-zinc-950 text-zinc-300 hover:bg-zinc-800",
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}

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
    </div>
  );
}
