import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function LeaderboardHeader() {
  return (
    <View style={styles.header}>
      <Text style={styles.headerText}>Leaderboard</Text>
      <Text style={styles.subHeaderText}>Top plant identifiers</Text>
      
      {/* Column headers aligned with content */}
      <View style={styles.columnHeadersContainer}>
        <View style={styles.rankColumnHeader}>
          <Text style={styles.columnHeaderText}>Rank</Text>
        </View>
        
        <View style={styles.userColumnHeader}>
          <Text style={styles.columnHeaderText}>User</Text>
        </View>
        
        <View style={styles.statsColumnHeader}>
          <Text style={styles.columnHeaderText}>Stats</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
    marginTop: 4,
  },
  columnHeadersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
  },
  rankColumnHeader: {
    width: 60,
    alignItems: 'center',
  },
  userColumnHeader: {
    flex: 1,
    paddingLeft: 40,
  },
  statsColumnHeader: {
    width: 80,
    alignItems: 'flex-end',
    paddingRight: 14,
  },
  columnHeaderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
}); 