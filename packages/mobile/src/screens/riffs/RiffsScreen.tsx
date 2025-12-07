import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Picker,
} from 'react-native';
import { useApi } from '../../hooks/useApi';
import { Riff, PaginatedResponse } from '@metalmaster/shared-types';

export default function RiffsScreen() {
  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState('');

  const queryParams = new URLSearchParams();
  queryParams.set('page', page.toString());
  queryParams.set('limit', '10');
  if (difficulty) queryParams.set('difficulty', difficulty);

  const { data, isLoading, error } = useApi<PaginatedResponse<Riff>>(
    `/riffs?${queryParams.toString()}`
  );

  const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];

  const renderRiff = ({ item }: { item: Riff }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <Text style={styles.cardMeta}>
        BPM: {item.bpm} • Key: {item.key} • {item.genre}
      </Text>
      <Text style={styles.cardMeta}>
        {item.time_signature} • {item.difficulty_level}
      </Text>
    </View>
  );

  if (isLoading && !data) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Picker
        selectedValue={difficulty}
        onValueChange={(value) => {
          setDifficulty(value);
          setPage(1);
        }}
        style={styles.picker}
      >
        <Picker.Item label="All Difficulties" value="" />
        {difficulties.map(diff => (
          <Picker.Item key={diff} label={diff} value={diff} />
        ))}
      </Picker>

      {error && <Text style={styles.error}>Error loading riffs</Text>}

      <FlatList
        data={data?.items || []}
        renderItem={renderRiff}
        keyExtractor={item => item.id}
        style={styles.list}
      />

      {data && (
        <View style={styles.pagination}>
          <Text>
            Page {data.page} of {data.total_pages}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#000',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: '#999',
    marginBottom: 3,
  },
  pagination: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    padding: 10,
  },
});
