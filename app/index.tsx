import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { auth } from '../services/firebase';
import { User } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoadingScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(
      (user: User | null) => {
        // Add delay before routing
        setTimeout(() => {
          setIsLoading(false);
          if (user) {
            router.replace('/home');
          } else {
            router.replace('/login');
          }
        }, 2000); // 2000 milliseconds = 2 seconds
      },
      (error) => {
        console.error('Auth state change error:', error);
        setError('Failed to check authentication status');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <StatusBar style="auto" />
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.retryText}>Please try again later</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#2c6e49', '#4c956c']}
        style={StyleSheet.absoluteFillObject}
      />
      <StatusBar style="auto" />

      {/* Centered & Bigger Logo */}
      <Image
        source={require('../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      
      {/* Loading Wheel */}
      <ActivityIndicator 
        size="large" 
        color="#ffffff" 
        style={styles.spinner} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  spinner: {
    marginVertical: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff0000',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    fontSize: 14,
    color: '#666666',
  },
});
