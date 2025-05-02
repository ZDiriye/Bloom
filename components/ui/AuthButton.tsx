import React from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface AuthButtonProps {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  style?: any;
}

export function AuthButton({ onPress, disabled, loading, children, style }: AuthButtonProps) {
  return (
    <TouchableOpacity 
      style={[styles.button, style, disabled && styles.disabled]} 
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <ThemedText style={styles.buttonText}>{children}</ThemedText>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2c6e49',
    borderRadius: 10,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
}); 