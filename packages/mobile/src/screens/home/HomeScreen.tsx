import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Metal Master</Text>
      <Text style={styles.subtitle}>Learn metal guitar</Text>

      {user && (
        <View>
          <Text style={styles.welcome}>Welcome, {user.email}!</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.description}>
          Explore lessons, riffs, and jam tracks to improve your metal guitar skills.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  welcome: {
    fontSize: 16,
    marginBottom: 10,
  },
  content: {
    marginTop: 20,
  },
  description: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
