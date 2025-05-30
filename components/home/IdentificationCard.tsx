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
    description?: string;
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
      params: { 
        plantName: identification.plantName,
        observationId: identification.id 
      },
    });
  };

  const cleanAndTruncateText = (text: string | undefined) => {
    if (!text) return '';
    const cleanText = text.replace(/<\/?[^>]+(>|$)/g, '');
    const words = cleanText.split(' ').slice(0, 12);
    return words.join(' ') + '...';
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
          {new Date(identification.timestamp).toLocaleDateString()}
        </Text>
      </View>
      <View style={styles.plantInfo}>
        {identification.photoUrl ? (
          <Image
            source={{ uri: identification.photoUrl }}
            style={styles.plantImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.plantImagePlaceholder}>
            <Ionicons name="leaf-outline" size={48} color="#4c956c" />
          </View>
        )}
        <View style={styles.plantDetails}>
          <Text style={styles.plantName}>
            {identification.plantName}
          </Text>
          {identification.description && (
            <Text style={styles.description}>
              {cleanAndTruncateText(identification.description)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  userAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4c956c',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c6e49',
  },
  timestamp: {
    fontSize: 12,
    color: '#6c757d',
  },
  plantInfo: {
    backgroundColor: '#ffffff',
  },
  plantImage: {
    width: '100%',
    height: 160,
  },
  plantImagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantDetails: {
    padding: 12,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c6e49',
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
  },
});