import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { auth } from '../services/firebase';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    // Initialize auth
    const unsubscribe = auth.onAuthStateChanged(() => {
      setIsAuthInitialized(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loaded && isAuthInitialized) {
      SplashScreen.hideAsync();
    }
  }, [loaded, isAuthInitialized]);

  if (!loaded || !isAuthInitialized) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="CameraModal" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal',
          }} 
        />
        <Stack.Screen 
          name="ImagePickerModal" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal',
          }} 
        />
        <Stack.Screen 
          name="register" 
          options={{ 
            headerShown: false,
            animation: 'none'
          }} 
        />
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
            animation: 'none'
          }} 
        />
        <Stack.Screen 
          name="+not-found" 
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
