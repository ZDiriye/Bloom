import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, SafeAreaView, Image, TouchableOpacity, RefreshControl } from 'react-native';
import { plantService } from '../../services/plantService';
import { useTheme } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


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
  const { colors } = useTheme();
  const router = useRouter();

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
        photoURL: user.photoURL,
      }));
      setTopUsers(usersWithRank);
    } catch (error) {
      console.error('Error fetching top users:', error);
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

  const renderUserItem = ({ item, index }: { item: User; index: number }) => {
    const isTopThree = item.rank && item.rank <= 3;
    // Determine background color based on rank
    const getItemBackground = (rank: number) => {
      switch (rank) {
        case 1:
          return 'rgba(255, 215, 0, 0.2)'; // Gold for 1st
        case 2:
          return 'rgba(192, 192, 192, 0.2)'; // Silver for 2nd
        case 3:
          return 'rgba(205, 127, 50, 0.2)'; // Bronze for 3rd
        default:
          return 'rgba(76, 175, 80, 0.2)'; // Default green for others
      }
    };

    // Get medal emoji for top 3
    const getRankBadge = (rank: number) => {
      if (rank > 3) return null;
      const medals = ['🥇', '🥈', '🥉'];
      return medals[rank - 1];
    };

    return (
      <TouchableOpacity 
        activeOpacity={0.7}
        style={styles.itemContainer}
        onPress={() => showUser(item.userId)}
      >
        <View
          style={[
            styles.userItem,
            { backgroundColor: getItemBackground(item.rank || 0) }
          ]}
        >
          {/* Left section - Rank */}
          <View style={styles.rankColumn}>
            {getRankBadge(item.rank || 0) ? (
              <Text style={styles.medalEmoji}>{getRankBadge(item.rank || 0)}</Text>
            ) : (
              <Text style={styles.rank}>#{item.rank}</Text>
            )}
          </View>

          {/* Middle section - User */}
          <View style={styles.userColumn}>
            <View style={styles.userInfoContainer}>
              {item.photoURL ? (
                <Image 
                  source={{ uri: item.photoURL }} 
                  style={styles.profilePic} 
                />
              ) : (
                <View style={styles.profilePicPlaceholder}>
                  <Ionicons name="person" size={18} color="#ffffff" />
                </View>
              )}
              
              <Text 
                style={styles.username}
                numberOfLines={1}
              >
                {item.username}
              </Text>
            </View>
          </View>

          {/* Right section - Stats */}
          <View style={styles.statsColumn}>
            <Text style={styles.xpText}>
              {item.xp.toLocaleString()}XP
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Leaderboard</Text>
        <Text style={styles.subHeaderText}>Top plant identifiers</Text>
      </View>
      
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
      
      <FlatList
        data={topUsers}
        renderItem={renderUserItem}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 16,
  },
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
    paddingHorizontal: 16, // Match list container padding
    paddingVertical: 12,
    marginBottom: 4,
  },
  // Specific header column styles to match content alignment
  rankColumnHeader: {
    width: 60,
    alignItems: 'center',
  },
  userColumnHeader: {
    flex: 1,
    paddingLeft: 40, // Offset to account for profile pic + spacing to align with username
  },
  statsColumnHeader: {
    width: 80, // Reduced width to match XP text position
    alignItems: 'flex-end',
    paddingRight: 14, // Increased padding to match the XP value position
  },
  columnHeaderText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  itemContainer: {
    marginBottom: 12,
    width: '100%',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  rankColumn: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  statsColumn: {
    width: 80, // Reduced width to match header position
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    paddingRight: 0,
  },
  rank: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  medalEmoji: {
    fontSize: 28, // Larger medal icons
    lineHeight: 32,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profilePic: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  profilePicPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
    flex: 1,
  },
  xpText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
});