import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlantHeaderProps {
  title: string;
  onBack: () => void;
}

const PlantHeader: React.FC<PlantHeaderProps> = ({ title, onBack }) => {
  return (
    <View style={styles.header}>
      <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Ionicons name="arrow-forward" size={24} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginRight: 16,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

export default PlantHeader;