"use client";

import Link from "next/link";
import TopUserBadge from "./TopUserBadge";

const navLinks = [
  { href: "/learn", label: "Learn" },
  { href: "/riffs", label: "Riffs" },
  { href: "/jam", label: "Jam" },
  { href: "/tab-player", label: "Tab Lab" },
  { href: "/daily-riff", label: "Daily Riff" },
  { href: "/pricing", label: "Pricing" },
];

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-900/70 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center gap-4 px-4">
        <Link href="/" className="text-sm font-semibold text-white">
          Metal Master
        </Link>
        <nav className="hidden items-center gap-3 text-sm text-zinc-300 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg px-3 py-2 hover:bg-zinc-900">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <TopUserBadge />
        </div>
      </div>
    </header>
  );
}
