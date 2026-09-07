"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/authContext";
import katex from "katex";
import "katex/dist/katex.min.css";
import TiltCard from "../TiltCard";


const RARITY_THEMES = {
  Common: {
    color: "#22d3ee",
    border: "1px solid rgba(34, 211, 238, 0.3)",
    glow: "rgba(34, 211, 238, 0.15)",
    bg: "radial-gradient(circle at 50% 50%, rgba(34, 211, 238, 0.08) 0%, rgba(8, 18, 42, 0.8) 100%)",
  },
  Rare: {
    color: "#a78bfa",
    border: "1px solid rgba(167, 139, 250, 0.4)",
    glow: "rgba(167, 139, 250, 0.25)",
    bg: "radial-gradient(circle at 50% 50%, rgba(167, 139, 250, 0.12) 0%, rgba(8, 18, 42, 0.8) 100%)",
  },
  Legendary: {
    color: "#f59e0b",
    border: "1px solid rgba(245, 158, 11, 0.5)",
    glow: "rgba(245, 158, 11, 0.35)",
    bg: "radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.15) 0%, rgba(8, 18, 42, 0.8) 100%)",
  }
};

export default function KnowledgeAlbum() {
  const { user } = useAuth();
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    if (!user) return;
    async function loadCollection() {
      try {
        const token = localStorage.getItem("token") || sessionStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const res = await fetch(`${API_BASE}/api/gacha/collection`, { headers });
        if (res.ok) {
          const data = await res.json();
          setCollection(data);
        }
      } catch (err) {
        console.error("Failed to load cards collection:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCollection();
  }, [user]);

  if (!user || loading) return null;

  function renderFormula(formula) {
    try {
      const html = katex.renderToString(formula, { throwOnError: false });
      return <div dangerouslySetInnerHTML={{ __html: html }} style={{ fontSize: 13.5, color: "white", textAlign: "center", margin: "14px 0" }} />;
    } catch {
      return <div style={{ fontSize: 12.5, color: "white", textAlign: "center", margin: "14px 0" }}>{formula}</div>;
    }
  }

  return (
    <div style={{ padding: "20px 0" }}>
      <h3 style={{ fontSize: 24, fontWeight: 900, color: "white", marginBottom: 6, display: "flex", alignItems: "center", gap: 10 }}>
        🎴 Album Thẻ Bài Tri Thức
      </h3>
      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 24 }}>
        Hoàn thành bài tập & mở khóa rương tri thức để sưu tầm trọn bộ công thức Toán học THPT.
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
        gap: 20
      }}>
        {collection.map((card, idx) => {
          const theme = RARITY_THEMES[card.rarity] || RARITY_THEMES.Common;
          
          if (card.owned) {
            return (
              <TiltCard
                key={idx}
                maxRotation={15}
                onClick={() => setActiveCard(card)}
                style={{
                  background: theme.bg,
                  border: theme.border,
                  borderRadius: 16,
                  aspectRatio: "1/1.45",
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: `0 10px 25px rgba(0,0,0,0.4), 0 0 15px ${theme.glow}`,
                  transition: "box-shadow 0.3s"
                }}
              >
                {/* Rarity Border Glow */}
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: `radial-gradient(circle at 10% 10%, ${theme.color}22 0%, transparent 60%)`,
                }} />

                {/* Top: Name & Rarity badge */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{
                      fontSize: 9, fontWeight: 900, letterSpacing: 0.6,
                      color: theme.color, textTransform: "uppercase",
                      background: `${theme.color}15`, border: `1px solid ${theme.color}35`,
                      borderRadius: 20, padding: "2px 8px"
                    }}>
                      {card.rarity}
                    </span>
                    {card.owned_count > 1 && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.45)" }}>
                        x{card.owned_count}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 800, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {card.name}
                  </div>
                </div>

                {/* Middle: Formula */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexGrow: 1 }}>
                  {renderFormula(card.formula)}
                </div>

                {/* Bottom: short category */}
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 700, textAlign: "right" }}>
                  Toán 10
                </div>
              </TiltCard>
            );
          }

          // Locked card state
          return (
            <div
              key={idx}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: 16,
                aspectRatio: "1/1.45",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
                opacity: 0.45
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{
                  fontSize: 9, fontWeight: 900, letterSpacing: 0.6,
                  color: "rgba(255,255,255,0.3)", textTransform: "uppercase",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20, padding: "2px 8px"
                }}>
                  {card.rarity}
                </span>
              </div>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                flexGrow: 1, gap: 12
              }}>
                <span style={{ fontSize: 24, opacity: 0.25 }}>🔒</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontWeight: 700 }}>
                  Chưa sở hữu
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Card Details Modal Overlay */}
      <AnimatePresence>
        {activeCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveCard(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 9999, padding: 20, backdropFilter: "blur(12px)"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 360,
                background: RARITY_THEMES[activeCard.rarity].bg,
                border: RARITY_THEMES[activeCard.rarity].border,
                borderRadius: 24, padding: 32,
                boxShadow: `0 30px 60px rgba(0,0,0,0.6), 0 0 40px ${RARITY_THEMES[activeCard.rarity].glow}`,
                position: "relative",
                display: "flex", flexDirection: "column", gap: 20
              }}
            >
              {/* Header card details */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{
                  fontSize: 10, fontWeight: 900, letterSpacing: 0.8,
                  color: RARITY_THEMES[activeCard.rarity].color, textTransform: "uppercase",
                  background: `${RARITY_THEMES[activeCard.rarity].color}15`,
                  border: `1px solid ${RARITY_THEMES[activeCard.rarity].color}35`,
                  borderRadius: 20, padding: "3px 10px"
                }}>
                  {activeCard.rarity} Card
                </span>
                <button
                  onClick={() => setActiveCard(null)}
                  style={{
                    background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                    fontSize: 20, cursor: "pointer"
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Title & info */}
              <div>
                <h4 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: "white" }}>
                  {activeCard.name}
                </h4>
                <div style={{ fontSize: 12.5, color: RARITY_THEMES[activeCard.rarity].color, fontWeight: 700, marginTop: 4 }}>
                  Môn học: Toán Học Lớp 10
                </div>
              </div>

              {/* Big formula rendering */}
              <div style={{
                background: "rgba(0,0,0,0.3)", borderRadius: 16,
                padding: "24px 16px", border: "1px solid rgba(255,255,255,0.03)",
                display: "flex", alignItems: "center", justifyContent: "center", minHeight: 90
              }}>
                {renderFormula(activeCard.formula)}
              </div>

              {/* Description */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>
                  Ý nghĩa & Lời giải
                </div>
                <p style={{ margin: 0, fontSize: 13.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.65 }}>
                  {activeCard.description}
                </p>
              </div>

              <button
                onClick={() => setActiveCard(null)}
                style={{
                  width: "100%", padding: "10px 0", borderRadius: 12, fontSize: 13,
                  fontWeight: 700, color: "white", cursor: "pointer",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  transition: "background 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              >
                Đóng album
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
