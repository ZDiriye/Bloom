import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

interface IdentificationCardProps {
  identification: {
    id: string;
    plantName: string;
    commonName?: string;
    photoUrl: string;
    timestamp: Date;
    user: {
      displayName: string;
      photoURL?: string;
    };
  };
}

export function IdentificationCard({ identification }: IdentificationCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: '/(tabs)/plant_info',
      params: { plantName: identification.plantName },
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {identification.user.photoURL ? (
            <Image
              source={{ uri: identification.user.photoURL }}
              style={styles.userAvatar}
            />
          ) : (
            <View style={styles.userAvatarPlaceholder}>
              <Ionicons name="person" size={24} color="#ffffff" />
            </View>
          )}
          <Text style={styles.userName}>{identification.user.displayName}</Text>
        </View>
        <Text style={styles.timestamp}>
          {identification.timestamp.toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.plantInfo}>
        {identification.photoUrl ? (
          <Image
            source={{ uri: identification.photoUrl }}
            style={styles.plantImage}
          />
        ) : (
          <View style={styles.plantImagePlaceholder}>
            <Ionicons name="leaf-outline" size={40} color="#4c956c" />
          </View>
        )}
        <View style={styles.plantDetails}>
          <Text style={styles.plantName}>{identification.plantName}</Text>
          {identification.commonName && (
            <Text style={styles.commonName}>{identification.commonName}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // A subtle shadow for Android/iOS:
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Make sure card fills the parent width
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  userAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4c956c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c6e49',
  },
  timestamp: {
    fontSize: 14,
    color: '#666666',
  },
  plantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  plantImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  plantDetails: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c6e49',
  },
  commonName: {
    fontSize: 14,
    color: '#666666',
  }
});