import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { plantService } from '@/services/plantService';
import { auth } from '@/services/firebase';
import { DocumentData, Timestamp } from 'firebase/firestore';

interface RecentScan {
  id: string;
  plantData: DocumentData | null;
  createdAt: Timestamp;
  plantId: string;
  userId: string;
}

export function RecentScans() {
  const router = useRouter();
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    async function loadRecentScans() {
      try {
        const scans = await plantService.getRecentScans(5); // Get last 5 scans
        setRecentScans(scans as RecentScan[]);
      } catch (error) {
        console.error('Error loading recent scans:', error);
      } finally {
        setLoading(false);
      }
    }

    loadRecentScans();
  }, []);

  const handleScanPress = (plantName: string) => {
    router.push({
      pathname: '/(tabs)/plant_info',
      params: { plantName }
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        <View style={styles.loadingContainer}>
          <Ionicons name="leaf-outline" size={24} color="#4c956c" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (recentScans.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Recent Scans</Text>
        <View style={styles.emptyContainer}>
          <Ionicons name="leaf-outline" size={24} color="#3D7756" />
          <Text style={styles.emptyText}>No recent scans</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Recent Scans</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recentScans.map((scan) => (
          <TouchableOpacity
            key={scan.id}
            style={styles.scanCard}
            onPress={() => handleScanPress(scan.plantData?.name || '')}
          >
            <Image
              source={{ uri: scan.plantData?.defaultPhoto }}
              style={styles.scanImage}
            />
            <View style={styles.scanInfo}>
              <Text style={styles.plantName} numberOfLines={1}>
                {scan.plantData?.name}
              </Text>
              <Text style={styles.scanDate}>
                {new Date(scan.createdAt.toDate()).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 20,
  },
  scanCard: {
    width: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  scanImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#4c956c',
  },
  scanInfo: {
    padding: 12,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  scanDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 16,
  },
  emptyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  emptyText: {
    color: '#ffffff',
    marginLeft: 8,
    fontSize: 16,
  },
});
