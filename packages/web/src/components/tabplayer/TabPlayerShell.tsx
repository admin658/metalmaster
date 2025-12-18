"use client";

import { useMemo, useReducer, useState } from "react";
import BottomRack from "./BottomRack";
import CoachPanel from "./CoachPanel";
import MainStage from "./MainStage";
import TopBar from "./TopBar";
import type { PlayerState, RackTab } from "./types";
import { usePracticeSession } from "./usePracticeSession";

type Action =
  | { type: "PLAY_TOGGLE" }
  | { type: "STOP" }
  | { type: "SEEK"; seconds: number }
  | { type: "SET_SPEED"; speed: number }
  | { type: "SET_BPM"; bpm: number }
  | { type: "TOGGLE_LOOP" }
  | { type: "SET_LOOP_IN"; seconds: number | null }
  | { type: "SET_LOOP_OUT"; seconds: number | null }
  | { type: "SET_RACK_TAB"; tab: RackTab }
  | { type: "TOGGLE_COACH" }
  | { type: "JUMP_SECTION"; sectionId: string }
  | { type: "TOGGLE_METRONOME" }
  | {
      type: "TOGGLE_UI";
      key: keyof Pick<
        PlayerState,
        "focusMode" | "showPalmMute" | "showAccents" | "showFingering" | "showRhythmHints" | "showStringNames"
      >;
    }
  | { type: "SET_STATUS"; status: PlayerState["status"] }
  | { type: "SET_POSITION"; seconds: number }
  | { type: "SET_DURATION"; seconds: number }
  | { type: "SET_ACTIVE_TRACK_INDEX"; index: number }
  | { type: "SET_CURRENT_BAR"; barNumber: number }
  | { type: "SET_ACTIVE_SECTION"; sectionId: string }
  | { type: "TOGGLE_LOOP_ON" }
  | { type: "TOGGLE_LOOP_OFF" }
  | { type: "SET_COACH_OPEN"; open: boolean }
  | { type: "SET_UI_FLAGS"; ui: Record<string, any> }
  | { type: "SET_TRACKS"; tracks: PlayerState["tracks"]; activeTrackId?: string }
  | {
      type: "SET_SCORE_META";
      meta: Partial<Pick<PlayerState, "title" | "subtitle" | "bpm" | "timeSig">>;
    }
  | { type: "SET_COACH_EXPECTATION"; expected: number[]; beatWindowMs: number }
  | { type: "SET_COACH_LISTENING"; listening: boolean; error?: string | null }
  | { type: "RESET_COACH_METRICS" }
  | {
      type: "SET_COACH_METRICS";
      hits: number;
      samples: number;
      accuracy: number;
      pitchHz: number | null;
      midi: number | null;
    };

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function reducer(state: PlayerState, action: Action): PlayerState {
  switch (action.type) {
    case "PLAY_TOGGLE": {
      if (state.status === "playing") return { ...state, status: "paused" };
      return { ...state, status: "playing" };
    }
    case "STOP":
      return { ...state, status: "stopped", positionSeconds: 0 };
    case "SEEK":
      return { ...state, positionSeconds: clamp(action.seconds, 0, state.durationSeconds) };
    case "SET_SPEED":
      return { ...state, speed: clamp(action.speed, 0.5, 1.25) };
    case "SET_BPM":
      return { ...state, bpm: clamp(action.bpm, 30, 300) };
    case "TOGGLE_LOOP":
      return { ...state, loopEnabled: !state.loopEnabled };
    case "SET_LOOP_IN":
      return { ...state, loopInSeconds: action.seconds };
    case "SET_LOOP_OUT":
      return { ...state, loopOutSeconds: action.seconds };
    case "SET_RACK_TAB":
      return { ...state, rackTab: action.tab };
    case "TOGGLE_COACH":
      return { ...state, coachOpen: !state.coachOpen };
    case "JUMP_SECTION": {
      const sec = state.sections.find((s) => s.id === action.sectionId);
      if (!sec) return state;
      return { ...state, activeSectionId: sec.id };
    }
    case "TOGGLE_UI":
      return { ...state, [action.key]: !state[action.key] } as PlayerState;
    case "TOGGLE_METRONOME":
      return { ...state, metronomeEnabled: !state.metronomeEnabled };
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "SET_POSITION":
      return { ...state, positionSeconds: action.seconds };
    case "SET_DURATION":
      return { ...state, durationSeconds: action.seconds };
    case "SET_ACTIVE_TRACK_INDEX": {
      const track = state.tracks[action.index];
      return track ? { ...state, activeTrackId: track.id } : state;
    }
    case "SET_TRACKS": {
      const nextTracks = action.tracks;
      const requestedId = action.activeTrackId ?? state.activeTrackId;
      const activeTrackId =
        (requestedId && nextTracks.some((t) => t.id === requestedId) && requestedId) ||
        nextTracks[0]?.id ||
        state.activeTrackId;
      return { ...state, tracks: nextTracks, activeTrackId };
    }
    case "SET_SCORE_META": {
      const { title, subtitle, bpm, timeSig } = action.meta;
      return {
        ...state,
        title: title ?? state.title,
        subtitle: subtitle ?? state.subtitle,
        bpm: bpm !== undefined ? clamp(bpm, 30, 300) : state.bpm,
        timeSig: timeSig ?? state.timeSig,
      };
    }
    case "SET_CURRENT_BAR":
      return { ...state, currentBarNumber: action.barNumber };
    case "SET_ACTIVE_SECTION":
      return { ...state, activeSectionId: action.sectionId };
    case "TOGGLE_LOOP_ON":
      return { ...state, loopEnabled: true };
    case "TOGGLE_LOOP_OFF":
      return { ...state, loopEnabled: false };
    case "SET_COACH_OPEN":
      return { ...state, coachOpen: action.open };
    case "SET_UI_FLAGS":
      return {
        ...state,
        focusMode: !!action.ui.focusMode,
        showPalmMute: !!action.ui.showPalmMute,
        showAccents: !!action.ui.showAccents,
        showFingering: !!action.ui.showFingering,
        showRhythmHints: !!action.ui.showRhythmHints,
        showStringNames: !!action.ui.showStringNames,
      };
    case "SET_COACH_EXPECTATION":
      return {
        ...state,
        coachExpectedMidis: action.expected,
        coachBeatWindowMs: action.beatWindowMs,
      };
    case "SET_COACH_LISTENING":
      return {
        ...state,
        coachListening: action.listening,
        coachError: action.error ?? null,
      };
    case "RESET_COACH_METRICS":
      return {
        ...state,
        coachHits: 0,
        coachSamples: 0,
        coachAccuracy: 0,
        coachLastPitchHz: null,
        coachLastMidi: null,
      };
    case "SET_COACH_METRICS":
      return {
        ...state,
        coachHits: action.hits,
        coachSamples: action.samples,
        coachAccuracy: action.accuracy,
        coachLastPitchHz: action.pitchHz,
        coachLastMidi: action.midi,
      };
    default:
      return state;
  }
}

export default function TabPlayerShell() {
  const initial: PlayerState = useMemo(
    () => ({
      title: "Metal Master Lesson",
      subtitle: "Alternate Picking Drill",

      status: "stopped",
      bpm: 120,
      timeSig: "4/4",
      speed: 1.0,

      positionSeconds: 0,
      durationSeconds: 180,

      loopEnabled: false,
      loopInSeconds: null,
      loopOutSeconds: null,

      countInBars: 1,
      metronomeEnabled: false,
      currentBarNumber: 1,

      activeTrackId: "gtr1",
      tracks: [
        { id: "gtr1", name: "Guitar 1", instrument: "Electric Guitar" },
        { id: "bass", name: "Bass", instrument: "Electric Bass" },
        { id: "drums", name: "Drums", instrument: "Kit" },
      ],

      activeSectionId: "verse",
      sections: [
        { id: "intro", label: "Intro", bars: [1, 8] },
        { id: "verse", label: "Verse", bars: [9, 16] },
        { id: "chorus", label: "Chorus", bars: [17, 24] },
        { id: "solo", label: "Solo", bars: [25, 32] },
        { id: "outro", label: "Outro", bars: [33, 40] },
      ],

      rackTab: "practice",
      coachOpen: true,
      coachListening: false,
      coachError: null,
      coachSamples: 0,
      coachHits: 0,
      coachAccuracy: 0,
      coachLastPitchHz: null,
      coachLastMidi: null,
      coachExpectedMidis: [],
      coachBeatWindowMs: 0,

      focusMode: false,
      showPalmMute: true,
      showAccents: true,
      showFingering: false,
      showRhythmHints: true,
      showStringNames: false,
      showStandardNotation: true,

      xpPreview: 12,
      streak: 3,
    }),
    []
  );

  const [state, dispatch] = useReducer(reducer, initial);
  const [scoreUrl, setScoreUrl] = useState<string>("/tabs/Lesson 3 Alternate Picking Drill.gp5");
  const [label, setLabel] = useState<string>("Lesson 3 Alternate Picking Drill");
  // Replace this with the real lesson UUID from your data.
  const sessionKey = "de305d54-75b4-431b-adb2-eb6b9e546014";
  const trackIndex = 0;

  const { disabledReason } = usePracticeSession({
    sessionKey,
    scoreUrl,
    trackIndex,
    state,
    dispatch,
  });

  const demos = useMemo(
    () => [
      { label: "Lesson 1 Palm-Muted Chunk", url: "/tabs/Lesson 1_ Basic Palm-Muted Chunk.gp5" },
      { label: "Lesson 2 Power Chords", url: "/tabs/Lesson 2_ Power Chords & Downpicking.gp5" },
      { label: "Lesson 3 Alternate Picking Drill", url: "/tabs/Lesson 3 Alternate Picking Drill.gp5" },
    ],
    [],
  );

  const handleFile = (file: File | null) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setScoreUrl(objectUrl);
    setLabel(file.name);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col">
      {disabledReason && (
        <div className="mx-3 mb-2 rounded-xl border border-amber-500/60 bg-amber-950/40 px-3 py-2 text-xs text-amber-100">
          Autosave is disabled: {disabledReason}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 px-3 pb-1 text-sm text-zinc-200">
        <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
          <span className="text-xs text-zinc-400">Demo</span>
          <select
            className="bg-transparent text-sm focus:outline-none"
            value={scoreUrl}
            onChange={(e) => {
              const next = demos.find((d) => d.url === e.target.value);
              if (next) {
                setScoreUrl(next.url);
                setLabel(next.label);
              }
            }}
          >
            {demos.map((d) => (
              <option key={d.url} value={d.url}>
                {d.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
          <span className="text-xs text-zinc-400">Upload GP</span>
          <input
            type="file"
            accept=".gp3,.gp4,.gp5,.gpx"
            className="text-xs"
            onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
          />
        </label>

        <span className="text-xs text-zinc-500">Loaded: {label}</span>
      </div>

      <div className="flex flex-1 gap-3 px-3 pb-3">
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <MainStage state={state} dispatch={dispatch} scoreUrl={scoreUrl} />
          <BottomRack state={state} dispatch={dispatch} />
        </div>

        {state.coachOpen && (
          <aside className="hidden w-[340px] shrink-0 lg:block">
            <CoachPanel state={state} dispatch={dispatch} />
          </aside>
        )}
      </div>

      <TopBar state={state} dispatch={dispatch} />
    </div>
  );
}
