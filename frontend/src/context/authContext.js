/* eslint-disable react-hooks/set-state-in-effect */
"use client";
// ─────────────────────────────────────────────────────────────────────────────
// FILE: frontend/src/context/authContext.js
//
// Auth: Firebase Authentication (email/password)
// Backend: Custom Flask API for scores, leaderboard, competitive stats
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, storage } from "@/lib/firebase";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const AuthCtx = createContext(null);

// ── Backend API fetch (no JWT needed — uses Firebase UID as identity) ─────────
async function apiFetch(path, opts = {}) {
  const hdrs = { "Content-Type": "application/json", ...opts.headers };

  // Attach Firebase ID token if user is logged in
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const idToken = await currentUser.getIdToken();
      hdrs["Authorization"] = `Bearer ${idToken}`;
    } catch (_) {}
  }

  const res = await fetch(`${BASE}${path}`, { ...opts, headers: hdrs });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [ready,       setReady]       = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [gameResults, setGameResults] = useState([]);
  const [competitiveStats, setCompetitiveStats] = useState({
    xp: 0,
    current_streak: 0,
    longest_streak: 0,
    global_rank: 0,
  });

  // ── Load backend profile (scores + competitive stats) ─────────────────────
  const loadBackendProfile = useCallback(async () => {
    try {
      const { ok, data } = await apiFetch("/api/me");
      if (ok) {
        setTestResults(data.test_results || []);
        setGameResults(data.game_results || []);
        if (data.user) {
          setUser(prev => prev ? { ...prev, ...data.user } : data.user);
        }
      }
      const { ok: statsOk, data: statsData } = await apiFetch("/api/competitive-stats");
      if (statsOk) {
        setCompetitiveStats(statsData);
      }
    } catch (_) {}
  }, []);

  // ── Sync Firebase user → ensure backend user row exists ───────────────────
  const syncUserToBackend = useCallback(async (firebaseUser) => {
    if (!firebaseUser) return;
    try {
      // Try fetching profile — if 404, create user in backend
      const idToken = await firebaseUser.getIdToken();
      const res = await fetch(`${BASE}/api/me`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
      });
      if (res.status === 404 || res.status === 401) {
        // User doesn't exist in backend yet — register them
        await fetch(`${BASE}/api/firebase-sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            email: firebaseUser.email,
            username: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          }),
        });
      }
    } catch (_) {}
  }, []);

  // ── Sync local test results if any exist and are not saved yet ─────────────
  const syncLocalResults = useCallback(async () => {
    if (typeof window === "undefined") return;
    try {
      const data = localStorage.getItem("readingTest_result");
      if (!data) return;
      const parsed = JSON.parse(data);
      if (parsed && !parsed.isSaved) {
        const exam = parsed.testId || "reading-test-1";
        const savedTime = parsed.timeSpent ?? (Number(localStorage.getItem("timeSpent")) || 0);
        const sections = ["section1", "section2", "section3"];
        let anySaved = false;

        for (const sec of sections) {
          const secQs = (parsed.questions || []).filter(q => q.section === sec);
          if (secQs.length > 0) {
            const score = secQs.filter(q => q.isCorrect).length;
            const total = secQs.length;
            const answers = {};
            secQs.forEach(q => {
              answers[q.key] = q.userAnswer || "";
            });
            
            const { ok } = await apiFetch("/api/test-result", {
              method: "POST",
              body: JSON.stringify({
                test_key: exam,
                section: sec,
                score,
                total,
                answers,
                time_spent: savedTime
              }),
            });
            if (ok) anySaved = true;
          }
        }

        if (anySaved) {
          parsed.isSaved = true;
          localStorage.setItem("readingTest_result", JSON.stringify(parsed));
        }
      }
    } catch (_) {}
  }, []);

  // ── Listen to Firebase auth state ─────────────────────────────────────────
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id:          firebaseUser.uid,
          email:       firebaseUser.email,
          username:    firebaseUser.displayName || firebaseUser.email.split("@")[0],
          name:        firebaseUser.displayName || firebaseUser.email.split("@")[0],
          avatar_url:  firebaseUser.photoURL || "",
          created_at:  firebaseUser.metadata?.creationTime || "",
        });
        await syncUserToBackend(firebaseUser);
        await syncLocalResults();
        await loadBackendProfile();
      } else {
        setUser(null);
        setTestResults([]);
        setGameResults([]);
        setCompetitiveStats({ xp: 0, current_streak: 0, longest_streak: 0, global_rank: 0 });
      }
      setReady(true);
    });
    return () => unsub();
  }, [loadBackendProfile, syncUserToBackend, syncLocalResults]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function signup({ email, username, password, phone = "", school = "", grade = "" }) {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name
      await firebaseUpdateProfile(credential.user, { displayName: username });

      // Sync to backend
      const idToken = await credential.user.getIdToken();
      await fetch(`${BASE}/api/firebase-sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email, username, phone, school, grade }),
      });

      return { ok: true, error: null };
    } catch (err) {
      return { ok: false, error: _firebaseErrorMessage(err) };
    }
  }

  async function login({ email, password }) {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { ok: true, error: null };
    } catch (err) {
      return { ok: false, error: _firebaseErrorMessage(err) };
    }
  }

  async function logout() {
    await signOut(auth);
  }

  async function updateProfile(fields) {
    const { ok, data } = await apiFetch("/api/me", {
      method: "PATCH",
      body: JSON.stringify(fields),
    });
    if (ok && data.user) {
      // Fix: merge ALL returned user fields immediately into state
      setUser(prev => ({
        ...prev,
        ...data.user,
        // Preserve Firebase-only fields not stored in backend
        id: prev?.id,
        email: prev?.email || data.user.email,
      }));
    }
    return { ok, error: data.error || null };
  }

  // ── Avatar upload (Firebase Storage → backend PATCH) ─────────────────────
  async function uploadAvatar(file) {
    if (!file || !auth.currentUser) return { ok: false, error: "Not logged in" };

    // Validate file type + size
    if (!file.type.startsWith("image/")) return { ok: false, error: "Chỉ hỗ trợ file ảnh." };
    if (file.size > 5 * 1024 * 1024) return { ok: false, error: "Ảnh phải nhỏ hơn 5MB." };

    try {
      // Upload to Firebase Storage: avatars/{firebase_uid}/{timestamp}
      const uid = auth.currentUser.uid;
      const ext = file.name.split(".").pop() || "jpg";
      const storageRef = ref(storage, `avatars/${uid}/${Date.now()}.${ext}`);

      await uploadBytes(storageRef, file, { contentType: file.type });
      const downloadURL = await getDownloadURL(storageRef);

      // Persist URL to backend
      const { ok, error } = await updateProfile({ avatar_url: downloadURL });
      return { ok, error, url: downloadURL };
    } catch (err) {
      return { ok: false, error: err.message || "Upload thất bại." };
    }
  }

  // ── Score savers ──────────────────────────────────────────────────────────
  async function saveTestResult({ test_key, section, score, total, answers = {}, time_spent = 0 }) {
    if (!user) return { ok: false, error: "Not logged in" };
    const { ok, data } = await apiFetch("/api/test-result", {
      method: "POST",
      body: JSON.stringify({ test_key, section, score, total, answers, time_spent }),
    });
    if (ok) await loadBackendProfile();
    return { ok, error: data.error || null };
  }

  async function saveGameResult({ lesson_slug, mode, score, total }) {
    if (!user) return { ok: false, error: "Not logged in" };
    const { ok, data } = await apiFetch("/api/minigame-result", {
      method: "POST",
      body: JSON.stringify({ lesson_slug, mode, score, total }),
    });
    if (ok) await loadBackendProfile();
    return { ok, error: data.error || null };
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const bestScores = testResults.reduce((acc, r) => {
    const k = `${r.test_key}__${r.section}`;
    if (!acc[k] || r.score > acc[k].score) acc[k] = r;
    return acc;
  }, {});

  const recentActivity = [...testResults, ...gameResults]
    .sort((a, b) => new Date(b.taken_at || b.played_at) - new Date(a.taken_at || a.played_at))
    .slice(0, 6)
    .map((r) => r.test_key
      ? `📝 ${r.test_key} · ${r.section}: ${r.score}/${r.total} (${r.accuracy}%)`
      : `🎮 ${r.lesson_slug} [${r.mode}]: ${r.score}/${r.total}`
    );

  const totalTests = testResults.length;
  const totalGames = gameResults.length;
  const avgTest = totalTests ? Math.round(testResults.reduce((s, r) => s + (r.accuracy || 0), 0) / totalTests) : null;
  const avgGame = totalGames ? Math.round(gameResults.reduce((s, r) => s + (r.score / r.total) * 100, 0) / totalGames) : null;

  return (
    <AuthCtx.Provider value={{
      user, ready, testResults, gameResults, competitiveStats,
      bestScores, recentActivity, totalTests, totalGames, avgTest, avgGame,
      signup, login, logout, updateProfile, uploadAvatar,
      saveTestResult, saveGameResult,
      reloadProfile: loadBackendProfile,
    }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth() must be inside <AuthProvider>");
  return ctx;
}

// ── Firebase error → human readable ──────────────────────────────────────────
function _firebaseErrorMessage(err) {
  const code = err?.code || "";
  if (code === "auth/email-already-in-use")   return "Email này đã được đăng ký.";
  if (code === "auth/invalid-email")           return "Email không hợp lệ.";
  if (code === "auth/weak-password")           return "Mật khẩu phải có ít nhất 6 ký tự.";
  if (code === "auth/user-not-found")          return "Không tìm thấy tài khoản với email này.";
  if (code === "auth/wrong-password")          return "Sai mật khẩu. Vui lòng thử lại.";
  if (code === "auth/invalid-credential")      return "Sai email hoặc mật khẩu. Vui lòng thử lại.";
  if (code === "auth/too-many-requests")       return "Quá nhiều lần thử. Vui lòng thử lại sau.";
  if (code === "auth/network-request-failed")  return "Không có kết nối mạng. Vui lòng kiểm tra internet.";
  return err?.message || "Đăng nhập thất bại. Vui lòng thử lại.";
}
