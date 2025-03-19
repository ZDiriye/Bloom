import { View, StyleSheet, ScrollView, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { fetchPlantData, fetchPlantObservations } from '../../api/inaturalistApi';

// Import components
import PlantHeader from '../../components//plant_info/PlantHeader';
import PlantImageSection from '../../components//plant_info//PlantImageSection';
import PlantOverview from '../../components//plant_info/PlantOverview';
import PlantGallery from '../../components//plant_info/PlantGallery';
import PlantTaxonomy from '../../components//plant_info/PlantTaxonomy';
import PlantMap from '../../components//plant_info/PlantMap';
import PlantDescription from '../../components//plant_info/PlantDescription';
import ExternalLinks from '../../components/plant_info/ExternalLinks';

export default function PlantInfoScreen() {
  const { plantName } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [plantInfo, setPlantInfo] = useState<any>(null);
  const [observations, setObservations] = useState<any[]>([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 40,
    longitudeDelta: 40,
  });
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    if (!plantName) return;
    
    const loadData = async () => {
      try {
        const plantData = await fetchPlantData(plantName);
        const detailedPlant = plantData?.results?.[0];
        setPlantInfo(detailedPlant);

        if (detailedPlant?.id) {
          const obsData = await fetchPlantObservations(detailedPlant.id);
          setObservations(obsData?.results || []);
          
          if (obsData?.results?.length > 0) {
            const firstObs = obsData.results[0];
            if (firstObs.geojson?.coordinates) {
              setMapRegion({
                latitude: firstObs.geojson.coordinates[1],
                longitude: firstObs.geojson.coordinates[0],
                latitudeDelta: 20,
                longitudeDelta: 20,
              });
            }
          }
          setLoadingMap(false);
        }
      } catch (error) {
        console.error('Load error:', error);
        setLoadingMap(false);
      }
    };
    loadData();
  }, [plantName]);

  if (!plantInfo) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Identifying plant...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      
      <PlantHeader 
        title={plantInfo.preferred_common_name || plantInfo.name}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <PlantImageSection 
          imageUrl={plantInfo.default_photo?.medium_url}
          scientificName={plantInfo.name}
          commonName={plantInfo.preferred_common_name}
        />

        <PlantOverview plantInfo={plantInfo} />

        {plantInfo.taxon_photos?.length > 0 && (
          <PlantGallery photos={plantInfo.taxon_photos} />
        )}

        <PlantTaxonomy 
          ancestors={plantInfo.ancestors}
          currentSpecies={plantInfo.name}
        />

        <PlantMap 
          observations={observations}
          mapRegion={mapRegion}
          loading={loadingMap}
        />

        {plantInfo.wikipedia_summary && (
          <PlantDescription description={plantInfo.wikipedia_summary} />
        )}

        {plantInfo.wikipedia_url && (
          <ExternalLinks wikipediaUrl={plantInfo.wikipedia_url} />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 16,
  },
});