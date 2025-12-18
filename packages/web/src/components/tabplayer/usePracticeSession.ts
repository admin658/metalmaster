"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { PlayerState } from "./types";
import type { PracticeSessionRow } from "./practiceSessionTypes";
import { applyRowToUi, stateToRow } from "./practiceSessionTypes";
import { useAlphaTabControllerOptional } from "./AlphaTabContext";

type Options = {
  sessionKey: string;
  scoreUrl: string;
  trackIndex: number;
  state: PlayerState;
  dispatch: (a: any) => void;

  // how often to save while user is interacting
  debounceMs?: number;

  // only save when user is logged in
  requireAuth?: boolean;
};

export function usePracticeSession({
  sessionKey,
  scoreUrl,
  trackIndex,
  state,
  dispatch,
  debounceMs = 900,
  requireAuth = true,
}: Options) {
  const alpha = useAlphaTabControllerOptional();
  const [ready, setReady] = useState(false);
  const [disabledReason, setDisabledReason] = useState<string | null>(null);

  const saveTimer = useRef<number | null>(null);
  const restoring = useRef(false);
  const lastSavedHash = useRef<string>("");

  const identity = useMemo(() => `${sessionKey}|${scoreUrl}|${trackIndex}`, [sessionKey, scoreUrl, trackIndex]);

  // Guard: missing Supabase env should just skip autosave
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setDisabledReason("Supabase env vars missing; autosave disabled");
    }
  }, []);

  // 1) Restore on mount/identity change
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setReady(false);

      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;

      if (requireAuth && !userId) {
        setReady(true);
        return;
      }

      if (disabledReason) {
        setReady(true);
        return;
      }

      const { data, error } = await supabase
        .from("practice_sessions")
        .select("session_key,track_index,position_seconds,speed,bpm,loop_enabled,loop_in_seconds,loop_out_seconds,active_section_id,current_bar_number,rack_tab,coach_open,ui")
        .eq("session_key", sessionKey)
        .eq("track_index", trackIndex)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        const msg = (error as any)?.message || "";
        const code = (error as any)?.code || "";

        // Column mismatch or table missing? disable autosave gracefully.
        if (code === "42703" || /practice_sessions/i.test(msg)) {
          setDisabledReason("Practice sessions table is missing autosave columns; apply migration 003 or adjust schema.");
        } else {
          setDisabledReason(`Autosave read failed: ${msg || code || "unknown error"}`);
        }
        // non-fatal: just start fresh
        setReady(true);
        return;
      }

      if (data) {
        restoring.current = true;

        // Apply UI state
        applyRowToUi(dispatch, data as PracticeSessionRow);

        // Then seek AlphaTab accurately
        // Use saved seconds (good) or you can store tickPosition later (best)
        const pos = (data as PracticeSessionRow).position_seconds ?? 0;
        alpha?.seekSeconds(pos);

        restoring.current = false;
      }

      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [identity, sessionKey, dispatch, alpha, requireAuth]);

  // 2) Debounced autosave whenever relevant state changes
  useEffect(() => {
    if (!ready) return;
    if (restoring.current) return;
    if (disabledReason) return;

    // Build a small “save signature” so we don’t spam identical writes
    const signature = JSON.stringify({
      positionSeconds: Math.round(state.positionSeconds * 10) / 10,
      speed: state.speed,
      bpm: state.bpm,
      loopEnabled: state.loopEnabled,
      loopIn: state.loopInSeconds,
      loopOut: state.loopOutSeconds,
      activeSectionId: state.activeSectionId,
      currentBarNumber: state.currentBarNumber,
      rackTab: state.rackTab,
      coachOpen: state.coachOpen,
      ui: {
        focusMode: state.focusMode,
        showPalmMute: state.showPalmMute,
        showAccents: state.showAccents,
        showFingering: state.showFingering,
        showRhythmHints: state.showRhythmHints,
        showStringNames: state.showStringNames,
        showStandardNotation: state.showStandardNotation,
      },
    });

    if (signature === lastSavedHash.current) return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);

    saveTimer.current = window.setTimeout(async () => {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth?.user?.id;
      const userEmail = auth?.user?.email;

      if (!userId) return;

      const row = stateToRow(state, sessionKey, trackIndex);

      // Ensure FK existence for users (FK constraint on practice_sessions.user_id)
      if (userEmail) {
        const { error: userUpsertError } = await supabase
          .from("users")
          .upsert({ id: userId, email: userEmail }, { onConflict: "id" });
        if (userUpsertError) {
          console.error("[practice_sessions upsert] user upsert error", userUpsertError);
          return;
        }
      }

      // Upsert on (user_id, session_key, track_index) to allow per-track sessions
      const { error } = await supabase
        .from("practice_sessions")
        .upsert(
          { ...row, user_id: userId },
          { onConflict: "user_id,session_key,track_index" }
        );

      if (error) {
        // Log the raw error to aid diagnosis (RLS, constraint, onConflict mismatch)
        console.error("[practice_sessions upsert] error", error, {
          message: (error as any)?.message,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
          code: (error as any)?.code,
          body: (error as any)?.body,
          row,
        });
        const msg = (error as any)?.message || "";
        const code = (error as any)?.code || "";
        if (code === "42703" || /column .* does not exist/i.test(msg)) {
          setDisabledReason("Practice sessions table missing expected columns; apply migration 003_practice_sessions_autosave.sql.");
        } else if (/on_conflict/i.test(msg) || /unique/i.test(msg)) {
          setDisabledReason(
            "Autosave failed because the UNIQUE (user_id, session_key, track_index) constraint is missing; ensure migration 003 ran.",
          );
        } else if (/permission/i.test(msg) || /policy/i.test(msg) || /RLS/i.test(msg)) {
          setDisabledReason("Autosave blocked by RLS; ensure policy practice_sessions_user_rw exists and auth token is present.");
        } else {
          setDisabledReason(`Autosave failed: ${msg || code || "unknown error"}`);
        }
      } else {
        lastSavedHash.current = signature;
      }
    }, debounceMs);

    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [ready, state, sessionKey, scoreUrl, trackIndex, debounceMs, requireAuth]);

  return { ready, disabledReason };
}
