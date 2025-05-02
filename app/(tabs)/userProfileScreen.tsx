import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { getUserProfileData } from '../../services/plantService';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import PlantHeader from '../../components/plant_info/PlantHeader';
import { UserProfileHeader } from '../../components/profile/UserProfileHeader';
import { UserStatsCard } from '../../components/profile/UserStatsCard';
import { PlantDiscoveryCard } from '../../components/profile/PlantDiscoveryCard';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';

interface ProfileData {
  user: {
    displayName?: string;
    xp?: number;
    photoURL?: string;
  };
  totalIdentifications: number;
  rarestPlant?: {
    name: string;
    commonName?: string;
    photo?: string;
    observationsCount: number;
  };
  mostRecentPlant?: {
    name: string;
    commonName?: string;
    photo?: string;
    timestamp: any;
  };
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
        <LoadingState message="Loading profile..." />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <ErrorState message={error || 'Could not load profile'} />
      </SafeAreaView>
    );
  }

  const { user, totalIdentifications, rarestPlant, mostRecentPlant } = profile;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      <PlantHeader title="User Profile" onBack={() => router.push('/(tabs)/leaderboard')} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <UserProfileHeader
          photoURL={user.photoURL}
          displayName={user.displayName || 'Anonymous'}
          xp={user.xp || 0}
        />
        
        <UserStatsCard
          totalIdentifications={totalIdentifications}
          xp={user.xp || 0}
        />

        {mostRecentPlant && (
          <PlantDiscoveryCard
            title="Most Recent Discovery"
            plant={mostRecentPlant}
            showDate={true}
          />
        )}

        {rarestPlant && (
          <PlantDiscoveryCard
            title="Rarest Discovery"
            plant={rarestPlant}
            showObservations={true}
          />
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
});
