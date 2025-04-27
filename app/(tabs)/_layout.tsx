import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 0,
          borderRadius: 0,
          height: Platform.OS === 'ios' ? 74 : 70,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          paddingBottom: Platform.OS === 'ios' ? 20 : 16,
        },
        tabBarBackground: () => (
          <BlurView
            tint="light"
            intensity={30}
            style={StyleSheet.absoluteFill}
          />
        ),
        tabBarActiveTintColor: '#2c6e49',
        tabBarInactiveTintColor: 'rgba(44, 110, 73, 0.5)',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: Platform.OS === 'ios' ? 12 : 16,
        },
        tabBarIconStyle: {
          marginTop: Platform.OS === 'ios' ? 8 : 4,
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="home" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="identification"
        options={{
          title: 'Identify',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="camera" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="plant_info"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Leaderboard',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="trophy" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="person" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="userProfileScreen"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
