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
import { Lesson, PaginatedResponse } from '@metalmaster/shared-types';

export default function LessonsScreen() {
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');

  const queryParams = new URLSearchParams();
  queryParams.set('page', page.toString());
  queryParams.set('limit', '10');
  if (category) queryParams.set('category', category);

  const { data, isLoading, error } = useApi<PaginatedResponse<Lesson>>(
    `/lessons?${queryParams.toString()}`
  );

  const categories = ['technique', 'theory', 'rhythm', 'lead', 'intermediate'];

  const renderLesson = ({ item }: { item: Lesson }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDescription}>{item.description}</Text>
      <Text style={styles.cardMeta}>
        {item.category} • {item.difficulty_level} • {item.duration_minutes} min
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
        selectedValue={category}
        onValueChange={(value) => {
          setCategory(value);
          setPage(1);
        }}
        style={styles.picker}
      >
        <Picker.Item label="All Categories" value="" />
        {categories.map(cat => (
          <Picker.Item key={cat} label={cat} value={cat} />
        ))}
      </Picker>

      {error && <Text style={styles.error}>Error loading lessons</Text>}

      <FlatList
        data={data?.items || []}
        renderItem={renderLesson}
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
