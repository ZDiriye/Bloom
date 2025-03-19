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
      <Text style={styles.sectionTitle}>Taxonomic Hierarchy</Text>
      
      <View style={styles.taxonomyContainer}>
        {ancestors.map((ancestor, index) => {
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
          { marginLeft: ancestors.length * 12 }
        ]}>
          <View style={styles.taxonomyBullet} />
          <View style={styles.taxonomyTextContainer}>
            <Text style={styles.taxonomyRank}>Species</Text>
            <Text style={styles.currentSpeciesName}>{currentSpecies}</Text>
          </View>
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
});

export default PlantTaxonomy;