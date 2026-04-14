import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore — getReactNativePersistence exists at runtime in firebase 12+ for React Native
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '@/constants/Config';

const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

// AsyncStorage v3 — persist auth between app restarts
const appStorage = createAsyncStorage('humaid-auth');
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(appStorage),
});

export { app, auth };
