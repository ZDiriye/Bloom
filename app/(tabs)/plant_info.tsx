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
      const lats = validObs.map(o => o.location[1]);
      const lngs = validObs.map(o => o.location[0]);
      
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      
      const midLat = (minLat + maxLat) / 2;
      const midLng = (minLng + maxLng) / 2;
      
      // Calculate deltas with padding
      const latPadding = 0.2; // 20% padding
      const lngPadding = 0.2;
      
      const latitudeDelta = Math.max(
        (maxLat - minLat) * (1 + latPadding),
        0.5 // Minimum zoom level
      );
      const longitudeDelta = Math.max(
        (maxLng - minLng) * (1 + lngPadding),
        0.5 // Minimum zoom level
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

  useEffect(() => {
    if (!auth.currentUser) return;

    const loadData = async () => {
      try {
        setIsProcessing(true);
        if (photoUri && !observationId) {  // Only check confidence for new photos, not existing observations
          // If we have a photo, predict the plant
          const prediction = await predictImage(photoUri);          
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
            setPredictionProbability(prediction.probability);
            setShowLowConfidenceMessage(true);
            setIsProcessing(false);
            return;
          }

          // Convert plant_id to plant name
          const plantName = getPlantNameFromId(prediction.plant_id);
          if (!plantName) {
            console.error('Could not find plant name for ID:', prediction.plant_id);
            return;
          }

          // Double check authentication before saving
          if (!auth.currentUser) {
            console.error('User not authenticated when trying to save plant identification');
            return;
          }
            
          const result = await plantService.fetchPlantAndSave(
            plantName,
            auth.currentUser.uid,
            prediction.probability
          );
          
          setPlantInfo(result.plantData as PlantInfo);
          setObservations(result.observations);
          setPredictionProbability(result.probability);
          setMapRegion(computeMapRegion(result.observations || []));
        } else {
          // If no photo or it's an existing observation, get plant info
          const result = await plantService.getPlantInfo(plantName, observationId);
          setPlantInfo(result.plantData as PlantInfo);
          setObservations(result.observations);
          setPredictionProbability(result.probability);
          setMapRegion(computeMapRegion(result.observations || []));
        }
      } catch (error) {
        console.error('Error loading plant data:', error);
      } finally {
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
        <PlantHeader title={showLowConfidenceMessage ? "Plant Identification" : plantInfo?.name || ""} onBack={() => router.back()} />
        <ScrollView contentContainerStyle={styles.content}>
          {showLowConfidenceMessage ? (
            <LowConfidenceMessage />
          ) : plantInfo ? (
            <>
              <PlantImageSection
                imageUrl={plantInfo.defaultPhoto}
                scientificName={plantInfo.name}
                commonName={plantInfo.commonName}
              />
              <PlantOverview 
                plantInfo={plantInfo} 
                predictionProbability={predictionProbability}
              />
              <PlantTaxonomy 
                ancestors={plantInfo.taxonomy} 
                currentSpecies={plantInfo.name} 
              />
              <PlantMap 
                observations={observations} 
                mapRegion={mapRegion} 
                loading={loadingMap} 
              />
              {plantInfo.wikipediaSummary && (
                <PlantDescription description={plantInfo.wikipediaSummary} />
              )}

              {/* ---------- Ask Gemini button ---------- */}
              <TouchableOpacity style={styles.askBtn} onPress={openChat}>
                <Text style={styles.askBtnText}>Ask Gemini</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </ScrollView>
      </View>
      {/* ---------- Chat modal ---------- */}
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
});
