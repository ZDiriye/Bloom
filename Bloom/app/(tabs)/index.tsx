import { StyleSheet, TouchableOpacity, View, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <ThemedView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#2c6e49', '#4c956c']}
        style={StyleSheet.absoluteFillObject}
      />
      
      {/* Main Content */}
      <View style={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom }]}>
        {/* Main Card */}
        <View style={styles.card}>
          <ThemedText style={styles.title}>Identify Plants</ThemedText>
          
          <ThemedText style={styles.description}>
            Snap a photo to instantly identify hundreds of plant species
          </ThemedText>
          
          <View style={styles.illustrationContainer}>
            <Ionicons name="leaf" size={120} color="#4c956c" style={styles.leafIcon} />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton}>
              <Ionicons name="camera" size={24} color="white" />
              <ThemedText style={styles.buttonText}>Take Photo</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.secondaryButton}>
              <Ionicons name="image" size={24} color="#2c6e49" />
              <ThemedText style={styles.secondaryButtonText}>Choose from Library</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Recent Scans Section */}
        <View style={styles.recentScansContainer}>
          <ThemedText style={styles.recentScansTitle}>Recent Scans</ThemedText>
          
          <View style={styles.emptyStateContainer}>
            <Ionicons name="leaf-outline" size={48} color="#4c956c" style={styles.emptyStateIcon} />
            <ThemedText style={styles.emptyStateText}>
              Your identified plants will appear here
            </ThemedText>
          </View>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
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
  recentScansContainer: {
    flex: 1,
  },
  recentScansTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  emptyStateContainer: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyStateIcon: {
    marginBottom: 16,
    opacity: 0.7,
  },
  emptyStateText: {
    color: 'white',
    opacity: 0.7,
    fontSize: 16,
    textAlign: 'center',
  }
});