/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ── Mock MathMap data ──────────────────────────────────────────────────────
const MOCK_MATHMAPS = [
  {
    id: "mm001", title: "Phương trình bậc hai nâng cao", title_en: "Advanced Quadratic Equations",
    creator: "NguyenVanA", grade: "Lớp 11", difficulty_fmp: 7.8, plays: 14200, rating: 4.9,
    tags: ["#ĐạiSố11", "#PhuongTrinhBacHai", "#NangCao"],
    status: "ranked", question_count: 12, time_avg: 30, bgm: "Dramatic Theme",
    thumbnail_color: "linear-gradient(135deg, #0ea5e9, #6366f1)",
    icon: "📐",
  },
  {
    id: "mm002", title: "Hình học phẳng cơ bản", title_en: "Basic Plane Geometry",
    creator: "TranThiB", grade: "Lớp 10", difficulty_fmp: 4.2, plays: 9870, rating: 4.6,
    tags: ["#HinhHoc10", "#CoBan", "#TamGiac"],
    status: "ranked", question_count: 10, time_avg: 20, bgm: "Calm Study",
    thumbnail_color: "linear-gradient(135deg, #10b981, #059669)",
    icon: "📏",
  },
  {
    id: "mm003", title: "Đạo hàm & Ứng dụng", title_en: "Derivatives & Applications",
    creator: "LeVanC", grade: "Lớp 12", difficulty_fmp: 8.5, plays: 7340, rating: 4.7,
    tags: ["#GiaiTich12", "#DaoHam", "#CucTri", "#SieuNangCao"],
    status: "ranked", question_count: 15, time_avg: 45, bgm: "Epic Boss Battle",
    thumbnail_color: "linear-gradient(135deg, #f59e0b, #ef4444)",
    icon: "∫",
  },
  {
    id: "mm004", title: "Lượng giác - Tổng hợp", title_en: "Trigonometry Comprehensive",
    creator: "PhamThiD", grade: "Lớp 11", difficulty_fmp: 6.3, plays: 11560, rating: 4.4,
    tags: ["#LuongGiac11", "#SinCos", "#TongHop"],
    status: "ranked", question_count: 10, time_avg: 25, bgm: "Electronic Beat",
    thumbnail_color: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
    icon: "θ",
  },
  {
    id: "mm005", title: "Xác suất & Thống kê", title_en: "Probability & Statistics",
    creator: "HoangVanE", grade: "Lớp 12", difficulty_fmp: 5.1, plays: 6200, rating: 4.2,
    tags: ["#XacSuat12", "#ThongKe", "#TrungBinh"],
    status: "qualified", question_count: 8, time_avg: 20, bgm: "Chill Lofi",
    thumbnail_color: "linear-gradient(135deg, #ec4899, #db2777)",
    icon: "σ",
  },
  {
    id: "mm006", title: "Dãy số - Cấp số cộng & nhân", title_en: "Sequences: AP & GP",
    creator: "NguyenThiF", grade: "Lớp 11", difficulty_fmp: 6.8, plays: 8900, rating: 4.5,
    tags: ["#DaySo11", "#CapSoCong", "#CapSoNhan"],
    status: "ranked", question_count: 12, time_avg: 30, bgm: "Orchestral",
    thumbnail_color: "linear-gradient(135deg, #06b6d4, #0891b2)",
    icon: "∑",
  },
  {
    id: "mm007", title: "Mệnh đề & Tập hợp", title_en: "Logic & Set Theory",
    creator: "BuiVanG", grade: "Lớp 10", difficulty_fmp: 3.5, plays: 5600, rating: 4.0,
    tags: ["#MenhDe10", "#TapHop", "#CoBan"],
    status: "ranked", question_count: 8, time_avg: 15, bgm: "Pixel Game",
    thumbnail_color: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
    icon: "∈",
  },
  {
    id: "mm008", title: "Tích phân xác định", title_en: "Definite Integrals",
    creator: "NguyenVanA", grade: "Lớp 12", difficulty_fmp: 9.2, plays: 4100, rating: 4.8,
    tags: ["#GiaiTich12", "#TichPhan", "#SieuKho"],
    status: "ranked", question_count: 10, time_avg: 60, bgm: "Final Boss",
    thumbnail_color: "linear-gradient(135deg, #dc2626, #991b1b)",
    icon: "∮",
  },
];

const MOCK_LEADERBOARD = [
  { rank: 1, username: "MathGod_2k7", grade: "Lớp 12", score: 9840, accuracy: 98.2, combo: 156 },
  { rank: 2, username: "QuadraticKing", grade: "Lớp 11", score: 9120, accuracy: 95.6, combo: 134 },
  { rank: 3, username: "PiMaster", grade: "Lớp 12", score: 8870, accuracy: 93.1, combo: 128 },
  { rank: 4, username: "TrigWhiz", grade: "Lớp 11", score: 8540, accuracy: 91.7, combo: 119 },
  { rank: 5, username: "Sigma_Boy", grade: "Lớp 10", score: 8210, accuracy: 89.4, combo: 108 },
  { rank: 6, username: "Calculus_Pro", grade: "Lớp 12", score: 7980, accuracy: 87.2, combo: 99 },
  { rank: 7, username: "AlgebraQueen", grade: "Lớp 11", score: 7650, accuracy: 85.0, combo: 92 },
];

const GRADE_OPTIONS = ["Tất cả", "Lớp 10", "Lớp 11", "Lớp 12"];
const STATUS_OPTIONS = ["Tất cả", "ranked", "qualified", "pending"];
const SORT_OPTIONS = ["Lượt chơi", "Đánh giá", "Độ khó (Thấp→Cao)", "Độ khó (Cao→Thấp)", "Mới nhất"];

// ── Difficulty badge ───────────────────────────────────────────────────────
function DiffBadge({ fmp }) {
  const tier = fmp < 4 ? { label: "Easy", color: "#4ade80" }
    : fmp < 6 ? { label: "Normal", color: "#facc15" }
    : fmp < 8 ? { label: "Hard", color: "#f97316" }
    : { label: "Insane", color: "#ef4444" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: tier.color,
      background: tier.color + "22",
      border: `1px solid ${tier.color}55`,
      borderRadius: 4, padding: "2px 6px",
    }}>
      {tier.label} {fmp.toFixed(1)}★
    </span>
  );
}

// ── Star rating display ────────────────────────────────────────────────────
function StarRating({ rating }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ fontSize: 12, color: s <= Math.round(rating) ? "#fbbf24" : "#374151" }}>
          ★
        </span>
      ))}
      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginLeft: 4 }}>
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

// ── MathMap card (list item) ───────────────────────────────────────────────
function MathMapCard({ map, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const isActive = selected === map.id;

  return (
    <div
      onClick={() => onSelect(map.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "10px 14px",
        background: isActive
          ? "rgba(34,211,238,0.12)"
          : hovered ? "rgba(255,255,255,0.04)" : "transparent",
        borderLeft: isActive ? "3px solid #22d3ee" : "3px solid transparent",
        cursor: "pointer", transition: "all 0.15s",
        borderRadius: "0 8px 8px 0",
      }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 56, height: 56, borderRadius: 8,
        background: map.thumbnail_color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 22, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      }}>
        {map.icon}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 6, marginBottom: 3,
        }}>
          <span style={{ fontSize: 11, color: "#22d3ee", fontWeight: 700 }}>
            {map.status === "ranked" ? "RANKED" : map.status.toUpperCase()}
          </span>
          <DiffBadge fmp={map.difficulty_fmp} />
        </div>
        <div style={{
          fontSize: 13, fontWeight: 700, color: "white",
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          marginBottom: 2,
        }}>
          {map.title}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 3 }}>
          by <span style={{ color: "#93c5fd" }}>{map.creator}</span>
          {" · "}{map.grade}
          {" · "}{map.question_count} câu
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <StarRating rating={map.rating} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
            🎮 {map.plays.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tags (hidden if not selected) */}
      {isActive && (
        <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
          {map.tags.slice(0, 2).map(tag => (
            <span key={tag} style={{
              fontSize: 9, color: "#a78bfa",
              background: "rgba(167,139,250,0.12)",
              border: "1px solid rgba(167,139,250,0.25)",
              borderRadius: 4, padding: "1px 5px",
              whiteSpace: "nowrap",
            }}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function SingleplayerListing() {
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("Lượt chơi");
  const [selectedMap, setSelectedMap] = useState("mm001");
  const [lbScope, setLbScope] = useState("Global");
  const [showFilters, setShowFilters] = useState(false);

  const selectedMapData = MOCK_MATHMAPS.find(m => m.id === selectedMap);

  // Filter + sort
  const filteredMaps = MOCK_MATHMAPS
    .filter(m => {
      const q = search.toLowerCase();
      if (q && !m.title.toLowerCase().includes(q) && !m.creator.toLowerCase().includes(q) && !m.tags.some(t => t.toLowerCase().includes(q))) return false;
      if (gradeFilter !== "Tất cả" && m.grade !== gradeFilter) return false;
      if (statusFilter !== "Tất cả" && m.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Lượt chơi") return b.plays - a.plays;
      if (sortBy === "Đánh giá") return b.rating - a.rating;
      if (sortBy === "Độ khó (Thấp→Cao)") return a.difficulty_fmp - b.difficulty_fmp;
      if (sortBy === "Độ khó (Cao→Thấp)") return b.difficulty_fmp - a.difficulty_fmp;
      return 0;
    });

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a0a1a 100%)",
      display: "flex", flexDirection: "column",
    }}>
      {/* ─── HEADER ─── */}
      <header style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "14px 24px",
        background: "rgba(2,6,23,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(34,211,238,0.12)",
        flexWrap: "wrap",
      }}>
        <Link href="/mrm" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "white", letterSpacing: 2 }}>
            DUO<span style={{ color: "#22d3ee" }}>MATH</span>
          </span>
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
        <span style={{ fontSize: 14, color: "#22d3ee", fontWeight: 600 }}>
          🎯 Singleplayer — MathMap Listing
        </span>

        <div style={{ flex: 1 }} />

        {/* Search bar */}
        <div style={{ position: "relative", width: 280 }}>
          <input
            type="text"
            placeholder="🔍 Tìm MathMap, tác giả, tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "9px 14px 9px 36px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 10, color: "white", fontSize: 13,
              outline: "none",
            }}
          />
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.5 }}>🔍</span>
        </div>

        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "8px 16px", borderRadius: 8, fontSize: 13,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)", cursor: "pointer",
          }}>← Trang chủ</button>
        </Link>
      </header>

      {/* ─── FILTER BAR ─── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "10px 24px",
        background: "rgba(15,23,42,0.6)", borderBottom: "1px solid rgba(255,255,255,0.05)",
        flexWrap: "wrap",
      }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
          BỘ LỌC:
        </span>

        {/* Grade filter */}
        <div style={{ display: "flex", gap: 6 }}>
          {GRADE_OPTIONS.map(g => (
            <button key={g} onClick={() => setGradeFilter(g)} style={{
              padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              fontWeight: gradeFilter === g ? 700 : 400,
              background: gradeFilter === g ? "rgba(34,211,238,0.18)" : "rgba(255,255,255,0.04)",
              border: gradeFilter === g ? "1px solid rgba(34,211,238,0.45)" : "1px solid rgba(255,255,255,0.08)",
              color: gradeFilter === g ? "#22d3ee" : "rgba(255,255,255,0.55)",
              transition: "all 0.15s",
            }}>{g}</button>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.1)" }} />

        {/* Status filter */}
        <div style={{ display: "flex", gap: 6 }}>
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)} style={{
              padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
              fontWeight: statusFilter === s ? 700 : 400,
              background: statusFilter === s ? "rgba(167,139,250,0.18)" : "rgba(255,255,255,0.04)",
              border: statusFilter === s ? "1px solid rgba(167,139,250,0.45)" : "1px solid rgba(255,255,255,0.08)",
              color: statusFilter === s ? "#a78bfa" : "rgba(255,255,255,0.55)",
              transition: "all 0.15s",
            }}>{s === "Tất cả" ? "Tất cả" : s.charAt(0).toUpperCase() + s.slice(1)}</button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Sắp xếp:</span>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
            background: "rgba(15,23,42,0.9)", color: "white",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 6, padding: "5px 10px", fontSize: 12, cursor: "pointer",
          }}>
            {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          {filteredMaps.length} kết quả
        </span>
      </div>

      {/* ─── MAIN 2-COLUMN LAYOUT ─── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* LEFT: Detail panel (selected map) */}
        <div style={{
          width: 340, flexShrink: 0,
          background: "rgba(2,6,23,0.9)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          overflowY: "auto", display: "flex", flexDirection: "column",
        }}>
          {selectedMapData && (
            <>
              {/* Map hero thumbnail */}
              <div style={{
                height: 180, background: selectedMapData.thumbnail_color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 72, position: "relative",
              }}>
                {selectedMapData.icon}
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to bottom, transparent 40%, rgba(2,6,23,0.9) 100%)",
                }} />
                {/* Status badge */}
                <div style={{
                  position: "absolute", top: 12, left: 12,
                  background: selectedMapData.status === "ranked" ? "rgba(34,211,238,0.9)" : "rgba(251,191,36,0.9)",
                  color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4,
                }}>
                  {selectedMapData.status.toUpperCase()}
                </div>
              </div>

              {/* Map info */}
              <div style={{ padding: 16 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 4 }}>
                  {selectedMapData.title}
                </div>
                <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 12, fontStyle: "italic" }}>
                  {selectedMapData.title_en}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  <DiffBadge fmp={selectedMapData.difficulty_fmp} />
                  <span style={{ fontSize: 10, color: "#bae6fd", background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)", borderRadius: 4, padding: "2px 6px" }}>
                    {selectedMapData.grade}
                  </span>
                  <span style={{ fontSize: 10, color: "#d1fae5", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 4, padding: "2px 6px" }}>
                    {selectedMapData.question_count} câu
                  </span>
                </div>

                {/* Stats row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    ["by", selectedMapData.creator],
                    ["🎮 Plays", selectedMapData.plays.toLocaleString()],
                    ["⏱ Avg time", `${selectedMapData.time_avg}s/câu`],
                    ["🎵 BGM", selectedMapData.bgm],
                  ].map(([k, v]) => (
                    <div key={k} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "7px 10px" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{k}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: "white", marginTop: 1 }}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 16 }}>
                  {selectedMapData.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize: 10, color: "#a78bfa",
                      background: "rgba(167,139,250,0.1)",
                      border: "1px solid rgba(167,139,250,0.25)",
                      borderRadius: 5, padding: "3px 8px",
                    }}>{tag}</span>
                  ))}
                </div>

                {/* Rating */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <StarRating rating={selectedMapData.rating} />
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/mrm/singleplayer/${selectedMap}`} style={{ flex: 1, textDecoration: "none" }}>
                  <button style={{
                    width: "100%", padding: "12px 0",
                    background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
                    color: "#000", border: "none", borderRadius: 10,
                    fontSize: 14, fontWeight: 800, cursor: "pointer",
                    boxShadow: "0 4px 16px rgba(34,211,238,0.4)",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    ▶ Chơi ngay
                  </button>
                  </Link>
                  <button style={{
                    padding: "12px 14px",
                    background: "rgba(34,211,238,0.1)",
                    border: "1px solid rgba(34,211,238,0.3)",
                    color: "#22d3ee", borderRadius: 10,
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                    title="Download MathMap"
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,211,238,0.2)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(34,211,238,0.1)"; }}
                  >
                    ⬇
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* CENTER: Map list */}
        <div style={{
          flex: 1, overflowY: "auto",
          background: "rgba(5,10,20,0.6)",
        }}>
          {filteredMaps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Không tìm thấy MathMap nào</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Thử tìm kiếm với từ khóa khác</div>
            </div>
          ) : (
            <div style={{ padding: "8px 0" }}>
              {filteredMaps.map((map, i) => (
                <MathMapCard
                  key={map.id}
                  map={map}
                  selected={selectedMap}
                  onSelect={setSelectedMap}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Leaderboard */}
        <div style={{
          width: 300, flexShrink: 0,
          background: "rgba(2,6,23,0.9)",
          borderLeft: "1px solid rgba(255,255,255,0.06)",
          display: "flex", flexDirection: "column",
        }}>
          {/* LB Header */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 8 }}>
              🏆 Bảng xếp hạng
            </div>
            {selectedMapData && (
              <div style={{ fontSize: 11, color: "#22d3ee", marginBottom: 8, fontWeight: 600 }}>
                {selectedMapData.title}
              </div>
            )}
            {/* Scope toggle */}
            <div style={{ display: "flex", gap: 4 }}>
              {["Global", "Theo lớp", "Bạn bè"].map(s => (
                <button key={s} onClick={() => setLbScope(s)} style={{
                  flex: 1, padding: "5px 0", borderRadius: 6, fontSize: 10,
                  cursor: "pointer", fontWeight: lbScope === s ? 700 : 400,
                  background: lbScope === s ? "rgba(34,211,238,0.2)" : "rgba(255,255,255,0.04)",
                  border: lbScope === s ? "1px solid rgba(34,211,238,0.4)" : "1px solid rgba(255,255,255,0.08)",
                  color: lbScope === s ? "#22d3ee" : "rgba(255,255,255,0.5)",
                  transition: "all 0.15s",
                }}>{s}</button>
              ))}
            </div>
          </div>

          {/* LB Rows */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {MOCK_LEADERBOARD.map((entry, i) => {
              const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
              const rankColor = i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "rgba(255,255,255,0.4)";
              return (
                <div key={entry.rank} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  background: i < 3 ? `rgba(${i === 0 ? "251,191,36" : i === 1 ? "148,163,184" : "205,127,50"},0.04)` : "transparent",
                  transition: "background 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = i < 3
                      ? `rgba(${i === 0 ? "251,191,36" : i === 1 ? "148,163,184" : "205,127,50"},0.04)`
                      : "transparent";
                  }}
                >
                  <div style={{ width: 24, textAlign: "center" }}>
                    {medal
                      ? <span style={{ fontSize: 18 }}>{medal}</span>
                      : <span style={{ fontSize: 13, fontWeight: 700, color: rankColor }}>{entry.rank}</span>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 12, fontWeight: 700, color: "white",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {entry.username}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                      {entry.grade}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: i < 3 ? rankColor : "#22d3ee" }}>
                      {entry.score.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                      {entry.accuracy}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{
            padding: "10px 14px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "center",
          }}>
            🔄 Cập nhật theo thời gian thực · Anti-cheat Replay system
          </div>
        </div>
      </div>
    </div>
  );
}
