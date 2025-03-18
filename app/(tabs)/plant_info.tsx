import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { fetchPlantData, fetchPlantObservations } from '../../api/inaturalistApi';
import MapView, { Marker } from 'react-native-maps';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

  const getPlantTraits = () => ({
    isExtinct: plantInfo?.extinct ? 'Extinct' : 'Not Extinct',
    observations: plantInfo?.observations_count?.toLocaleString() || '0',
    conservationStatus: plantInfo?.conservation_statuses?.[0]?.status || 'Not Assessed',
    authority: plantInfo?.conservation_statuses?.[0]?.authority || 'N/A',
    isEndemic: plantInfo?.endemic ? 'Endemic' : 'Not Endemic',
    nativeStatus: plantInfo?.native_status || 'Unknown',
    firstObserved: plantInfo?.first_observation?.substring(0, 4) || 'Unknown'
  });

  // Function to get conservation status color
  const getConservationStatusColor = (status: string) => {
    if (!status || status === 'Not Assessed') return '#ffffff';
    
    switch(status) {
      case 'LC': return '#4caf50'; // Least Concern - Green
      case 'NT': return '#8bc34a'; // Near Threatened - Light Green
      case 'VU': return '#ffc107'; // Vulnerable - Yellow
      case 'EN': return '#ff9800'; // Endangered - Orange
      case 'CR': return '#f44336'; // Critically Endangered - Red
      case 'EW': return '#9c27b0'; // Extinct in Wild - Purple
      case 'EX': return '#000000'; // Extinct - Black
      default: return '#ffffff';
    }
  };

  // Function to get full conservation status name
  const getConservationStatusName = (status: string) => {
    if (!status || status === 'Not Assessed') return 'Not Assessed';
    
    switch(status) {
      case 'LC': return 'Least Concern';
      case 'NT': return 'Near Threatened';
      case 'VU': return 'Vulnerable';
      case 'EN': return 'Endangered';
      case 'CR': return 'Critically Endangered';
      case 'EW': return 'Extinct in Wild';
      case 'EX': return 'Extinct';
      default: return status;
    }
  };

  if (!plantInfo) {
    return (
      <View style={[styles.loadingContainer, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <ActivityIndicator size="large" color="#ffffff" />
        <Text style={styles.loadingText}>Identifying plant...</Text>
      </View>
    );
  }

  const traits = getPlantTraits();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.headerTitle}>{plantInfo.preferred_common_name || plantInfo.name}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Main Image with fade overlay */}
        <View style={styles.imageContainer}>
          {plantInfo.default_photo?.medium_url ? (
            <Image
              source={{ uri: plantInfo.default_photo.medium_url }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons name="leaf-outline" size={60} color="#ffffff" />
            </View>
          )}
          <LinearGradient 
            colors={['transparent', 'rgba(0,0,0,0.7)']} 
            style={styles.imageOverlay}
          />
          <View style={styles.nameOverlay}>
            <Text style={styles.scientificName}>{plantInfo.name}</Text>
            <Text style={styles.commonName}>
              {plantInfo.preferred_common_name || 'No common name'}
            </Text>
          </View>
        </View>

        {/* Enhanced Quick Facts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plant Overview</Text>
          
          <View style={styles.factRow}>
            <View style={styles.factIconContainer}>
              <Ionicons name="eye" size={22} color="#ffffff" />
            </View>
            <View style={styles.factContent}>
              <Text style={styles.factTitle}>Observations</Text>
              <Text style={styles.factValue}>{traits.observations}</Text>
              <Text style={styles.factNote}>
                First recorded: {traits.firstObserved !== 'Unknown' ? traits.firstObserved : 'No data'}
              </Text>
            </View>
          </View>

          <View style={styles.factRow}>
            <View style={[styles.factIconContainer, 
                    { backgroundColor: getConservationStatusColor(traits.conservationStatus) }]}>
              <Ionicons name="shield" size={22} color={traits.conservationStatus === 'EX' ? '#ffffff' : '#2c6e49'} />
            </View>
            <View style={styles.factContent}>
              <Text style={styles.factTitle}>Conservation Status</Text>
              <Text style={styles.factValue}>
                {getConservationStatusName(traits.conservationStatus)}
                {traits.conservationStatus !== 'Not Assessed' && ` (${traits.conservationStatus})`}
              </Text>
              <Text style={styles.factNote}>Authority: {traits.authority}</Text>
            </View>
          </View>

          <View style={styles.factRow}>
            <View style={[styles.factIconContainer, 
                     { backgroundColor: traits.isExtinct === 'Extinct' ? '#f44336' : '#4caf50' }]}>
              <Ionicons name="leaf" size={22} color="#ffffff" />
            </View>
            <View style={styles.factContent}>
              <Text style={styles.factTitle}>Status</Text>
              <Text style={styles.factValue}>{traits.isExtinct}</Text>
              <Text style={styles.factNote}>
                {traits.isEndemic === 'Endemic' ? 'Endemic species' : 'Non-endemic species'}
              </Text>
            </View>
          </View>

          <View style={styles.factRow}>
            <View style={styles.factIconContainer}>
              <Ionicons name="globe-outline" size={22} color="#ffffff" />
            </View>
            <View style={styles.factContent}>
              <Text style={styles.factTitle}>Native Status</Text>
              <Text style={styles.factValue}>{traits.nativeStatus !== 'Unknown' ? traits.nativeStatus : 'No data available'}</Text>
            </View>
          </View>
        </View>

        {/* Additional Photos */}
        {plantInfo.taxon_photos?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
              {plantInfo.taxon_photos.map(({ photo }: any, index: number) => (
                <Image
                  key={index}
                  source={{ uri: photo.medium_url }}
                  style={styles.thumbnail}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Enhanced Taxonomic Hierarchy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taxonomic Hierarchy</Text>
          
          <View style={styles.taxonomyContainer}>
            {plantInfo.ancestors?.map((ancestor: any, index: number) => {
              // Determine depth level for indentation
              const depth = index;
              return (
                <View key={ancestor.rank} style={[
                  styles.taxonomyItem,
                  { marginLeft: depth * 12 }
                ]}>
                  <View style={[
                    styles.taxonomyBullet, 
                    { backgroundColor: `rgba(255,255,255,${0.4 + (index * 0.07)})` }
                  ]} />
                  <View style={styles.taxonomyTextContainer}>
                    <Text style={styles.taxonomyRank}>
                      {ancestor.rank.charAt(0).toUpperCase() + ancestor.rank.slice(1)}
                    </Text>
                    <Text style={styles.taxonomyName}>{ancestor.name}</Text>
                  </View>
                </View>
              );
            })}
            
            {/* Current species with special highlight */}
            <View style={[
              styles.taxonomyItem, 
              styles.currentSpecies,
              { marginLeft: (plantInfo.ancestors?.length || 0) * 12 }
            ]}>
              <View style={styles.taxonomyBullet} />
              <View style={styles.taxonomyTextContainer}>
                <Text style={styles.taxonomyRank}>Species</Text>
                <Text style={styles.currentSpeciesName}>{plantInfo.name}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observation Locations</Text>
          {loadingMap ? (
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
                        latitude: obs.geojson.coordinates[1],
                        longitude: obs.geojson.coordinates[0],
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

        {plantInfo.wikipedia_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {plantInfo.wikipedia_summary.replace(/<\/?[^>]+(>|$)/g, '')}
            </Text>
          </View>
        )}

        {plantInfo.wikipedia_url && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>External Links</Text>
            <TouchableOpacity 
              onPress={() => Linking.openURL(plantInfo.wikipedia_url)}
              style={styles.linkButton}
            >
              <Text style={styles.linkText}>
                <Ionicons name="open-outline" size={16} /> View on Wikipedia
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginLeft: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  imageContainer: {
    height: 260,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '50%',
  },
  nameOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    padding: 16,
  },
  scientificName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  commonName: {
    fontSize: 16,
    color: '#ffffff',
    fontStyle: 'italic',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
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
  // Enhanced Facts Section Styles
  factRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  factIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  factContent: {
    flex: 1,
  },
  factTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 2,
  },
  factValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  factNote: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  // Enhanced Taxonomy Styles
  taxonomyContainer: {
    paddingLeft: 8,
  },
  taxonomyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  taxonomyBullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginRight: 12,
  },
  taxonomyTextContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 8,
  },
  taxonomyRank: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
  },
  taxonomyName: {
    fontSize: 15,
    color: '#ffffff',
  },
  currentSpecies: {
    marginTop: 8,
  },
  currentSpeciesName: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  galleryScroll: {
    marginHorizontal: -6,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginHorizontal: 6,
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
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#f0f0f0',
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    marginTop: 16,
  },
  linkButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  linkText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});