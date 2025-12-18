"use client";

import React, { createContext, useContext, useMemo, useRef } from "react";

export type AlphaTabControls = {
  playToggle: () => void;
  stop: () => void;
  seekSeconds: (seconds: number) => void;

  // NEW (bar-accurate)
  jumpToBar: (barNumber1Based: number) => void;

  setTrack: (index: number) => void;

  // MIDI output
  enumerateOutputs?: () => Promise<any[] | undefined>;
  setOutput?: (id: string | null) => void;
};

type AlphaTabCtx = {
  setControls: (c: AlphaTabControls | null) => void;
  getControls: () => AlphaTabControls | null;
};

const Ctx = createContext<AlphaTabCtx | null>(null);

export function AlphaTabProvider({ children }: { children: React.ReactNode }) {
  const controlsRef = useRef<AlphaTabControls | null>(null);

  const value = useMemo<AlphaTabCtx>(() => {
    return {
      setControls: (c) => {
        controlsRef.current = c;
      },
      getControls: () => controlsRef.current,
    };
  }, []);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAlphaTabController() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("AlphaTabProvider missing");
  const controls = ctx.getControls();
  if (!controls) throw new Error("AlphaTab not initialized yet");
  return controls;
}

export function useAlphaTabRegistrar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("AlphaTabProvider missing");
  return ctx.setControls;
}

// Optional access (returns null until alphaTab is ready).
export function useAlphaTabControllerOptional() {
  const ctx = useContext(Ctx);
  if (!ctx) return null;
  return ctx.getControls();
}
