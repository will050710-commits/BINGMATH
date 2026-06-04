"use client";
import { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Constants ──────────────────────────────────────────────────────────────
const SUPER_ADMIN_EMAIL = "will050710@gmail.com";
const ADMIN_PASSWORD = "duomath2026"; // Simple shared password for demo

const STORAGE_KEYS = {
  MATHMAPS: "duomath_mathmaps",
  ADMINS: "duomath_admins",
  CURRENT_USER: "duomath_current_user",
  LEADERBOARDS: "duomath_mathmap_leaderboards",
};

const SEED_LEADERBOARD_DEFAULT = [
  { username: "MathGod_2k7", grade: "Lớp 12", score: 9840, accuracy: 98.2, combo: 156 },
  { username: "QuadraticKing", grade: "Lớp 11", score: 9120, accuracy: 95.6, combo: 134 },
  { username: "PiMaster", grade: "Lớp 12", score: 8870, accuracy: 93.1, combo: 128 },
  { username: "TrigWhiz", grade: "Lớp 11", score: 8540, accuracy: 91.7, combo: 119 },
  { username: "Sigma_Boy", grade: "Lớp 10", score: 8210, accuracy: 89.4, combo: 108 },
  { username: "Calculus_Pro", grade: "Lớp 12", score: 7980, accuracy: 87.2, combo: 99 },
  { username: "AlgebraQueen", grade: "Lớp 11", score: 7650, accuracy: 85.0, combo: 92 },
];

// ── Mock seed data (shown in forum by default) ─────────────────────────────
const SEED_MAPS = [
  {
    id: "mm001", title: "Phương trình bậc hai nâng cao", title_en: "Advanced Quadratic Equations",
    creator: "NguyenVanA", creatorEmail: "seed@duomath.vn",
    grade: "Lớp 11", difficulty_fmp: 7.8, plays: 14200, rating: 4.9, favorites: 342,
    tags: ["#ĐạiSố11", "#PhuongTrinhBacHai", "#NangCao"],
    status: "ranked", question_count: 12, time_avg: 30, bgm: "Dramatic Theme",
    thumbnail_color: "linear-gradient(135deg, #0ea5e9, #6366f1)", icon: "📐",
    description: "Tổng hợp các dạng phương trình bậc hai nâng cao từ đề thi THPT QG 3 năm gần nhất.",
    submittedAt: "2026-05-01T00:00:00.000Z",
    qualifiedAt: "2026-05-01T01:00:00.000Z",
    rankedAt: "2026-05-02T01:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z",
    isSeed: true,
    questions: [],
  },
  {
    id: "mm002", title: "Hình học phẳng cơ bản", title_en: "Basic Plane Geometry",
    creator: "TranThiB", creatorEmail: "seed@duomath.vn",
    grade: "Lớp 10", difficulty_fmp: 4.2, plays: 9870, rating: 4.6, favorites: 201,
    tags: ["#HinhHoc10", "#CoBan", "#TamGiac"],
    status: "ranked", question_count: 10, time_avg: 20, bgm: "Calm Study",
    thumbnail_color: "linear-gradient(135deg, #10b981, #059669)", icon: "📏",
    description: "Bộ câu hỏi hình học phẳng từ cơ bản đến trung bình, phù hợp ôn thi cuối học kỳ.",
    submittedAt: "2026-05-05T00:00:00.000Z",
    qualifiedAt: "2026-05-05T01:00:00.000Z",
    rankedAt: "2026-05-06T01:00:00.000Z",
    updatedAt: "2026-05-28T00:00:00.000Z",
    isSeed: true,
    questions: [],
  },
  {
    id: "mm003", title: "Đạo hàm & Ứng dụng", title_en: "Derivatives & Applications",
    creator: "LeVanC", creatorEmail: "seed@duomath.vn",
    grade: "Lớp 12", difficulty_fmp: 8.5, plays: 7340, rating: 4.7, favorites: 289,
    tags: ["#GiaiTich12", "#DaoHam", "#CucTri", "#SieuNangCao"],
    status: "ranked", question_count: 15, time_avg: 45, bgm: "Epic Boss Battle",
    thumbnail_color: "linear-gradient(135deg, #f59e0b, #ef4444)", icon: "∫",
    description: "Đạo hàm, cực trị, tiếp tuyến và ứng dụng thực tế. Dành cho học sinh lớp 12 ôn thi ĐH.",
    submittedAt: "2026-05-10T00:00:00.000Z",
    qualifiedAt: "2026-05-10T01:00:00.000Z",
    rankedAt: "2026-05-11T01:00:00.000Z",
    updatedAt: "2026-06-01T00:00:00.000Z",
    isSeed: true,
    questions: [],
  },
  {
    id: "mm004", title: "Lượng giác - Tổng hợp", title_en: "Trigonometry Comprehensive",
    creator: "PhamThiD", creatorEmail: "seed@duomath.vn",
    grade: "Lớp 11", difficulty_fmp: 6.3, plays: 11560, rating: 4.4, favorites: 178,
    tags: ["#LuongGiac11", "#SinCos", "#TongHop"],
    status: "ranked", question_count: 10, time_avg: 25, bgm: "Electronic Beat",
    thumbnail_color: "linear-gradient(135deg, #8b5cf6, #6d28d9)", icon: "θ",
    description: "Tổng hợp công thức lượng giác, phương trình và bất phương trình lượng giác.",
    submittedAt: "2026-05-15T00:00:00.000Z",
    qualifiedAt: "2026-05-15T01:00:00.000Z",
    rankedAt: "2026-05-16T01:00:00.000Z",
    updatedAt: "2026-05-30T00:00:00.000Z",
    isSeed: true,
    questions: [],
  },
  {
    id: "mm005", title: "Xác suất & Thống kê", title_en: "Probability & Statistics",
    creator: "HoangVanE", creatorEmail: "seed@duomath.vn",
    grade: "Lớp 12", difficulty_fmp: 5.1, plays: 6200, rating: 4.2, favorites: 134,
    tags: ["#XacSuat12", "#ThongKe", "#TrungBinh"],
    status: "qualified", question_count: 8, time_avg: 20, bgm: "Chill Lofi",
    thumbnail_color: "linear-gradient(135deg, #ec4899, #db2777)", icon: "σ",
    description: "Xác suất cổ điển, thống kê mô tả và phân phối xác suất cơ bản.",
    submittedAt: "2026-06-02T00:00:00.000Z",
    qualifiedAt: "2026-06-03T10:00:00.000Z",
    rankedAt: null,
    updatedAt: "2026-05-25T00:00:00.000Z",
    isSeed: true,
    questions: [],
  },
  {
    id: "mm006", title: "Dãy số - Cấp số cộng & nhân", title_en: "Sequences: AP & GP",
    creator: "NguyenThiF", creatorEmail: "seed@duomath.vn",
    grade: "Lớp 11", difficulty_fmp: 6.8, plays: 8900, rating: 4.5, favorites: 220,
    tags: ["#DaySo11", "#CapSoCong", "#CapSoNhan"],
    status: "ranked", question_count: 12, time_avg: 30, bgm: "Orchestral",
    thumbnail_color: "linear-gradient(135deg, #06b6d4, #0891b2)", icon: "∑",
    description: "Cấp số cộng, cấp số nhân, tổng n số hạng và ứng dụng.",
    submittedAt: "2026-05-20T00:00:00.000Z",
    qualifiedAt: "2026-05-20T02:00:00.000Z",
    rankedAt: "2026-05-21T02:00:00.000Z",
    updatedAt: "2026-06-03T00:00:00.000Z",
    isSeed: true,
    questions: [],
  },
  {
    id: "mm007", title: "Mệnh đề & Tập hợp", title_en: "Logic & Set Theory",
    creator: "BuiVanG", creatorEmail: "seed@duomath.vn",
    grade: "Lớp 10", difficulty_fmp: 3.5, plays: 5600, rating: 4.0, favorites: 98,
    tags: ["#MenhDe10", "#TapHop", "#CoBan"],
    status: "ranked", question_count: 8, time_avg: 15, bgm: "Pixel Game",
    thumbnail_color: "linear-gradient(135deg, #22d3ee, #0ea5e9)", icon: "∈",
    description: "Mệnh đề logic, tập hợp và các phép toán tập hợp cơ bản cho học sinh lớp 10.",
    submittedAt: "2026-05-18T00:00:00.000Z",
    qualifiedAt: "2026-05-18T03:00:00.000Z",
    rankedAt: "2026-05-19T03:00:00.000Z",
    updatedAt: "2026-05-20T00:00:00.000Z",
    isSeed: true,
    questions: [],
  },
  {
    id: "mm008", title: "Tích phân xác định", title_en: "Definite Integrals",
    creator: "NguyenVanA", creatorEmail: "seed@duomath.vn",
    grade: "Lớp 12", difficulty_fmp: 9.2, plays: 4100, rating: 4.8, favorites: 312,
    tags: ["#GiaiTich12", "#TichPhan", "#SieuKho"],
    status: "ranked", question_count: 10, time_avg: 60, bgm: "Final Boss",
    thumbnail_color: "linear-gradient(135deg, #dc2626, #991b1b)", icon: "∮",
    description: "Tích phân xác định, diện tích hình phẳng và ứng dụng. Cực khó — cho học sinh xuất sắc!",
    submittedAt: "2026-05-25T00:00:00.000Z",
    qualifiedAt: "2026-05-25T04:00:00.000Z",
    rankedAt: "2026-05-26T04:00:00.000Z",
    updatedAt: "2026-06-04T00:00:00.000Z",
    isSeed: true,
    questions: [],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
function loadFromStorage(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function saveToStorage(key, value) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

/** Merge seed maps with user-submitted maps from localStorage, de-duplicating by id */
function getMergedMaps() {
  const stored = loadFromStorage(STORAGE_KEYS.MATHMAPS, []);
  const storedIds = new Set(stored.map(m => m.id));
  // Seeds not overridden by stored data
  const seeds = SEED_MAPS.filter(s => !storedIds.has(s.id));
  return [...seeds, ...stored];
}

/** Auto-promote qualified maps that passed 24h */
function applyAutoPromote(maps) {
  const now = Date.now();
  return maps.map(m => {
    if (m.status === "qualified" && m.qualifiedAt) {
      const qualifiedMs = new Date(m.qualifiedAt).getTime();
      if (now - qualifiedMs >= 24 * 60 * 60 * 1000) {
        return { ...m, status: "ranked", rankedAt: new Date().toISOString() };
      }
    }
    return m;
  });
}

// ── Context ────────────────────────────────────────────────────────────────
const MathMapStoreCtx = createContext(null);

export function MathMapStoreProvider({ children }) {
  const [maps, setMapsRaw] = useState([]);
  const [admins, setAdminsRaw] = useState([SUPER_ADMIN_EMAIL]);
  const [currentUser, setCurrentUserRaw] = useState(null); // { email }
  const [leaderboards, setLeaderboardsRaw] = useState({});
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on client
  useEffect(() => {
    const merged = applyAutoPromote(getMergedMaps());
    setMapsRaw(merged);

    const storedAdmins = loadFromStorage(STORAGE_KEYS.ADMINS, [SUPER_ADMIN_EMAIL]);
    if (!storedAdmins.includes(SUPER_ADMIN_EMAIL)) storedAdmins.unshift(SUPER_ADMIN_EMAIL);
    setAdminsRaw(storedAdmins);

    const storedUser = loadFromStorage(STORAGE_KEYS.CURRENT_USER, null);
    setCurrentUserRaw(storedUser);

    const storedLeaderboards = loadFromStorage(STORAGE_KEYS.LEADERBOARDS, {});
    setLeaderboardsRaw(storedLeaderboards);

    setHydrated(true);
  }, []);

  // Save maps (only non-seed) to localStorage whenever they change
  const setMaps = useCallback((updater) => {
    setMapsRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      // Only persist non-seed maps
      const toStore = next.filter(m => !m.isSeed);
      saveToStorage(STORAGE_KEYS.MATHMAPS, toStore);
      return next;
    });
  }, []);

  const setAdmins = useCallback((updater) => {
    setAdminsRaw(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      // Ensure super admin is always present
      const withSuper = next.includes(SUPER_ADMIN_EMAIL) ? next : [SUPER_ADMIN_EMAIL, ...next];
      saveToStorage(STORAGE_KEYS.ADMINS, withSuper);
      return withSuper;
    });
  }, []);

  const setCurrentUser = useCallback((user) => {
    setCurrentUserRaw(user);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
  }, []);

  // ── Auth ──────────────────────────────────────────────────────────────
  const login = useCallback((email, password) => {
    if (password !== ADMIN_PASSWORD) return { ok: false, error: "Sai mật khẩu" };
    const emailLower = email.trim().toLowerCase();
    const adminList = loadFromStorage(STORAGE_KEYS.ADMINS, [SUPER_ADMIN_EMAIL]);
    if (!adminList.map(e => e.toLowerCase()).includes(emailLower)) {
      return { ok: false, error: "Email này không có quyền admin" };
    }
    setCurrentUser({ email: email.trim() });
    return { ok: true };
  }, [setCurrentUser]);

  const logout = useCallback(() => setCurrentUser(null), [setCurrentUser]);

  // ── Permissions ───────────────────────────────────────────────────────
  const isSuperAdmin = useCallback((email) => {
    return email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  }, []);

  const isAdmin = useCallback((email) => {
    if (!email) return false;
    return admins.map(e => e.toLowerCase()).includes(email.toLowerCase());
  }, [admins]);

  // ── Admin management ──────────────────────────────────────────────────
  const grantAdmin = useCallback((email) => {
    const e = email.trim().toLowerCase();
    setAdmins(prev => prev.map(x => x.toLowerCase()).includes(e) ? prev : [...prev, email.trim()]);
  }, [setAdmins]);

  const revokeAdmin = useCallback((email) => {
    if (isSuperAdmin(email)) return; // cannot revoke super admin
    setAdmins(prev => prev.filter(e => e.toLowerCase() !== email.toLowerCase()));
  }, [setAdmins, isSuperAdmin]);

  // ── MathMap operations ────────────────────────────────────────────────
  const submitMap = useCallback((mapData) => {
    const id = `user_${Date.now()}`;
    const newMap = {
      ...mapData,
      id,
      status: "pending",
      plays: 0,
      rating: 0,
      favorites: 0,
      difficulty_fmp: mapData.difficulty_fmp || 5.0,
      thumbnail_color: mapData.thumbnail_color || "linear-gradient(135deg, #a78bfa, #6d28d9)",
      icon: mapData.icon || "📐",
      submittedAt: new Date().toISOString(),
      qualifiedAt: null,
      rankedAt: null,
      updatedAt: new Date().toISOString(),
      isSeed: false,
    };
    setMaps(prev => [...prev, newMap]);
    return id;
  }, [setMaps]);

  const approveMap = useCallback((id) => {
    setMaps(prev => prev.map(m =>
      m.id === id
        ? { ...m, status: "qualified", qualifiedAt: new Date().toISOString() }
        : m
    ));
  }, [setMaps]);

  const rejectMap = useCallback((id, reason = "") => {
    setMaps(prev => prev.map(m =>
      m.id === id
        ? { ...m, status: "rejected", rejectedAt: new Date().toISOString(), rejectReason: reason }
        : m
    ));
  }, [setMaps]);

  const forceRanked = useCallback((id) => {
    setMaps(prev => prev.map(m =>
      m.id === id
        ? { ...m, status: "ranked", rankedAt: new Date().toISOString() }
        : m
    ));
  }, [setMaps]);

  const deleteMap = useCallback((id) => {
    setMaps(prev => prev.filter(m => m.id !== id));
  }, [setMaps]);

  // Trigger auto-promote check
  const checkAutoPromote = useCallback(() => {
    setMaps(prev => applyAutoPromote(prev));
  }, [setMaps]);

  // ── Getters ───────────────────────────────────────────────────────────
  const getMapsByStatus = useCallback((status) => {
    return maps.filter(m => m.status === status);
  }, [maps]);

  const getPublicMaps = useCallback(() => {
    // ranked + qualified visible in forum
    return maps.filter(m => m.status === "ranked" || m.status === "qualified");
  }, [maps]);

  // ── Leaderboards ───────────────────────────────────────────────────────
  const saveLeaderboardScore = useCallback((mapId, username, grade, score, accuracy, combo) => {
    setLeaderboardsRaw(prev => {
      const mapLbs = prev[mapId] || SEED_LEADERBOARD_DEFAULT;
      // Add or update the user's score if it's higher than their previous score on this map
      const existingIdx = mapLbs.findIndex(x => x.username.toLowerCase() === username.toLowerCase());
      let nextList = [...mapLbs];
      if (existingIdx !== -1) {
        if (score > mapLbs[existingIdx].score) {
          nextList[existingIdx] = { username, grade, score, accuracy, combo };
        } else {
          return prev;
        }
      } else {
        nextList.push({ username, grade, score, accuracy, combo });
      }
      const next = { ...prev, [mapId]: nextList };
      saveToStorage(STORAGE_KEYS.LEADERBOARDS, next);
      return next;
    });
  }, []);

  const getLeaderboardForMap = useCallback((mapId) => {
    const list = leaderboards[mapId] || SEED_LEADERBOARD_DEFAULT;
    return [...list].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
      return b.combo - a.combo;
    }).map((x, idx) => ({ ...x, rank: idx + 1 }));
  }, [leaderboards]);

  const value = {
    hydrated,
    maps,
    admins,
    currentUser,
    // Auth
    login,
    logout,
    // Permissions
    isSuperAdmin,
    isAdmin,
    // Admin mgmt
    grantAdmin,
    revokeAdmin,
    // Map ops
    submitMap,
    approveMap,
    rejectMap,
    forceRanked,
    deleteMap,
    checkAutoPromote,
    // Getters
    getMapsByStatus,
    getPublicMaps,
    // Leaderboards
    saveLeaderboardScore,
    getLeaderboardForMap,
    // Constants
    SUPER_ADMIN_EMAIL,
    ADMIN_PASSWORD,
  };

  return (
    <MathMapStoreCtx.Provider value={value}>
      {children}
    </MathMapStoreCtx.Provider>
  );
}

export function useMathMapStore() {
  const ctx = useContext(MathMapStoreCtx);
  if (!ctx) throw new Error("useMathMapStore must be used within MathMapStoreProvider");
  return ctx;
}
