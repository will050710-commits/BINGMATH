import apiClient from './client';
import auth from '@react-native-firebase/auth';

/**
 * Sync Firebase user with DuoMath backend after login/signup.
 * Call this right after Firebase Auth success.
 */
export async function syncUser(profileData = {}) {
  const response = await apiClient.post('/api/firebase-sync', profileData);
  return response.data;
}

/**
 * Get current user profile + test results + game results.
 */
export async function getMe() {
  const response = await apiClient.get('/api/me');
  return response.data;
}

/**
 * Update user profile fields.
 * @param {object} fields - Any subset of { username, phone, school, grade, avatar_url }
 */
export async function updateProfile(fields) {
  const response = await apiClient.patch('/api/me', fields);
  return response.data;
}

/**
 * Sign in with email and password via Firebase.
 */
export async function signInWithEmail(email, password) {
  const credential = await auth().signInWithEmailAndPassword(email, password);
  // Sync with backend
  await syncUser({ email: credential.user.email });
  return credential.user;
}

/**
 * Register a new user with Firebase + backend sync.
 */
export async function registerWithEmail(email, password, profileData = {}) {
  const credential = await auth().createUserWithEmailAndPassword(email, password);
  await syncUser({ email: credential.user.email, ...profileData });
  return credential.user;
}

/**
 * Sign out.
 */
export async function signOut() {
  await auth().signOut();
}

/**
 * Get competitive stats for current user.
 */
export async function getCompetitiveStats() {
  const response = await apiClient.get('/api/competitive-stats');
  return response.data;
}
