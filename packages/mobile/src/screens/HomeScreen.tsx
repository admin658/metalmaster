import React from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { useUserStats } from '@/hooks/useUserStats';
import { useDailyRiff } from '@/hooks/useDailyRiff';

export default function HomeScreen({ navigation }: any) {
  const { stats } = useUserStats();
  const { dailyRiff } = useDailyRiff();

  return (
    <ScrollView style={{ padding: 16, backgroundColor: '#0b0b0b', flex: 1 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#EAB308', fontSize: 20, fontWeight: '700' }}>XP: {stats?.total_xp || 0}</Text>
        <Text style={{ color: '#cbd5e1' }}>Level {stats?.level || 1} • {stats?.level_tier}</Text>
      </View>

      <View style={{ marginBottom: 16, backgroundColor: '#111827', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>Daily Riff</Text>
        <Text style={{ color: '#e5e7eb', marginBottom: 8 }}>{dailyRiff?.description || 'No riff today'}</Text>
        <Button title="Open Daily Riff" onPress={() => navigation.navigate('DailyRiff')} />
      </View>

      <View style={{ backgroundColor: '#111827', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '700', marginBottom: 8 }}>Quick Actions</Text>
        <Button title="Speed Trainer" onPress={() => navigation.navigate('SpeedTrainer')} />
      </View>
    </ScrollView>
  );
}
