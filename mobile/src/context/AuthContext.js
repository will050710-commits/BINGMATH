import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMe, syncUser } from '../api/auth';

const AuthContext = createContext(null);

const GUEST_MODE_KEY = 'bingmath_guest_mode';
const CACHED_PROFILE_KEY = 'bingmath_cached_profile';

/**
 * AuthProvider — V1.0 Official with 0ms offline cache hydration & Guest Mode
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(GUEST_MODE_KEY)
      .then((val) => {
        if (val === 'true') setIsGuest(true);
      })
      .catch(() => {});

    AsyncStorage.getItem(CACHED_PROFILE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setProfile(JSON.parse(raw));
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false); // Unblock UI immediately using cached profile

      if (firebaseUser) {
        setIsGuest(false);
        AsyncStorage.removeItem(GUEST_MODE_KEY).catch(() => {});
        try {
          let data = await getMe();
          let resolvedUser = data?.user;
          if (!resolvedUser) {
            const syncRes = await syncUser({
              firebase_uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              username:
                firebaseUser.displayName ||
                (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Scholar'),
              avatar_url: firebaseUser.photoURL || '',
            });
            resolvedUser = syncRes?.user;
            if (!resolvedUser) {
              const retry = await getMe();
              resolvedUser = retry?.user;
            }
          }
          if (resolvedUser) {
            setProfile(resolvedUser);
            AsyncStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(resolvedUser)).catch(() => {});
          }
        } catch (err) {
          console.warn('[Auth] Backend sync warning:', err?.message);
        }
      } else {
        setProfile(null);
      }
    });
    return unsubscribe;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user) return null;
    try {
      const data = await getMe();
      if (data?.user) {
        setProfile(data.user);
        AsyncStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(data.user)).catch(() => {});
        return data.user;
      }
    } catch (e) {
      console.warn('[Auth] Could not refresh profile:', e?.message);
    }
    return null;
  }, [user]);

  const enterGuestMode = useCallback(async () => {
    await AsyncStorage.setItem(GUEST_MODE_KEY, 'true');
    await AsyncStorage.setItem('onboarding_done', 'true');
    setIsGuest(true);
  }, []);

  const exitGuestMode = useCallback(async () => {
    await AsyncStorage.removeItem(GUEST_MODE_KEY);
    setIsGuest(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isGuest,
        loading,
        refreshProfile,
        enterGuestMode,
        exitGuestMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
