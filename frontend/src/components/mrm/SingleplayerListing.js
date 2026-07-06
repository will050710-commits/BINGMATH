 
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useMathMapStore } from "@/context/MathMapStore";
import { MOCK_MATHMAPS as MOCK_MAPS_QUESTIONS } from "@/data/mockMathmaps";


// ── Mock MathMap data ──────────────────────────────────────────────────────
const MOCK_MATHMAPS = [
  {
    id: "mm001", title: "Phương trình bậc hai nâng cao", title_en: "Advanced Quadratic Equations",
    creator: "NguyenVanA", grade: "Lớp 11", difficulty_fmp: 7.8, plays: 14200, rating: 4.9,
    tags: ["#ĐạiSố11", "#PhuongTrinhBacHai", "#NangCao"],
    status: "ranked", question_count: 12, time_avg: 30, bgm: "Dramatic Theme",
    thumbnail_color: "linear-gradient(135deg, #0ea5e9, #6366f1)", icon: "📐",
  },
  {
    id: "mm001b", title: "Phương trình bậc hai — Luyện tập", title_en: "Quadratic Equations — Practice",
    creator: "TranMinhK", grade: "Lớp 10", difficulty_fmp: 5.5, plays: 3890, rating: 4.3,
    tags: ["#ĐạiSố10", "#PhuongTrinhBacHai", "#TrungBinh"],
    status: "ranked", question_count: 5, time_avg: 25, bgm: "Electronic Beat",
    thumbnail_color: "linear-gradient(135deg, #38bdf8, #818cf8)", icon: "📐",
  },
  {
    id: "mm001c", title: "Hệ số Vieta & Phương trình bậc hai", title_en: "Vieta's Formulas & Quadratic",
    creator: "LePhuocH", grade: "Lớp 11", difficulty_fmp: 8.2, plays: 2100, rating: 4.7,
    tags: ["#ĐạiSố11", "#Vieta", "#NangCao"],
    status: "ranked", question_count: 5, time_avg: 40, bgm: "Boss Battle",
    thumbnail_color: "linear-gradient(135deg, #1d4ed8, #7c3aed)", icon: "📐",
  },
  {
    id: "mm002", title: "Hình học phẳng cơ bản", title_en: "Basic Plane Geometry",
    creator: "TranThiB", grade: "Lớp 10", difficulty_fmp: 4.2, plays: 9870, rating: 4.6,
    tags: ["#HinhHoc10", "#CoBan", "#TamGiac"],
    status: "ranked", question_count: 10, time_avg: 20, bgm: "Calm Study",
    thumbnail_color: "linear-gradient(135deg, #10b981, #059669)", icon: "📏",
  },
  {
    id: "mm002b", title: "Tam giác và các đường đặc biệt", title_en: "Triangles & Special Lines",
    creator: "VoThiL", grade: "Lớp 10", difficulty_fmp: 5.8, plays: 4670, rating: 4.5,
    tags: ["#HinhHoc10", "#TamGiac", "#DuongTrungTuyen"],
    status: "ranked", question_count: 5, time_avg: 25, bgm: "Chill Lofi",
    thumbnail_color: "linear-gradient(135deg, #34d399, #10b981)", icon: "📏",
  },
  {
    id: "mm002c", title: "Tứ giác và hình học phẳng", title_en: "Quadrilaterals & Plane Geometry",
    creator: "NguyenTuanM", grade: "Lớp 10", difficulty_fmp: 4.8, plays: 5120, rating: 4.4,
    tags: ["#HinhHoc10", "#TuGiac", "#HinhBinhHanh"],
    status: "qualified", question_count: 5, time_avg: 20, bgm: "Calm Study",
    thumbnail_color: "linear-gradient(135deg, #6ee7b7, #34d399)", icon: "📏",
  },
  {
    id: "mm003", title: "Đạo hàm & Ứng dụng", title_en: "Derivatives & Applications",
    creator: "LeVanC", grade: "Lớp 12", difficulty_fmp: 8.5, plays: 7340, rating: 4.7,
    tags: ["#GiaiTich12", "#DaoHam", "#CucTri", "#SieuNangCao"],
    status: "ranked", question_count: 15, time_avg: 45, bgm: "Epic Boss Battle",
    thumbnail_color: "linear-gradient(135deg, #f59e0b, #ef4444)", icon: "∫",
  },
  {
    id: "mm003b", title: "Cực trị hàm số", title_en: "Extrema of Functions",
    creator: "DinhAnhN", grade: "Lớp 12", difficulty_fmp: 7.5, plays: 3280, rating: 4.6,
    tags: ["#GiaiTich12", "#CucTri", "#BangBienThien"],
    status: "ranked", question_count: 5, time_avg: 40, bgm: "Electronic Beat",
    thumbnail_color: "linear-gradient(135deg, #fbbf24, #f97316)", icon: "∫",
  },
  {
    id: "mm003c", title: "Đạo hàm hàm hợp", title_en: "Chain Rule & Composite Functions",
    creator: "TrinhBaO", grade: "Lớp 12", difficulty_fmp: 9.0, plays: 1950, rating: 4.8,
    tags: ["#GiaiTich12", "#HamHop", "#SieuKho"],
    status: "ranked", question_count: 5, time_avg: 50, bgm: "Boss Battle",
    thumbnail_color: "linear-gradient(135deg, #dc2626, #f59e0b)", icon: "∫",
  },
  {
    id: "mm004", title: "Lượng giác - Tổng hợp", title_en: "Trigonometry Comprehensive",
    creator: "PhamThiD", grade: "Lớp 11", difficulty_fmp: 6.3, plays: 11560, rating: 4.4,
    tags: ["#LuongGiac11", "#SinCos", "#TongHop"],
    status: "ranked", question_count: 10, time_avg: 25, bgm: "Electronic Beat",
    thumbnail_color: "linear-gradient(135deg, #8b5cf6, #6d28d9)", icon: "θ",
  },
  {
    id: "mm004b", title: "Phương trình lượng giác cơ bản", title_en: "Basic Trigonometric Equations",
    creator: "PhamQuynhP", grade: "Lớp 11", difficulty_fmp: 6.9, plays: 5870, rating: 4.5,
    tags: ["#LuongGiac11", "#PhuongTrinh", "#TrungBinh"],
    status: "ranked", question_count: 5, time_avg: 30, bgm: "Dramatic Theme",
    thumbnail_color: "linear-gradient(135deg, #a78bfa, #7c3aed)", icon: "θ",
  },
  {
    id: "mm004c", title: "Công thức lượng giác nâng cao", title_en: "Advanced Trigonometric Formulas",
    creator: "HoangMinhQ", grade: "Lớp 11", difficulty_fmp: 8.0, plays: 3100, rating: 4.6,
    tags: ["#LuongGiac11", "#CongThuc", "#NangCao"],
    status: "ranked", question_count: 5, time_avg: 45, bgm: "Electronic Beat",
    thumbnail_color: "linear-gradient(135deg, #c4b5fd, #8b5cf6)", icon: "θ",
  },
  {
    id: "mm005", title: "Xác suất & Thống kê", title_en: "Probability & Statistics",
    creator: "HoangVanE", grade: "Lớp 12", difficulty_fmp: 5.1, plays: 6200, rating: 4.2,
    tags: ["#XacSuat12", "#ThongKe", "#TrungBinh"],
    status: "qualified", question_count: 8, time_avg: 20, bgm: "Chill Lofi",
    thumbnail_color: "linear-gradient(135deg, #ec4899, #db2777)", icon: "σ",
  },
  {
    id: "mm005b", title: "Xác suất có điều kiện", title_en: "Conditional Probability",
    creator: "LeThanhR", grade: "Lớp 12", difficulty_fmp: 6.5, plays: 2980, rating: 4.3,
    tags: ["#XacSuat12", "#CoĐieuKien", "#TrungBinh"],
    status: "qualified", question_count: 5, time_avg: 30, bgm: "Calm Study",
    thumbnail_color: "linear-gradient(135deg, #f472b6, #ec4899)", icon: "σ",
  },
  {
    id: "mm005c", title: "Chỉnh hợp, Tổ hợp & Hoán vị", title_en: "Permutations & Combinations",
    creator: "VuHoaS", grade: "Lớp 11", difficulty_fmp: 5.8, plays: 4540, rating: 4.4,
    tags: ["#XacSuat11", "#ToHop", "#HoanVi"],
    status: "ranked", question_count: 5, time_avg: 25, bgm: "Electronic Beat",
    thumbnail_color: "linear-gradient(135deg, #fb7185, #f43f5e)", icon: "σ",
  },
  {
    id: "mm006", title: "Dãy số - Cấp số cộng & nhân", title_en: "Sequences: AP & GP",
    creator: "NguyenThiF", grade: "Lớp 11", difficulty_fmp: 6.8, plays: 8900, rating: 4.5,
    tags: ["#DaySo11", "#CapSoCong", "#CapSoNhan"],
    status: "ranked", question_count: 12, time_avg: 30, bgm: "Orchestral",
    thumbnail_color: "linear-gradient(135deg, #06b6d4, #0891b2)", icon: "∑",
  },
  {
    id: "mm006b", title: "Tổng cấp số và ứng dụng", title_en: "Sum of Series & Applications",
    creator: "BuiKhanhT", grade: "Lớp 11", difficulty_fmp: 7.2, plays: 3650, rating: 4.5,
    tags: ["#DaySo11", "#TongCapSo", "#TrungBinh"],
    status: "ranked", question_count: 5, time_avg: 35, bgm: "Calm Study",
    thumbnail_color: "linear-gradient(135deg, #22d3ee, #06b6d4)", icon: "∑",
  },
  {
    id: "mm006c", title: "Giới hạn dãy số", title_en: "Limits of Sequences",
    creator: "NguyenKhoa", grade: "Lớp 12", difficulty_fmp: 8.8, plays: 2100, rating: 4.7,
    tags: ["#GiaiTich12", "#GioiHan", "#NangCao"],
    status: "ranked", question_count: 5, time_avg: 50, bgm: "Boss Battle",
    thumbnail_color: "linear-gradient(135deg, #0284c7, #0ea5e9)", icon: "∑",
  },
  {
    id: "mm007", title: "Mệnh đề & Tập hợp", title_en: "Logic & Set Theory",
    creator: "BuiVanG", grade: "Lớp 10", difficulty_fmp: 3.5, plays: 5600, rating: 4.0,
    tags: ["#MenhDe10", "#TapHop", "#CoBan"],
    status: "ranked", question_count: 8, time_avg: 15, bgm: "Pixel Game",
    thumbnail_color: "linear-gradient(135deg, #22d3ee, #0ea5e9)", icon: "∈",
  },
  {
    id: "mm007b", title: "Logic mệnh đề — Phép suy luận", title_en: "Propositional Logic & Inference",
    creator: "TranVanU", grade: "Lớp 10", difficulty_fmp: 4.0, plays: 4320, rating: 4.1,
    tags: ["#MenhDe10", "#LogicToHoc", "#CoBan"],
    status: "ranked", question_count: 5, time_avg: 20, bgm: "Calm Study",
    thumbnail_color: "linear-gradient(135deg, #67e8f9, #22d3ee)", icon: "∈",
  },
  {
    id: "mm007c", title: "Tập hợp số và quan hệ", title_en: "Number Sets & Relations",
    creator: "LyThiV", grade: "Lớp 10", difficulty_fmp: 3.8, plays: 5940, rating: 4.0,
    tags: ["#TapHop10", "#SoHoc", "#CoBan"],
    status: "qualified", question_count: 5, time_avg: 15, bgm: "Pixel Game",
    thumbnail_color: "linear-gradient(135deg, #a5f3fc, #22d3ee)", icon: "∈",
  },
  {
    id: "mm008", title: "Tích phân xác định", title_en: "Definite Integrals",
    creator: "NguyenVanA", grade: "Lớp 12", difficulty_fmp: 9.2, plays: 4100, rating: 4.8,
    tags: ["#GiaiTich12", "#TichPhan", "#SieuKho"],
    status: "ranked", question_count: 10, time_avg: 60, bgm: "Final Boss",
    thumbnail_color: "linear-gradient(135deg, #dc2626, #991b1b)", icon: "∮",
  },
  {
    id: "mm008b", title: "Tích phân — Phương pháp tính", title_en: "Integration — Techniques",
    creator: "TranDucW", grade: "Lớp 12", difficulty_fmp: 9.5, plays: 1680, rating: 4.9,
    tags: ["#GiaiTich12", "#TichPhan", "#PhuongPhap"],
    status: "ranked", question_count: 5, time_avg: 60, bgm: "Final Boss",
    thumbnail_color: "linear-gradient(135deg, #b91c1c, #dc2626)", icon: "∮",
  },
  {
    id: "mm008c", title: "Ứng dụng tích phân", title_en: "Applications of Integration",
    creator: "PhanDangX", grade: "Lớp 12", difficulty_fmp: 9.8, plays: 1230, rating: 4.9,
    tags: ["#GiaiTich12", "#UngDungTichPhan", "#SieuKho"],
    status: "ranked", question_count: 5, time_avg: 60, bgm: "Final Boss",
    thumbnail_color: "linear-gradient(135deg, #7f1d1d, #dc2626)", icon: "∮",
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
const getDiffColor = (fmp) => {
  if (fmp < 4) return "#a3e635"; // Easy - Lime green
  if (fmp < 6) return "#facc15"; // Normal - Vibrant yellow
  if (fmp < 8) return "#f97316"; // Hard - Warm amber/orange
  return "#ff66aa"; // Insane - Intense neon pink/magenta
};

function DiffBadge({ fmp }) {
  const color = getDiffColor(fmp);
  const label = fmp < 4 ? "Easy" : fmp < 6 ? "Normal" : fmp < 8 ? "Hard" : "Insane";
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, color: color,
      background: color + "1a",
      border: `1px solid ${color}44`,
      borderRadius: 4, padding: "2px 6px",
      textTransform: "uppercase",
      letterSpacing: 0.5
    }}>
      {label} {fmp.toFixed(1)}★
    </span>
  );
}

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

function MathMapCard({ map, selected, onSelect }) {
  const [hovered, setHovered] = useState(false);
  const isActive = selected === map.id;
  const diffColor = getDiffColor(map.difficulty_fmp);

  return (
    <div
      id={`map-card-${map.id}`}
      onClick={() => onSelect(map.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 18px",
        background: isActive
          ? `linear-gradient(90deg, ${diffColor}22 0%, rgba(15, 15, 30, 0.85) 100%)`
          : hovered ? "rgba(255,255,255,0.06)" : "rgba(10, 10, 24, 0.65)",
        borderLeft: `6px solid ${isActive ? diffColor : "transparent"}`,
        cursor: "pointer", transition: "all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)",
        borderRadius: "0 12px 12px 0",
        transform: isActive
          ? "skewX(-5deg) scale(1.04) translateX(-8px)"
          : hovered ? "skewX(-5deg) translateX(4px)" : "skewX(-5deg)",
        border: `1px solid ${isActive ? diffColor : "rgba(255, 255, 255, 0.05)"}`,
        boxShadow: isActive
          ? `0 0 18px ${diffColor}55, 0 4px 15px rgba(0,0,0,0.5)`
          : hovered ? "0 4px 12px rgba(0,0,0,0.3)" : "0 2px 6px rgba(0,0,0,0.3)",
        marginBottom: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", transform: "skewX(5deg)" }}>
        {/* Thumbnail */}
        <div style={{
          width: 48, height: 48, borderRadius: 10,
          background: `linear-gradient(135deg, ${diffColor} 0%, rgba(10, 10, 24, 0.85) 100%)`,
          border: `1px solid ${diffColor}aa`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, flexShrink: 0, boxShadow: `0 2px 8px ${diffColor}33`,
        }}>
          {map.icon}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 6, marginBottom: 3,
          }}>
            <span style={{ fontSize: 10, color: isActive ? diffColor : "#22d3ee", fontWeight: 800, letterSpacing: 0.5 }}>
              {map.status === "ranked" ? "RANKED" : map.status.toUpperCase()}
            </span>
            <DiffBadge fmp={map.difficulty_fmp} />
          </div>
          <div style={{
            fontSize: 13.5, fontWeight: 800, color: "white",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            marginBottom: 2,
          }}>
            {map.title}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 3 }}>
            by <span style={{ color: "#a5b4fc", fontWeight: 600 }}>{map.creator}</span>
            {" · "}{map.grade}
            {" · "}{map.question_count} câu
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <StarRating rating={map.rating} />
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>
              🎮 {map.plays.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tags (hidden if not selected) */}
        {isActive && (
          <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end", flexShrink: 0 }}>
            {map.tags.slice(0, 2).map(tag => (
              <span key={tag} style={{
                fontSize: 9, color: "#a5b4fc",
                background: "rgba(167,139,250,0.15)",
                border: "1px solid rgba(167,139,250,0.3)",
                borderRadius: 4, padding: "2px 6px",
                whiteSpace: "nowrap",
                fontWeight: 700
              }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SingleplayerListing() {
  const { getLeaderboardForMap, getPublicMaps, submitMap, hydrated } = useMathMapStore();
  const [search, setSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("Lượt chơi");
  const [selectedMap, setSelectedMap] = useState("mm001");
  const [lbScope, setLbScope] = useState("Global");
  const [showFilters, setShowFilters] = useState(false);
  const [bgOpacity, setBgOpacity] = useState(30); // 0-100, default 30%

  const handleDownloadMap = (map) => {
    if (!map) return;
    try {
      let fullMap = { ...map };
      // If it's a seed map and has no questions, retrieve questions from mock database
      if (!fullMap.questions || fullMap.questions.length === 0) {
        const mockMap = MOCK_MAPS_QUESTIONS[map.id];
        if (mockMap && mockMap.questions) {
          fullMap.questions = mockMap.questions.map((q, idx) => {
            const correctLetter = ['a', 'b', 'c', 'd'][q.correct] || 'a';
            const mappedOptions = Array.isArray(q.options)
              ? q.options.map((optStr, i) => ({
                  id: ['a', 'b', 'c', 'd'][i],
                  text_vi: optStr,
                  text_en: ''
                }))
              : [];
            return {
              id: q.id || `q-${idx}`,
              type: q.type || 'multiple_choice',
              content_vi: q.text || '',
              content_en: '',
              options: mappedOptions,
              correct_answer: correctLetter,
              explanation_vi: q.explain || '',
              points: q.points || 100,
              time_seconds: q.timeLimit || 30
            };
          });
        }
      }
      
      const jsonString = JSON.stringify(fullMap, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${map.title.replace(/[^a-zA-Z0-9\s]/g, "").replace(/\s+/g, "_")}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Lỗi khi tải bản đồ: " + err.message);
    }
  };

  const handleImportMap = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const rawData = JSON.parse(event.target.result);
        if (!rawData.title || !rawData.grade || !Array.isArray(rawData.questions)) {
          alert("File JSON không hợp lệ. Bản đồ phải có title, grade và questions!");
          return;
        }

        const result = submitMap(rawData);
        if (result.ok) {
          alert(`Đã nhập thành công MathMap: "${rawData.title}"!`);
          setSelectedMap(result.id);
        } else {
          alert("Lỗi khi nhập bản đồ: " + result.error);
        }
      } catch (err) {
        alert("Lỗi khi đọc file: " + err.message);
      }
    };
    reader.readAsText(file);
  };


  const currentMaps = hydrated ? getPublicMaps() : MOCK_MATHMAPS;
  const selectedMapData = currentMaps.find(m => m.id === selectedMap);

  // Filter + sort
  const filteredMaps = currentMaps
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === "INPUT" || activeEl.tagName === "TEXTAREA" || activeEl.isContentEditable)) {
        return;
      }

      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        e.preventDefault();
        
        const currentIndex = filteredMaps.findIndex(m => m.id === selectedMap);
        if (currentIndex === -1) return;

        let nextIndex = currentIndex;
        if (e.key === "ArrowUp" && currentIndex > 0) {
          nextIndex = currentIndex - 1;
        } else if (e.key === "ArrowDown" && currentIndex < filteredMaps.length - 1) {
          nextIndex = currentIndex + 1;
        }

        if (nextIndex !== currentIndex) {
          const nextMap = filteredMaps[nextIndex];
          setSelectedMap(nextMap.id);

          setTimeout(() => {
            const cardEl = document.getElementById(`map-card-${nextMap.id}`);
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
          }, 30);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredMaps, selectedMap]);

  const bgStyle = selectedMapData
    ? (selectedMapData.bg_image || selectedMapData.background_image
        ? { backgroundImage: `url(${selectedMapData.bg_image || selectedMapData.background_image})`, backgroundSize: "cover", backgroundPosition: "center" }
        : { background: selectedMapData.thumbnail_color })
    : {};

  return (
    <div style={{
      width: "100%", height: "100vh",
      background: "#050508",
      display: "flex", flexDirection: "column",
      overflow: "hidden",
      position: "relative",
      fontFamily: "'Exo 2', sans-serif",
    }}>
      {/* Blurred background image layer matching selected map */}
      <div style={{
        position: "absolute",
        inset: 0,
        ...bgStyle,
        opacity: bgOpacity / 100,
        filter: "blur(12px) brightness(0.45)",
        transition: "background-image 0.7s ease-in-out, background 0.7s ease-in-out, filter 0.7s, opacity 0.3s",
        zIndex: 0,
        pointerEvents: "none",
      }} />

      {/* Gradient Overlay for depth */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "linear-gradient(135deg, #080810 0%, rgba(13, 17, 29, 0.88) 50%, rgba(18, 10, 26, 0.94) 100%)",
        zIndex: 1,
        pointerEvents: "none",
      }} />

      {/* ─── HEADER ─── */}
      <header style={{
        display: "flex", alignItems: "center", gap: 16,
        padding: "14px 24px",
        background: "rgba(2,6,23,0.8)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(34,211,238,0.12)",
        flexWrap: "wrap",
        position: "relative",
        zIndex: 10,
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

        {/* Import JSON Map */}
        <div style={{ display: "inline-block" }}>
          <input
            type="file"
            accept=".json"
            id="import-map-file-listing"
            onChange={handleImportMap}
            style={{ display: "none" }}
          />
          <button
            onClick={() => document.getElementById("import-map-file-listing").click()}
            style={{
              padding: "8px 16px", borderRadius: 8, fontSize: 13,
              background: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
              border: "none", color: "white", cursor: "pointer",
              fontWeight: 700,
            }}
          >
            📥 Nhập JSON Map
          </button>
        </div>

        <Link href="/mrm/settings" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "8px 14px", borderRadius: 8, fontSize: 13,
            background: "rgba(167,139,250,0.08)",
            border: "1px solid rgba(167,139,250,0.25)",
            color: "#a78bfa", cursor: "pointer",
            display: "flex", alignItems: "center", gap: 5,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(167,139,250,0.16)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(167,139,250,0.08)"}
          >⚙️ Keybinds</button>
        </Link>

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
        position: "relative",
        zIndex: 9,
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
      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative", zIndex: 8 }}>

        {/* LEFT COLUMN: Map details (Top) & Leaderboard (Bottom) */}
        <div className="no-scrollbar" style={{
          width: 380, flexShrink: 0,
          background: "rgba(2,6,23,0.92)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          display: "flex", flexDirection: "column",
          height: "100%",
          overflow: "hidden",
        }}>
          {/* Top part: Map details */}
          <div className="no-scrollbar" style={{
            flex: "0 0 auto",
            maxHeight: "42%",
            overflowY: "auto",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}>
            {selectedMapData && (
              <>
                {/* Map hero thumbnail */}
                <div style={{
                  height: 160,
                  background: `linear-gradient(135deg, ${getDiffColor(selectedMapData.difficulty_fmp)}bb 0%, #1a0b2e 60%, #0e1017 100%)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 72, position: "relative",
                  borderBottom: `2px solid ${getDiffColor(selectedMapData.difficulty_fmp)}55`,
                }}>
                  <span style={{
                    zIndex: 2,
                    textShadow: `0 0 20px ${getDiffColor(selectedMapData.difficulty_fmp)}, 0 0 40px rgba(255, 255, 255, 0.4)`,
                    color: "white",
                    fontWeight: 900,
                  }}>
                    {selectedMapData.icon}
                  </span>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(to bottom, transparent 30%, rgba(2,6,23,0.92) 100%)",
                    zIndex: 1,
                  }} />
                  {/* Status badge */}
                  <div style={{
                    position: "absolute", top: 12, left: 12,
                    background: selectedMapData.status === "ranked" ? "rgba(34,211,238,0.9)" : "rgba(251,191,36,0.9)",
                    color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 4,
                    zIndex: 3,
                  }}>
                    {selectedMapData.status.toUpperCase()}
                  </div>
                </div>

                {/* Map info */}
                <div style={{ padding: "0 16px 16px 16px" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 2 }}>
                    {selectedMapData.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#93c5fd", marginBottom: 10, fontStyle: "italic" }}>
                    {selectedMapData.title_en}
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                    <DiffBadge fmp={selectedMapData.difficulty_fmp} />
                    <span style={{ fontSize: 10, color: "#bae6fd", background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)", borderRadius: 4, padding: "2px 6px" }}>
                      {selectedMapData.grade}
                    </span>
                    <span style={{ fontSize: 10, color: "#d1fae5", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 4, padding: "2px 6px" }}>
                      {selectedMapData.question_count} câu
                    </span>
                  </div>

                  {/* Stats row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                    {[
                      ["by", selectedMapData.creator],
                      ["🎮 Plays", selectedMapData.plays.toLocaleString()],
                      ["⏱ Avg time", `${selectedMapData.time_avg}s/câu`],
                      ["🎵 BGM", selectedMapData.bgm],
                    ].map(([k, v]) => (
                      <div key={k} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "6px 8px" }}>
                        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>{k}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "white", marginTop: 1 }}>{v}</div>
                      </div>
                    ))}
                  </div>

                  {/* Tags & Rating */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {selectedMapData.tags.slice(0, 2).map(tag => (
                        <span key={tag} style={{
                          fontSize: 9, color: "#a78bfa",
                          background: "rgba(167,139,250,0.1)",
                          border: "1px solid rgba(167,139,250,0.25)",
                          borderRadius: 4, padding: "2px 6px",
                        }}>{tag}</span>
                      ))}
                    </div>
                    <StarRating rating={selectedMapData.rating} />
                  </div>

                  {/* ── osu!-style Background Dim Slider ── */}
                  <div style={{
                    margin: "0 0 12px 0",
                    padding: "12px 14px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 10,
                  }}>
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13 }}>🌫️</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.7)", letterSpacing: 0.3 }}>
                          Background Dim
                        </span>
                      </div>
                      <span style={{
                        fontSize: 13, fontWeight: 900,
                        color: bgOpacity > 60 ? "#f87171" : bgOpacity > 30 ? "#fbbf24" : "#4ade80",
                        background: bgOpacity > 60 ? "rgba(248,113,113,0.12)" : bgOpacity > 30 ? "rgba(251,191,36,0.12)" : "rgba(74,222,128,0.12)",
                        border: `1px solid ${bgOpacity > 60 ? "rgba(248,113,113,0.3)" : bgOpacity > 30 ? "rgba(251,191,36,0.3)" : "rgba(74,222,128,0.3)"}`,
                        borderRadius: 6, padding: "2px 8px", minWidth: 40, textAlign: "center",
                      }}>
                        {bgOpacity}%
                      </span>
                    </div>

                    {/* Live preview strip */}
                    <div style={{
                      width: "100%", height: 40, borderRadius: 8, marginBottom: 10,
                      overflow: "hidden", position: "relative",
                      background: selectedMapData.thumbnail_color,
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}>
                      {/* Dim overlay */}
                      <div style={{
                        position: "absolute", inset: 0,
                        background: `rgba(0,0,0,${bgOpacity / 100})`,
                        transition: "background 0.1s",
                      }} />
                      {/* Icon + label */}
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "0 12px",
                      }}>
                        <span style={{
                          fontSize: 18,
                          opacity: Math.max(0.15, 1 - bgOpacity / 100),
                          transition: "opacity 0.1s",
                        }}>{selectedMapData.icon}</span>
                        <span style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
                          color: `rgba(255,255,255,${Math.max(0.2, 1 - bgOpacity / 130)})`,
                        }}>PREVIEW</span>
                      </div>
                    </div>

                    {/* Slider */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", minWidth: 14 }}>0</span>
                      <div style={{ flex: 1, position: "relative" }}>
                        <input
                          type="range" min={0} max={100} value={bgOpacity}
                          onChange={e => setBgOpacity(Number(e.target.value))}
                          style={{
                            width: "100%", cursor: "pointer",
                            accentColor: bgOpacity > 60 ? "#f87171" : bgOpacity > 30 ? "#fbbf24" : "#4ade80",
                            height: 4,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", minWidth: 22 }}>100</span>
                    </div>

                    {/* Quick presets */}
                    <div style={{ display: "flex", gap: 5, marginTop: 8, justifyContent: "center" }}>
                      {[[0,"Off","#4ade80"],[25,"25%","#86efac"],[50,"50%","#fbbf24"],[75,"75%","#fb923c"],[100,"100%","#f87171"]].map(([v,label,color]) => (
                        <button
                          key={v}
                          onClick={() => setBgOpacity(v)}
                          style={{
                            flex: 1, padding: "3px 0", borderRadius: 5, fontSize: 9, fontWeight: 700,
                            cursor: "pointer",
                            background: bgOpacity === v ? `${color}22` : "rgba(255,255,255,0.04)",
                            border: `1px solid ${bgOpacity === v ? color : "rgba(255,255,255,0.08)"}`,
                            color: bgOpacity === v ? color : "rgba(255,255,255,0.4)",
                            transition: "all 0.15s",
                          }}
                        >{label}</button>
                      ))}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link
                      href={`/mrm/singleplayer/${selectedMap}`}
                      style={{ flex: 1, textDecoration: "none" }}
                      onClick={() => {
                        // Persist opacity so SingleplayerGame can read it
                        try { localStorage.setItem("duomath_bg_opacity", String(bgOpacity / 100)); } catch(e) {}
                      }}
                    >
                      <button style={{
                        width: "100%", padding: "10px 0",
                        background: "linear-gradient(135deg, #22d3ee, #0ea5e9)",
                        color: "#000", border: "none", borderRadius: 8,
                        fontSize: 13, fontWeight: 800, cursor: "pointer",
                        boxShadow: "0 4px 14px rgba(34,211,238,0.3)",
                        transition: "all 0.2s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.02)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                      >
                        ▶ Chơi ngay
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDownloadMap(selectedMapData)}
                      style={{
                        padding: "10px 12px",
                        background: "rgba(34,211,238,0.1)",
                        border: "1px solid rgba(34,211,238,0.3)",
                        color: "#22d3ee", borderRadius: 8,
                        fontSize: 12, fontWeight: 700, cursor: "pointer",
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

          {/* Bottom part: Leaderboard */}
          <div className="no-scrollbar" style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}>
            {/* LB Header */}
            <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "white", marginBottom: 6 }}>
                🏆 Bảng xếp hạng (Top 25)
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

            {/* LB Rows (Top 25 with small Facebook avatar fallbacks next to username) */}
            <div className="no-scrollbar" style={{ flex: 1, overflowY: "auto" }}>
              {getLeaderboardForMap(selectedMap).slice(0, 25).map((entry, i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                const rankColor = i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7f32" : "rgba(255,255,255,0.4)";
                const avatarUrl = entry.avatar_url || entry.profile_url || "https://www.gravatar.com/avatar/?d=mp";
                return (
                  <div key={entry.username + "_" + i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
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
                    <div style={{ width: 24, textAlign: "center", flexShrink: 0 }}>
                      {medal
                        ? <span style={{ fontSize: 18 }}>{medal}</span>
                        : <span style={{ fontSize: 13, fontWeight: 700, color: rankColor }}>{entry.rank}</span>
                      }
                    </div>

                    {/* Avatar + Username */}
                    <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8 }}>
                      <img
                        src={avatarUrl}
                        alt={entry.username}
                        style={{
                          width: 22, height: 22,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "1px solid rgba(255,255,255,0.15)",
                          flexShrink: 0,
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "https://www.gravatar.com/avatar/?d=mp";
                        }}
                      />
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
                    </div>

                    <div style={{ textAlign: "right", flexShrink: 0 }}>
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
              flexShrink: 0,
            }}>
              🔄 Live Updates · Anti-cheat Replay
            </div>
          </div>
        </div>

        {/* SPACER FOR CENTRAL GAP (osu!-style spacer with dynamic map background) */}
        <div style={{
          flex: 1,
          position: "relative",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}>
          {selectedMapData && (selectedMapData.bg_image || selectedMapData.background_image) && (
            <div style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${selectedMapData.bg_image || selectedMapData.background_image})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: 0.35,
              maskImage: "linear-gradient(to right, transparent, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 70%, transparent)",
              WebkitMaskImage: "linear-gradient(to right, transparent, rgba(0,0,0,1) 30%, rgba(0,0,0,1) 70%, transparent)",
              transition: "background-image 0.6s ease-in-out",
            }} />
          )}
        </div>

        {/* RIGHT COLUMN: Map list (occupies 35% from the right side, padded for overlap) */}
        <div className="no-scrollbar" style={{
          width: "calc(35vw + 30px)",
          minWidth: 410,
          flexShrink: 0,
          overflowY: "auto",
          overflowX: "hidden",
          marginLeft: -30,
          position: "relative",
          zIndex: 5,
        }}>
          {filteredMaps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "80px 20px", color: "rgba(255,255,255,0.4)" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Không tìm thấy MathMap nào</div>
              <div style={{ fontSize: 13, marginTop: 6 }}>Thử tìm kiếm với từ khóa khác</div>
            </div>
          ) : (
            <div style={{
              marginLeft: 30,
              padding: "16px 28px 16px 20px",
              background: "rgba(10, 10, 24, 0.4)",
              backdropFilter: "blur(4px)",
              borderLeft: "1px solid rgba(255, 255, 255, 0.05)",
              minHeight: "100%",
            }}>
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
      </div>
    </div>
  );
}
