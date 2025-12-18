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
    <div className="relative h-[520px] w-full">
      {/* This is the element AlphaTab will scroll */}
      <div id="mm-tab-scroll" className="h-full w-full overflow-auto rounded-2xl">
        {/* AlphaTab mounts here */}
        <div ref={setRef} className="min-h-full w-full" />
      </div>
    </div>
  );
}
