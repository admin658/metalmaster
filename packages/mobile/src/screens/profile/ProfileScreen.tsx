import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';
import { UserProfile } from '@metalmaster/shared-types';

export default function ProfileScreen() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading } = useApi<UserProfile>(
    user ? '/users/profile' : null,
    { skip: !user }
  );

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Profile</Text>
        <Text>Please log in to view your profile</Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      {profile && (
        <View style={styles.profileCard}>
          <View style={styles.profileSection}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{profile.email}</Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.label}>Username:</Text>
            <Text style={styles.value}>{profile.username}</Text>
          </View>

          <View style={styles.profileSection}>
            <Text style={styles.label}>Skill Level:</Text>
            <Text style={styles.value}>{profile.skill_level}</Text>
          </View>

          {profile.bio && (
            <View style={styles.profileSection}>
              <Text style={styles.label}>Bio:</Text>
              <Text style={styles.value}>{profile.bio}</Text>
            </View>
          )}

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {profile.total_lessons_completed}
              </Text>
              <Text style={styles.statLabel}>Lessons</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statValue}>
                {profile.total_practice_minutes}
              </Text>
              <Text style={styles.statLabel}>Minutes</Text>
            </View>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, authLoading && styles.buttonDisabled]}
        onPress={handleLogout}
        disabled={authLoading}
      >
        <Text style={styles.buttonText}>
          {authLoading ? 'Logging out...' : 'Logout'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  profileCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  profileSection: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
  },
  button: {
    backgroundColor: '#000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
