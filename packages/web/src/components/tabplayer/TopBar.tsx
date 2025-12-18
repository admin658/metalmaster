"use client";

import { type MouseEvent, useCallback, useEffect, useState } from "react";
import { useAlphaTabControllerOptional } from "./AlphaTabContext";
import type { PlayerState } from "./types";

type Props = {
  state: PlayerState;
  dispatch: (a: any) => void;
};

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function TopBar({ state, dispatch }: Props) {
  const progress = state.durationSeconds > 0 ? state.positionSeconds / state.durationSeconds : 0;
  const alpha = useAlphaTabControllerOptional();
  const [outputs, setOutputs] = useState<Array<{ id: string; name: string }>>([]);
  const [outputId, setOutputId] = useState<string | "">("");
  const [outputsLoading, setOutputsLoading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleTimelineClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!state.durationSeconds) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0;
    const clamped = Math.min(1, Math.max(0, pct));
    const target = state.durationSeconds * clamped;
    if (alpha) alpha.seekSeconds(target);
    else dispatch({ type: "SEEK", seconds: target });
  };

  const normalizeOutputs = (list: any[]) => {
    const seen = new Set<string>();
    return (list || [])
      .map((o) => {
        const rawId = o?.id ?? o?.identifier ?? o?.outputId ?? "";
        const id = rawId ? String(rawId) : "";
        const name = o?.name || o?.description || o?.label || "MIDI Device";
        return { id, name };
      })
      .filter((o) => {
        if (!o.id) return false; // ignore devices that don't report an id
        if (seen.has(o.id)) return false;
        seen.add(o.id);
        return true;
      });
  };

  const loadOutputs = useCallback(async () => {
    if (!alpha?.enumerateOutputs) {
      setOutputs([]);
      return;
    }
    setOutputsLoading(true);
    try {
      const list = await alpha.enumerateOutputs();
      setOutputs(normalizeOutputs(list || []));
    } catch (err) {
      console.error("[AlphaTab] MIDI output enumerate error", err);
      setOutputs([]);
    } finally {
      setOutputsLoading(false);
    }
  }, [alpha]);

  useEffect(() => {
    void loadOutputs();
  }, [loadOutputs]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleFullscreenToggle = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    const target = document.getElementById("tab-player-fullscreen");
    if (target?.requestFullscreen) {
      await target.requestFullscreen();
    }
  };

  return (
    <header className="sticky bottom-0 z-30 mt-auto border-t border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="flex h-[72px] items-center gap-3 px-3">
        {/* Left: Song info */}
        <div className="min-w-[260px] max-w-[420px]">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-zinc-800" />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{state.title}</div>
              <div className="truncate text-xs text-zinc-400">{state.subtitle}</div>
            </div>
          </div>
        </div>

        {/* Center: Transport */}
        <div className="flex flex-1 items-center justify-center gap-2">
          <button
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
            onClick={() => {
              if (alpha) alpha.playToggle();
              else dispatch({ type: "PLAY_TOGGLE" });
            }}
          >
            {state.status === "playing" ? "Pause" : "Play"}
          </button>

          <button
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
            onClick={() => {
              if (alpha) alpha.stop();
              else dispatch({ type: "STOP" });
            }}
          >
            Stop
          </button>

          <button
            className={`rounded-xl border px-3 py-2 text-sm hover:bg-zinc-800 ${
              state.loopEnabled ? "border-red-500/60 bg-red-950/40" : "border-zinc-800 bg-zinc-900"
            }`}
            onClick={() => dispatch({ type: "TOGGLE_LOOP" })}
            title="Loop"
          >
            Loop
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
            <span className="text-xs text-zinc-400">Speed</span>
            <input
              className="w-28"
              type="range"
              min={0.5}
              max={1.25}
              step={0.01}
              value={state.speed}
              onChange={(e) => dispatch({ type: "SET_SPEED", speed: Number(e.target.value) })}
            />
            <span className="w-12 text-right text-xs tabular-nums">{Math.round(state.speed * 100)}%</span>
          </div>

          <div className="hidden items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 md:flex">
            <span className="text-xs text-zinc-400">BPM</span>
            <input
              className="w-16 rounded-lg border border-zinc-800 bg-zinc-950 px-2 py-1 text-xs"
              type="number"
              value={state.bpm}
              onChange={(e) => dispatch({ type: "SET_BPM", bpm: Number(e.target.value) })}
            />
            <span className="text-xs text-zinc-500">{state.timeSig}</span>
          </div>

          {alpha?.setOutput && (
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs">
              <span className="text-zinc-400">MIDI Out</span>
              <select
                className="bg-transparent text-xs focus:outline-none"
                value={outputId}
                onChange={(e) => {
                  const next = e.target.value;
                  setOutputId(next);
                  alpha.setOutput(next || null);
                }}
              >
                <option value="">Default (Browser Synth)</option>
                {outputsLoading && <option disabled value="">Scanning...</option>}
                {!outputsLoading && outputs.length === 0 && <option disabled value="">No MIDI devices found</option>}
                {outputs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
              <button
                className="rounded border border-zinc-700 px-2 py-1 text-[11px] text-zinc-300 hover:bg-zinc-800"
                onClick={() => {
                  setOutputId("");
                  void loadOutputs();
                }}
                type="button"
                title={outputsLoading ? "Refreshing..." : "Refresh MIDI outputs"}
                disabled={outputsLoading}
              >
                {outputsLoading ? "Refreshing..." : "Refresh"}
              </button>
            </div>
          )}
        </div>

        {/* Right: Progress + XP */}
        <div className="min-w-[260px] max-w-[360px]">
          <div className="flex items-center justify-end gap-3">
            <div className="hidden text-right md:block">
              <div className="text-xs text-zinc-400">
                {formatTime(state.positionSeconds)} / {formatTime(state.durationSeconds)}
              </div>
              <div className="text-xs text-zinc-500">Section: {state.activeSectionId}</div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs">
              <span className="text-zinc-400">XP</span>{" "}
              <span className="font-semibold text-zinc-100">+{state.xpPreview}</span>{" "}
              <span className="text-zinc-500">🔥{state.streak}</span>
            </div>

            <button
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800"
              onClick={() => void handleFullscreenToggle()}
            >
              {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            </button>

            <button
              className="hidden rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800 lg:block"
              onClick={() => dispatch({ type: "TOGGLE_COACH" })}
            >
              Coach
            </button>
          </div>

          {/* Timeline */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full w-full cursor-pointer"
              onClick={handleTimelineClick}
              role="presentation"
              title="Timeline seek"
            >
              <div className="h-full bg-zinc-200/60" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
