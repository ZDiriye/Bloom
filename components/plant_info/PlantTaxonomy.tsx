import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Ancestor {
  rank: string;
  name: string;
}

interface PlantTaxonomyProps {
  ancestors?: Ancestor[];
  currentSpecies: string;
}

const PlantTaxonomy: React.FC<PlantTaxonomyProps> = ({ ancestors = [], currentSpecies }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Taxonomic Classification</Text>
      
      <View style={styles.table}>
        {ancestors.map((ancestor) => (
          <View key={ancestor.rank} style={styles.row}>
            <Text style={styles.rank}>
              {ancestor.rank.charAt(0).toUpperCase() + ancestor.rank.slice(1)}
            </Text>
            <Text style={styles.name}>{ancestor.name}</Text>
          </View>
        ))}
        
        <View style={styles.row}>
          <Text style={styles.rank}>Species</Text>
          <Text style={[styles.name, styles.species]}>{currentSpecies}</Text>
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
  table: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  rank: {
    width: 100,
    color: 'rgba(255,255,255,0.7)',
  },
  name: {
    flex: 1,
    color: '#ffffff',
  },
  species: {
    fontStyle: 'italic',
  },
});

export default PlantTaxonomy;