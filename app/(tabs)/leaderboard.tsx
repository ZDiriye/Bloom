import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { plantService } from '../../services/plantService';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

interface User {
  userId: string;
  username: string;
  xp: number;
  rank?: number;
}

export default function LeaderboardScreen() {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { colors } = useTheme();

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    try {
      const users = await plantService.getTopUsersByXP(20);
      const usersWithRank = users.map((user: any, index) => ({
        userId: user.userId,
        username: user.displayName || 'Anonymous User',
        xp: user.xp || 0,
        rank: index + 1,
      }));
      setTopUsers(usersWithRank);
    } catch (error) {
      console.error('Error fetching top users:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const getRankColor = (rank: number) => {
      switch (rank) {
        case 1:
          return '#FFD700'; // Gold
        case 2:
          return '#C0C0C0'; // Silver
        case 3:
          return '#CD7F32'; // Bronze
        default:
          return colors.text;
      }
    };

    return (
      <View style={[styles.userItem, { backgroundColor: colors.card }]}>
        <View style={styles.rankContainer}>
          <Text style={[styles.rank, { color: getRankColor(item.rank || 0) }]}>
            #{item.rank}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.username, { color: colors.text }]}>
            {item.username}
          </Text>
          <Text style={[styles.xp, { color: colors.text }]}>
            {item.xp.toLocaleString()} XP
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <Text style={styles.headerText}>Leaderboard</Text>
      </View>
      <FlatList
        data={topUsers}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  listContainer: {
    padding: 16,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: {
    fontSize: 16,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  xp: {
    fontSize: 14,
    opacity: 0.7,
  },
});
