import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Day = { date: string; practice_minutes?: number };

export default function HeatmapGrid({ data }: { data?: Day[] }) {
  const days = data || [];
  // Build a map from date->minutes
  const map = new Map<string, number>();
  days.forEach((d) => map.set(d.date, d.practice_minutes || 0));

  // Show last 30 days in a 5x7-ish grid (rows of weeks)
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 29);

  const grid: Day[][] = [];
  for (let r = 0; r < 5; r++) {
    const row: Day[] = [];
    for (let c = 0; c < 7; c++) {
      const idx = r * 7 + c;
      if (idx > 29) break;
      const d = new Date(start);
      d.setDate(start.getDate() + idx);
      const dateStr = d.toISOString().split('T')[0];
      row.push({ date: dateStr, practice_minutes: map.get(dateStr) || 0 });
    }
    grid.push(row);
  }

  const max = Math.max(...days.map((d) => d.practice_minutes || 0), 60);

  const getColor = (minutes: number) => {
    if (!minutes) return '#0f172a';
    const ratio = minutes / Math.max(max, 60);
    if (ratio < 0.25) return '#92400e';
    if (ratio < 0.5) return '#b45309';
    if (ratio < 0.75) return '#d97706';
    return '#f59e0b';
  };

  return (
    <View>
      {grid.map((row, ri) => (
        <View key={ri} style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
          {row.map((d) => (
            <TouchableOpacity key={d.date} style={{ width: 28, height: 28 }} accessibilityLabel={d.date}>
              <View style={{ width: 28, height: 28, borderRadius: 4, backgroundColor: getColor(d.practice_minutes || 0) }} />
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );
}
