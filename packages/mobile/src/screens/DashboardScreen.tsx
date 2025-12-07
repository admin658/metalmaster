import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Example data
const dailyRiff = {
  title: 'Riff of the Day',
  artist: 'Metallica',
  difficulty: 'Intermediate',
};
const xp = 420;
const xpToNext = 500;
const continueLearning = [
  { id: 1, title: 'Master of Puppets', type: 'riff' },
  { id: 2, title: 'Phrygian Dominant', type: 'lesson' },
];
const quickTools = [
  { icon: 'guitar-pick' as const, label: 'Jam', action: () => {} },
  { icon: 'book-open-variant' as const, label: 'Lessons', action: () => {} },
  { icon: 'trophy' as const, label: 'Achievements', action: () => {} },
  { icon: 'music' as const, label: 'Tracks', action: () => {} },
] as const;

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  dailyRiffCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#991B1B',
  },
  dailyRiffLabel: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dailyRiffTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  dailyRiffArtist: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 8,
  },
  difficultyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyText: {
    color: '#9CA3AF',
    marginLeft: 8,
  },
  xpContainer: {
    marginBottom: 24,
  },
  xpLabel: {
    color: '#D1D5DB',
    marginBottom: 4,
  },
  xpBarContainer: {
    height: 20,
    backgroundColor: '#1F2937',
    borderRadius: 12,
    overflow: 'hidden',
  },
  xpBar: {
    height: 20,
    backgroundColor: '#DC2626',
    borderRadius: 12,
  },
  xpStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  xpText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  xpNextText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  continueSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#D1D5DB',
    marginBottom: 8,
    fontWeight: '600',
  },
  continueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222222',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  continueItemText: {
    color: '#FFFFFF',
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  quickAccessSection: {
    marginBottom: 16,
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessTool: {
    width: '47%',
    backgroundColor: '#222222',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickAccessText: {
    color: '#FFFFFF',
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});

export const DashboardScreen = () => {
  return (
    <ScrollView style={styles.scrollView}>
      {/* Daily Riff Card */}
      <View style={styles.dailyRiffCard}>
        <Text style={styles.dailyRiffLabel}>Daily Riff</Text>
        <Text style={styles.dailyRiffTitle}>{dailyRiff.title}</Text>
        <Text style={styles.dailyRiffArtist}>by {dailyRiff.artist}</Text>
        <View style={styles.difficultyRow}>
          <MaterialCommunityIcons name="guitar-electric" size={20} color="#D90429" />
          <Text style={styles.difficultyText}>{dailyRiff.difficulty}</Text>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.xpContainer}>
        <Text style={styles.xpLabel}>XP Progress</Text>
        <View style={styles.xpBarContainer}>
          <View
            style={[styles.xpBar, { width: `${(xp / xpToNext) * 100}%` }]}
          />
        </View>
        <View style={styles.xpStatsRow}>
          <Text style={styles.xpText}>{xp} XP</Text>
          <Text style={styles.xpNextText}>{xpToNext} XP to next</Text>
        </View>
      </View>

      {/* Continue Learning List */}
      <View style={styles.continueSection}>
        <Text style={styles.sectionTitle}>Continue Learning</Text>
        {continueLearning.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.continueItem}
            onPress={() => {}}
          >
            <MaterialCommunityIcons
              name={item.type === 'riff' ? 'guitar-pick' : 'book-open-variant'}
              size={22}
              color="#D90429"
            />
            <Text style={styles.continueItemText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Access Tools */}
      <View style={styles.quickAccessSection}>
        <Text style={styles.sectionTitle}>Quick Access</Text>
        <View style={styles.quickAccessGrid}>
          {quickTools.map(tool => (
            <TouchableOpacity
              key={tool.label}
              style={styles.quickAccessTool}
              onPress={tool.action}
            >
              <MaterialCommunityIcons name={tool.icon} size={24} color="#D90429" />
              <Text style={styles.quickAccessText}>{tool.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

// Usage: <DashboardScreen />
