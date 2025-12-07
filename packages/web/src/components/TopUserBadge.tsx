"use client";

import { useMemo } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';

export default function TopUserBadge() {
  const { user } = useAuth();
  const { status, isPro, isLoading } = useSubscription();

  const displayName = useMemo(() => {
    if (user?.email) {
      const [name] = user.email.split('@');
      return name || user.email;
    }
    return 'Guest';
  }, [user]);

  const badgeLabel = isPro ? 'PRO' : 'Free';
  const badgeTone = isPro ? 'bg-metal-accent text-black' : 'bg-white/10 text-gray-200';

  return (
    <div className="hidden md:flex items-center gap-2 pr-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-metal-accent/30 via-orange-500/20 to-black/60 border border-white/10 text-xs font-display text-metal-accent uppercase">
        {displayName[0]?.toUpperCase() || 'M'}
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-gray-400">Signed in</span>
        <span className="text-sm text-white font-semibold truncate max-w-[140px]">{displayName}</span>
      </div>
      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeTone}`}>
        {isLoading ? '...' : badgeLabel}
      </span>
    </div>
  );
}
