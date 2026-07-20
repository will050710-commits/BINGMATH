import React, { createContext, useContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import { getMe, syncUser } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);          // Firebase user
  const [profile, setProfile] = useState(null);    // Backend profile
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const data = await getMe();
          setProfile(data.user);
        } catch {
          // Backend not reachable or user not synced yet
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const data = await getMe();
      setProfile(data.user);
    } catch (e) {
      console.warn('[Auth] Could not refresh profile:', e?.message);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
