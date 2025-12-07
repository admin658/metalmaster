import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSubscription } from '../../hooks/useSubscription';

interface Props {
  title?: string;
  message?: string;
}

export const MobileInlineUpsell: React.FC<Props> = ({ title = 'Go PRO for more shredding', message = 'Unlock daily riffs, advanced stats, and AI tools.' }) => {
  const { status, isPro, isLoading, upgradeToPro } = useSubscription();
  if (isLoading || isPro || status !== 'free') return null;

  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.msg}>{message}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={upgradeToPro}>
        <Text style={styles.buttonText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#111827',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderColor: '#4b1f1f',
    borderWidth: 1,
  },
  title: { color: '#ef4444', fontWeight: '700', marginBottom: 4 },
  msg: { color: '#ddd', fontSize: 12 },
  button: { backgroundColor: '#dc2626', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6 },
  buttonText: { color: '#fff', fontWeight: '700' },
});

export default MobileInlineUpsell;
