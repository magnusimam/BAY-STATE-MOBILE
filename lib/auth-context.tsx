import React, { createContext, useContext, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Alert } from 'react-native';
import { GOOGLE_WEB_CLIENT_ID, isGoogleSignInConfigured } from '@/constants/Config';

// Detect if we're in Expo Go (no native modules available)
const isExpoGo = Constants.executionEnvironment === 'storeClient';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Configure Google Sign-In only outside Expo Go (native build required)
  useEffect(() => {
    if (isExpoGo) return;
    if (!isGoogleSignInConfigured) {
      console.warn('Google Sign-In not configured: set GOOGLE_WEB_CLIENT_ID in constants/Config.ts');
      return;
    }
    (async () => {
      try {
        const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
        GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
      } catch (err) {
        console.warn('Google Sign-In setup failed:', err);
      }
    })();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      const message = getErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    try {
      setError(null);
      setLoading(true);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && result.user) {
        await updateProfile(result.user, { displayName });
      }
    } catch (err: any) {
      const message = getErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      if (!isExpoGo) {
        try {
          const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
          await GoogleSignin.signOut();
        } catch {}
      }
      await firebaseSignOut(auth);
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    }
  };

  const signInWithGoogle = async () => {
    if (isExpoGo) {
      Alert.alert(
        'Google Sign-In Unavailable',
        'Google sign-in requires a production build. Please use email/password in Expo Go, or build the app with EAS to enable Google sign-in.',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!isGoogleSignInConfigured) {
      Alert.alert(
        'Google Sign-In Not Configured',
        'The Web Client ID has not been set. Please use email/password, or contact the app administrator.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const mod = await import('@react-native-google-signin/google-signin');
      const { GoogleSignin, isSuccessResponse } = mod;

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (isSuccessResponse(response)) {
        const { idToken } = response.data;
        if (!idToken) throw new Error('No ID token returned from Google');
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      }
    } catch (err: any) {
      if (err.code === 'SIGN_IN_CANCELLED' || err.code === '12501') {
        setLoading(false);
        return;
      }
      setError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Password Reset', 'A password reset email has been sent to your inbox.');
    } catch (err: any) {
      const message = getErrorMessage(err.code);
      setError(message);
      throw new Error(message);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user, loading, error,
        signIn, signUp, signOut, signInWithGoogle, resetPassword, clearError,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function getErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}
