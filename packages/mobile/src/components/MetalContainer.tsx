import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#18181b',
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});

export const MetalContainer = ({ style, ...props }: ViewProps) => (
  <View style={[styles.container, style]} {...props} />
);
