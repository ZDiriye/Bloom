import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { getUserProfileData } from '../../services/plantService';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PlantHeader from '../../components/plant_info/PlantHeader';

interface User {
  displayName?: string;
  xp?: number;
  photoURL?: string;
}

interface RarestPlant {
  id: string;
  name: string;
  commonName?: string;
  observationsCount: number;
  photo?: string;
}

interface MostRecentPlant {
  id: string;
  name: string;
  commonName?: string;
  photo?: string;
  timestamp: any;
}

interface ProfileData {
  user: User;
  totalIdentifications: number;
  rarestPlant?: RarestPlant;
  mostRecentPlant?: MostRecentPlant;
}

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        console.log('Fetching profile for userId:', userId);
        const data = await getUserProfileData(userId);
        console.log('Received profile data:', data);
        setProfile(data as ProfileData);
      } catch (e: any) {
        console.error('Error fetching profile:', e);
        setError(e.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ffffff" />
          <Text style={styles.errorText}>{error || 'Could not load profile'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const { user, totalIdentifications, rarestPlant, mostRecentPlant } = profile;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      <PlantHeader title="User Profile" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          {user.photoURL ? (
            <Image source={{ uri: user.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
          )}
          <Text style={styles.name}>{user.displayName || 'Anonymous'}</Text>
          <View style={styles.xpContainer}>
            <Ionicons name="trophy" size={20} color="#FFD700" />
            <Text style={styles.xp}>{user.xp?.toLocaleString() || 0} XP</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalIdentifications}</Text>
              <Text style={styles.statLabel}>Total Identifications</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{user.xp || 0}</Text>
              <Text style={styles.statLabel}>Experience Points</Text>
            </View>
          </View>
        </View>

        {/* Most Recent Identification Section */}
        {mostRecentPlant && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Most Recent Discovery</Text>
            <View style={styles.plantRow}>
              {mostRecentPlant.photo ? (
                <Image source={{ uri: mostRecentPlant.photo }} style={styles.plantPhoto} />
              ) : (
                <View style={[styles.plantPhoto, styles.plantPhotoPlaceholder]}>
                  <Ionicons name="leaf" size={24} color="#ffffff" />
                </View>
              )}
              <View style={styles.plantInfo}>
                <Text style={styles.plantName}>
                  {mostRecentPlant.commonName || mostRecentPlant.name}
                </Text>
                <Text style={styles.plantScientificName}>{mostRecentPlant.name}</Text>
                <Text style={styles.plantCount}>
                  Identified on {new Date(mostRecentPlant.timestamp.toDate()).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Rarest Plant Section */}
        {rarestPlant && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Rarest Discovery</Text>
            <View style={styles.plantRow}>
              {rarestPlant.photo ? (
                <Image source={{ uri: rarestPlant.photo }} style={styles.plantPhoto} />
              ) : (
                <View style={[styles.plantPhoto, styles.plantPhotoPlaceholder]}>
                  <Ionicons name="leaf" size={24} color="#ffffff" />
                </View>
              )}
              <View style={styles.plantInfo}>
                <Text style={styles.plantName}>
                  {rarestPlant.commonName || rarestPlant.name}
                </Text>
                <Text style={styles.plantScientificName}>{rarestPlant.name}</Text>
                <Text style={styles.plantCount}>
                  Global observations: {rarestPlant.observationsCount.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  xp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginHorizontal: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantPhoto: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  plantPhotoPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  plantInfo: {
    flex: 1,
  },
  plantName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  plantScientificName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  plantCount: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});
