// ─── DuoMath API Client ─────────────────────────────────────────────────────
// Axios instance with Firebase ID token auto-injection
// Backend: FastAPI at configured BASE_URL

import axios from 'axios';
import auth from '@react-native-firebase/auth';

// ── Config ──────────────────────────────────────────────────────────────────
// For Android emulator, use 10.0.2.2 to reach host machine localhost
// For physical device on same WiFi, use your computer's local IP (e.g. 192.168.x.x)
// For production, set your deployed backend URL
export const BASE_URL = __DEV__
  ? 'http://10.0.2.2:5000'      // Android emulator → host machine
  : 'https://your-production-url.com'; // Replace with actual production URL

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: inject Firebase ID token ───────────────────────────
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        config.headers.Authorization = `Bearer ${idToken}`;
      }
    } catch (err) {
      console.warn('[API] Could not get Firebase ID token:', err?.message);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: log errors ────────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg = error?.response?.data?.detail || error?.message || 'Unknown error';
    console.error('[API Error]', error?.config?.url, msg);
    return Promise.reject(error);
  },
);

export default apiClient;
