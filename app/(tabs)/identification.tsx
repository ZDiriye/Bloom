import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IdentifyPlantsCard } from '@/components/IdentifyPlants';
import { RecentScans } from '@/components/RecentScans';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function IdentificationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleCameraPress = () => {
    router.push('../CameraModal');
  };

  const handlePickImagePress = async () => {
    router.push('../ImagePickerModal');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom }]}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <Text style={styles.headerText}>Identify Plants</Text>
      </View>
      <IdentifyPlantsCard
        onRequestCameraPermission={handleCameraPress}
        onPickImage={handlePickImagePress}
      />
      <RecentScans />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});