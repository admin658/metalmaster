import React from 'react'
import useSWR from 'swr'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type SkillsResponse = {
  accuracy: number
  speed: number
  rhythm: number
  toneKnowledge: number
}

export default function SkillProgressBars({
  className
}: {
  className?: string
}) {
  const { data, error } = useSWR<SkillsResponse>('/api/user-stats/skills', fetcher)

  if (error) return <div className={className}>Failed to load skills.</div>
  if (!data) return <div className={className}>Loading skills…</div>

  const chartData = [
    { name: 'Accuracy', value: Math.round((data.accuracy ?? 0) * 100) },
    { name: 'Speed', value: Math.round((data.speed ?? 0) * 100) },
    { name: 'Rhythm', value: Math.round((data.rhythm ?? 0) * 100) },
    { name: 'Tone', value: Math.round((data.toneKnowledge ?? 0) * 100) }
  ]

  const colors = ['#2b6cb0', '#38a169', '#dd6b20', '#6b46c1']

  return (
    <div className={className} style={{ width: '100%', height: 200 }}>
      <ResponsiveContainer>
        <BarChart layout="vertical" data={chartData} margin={{ left: 20 }}>
          <XAxis type="number" domain={[0, 100]} hide />
          <YAxis type="category" dataKey="name" width={100} />
          <Tooltip formatter={(v: any) => `${v}%`} />
          <Bar dataKey="value" isAnimationActive={false}>
            {chartData.map((_, idx) => (
              <Cell key={idx} fill={colors[idx % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
