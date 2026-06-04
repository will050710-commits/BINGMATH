/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import Link from "next/link";

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_MAPS = [
  {
    id: "mm001", title: "Phương trình bậc hai nâng cao", title_en: "Advanced Quadratic Equations",
    creator: "NguyenVanA", grade: "Lớp 11", difficulty_fmp: 7.8,
    plays: 14200, rating: 4.9, favorites: 342,
    tags: ["#ĐạiSố11", "#PhuongTrinhBacHai", "#NangCao"],
    status: "ranked", question_count: 12, updated: "2026-06-02",
    thumbnail_color: "linear-gradient(135deg, #0ea5e9, #6366f1)", icon: "📐",
    description: "Tổng hợp các dạng phương trình bậc hai nâng cao từ đề thi THPT QG 3 năm gần nhất.",
  },
  {
    id: "mm002", title: "Hình học phẳng cơ bản", title_en: "Basic Plane Geometry",
    creator: "TranThiB", grade: "Lớp 10", difficulty_fmp: 4.2,
    plays: 9870, rating: 4.6, favorites: 201,
    tags: ["#HinhHoc10", "#CoBan", "#TamGiac"],
    status: "ranked", question_count: 10, updated: "2026-05-28",
    thumbnail_color: "linear-gradient(135deg, #10b981, #059669)", icon: "📏",
    description: "Bộ câu hỏi hình học phẳng từ cơ bản đến trung bình, phù hợp ôn thi cuối học kỳ.",
  },
  {
    id: "mm003", title: "Đạo hàm & Ứng dụng", title_en: "Derivatives & Applications",
    creator: "LeVanC", grade: "Lớp 12", difficulty_fmp: 8.5,
    plays: 7340, rating: 4.7, favorites: 289,
    tags: ["#GiaiTich12", "#DaoHam", "#CucTri", "#SieuNangCao"],
    status: "ranked", question_count: 15, updated: "2026-06-01",
    thumbnail_color: "linear-gradient(135deg, #f59e0b, #ef4444)", icon: "∫",
    description: "Đạo hàm, cực trị, tiếp tuyến và ứng dụng thực tế. Dành cho học sinh lớp 12 ôn thi ĐH.",
  },
  {
    id: "mm004", title: "Lượng giác - Tổng hợp", title_en: "Trigonometry Comprehensive",
    creator: "PhamThiD", grade: "Lớp 11", difficulty_fmp: 6.3,
    plays: 11560, rating: 4.4, favorites: 178,
    tags: ["#LuongGiac11", "#SinCos", "#TongHop"],
    status: "ranked", question_count: 10, updated: "2026-05-30",
    thumbnail_color: "linear-gradient(135deg, #8b5cf6, #6d28d9)", icon: "θ",
    description: "Tổng hợp công thức lượng giác, phương trình và bất phương trình lượng giác.",
  },
  {
    id: "mm005", title: "Xác suất & Thống kê", title_en: "Probability & Statistics",
    creator: "HoangVanE", grade: "Lớp 12", difficulty_fmp: 5.1,
    plays: 6200, rating: 4.2, favorites: 134,
    tags: ["#XacSuat12", "#ThongKe", "#TrungBinh"],
    status: "qualified", question_count: 8, updated: "2026-05-25",
    thumbnail_color: "linear-gradient(135deg, #ec4899, #db2777)", icon: "σ",
    description: "Xác suất cổ điển, thống kê mô tả và phân phối xác suất cơ bản.",
  },
  {
    id: "mm006", title: "Dãy số - Cấp số cộng & nhân", title_en: "Sequences: AP & GP",
    creator: "NguyenThiF", grade: "Lớp 11", difficulty_fmp: 6.8,
    plays: 8900, rating: 4.5, favorites: 220,
    tags: ["#DaySo11", "#CapSoCong", "#CapSoNhan"],
    status: "ranked", question_count: 12, updated: "2026-06-03",
    thumbnail_color: "linear-gradient(135deg, #06b6d4, #0891b2)", icon: "∑",
    description: "Cấp số cộng, cấp số nhân, tổng n số hạng và ứng dụng.",
  },
  {
    id: "mm007", title: "Mệnh đề & Tập hợp", title_en: "Logic & Set Theory",
    creator: "BuiVanG", grade: "Lớp 10", difficulty_fmp: 3.5,
    plays: 5600, rating: 4.0, favorites: 98,
    tags: ["#MenhDe10", "#TapHop", "#CoBan"],
    status: "ranked", question_count: 8, updated: "2026-05-20",
    thumbnail_color: "linear-gradient(135deg, #22d3ee, #0ea5e9)", icon: "∈",
    description: "Mệnh đề logic, tập hợp và các phép toán tập hợp cơ bản cho học sinh lớp 10.",
  },
  {
    id: "mm008", title: "Tích phân xác định", title_en: "Definite Integrals",
    creator: "NguyenVanA", grade: "Lớp 12", difficulty_fmp: 9.2,
    plays: 4100, rating: 4.8, favorites: 312,
    tags: ["#GiaiTich12", "#TichPhan", "#SieuKho"],
    status: "ranked", question_count: 10, updated: "2026-06-04",
    thumbnail_color: "linear-gradient(135deg, #dc2626, #991b1b)", icon: "∮",
    description: "Tích phân xác định, diện tích hình phẳng và ứng dụng. Cực khó — cho học sinh xuất sắc!",
  },
  {
    id: "mm009", title: "Hàm số bậc hai & đồ thị", title_en: "Quadratic Functions & Graphs",
    creator: "VuThiH", grade: "Lớp 10", difficulty_fmp: 5.5,
    plays: 7800, rating: 4.3, favorites: 156,
    tags: ["#HamSo10", "#DoThi", "#ParabolA"],
    status: "qualified", question_count: 9, updated: "2026-05-15",
    thumbnail_color: "linear-gradient(135deg, #84cc16, #65a30d)", icon: "∪",
    description: "Hàm số bậc hai, parabol, giá trị cực trị và đồ thị trong hệ tọa độ.",
  },
];

const GRADES = ["Tất cả", "Lớp 10", "Lớp 11", "Lớp 12"];
const STATUSES = ["Tất cả", "ranked", "qualified", "pending"];
const SORT_OPTIONS = ["Nổi bật", "Mới nhất", "Đánh giá cao", "Lượt chơi", "Độ khó ↑", "Độ khó ↓"];

// ── Difficulty badge ───────────────────────────────────────────────────────
function DiffBadge({ fmp }) {
  const tier = fmp < 4 ? { label: "Easy", color: "#4ade80", bg: "rgba(74,222,128,0.12)" }
    : fmp < 6 ? { label: "Normal", color: "#facc15", bg: "rgba(250,204,21,0.12)" }
    : fmp < 8 ? { label: "Hard", color: "#f97316", bg: "rgba(249,115,22,0.12)" }
    : { label: "Insane", color: "#ef4444", bg: "rgba(239,68,68,0.12)" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: tier.color, background: tier.bg,
      border: `1px solid ${tier.color}44`, borderRadius: 4, padding: "2px 7px",
    }}>
      {tier.label} ★{fmp.toFixed(1)}
    </span>
  );
}

// ── Status badge ───────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = {
    ranked:    { label: "RANKED",    color: "#22d3ee", bg: "rgba(34,211,238,0.12)" },
    qualified: { label: "QUALIFIED", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
    pending:   { label: "PENDING",   color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  }[status] || { label: status.toUpperCase(), color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.color}44`, borderRadius: 4, padding: "2px 7px", letterSpacing: 0.5,
    }}>
      {cfg.label}
    </span>
  );
}

// ── Star display ───────────────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 1 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ fontSize: 11, color: s <= Math.round(rating) ? "#fbbf24" : "#374151" }}>★</span>
      ))}
      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginLeft: 4 }}>{rating.toFixed(1)}</span>
    </span>
  );
}

// ── BMF Listing Row (osu! style) ───────────────────────────────────────────
function BMFMapRow({ map }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "stretch", gap: 0,
        marginBottom: 4,
        background: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.025)",
        border: hovered ? "1px solid rgba(34,211,238,0.2)" : "1px solid rgba(255,255,255,0.06)",
        borderRadius: 10, overflow: "hidden",
        transition: "all 0.18s",
        cursor: "pointer",
      }}
    >
      {/* Thumbnail strip */}
      <div style={{
        width: 80, flexShrink: 0,
        background: map.thumbnail_color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 28, position: "relative",
      }}>
        {map.icon}
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 24,
          background: "linear-gradient(to right, transparent, rgba(5,10,20,0.6))",
        }} />
      </div>

      {/* Info section */}
      <div style={{ flex: 1, padding: "10px 14px", minWidth: 0 }}>
        {/* Title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
          <StatusBadge status={map.status} />
          <DiffBadge fmp={map.difficulty_fmp} />
          <span style={{
            fontSize: 13, fontWeight: 700, color: "white",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {map.title}
          </span>
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: 11, color: "#93c5fd", marginBottom: 5, fontStyle: "italic" }}>
          {map.title_en}
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            mapped by <span style={{ color: "#7dd3fc", fontWeight: 600 }}>{map.creator}</span>
          </span>
          <span style={{ fontSize: 10, color: "#bae6fd", background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.2)", borderRadius: 4, padding: "1px 6px" }}>
            {map.grade}
          </span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>❓ {map.question_count} câu</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>🎮 {map.plays.toLocaleString()}</span>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>❤️ {map.favorites}</span>
          <Stars rating={map.rating} />
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>
            🕐 {map.updated}
          </span>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
          {map.tags.map(tag => (
            <span key={tag} style={{
              fontSize: 9, color: "#a78bfa",
              background: "rgba(167,139,250,0.08)",
              border: "1px solid rgba(167,139,250,0.2)",
              borderRadius: 4, padding: "1px 6px",
            }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Right actions */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, padding: "10px 16px", borderLeft: "1px solid rgba(255,255,255,0.05)", flexShrink: 0,
      }}>
        <button
          onClick={e => { e.stopPropagation(); }}
          title="Download MathMap"
          style={{
            width: 40, height: 40, borderRadius: 8,
            background: hovered ? "rgba(34,211,238,0.2)" : "rgba(34,211,238,0.08)",
            border: "1px solid rgba(34,211,238,0.3)",
            color: "#22d3ee", fontSize: 18, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,211,238,0.3)"; e.currentTarget.style.transform = "scale(1.1)"; }}
          onMouseLeave={e => { e.currentTarget.style.background = hovered ? "rgba(34,211,238,0.2)" : "rgba(34,211,238,0.08)"; e.currentTarget.style.transform = "scale(1)"; }}
        >
          ⬇
        </button>
        <Link href={`/mrm/singleplayer?map=${map.id}`} style={{ textDecoration: "none" }} onClick={e => e.stopPropagation()}>
          <button style={{
            width: 40, height: 40, borderRadius: 8,
            background: hovered ? "rgba(74,222,128,0.2)" : "rgba(74,222,128,0.08)",
            border: "1px solid rgba(74,222,128,0.3)",
            color: "#4ade80", fontSize: 16, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}
            title="Chơi ngay"
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(74,222,128,0.3)"; e.currentTarget.style.transform = "scale(1.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = hovered ? "rgba(74,222,128,0.2)" : "rgba(74,222,128,0.08)"; e.currentTarget.style.transform = "scale(1)"; }}
          >
            ▶
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── Main BMF Listing ───────────────────────────────────────────────────────
export default function BMFListing() {
  const [search, setSearch] = useState("");
  const [grade, setGrade] = useState("Tất cả");
  const [status, setStatus] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("Nổi bật");
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [page, setPage] = useState(1);

  const PER_PAGE = 6;

  const filtered = MOCK_MAPS
    .filter(m => {
      const q = search.toLowerCase();
      if (q && !m.title.toLowerCase().includes(q) && !m.creator.toLowerCase().includes(q) && !m.tags.some(t => t.toLowerCase().includes(q))) return false;
      if (grade !== "Tất cả" && m.grade !== grade) return false;
      if (status !== "Tất cả" && m.status !== status) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "Nổi bật") return (b.plays + b.favorites * 10) - (a.plays + a.favorites * 10);
      if (sortBy === "Mới nhất") return b.updated.localeCompare(a.updated);
      if (sortBy === "Đánh giá cao") return b.rating - a.rating;
      if (sortBy === "Lượt chơi") return b.plays - a.plays;
      if (sortBy === "Độ khó ↑") return a.difficulty_fmp - b.difficulty_fmp;
      if (sortBy === "Độ khó ↓") return b.difficulty_fmp - a.difficulty_fmp;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a0a1a 100%)",
      color: "white",
    }}>
      {/* ─── HEADER ─── */}
      <header style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "14px 32px",
        background: "rgba(2,6,23,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(251,191,36,0.12)",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "white", letterSpacing: 2 }}>
            DUO<span style={{ color: "#22d3ee" }}>MATH</span>
          </span>
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
        <span style={{ fontSize: 14, color: "#fbbf24", fontWeight: 700 }}>💬 Bilingual Math Forum</span>
        <div style={{ flex: 1 }} />
        <Link href="/mrm/creator" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "9px 18px", borderRadius: 9,
            background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
            border: "none", color: "white", fontWeight: 700, fontSize: 13, cursor: "pointer",
            boxShadow: "0 4px 12px rgba(167,139,250,0.35)",
          }}>
            + Đăng MathMap
          </button>
        </Link>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "9px 16px", borderRadius: 8, fontSize: 13,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
            color: "rgba(255,255,255,0.7)", cursor: "pointer",
          }}>← Trang chủ</button>
        </Link>
      </header>

      {/* ─── HERO BANNER ─── */}
      <div style={{
        padding: "28px 32px 20px",
        background: "linear-gradient(135deg, rgba(251,191,36,0.06), rgba(167,139,250,0.04), transparent)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <h1 style={{ fontSize: 26, fontWeight: 900, color: "white", marginBottom: 6 }}>
          📚 MathMap Listing
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", maxWidth: 600 }}>
          Kho bài toán cộng đồng song ngữ Anh-Việt · Tải về máy · Chơi Singleplayer · Đấu Rank
        </p>
      </div>

      {/* ─── SEARCH + FILTER BAR ─── */}
      <div style={{
        padding: "14px 32px",
        background: "rgba(5,10,20,0.7)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", flexDirection: "column", gap: 10,
      }}>
        {/* Search row */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: 500 }}>
            <input
              type="text"
              placeholder="🔍 Tìm theo tiêu đề, tác giả, tag..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: "100%", padding: "10px 14px 10px 38px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 10, color: "white", fontSize: 13, outline: "none",
              }}
              onFocus={e => { e.target.style.borderColor = "rgba(251,191,36,0.4)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.12)"; }}
            />
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.4 }}>🔍</span>
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
            padding: "9px 14px", background: "rgba(15,23,42,0.9)", color: "white",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 13, cursor: "pointer",
          }}>
            {SORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          <button onClick={() => setShowMoreFilters(v => !v)} style={{
            padding: "9px 16px", borderRadius: 8, cursor: "pointer",
            background: showMoreFilters ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.06)",
            border: showMoreFilters ? "1px solid rgba(251,191,36,0.4)" : "1px solid rgba(255,255,255,0.1)",
            color: showMoreFilters ? "#fbbf24" : "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 600,
            transition: "all 0.2s",
          }}>
            ⚙️ Bộ lọc {showMoreFilters ? "▲" : "▼"}
          </button>

          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>
            {filtered.length} kết quả
          </span>
        </div>

        {/* More filters */}
        {showMoreFilters && (
          <div style={{
            display: "flex", gap: 20, padding: "12px 0", flexWrap: "wrap",
            animation: "cardSlideIn 0.2s ease",
          }}>
            {/* Grade */}
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontWeight: 600 }}>KHỐI LỚP</div>
              <div style={{ display: "flex", gap: 6 }}>
                {GRADES.map(g => (
                  <button key={g} onClick={() => { setGrade(g); setPage(1); }} style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                    fontWeight: grade === g ? 700 : 400,
                    background: grade === g ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
                    border: grade === g ? "1px solid rgba(34,211,238,0.45)" : "1px solid rgba(255,255,255,0.08)",
                    color: grade === g ? "#22d3ee" : "rgba(255,255,255,0.55)",
                  }}>{g}</button>
                ))}
              </div>
            </div>

            {/* Status */}
            <div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontWeight: 600 }}>TRẠNG THÁI</div>
              <div style={{ display: "flex", gap: 6 }}>
                {STATUSES.map(s => (
                  <button key={s} onClick={() => { setStatus(s); setPage(1); }} style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                    fontWeight: status === s ? 700 : 400,
                    background: status === s ? "rgba(167,139,250,0.15)" : "rgba(255,255,255,0.04)",
                    border: status === s ? "1px solid rgba(167,139,250,0.45)" : "1px solid rgba(255,255,255,0.08)",
                    color: status === s ? "#a78bfa" : "rgba(255,255,255,0.55)",
                  }}>
                    {s === "Tất cả" ? "Tất cả" : s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── MAP LIST ─── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 32px" }}>
        {paginated.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 20px" }}>
            <div style={{ fontSize: 60, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>
              Không tìm thấy MathMap
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
              Thử xóa bộ lọc hoặc tìm kiếm với từ khóa khác
            </div>
          </div>
        ) : (
          <>
            {paginated.map(map => <BMFMapRow key={map.id} map={map} />)}

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 24 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                  padding: "8px 16px", borderRadius: 8, cursor: page === 1 ? "default" : "pointer",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: page === 1 ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)", fontSize: 13,
                }}>← Trước</button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} style={{
                    width: 36, height: 36, borderRadius: 8, cursor: "pointer",
                    fontWeight: p === page ? 700 : 400, fontSize: 13,
                    background: p === page ? "rgba(34,211,238,0.2)" : "rgba(255,255,255,0.04)",
                    border: p === page ? "1px solid rgba(34,211,238,0.45)" : "1px solid rgba(255,255,255,0.08)",
                    color: p === page ? "#22d3ee" : "rgba(255,255,255,0.55)",
                    transition: "all 0.15s",
                  }}>{p}</button>
                ))}

                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                  padding: "8px 16px", borderRadius: 8, cursor: page === totalPages ? "default" : "pointer",
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: page === totalPages ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.7)", fontSize: 13,
                }}>Sau →</button>
              </div>
            )}
          </>
        )}

        {/* Bottom CTA */}
        <div style={{
          marginTop: 40, padding: "24px", borderRadius: 16,
          background: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(34,211,238,0.05))",
          border: "1px solid rgba(167,139,250,0.15)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>
              🛠️ Muốn đóng góp cho cộng đồng?
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
              Tạo MathMap của riêng bạn và chia sẻ với hàng nghìn học sinh!
            </div>
          </div>
          <Link href="/mrm/creator" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "12px 24px", background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
              border: "none", color: "white", borderRadius: 10, fontWeight: 700, fontSize: 14,
              cursor: "pointer", boxShadow: "0 4px 16px rgba(139,92,246,0.4)", whiteSpace: "nowrap",
            }}>
              + Tạo MathMap ngay
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
