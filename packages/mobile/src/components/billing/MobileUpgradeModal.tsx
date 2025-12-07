import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSubscription } from '../../hooks/useSubscription';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const MobileUpgradeModal: React.FC<Props> = ({ visible, onClose }) => {
  const { upgradeToPro } = useSubscription();

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.container}>
          <Text style={styles.title}>Go PRO. Become a Shred Overlord.</Text>
          <View style={styles.list}>
            <Text style={styles.item}>• Daily Riff every day</Text>
            <Text style={styles.item}>• Unlimited Speed Trainer sessions</Text>
            <Text style={styles.item}>• Full practice heatmap</Text>
            <Text style={styles.item}>• AI Tone Assistant</Text>
            <Text style={styles.item}>• AI Feedback & Tab Generator</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.primary} onPress={() => { upgradeToPro(); }}>
              <Text style={styles.primaryText}>Upgrade Now</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondary} onPress={onClose}>
              <Text style={styles.secondaryText}>Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    color: '#ef4444',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  list: {
    marginBottom: 16,
  },
  item: {
    color: '#fff',
    marginBottom: 6,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  } as any,
  primary: {
    flex: 1,
    backgroundColor: '#dc2626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 6,
  },
  primaryText: { color: '#fff', fontWeight: '700' },
  secondary: {
    flex: 1,
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 6,
  },
  secondaryText: { color: '#ddd', fontWeight: '600' },
});

export default MobileUpgradeModal;
