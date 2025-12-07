import React from 'react'
import dynamic from 'next/dynamic'

const UserHeatmap = dynamic(() => import('./UserHeatmap'), { ssr: false })
const SkillProgressBars = dynamic(() => import('./SkillProgressBars'), { ssr: false })
const AchievementBadgesGrid = dynamic(() => import('./AchievementBadgesGrid'), { ssr: false })

export default function StatsOverview() {
  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20 }}>
      <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8 }}>
        <h3 style={{ margin: 0, marginBottom: 12 }}>Practice Heatmap</h3>
        <UserHeatmap />
      </div>

      <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8 }}>
        <h3 style={{ margin: 0, marginBottom: 12 }}>Skill Progress</h3>
        <SkillProgressBars />
      </div>

      <div style={{ background: '#f9fafb', padding: 16, borderRadius: 8 }}>
        <h3 style={{ margin: 0, marginBottom: 12 }}>Achievements</h3>
        <AchievementBadgesGrid />
      </div>
    </section>
  )
}
