import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useAchievements, useAchievementsLibrary, useAchievementsProgress } from '@/hooks/useAchievements';

export default function AchievementsScreen() {
  const { achievements } = useAchievements();
  const { library } = useAchievementsLibrary();
  const { progress } = useAchievementsProgress();

  return (
    <ScrollView style={{ padding: 16, backgroundColor: '#0b0b0b', flex: 1 }}>
      <Text style={{ color: '#EAB308', fontSize: 20, fontWeight: '700' }}>Achievements</Text>
      <View style={{ marginTop: 12 }}>
        {progress?.map((p: any) => (
          <View key={p.achievement_id} style={{ backgroundColor: '#111827', padding: 12, borderRadius: 8, marginBottom: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{p.name}</Text>
            <Text style={{ color: '#cbd5e1' }}>{p.progress_percentage}%</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
