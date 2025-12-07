import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSubscription } from '../../hooks/useSubscription';

export const MobileUpsellBanner: React.FC = () => {
  const { status, isPro, isLoading, upgradeToPro } = useSubscription();

  if (isLoading || isPro || status !== 'free') return null;

  return (
    <View style={styles.bar}>
      <Text style={styles.text}>Unlock Metal Master PRO</Text>
      <TouchableOpacity onPress={upgradeToPro} style={styles.button}>
        <Text style={styles.buttonText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#dc2626',
  } as any,
  text: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#fff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#991b1b',
    fontWeight: '700',
  }
});

export default MobileUpsellBanner;
