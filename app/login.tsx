import { useState } from 'react';
import { useRouter } from 'expo-router';
import { auth } from '../services/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { LoginContainer } from '@/components/auth/LoginContainer';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill all fields');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      handleAuthError(error.code);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthError = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/invalid-email':
        setError('Invalid email address');
        break;
      case 'auth/user-disabled':
        setError('This account has been disabled');
        break;
      case 'auth/user-not-found':
        setError('No account found with this email');
        break;
      case 'auth/wrong-password':
        setError('Incorrect password');
        break;
      default:
        setError('Login failed. Please try again.');
    }
  };

  return (
    <LoginContainer
      email={email}
      password={password}
      loading={loading}
      error={error}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onLogin={handleLogin}
      onRegister={() => router.push('/register')}
    />
  );
}