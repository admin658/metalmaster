// useXpAndBadges.ts
// Front-end helper hook for Tab Lab / Practice flows
// Calls POST /api/xp/award when a loop completes or when a session ends.
//
// Drop-in usage example:
// const { awardForLoop, awardForSessionEnd, isAwarding, lastAward } = useXpAndBadges();
// awardForLoop({ lessonId: "L05", sessionKey, trackIndex, metrics });
//
// Assumptions:
// - You have a sessionKey + trackIndex already in your Tab Lab practice session logic.
// - You can compute PracticeMetrics incrementally (or at least at session end).

import { useCallback, useMemo, useRef, useState } from "react";

export type PracticeMetrics = {
  activeSeconds: number;
  totalSeconds: number;
  loopsCompleted: number;
  perfectLoops: number;
  perfectLoopStreakMax: number;
  avgTempoBpm: number;
  maxTempoBpm: number;
  pauses: number;
  seeks: number;
  loopSeconds: number;
  lessonMinutesToday: number;
  hadActivityGapOver20s: boolean;
};

export type XpAwardResponse = {
  ok: boolean;
  xpAwarded: number;
  breakdown: Record<string, number>;
  newlyEarnedBadges: Array<{ id: string; name?: string }>;
  totals?: { totalXp?: number; level?: number; streakDays?: number };
  completionUnlocked?: boolean;
  message?: string;
};

type AwardArgs = {
  lessonId: string;     // "L01".."L10"
  sessionKey: string;
  trackIndex: number;
  metrics: PracticeMetrics;
};

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data && (data.message as string)) || `Request failed: ${res.status}`);
  }
  return data as T;
}

// Simple throttle so you don't spam the backend on rapid loop events
function createThrottle(ms: number) {
  let last = 0;
  return () => {
    const now = Date.now();
    if (now - last < ms) return false;
    last = now;
    return true;
  };
}

export function useXpAndBadges(options?: { awardEndpoint?: string; throttleMs?: number }) {
  const awardEndpoint = options?.awardEndpoint ?? "/api/xp/award";
  const throttleMs = options?.throttleMs ?? 1500;

  const [isAwarding, setIsAwarding] = useState(false);
  const [lastAward, setLastAward] = useState<XpAwardResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const throttle = useMemo(() => createThrottle(throttleMs), [throttleMs]);

  // Keep a small local cache to avoid double-awarding on the same loop tick
  const lastSignatureRef = useRef<string>("");

  const award = useCallback(
    async (args: AwardArgs, mode: "loop" | "session_end") => {
      // basic anti-spam signature
      const sig = `${args.lessonId}:${args.sessionKey}:${args.trackIndex}:${args.metrics.loopsCompleted}:${args.metrics.perfectLoops}:${args.metrics.maxTempoBpm}:${mode}`;
      if (sig === lastSignatureRef.current) return;
      lastSignatureRef.current = sig;

      if (!throttle()) return;

      setIsAwarding(true);
      setError(null);

      try {
        const payload = { ...args, mode };
        const resp = await postJson<XpAwardResponse>(awardEndpoint, payload);
        setLastAward(resp);
      } catch (e: any) {
        setError(e?.message || "XP award failed");
      } finally {
        setIsAwarding(false);
      }
    },
    [awardEndpoint, throttle]
  );

  // Call this when a loop completes (best for dopamine drip)
  const awardForLoop = useCallback(
    async (args: AwardArgs) => {
      // You can choose to only award on perfect loops on the client side if desired:
      // if (args.metrics.perfectLoops === 0) return;
      await award(args, "loop");
    },
    [award]
  );

  // Call this when the user ends a practice session or exits the tab player
  const awardForSessionEnd = useCallback(
    async (args: AwardArgs) => {
      await award(args, "session_end");
    },
    [award]
  );

  return {
    awardForLoop,
    awardForSessionEnd,
    isAwarding,
    lastAward,
    error,
  };
}
