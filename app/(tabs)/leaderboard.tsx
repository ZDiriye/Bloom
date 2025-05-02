import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, SafeAreaView, RefreshControl } from 'react-native';
import { plantService } from '../../services/plantService';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { LeaderboardItem } from '../../components/leaderboard/LeaderboardItem';
import { LeaderboardHeader } from '../../components/leaderboard/LeaderboardHeader';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

interface User {
  userId: string;
  username: string;
  xp: number;
  rank?: number;
  photoURL?: string;
}

export default function LeaderboardScreen() {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    try {
      setError(null);
      const users = await plantService.getTopUsersByXP(20);
      const usersWithRank = users.map((user: any, index) => ({
        userId: user.userId,
        username: user.displayName || 'Anonymous User',
        xp: user.xp || 0,
        rank: index + 1,
        photoURL: user.photoURL,
      }));
      setTopUsers(usersWithRank);
    } catch (error) {
      console.error('Error fetching top users:', error);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const showUser = (id: string) => {
    router.push({
      pathname: '/(tabs)/userProfileScreen',
      params: { userId: id }
    });
  };
  
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchTopUsers();
  }, []);

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <LoadingState message="Loading leaderboard..." />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <ErrorState message={error} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      
      <LeaderboardHeader />
      
      <FlatList
        data={topUsers}
        renderItem={({ item }) => (
          <LeaderboardItem
            userId={item.userId}
            username={item.username}
            xp={item.xp}
            rank={item.rank || 0}
            photoURL={item.photoURL}
            onPress={showUser}
          />
        )}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            colors={['#ffffff']}
            progressBackgroundColor="#4c956c"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
});