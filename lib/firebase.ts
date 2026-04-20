import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore — getReactNativePersistence exists at runtime in firebase 12+
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '@/constants/Config';

const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

// Guard against double-init during hot reload
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: (getReactNativePersistence as any)(AsyncStorage),
  });
} catch {
  auth = getAuth(app);
}

export { app, auth };
