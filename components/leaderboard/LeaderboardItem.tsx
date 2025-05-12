import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LeaderboardItemProps {
  userId: string;
  username: string;
  xp: number;
  rank: number;
  photoURL?: string;
  onPress: (userId: string) => void;
}

export function LeaderboardItem({
  userId,
  username,
  xp,
  rank,
  photoURL,
  onPress,
}: LeaderboardItemProps) {
  const isTopThree = rank <= 3;
  
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

  const getRankBadge = (rank: number) => {
    if (rank > 3) return null;
    const medals = ['🥇', '🥈', '🥉'];
    return medals[rank - 1];
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      style={styles.itemContainer}
      onPress={() => onPress(userId)}
    >
      <View
        style={[
          styles.userItem,
          { backgroundColor: getItemBackground(rank) }
        ]}
      >
        {/* Left section - Rank */}
        <View style={styles.rankColumn}>
          {getRankBadge(rank) ? (
            <Text style={styles.medalEmoji}>{getRankBadge(rank)}</Text>
          ) : (
            <Text style={styles.rank}>#{rank}</Text>
          )}
        </View>

        {/* Middle section - User */}
        <View style={styles.userColumn}>
          <View style={styles.userInfoContainer}>
            {photoURL ? (
              <Image 
                source={{ uri: photoURL }} 
                style={styles.profilePic}
                testID="profile-image"
              />
            ) : (
              <View style={styles.profilePicPlaceholder} testID="profile-placeholder">
                <Ionicons name="person" size={18} color="#ffffff" />
              </View>
            )}
            
            <Text 
              style={styles.username}
              numberOfLines={1}
            >
              {username}
            </Text>
          </View>
        </View>

        {/* Right section - Stats */}
        <View style={styles.statsColumn}>
          <Text style={styles.xpText}>
            {xp.toLocaleString()}XP
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
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
    width: 80,
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
    fontSize: 28,
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