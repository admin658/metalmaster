import type { PlayerState } from "./types";

export type PracticeSessionRow = {
  session_key: string;
  track_index: number;
  session_type: string;

  // legacy columns for compatibility with older schema
  duration_seconds?: number;
  started_at?: string;
  completed_at?: string;

  position_seconds: number;
  speed: number;
  bpm: number;

  loop_enabled: boolean;
  loop_in_seconds: number | null;
  loop_out_seconds: number | null;

  active_section_id: string | null;
  current_bar_number: number;

  rack_tab: string;
  coach_open: boolean;

  ui: Record<string, any>;
};

export function stateToRow(state: PlayerState, sessionKey: string, trackIndex: number): PracticeSessionRow {
  const nowIso = new Date().toISOString();
  return {
    session_key: sessionKey,
    track_index: trackIndex,
    session_type: "lesson", // default; adjust as needed

    // fallbacks for older schemas requiring these fields
    duration_seconds: Math.max(1, Math.round(state.positionSeconds || 0)),
    started_at: nowIso,
    completed_at: nowIso,

    position_seconds: state.positionSeconds,
    speed: state.speed,
    bpm: state.bpm,

    loop_enabled: state.loopEnabled,
    loop_in_seconds: state.loopInSeconds ?? null,
    loop_out_seconds: state.loopOutSeconds ?? null,

    active_section_id: state.activeSectionId ?? null,
    current_bar_number: state.currentBarNumber ?? 1,

    rack_tab: state.rackTab,
    coach_open: state.coachOpen,

  ui: {
    focusMode: state.focusMode,
    showPalmMute: state.showPalmMute,
    showAccents: state.showAccents,
    showFingering: state.showFingering,
    showRhythmHints: state.showRhythmHints,
    showStringNames: state.showStringNames,
    showStandardNotation: state.showStandardNotation,
  },
};
}

export function applyRowToUi(dispatch: (a: any) => void, row: PracticeSessionRow) {
  dispatch({ type: "SET_SPEED", speed: row.speed });
  dispatch({ type: "SET_BPM", bpm: row.bpm });

  if (row.loop_enabled) dispatch({ type: "TOGGLE_LOOP_ON" });
  else dispatch({ type: "TOGGLE_LOOP_OFF" });

  dispatch({ type: "SET_LOOP_IN", seconds: row.loop_in_seconds });
  dispatch({ type: "SET_LOOP_OUT", seconds: row.loop_out_seconds });

  if (row.active_section_id) dispatch({ type: "SET_ACTIVE_SECTION", sectionId: row.active_section_id });
  dispatch({ type: "SET_CURRENT_BAR", barNumber: row.current_bar_number });

  dispatch({ type: "SET_RACK_TAB", tab: row.rack_tab });
  dispatch({ type: "SET_COACH_OPEN", open: row.coach_open });

  // UI toggles (set explicitly, not toggle)
  dispatch({ type: "SET_UI_FLAGS", ui: row.ui });
}
