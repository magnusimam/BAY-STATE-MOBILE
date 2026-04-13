// API base URL — points to the Cloudflare Workers backend
export const API_BASE_URL = 'https://humaid-bay-states.pages.dev';

// Firebase config (same project as web app)
export const FIREBASE_CONFIG = {
  apiKey: 'AIzaSyDv6m2vJmyDw3FMYFDKpDO8ENnCVA8E7Y0',
  authDomain: 'humaid-bay-states.firebaseapp.com',
  projectId: 'humaid-bay-states',
  storageBucket: 'humaid-bay-states.firebasestorage.app',
  messagingSenderId: '525728563081',
  appId: '1:525728563081:web:062fa1b6d6c526be276b58',
};

// Admin emails
export const ADMIN_EMAILS = ['imammagnus40@gmail.com'];

// BAY States metadata
export const BAY_STATES = [
  { code: 'borno', name: 'Borno', population: '4.25M', lgaCount: 27 },
  { code: 'adamawa', name: 'Adamawa', population: '3.79M', lgaCount: 21 },
  { code: 'yobe', name: 'Yobe', population: '2.43M', lgaCount: 17 },
] as const;
