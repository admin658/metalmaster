import React from 'react';
import { View, Text, Image } from 'react-native';

type Badge = { id: string; name: string; iconUrl?: string; xpMultiplier?: number };

export default function AchievementBadgesGrid({ library, earnedIds }: { library?: Badge[]; earnedIds?: string[] }) {
  const libs = library || [];
  const earnedSet = new Set(earnedIds || []);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {libs.map((b) => {
        const unlocked = earnedSet.has(b.id);
        return (
          <View key={b.id} style={{ width: 90, margin: 6, alignItems: 'center' }}>
            {b.iconUrl ? (
              <Image source={{ uri: b.iconUrl }} style={{ width: 64, height: 64, opacity: unlocked ? 1 : 0.25, borderRadius: 8 }} />
            ) : (
              <View style={{ width: 64, height: 64, backgroundColor: '#0f172a', borderRadius: 8, opacity: unlocked ? 1 : 0.25 }} />
            )}
            <Text style={{ color: unlocked ? '#f8fafc' : '#94a3b8', fontSize: 12, marginTop: 6, textAlign: 'center' }}>{b.name}</Text>
            <Text style={{ color: '#94a3b8', fontSize: 11 }}>{unlocked ? `x${b.xpMultiplier ?? 1} XP` : 'Locked'}</Text>
          </View>
        );
      })}
    </View>
  );
}
