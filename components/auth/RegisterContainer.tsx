import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RegisterForm } from './RegisterForm';
import PlantHeader from '@/components/plant_info/PlantHeader';

interface RegisterContainerProps {
  displayName: string;
  email: string;
  password: string;
  loading: boolean;
  error: string;
  onDisplayNameChange: (text: string) => void;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onRegister: () => void;
  onLogin: () => void;
  onBack: () => void;
}

export function RegisterContainer({
  displayName,
  email,
  password,
  loading,
  error,
  onDisplayNameChange,
  onEmailChange,
  onPasswordChange,
  onRegister,
  onLogin,
  onBack,
}: RegisterContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      
      <PlantHeader 
        title=""
        onBack={onBack}
      />

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.centerContainer}>
          <RegisterForm
            displayName={displayName}
            email={email}
            password={password}
            loading={loading}
            error={error}
            onDisplayNameChange={onDisplayNameChange}
            onEmailChange={onEmailChange}
            onPasswordChange={onPasswordChange}
            onRegister={onRegister}
            onLogin={onLogin}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 