import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

export function EmptyState() {
  return (
    <View style={styles.emptyStateContainer}>
      <Ionicons name="leaf-outline" size={48} color="#4c956c" style={styles.emptyStateIcon} />
      <ThemedText style={styles.emptyStateText}>
        Your identified plants will appear here
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyStateContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyStateText: {
    color: 'white',
    opacity: 0.7,
    fontSize: 16,
    textAlign: 'center',
  },
});
