import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlantOverviewProps {
  plantInfo: any;
}

const PlantOverview: React.FC<PlantOverviewProps> = ({ plantInfo }) => {
  const getPlantTraits = () => ({
    isExtinct: plantInfo?.extinct ? 'Extinct' : 'Not Extinct',
    observations: plantInfo?.observationsCount?.toLocaleString() || '0',
    conservationStatus: plantInfo?.conservationStatuses?.[0]?.status || 'Not Assessed',
    authority: plantInfo?.conservationStatuses?.[0]?.authority || 'N/A',
    isEndemic: plantInfo?.endemic ? 'Endemic' : 'Not Endemic',
    nativeStatus: plantInfo?.nativeStatus || 'Unknown',
    firstObserved: plantInfo?.firstObservation?.substring(0, 4) || 'Unknown'
  });

  // Function to get conservation status color
  const getConservationStatusColor = (status: string) => {
    if (!status || status === 'Not Assessed') return '#ffffff';
    
    switch(status) {
      case 'LC': return '#4caf50'; // Least Concern - Green
      case 'NT': return '#8bc34a'; // Near Threatened - Green
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