import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';

interface PrimaryButtonProps {
  onPress: () => void;
}

export function PrimaryButton({ onPress }: PrimaryButtonProps) {
  return (
    <TouchableOpacity style={styles.primaryButton} onPress={onPress}>
      <Ionicons name="camera" size={24} color="white" />
      <ThemedText style={styles.buttonText}>Take Photo</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  primaryButton: {
    backgroundColor: '#2c6e49',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});