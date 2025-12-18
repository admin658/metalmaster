"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import usePitchDetection from "@/hooks/usePitchDetection";
import type { PlayerState } from "./types";

type Dispatch = (a: any) => void;

export function useCoach(state: PlayerState, dispatch: Dispatch) {
  const { start, detectPitch } = usePitchDetection();
  const rafRef = useRef<number | null>(null);
  const samplesRef = useRef(0);
  const hitsRef = useRef(0);
  const expectedRef = useRef<number[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);
  const lastDispatchRef = useRef(0);
  const listeningRef = useRef(false);

  useEffect(() => {
    expectedRef.current = state.coachExpectedMidis;
  }, [state.coachExpectedMidis]);

  const stopListening = useCallback(() => {
    listeningRef.current = false;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    dispatch({ type: "SET_COACH_LISTENING", listening: false });
  }, [dispatch]);

  const tick = useCallback(() => {
    if (!listeningRef.current) return;

    const pitch = detectPitch();
    const expected = expectedRef.current;
    const now = performance.now();

    if (pitch) {
      const midi = Math.round(12 * Math.log2(pitch / 440) + 69);
      if (expected.length) {
        samplesRef.current += 1;
        const hit = expected.some((m) => Math.abs(m - midi) <= 1);
        if (hit) hitsRef.current += 1;
      }

      const accuracy = samplesRef.current > 0 ? Math.round((hitsRef.current / samplesRef.current) * 100) : 0;
      if (now - lastDispatchRef.current > 160) {
        dispatch({
          type: "SET_COACH_METRICS",
          hits: hitsRef.current,
          samples: samplesRef.current,
          accuracy,
          pitchHz: pitch,
          midi,
        });
        lastDispatchRef.current = now;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [detectPitch, dispatch]);

  const startListening = useCallback(async () => {
    if (listeningRef.current) return;

    setLocalError(null);
    samplesRef.current = 0;
    hitsRef.current = 0;
    lastDispatchRef.current = 0;

    try {
      await start();
      dispatch({ type: "RESET_COACH_METRICS" });
      dispatch({ type: "SET_COACH_LISTENING", listening: true, error: null });
      listeningRef.current = true;
      rafRef.current = requestAnimationFrame(tick);
    } catch (err: any) {
      const msg = err?.message || "Microphone unavailable. Please allow mic access.";
      setLocalError(msg);
      dispatch({ type: "SET_COACH_LISTENING", listening: false, error: msg });
    }
  }, [dispatch, start, tick]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    startListening,
    stopListening,
    listening: state.coachListening,
    error: state.coachError || localError,
  };
}
