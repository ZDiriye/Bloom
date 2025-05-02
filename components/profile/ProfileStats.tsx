import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface StatItem {
  label: string;
  value: string | number;
}

interface ProfileStatsProps {
  stats: StatItem[];
}

export function ProfileStats({ stats }: ProfileStatsProps) {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statItem}>
          <ThemedText type="title" style={styles.value}>{stat.value}</ThemedText>
          <ThemedText style={styles.label}>{stat.label}</ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statItem: {
    width: '30%',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
}); 