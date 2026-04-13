import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { FIREBASE_CONFIG } from '@/constants/Config';

const app = getApps().length === 0 ? initializeApp(FIREBASE_CONFIG) : getApp();
const auth = getAuth(app);

export { app, auth };
