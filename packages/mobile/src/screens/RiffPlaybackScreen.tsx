import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Slider from "@react-native-community/slider";
import { Video } from 'expo-av';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { GuitarTabView } from '../components/GuitarTabView';

// Mock data
const tabData = [
  { time: 0, notes: [{ string: 0, fret: 3 }] },
  { time: 1, notes: [{ string: 1, fret: 2 }] },
  { time: 2, notes: [{ string: 2, fret: 0 }] },
  { time: 3, notes: [{ string: 0, fret: 5 }] },
];

export const RiffPlaybackScreen = () => {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [loop, setLoop] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const accuracy = 0.87;

  const handlePlayPause = async () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSpeedChange = async (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      await videoRef.current.setRateAsync(rate, true);
    }
  };

  return (
    <View style={styles.container}>
      {/* Video Player */}
      <View style={styles.videoContainer}>
        <Video
          ref={videoRef}
          source={{ uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }}
          style={styles.video}
          resizeMode={'contain' as any}
          shouldPlay={isPlaying}
          isLooping={loop}
          rate={playbackRate}
          onPlaybackStatusUpdate={status => status.isLoaded && setCurrentTime(status.positionMillis / 1000)}
        />
        <View style={styles.videoControls}>
          <TouchableOpacity onPress={handlePlayPause}>
            <MaterialCommunityIcons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={48}
              color="#D90429"
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setLoop(l => !l)}>
            <MaterialCommunityIcons
              name={loop ? 'repeat' : 'repeat-off'}
              size={32}
              color={loop ? '#FFD700' : '#666'}
              style={{ marginLeft: 16 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Speed Controls */}
      <View style={styles.speedControls}>
        <Text style={styles.speedLabel}>Speed</Text>
        <Slider
          style={{ flex: 1, marginHorizontal: 12 }}
          minimumValue={0.5}
          maximumValue={1.5}
          step={0.05}
          value={playbackRate}
          minimumTrackTintColor="#D90429"
          maximumTrackTintColor="#333"
          thumbTintColor="#FFD700"
          onValueChange={handleSpeedChange}
        />
        <Text style={styles.speedValue}>{(playbackRate * 100).toFixed(0)}%</Text>
      </View>

      {/* Tab Viewer */}
      <View style={styles.tabSection}>
        <Text style={styles.tabTitle}>Tab</Text>
        <GuitarTabView tabData={tabData} currentTime={currentTime} />
      </View>

      {/* Accuracy Meter (mock) */}
      <View style={styles.accuracyContainer}>
        <MaterialCommunityIcons name="gauge" size={28} color="#FFD700" />
        <Text style={styles.accuracyText}>Accuracy: {(accuracy * 100).toFixed(1)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 0,
  },
  videoContainer: {
    backgroundColor: '#222',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
  },
  video: {
    width: '96%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#000',
  },
  videoControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  speedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    marginHorizontal: 16,
  },
  speedLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  speedValue: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
    width: 48,
    textAlign: 'right',
  },
  tabSection: {
    marginHorizontal: 8,
    marginBottom: 12,
  },
  tabTitle: {
    color: '#D90429',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
    marginLeft: 2,
  },
  accuracyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: '#222',
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 32,
  },
  accuracyText: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

// Usage: <RiffPlaybackScreen />
