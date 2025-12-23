"use client";

import Link from 'next/link';
import TopUserBadge from './TopUserBadge';

const navLinks = [
  { href: '/learn', label: 'Guided Path' },
  { href: '/tab-player', label: 'Tab Lab' },
  { href: '/jam', label: 'Jam Deck' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/pricing', label: 'Pricing' },
];

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0c0d12]/90 backdrop-blur">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:border-amber-300/60">
          <span className="h-6 w-6 rounded-full bg-gradient-to-br from-amber-300/80 to-amber-500/60 text-black flex items-center justify-center font-bold text-xs">
            MM
          </span>
          <span className="hidden sm:inline">Metal Master</span>
          <span className="rounded-full bg-amber-300/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-100">
            Live
          </span>
        </Link>

        <nav className="hidden items-center gap-2 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-semibold text-gray-200 transition hover:-translate-y-0.5 hover:text-amber-200 hover:bg-white/5"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/daily-riff"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 transition hover:border-amber-300/70 hover:bg-amber-300/25"
          >
            Daily Riff
            <span className="text-amber-200">-&gt;</span>
          </Link>
          <TopUserBadge />
        </div>
      </div>
    </header>
  );
}
