import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface PlantImageSectionProps {
  imageUrl?: string;
  scientificName: string;
  commonName?: string;
}

const PlantImageSection: React.FC<PlantImageSectionProps> = ({ 
  imageUrl, 
  scientificName, 
  commonName 
}) => {
  return (
    <View style={styles.imageContainer}>
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
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
        <Text style={styles.scientificName}>{scientificName}</Text>
        <Text style={styles.commonName}>
          {commonName || 'No common name'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default PlantImageSection;