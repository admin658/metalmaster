import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useUserStats, useUserSkills, useUserHeatmap } from '@/hooks/useUserStats';
import { useAchievementsLibrary, useAchievements } from '@/hooks/useAchievements';
import { SubscriptionGate } from '@/components/SubscriptionGate';
import HeatmapGrid from '@/components/stats/HeatmapGrid';
import SkillProgressBars from '@/components/stats/SkillProgressBars';
import AchievementBadgesGrid from '@/components/stats/AchievementBadgesGrid';

export default function StatsScreen() {
  return (
    <SubscriptionGate requiredPlan="pro">
      <StatsScreenContent />
    </SubscriptionGate>
  );
}

function StatsScreenContent() {
  const { stats } = useUserStats();
  const { skills } = useUserSkills();
  const today = new Date();
  const start = new Date();
  start.setDate(today.getDate() - 30);
  const startStr = start.toISOString().split('T')[0];
  const endStr = today.toISOString().split('T')[0];
  const { heatmap } = useUserHeatmap(startStr, endStr);

  const { library } = useAchievementsLibrary();
  const { achievements } = useAchievements();

  const earnedIds: string[] = achievements ? (achievements as any).map((a: any) => a.id || a.achievement_id || a) : [];

  return (
    <ScrollView style={{ padding: 16, backgroundColor: '#0b0b0b', flex: 1 }}>
      <Text style={{ color: '#EAB308', fontSize: 20, fontWeight: '700' }}>Stats</Text>

      <View style={{ marginTop: 12, backgroundColor: '#111827', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>XP: {stats?.total_xp}</Text>
        <Text style={{ color: '#cbd5e1' }}>Level {stats?.level}</Text>
      </View>

      <View style={{ marginTop: 12, backgroundColor: '#111827', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>Skills</Text>
        <SkillProgressBars skills={skills} />
      </View>

      <View style={{ marginTop: 12, backgroundColor: '#111827', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>Practice Heatmap (30d)</Text>
        <HeatmapGrid data={heatmap} />
      </View>

      <View style={{ marginTop: 12, backgroundColor: '#111827', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>Achievements</Text>
        <AchievementBadgesGrid library={library} earnedIds={earnedIds} />
      </View>
    </ScrollView>
  );
}
