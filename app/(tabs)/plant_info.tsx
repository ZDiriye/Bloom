import { View, StyleSheet, ScrollView, ActivityIndicator, Text, TouchableOpacity, } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { plantService } from '../../services/plantService';
import { auth } from '../../services/firebase';
import { DocumentData } from 'firebase/firestore';
import { Region } from 'react-native-maps';
import { predictImage } from '../../utils/new_mlModel';
import classNames from '../../assets/class_names.json';
import PlantHeader from '../../components/plant_info/PlantHeader';
import PlantImageSection from '../../components/plant_info/PlantImageSection';
import PlantOverview from '../../components/plant_info/PlantOverview';
import PlantTaxonomy from '../../components/plant_info/PlantTaxonomy';
import PlantMap from '../../components/plant_info/PlantMap';
import PlantDescription from '../../components/plant_info/PlantDescription';
import PlantChatModal from '../../components/plant_info/PlantChatModal';
import LowConfidenceMessage from '../../components/plant_info/LowConfidenceMessage';

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
  location: number[];
}

interface PlantResult {
  plantData: PlantInfo;
  observations: Observation[];
  probability: number;
}

export default function PlantInfoScreen() {
  const { plantName, photoUri, isFrontCamera, observationId } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [predictionProbability, setPredictionProbability] = useState<number | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 90,
    longitudeDelta: 180,
  });
  const [loadingMap, setLoadingMap] = useState(true);
  const [isProcessing, setIsProcessing] = useState(!!photoUri);
  const [showLowConfidenceMessage, setShowLowConfidenceMessage] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const openChat  = () => setChatVisible(true);
  const closeChat = () => setChatVisible(false);

  const getPlantNameFromId = (plantId: string): string | null => {
    const plantName = classNames[plantId as keyof typeof classNames];
    if (!plantName) return null;
    // Replace underscores with spaces and capitalize first letter
    return plantName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  const computeMapRegion = (observations: Observation[]): Region => {
    if (!observations || observations.length === 0) {
      // Default to a world view if no observations
      return {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 90,
        longitudeDelta: 180,
      };
    }

    // Filter out observations without valid coordinates
    const validObservations = observations.filter(obs => 
      obs.location && 
      Array.isArray(obs.location) && 
      obs.location.length === 2 &&
      typeof obs.location[0] === 'number' &&
      typeof obs.location[1] === 'number' &&
      obs.location[0] >= -180 && obs.location[0] <= 180 && // Validate longitude
      obs.location[1] >= -90 && obs.location[1] <= 90     // Validate latitude
    );

    if (validObservations.length === 0) {
      // If no valid observations, use the first observation's coordinates if available
      const firstObs = observations[0];
      if (firstObs?.location && Array.isArray(firstObs.location) && firstObs.location.length === 2) {
        const [lng, lat] = firstObs.location;
        // Ensure coordinates are within valid ranges
        const validLat = Math.max(-90, Math.min(90, lat));
        const validLng = Math.max(-180, Math.min(180, lng));
        return {
          latitude: validLat,
          longitude: validLng,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        };
      }
      // Fallback to world view
      return {
        latitude: 0,
        longitude: 0,
        latitudeDelta: 90,
        longitudeDelta: 180,
      };
    }

    // Calculate bounds from valid observations
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    
    validObservations.forEach(obs => {
      const [lng, lat] = obs.location;
      // Ensure coordinates are within valid ranges
      const validLat = Math.max(-90, Math.min(90, lat));
      const validLng = Math.max(-180, Math.min(180, lng));
      minLat = Math.min(minLat, validLat);
      maxLat = Math.max(maxLat, validLat);
      minLng = Math.min(minLng, validLng);
      maxLng = Math.max(maxLng, validLng);
    });

    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // Calculate deltas with reasonable bounds
    const latDelta = Math.min(90, Math.max(0.1, (maxLat - minLat) * 1.5));
    const lngDelta = Math.min(180, Math.max(0.1, (maxLng - minLng) * 1.5));

    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };
  };

  useEffect(() => {
    if (!auth.currentUser) return;

    const loadData = async () => {
      try {
        setIsProcessing(true);
        console.log('Starting data load...');
        
        if (photoUri && !observationId) {
          console.log('Processing new photo...');
          // If we have a photo, predict the plant
          const prediction = await predictImage(photoUri);    
          console.log('Prediction received:', prediction);
          
          if (!prediction) {
            console.error('No prediction returned from predictImage');
            return;
          }
          if (!prediction.plant_id) {
            console.error('Prediction missing plant_id:', prediction);
            return;
          }

          // Check prediction confidence before proceeding
          if (prediction.probability < 0.5) {
            console.log('Low confidence prediction:', prediction.probability);
            setPredictionProbability(prediction.probability);
            setShowLowConfidenceMessage(true);
            setIsProcessing(false);
            return;
          }

          // Convert plant_id to plant name
          const plantName = getPlantNameFromId(prediction.plant_id);
          console.log('Converted plant ID to name:', plantName);
          
          if (!plantName) {
            console.error('Could not find plant name for ID:', prediction.plant_id);
            return;
          }

          // Double check authentication before saving
          if (!auth.currentUser) {
            console.error('User not authenticated when trying to save plant identification');
            return;
          }
            
          console.log('Fetching and saving plant data...');
          const result = await plantService.fetchPlantAndSave(
            plantName,
            auth.currentUser.uid,
            prediction.probability
          );
          console.log('Plant data fetched and saved:', result);
          
          // Validate data before setting state
          if (!result || !result.plantData) {
            console.error('Invalid result from fetchPlantAndSave:', result);
            return;
          }

          try {
            setPlantInfo(result.plantData as PlantInfo);
            setObservations(result.observations || []);
            setPredictionProbability(result.probability);
            const region = computeMapRegion(result.observations || []);
            console.log('Computed map region:', region);
            setMapRegion(region);
          } catch (stateError) {
            console.error('Error setting state:', stateError);
          }
        } else if (observationId) {
          console.log('Loading existing observation...');
          // If no photo or it's an existing observation, get plant info
          const result = await plantService.getPlantInfo(observationId);
          console.log('Existing observation loaded:', result);
          
          if (!result || !result.plantData) {
            console.error('Invalid result from getPlantInfo:', result);
            return;
          }

          try {
            setPlantInfo(result.plantData as PlantInfo);
            setObservations(result.observations || []);
            setPredictionProbability(result.probability);
            const region = computeMapRegion(result.observations || []);
            console.log('Computed map region:', region);
            setMapRegion(region);
          } catch (stateError) {
            console.error('Error setting state:', stateError);
          }
        } else {
          console.error('No photoUri or observationId provided');
          router.back();
        }
      } catch (error) {
        console.error('Error loading plant data:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          });
        }
      } finally {
        console.log('Finishing data load...');
        setLoadingMap(false);
        setIsProcessing(false);
      }
    };

    loadData();
  }, [plantName, photoUri, isFrontCamera, observationId]);

  // Show loading screen only if we're processing and not showing low confidence message
  if ((!plantInfo || isProcessing) && !showLowConfidenceMessage) {
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

  // Add error boundary
  if (!plantInfo && !showLowConfidenceMessage) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <PlantHeader 
          title="Error" 
          onBack={() => router.back()} 
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Unable to load plant information. Please try again.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: false,
          headerShown: false,
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <PlantHeader 
          title={showLowConfidenceMessage ? "Plant Identification" : plantInfo?.name || ""} 
          onBack={() => {
            if (photoUri) {
              // If we came from identification (has photoUri), go back to identification
              router.push('/(tabs)/identification');
            } else if (observationId) {
              // If we came from get recent screen (has observationId), go back to home
              router.push('/(tabs)/home');
            } else {
              // Otherwise use default back behavior
              router.back();
            }
          }} 
        />
        <ScrollView contentContainerStyle={styles.content}>
          {showLowConfidenceMessage ? (
            <LowConfidenceMessage />
          ) : plantInfo ? (
            <>
              <PlantImageSection
                imageUrl={plantInfo?.defaultPhoto ?? ''}
                scientificName={plantInfo?.name ?? ''}
                commonName={plantInfo?.commonName ?? ''}
              />
              <PlantOverview 
                plantInfo={plantInfo} 
                predictionProbability={predictionProbability}
              />
              <PlantTaxonomy
                ancestors={plantInfo?.taxonomy ?? []}
                currentSpecies={plantInfo?.name ?? ''}
              />
              <PlantMap 
                observations={observations} 
                mapRegion={mapRegion} 
                loading={loadingMap} 
              />
              {plantInfo?.wikipediaSummary && (
                <PlantDescription description={plantInfo.wikipediaSummary} />
              )}

              <TouchableOpacity style={styles.askBtn} onPress={openChat}>
                <Text style={styles.askBtnText}>Ask Gemini</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </ScrollView>
      </View>
      {plantInfo && (
        <PlantChatModal
          plantName={plantInfo.name}
          visible={chatVisible}
          onClose={closeChat}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom:100 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#ffffff', marginTop: 16 },

  askBtn: {
    alignSelf: 'center',
    backgroundColor: '#4c956c',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 12,
  },
  askBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
  },
});
