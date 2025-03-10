
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface SecondaryButtonProps {
  onPress: () => void;
}

export function SecondaryButton({ onPress }: SecondaryButtonProps) {
  return (
    <TouchableOpacity style={styles.secondaryButton} onPress={onPress}>
      <Ionicons name="image" size={24} color="#2c6e49" />
      <ThemedText style={styles.secondaryButtonText}>Choose from Library</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  secondaryButton: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#2c6e49',
    fontSize: 16,
    fontWeight: '600',
  },
});
