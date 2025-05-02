import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileHeader } from './ProfileHeader';
import { ProfileStats } from './ProfileStats';
import { ProfileActions } from './ProfileActions';

interface ProfileContainerProps {
  profilePic: string;
  displayName: string;
  level: number;
  stats: Array<{
    label: string;
    value: string | number;
  }>;
  actions: Array<{
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    onPress: () => void;
  }>;
}

export function ProfileContainer({
  profilePic,
  displayName,
  level,
  stats,
  actions,
}: ProfileContainerProps) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <ProfileHeader
          profilePic={profilePic}
          displayName={displayName}
          level={level}
        />
        <ProfileStats stats={stats} />
        <ProfileActions actions={actions} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingVertical: 20,
  },
}); 