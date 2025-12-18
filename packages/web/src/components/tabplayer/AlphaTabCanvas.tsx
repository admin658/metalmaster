"use client";

import { useCallback, useState } from "react";
import type { PlayerState } from "./types";
import { useAlphaTab } from "./useAlphaTab";

type Props = {
  state: PlayerState;
  dispatch: (a: any) => void;
  scoreUrl?: string;
  isFullscreen?: boolean;
};

export default function AlphaTabCanvas({
  state,
  dispatch,
  scoreUrl = "/tabs/demo.gp5",
  isFullscreen = false,
}: Props) {
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

  const heightClass = isFullscreen ? "h-[calc(100vh-260px)]" : "h-[520px]";

  return (
    <div className={`relative w-full min-h-[420px] ${heightClass}`}>
      {/* This is the element AlphaTab will scroll */}
      <div id="mm-tab-scroll" className="h-full w-full overflow-auto rounded-2xl">
        {/* AlphaTab mounts here */}
        <div ref={setRef} className="min-h-full w-full" />
      </div>
    </div>
  );
}
