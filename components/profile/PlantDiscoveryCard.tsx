import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Plant {
  name: string;
  commonName?: string;
  photo?: string;
  timestamp?: any;
  observationsCount?: number;
}

interface PlantDiscoveryCardProps {
  title: string;
  plant: Plant;
  showDate?: boolean;
  showObservations?: boolean;
}

export function PlantDiscoveryCard({
  title,
  plant,
  showDate = false,
  showObservations = false,
}: PlantDiscoveryCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <View style={styles.plantRow}>
        {plant.photo ? (
          <Image source={{ uri: plant.photo }} style={styles.plantPhoto} />
        ) : (
          <View style={[styles.plantPhoto, styles.plantPhotoPlaceholder]}>
            <Ionicons name="leaf" size={20} color="#ffffff" />
          </View>
        )}
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>
            {plant.commonName || plant.name}
          </Text>
          <Text style={styles.plantScientificName}>{plant.name}</Text>
          {showDate && plant.timestamp && (
            <Text style={styles.plantDetail}>
              Found: {new Date(plant.timestamp.toDate()).toLocaleDateString()}
            </Text>
          )}
          {showObservations && plant.observationsCount !== undefined && (
            <Text style={styles.plantDetail}>
              Seen: {plant.observationsCount.toLocaleString()} times
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    paddingVertical: 22,
    paddingHorizontal: 12,
    marginBottom: 28,
    minHeight: 100,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantPhoto: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
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
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  plantScientificName: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  plantDetail: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
}); 