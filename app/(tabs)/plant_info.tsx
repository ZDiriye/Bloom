import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image, ScrollView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { fetchPlantData } from '../../api/inaturalistApi';

export default function PlantInfoScreen() {
  const { plantName } = useLocalSearchParams();
  const router = useRouter();
  const [plantInfo, setPlantInfo] = useState<any>(null);

  useEffect(() => {
    if (!plantName) return;
    
    const loadData = async () => {
      try {
        const data = await fetchPlantData(plantName);
        setPlantInfo(data?.results?.[0] || null);
      } catch (error) {
        console.error('Fetch error:', error);
      }
    };
    loadData();
  }, [plantName]);

  // Get detailed taxonomic information
  const getTaxonomicDetails = () => {
    const ranks = ['kingdom', 'phylum', 'class', 'order', 'family', 'genus'];
    return ranks.map(rank => {
      const ancestor = plantInfo?.ancestors?.find((a: any) => a.rank === rank) || {};
      return {
        rank,
        name: ancestor.name,
        commonName: ancestor.preferred_common_name,
        rankLevel: ancestor.rank_level
      };
    });
  };

  // Enhanced traits extraction
  const getPlantTraits = () => ({
    observations: plantInfo?.observations_count?.toLocaleString() || '0',
    listedOn: plantInfo?.listed_taxa_count?.toLocaleString() || '0',
    taxonSchemes: plantInfo?.taxon_schemes_count?.toLocaleString() || '0',
    taxonChanges: plantInfo?.taxon_changes_count?.toLocaleString() || '0',
    isExtinct: plantInfo?.extinct ? 'Extinct' : 'Extant',
    visionIdentified: plantInfo?.vision ? 'Yes' : 'No',
    conservationStatus: plantInfo?.conservation_statuses?.[0]?.status || 'Not evaluated',
    conservationAuthority: plantInfo?.conservation_statuses?.[0]?.authority || 'N/A',
    conservationDetails: plantInfo?.conservation_statuses?.[0]?.status_text || 'No conservation data',
    rankLevel: `${Math.round((plantInfo?.rank_level || 0) * 100)}% match`,
    nativeStatus: plantInfo?.establishment_means || 'Unknown',
    firstAppeared: plantInfo?.first_appearance_events?.[0]?.created_at?.substring(0,4) || 'Unknown'
  });

  if (!plantInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Identifying plant...</Text>
      </SafeAreaView>
    );
  }

  const traits = getPlantTraits();
  const taxonomicDetails = getTaxonomicDetails();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Image Gallery */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGallery}>
          {plantInfo.taxon_photos?.map((photo: any, index: number) => (
            <Image
              key={index}
              source={{ uri: photo.photo.medium_url }}
              style={styles.galleryImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>

        {/* Names Section */}
        <View style={styles.nameContainer}>
          <Text style={styles.scientificName}>{plantInfo.name}</Text>
          <Text style={styles.commonName}>
            {plantInfo.preferred_common_name || 'No common name'}
          </Text>
          <Text style={styles.nativeStatus}>
            {traits.nativeStatus.replace(/\b\w/g, l => l.toUpperCase())} Species
          </Text>
        </View>

        {/* Enhanced Quick Facts Grid */}
        <View style={styles.factsGrid}>
          {[
            { 
              icon: 'eye', 
              label: `${traits.observations}\nObservations`,
              color: '#4CAF50',
              meta: 'Citizen Science Data'
            },
            { 
              icon: 'shield', 
              label: `${traits.conservationStatus}\n(${traits.conservationAuthority})`,
              color: '#FF9800',
              meta: 'Conservation Status'
            },
            { 
              icon: 'leaf', 
              label: traits.isExtinct,
              color: traits.isExtinct === 'Extinct' ? '#F44336' : '#8BC34A',
              meta: 'Extinction Status'
            },
            { 
              icon: 'camera', 
              label: `Vision ID: ${traits.visionIdentified}`,
              color: '#3F51B5',
              meta: 'Computer Identification'
            },
            { 
              icon: 'library', 
              label: `${traits.listedOn}\nConservation Lists`,
              color: '#009688',
              meta: 'Legal Protection'
            },
            { 
              icon: 'pulse', 
              label: `First Seen: ${traits.firstAppeared}`,
              color: '#9C27B0',
              meta: 'Historical Data'
            },
          ].map((fact, index) => (
            <View key={index} style={[styles.factCard, { borderLeftColor: fact.color }]}>
              <Ionicons name={fact.icon as any} size={22} color={fact.color} />
              <View>
                <Text style={styles.factText}>{fact.label}</Text>
                <Text style={styles.factMeta}>{fact.meta}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Detailed Taxonomy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Taxonomic Classification</Text>
          {taxonomicDetails.map((taxon, index) => (
            <View key={index} style={styles.taxonRow}>
              <Text style={styles.taxonRank}>{taxon.rank.toUpperCase()}</Text>
              <View style={styles.taxonNames}>
                <Text style={styles.taxonScientific}>{taxon.name || 'Unknown'}</Text>
                {taxon.commonName && (
                  <Text style={styles.taxonCommon}>({taxon.commonName})</Text>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Enhanced Conservation Status */}
        {plantInfo.conservation_statuses?.length > 0 && (
          <View style={[styles.section, { borderLeftWidth: 4, borderLeftColor: '#FF9800' }]}>
            <Text style={styles.sectionTitle}>Conservation Details</Text>
            {plantInfo.conservation_statuses.map((status: any, index: number) => (
              <View key={index} style={styles.conservationItem}>
                <Text style={styles.conservationAuthority}>{status.authority}</Text>
                <Text style={styles.conservationStatus}>{status.status}</Text>
                <Text style={styles.conservationText}>{status.status_text}</Text>
                {status.geoprivacy && (
                  <Text style={styles.conservationGeo}>Geoprivacy: {status.geoprivacy}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Description with Expand */}
        {plantInfo.wikipedia_summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Species Overview</Text>
            <Text style={styles.description}>
              {plantInfo.wikipedia_summary.replace(/<\/?[^>]+(>|$)/g, '')}
            </Text>
            {plantInfo.wikipedia_url && (
              <TouchableOpacity 
                style={styles.wikipediaLink}
                onPress={() => Linking.openURL(plantInfo.wikipedia_url)}
              >
                <Ionicons name="open-outline" size={16} color="#3F51B5" />
                <Text style={styles.wikipediaText}>Read full Wikipedia article</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  content: {
    padding: 20,
  },
  imageGallery: {
    marginBottom: 15,
  },
  galleryImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  nameContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  scientificName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2E7D32',
    textAlign: 'center',
    marginBottom: 4,
  },
  commonName: {
    fontSize: 20,
    color: '#4CAF50',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  nativeStatus: {
    fontSize: 14,
    color: '#757575',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  factCard: {
    flex: 1,
    minWidth: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    borderLeftWidth: 4,
  },
  factText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  factMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 15,
  },
  taxonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taxonRank: {
    width: '30%',
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  taxonNames: {
    width: '68%',
  },
  taxonScientific: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  taxonCommon: {
    fontSize: 13,
    color: '#757575',
    fontStyle: 'italic',
  },
  conservationItem: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  conservationAuthority: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF9800',
  },
  conservationStatus: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginVertical: 4,
  },
  conservationText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  conservationGeo: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 12,
  },
  wikipediaLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  wikipediaText: {
    color: '#3F51B5',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
  },
});