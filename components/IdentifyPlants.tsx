import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { SecondaryButton } from '@/components/ui/SecondaryButton';

interface IdentifyPlantsCardProps {
  onRequestCameraPermission: () => void;
  onPickImage: () => void;
}

export function IdentifyPlantsCard({
  onRequestCameraPermission,
  onPickImage,
}: IdentifyPlantsCardProps) {
  return (
    <View style={styles.card}>
      <ThemedText style={styles.title}>Identify Plants</ThemedText>

      <ThemedText style={styles.description}>
        Snap a photo to instantly identify hundreds of plant species
      </ThemedText>

      <View style={styles.illustrationContainer}>
        <Ionicons name="leaf" size={120} color="#4c956c" style={styles.leafIcon} />
      </View>

      <View style={styles.buttonContainer}>
        <PrimaryButton onPress={onRequestCameraPermission} />
        <SecondaryButton onPress={onPickImage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c6e49',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 24,
  },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginBottom: 24,
  },
  leafIcon: {
    opacity: 0.8,
  },
  buttonContainer: {
    gap: 12,
  },
});