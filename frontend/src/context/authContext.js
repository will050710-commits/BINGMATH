/* eslint-disable react-hooks/set-state-in-effect */
"use client";
// ─────────────────────────────────────────────────────────────────────────────
// FILE: frontend/src/context/authContext.js
//
// SETUP STEPS:
//  1. Open frontend/src/app/layout.js (root layout).
//     Import and wrap children:
//       import { AuthProvider } from "@/context/authContext";
//       ...
//       <AuthProvider>{children}</AuthProvider>
//
//  2. Create frontend/.env.local and add:
//       NEXT_PUBLIC_BACKEND_URL=https://YOUR-APP.onrender.com
//     (Leave blank for local dev — defaults to localhost:5000)
//
//  3. In any component: const { user, login, ... } = useAuth();
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
const AuthCtx = createContext(null);

// ── Token storage ─────────────────────────────────────────────────────────
function storeTokens(a, r)  { localStorage.setItem("dm_access", a);  localStorage.setItem("dm_refresh", r); }
function clearTokens()       { localStorage.removeItem("dm_access");   localStorage.removeItem("dm_refresh"); }
function getAccess()         { return typeof window !== "undefined" ? localStorage.getItem("dm_access")  : null; }
function getRefresh()        { return typeof window !== "undefined" ? localStorage.getItem("dm_refresh") : null; }

async function doRefresh() {
  const rf = getRefresh();
  if (!rf) return false;
  try {
    const res = await fetch(`${BASE}/api/refresh`, {
      method: "POST", headers: { Authorization: `Bearer ${rf}`, "Content-Type": "application/json" },
    });
    if (!res.ok) { clearTokens(); return false; }
    localStorage.setItem("dm_access", (await res.json()).access_token);
    return true;
  } catch { clearTokens(); return false; }
}

async function apiFetch(path, opts = {}) {
  const token = getAccess();
  const hdrs  = { "Content-Type": "application/json", ...opts.headers };
  if (token) hdrs["Authorization"] = `Bearer ${token}`;

  let res  = await fetch(`${BASE}${path}`, { ...opts, headers: hdrs });
  if (res.status === 401 && await doRefresh()) {
    hdrs["Authorization"] = `Bearer ${getAccess()}`;
    res = await fetch(`${BASE}${path}`, { ...opts, headers: hdrs });
  }
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

  const loadProfile = useCallback(async () => {
    if (!getAccess()) { setReady(true); return; }
    const { ok, data } = await apiFetch("/api/me");
    if (ok) {
      setUser(data.user);
      setTestResults(data.test_results || []);
      setGameResults(data.game_results || []);
      
      // Load competitive stats
      const { ok: statsOk, data: statsData } = await apiFetch("/api/competitive-stats");
      if (statsOk) {
        setCompetitiveStats(statsData);
      }
    } else {
      clearTokens(); setUser(null);
    }
    setReady(true);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  // ── Auth ──────────────────────────────────────────────────────────────────
  async function signup({ email, username, password, phone = "", school = "", grade = "" }) {
    const { ok, data } = await apiFetch("/api/signup", {
      method: "POST", body: JSON.stringify({ email, username, password, phone, school, grade }),
    });
    if (ok) { storeTokens(data.access_token, data.refresh_token); setUser(data.user); setTestResults([]); setGameResults([]); }
    return { ok, error: data.error || null };
  }

  async function login({ email, password }) {
    const { ok, data } = await apiFetch("/api/login", {
      method: "POST", body: JSON.stringify({ email, password }),
    });
    if (ok) { storeTokens(data.access_token, data.refresh_token); await loadProfile(); }
    return { ok, error: data.error || null };
  }

  function logout() { clearTokens(); setUser(null); setTestResults([]); setGameResults([]); setCompetitiveStats({ xp: 0, current_streak: 0, longest_streak: 0, global_rank: 0 }); }

  async function updateProfile(fields) {
    const { ok, data } = await apiFetch("/api/me", { method: "PATCH", body: JSON.stringify(fields) });
    if (ok) setUser(data.user);
    return { ok, error: data.error || null };
  }

  // ── Score savers ──────────────────────────────────────────────────────────
  async function saveTestResult({ test_key, section, score, total, answers = {}, time_spent = 0 }) {
    if (!user) return { ok: false, error: "Not logged in" };
    const { ok, data } = await apiFetch("/api/test-result", {
      method: "POST", body: JSON.stringify({ test_key, section, score, total, answers, time_spent }),
    });
    if (ok) await loadProfile();
    return { ok, error: data.error || null };
  }

  async function saveGameResult({ lesson_slug, mode, score, total }) {
    if (!user) return { ok: false, error: "Not logged in" };
    const { ok, data } = await apiFetch("/api/minigame-result", {
      method: "POST", body: JSON.stringify({ lesson_slug, mode, score, total }),
    });
    if (ok) await loadProfile();
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
      signup, login, logout, updateProfile, saveTestResult, saveGameResult,
      reloadProfile: loadProfile,
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
