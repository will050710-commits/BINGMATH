"use client";
/**
 * CoinShop.js — Cửa hàng viền profile, mua bằng xu kiếm được
 * Tham khảo Facebook Frame, Liên Quân Mobile, osu! profile borders
 */
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/authContext";
import { useCoinStore } from "@/context/CoinStore";
import { auth } from "@/lib/firebase";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:5000");

async function apiFetch(path, opts = {}) {
  const hdrs = { "Content-Type": "application/json", ...opts.headers };
  const cu = auth?.currentUser;
  if (cu) {
    try { hdrs["Authorization"] = `Bearer ${await cu.getIdToken(true)}`; } catch (_) {}
  }
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: hdrs });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

const RARITY_META = {
  common:    { label: "Phổ Thông",   color: "#94a3b8", glow: "rgba(148,163,184,0.3)", bg: "rgba(148,163,184,0.06)" },
  rare:      { label: "Hiếm",        color: "#60a5fa", glow: "rgba(96,165,250,0.4)",  bg: "rgba(96,165,250,0.06)" },
  epic:      { label: "Siêu Hiếm",   color: "#a78bfa", glow: "rgba(167,139,250,0.5)", bg: "rgba(167,139,250,0.06)" },
  legendary: { label: "Huyền Thoại", color: "#fbbf24", glow: "rgba(251,191,36,0.6)",  bg: "rgba(251,191,36,0.06)" },
};

function BorderPreview({ cssStyle, emoji, size = 64, animated }) {
  let style = {};
  try { style = JSON.parse(cssStyle || "{}"); } catch (_) {}
  // Remove animation property from inline style (use class)
  const { animation: _anim, ...safeStyle } = style;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg, #1e293b, #0f172a)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.45, flexShrink: 0,
      ...safeStyle,
    }}>
      {emoji}
    </div>
  );
}

function BorderCard({ border, owned, active, onBuy, onEquip, onUnequip, coins, loading }) {
  const [hovered, setHovered] = useState(false);
  const meta = RARITY_META[border.rarity] || RARITY_META.common;
  const canAfford = coins >= border.price_coins;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? meta.bg : "rgba(255,255,255,0.02)",
        border: `1px solid ${active ? meta.color : hovered ? `${meta.color}66` : "rgba(255,255,255,0.08)"}`,
        borderRadius: 16, padding: "20px 16px",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
        transition: "all 0.25s", cursor: "default",
        boxShadow: active ? `0 0 20px ${meta.glow}` : hovered ? `0 8px 24px rgba(0,0,0,0.4)` : "none",
        position: "relative",
      }}
    >
      {/* Active badge */}
      {active && (
        <div style={{
          position: "absolute", top: 8, right: 8,
          background: meta.color, color: "#000",
          borderRadius: 20, padding: "2px 8px",
          fontSize: 10, fontWeight: 800, letterSpacing: 0.5,
        }}>
          ✓ ĐANG DÙNG
        </div>
      )}

      {/* Border preview */}
      <BorderPreview cssStyle={border.css_style} emoji={border.preview_emoji || "👤"} size={72} animated={border.is_animated} />

      {/* Info */}
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1,
          color: meta.color, textTransform: "uppercase", marginBottom: 3,
        }}>
          {meta.label}
        </div>
        <div style={{ fontSize: 14, fontWeight: 800, color: "white", marginBottom: 3 }}>
          {border.name_vi}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>
          {border.description}
        </div>
      </div>

      {/* Price or actions */}
      {!owned ? (
        <div style={{ width: "100%" }}>
          <div style={{
            textAlign: "center", fontSize: 15, fontWeight: 900,
            color: canAfford ? meta.color : "#94a3b8", marginBottom: 8,
          }}>
            🪙 {border.price_coins.toLocaleString()} xu
          </div>
          <button
            onClick={() => canAfford && onBuy(border)}
            disabled={!canAfford || loading}
            style={{
              width: "100%", padding: "9px 0", borderRadius: 8,
              fontSize: 13, fontWeight: 800,
              background: canAfford
                ? `linear-gradient(135deg, ${meta.color}, ${meta.color}bb)`
                : "rgba(255,255,255,0.05)",
              border: "none",
              color: canAfford ? "#000" : "rgba(255,255,255,0.25)",
              cursor: canAfford ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            {loading ? "..." : canAfford ? "🛒 Mua ngay" : "Không đủ xu"}
          </button>
        </div>
      ) : (
        <div style={{ width: "100%", display: "flex", gap: 6 }}>
          {active ? (
            <button
              onClick={() => onUnequip(border)}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                color: "#f87171", cursor: "pointer",
              }}
            >
              Gỡ ra
            </button>
          ) : (
            <button
              onClick={() => onEquip(border)}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
                background: `${meta.color}22`, border: `1px solid ${meta.color}55`,
                color: meta.color, cursor: "pointer",
              }}
            >
              ✓ Trang bị
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CoinShop() {
  const { user } = useAuth();
  const { coins, refreshCoins } = useCoinStore();
  const [borders, setBorders] = useState([]);
  const [owned, setOwned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("all"); // all | common | rare | epic | legendary | owned

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    const [shopRes, ownedRes] = await Promise.all([
      apiFetch("/api/shop/borders"),
      user ? apiFetch("/api/shop/borders/owned") : Promise.resolve({ ok: true, data: [] }),
    ]);
    if (shopRes.ok) setBorders(shopRes.data);
    if (ownedRes.ok) setOwned(ownedRes.data);
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const handleBuy = async (border) => {
    if (!user) { showToast("Đăng nhập để mua viền!", false); return; }
    setBuyingId(border.id);
    const { ok, data } = await apiFetch(`/api/shop/borders/${border.id}/buy`, { method: "POST" });
    setBuyingId(null);
    if (ok) {
      showToast(`Mua ${border.name_vi} thành công! 🎉`);
      await Promise.all([load(), refreshCoins()]);
    } else {
      showToast(data.detail || "Mua thất bại", false);
    }
  };

  const handleEquip = async (border) => {
    if (!user) return;
    const { ok } = await apiFetch(`/api/shop/borders/${border.id}/equip`, { method: "POST" });
    if (ok) { showToast(`Đã trang bị ${border.name_vi}! ✨`); load(); }
  };

  const handleUnequip = async () => {
    if (!user) return;
    const { ok } = await apiFetch("/api/shop/borders/unequip", { method: "POST" });
    if (ok) { showToast("Đã gỡ viền."); load(); }
  };

  const ownedIds = new Set(owned.map(o => o.id));
  const activeId = owned.find(o => o.is_active === 1)?.id;

  const filtered = borders.filter(b => {
    if (filter === "owned") return ownedIds.has(b.id);
    if (filter === "all") return true;
    return b.rarity === filter;
  });

  const FILTERS = [
    { key: "all", label: "Tất cả" },
    { key: "common", label: "Phổ Thông", color: "#94a3b8" },
    { key: "rare", label: "Hiếm", color: "#60a5fa" },
    { key: "epic", label: "Siêu Hiếm", color: "#a78bfa" },
    { key: "legendary", label: "Huyền Thoại", color: "#fbbf24" },
    { key: "owned", label: "Đã sở hữu", color: "#4ade80" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617, #0a0a1a)",
      fontFamily: "'Inter', sans-serif", color: "white",
      padding: "0 0 60px",
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.ok ? "rgba(74,222,128,0.15)" : "rgba(239,68,68,0.15)",
          border: `1px solid ${toast.ok ? "#4ade8066" : "#f8717166"}`,
          borderRadius: 10, padding: "12px 20px",
          fontSize: 13, fontWeight: 700, color: toast.ok ? "#4ade80" : "#f87171",
          backdropFilter: "blur(8px)",
          animation: "toastIn 0.3s ease-out both",
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{
        background: "rgba(2,6,23,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, margin: 0 }}>
            🛍️ Cửa Hàng Viền Profile
          </h1>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", margin: 0, marginTop: 4 }}>
            Trang trí profile bằng xu kiếm được từ việc học
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "rgba(251,191,36,0.1)",
          border: "1px solid rgba(251,191,36,0.3)",
          borderRadius: 20, padding: "8px 16px",
          fontSize: 15, fontWeight: 800, color: "#fbbf24",
        }}>
          🪙 {coins.toLocaleString()} xu
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 20px" }}>
        {/* Filter tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: "7px 16px", borderRadius: 20, fontSize: 12, fontWeight: 700,
                border: `1px solid ${filter === f.key ? (f.color || "#22d3ee") : "rgba(255,255,255,0.1)"}`,
                background: filter === f.key ? `${f.color || "#22d3ee"}22` : "transparent",
                color: filter === f.key ? (f.color || "#22d3ee") : "rgba(255,255,255,0.5)",
                cursor: "pointer", transition: "all 0.2s",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            Đang tải...
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 14,
          }}>
            {filtered.map(b => (
              <BorderCard
                key={b.id}
                border={b}
                owned={ownedIds.has(b.id)}
                active={activeId === b.id}
                coins={coins}
                loading={buyingId === b.id}
                onBuy={handleBuy}
                onEquip={handleEquip}
                onUnequip={handleUnequip}
              />
            ))}
            {filtered.length === 0 && (
              <div style={{ gridColumn: "1/-1", textAlign: "center", color: "rgba(255,255,255,0.3)", padding: "40px 0" }}>
                Không có viền nào
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes toastIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes neonPulse {
          0%, 100% { box-shadow: 0 0 0 2px #4ade8033, 0 0 30px #4ade8099; }
          50%       { box-shadow: 0 0 0 4px #4ade8066, 0 0 50px #4ade80cc; }
        }
        @keyframes rainbowSpin {
          from { filter: hue-rotate(0deg); }
          to   { filter: hue-rotate(360deg); }
        }
        @keyframes godGlow {
          0%, 100% { box-shadow: 0 0 0 2px #ffd70055, 0 0 40px #ffd70099, 0 0 80px #ffd70044; }
          50%       { box-shadow: 0 0 0 4px #ffd700aa, 0 0 60px #ffd700cc, 0 0 120px #ffd70088; }
        }
      `}</style>
    </div>
  );
}
