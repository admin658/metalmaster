"use client";

import { useEffect, useMemo, useRef } from "react";
import * as alphaTab from "@coderline/alphatab";
import type { PlayerState as UiState } from "./types";
import { alphaTabSettingsJson } from "./alphatabTheme";
import { applyMetalContainerStyles, applyMetalTheme } from "../alphatab/metalTheme";
import { useAlphaTabRegistrar } from "./AlphaTabContext";
import { sectionForBar } from "./sectionUtils";

type Dispatch = (a: any) => void;

type Options = {
  mountEl: HTMLDivElement | null;
  scrollEl: string | HTMLElement; // selector or element to scroll
  state: UiState;
  dispatch: Dispatch;
  scoreUrl: string;
  trackIndex?: number;
};

function toUiStatus(playerState: alphaTab.synth.PlayerState): UiState["status"] {
  if (playerState === alphaTab.synth.PlayerState.Playing) return "playing";
  return "paused";
}

export function useAlphaTab({ mountEl, scrollEl, state, dispatch, scoreUrl, trackIndex = 0 }: Options) {
  const apiRef = useRef<alphaTab.AlphaTabApi | null>(null);
  const lastLoadedUrlRef = useRef<string | null>(null);
  const loadAbortRef = useRef<AbortController | null>(null);
  const lastBarRef = useRef<number>(-1);
  const lastBeatIdRef = useRef<number | null>(null);
  const registerControls = useAlphaTabRegistrar();

  const buildTracks = (score: alphaTab.model.Score) => {
    return (score.tracks ?? []).map((track, idx) => {
      const program = (track as any)?.playbackInfo?.program;
      const instrument = typeof program === "number" ? `Program ${program}` : undefined;
      return {
        id: String(track.index ?? idx),
        name: track.name || track.shortName || `Track ${idx + 1}`,
        instrument: instrument ? String(instrument) : undefined,
      };
    });
  };

  const deriveTimeSignature = (score: alphaTab.model.Score) => {
    const master = (score.masterBars?.[0] ?? null) as any;
    const numerator = master?.timeSignatureNumerator ?? master?.timeSignature?.numerator;
    const denominator = master?.timeSignatureDenominator ?? master?.timeSignature?.denominator;
    if (!numerator || !denominator) return null;
    return `${numerator}/${denominator}`;
  };

  const applyColors = (score: alphaTab.model.Score) => {
    applyMetalTheme(score, alphaTab);
  };

  const settings = useMemo(() => {
    const s = new alphaTab.Settings();
    s.fillFromJson(alphaTabSettingsJson as any);
    s.core.tex = true;
    return s;
  }, []);

  const sanitizeAlphaTex = (tex: string) => {
    return tex.replace(/\{[^}\n]*\}/g, (block) => {
      // Avoid touching metadata/strings; only clean simple effect blocks.
      if (block.includes("\"") || block.includes(":") || block.includes("\\")) return block;
      const inner = block.slice(1, -1).trim();
      if (!inner) return block;
      const parts = inner.split(/\s+/);
      const filtered = parts.filter((part) => part.toLowerCase() !== "null");
      if (filtered.length === parts.length) return block;
      if (filtered.length === 0) return "";
      return `{${filtered.join(" ")}}`;
    });
  };

  const loadScore = async (api: alphaTab.AlphaTabApi, url: string, track: number) => {
    if (/\.alphatex$/i.test(url)) {
      loadAbortRef.current?.abort();
      const controller = new AbortController();
      loadAbortRef.current = controller;
      try {
        const res = await fetch(url, { signal: controller.signal });
        const rawTex = await res.text();
        if (controller.signal.aborted) return;
        if (typeof (api as any).tex !== "function") {
          throw new Error("AlphaTab AlphaTex API not available");
        }
        const tex = sanitizeAlphaTex(rawTex);
        if (tex !== rawTex) {
          console.warn("[AlphaTab] AlphaTex sanitized: removed null effect tokens");
        }
        (api as any).tex(tex, [track]);
      } catch (err) {
        if ((err as any)?.name === "AbortError") return;
        console.error("[AlphaTab] AlphaTex load failed", err);
      }
      return;
    }
    api.load(url, [track]);
  };

  // Create/destroy API
  useEffect(() => {
    if (!mountEl) return;

    const api = new alphaTab.AlphaTabApi(mountEl, settings);
    apiRef.current = api;
    applyMetalContainerStyles(mountEl);

    // Ensure workers stay disabled and script points to the public asset
    if (typeof window !== "undefined") {
      api.settings.core.useWorkers = false;
      api.settings.core.scriptFile = new URL("/alphatab/alphaTab.js", window.location.origin).toString();
      const playerSettings = api.settings.player as any;
      playerSettings.soundFont = "/alphatab/soundfont/sonivox.sf2";
      playerSettings.percussionSoundFont = "/alphatab/soundfont/sonivox.sf2";
      api.updateSettings();
    }

    // Enable follow-cursor scrolling:
    // - choose what element should scroll (default is html,body)
    api.settings.player.scrollElement = scrollEl as any;

    // Continuous = keep up with cursor; OffScreen = only scroll when cursor leaves viewport
    api.settings.player.scrollMode = alphaTab.ScrollMode.Continuous;

    // Center the cursor vertically: offset half the scroll container height
    const scrollContainer =
      typeof scrollEl === "string" ? (document.querySelector(scrollEl) as HTMLElement | null) : (scrollEl as HTMLElement | null);
    const containerH = scrollContainer?.clientHeight ?? 0;
    api.settings.player.scrollOffsetY = containerH ? -containerH / 2 : -220;
    api.settings.player.scrollOffsetX = 120; // helps for horizontal mode
    api.settings.player.nativeBrowserSmoothScroll = true;

    // Apply settings changes to all components :contentReference[oaicite:11]{index=11}
    api.updateSettings(); // :contentReference[oaicite:12]{index=12}

    // Events -> UI
    const subError = api.error.on((err) => {
      console.error("[AlphaTab] error", err);
    });

    const subScoreColors = api.scoreLoaded.on((score) => {
      applyColors(score);
      lastBeatIdRef.current = null;

      const tracks = buildTracks(score);
      if (tracks.length) {
        dispatch({ type: "SET_TRACKS", tracks, activeTrackId: tracks[0].id });
      }

      const tempo = typeof (score as any).tempo === "number" ? (score as any).tempo : undefined;
      const timeSig = deriveTimeSignature(score);
      dispatch({
        type: "SET_SCORE_META",
        meta: {
          title: score.title || undefined,
          subtitle: (score as any).subTitle || undefined,
          bpm: tempo,
          timeSig: timeSig ?? undefined,
        },
      });

      apiRef.current?.render(); // force re-layout so style changes take effect
    });

    const subPos = api.playerPositionChanged.on((e) => {
      dispatch({ type: "SET_DURATION", seconds: e.endTime / 1000 });
      dispatch({ type: "SET_POSITION", seconds: e.currentTime / 1000 });

      // Optional: track current bar/section if tick cache is available
      const apiCurrent = apiRef.current;
      if (!apiCurrent?.tickCache || !apiCurrent.score) return;

      const tick = e.currentTick;
      const trackCount = apiCurrent.score.tracks?.length ?? 0;
      const trackSet = new Set<number>();
      for (let i = 0; i < trackCount; i++) trackSet.add(i);

      const lookup = apiCurrent.tickCache.findBeat(trackSet, tick);
      if (!lookup) return;

      const beatId = (lookup.beat as any)?.id ?? null;
      if (beatId !== null && beatId !== lastBeatIdRef.current) {
        lastBeatIdRef.current = beatId;
        const expectedMidis = Array.isArray((lookup as any)?.beat?.notes)
          ? (lookup as any).beat.notes
              .map((n: any) => (typeof n?.realValue === "number" ? Math.round(n.realValue) : null))
              .filter((n: number | null): n is number => n !== null)
          : [];
        const windowMs = typeof lookup.duration === "number" ? lookup.duration : 0;
        dispatch({ type: "SET_COACH_EXPECTATION", expected: expectedMidis, beatWindowMs: windowMs });
      }

      if (!lookup.masterBar?.masterBar) return;

      const playedMasterBar = lookup.masterBar.masterBar;
      const barIndex0 = apiCurrent.score.masterBars.indexOf(playedMasterBar);
      if (barIndex0 < 0) return;
      const barNumber1 = barIndex0 + 1;

      if (barNumber1 !== lastBarRef.current) {
        lastBarRef.current = barNumber1;
        dispatch({ type: "SET_CURRENT_BAR", barNumber: barNumber1 });
        const sec = sectionForBar(state.sections, barNumber1);
        if (sec && sec.id !== state.activeSectionId) {
          dispatch({ type: "SET_ACTIVE_SECTION", sectionId: sec.id });
        }
      }
    });

    const subState = api.playerStateChanged.on(() => {
      dispatch({ type: "SET_STATUS", status: toUiStatus(api.playerState) });
    });

    const subFinished = api.playerFinished.on(() => {
      dispatch({ type: "SET_STATUS", status: "paused" });
    });

    const cleanupSub = (sub: any) => {
      if (typeof sub === "function") {
        sub();
        return;
      }
      sub?.dispose?.();
    };

    return () => {
      try {
        cleanupSub(subError);
        cleanupSub(subScoreColors);
        cleanupSub(subPos);
        cleanupSub(subState);
        cleanupSub(subFinished);
      } catch {}
      loadAbortRef.current?.abort();
      api.destroy();
      apiRef.current = null;
      registerControls(null);
    };
  }, [mountEl, settings, dispatch, scrollEl, registerControls]);

  // Load score
  useEffect(() => {
    const api = apiRef.current;
    if (!api || !scoreUrl) return;
    if (lastLoadedUrlRef.current === scoreUrl) return;
    lastLoadedUrlRef.current = scoreUrl;

    void loadScore(api, scoreUrl, trackIndex);
  }, [scoreUrl, trackIndex]);

  // Push runtime props
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;

    api.playbackSpeed = state.speed;
    api.isLooping = state.loopEnabled;
  }, [state.speed, state.loopEnabled]);

  // Re-apply notation visibility when toggle changes
  useEffect(() => {
    const api = apiRef.current;
    if (!api || !api.score) return;
    applyColors(api.score);
    api.render();
  }, [state.showStandardNotation]);

  // Push metronome/count-in flags to AlphaTab synth
  useEffect(() => {
    const api = apiRef.current;
    if (!api) return;
    api.metronomeVolume = state.metronomeEnabled ? 1 : 0;
    api.countInVolume = state.countInBars > 0 ? 1 : 0;
  }, [state.metronomeEnabled, state.countInBars]);

  // Register controls in context (includes “snap scroll” on jumps)
  useEffect(() => {
    const controls = {
      playToggle() {
        apiRef.current?.playPause();
      },
      stop() {
        apiRef.current?.stop();
        dispatch({ type: "SET_POSITION", seconds: 0 });
        dispatch({ type: "SET_STATUS", status: "stopped" });
        apiRef.current?.scrollToCursor(); // immediate snap :contentReference[oaicite:13]{index=13}
      },
      seekSeconds(seconds: number) {
        const api = apiRef.current;
        if (!api) return;
        api.timePosition = Math.max(0, seconds * 1000);
        dispatch({ type: "SET_POSITION", seconds });
        api.scrollToCursor(); // snap on manual seek :contentReference[oaicite:14]{index=14}
      },
      jumpToBar(barNumber1Based: number) {
        const api = apiRef.current;
        if (!api?.score || !api.tickCache) return;

        const idx = barNumber1Based - 1;
        const masterBar = api.score.masterBars?.[idx];
        if (!masterBar) return;

        const startTick = api.tickCache.getMasterBarStart(masterBar);
        api.tickPosition = startTick;
        api.scrollToCursor(); // snap after jump :contentReference[oaicite:15]{index=15}
      },
      setTrack(index: number) {
        const api = apiRef.current;
        if (!api) return;
        dispatch({ type: "SET_ACTIVE_TRACK_INDEX", index });
        void loadScore(api, scoreUrl, index);
        api.scrollToCursor(); // keeps view aligned after rerender :contentReference[oaicite:16]{index=16}
      },
      async enumerateOutputs() {
        const api = apiRef.current as any;
        if (!api || typeof api.enumerateOutputDevices !== "function") return [];
        // Some browsers need playback to be ready before MIDI is initialized; bail early if not ready.
        if (api.isReadyForPlayback === false) return [];
        try {
          const outputs = await api.enumerateOutputDevices();
          return Array.isArray(outputs) ? outputs : [];
        } catch (err) {
          console.error("[AlphaTab] enumerateOutputDevices error", err);
          return [];
        }
      },
      async setOutput(device: alphaTab.synth.ISynthOutputDevice | null) {
        const api = apiRef.current as any;
        if (!api || typeof api.setOutputDevice !== "function") return;
        try {
          await api.setOutputDevice(device ?? null);
        } catch (err) {
          console.error("[AlphaTab] setOutputDevice error", err);
        }
      },
    } as const;

    registerControls(controls);
    return () => registerControls(null);
  }, [dispatch, registerControls, scoreUrl]);

  return { apiRef };
}
