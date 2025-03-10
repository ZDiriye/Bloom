import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { EmptyState } from '@/components/EmptyState'; 

export function RecentScans() {
  return (
    <View style={styles.recentScansContainer}>
      <ThemedText style={styles.recentScansTitle}>Recent Scans</ThemedText>
      <EmptyState />
    </View>
  );
}

const styles = StyleSheet.create({
  recentScansContainer: {
    flex: 1,
  },
  recentScansTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
});
