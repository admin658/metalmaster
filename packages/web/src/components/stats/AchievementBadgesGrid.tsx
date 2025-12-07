import React from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Badge = {
  id: string
  name: string
  description?: string
  iconUrl?: string
  xpMultiplier?: number
}

export default function AchievementBadgesGrid({ className }: { className?: string }) {
  const { data: library, error: libErr } = useSWR<Badge[]>('/api/achievements/library', fetcher)
  const { data: earned, error: earnedErr } = useSWR<string[]>('/api/achievements', fetcher)

  if (libErr || earnedErr) return <div className={className}>Failed to load achievements.</div>
  if (!library || !earned) return <div className={className}>Loading achievements…</div>

  const earnedSet = new Set(earned)

  return (
    <div className={className} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(96px, 1fr))', gap: 12 }}>
      {library.map((b) => {
        const unlocked = earnedSet.has(b.id)
        return (
          <div key={b.id} style={{ position: 'relative', textAlign: 'center', padding: 8, borderRadius: 8, background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div style={{ width: 64, height: 64, margin: '0 auto', opacity: unlocked ? 1 : 0.25 }}>
              {b.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.iconUrl} alt={b.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#eee', borderRadius: 8 }} />
              )}
            </div>
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600 }}>{b.name}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{unlocked ? `x${b.xpMultiplier ?? 1} XP` : 'Locked'}</div>
            {!unlocked && <div style={{ position: 'absolute', inset: 0, borderRadius: 8, background: 'rgba(0,0,0,0.04)' }} />}
          </div>
        )
      })}
    </div>
  )
}
