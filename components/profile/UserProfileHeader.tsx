import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UserProfileHeaderProps {
  photoURL?: string;
  displayName: string;
  xp: number;
}

export function UserProfileHeader({ photoURL, displayName, xp }: UserProfileHeaderProps) {
  return (
    <View style={styles.header}>
      {photoURL ? (
        <Image source={{ uri: photoURL }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={32} color="#ffffff" />
        </View>
      )}
      <Text style={styles.name}>{displayName || 'Anonymous'}</Text>
      <Text style={styles.xp}>{xp.toLocaleString()} XP</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  xp: {
    fontSize: 14,
    color: '#ffffff',
    marginBottom: 16,
  },
}); 