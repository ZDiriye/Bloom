import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, Region } from 'react-native-maps';

interface Observation {
  location: number[];
}

interface PlantMapProps {
  observations: Observation[];
  mapRegion: Region;
  loading: boolean;
}

const PlantMap: React.FC<PlantMapProps> = ({ observations, mapRegion, loading }) => {
  // Filter and validate observations
  const validObservations = useMemo(() => {
    return observations.filter(obs => 
      obs.location && 
      obs.location.length === 2 && 
      !isNaN(obs.location[0]) && 
      !isNaN(obs.location[1]) &&
      obs.location[0] >= -180 && 
      obs.location[0] <= 180 &&
      obs.location[1] >= -90 && 
      obs.location[1] <= 90
    );
  }, [observations]);

  // Limit the number of markers to prevent performance issues
  const displayObservations = useMemo(() => {
    return validObservations.slice(0, 100);
  }, [validObservations]);

  return (
    <View style={styles.section} testID="map-section">
      <Text style={styles.sectionTitle}>Observation Locations</Text>
      {loading ? (
        <View style={styles.mapPlaceholder}>
          <ActivityIndicator size="small" color="#ffffff" testID="activity-indicator" />
          <Text style={styles.mapLoadingText}>Loading observation map...</Text>
        </View>
      ) : (
        <View style={styles.mapContainer} testID="map-container">
          <MapView 
            style={styles.map} 
            region={mapRegion}
            showsUserLocation={true}
            showsMyLocationButton={true}
            initialRegion={mapRegion}
          >
            {displayObservations.map((obs, index) => (
              <Marker
                key={`${obs.location[0]}-${obs.location[1]}-${index}`}
                coordinate={{
                  latitude: obs.location[1],
                  longitude: obs.location[0]
                }}
              >
                <View style={styles.markerContainer}>
                  <Ionicons name="leaf" size={24} color="#ffffff" />
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
