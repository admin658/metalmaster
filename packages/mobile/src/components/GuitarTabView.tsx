import React, { useRef, useEffect } from 'react';
import { ScrollView, View, Text, StyleSheet, Dimensions, StyleProp, ViewStyle } from 'react-native';

const STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'];

type TabNote = {
  string: number;
  fret: number;
};

type TabDataItem = {
  time: number;
  notes: TabNote[];
};

interface GuitarTabViewProps {
  tabData: TabDataItem[];
  currentTime: number;
  highlightColor?: string;
  barLines?: number[]; // indices where a bar/measure starts
  onSelectColumn?: (time: number) => void;
  style?: StyleProp<ViewStyle>;
}

export const GuitarTabView = ({
  tabData,
  currentTime,
  highlightColor = '#D90429',
  barLines = [],
  onSelectColumn,
  style,
}: GuitarTabViewProps) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const windowWidth = Dimensions.get('window').width;

  // Find the active note index based on currentTime
  const activeIndex = tabData.findIndex((n, i) => {
    const next = tabData[i + 1];
    return currentTime >= n.time && (!next || currentTime < next.time);
  });

  // Auto-scroll to active note horizontally
  useEffect(() => {
    if (scrollViewRef.current && activeIndex >= 0) {
      scrollViewRef.current.scrollTo({
        x: activeIndex * 60 - windowWidth / 2 + 30,
        animated: true,
      });
    }
  }, [activeIndex]);

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal
      style={[styles.tabContainer, style]}
      showsHorizontalScrollIndicator={false}
    >
      <View style={styles.tabGrid}>
        {STRINGS.map((s, stringIdx) => (
          <View key={s} style={styles.tabRow}>
            <Text style={styles.stringLabel}>{s}|</Text>
            {tabData.map((note, noteIdx) => {
              const noteOnString = note.notes.find(n => n.string === stringIdx);
              const isActive = noteIdx === activeIndex && noteOnString;
              const isBarStart = barLines.includes(noteIdx);
              return (
                <View
                  key={noteIdx}
                  style={[
                    styles.tabCell,
                    isActive && { backgroundColor: highlightColor },
                    isBarStart && styles.barStart,
                  ]}
                >
                  <Text
                    style={[styles.fretText, isActive && { color: '#fff', fontWeight: 'bold' }]}
                    onPress={() => onSelectColumn?.(note.time)}
                  >
                    {noteOnString ? noteOnString.fret : '-'}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingVertical: 8,
    marginVertical: 8,
    minHeight: 180,
  },
  tabGrid: {
    flexDirection: 'column',
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  stringLabel: {
    color: '#D90429',
    fontWeight: 'bold',
    width: 18,
    textAlign: 'right',
    fontSize: 16,
  },
  tabCell: {
    width: 60,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#333',
    marginHorizontal: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 4,
  },
  fretText: {
    color: '#fff',
    fontSize: 16,
  },
  barStart: {
    borderLeftWidth: 2,
    borderLeftColor: '#f87171',
    paddingLeft: 4,
  },
});

// Usage example:
// <GuitarTabView tabData={tabArray} currentTime={playbackTime} />
