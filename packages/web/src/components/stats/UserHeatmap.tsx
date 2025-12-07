import React from 'react'
import useSWR from 'swr'
import CalendarHeatmap from 'react-calendar-heatmap'
import 'react-calendar-heatmap/dist/styles.css'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type HeatmapDatum = { date: string; count: number }

export default function UserHeatmap({ className }: { className?: string }) {
  const { data, error } = useSWR<HeatmapDatum[]>('/api/user-stats/heatmap', fetcher)

  if (error) return <div className={className}>Failed to load heatmap.</div>
  if (!data) return <div className={className}>Loading heatmap…</div>

  // react-calendar-heatmap expects objects with date and count
  const values = data.map((d) => ({ date: d.date, count: d.count }))

  return (
    <div className={className}>
      <CalendarHeatmap
        startDate={new Date(new Date().getFullYear(), 0, 1)}
        endDate={new Date()}
        values={values}
        showWeekdayLabels
        classForValue={(value: any) => {
          if (!value || !value.count) return 'color-empty'
          if (value.count >= 8) return 'color-github-4'
          if (value.count >= 5) return 'color-github-3'
          if (value.count >= 2) return 'color-github-2'
          return 'color-github-1'
        }}
        tooltipDataAttrs={(value: any) => ({
          'data-tip': value ? `${value.date}: ${value.count} practice(s)` : 'no data'
        })}
      />
    </div>
  )
}
