import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ExternalLinksProps {
  wikipediaUrl: string;
}

const ExternalLinks: React.FC<ExternalLinksProps> = ({ wikipediaUrl }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>External Links</Text>
      <TouchableOpacity 
        onPress={() => Linking.openURL(wikipediaUrl)}
        style={styles.linkButton}
      >
        <Text style={styles.linkText}>
          <Ionicons name="open-outline" size={16} /> View on Wikipedia
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  linkButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
  },
  linkText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default ExternalLinks;