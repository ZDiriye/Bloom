import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';

interface Observation {
  geojson?: {
    coordinates: number[];
  };
  observed_on: string;
  user?: {
    login: string;
  };
}

interface PlantMapProps {
  observations: Observation[];
  mapRegion: Region;
  loading: boolean;
}

const PlantMap: React.FC<PlantMapProps> = ({ observations, mapRegion, loading }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Observation Locations</Text>
      {loading ? (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="small" color="#ffffff" />
          <Text style={styles.mapLoadingText}>Loading observation map...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer}>
          <MapView style={styles.map} region={mapRegion}>
            {observations
              .filter(obs => obs.geojson?.coordinates)
              .map((obs, index) => (
                <Marker
                  key={index}
                  coordinate={{
                    latitude: obs.geojson!.coordinates[1],
                    longitude: obs.geojson!.coordinates[0],
                  }}
                  title={`Observed: ${new Date(obs.observed_on).toLocaleDateString()}`}
                  description={`By: ${obs.user?.login || 'Anonymous'}`}
                >
                  <View style={styles.markerContainer}>
                    <Ionicons name="leaf" size={18} color="#ffffff" />
                  </View>
                </Marker>
              ))}
          </MapView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 240,
  },
  map: {
    height: '100%',
    width: '100%',
  },
  mapPlaceholder: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  mapLoadingText: {
    marginTop: 8,
    color: '#ffffff',
  },
  markerContainer: {
    backgroundColor: '#2c6e49',
    borderRadius: 12,
    padding: 6,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
});

export default PlantMap;