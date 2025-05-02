import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PlantDescriptionProps {
  description: string;
}

const PlantDescription: React.FC<PlantDescriptionProps> = ({ description }) => {
  // removes HTML tags from the description
  const cleanDescription = description.replace(/<\/?[^>]+(>|$)/g, '');
  
  return (
    <View style={styles.section} testID="description-section">
      <Text style={styles.sectionTitle}>Description</Text>
      <Text style={styles.description}>{cleanDescription}</Text>
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
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#f0f0f0',
  },
});

export default PlantDescription;