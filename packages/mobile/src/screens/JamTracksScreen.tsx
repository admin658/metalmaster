import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const SUBGENRES = [
  'Thrash', 'Death', 'Doom', 'Prog', 'Black', 'Power', 'Core', 'Nu', 'Folk',
];

const TRACKS = [
  { id: 1, title: 'Infernal Groove', bpm: 120, subgenre: 'Thrash' },
  { id: 2, title: 'Frozen Wasteland', bpm: 90, subgenre: 'Doom' },
  { id: 3, title: 'Blast Furnace', bpm: 210, subgenre: 'Death' },
  { id: 4, title: 'Odd Time Machine', bpm: 140, subgenre: 'Prog' },
];

export const JamTracksScreen = () => {
  const [selectedSub, setSelectedSub] = useState('');
  const [bpm, setBpm] = useState(120);

  const filteredTracks = selectedSub
    ? TRACKS.filter(t => t.subgenre === selectedSub)
    : TRACKS;

  return (
    <View className="flex-1 bg-black px-4 py-6">
      {/* Subgenre Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {SUBGENRES.map(sub => (
          <TouchableOpacity
            key={sub}
            className={`px-4 py-2 mr-2 rounded-full border ${selectedSub === sub ? 'bg-red-700 border-red-700' : 'bg-[#222] border-gray-700'}`}
            onPress={() => setSelectedSub(selectedSub === sub ? '' : sub)}
          >
            <Text className={`text-sm font-bold ${selectedSub === sub ? 'text-white' : 'text-gray-300'}`}>{sub}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* BPM Selector */}
      <View className="flex-row items-center mb-4">
        <Text className="text-gray-300 mr-2 font-semibold">BPM</Text>
        <TouchableOpacity onPress={() => setBpm(bpm - 5)} className="bg-[#222] rounded-full p-2 mr-2 border border-gray-700">
          <MaterialCommunityIcons name="minus" size={20} color="#D90429" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold w-10 text-center">{bpm}</Text>
        <TouchableOpacity onPress={() => setBpm(bpm + 5)} className="bg-[#222] rounded-full p-2 ml-2 border border-gray-700">
          <MaterialCommunityIcons name="plus" size={20} color="#D90429" />
        </TouchableOpacity>
      </View>

      {/* Track List */}
      <ScrollView className="flex-1">
        {filteredTracks.map(track => (
          <View key={track.id} className="bg-[#18181b] rounded-xl p-4 mb-3 border border-gray-700 flex-row items-center justify-between">
            <View>
              <Text className="text-white text-base font-bold mb-1">{track.title}</Text>
              <Text className="text-gray-400 text-xs">{track.subgenre} • {track.bpm} BPM</Text>
            </View>
            <View className="flex-row items-center">
              <TouchableOpacity className="mr-3 bg-red-800 rounded-full p-2" onPress={() => {}}>
                <MaterialCommunityIcons name="play" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity className="bg-gray-800 rounded-full p-2" onPress={() => {}}>
                <MaterialCommunityIcons name="file-music-outline" size={22} color="#FFD700" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// Usage: <JamTracksScreen />
