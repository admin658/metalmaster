import React, { useState } from 'react';
import { View, Text, ScrollView, Button } from 'react-native';
import { usePracticeSessions, usePracticeSessionStats } from '@/hooks/usePracticeSessions';

export default function PracticeHistoryScreen() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const { sessions, total, totalPages } = usePracticeSessions(page, 10, filter);
  const { stats } = usePracticeSessionStats();

  return (
    <ScrollView style={{ padding: 16, backgroundColor: '#0b0b0b', flex: 1 }}>
      <Text style={{ color: '#EAB308', fontSize: 20, fontWeight: '700' }}>Practice History</Text>

      <View style={{ marginTop: 12 }}>
        {sessions?.map((s: any) => (
          <View key={s.id} style={{ backgroundColor: '#111827', padding: 12, borderRadius: 8, marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{s.session_type}</Text>
            <Text style={{ color: '#cbd5e1' }}>{new Date(s.started_at).toLocaleString()}</Text>
            <Text style={{ color: '#fff', marginTop: 8 }}>XP: {s.xp_earned} • Duration: {Math.round(s.duration_seconds / 60)} min</Text>
          </View>
        ))}
      </View>

      <View style={{ marginTop: 12, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button title="Previous" onPress={() => setPage(Math.max(1, page - 1))} />
        <Text style={{ color: '#cbd5e1' }}>Page {page} / {totalPages || 1}</Text>
        <Button title="Next" onPress={() => setPage(Math.min(totalPages || 1, page + 1))} />
      </View>

      <View style={{ marginTop: 16, backgroundColor: '#111827', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Summary</Text>
        <Text style={{ color: '#cbd5e1' }}>Weekly XP: {stats?.xp_earned_this_week || 0}</Text>
        <Text style={{ color: '#cbd5e1' }}>Today XP: {stats?.xp_earned_today || 0}</Text>
      </View>
    </ScrollView>
  );
}
