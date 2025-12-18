"use client";

import { useCallback, useState } from "react";
import type { PlayerState } from "./types";
import { useAlphaTab } from "./useAlphaTab";

type Props = {
  state: PlayerState;
  dispatch: (a: any) => void;
  scoreUrl?: string;
};

export default function AlphaTabCanvas({ state, dispatch, scoreUrl = "/tabs/demo.gp5" }: Props) {
  const [mountEl, setMountEl] = useState<HTMLDivElement | null>(null);

  const setRef = useCallback((el: HTMLDivElement | null) => setMountEl(el), []);

  useAlphaTab({
    mountEl,
    scrollEl: "#mm-tab-scroll", // 👈 tell hook which element should scroll
    state,
    dispatch,
    scoreUrl,
    trackIndex: 0,
  });

  return (
    <div className="alpha-tab-light relative h-full w-full">
      {/* This is the element AlphaTab will scroll */}
      <div id="mm-tab-scroll" className="h-full w-full overflow-auto rounded-2xl">
        {/* AlphaTab mounts here */}
        <div ref={setRef} className="min-h-full w-full" />
      </div>
      <style jsx global>{`
        .alpha-tab-light,
        .alpha-tab-light #mm-tab-scroll {
          background: #ffffff;
          color: #111827;
        }
        .alpha-tab-light .at-selection div {
          background: rgba(29, 78, 216, 0.16);
        }
        .alpha-tab-light .at-cursor-bar {
          background: rgba(15, 118, 110, 0.18);
        }
        .alpha-tab-light .at-cursor-beat {
          background: rgba(15, 118, 110, 0.75);
          width: 3px;
        }
        .alpha-tab-light .at-highlight * {
          fill: #0f766e;
          stroke: #0f766e;
        }
      `}</style>
    </div>
  );
}
