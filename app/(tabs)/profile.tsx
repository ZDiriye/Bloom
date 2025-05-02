import { View, StyleSheet, ScrollView, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import { auth, db } from '../../services/firebase';
import { signOut, updateProfile, updatePassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { verifyBeforeUpdateEmail } from 'firebase/auth';

interface UserData {
  xp: number;
  createdAt: any;
  displayName: string;
  email: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [user, setUser] = useState(auth.currentUser);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [newPassword, setNewPassword] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async currentUser => {
      setIsLoading(true);
      setUser(currentUser);
      if (currentUser) {
        try {
          const snap = await getDoc(doc(db, 'users', currentUser.uid));
          if (snap.exists()) {
            const data = snap.data() as UserData;
            setUserData(data);
            setDisplayName(data.displayName || '');
            setEmail(data.email || '');
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          Alert.alert('Error', 'Failed to load profile data');
        }
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleUpdateProfile = async () => {
    if (!user) return;
  
    try {
      const updates: Partial<UserData> = {};
      if (displayName !== userData?.displayName) updates.displayName = displayName;
      if (email !== userData?.email)         updates.email       = email;
  
      // save to Firestore
      if (Object.keys(updates).length) {
        await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
      }
  
      // if email changed, send verification link and stop
      if (email !== user.email) {
        await verifyBeforeUpdateEmail(user, email);
        Alert.alert(
          'Verify e‑mail',
          'Check the inbox of the new address and tap the link.'
        );
        setIsEditing(false);
        return;
      }
  
      // update displayName in Auth if needed
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }
  
      // update local state and close editor
      setUserData(prev => prev ? { ...prev, ...updates } : null);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handlePasswordChange = async () => {
    if (!user) return;
    if (!newPassword || newPassword.length < 6) {
      Alert.alert('Error', 'Please enter a valid password');
      return;
    }
    try {
      await updatePassword(user, newPassword);
      setNewPassword('');
      setIsChangingPassword(false);
      Alert.alert('Success', 'Password updated successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#2c6e49', '#4c956c']} style={StyleSheet.absoluteFillObject} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={80} color="#fff" />
          </View>
          <View style={styles.infoContainer}>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userData?.xp || 0}</Text>
                <Text style={styles.statLabel}>XP</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {userData?.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Member Since</Text>
              </View>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Display Name</Text>
              {isEditing ? (
                <TextInput 
                  style={styles.input} 
                  value={displayName} 
                  onChangeText={setDisplayName} 
                  placeholder="Enter display name" 
                />
              ) : (
                <Text style={styles.text}>{displayName || 'Not set'}</Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.text}>{email}</Text>
            </View>
            {isChangingPassword && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput 
                  style={styles.input} 
                  value={newPassword} 
                  onChangeText={setNewPassword} 
                  placeholder="Enter new password" 
                  secureTextEntry 
                />
              </View>
            )}
            <View style={styles.buttonContainer}>
              {isEditing ? (
                <>
                  <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleUpdateProfile}>
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => setIsEditing(false)}>
                    <Text style={styles.buttonText}>Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={[styles.button, styles.editButton]} onPress={() => setIsEditing(true)}>
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
              )}
              {!isEditing && (
                <TouchableOpacity style={[styles.button, styles.passwordButton]} onPress={() => setIsChangingPassword(!isChangingPassword)}>
                  <Text style={styles.buttonText}>Change Password</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
                <Text style={styles.buttonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 16,
  },
  profileSection: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  infoContainer: {
    gap: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
  },
  text: {
    fontSize: 16,
    color: '#fff',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButton: { backgroundColor: '#4c956c' },
  saveButton: { backgroundColor: '#2c6e49' },
  cancelButton: { backgroundColor: '#666' },
  passwordButton: { backgroundColor: '#4c956c' },
  logoutButton: { backgroundColor: '#dc3545' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
});
