import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface ProfileHeaderProps {
  profilePic: string;
  displayName: string;
  level: number;
}

export function ProfileHeader({ profilePic, displayName, level }: ProfileHeaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.profilePicContainer}>
        <Image
          source={profilePic ? { uri: profilePic } : require('@/assets/images/default-avatar.png')}
          style={styles.profilePic}
        />
      </View>
      <ThemedText type="title" style={styles.name}>{displayName}</ThemedText>
      <ThemedText style={styles.level}>Level {level}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  profilePicContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#2c6e49',
  },
  profilePic: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  level: {
    fontSize: 16,
    color: '#666',
  },
}); 