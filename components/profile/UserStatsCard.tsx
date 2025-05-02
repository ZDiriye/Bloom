import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UserStatsCardProps {
  totalIdentifications: number;
  xp: number;
}

export function UserStatsCard({ totalIdentifications, xp }: UserStatsCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Stats</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{totalIdentifications}</Text>
          <Text style={styles.statLabel}>Plants Found</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{xp}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingVertical: 24,
    paddingHorizontal: 12,
    marginBottom: 28,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 18,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
}); 