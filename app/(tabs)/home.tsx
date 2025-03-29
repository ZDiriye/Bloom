import { View, Text, Button } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { auth } from '../../services/firebase';

export default function HomeScreen() {
  const router = useRouter();
  const user = auth.currentUser;

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
        }} 
      />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Welcome {user?.email}</Text>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </>
  );
}
