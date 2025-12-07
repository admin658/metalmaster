// packages/mobile/src/components/tab/TabPlayer.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { Audio, AVPlaybackStatus } from 'expo-av';
import {
  TabLoopSection,
  TabMixerState,
  TabSong,
  createMixerState,
  createTabSyncEngine,
  deriveChannelGains,
  enforceLoopBoundaries,
  toggleMuteOnMixer,
  toggleSoloOnMixer,
} from '@metalmaster/shared-types';
import { GuitarTabView } from '../GuitarTabView';

interface TabPlayerProps {
  song: TabSong;
  audioUrl?: string;
}

const formatTime = (sec: number): string => {
  if (!Number.isFinite(sec) || sec < 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
};

export const TabPlayer: React.FC<TabPlayerProps> = ({ song, audioUrl }) => {
  const soundRef = useRef<Audio.Sound | null>(null);
  const stemRefs = useRef<Record<string, Audio.Sound>>({});
  const syncEngine = useMemo(() => createTabSyncEngine(song), [song]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(song.durationSeconds || 0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(song.tracks[0]?.id ?? null);
  const [loop, setLoop] = useState<TabLoopSection>({ startSeconds: null, endSeconds: null });
  const [isLoopEnabled, setIsLoopEnabled] = useState(false);
  const [mixer, setMixer] = useState<TabMixerState>(() => createMixerState(song));
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);

  const loopRef = useRef(loop);
  const isLoopEnabledRef = useRef(isLoopEnabled);
  const durationRef = useRef(duration);
  const syncEngineRef = useRef(syncEngine);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  useEffect(() => {
    isLoopEnabledRef.current = isLoopEnabled;
  }, [isLoopEnabled]);

  useEffect(() => {
    durationRef.current = duration;
  }, [duration]);

  useEffect(() => {
    syncEngineRef.current = syncEngine;
  }, [syncEngine]);

  useEffect(() => {
    setMixer(createMixerState(song));
    setSelectedTrackId(song.tracks[0]?.id ?? null);
    setCurrentTime(0);
    setActiveBeatId(null);
    setDuration(song.durationSeconds || 0);
  }, [song]);

  const channelGains = useMemo(() => deriveChannelGains(mixer), [mixer]);

  // Load master audio
  useEffect(() => {
    if (!audioUrl) return;
    let isMounted = true;

    const loadSound = async () => {
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false, rate: 1, progressUpdateIntervalMillis: 100 }
      );
      if (!isMounted) {
        await sound.unloadAsync();
        return;
      }
      soundRef.current = sound;
      if (status.isLoaded && status.durationMillis != null) {
        setDuration(status.durationMillis / 1000);
      }

      sound.setOnPlaybackStatusUpdate((s: AVPlaybackStatus) => {
        if (!s.isLoaded) return;
        const rawSec = (s.positionMillis ?? 0) / 1000;
        const looped = isLoopEnabledRef.current
          ? enforceLoopBoundaries(rawSec, loopRef.current, durationRef.current)
          : rawSec;
        if (looped !== rawSec) {
          void sound.setPositionAsync(looped * 1000);
        }
        setCurrentTime(looped);
        const beat = syncEngineRef.current.getActiveBeat(looped);
        setActiveBeatId(beat?.id ?? null);
        if (s.didJustFinish) {
          setIsPlaying(false);
        }
      });
    };

    loadSound().catch(console.error);

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(console.error);
        soundRef.current = null;
      }
    };
  }, [audioUrl]);

  // Load stems for mixer if provided
  useEffect(() => {
    const loadStems = async () => {
      const newStems: Record<string, Audio.Sound> = {};
      await Promise.all(
        song.tracks
          .filter((track) => track.stemUrl)
          .map(async (track) => {
            const { sound } = await Audio.Sound.createAsync(
              { uri: track.stemUrl as string },
              { shouldPlay: false, rate: 1, volume: 1 }
            );
            newStems[track.id] = sound;
          })
      );
      stemRefs.current = newStems;
    };

    loadStems().catch(console.error);

    return () => {
      const stems = Object.values(stemRefs.current);
      stemRefs.current = {};
      stems.forEach((stem) => {
        stem.unloadAsync().catch(console.error);
      });
    };
  }, [song.tracks]);

  // Sync volumes with mixer state
  useEffect(() => {
    const applyGains = async () => {
      await Promise.all(
        Object.entries(stemRefs.current).map(([trackId, stem]) =>
          stem.setStatusAsync({ volume: channelGains[trackId] ?? 1 })
        )
      );
      if (soundRef.current) {
        const anyAudible = Object.values(channelGains).some((gain) => gain > 0);
        await soundRef.current.setStatusAsync({ volume: anyAudible ? 1 : 0 });
      }
    };
    applyGains().catch(console.error);
  }, [channelGains]);

  // Keep playback speed in sync
  useEffect(() => {
    const updateRate = async () => {
      if (soundRef.current) {
        await soundRef.current.setRateAsync(playbackSpeed, true);
      }
      await Promise.all(
        Object.values(stemRefs.current).map((stem) => stem.setRateAsync(playbackSpeed, true))
      );
    };
    updateRate().catch(console.error);
  }, [playbackSpeed]);

  const tabData = useMemo(() => {
    if (!song.beats || !song.beats.length) return [];
    return song.beats.map((beat) => ({
      time: beat.timeSeconds,
      notes: beat.notes.map((n) => ({
        string: Math.max(0, n.string - 1),
        fret: n.fret,
      })),
    }));
  }, [song]);

  const barLines = useMemo(() => {
    const lines: number[] = [];
    let idx = 0;
    (song.measures ?? []).forEach((measure) => {
      lines.push(idx);
      idx += measure.beats.length ?? 0;
    });
    return lines;
  }, [song.measures]);

  const playAll = async () => {
    const cursor = currentTime * 1000;
    await Promise.all(
      Object.values(stemRefs.current).map((stem) =>
        stem.setStatusAsync({ shouldPlay: true, positionMillis: cursor })
      )
    );
    if (soundRef.current) {
      await soundRef.current.setStatusAsync({
        shouldPlay: true,
        positionMillis: cursor,
      });
    }
    setIsPlaying(true);
  };

  const pauseAll = async () => {
    await Promise.all(
      Object.values(stemRefs.current).map((stem) => stem.setStatusAsync({ shouldPlay: false }))
    );
    if (soundRef.current) {
      await soundRef.current.setStatusAsync({ shouldPlay: false });
    }
    setIsPlaying(false);
  };

  const togglePlay = async () => {
    const clock = soundRef.current ?? Object.values(stemRefs.current)[0];
    if (!clock) return;
    const status = await clock.getStatusAsync();
    if (!status.isLoaded) return;
    if (status.isPlaying) {
      await pauseAll();
    } else {
      await playAll();
    }
  };

  const handleScrub = async (value: number) => {
    const clamped = Math.max(0, Math.min(duration, value));
    setCurrentTime(clamped);
    await Promise.all(
      Object.values(stemRefs.current).map((stem) => stem.setPositionAsync(clamped * 1000))
    );
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(clamped * 1000);
    }
    const beat = syncEngine.getActiveBeat(clamped);
    setActiveBeatId(beat?.id ?? null);
  };

  const handleSpeedChange = async (value: number) => {
    const rate = Math.max(0.25, Math.min(1.5, value));
    setPlaybackSpeed(rate);
  };

  const handleSetLoopA = () => {
    setLoop((prev) => ({ ...prev, startSeconds: currentTime }));
  };

  const handleSetLoopB = () => {
    setLoop((prev) => ({ ...prev, endSeconds: currentTime }));
  };

  const handleToggleSolo = (trackId: string) => {
    setMixer((prev) => toggleSoloOnMixer(prev, trackId));
  };

  const handleToggleMute = (trackId: string) => {
    setMixer((prev) => toggleMuteOnMixer(prev, trackId));
  };

  const handleVolumeChange = (trackId: string, volume: number) => {
    setMixer((prev) => ({
      channels: prev.channels.map((channel) =>
        channel.trackId === trackId ? { ...channel, volume } : channel
      ),
    }));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{song.title}</Text>
          {song.artist ? <Text style={styles.artist}>{song.artist}</Text> : null}
        </View>
        <View style={styles.chipRow}>
          <Text style={styles.chip}>{Math.round(song.bpm)} BPM</Text>
          <Text style={styles.chip}>{formatTime(duration)}</Text>
          <Text style={styles.chip}>{syncEngine.beats.length} beats</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Tracks</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {song.tracks.map((track) => {
            const active = track.id === selectedTrackId;
            const channel = mixer.channels.find((c) => c.trackId === track.id);
            const effectiveGain = channelGains[track.id] ?? channel?.volume ?? 1;
            return (
              <View key={track.id} style={[styles.trackCard, active && styles.trackCardActive]}>
                <TouchableOpacity onPress={() => setSelectedTrackId(track.id)}>
                  <Text style={[styles.trackName, active && styles.trackNameActive]}>{track.name}</Text>
                </TouchableOpacity>
                <View style={styles.trackControls}>
                  <TouchableOpacity
                    onPress={() => handleToggleSolo(track.id)}
                    style={[styles.trackPill, channel?.isSoloed && styles.trackPillActive]}
                  >
                    <Text style={[styles.trackPillText, channel?.isSoloed && styles.trackPillTextActive]}>Solo</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleToggleMute(track.id)}
                    style={[styles.trackPill, channel?.isMuted && styles.trackPillMuted]}
                  >
                    <Text style={[styles.trackPillText, channel?.isMuted && styles.trackPillTextActive]}>Mute</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.volumeRow}>
                  <Slider
                    style={{ flex: 1 }}
                    minimumValue={0}
                    maximumValue={1}
                    step={0.05}
                    value={channel?.volume ?? 1}
                    onValueChange={(v) => handleVolumeChange(track.id, v)}
                  />
                  <Text style={styles.volumeText}>{Math.round(effectiveGain * 100)}%</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Speed: {playbackSpeed.toFixed(2)}x</Text>
        <Slider
          minimumValue={0.25}
          maximumValue={1.5}
          step={0.05}
          value={playbackSpeed}
          onValueChange={handleSpeedChange}
        />
        <View style={styles.loopRow}>
          <TouchableOpacity onPress={handleSetLoopA} style={styles.loopButton}>
            <Text style={styles.loopButtonText}>
              Set A ({loop.startSeconds !== null ? formatTime(loop.startSeconds) : '-'})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleSetLoopB} style={styles.loopButton}>
            <Text style={styles.loopButtonText}>
              Set B ({loop.endSeconds !== null ? formatTime(loop.endSeconds) : '-'})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsLoopEnabled(!isLoopEnabled)}
            style={[styles.loopButton, isLoopEnabled && styles.loopButtonActive]}
          >
            <Text style={[styles.loopButtonText, isLoopEnabled && styles.loopButtonTextActive]}>
              Loop
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.transportRow}>
        <TouchableOpacity
          onPress={() => handleScrub(Math.max(0, currentTime - 5))}
          style={styles.transportButton}
        >
          <Text style={styles.transportButtonText}>{'<<'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={togglePlay} style={styles.playButton}>
          <Text style={styles.playButtonText}>{isPlaying ? 'Pause' : 'Play'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleScrub(Math.min(duration, currentTime + 5))}
          style={styles.transportButton}
        >
          <Text style={styles.transportButtonText}>{'>>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scrubRow}>
        <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
        <Slider
          style={{ flex: 1, marginHorizontal: 12 }}
          minimumValue={0}
          maximumValue={Math.max(duration, 0.01)}
          value={currentTime}
          onValueChange={handleScrub}
        />
        <Text style={styles.timeText}>{formatTime(duration)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Tab View</Text>
        <GuitarTabView
          tabData={tabData}
          currentTime={currentTime}
          highlightColor="#ff1744"
          barLines={barLines}
          onSelectColumn={handleScrub}
        />
        <Text style={styles.activeBeatText}>
          Active beat: {activeBeatId ?? '-'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#050508',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    color: '#fee2e2',
    fontSize: 18,
    fontWeight: '600',
  },
  artist: {
    color: '#fca5a5',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
  },
  chip: {
    color: '#e5e7eb',
    fontSize: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.4)',
    backgroundColor: 'rgba(24,24,27,0.9)',
  },
  section: {
    marginBottom: 12,
  },
  sectionLabel: {
    color: '#a1a1aa',
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  trackCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#09090b',
    padding: 10,
    minWidth: 180,
  },
  trackCardActive: {
    borderColor: '#f97373',
    backgroundColor: '#b91c1c',
  },
  trackName: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '600',
  },
  trackNameActive: {
    color: '#fef2f2',
  },
  trackControls: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  trackPill: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#0f0f11',
  },
  trackPillActive: {
    borderColor: '#f97373',
    backgroundColor: '#b91c1c',
  },
  trackPillMuted: {
    borderColor: '#71717a',
    backgroundColor: '#27272a',
  },
  trackPillText: {
    color: '#e5e7eb',
    fontSize: 11,
  },
  trackPillTextActive: {
    color: '#fef2f2',
    fontWeight: '600',
  },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  volumeText: {
    color: '#d4d4d8',
    fontSize: 11,
    width: 44,
    textAlign: 'right',
  },
  loopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  loopButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3f3f46',
    backgroundColor: '#09090b',
  },
  loopButtonActive: {
    borderColor: '#f97373',
    backgroundColor: '#b91c1c',
  },
  loopButtonText: {
    color: '#e5e7eb',
    fontSize: 11,
  },
  loopButtonTextActive: {
    color: '#fef2f2',
    fontWeight: '600',
  },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 4,
  },
  transportButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09090b',
    borderWidth: 1,
    borderColor: '#3f3f46',
  },
  transportButtonText: {
    color: '#e5e7eb',
    fontSize: 16,
  },
  playButton: {
    width: 80,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc2626',
    borderWidth: 1,
    borderColor: '#f97373',
  },
  playButtonText: {
    color: '#fef2f2',
    fontSize: 16,
    fontWeight: '600',
  },
  scrubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  timeText: {
    color: '#d4d4d8',
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },
  activeBeatText: {
    marginTop: 6,
    color: '#e5e7eb',
    fontSize: 11,
  },
});
