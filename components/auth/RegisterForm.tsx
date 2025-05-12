import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { AuthButton } from '@/components/ui/AuthButton';

interface RegisterFormProps {
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
}

export function RegisterForm({
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
}: RegisterFormProps) {
  return (
    <View style={styles.formContainer}>
      <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
      
      {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}

      <TextInput
        style={styles.input}
        placeholder="User Name"
        placeholderTextColor="#888"
        value={displayName}
        onChangeText={onDisplayNameChange}
        autoCapitalize="words"
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={onEmailChange}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={onPasswordChange}
        secureTextEntry
      />

      <AuthButton
        onPress={onRegister}
        disabled={loading}
        loading={loading}
        testID="create-account-button"
      >
        Create Account
      </AuthButton>

      <TouchableOpacity 
        style={styles.link} 
        onPress={onLogin}
        testID="login-link"
      >
        <ThemedText style={styles.linkText}>
          Already have an account? Login
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#2c6e49',
  },
  input: {
    height: 55,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  error: {
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 14,
  },
  link: {
    marginTop: 24,
    alignSelf: 'center',
  },
  linkText: {
    color: '#2c6e49',
    fontSize: 16,
    fontWeight: '500',
  },
}); 