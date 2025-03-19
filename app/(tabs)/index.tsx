import { useEffect } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoadingScreen() {
  const router = useRouter();

  useEffect(() => {
    // Simulated loading and auth check
    setTimeout(() => {
      // Always navigate to login for now
      // Replace with actual logic later
      router.replace('/login');
      
      // If you want to test home screen directly:
      // router.replace('/home');
    }, 2000);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Image
        //source={require('./assets/logo.png')}
        style={{ width: 100, height: 100, marginBottom: 20 }}
      />
      <ActivityIndicator size="large" />
      <Text>Loading...</Text>
    </View>
  );
}