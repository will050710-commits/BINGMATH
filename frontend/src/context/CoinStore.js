"use client";
/**
 * CoinStore.js — Context quản lý đồng xu ảo của user
 * Đồng bộ với backend /api/coins
 */
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/authContext";
import { auth } from "@/lib/firebase";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:8000");

async function _apiFetch(path, opts = {}) {
  const hdrs = { "Content-Type": "application/json", ...opts.headers };
  const currentUser = auth?.currentUser;
  if (currentUser) {
    try {
      const token = await currentUser.getIdToken(true);
      hdrs["Authorization"] = `Bearer ${token}`;
    } catch (_) {}
  }
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: hdrs });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

const CoinStoreCtx = createContext(null);

export function CoinStoreProvider({ children }) {
  const { user } = useAuth();
  const [coins, setCoins] = useState(0);
  const [lifetimeCoins, setLifetimeCoins] = useState(0);
  const [loading, setLoading] = useState(false);

  const refreshCoins = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { ok, data } = await _apiFetch("/api/coins");
    if (ok) {
      setCoins(data.coins ?? 0);
      setLifetimeCoins(data.lifetime_coins ?? 0);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) refreshCoins();
    else { setCoins(0); setLifetimeCoins(0); }
  }, [user, refreshCoins]);

  const earnCoins = useCallback(async (amount, reason = "game_complete") => {
    if (!user || amount <= 0) return;
    const { ok, data } = await _apiFetch("/api/coins/earn", {
      method: "POST",
      body: JSON.stringify({ amount, reason }),
    });
    if (ok) {
      setCoins(data.coins ?? 0);
    }
    return ok ? data.coins : null;
  }, [user]);

  const spendCoins = useCallback(async (amount) => {
    // Optimistic — actual deduction happens in buy endpoint
    setCoins(prev => Math.max(0, prev - amount));
  }, []);

  return (
    <CoinStoreCtx.Provider value={{ coins, lifetimeCoins, loading, refreshCoins, earnCoins, spendCoins }}>
      {children}
    </CoinStoreCtx.Provider>
  );
}

export function useCoinStore() {
  const ctx = useContext(CoinStoreCtx);
  if (!ctx) throw new Error("useCoinStore must be inside CoinStoreProvider");
  return ctx;
}
