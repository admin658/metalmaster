"use client";

import { useRef } from "react";
import Link from "next/link";

export type WhatsNewItem = {
  title: string;
  description: string;
  tag: string;
  date: string;
  href: string;
};

type Props = {
  items: WhatsNewItem[];
};

const SCROLL_GAP_PX = 12;

export default function WhatsNewStack({ items }: Props) {
  const listRef = useRef<HTMLDivElement | null>(null);

  const scrollByItem = (direction: 1 | -1) => {
    const list = listRef.current;
    if (!list) return;
    const firstItem = list.querySelector<HTMLElement>("[data-whatsnew-item]");
    const step = firstItem?.offsetHeight ?? 0;
    if (!step) return;
    list.scrollBy({ top: direction * (step + SCROLL_GAP_PX), behavior: "smooth" });
  };

  return (
    <div className="max-w-md">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">What's New</p>
          <h2 className="font-display text-lg sm:text-xl text-white">Fresh drops you can try now</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => scrollByItem(-1)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gray-200 hover:border-metal-accent/50"
            aria-label="Scroll updates up"
          >
            Up
          </button>
          <button
            type="button"
            onClick={() => scrollByItem(1)}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gray-200 hover:border-metal-accent/50"
            aria-label="Scroll updates down"
          >
            Down
          </button>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex max-h-[260px] flex-col gap-3 overflow-y-auto rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/60 via-black/70 to-gray-900/60 p-3"
      >
        {items.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            data-whatsnew-item
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-black/80 p-3 transition hover:-translate-y-0.5 hover:border-metal-accent/50"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-metal-accent/10 via-transparent to-purple-700/10 opacity-70" />
            <div className="relative flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-gray-200">
                  {item.tag}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">{item.date}</span>
              </div>
              <h3 className="font-display text-base text-white">{item.title}</h3>
              <p className="text-gray-200 leading-relaxed text-xs">{item.description}</p>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-metal-accent transition group-hover:translate-x-1">
                View update
                <span aria-hidden>-&gt;</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
