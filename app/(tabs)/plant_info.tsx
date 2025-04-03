// PlantInfoScreen.js
import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { plantService } from '../../services/plantService';
import { auth } from '../../services/firebase';
import { DocumentData } from 'firebase/firestore';
import { Region } from 'react-native-maps';
import { predictImage } from '../../utils/new_mlModel';
import classNames from '../../assets/class_names.json';

// Import components (ensure these are correctly set up in your project)
import PlantHeader from '../../components/plant_info/PlantHeader';
import PlantImageSection from '../../components/plant_info/PlantImageSection';
import PlantOverview from '../../components/plant_info/PlantOverview';
import PlantTaxonomy from '../../components/plant_info/PlantTaxonomy';
import PlantMap from '../../components/plant_info/PlantMap';
import PlantDescription from '../../components/plant_info/PlantDescription';
import ExternalLinks from '../../components/plant_info/ExternalLinks';

interface PlantInfo extends DocumentData {
  id: number;
  name: string;
  commonName?: string;
  defaultPhoto?: string;
  extinct: boolean;
  observationsCount: number;
  conservationStatus: string;
  endemic: boolean;
  firstObservation: string;
  wikipediaSummary?: string;
  wikipediaUrl?: string;
  taxonomy?: Array<{
    rank: string;
    name: string;
  }>;
}

interface Observation {
  location?: number[];
  observedOn: string;
  user?: {
    login: string;
  };
}

export default function PlantInfoScreen() {
  const { plantName, photoUri, isFrontCamera } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 90,
    longitudeDelta: 180,
  });
  const [loadingMap, setLoadingMap] = useState(true);
  const [isProcessing, setIsProcessing] = useState(!!photoUri);

  const getPlantNameFromId = (plantId: string): string | null => {
    const plantName = classNames[plantId as keyof typeof classNames];
    if (!plantName) return null;
    // Replace underscores with spaces and capitalize first letter
    return plantName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  // Compute a region that covers all observation coordinates
  const computeMapRegion = (obs: Observation[]): Region => {
    const validObs = obs.filter(o => o.location && o.location.length === 2 && 
      typeof o.location[0] === 'number' && typeof o.location[1] === 'number' &&
      o.location[0] >= -180 && o.location[0] <= 180 &&
      o.location[1] >= -90 && o.location[1] <= 90);

    if (validObs.length === 0) {
      // Default to a reasonable view of the world
      return {
        latitude: 20,
        longitude: 0,
        latitudeDelta: 90,
        longitudeDelta: 180,
      };
    }

    try {
      // Note: Assuming location is [longitude, latitude]
      const lats = validObs.map(o => o.location![1]);
      const lngs = validObs.map(o => o.location![0]);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const midLat = (minLat + maxLat) / 2;
      const midLng = (minLng + maxLng) / 2;
      
      // Calculate deltas with padding and minimum values
      const latPadding = 0.1; // 10% padding
      const lngPadding = 0.1;
      const minLatDelta = 0.0922; // Minimum zoom level
      const minLngDelta = 0.0421;

      const latitudeDelta = Math.max(
        (maxLat - minLat) * (1 + latPadding),
        minLatDelta
      );
      const longitudeDelta = Math.max(
        (maxLng - minLng) * (1 + lngPadding),
        minLngDelta
      );

      return {
        latitude: midLat,
        longitude: midLng,
        latitudeDelta,
        longitudeDelta,
      };
    } catch (error) {
      console.error('Error computing map region:', error);
      // Return default region if calculation fails
      return {
        latitude: 20,
        longitude: 0,
        latitudeDelta: 90,
        longitudeDelta: 180,
      };
    }
  };

  // Function to calculate the most dense area of observations
  const calculateDenseArea = (obs: Observation[]): Region => {
    const validObs = obs.filter(o => o.location && o.location.length === 2);
    if (validObs.length === 0) {
      // Return default region if no valid observations
      return {
        latitude: 20,
        longitude: 0,
        latitudeDelta: 90,
        longitudeDelta: 180,
      };
    }

    try {
      // Create a grid to count observations in each cell
      const gridSize = 10; // Number of cells in each dimension
      const grid: { [key: string]: number } = {};
      
      const lats = validObs.map(o => o.location![1]);
      const lngs = validObs.map(o => o.location![0]);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const latStep = (maxLat - minLat) / gridSize;
      const lngStep = (maxLng - minLng) / gridSize;

      // Count observations in each grid cell
      validObs.forEach(obs => {
        const lat = obs.location![1];
        const lng = obs.location![0];
        const latIndex = Math.floor((lat - minLat) / latStep);
        const lngIndex = Math.floor((lng - minLng) / lngStep);
        const key = `${latIndex},${lngIndex}`;
        grid[key] = (grid[key] || 0) + 1;
      });

      // Find the cell with the most observations
      let maxCount = 0;
      let densestCell = '0,0';
      Object.entries(grid).forEach(([key, count]) => {
        if (count > maxCount) {
          maxCount = count;
          densestCell = key;
        }
      });

      // Convert grid cell back to coordinates
      const [latIndex, lngIndex] = densestCell.split(',').map(Number);
      const centerLat = minLat + (latIndex + 0.5) * latStep;
      const centerLng = minLng + (lngIndex + 0.5) * lngStep;

      // Return a region centered on the densest area with appropriate zoom
      return {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latStep * 2, // Show 2 cells worth of area
        longitudeDelta: lngStep * 2,
      };
    } catch (error) {
      console.error('Error calculating dense area:', error);
      // Return default region if calculation fails
      return {
        latitude: 20,
        longitude: 0,
        latitudeDelta: 90,
        longitudeDelta: 180,
      };
    }
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const loadData = async () => {
      try {
        setIsProcessing(true); // Set processing state to true when starting to load data
        if (photoUri) {
          // Use the server-based prediction method.
          const prediction = await predictImage(photoUri);
          console.log('Prediction:', prediction);
          
          // Get the plant name from the ID using class_names.json
          const plantName = getPlantNameFromId(prediction.plant_id);
          if (!plantName) {
            throw new Error('Could not find plant name for ID: ' + prediction.plant_id);
          }

          // Fetch plant info using the plant name
          const result = await plantService.fetchPlantAndSave(
            plantName,
            (auth.currentUser as any).uid
          );
          if (result) {
            setPlantInfo(result.plantData as PlantInfo);
            setObservations(result.observations || []);
            
            // First set the initial map region
            setMapRegion(computeMapRegion(result.observations || []));
            
            // Then calculate and set the dense area if available
            const denseArea = calculateDenseArea(result.observations || []);
            if (denseArea) {
              // Use setTimeout to ensure the initial region is set first
              setTimeout(() => {
                setMapRegion(denseArea);
              }, 1000);
            }
          }
        } else {
          // Fetch plant info directly if you have a plant name.
          const result = await plantService.fetchPlantAndSave(
            plantName as string,
            (auth.currentUser as any).uid
          );
          if (result) {
            setPlantInfo(result.plantData as PlantInfo);
            setObservations(result.observations || []);
            
            // First set the initial map region
            setMapRegion(computeMapRegion(result.observations || []));
            
            // Then calculate and set the dense area if available
            const denseArea = calculateDenseArea(result.observations || []);
            if (denseArea) {
              // Use setTimeout to ensure the initial region is set first
              setTimeout(() => {
                setMapRegion(denseArea);
              }, 1000);
            }
          }
        }
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setLoadingMap(false);
        setIsProcessing(false);
      }
    };

    loadData();
  }, [plantName, photoUri, isFrontCamera]);

  if (!plantInfo || isProcessing) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>
          {isProcessing && photoUri ? 'Identifying plant...' : 'Loading plant information...'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      <PlantHeader title={plantInfo.name} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={styles.content}>
        <PlantImageSection
          imageUrl={plantInfo.defaultPhoto}
          scientificName={plantInfo.name}
          commonName={plantInfo.commonName}
        />
        <PlantOverview plantInfo={plantInfo} />
        <PlantTaxonomy ancestors={plantInfo.taxonomy} currentSpecies={plantInfo.name} />
        <PlantMap observations={observations} mapRegion={mapRegion} loading={loadingMap} />
        {plantInfo.wikipediaSummary && <PlantDescription description={plantInfo.wikipediaSummary} />}
        {plantInfo.wikipediaUrl && <ExternalLinks wikipediaUrl={plantInfo.wikipediaUrl} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#ffffff', marginTop: 16 },
});