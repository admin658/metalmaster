import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useDailyRiff, useDailyRiffStats, useCompleteDailyRiff } from '@/hooks/useDailyRiff';

export default function DailyRiffScreen({ navigation }: any) {
  const { dailyRiff } = useDailyRiff();
  const { stats } = useDailyRiffStats();
  const { complete } = useCompleteDailyRiff();
  const [completed, setCompleted] = useState(false);

  const handleComplete = async () => {
    if (!dailyRiff?.id) return;
    try {
      const res = await complete(dailyRiff.id);
      if (res) setCompleted(true);
    } catch (err) {
      console.error('Complete failed', err);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16 }}>
        <Text style={{ color: '#D90429', fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 }}>Daily Riff</Text>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{dailyRiff?.description || 'No riff today'}</Text>
        <Text style={{ color: '#ccc', marginTop: 8 }}>XP Bonus: {dailyRiff?.xp_bonus || 0}</Text>

        {completed || stats?.completed_today ? (
          <Text style={{ color: '#4ade80', marginTop: 12, fontWeight: '700' }}>Completed</Text>
        ) : (
          <TouchableOpacity onPress={handleComplete} style={{ marginTop: 12, backgroundColor: '#D90429', padding: 12, borderRadius: 8 }}>
            <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Mark as Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
