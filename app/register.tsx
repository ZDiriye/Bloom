import { useState } from 'react';
import { useRouter, Stack } from 'expo-router';
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { RegisterContainer } from '@/components/auth/RegisterContainer';

export default function RegisterScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!email || !password || !displayName) {
      setError('Please fill all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // 1. Create Firebase Authentication user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Create user document in Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        userid: userCredential.user.uid,
        email: email.toLowerCase().trim(),
        displayName: displayName.trim(),
        createdAt: serverTimestamp(),
        role: 'user',
        profilePic: '',
        xp: 0
      });

      // 3. Redirect to home screen
      router.push('/(tabs)/home');
    } catch (error: any) {
      handleAuthError(error.code);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        setError('Email already registered');
        break;
      case 'auth/invalid-email':
        setError('Invalid email address');
        break;
      case 'auth/weak-password':
        setError('Password is too weak');
        break;
      default:
        setError('Registration failed. Please try again.');
    }
  };

  const goToLogin = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen 
        options={{
          headerShown: false,
          animation: 'none'
        }} 
      />
      <RegisterContainer
        displayName={displayName}
        email={email}
        password={password}
        loading={loading}
        error={error}
        onDisplayNameChange={setDisplayName}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onRegister={handleRegister}
        onLogin={goToLogin}
        onBack={goToLogin}
      />
    </>
  );
}