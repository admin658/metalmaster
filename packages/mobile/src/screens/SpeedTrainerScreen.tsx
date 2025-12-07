import React, { useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { useSpeedTrainer, useSpeedTrainerProgress } from '@/hooks/useSpeedTrainer';
import { SubscriptionGate } from '@/components/SubscriptionGate';

export default function SpeedTrainerScreen() {
  return (
    <SubscriptionGate requiredPlan="pro">
      <SpeedTrainerScreenContent />
    </SubscriptionGate>
  );
}

function SpeedTrainerScreenContent() {
  const { sessions } = useSpeedTrainer();
  const { progress } = useSpeedTrainerProgress();

  return (
    <ScrollView style={{ padding: 16, backgroundColor: '#0b0b0b', flex: 1 }}>
      <Text style={{ color: '#EAB308', fontSize: 20, fontWeight: '700' }}>Speed Trainer</Text>
      <Text style={{ color: '#cbd5e1', marginBottom: 12 }}>Sessions: {sessions?.length || 0}</Text>

      <View style={{ backgroundColor: '#111827', padding: 12, borderRadius: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Progress</Text>
        {progress?.map((p: any) => (
          <View key={p.exercise_type} style={{ marginTop: 8 }}>
            <Text style={{ color: '#fff' }}>{p.exercise_type}: {p.personal_best_bpm} BPM</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}
