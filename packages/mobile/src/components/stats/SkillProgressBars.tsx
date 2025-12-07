import React from 'react';
import { View, Text } from 'react-native';

type Skill = { category: string; current_score: number };

export default function SkillProgressBars({ skills }: { skills?: Skill[] }) {
  const list = skills || [];

  return (
    <View>
      {list.map((s) => (
        <View key={s.category} style={{ marginBottom: 12 }}>
          <Text style={{ color: '#e5e7eb', marginBottom: 6, textTransform: 'capitalize' }}>{s.category.replace('_', ' ')}</Text>
          <View style={{ height: 12, backgroundColor: '#0f172a', borderRadius: 6, overflow: 'hidden' }}>
            <View style={{ height: 12, width: `${Math.min(Math.max(s.current_score, 0), 100)}%`, backgroundColor: '#F59E0B' }} />
          </View>
          <Text style={{ color: '#94a3b8', marginTop: 6 }}>{s.current_score}/100</Text>
        </View>
      ))}
    </View>
  );
}
