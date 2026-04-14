import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
// @ts-ignore — createAsyncStorage exists in v3
import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '@/constants/Config';

const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

// Guard against double-init during hot reload
let auth;
try {
  const appStorage = createAsyncStorage('humaid-auth');
  auth = initializeAuth(app, {
    // @ts-ignore — getReactNativePersistence exists at runtime
    persistence: getReactNativePersistence(appStorage),
  });
} catch {
  // Already initialized (hot reload) — fall back to getAuth
  auth = getAuth(app);
}

export { app, auth };
