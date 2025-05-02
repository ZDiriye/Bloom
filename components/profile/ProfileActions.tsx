import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';

interface ActionButton {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

interface ProfileActionsProps {
  actions: ActionButton[];
}

export function ProfileActions({ actions }: ProfileActionsProps) {
  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.actionButton}
          onPress={action.onPress}
        >
          <Ionicons name={action.icon} size={24} color="#2c6e49" />
          <ThemedText style={styles.actionLabel}>{action.label}</ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginBottom: 10,
  },
  actionLabel: {
    marginLeft: 15,
    fontSize: 16,
  },
}); 