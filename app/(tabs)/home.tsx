import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { auth } from '../../services/firebase';
import { plantService } from '../../services/plantService';
import { IdentificationCard } from '../../components/home/IdentificationCard';
import { DocumentData, Timestamp } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';

interface Observation {
  id: string;
  plantData: DocumentData | null;
  userData: DocumentData | null;
  createdAt?: Timestamp;
}

export default function HomeScreen() {
  const router = useRouter();
  const user = auth.currentUser;
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }

    async function loadObservations() {
      try {
        const data = await plantService.getFullObservations();
        setObservations(data);
      } catch (error) {
        console.error('Error loading observations:', error);
      } finally {
        setLoading(false);
      }
    }
    loadObservations();
  }, [user]);

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c6e49" />
      </SafeAreaView>
    );
  }

  if (observations.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Stack.Screen options={{ headerShown: false }} />
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.header}>
          <Text style={styles.headerText}>Recent Identifications</Text>
        </View>
        <View style={styles.emptyContent}>
          <Text style={styles.emptyTitle}>No Identifications Yet!</Text>
          <Text style={styles.emptySubtitle}>Start identifying plants by taking a photo or choosing from your library.</Text>
          <View style={styles.emptyButtonsContainer}>
            <TouchableOpacity
              style={[styles.emptyButton, styles.primaryButton]}
              onPress={() => router.push('../CameraModal')}
            >
              <Text style={styles.emptyButtonText}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.emptyButton, styles.secondaryButton]}
              onPress={() => router.push('../ImagePickerModal')}
            >
              <Text style={[styles.emptyButtonText, styles.secondaryButtonText]}>Choose from Library</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <Text style={styles.headerText}>Recent Identifications</Text>
      </View>

      <FlatList
        data={observations}
        contentContainerStyle={styles.listContentContainer}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const date = item.createdAt?.toDate
            ? item.createdAt.toDate()
            : new Date();

          return (
            <IdentificationCard
              identification={{
                id: item.id,
                plantName: item.plantData?.name || 'Unknown',
                commonName: item.plantData?.commonName,
                photoUrl: item.plantData?.defaultPhoto,
                timestamp: date,
                description: item.plantData?.wikipediaSummary,
                conservationStatus: item.plantData?.conservationStatus,
                user: {
                  displayName: item.userData?.displayName || 'User',
                  photoURL: item.userData?.photoURL,
                },
              }}
            />
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#ffffff',
    marginBottom: 24,
    textAlign: 'center',
    opacity: 0.8,
  },
  emptyButtonsContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  emptyButtonText: {
    color: '#2c6e49',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#ffffff',
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
});
