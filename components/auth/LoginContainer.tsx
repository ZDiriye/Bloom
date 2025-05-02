import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoginForm } from './LoginForm';

interface LoginContainerProps {
  email: string;
  password: string;
  loading: boolean;
  error: string;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onLogin: () => void;
  onRegister: () => void;
}

export function LoginContainer({
  email,
  password,
  loading,
  error,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onRegister,
}: LoginContainerProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.centerContainer}>
          <LoginForm
            email={email}
            password={password}
            loading={loading}
            error={error}
            onEmailChange={onEmailChange}
            onPasswordChange={onPasswordChange}
            onLogin={onLogin}
            onRegister={onRegister}
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