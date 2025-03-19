import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';

interface PlantGalleryProps {
  photos: Array<{
    photo: {
      medium_url: string;
    };
  }>;
}

const PlantGallery: React.FC<PlantGalleryProps> = ({ photos }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Gallery</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryScroll}>
        {photos.map(({ photo }, index) => (
          <Image
            key={index}
            source={{ uri: photo.medium_url }}
            style={styles.thumbnail}
          />
        ))}
      </ScrollView>
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
  galleryScroll: {
    marginHorizontal: -6,
  },
  thumbnail: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginHorizontal: 6,
  },
});

export default PlantGallery;