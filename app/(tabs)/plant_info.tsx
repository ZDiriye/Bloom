import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { plantService } from '../../services/plantService';
import { auth } from '../../services/firebase';
import { DocumentData } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { Region } from 'react-native-maps';

// Import components
import PlantHeader from '../../components/plant_info/PlantHeader';
import PlantImageSection from '../../components/plant_info/PlantImageSection';
import PlantOverview from '../../components/plant_info/PlantOverview';
import PlantTaxonomy from '../../components/plant_info/PlantTaxonomy';
import PlantMap from '../../components/plant_info/PlantMap';
import PlantDescription from '../../components/plant_info/PlantDescription';
import ExternalLinks from '../../components/plant_info/ExternalLinks';

interface PlantInfo extends DocumentData {
  commonName?: string;
  name: string;
  defaultPhoto?: string;
  taxonomy?: any[];
  wikipediaSummary?: string;
  wikipediaUrl?: string;
}

interface Observation {
  location?: number[];
  observedOn: string;
  user?: {
    login: string;
  };
}

export default function PlantInfoScreen() {
  const { plantName } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 40,
    longitudeDelta: 40,
  });
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    if (!plantName || !auth.currentUser) return;

    const loadData = async () => {
      try {
        const result = await plantService.fetchPlantAndSave(
          plantName as string,
          (auth.currentUser as User).uid
        );
        if (result) {
          setPlantInfo(result.plantData as PlantInfo);
          setObservations(result.observations || []);
          if (result.observations?.length > 0 && result.observations[0].location) {
            setMapRegion({
              latitude: result.observations[0].location[1],
              longitude: result.observations[0].location[0],
              latitudeDelta: 20,
              longitudeDelta: 20,
            });
          }
        }
      } catch (error) {
        console.error('Load error:', error);
      } finally {
        setLoadingMap(false);
      }
    };

    loadData();
  }, [plantName]);

  if (!plantInfo) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <LinearGradient
          colors={['#2c6e49', '#4c956c']}
          style={StyleSheet.absoluteFillObject}
        />
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Identifying plant...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={['#2c6e49', '#4c956c']}
        style={StyleSheet.absoluteFillObject}
      />
      <PlantHeader
        title={plantInfo.commonName || plantInfo.name}
        onBack={() => router.back()}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <PlantImageSection
          imageUrl={plantInfo.defaultPhoto}
          scientificName={plantInfo.name}
          commonName={plantInfo.commonName}
        />
        <PlantOverview plantInfo={plantInfo} />
        <PlantTaxonomy ancestors={plantInfo.taxonomy} currentSpecies={plantInfo.name} />
        <PlantMap observations={observations} mapRegion={mapRegion} loading={loadingMap} />
        {plantInfo.wikipediaSummary && (
          <PlantDescription description={plantInfo.wikipediaSummary} />
        )}
        {plantInfo.wikipediaUrl && (
          <ExternalLinks wikipediaUrl={plantInfo.wikipediaUrl} />
        )}
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
