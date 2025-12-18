'use client';

import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import Link from 'next/link';
import { useMemo } from 'react';

export default function TopUserBadge() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { isPro, isLoading } = useSubscription();

  const displayName = useMemo(() => {
    if (user?.email) {
      const [name] = user.email.split('@');
      return name || user.email;
    }
    return 'Guest';
  }, [user]);

  const badgeLabel = isPro ? 'PRO' : 'Free';
  const badgeTone = isPro
    ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-black shadow-[0_6px_18px_rgba(255,183,77,0.45)] border border-amber-300/80'
    : 'bg-white/10 text-gray-200 border border-white/10';

  if (!user) {
    return (
      <div className="flex items-center gap-2 pr-2 shrink-0">
        <Link
          href="/auth/login"
          className="text-sm text-gray-200 hover:text-metal-accent transition"
        >
          Log in
        </Link>
        <Link
          href="/auth/signup"
          className="text-sm font-semibold text-black bg-metal-accent hover:bg-amber-400 transition px-3 py-2 rounded-full shadow-[0_10px_30px_rgba(255,107,53,0.4)] border border-metal-accent/60"
        >
          Join
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 pr-2 shrink-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-metal-accent/30 via-orange-500/25 to-black/70 border border-white/15 text-xs font-display text-metal-accent uppercase shadow-[0_8px_20px_rgba(255,117,71,0.25)]">
        {displayName[0]?.toUpperCase() || 'M'}
      </div>
      <div className="flex flex-col leading-tight max-w-40">
        <span className="text-[11px] text-gray-400">Signed in</span>
        <span className="text-sm text-white font-semibold truncate">{displayName}</span>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeTone}`}
      >
        {isLoading ? '...' : badgeLabel}
      </span>
      <button
        onClick={() => logout().catch(() => {})}
        disabled={authLoading}
        className="text-xs text-gray-200 hover:text-metal-accent transition px-3 py-1 border border-white/10 rounded-full"
      >
        {authLoading ? '...' : 'Sign out'}
      </button>
    </div>
  );
}
