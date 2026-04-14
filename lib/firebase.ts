import { initializeApp, getApps, getApp } from 'firebase/app';
// @ts-ignore — getReactNativePersistence exists at runtime in firebase 12+
import { getAuth, initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
// @ts-ignore — createAsyncStorage exists in v3
import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { FIREBASE_CONFIG } from '@/constants/Config';

const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();

// Guard against double-init during hot reload
let auth: Auth;
try {
  const appStorage = createAsyncStorage('humaid-auth');
  auth = initializeAuth(app, {
    persistence: (getReactNativePersistence as any)(appStorage),
  });
} catch {
  auth = getAuth(app);
}

export { app, auth };
