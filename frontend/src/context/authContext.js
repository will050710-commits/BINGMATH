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
import { auth } from "@/lib/firebase";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1" ? "https://duomath.onrender.com" : "http://localhost:5000");
const AuthCtx = createContext(null);

// ── Backend API fetch (no JWT needed — uses Firebase UID as identity) ─────────
async function apiFetch(path, opts = {}) {
  const hdrs = { "Content-Type": "application/json", ...opts.headers };

  // Attach Firebase ID token if user is logged in
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      // force=true ensures we get a fresh token (avoids 401 from expired tokens)
      const idToken = await currentUser.getIdToken(/* forceRefresh = */ true);
      hdrs["Authorization"] = `Bearer ${idToken}`;
    } catch (_) {}
  }

  const res = await fetch(`${BASE}${path}`, { ...opts, headers: hdrs });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Log for debugging — visible in browser DevTools Console
    console.error(`[apiFetch] ${opts.method || 'GET'} ${path} → ${res.status}`, data);
  }
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
    let { ok, data, status } = await apiFetch("/api/me", {
      method: "PATCH",
      body: JSON.stringify(fields),
    });

    // If 404: user isn't in backend DB yet — auto-sync then retry once
    if (status === 404 && auth.currentUser) {
      try {
        await syncUserToBackend(auth.currentUser);
        const retry = await apiFetch("/api/me", {
          method: "PATCH",
          body: JSON.stringify(fields),
        });
        ok = retry.ok; data = retry.data; status = retry.status;
      } catch (_) {}
    }

    if (ok && data.user) {
      setUser(prev => ({
        ...prev,
        ...data.user,
        id: prev?.id,
        email: prev?.email || data.user.email,
      }));
      // Also update Firebase displayName if username changed
      if (fields.username && auth.currentUser) {
        try {
          await firebaseUpdateProfile(auth.currentUser, { displayName: fields.username });
        } catch (_) {}
      }
    }
    // FastAPI raises HTTPException → { detail: "..." }
    // Legacy errors → { error: "..." }
    const errMsg = data.error || data.detail || (
      status === 401 ? "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại." :
      status === 403 ? "Tài khoản bị khóa." :
      status === 404 ? "Không tìm thấy tài khoản. Vui lòng đăng xuất và đăng nhập lại." :
      null
    );
    return { ok, error: errMsg };
  }

  // ── Avatar upload (client-side resize + base64 → backend PATCH) ──────────────────
  // No Firebase Storage needed — avoids all CORS issues.
  async function uploadAvatar(file) {
    if (!file) return { ok: false, error: "Chưa chọn file." };
    if (!auth.currentUser) return { ok: false, error: "Bạn chưa đăng nhập. Vui lòng đăng nhập lại." };

    // Validate file type: accept jpg, png, gif, webp
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowed.includes(file.type)) {
      return { ok: false, error: "Chỉ hỗ trợ JPG, PNG, GIF, WebP." };
    }
    if (file.size > 5 * 1024 * 1024) return { ok: false, error: "Ảnh phải nhỏ hơn 5MB." };

    try {
      // Resize to max 160×160 and convert to JPEG (much smaller than PNG)
      const dataUrl = await resizeImageToDataURL(file, 160);
      
      if (!dataUrl || !dataUrl.startsWith("data:")) {
        return { ok: false, error: "Không thể xử lý ảnh. Vui lòng thử ảnh khác." };
      }

      // Add timeout for the update request (10 seconds)
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Yêu cầu upload hết thời gian chờ (10s). Vui lòng thử lại.")), 10000)
      );
      
      const { ok, error } = await Promise.race([
        updateProfile({ avatar_url: dataUrl }),
        timeoutPromise
      ]);
      
      if (!ok) {
        return { ok: false, error: error || "Không thể lưu ảnh lên server. Vui lòng thử lại." };
      }
      // Return the dataUrl so the caller can update the preview immediately
      return { ok: true, error: null, url: dataUrl };
    } catch (err) {
      console.error("[uploadAvatar] error:", err);
      const msg = err?.message || err?.toString?.() || "Upload thất bại.";
      // Provide more specific error messages for common issues
      if (msg.includes("timeout") || msg.includes("hết thời gian")) {
        return { ok: false, error: "Upload quá lâu. Vui lòng kiểm tra kết nối mạng." };
      }
      if (msg.includes("Network") || msg.includes("network")) {
        return { ok: false, error: "Lỗi kết nối mạng. Vui lòng kiểm tra Internet." };
      }
      return { ok: false, error: msg || "Upload thất bại." };
    }
  }

  // ── Helper: resize image file → base64 data URL (max px on longest side) ──
  function resizeImageToDataURL(file, maxPx = 160) {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        
        // Add timeout for image loading (5 seconds)
        const loadTimeout = setTimeout(() => {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Không thể tải ảnh (timeout). Vui lòng thử lại."));
        }, 5000);
        
        img.onload = () => {
          clearTimeout(loadTimeout);
          try {
            URL.revokeObjectURL(objectUrl);
            let { width, height } = img;
            
            // Validate dimensions
            if (!width || !height || width <= 0 || height <= 0) {
              throw new Error("Kích thước ảnh không hợp lệ.");
            }
            
            if (width > maxPx || height > maxPx) {
              if (width >= height) {
                height = Math.round((height * maxPx) / width);
                width = maxPx;
              } else {
                width = Math.round((width * maxPx) / height);
                height = maxPx;
              }
            }
            
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            
            if (!ctx) {
              throw new Error("Không thể tạo canvas để xử lý ảnh.");
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
            
            // Validate the resulting data URL
            if (!dataUrl || dataUrl.length < 100) {
              throw new Error("Ảnh xử lý không hợp lệ.");
            }
            
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };
        
        img.onerror = () => {
          clearTimeout(loadTimeout);
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Không thể đọc file ảnh. File có thể bị hỏng."));
        };
        
        img.onabort = () => {
          clearTimeout(loadTimeout);
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Việc tải ảnh bị hủy."));
        };
        
        img.src = objectUrl;
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
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
