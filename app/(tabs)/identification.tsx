import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IdentifyPlantsCard } from '@/components/IdentifyPlants';
import { RecentScans } from '@/components/identification/RecentScans';
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <Text style={styles.headerText}>Identify Plants</Text>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <IdentifyPlantsCard
          onRequestCameraPermission={handleCameraPress}
          onPickImage={handlePickImagePress}
        />
        <RecentScans />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
