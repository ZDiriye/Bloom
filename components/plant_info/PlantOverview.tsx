import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlantInfo {
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

interface PlantOverviewProps {
  plantInfo: PlantInfo;
}

const PlantOverview: React.FC<PlantOverviewProps> = ({ plantInfo }) => {
  const getPlantTraits = () => ({
    isExtinct: plantInfo?.extinct ? 'Extinct' : 'Not Extinct',
    observations: plantInfo?.observationsCount?.toLocaleString() || '0',
    conservationStatus: plantInfo?.conservationStatus || 'Not Evaluated',
    isEndemic: plantInfo?.endemic ? 'Endemic' : 'Not Endemic',
    firstObserved: plantInfo?.firstObservation?.substring(0, 4) || 'Unknown'
  });

  // Function to get conservation status color
  const getConservationStatusColor = (status: string) => {
    if (!status) return '#6c757d'; // Default gray for no status
    
    const normalizedStatus = status.toUpperCase().trim();
    
    // Handle full text statuses first
    if (normalizedStatus === 'LEAST CONCERN') return '#4caf50';
    if (normalizedStatus === 'NEAR THREATENED') return '#8bc34a';
    if (normalizedStatus === 'VULNERABLE') return '#ffc107';
    if (normalizedStatus === 'ENDANGERED') return '#ff9800';
    if (normalizedStatus === 'CRITICALLY ENDANGERED') return '#f44336';
    if (normalizedStatus === 'EXTINCT IN THE WILD') return '#9c27b0';
    if (normalizedStatus === 'EXTINCT') return '#000000';
    if (normalizedStatus === 'DATA DEFICIENT') return '#607d8b';
    if (normalizedStatus === 'NOT EVALUATED') return '#6c757d';
    
    // Handle abbreviated statuses
    switch(normalizedStatus) {
      case 'EX': return '#000000'; // Extinct - Black
      case 'EW': return '#9c27b0'; // Extinct in Wild - Purple
      case 'CR': return '#f44336'; // Critically Endangered - Red
      case 'EN': return '#ff9800'; // Endangered - Orange
      case 'VU': return '#ffc107'; // Vulnerable - Yellow
      case 'NT': return '#8bc34a'; // Near Threatened - Light Green
      case 'LC': return '#4caf50'; // Least Concern - Green
      case 'DD': return '#607d8b'; // Data Deficient - Blue Gray
      case 'NE': return '#6c757d'; // Not Evaluated - Gray
      default: return '#6c757d'; // Unknown - Gray
    }
  };

  // Function to get full conservation status name
  const getConservationStatusName = (status: string) => {
    if (!status) return 'Not Evaluated';
    
    const normalizedStatus = status.toUpperCase().trim();
    
    // If it's already a full name, just capitalize first letters
    if (normalizedStatus.includes(' ')) {
      return status.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Handle abbreviated statuses
    switch(normalizedStatus) {
      case 'EX': return 'Extinct';
      case 'EW': return 'Extinct in the Wild';
      case 'CR': return 'Critically Endangered';
      case 'EN': return 'Endangered';
      case 'VU': return 'Vulnerable';
      case 'NT': return 'Near Threatened';
      case 'LC': return 'Least Concern';
      case 'DD': return 'Data Deficient';
      case 'NE': return 'Not Evaluated';
      default: return normalizedStatus; // Return normalized status if not recognized
    }
  };

  const traits = getPlantTraits();

  return (
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
          <Ionicons name="shield" size={22} color="#ffffff" />
        </View>
        <View style={styles.factContent}>
          <Text style={styles.factTitle}>Conservation Status</Text>
          <Text style={styles.factValue}>
            {getConservationStatusName(traits.conservationStatus)}
          </Text>
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
});

export default PlantOverview;