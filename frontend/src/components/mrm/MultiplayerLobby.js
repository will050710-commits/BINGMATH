/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import { auth } from "@/lib/firebase";
import ReportUserModal from "@/components/ReportUserModal";
import { getQuestionsForCard } from "@/data/multiplayerQuestions";
import { MOCK_MATHMAPS } from "@/data/mockMathmaps";

const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:5000");

const renderAvatar = (avatar, username) => {
  if (!avatar) {
    return (username || "?")[0].toUpperCase();
  }
  const isImg = avatar.startsWith("http") || avatar.startsWith("/") || avatar.startsWith("data:") || avatar.length > 10;
  if (isImg) {
    return (
      <img
        src={avatar}
        alt={username}
        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
      />
    );
  }
  return avatar;
};


// ── Constants & Configs ──────────────────────────────────────────────────
const BOTS = [
  { username: "MathGod_2k7", elo: 1850, rank: "Gold II", accuracy: 0.88, minSpeed: 3000, maxSpeed: 6500, avatar: "🧙‍♂️" },
  { username: "QuadraticKing", elo: 1700, rank: "Gold I", accuracy: 0.80, minSpeed: 4000, maxSpeed: 8500, avatar: "👑" },
  { username: "PiMaster", elo: 1650, rank: "Gold I", accuracy: 0.76, minSpeed: 5000, maxSpeed: 9500, avatar: "🧠" },
  { username: "TrigWhiz", elo: 1520, rank: "Silver III", accuracy: 0.70, minSpeed: 6000, maxSpeed: 11000, avatar: "📐" },
  { username: "Sigma_Boy", elo: 1600, rank: "Gold I", accuracy: 0.74, minSpeed: 5000, maxSpeed: 10000, avatar: "🐺" },
];

const INITIAL_ROOMS = [
  { id: "r001", host: "MathGod_2k7", map: "Phương trình bậc hai nâng cao", grade: "Lớp 11", diff: 7.8, players: 1, maxPlayers: 2, status: "waiting", elo: "1850+" },
  { id: "r002", host: "QuadraticKing", map: "Lượng giác - Tổng hợp", grade: "Lớp 11", diff: 6.3, players: 1, maxPlayers: 2, status: "waiting", elo: "Tất cả" },
  { id: "r003", host: "PiMaster", map: "Đạo hàm & Ứng dụng", grade: "Lớp 12", diff: 8.5, players: 2, maxPlayers: 2, status: "in_game", elo: "2000+" },
  { id: "r004", host: "TrigWhiz", map: "Hình học phẳng cơ bản", grade: "Lớp 10", diff: 4.2, players: 1, maxPlayers: 2, status: "waiting", elo: "Tất cả" },
  { id: "r005", host: "Sigma_Boy", map: "Dãy số - Cấp số cộng & nhân", grade: "Lớp 11", diff: 6.8, players: 1, maxPlayers: 2, status: "waiting", elo: "1600+" },
];

const ALL_FORUM_CARDS = [
  { id: "fc1", title: "Phương trình bậc hai", enTitle: "Quadratic Equations", desc: "Chuyên đề Delta và Hệ thức Vi-ét", icon: "📐", diff: 7.8, color: "#f97316", bgImage: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200", thumbnail: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=300" },
  { id: "fc2", title: "Đạo hàm & Cực trị", enTitle: "Derivatives & Extrema", desc: "Khảo sát sự biến thiên và cực đại cực tiểu", icon: "📈", diff: 8.5, color: "#ef4444", bgImage: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=1200", thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=300" },
  { id: "fc3", title: "Hình học phẳng Oxyz", enTitle: "Coordinate Geometry", desc: "Hệ tọa độ, vector và phương trình đường thẳng", icon: "🌐", diff: 6.3, color: "#38bdf8", bgImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=1200", thumbnail: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=300" },
  { id: "fc4", title: "Dãy số & Cấp số", enTitle: "Sequences & Series", desc: "Tìm số hạng tổng quát và tính tổng S_n", icon: "🔢", diff: 5.5, color: "#4ade80", bgImage: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=1200", thumbnail: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?q=80&w=300" },
  { id: "fc5", title: "Lượng giác tổng hợp", enTitle: "Trigonometry", desc: "Công thức sin, cos, tan và các bài toán ứng dụng", icon: "∿", diff: 7.0, color: "#a78bfa", bgImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200", thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=300" },
  { id: "fc6", title: "Xác suất & Tổ hợp", enTitle: "Probability & Combinatorics", desc: "Hoán vị, tổ hợp, chỉnh hợp và xác suất biến cố", icon: "🎲", diff: 6.8, color: "#fbbf24", bgImage: "https://images.unsplash.com/photo-1596495578065-6e0763fa1141?q=80&w=1200", thumbnail: "https://images.unsplash.com/photo-1596495578065-6e0763fa1141?q=80&w=300" },
];

const trisList = Array.from({ length: 16 }).map((_, i) => ({
  id: i,
  left: (i * 7.1) % 100, // deterministic spread across screen width
  size: 15 + ((i * 13) % 45), // sizing range 15px - 60px
  dur: 7 + ((i * 3) % 10), // duration range 7s - 17s
  delay: -((i * 4.5) % 15), // negative delay for instant distributed stagger
}));

function getRankTitle(elo) {
  if (elo < 1200) return "Bronze I";
  if (elo < 1400) return "Silver III";
  if (elo < 1600) return "Gold I";
  if (elo < 1800) return "Gold II";
  if (elo < 2000) return "Platinum I";
  return "Diamond III";
}

function getRankColor(rank) {
  if (!rank) return "#94a3b8";
  if (rank.startsWith("Bronze")) return "#cd7f32";
  if (rank.startsWith("Silver")) return "#94a3b8";
  if (rank.startsWith("Gold")) return "#fbbf24";
  if (rank.startsWith("Platinum")) return "#38bdf8";
  if (rank.startsWith("Diamond")) return "#c084fc";
  return "#e0f2fe";
}

function getRankGradient(rank) {
  if (!rank) return "linear-gradient(135deg, #475569, #334155)";
  if (rank.startsWith("Bronze")) return "linear-gradient(135deg, #92400e, #cd7f32)";
  if (rank.startsWith("Silver")) return "linear-gradient(135deg, #475569, #94a3b8)";
  if (rank.startsWith("Gold")) return "linear-gradient(135deg, #b45309, #fbbf24)";
  if (rank.startsWith("Platinum")) return "linear-gradient(135deg, #0369a1, #38bdf8)";
  if (rank.startsWith("Diamond")) return "linear-gradient(135deg, #7e22ce, #c084fc)";
  return "linear-gradient(135deg, #1e293b, #334155)";
}

function getDiffColor(diff) {
  if (diff < 4) return { label: "Easy", color: "#4ade80", bg: "rgba(74,222,128,0.15)" };
  if (diff < 6) return { label: "Normal", color: "#fbbf24", bg: "rgba(251,191,36,0.15)" };
  if (diff < 8) return { label: "Hard", color: "#f97316", bg: "rgba(249,115,22,0.15)" };
  return { label: "Insane", color: "#ef4444", bg: "rgba(239,68,68,0.15)" };
}

function getPerformanceGrade(wins, total, maxCombo) {
  if (total === 0) return "D";
  const wr = wins / total;
  if (wr >= 0.9 && maxCombo >= 4) return "S";
  if (wr >= 0.7) return "A";
  if (wr >= 0.5) return "B";
  if (wr >= 0.3) return "C";
  return "D";
}

// ── Sub-components ─────────────────────────────────────────────────────────

function RankBadge({ rank, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: getRankGradient(rank),
      display: "flex", alignItems: "center", justifyContent: "center",
      border: `2px solid ${getRankColor(rank)}66`,
      boxShadow: `0 0 12px ${getRankColor(rank)}44`,
      fontSize: size * 0.4, fontWeight: 900, color: "white",
      flexShrink: 0,
      textShadow: "0 1px 3px rgba(0,0,0,0.5)",
    }}>
      {rank?.startsWith("Diamond") ? "◆" :
       rank?.startsWith("Platinum") ? "✦" :
       rank?.startsWith("Gold") ? "★" :
       rank?.startsWith("Silver") ? "⬡" : "●"}
    </div>
  );
}

function DiffStars({ diff }) {
  const { label, color, bg } = getDiffColor(diff);
  const stars = Math.min(5, Math.round(diff / 2));
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      fontSize: 10, fontWeight: 700, color,
      background: bg, border: `1px solid ${color}44`,
      borderRadius: 20, padding: "2px 8px",
    }}>
      {"★".repeat(stars)}{"☆".repeat(5 - stars)} {label} {diff.toFixed(1)}
    </span>
  );
}

// The horizontal damage bar replacing hearts
function DamageBar({ playerHP, botHP, maxHP = 5, playerUsername, botUsername, playerBigHP, botBigHP }) {
  // damage position: 0.5 = center (even), >0.5 = player winning, <0.5 = bot winning
  const playerRatio = playerHP / (playerHP + botHP);
  const markerPos = playerRatio * 100;

  return (
    <div style={{ width: "100%", padding: "0 28px", boxSizing: "border-box" }}>
      {/* Player names row */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#38bdf8" }}>
          {playerUsername}
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} style={{ marginLeft: 3, fontSize: 9, color: i < playerBigHP ? "#fbbf24" : "#334155" }}>◆</span>
          ))}
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#f87171" }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i} style={{ marginRight: 3, fontSize: 9, color: i < botBigHP ? "#fbbf24" : "#334155" }}>◆</span>
          ))}
          {botUsername}
        </span>
      </div>
      {/* Bar */}
      <div style={{
        position: "relative", width: "100%", height: 12, borderRadius: 6,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
      }}>
        {/* Player fill (left) */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: `${markerPos}%`,
          background: "linear-gradient(90deg, #0ea5e9, #38bdf8)",
          transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRadius: "6px 0 0 6px",
        }} />
        {/* Bot fill (right) */}
        <div style={{
          position: "absolute", right: 0, top: 0, bottom: 0,
          width: `${100 - markerPos}%`,
          background: "linear-gradient(90deg, #ef4444, #f87171)",
          transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          borderRadius: "0 6px 6px 0",
        }} />
        {/* Center divider */}
        <div style={{
          position: "absolute", left: "50%", top: -1, bottom: -1,
          width: 2, background: "rgba(255,255,255,0.3)",
          transform: "translateX(-50%)",
        }} />
        {/* Moving marker */}
        <div style={{
          position: "absolute", top: "50%", left: `${markerPos}%`,
          width: 16, height: 16, borderRadius: "50%",
          background: "white",
          border: "2px solid rgba(0,0,0,0.3)",
          transform: "translate(-50%, -50%)",
          transition: "left 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 0 8px rgba(255,255,255,0.6)",
          zIndex: 2,
        }} />
      </div>
      {/* HP numbers */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
        <span style={{ fontSize: 10, color: "#38bdf8", fontWeight: 700 }}>{playerHP} HP</span>
        <span style={{ fontSize: 10, color: "#f87171", fontWeight: 700 }}>{botHP} HP</span>
      </div>
    </div>
  );
}

function GradeDisplay({ grade }) {
  const gradeStyles = {
    S: { color: "#fbbf24", glow: "#fbbf24", label: "S", sub: "Xuất sắc!" },
    A: { color: "#4ade80", glow: "#4ade80", label: "A", sub: "Giỏi!" },
    B: { color: "#38bdf8", glow: "#38bdf8", label: "B", sub: "Khá tốt" },
    C: { color: "#f97316", glow: "#f97316", label: "C", sub: "Cần cố gắng" },
    D: { color: "#f87171", glow: "#ef4444", label: "D", sub: "Thất bại" },
  };
  const g = gradeStyles[grade] || gradeStyles.D;
  return (
    <div style={{
      width: 100, height: 100, borderRadius: "50%",
      border: `4px solid ${g.color}`,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      boxShadow: `0 0 30px ${g.glow}66, 0 0 60px ${g.glow}22`,
      background: `radial-gradient(circle, ${g.color}11, transparent)`,
    }}>
      <div style={{ fontSize: 40, fontWeight: 900, color: g.color, lineHeight: 1 }}>{g.label}</div>
      <div style={{ fontSize: 9, color: g.color, fontWeight: 600, marginTop: 2 }}>{g.sub}</div>
    </div>
  );
}

function MathParticles() {
  const SYMBOLS = ["∑", "∫", "π", "√", "∞", "Δ", "∂", "∇", "⊕", "≈", "≠", "±", "×", "÷", "α", "β", "θ", "λ", "∿", "∏"];
  const [particles] = useState(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: i,
      symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      left: `${Math.random() * 100}%`,
      dur: `${10 + Math.random() * 16}s`,
      delay: `${Math.random() * 12}s`,
      size: `${12 + Math.random() * 20}px`,
      opacity: 0.04 + Math.random() * 0.1,
    }))
  );
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: "absolute", left: p.left, bottom: "-5%",
          fontSize: p.size, color: "#a78bfa", opacity: p.opacity,
          animation: `mrmParticleFloat ${p.dur} ${p.delay} linear infinite`,
          userSelect: "none", fontFamily: "monospace", fontWeight: 700,
        }}>{p.symbol}</div>
      ))}
    </div>
  );
}

function OrbBackground() {
  const orbs = [
    { w: 320, h: 280, left: "-8%", top: "-5%", color1: "#4c1d95", color2: "#7c3aed", dur: "18s", delay: "0s" },
    { w: 250, h: 220, right: "-6%", top: "10%", color1: "#1e3a5f", color2: "#0ea5e9", dur: "22s", delay: "3s" },
    { w: 200, h: 180, left: "35%", bottom: "-8%", color1: "#7c2d12", color2: "#ea580c", dur: "16s", delay: "7s" },
    { w: 160, h: 140, left: "60%", top: "40%", color1: "#14532d", color2: "#22c55e", dur: "20s", delay: "5s" },
  ];
  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {orbs.map((o, i) => (
        <div key={i} style={{
          position: "absolute",
          width: o.w, height: o.h,
          left: o.left, right: o.right, top: o.top, bottom: o.bottom,
          background: `radial-gradient(ellipse, ${o.color1}55 0%, ${o.color2}22 50%, transparent 70%)`,
          borderRadius: "50%",
          animation: `orbFloat ${o.dur} ${o.delay} ease-in-out infinite alternate`,
          filter: "blur(40px)",
        }} />
      ))}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function MultiplayerLobby() {
  const { user } = useAuth();
  const router = useRouter();

  // ─── Core ELO / Stats States ──────────────────────────────────────────
  const [playerElo, setPlayerElo] = useState(1743);
  const [playerStats, setPlayerStats] = useState({ wins: 34, losses: 18 });
  const [onlineCount, setOnlineCount] = useState(347);
  const [rooms, setRooms] = useState(INITIAL_ROOMS);

  // ─── WebSocket Integration States ──────────────────────────────────────
  const socketRef = useRef(null);
  const [wsRooms, setWsRooms] = useState([]);
  const [isRealMultiplayer, setIsRealMultiplayer] = useState(false);
  const [myRole, setMyRole] = useState(null); // "host" | "guest"
  const [roomId, setRoomId] = useState(null);
  const [createMap, setCreateMap] = useState("Phương trình bậc hai nâng cao");
  const [createMinElo, setCreateMinElo] = useState("Tất cả");
  const [createMode, setCreateMode] = useState("Ranked (Tính ELO)");


  // ─── Lobby / Flow States ───────────────────────────────────────────────
  const [tab, setTab] = useState("browse"); // browse | create | ranked
  const [joiningRoomId, setJoiningRoomId] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // ─── Matchmaker / Game States ──────────────────────────────────────────
  const [gameState, setGameState] = useState("lobby"); // lobby | matching | faceoff | card_choosing | playing | ended
  const [matchTimer, setMatchTimer] = useState(0);
  const [botOpponent, setBotOpponent] = useState(null);

  // ─── Card Choosing Phase States ────────────────────────────────────────
  const [playerBigHP, setPlayerBigHP] = useState(3);
  const [botBigHP, setBotBigHP] = useState(3);
  const [chooser, setChooser] = useState(null); // "player" | "bot"
  const [selectedCard, setSelectedCard] = useState(null);
  const [activeQuestions, setActiveQuestions] = useState([]);
  const [forumCards] = useState(ALL_FORUM_CARDS);

  // ─── NEW: Discard Phase ────────────────────────────────────────────────
  const [gamePhase, setGamePhase] = useState("discarding"); // "discarding" | "picking"
  const [discardedCards, setDiscardedCards] = useState([]);
  const [availableCards, setAvailableCards] = useState(ALL_FORUM_CARDS);
  const DISCARD_COUNT = 2;

  // ─── Battle States ─────────────────────────────────────────────────────
  const [currentQ, setCurrentQ] = useState(0);
  const [playerHP, setPlayerHP] = useState(5);
  const [botHP, setBotHP] = useState(5);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const [playerSelected, setPlayerSelected] = useState(null);
  const [botSelected, setBotSelected] = useState(null);
  const [playerSubmitted, setPlayerSubmitted] = useState(false);
  const [botSubmitted, setBotSubmitted] = useState(false);

  const [playerCorrect, setPlayerCorrect] = useState(null);
  const [botCorrect, setBotCorrect] = useState(null);
  const [feedMessages, setFeedMessages] = useState([]);
  const [evaluating, setEvaluating] = useState(false);

  const [timeLeft, setTimeLeft] = useState(30);

  // ─── Speed-First Timestamps ────────────────────────────────────────────
  const [playerAnswerTime, setPlayerAnswerTime] = useState(null);
  const [botAnswerTime, setBotAnswerTime] = useState(null);

  // ─── ELO Delta state ───────────────────────────────────────────────────
  const [eloDelta, setEloDelta] = useState(0);

  // ─── NEW: Match History ────────────────────────────────────────────────
  const [matchHistory, setMatchHistory] = useState([
    { opponent: "MathGod_2k7", result: "W", eloDelta: +25, map: "Phương trình bậc hai", grade: "A" },
    { opponent: "TrigWhiz", result: "L", eloDelta: -15, map: "Lượng giác tổng hợp", grade: "C" },
    { opponent: "PiMaster", result: "W", eloDelta: +22, map: "Đạo hàm & Cực trị", grade: "S" },
    { opponent: "Sigma_Boy", result: "L", eloDelta: -15, map: "Dãy số & Cấp số", grade: "D" },
    { opponent: "QuadraticKing", result: "W", eloDelta: +30, map: "Xác suất & Tổ hợp", grade: "A" },
  ]);

  // ─── NEW: Round stats for grade ────────────────────────────────────────
  const [roundCorrect, setRoundCorrect] = useState(0);
  const [roundTotal, setRoundTotal] = useState(0);

  // ─── NEW: Combo flash ──────────────────────────────────────────────────
  const [comboFlash, setComboFlash] = useState(false);

  // ─── Report User States ────────────────────────────────────────────────
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportUser, setSelectedReportUser] = useState("");

  // ─── Map Background / Media States ────────────────────────────────────
  const [mapBgImage, setMapBgImage] = useState(null);
  const [mapBgOpacity, setMapBgOpacity] = useState(0.3);
  const [showBgPanel, setShowBgPanel] = useState(false);
  const bgPanelTimerRef = useRef(null);

  const showOpacityPanel = useCallback((bgUrl, opacity) => {
    setMapBgImage(bgUrl);
    setMapBgOpacity(opacity);
    setShowBgPanel(true);
    clearTimeout(bgPanelTimerRef.current);
    bgPanelTimerRef.current = setTimeout(() => setShowBgPanel(false), 5000);
  }, []);

  // ─── Web Audio API BGM Synthesizer ──────────────────────────────────────
  const [isMuted, setIsMuted] = useState(false);
  const synthRef = useRef(null);

  const startBgm = useCallback(() => {
    if (isMuted || synthRef.current || typeof window === "undefined") return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [130.81, 146.83, 164.81, 196.00, 220.00];
      const leadNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
      const bassPattern = [0, 3, 4, 3, 2, 3, 2, 1];
      const leadPattern = [0, 2, 3, 4, 3, 2, 5, 4];
      let stepIndex = 0;

      const scheduler = () => {
        const time = ctx.currentTime;
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = "triangle";
        bassOsc.frequency.setValueAtTime(notes[bassPattern[stepIndex % bassPattern.length]], time);
        bassGain.gain.setValueAtTime(0.06, time);
        bassGain.gain.exponentialRampToValueAtTime(0.001, time + 0.25);
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(time);
        bassOsc.stop(time + 0.3);

        if (stepIndex % 2 === 0) {
          const leadOsc = ctx.createOscillator();
          const leadGain = ctx.createGain();
          leadOsc.type = "sine";
          leadOsc.frequency.setValueAtTime(leadNotes[leadPattern[(stepIndex / 2) % leadPattern.length]], time);
          leadGain.gain.setValueAtTime(0.02, time);
          leadGain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
          leadOsc.connect(leadGain);
          leadGain.connect(ctx.destination);
          leadOsc.start(time);
          leadOsc.stop(time + 0.2);
        }
        stepIndex++;
      };

      const timer = setInterval(scheduler, 250);
      synthRef.current = {
        stop: () => { clearInterval(timer); ctx.close(); synthRef.current = null; }
      };
    } catch (e) { console.error(e); }
  }, [isMuted]);

  const stopBgm = useCallback(() => {
    if (synthRef.current) synthRef.current.stop();
  }, []);

  useEffect(() => {
    if (["faceoff", "card_choosing", "playing"].includes(gameState)) startBgm();
    else stopBgm();
    return () => stopBgm();
  }, [gameState, startBgm, stopBgm]);

  // Timers Refs
  const questionTimerRef = useRef(null);
  const botTimerRef = useRef(null);
  const matchingTimerRef = useRef(null);

  const playerUsername = user?.username || user?.email?.split("@")[0] || "Bạn";
  const playerRank = getRankTitle(playerElo);

  // ─── WebSocket Client Connection ───────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    
    let isMounted = true;
    let ws = null;
    
    const connectWs = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        const token = await currentUser.getIdToken(true);
        
        const wsBase = BASE.replace("http://", "ws://").replace("https://", "wss://");
        ws = new WebSocket(`${wsBase}/api/mrm/ws?token=${token}`);
        socketRef.current = ws;
        
        ws.onopen = () => {
          console.log("[WS Connected]");
          if (isMounted) {
            ws.send(JSON.stringify({ type: "join_lobby" }));
          }
        };
        
        ws.onmessage = (event) => {
          if (!isMounted) return;
          const msg = JSON.parse(event.data);
          
          if (msg.type === "lobby_update") {
            setWsRooms(msg.rooms);
          }
          
          else if (msg.type === "room_created") {
            setRoomId(msg.room_id);
            setIsRealMultiplayer(true);
            setMyRole("host");
            setBotOpponent(null);
            setGameState("matching");
          }
          
          else if (msg.type === "game_start" || msg.type === "match_found") {
            clearInterval(matchingTimerRef.current);
            setIsRealMultiplayer(true);
            setRoomId(msg.room_id);
            setMyRole(msg.role);
            
            const opp = msg.opponent;
            setBotOpponent({
              uid: opp.uid,
              username: opp.username,
              elo: opp.elo,
              rank: getRankTitle(opp.elo),
              avatar: opp.avatar || "👤"
            });
            
            setGameState("faceoff");
            setChooser(msg.chooser_id === user.id ? "player" : "bot");
            
            setTimeout(() => {
              setGameState("card_choosing");
              setSelectedCard(null);
              setDiscardedCards([]);
              setAvailableCards(ALL_FORUM_CARDS);
              setGamePhase("discarding");
              setPlayerBigHP(3);
              setBotBigHP(3);
            }, 2500);
          }
          
          else if (msg.type === "opponent_card_action") {
            if (msg.action === "discard") {
              setDiscardedCards(msg.discarded_cards);
              if (msg.discarded_cards.length >= 2) {
                setGamePhase("picking");
                setAvailableCards(ALL_FORUM_CARDS.filter(c => !msg.discarded_cards.includes(c.id)));
              }
              setChooser(msg.chooser_id === user.id ? "player" : "bot");
            } else if (msg.action === "pick") {
              setSelectedCard(msg.card);
              setTimeout(() => {
                const questions = getQuestionsForCard(msg.card);
                setActiveQuestions(questions);
                setGameState("playing");
                setCurrentQ(0);
                setPlayerHP(5);
                setBotHP(5);
                setScore(0);
                setCombo(0);
                setMaxCombo(0);
                setRoundCorrect(0);
                setRoundTotal(0);
                setEvaluating(false);
                setFeedMessages([`${msg.card ? msg.card.enTitle : "Mixed"} — Match Start!`]);
                
                setPlayerSelected(null);
                setBotSelected(null);
                setPlayerSubmitted(false);
                setBotSubmitted(false);
                setPlayerCorrect(null);
                setBotCorrect(null);
                setPlayerAnswerTime(null);
                setBotAnswerTime(null);
                setEvaluating(false);
                setTimeLeft(30);
                
                clearInterval(questionTimerRef.current);
                questionTimerRef.current = setInterval(() => {
                  setTimeLeft(prev => {
                    if (prev <= 1) {
                      clearInterval(questionTimerRef.current);
                      handleWsTimeout();
                      return 0;
                    }
                    return prev - 1;
                  });
                }, 1000);
              }, 2000);
            }
          }
          
          else if (msg.type === "opponent_submitted") {
            setBotSubmitted(true);
          }
          
          else if (msg.type === "round_evaluation") {
            setEvaluating(true);
            clearInterval(questionTimerRef.current);
            
            const myId = myRole === "host" ? msg.host_id : msg.guest_id;
            const oppId = myRole === "host" ? msg.guest_id : msg.host_id;
            
            const myAns = msg.answers[myId?.toString()];
            const oppAns = msg.answers[oppId?.toString()];
            
            setPlayerSelected(myAns?.option);
            setBotSelected(oppAns?.option);
            setPlayerSubmitted(true);
            setBotSubmitted(true);
            
            setPlayerCorrect(myAns?.is_correct);
            setBotCorrect(oppAns?.is_correct);
            
            setRoundTotal(prev => prev + 1);
            if (myAns?.is_correct) setRoundCorrect(prev => prev + 1);
            
            const nextPlayerHP = myRole === "host" ? msg.host_hp : msg.guest_hp;
            const nextBotHP = myRole === "host" ? msg.guest_hp : msg.host_hp;
            
            setPlayerHP(nextPlayerHP);
            setBotHP(nextBotHP);
            
            if (myAns?.is_correct) {
              setCombo(prev => {
                const nextC = prev + 1;
                setMaxCombo(m => Math.max(m, nextC));
                setComboFlash(true);
                setTimeout(() => setComboFlash(false), 600);
                return nextC;
              });
              setScore(prev => prev + 100 + combo * 10);
            } else {
              setCombo(0);
            }
            
            const clientLogs = [];
            const myCorrect = myAns?.is_correct;
            const oppCorrect = oppAns?.is_correct;
            const myTime = myAns?.time_taken || 0;
            const oppTime = oppAns?.time_taken || 0;
            const oppName = botOpponent?.username || "Đối thủ";
            
            if (myCorrect && oppCorrect) {
              if (myTime < oppTime) {
                clientLogs.push("⚡ Bạn nhanh hơn! Gây sát thương lên đối thủ! / You are faster!");
              } else if (oppTime < myTime) {
                clientLogs.push(`⚡ Đối thủ nhanh hơn! Bạn mất 1 HP. / ${oppName} is faster!`);
              } else {
                clientLogs.push("🤝 Hòa! Cả hai đều đúng cùng tốc độ!");
              }
            } else if (myCorrect && !oppCorrect) {
              clientLogs.push("🎯 Bạn đúng! Gây sát thương! / You hit!");
            } else if (!myCorrect && oppCorrect) {
              clientLogs.push(`🎯 Bạn sai! Đối thủ gây sát thương! / ${oppName} hits!`);
            } else {
              clientLogs.push("💨 Cả hai đều trả lời sai! / Both missed!");
            }
            setFeedMessages(clientLogs);
            
            setTimeout(() => {
              if (nextPlayerHP <= 0 || nextBotHP <= 0 || currentQ === activeQuestions.length - 1) {
                if (myRole === "host") {
                  const winnerRole = nextPlayerHP > 0 ? "host" : "guest";
                  socketRef.current.send(JSON.stringify({
                    type: "duel_round_end",
                    room_id: roomId,
                    winner_role: winnerRole
                  }));
                }
              } else {
                setCurrentQ(prev => {
                  const nextQIdx = prev + 1;
                  setPlayerSelected(null);
                  setBotSelected(null);
                  setPlayerSubmitted(false);
                  setBotSubmitted(false);
                  setPlayerCorrect(null);
                  setBotCorrect(null);
                  setPlayerAnswerTime(null);
                  setBotAnswerTime(null);
                  setEvaluating(false);
                  setTimeLeft(30);
                  
                  clearInterval(questionTimerRef.current);
                  questionTimerRef.current = setInterval(() => {
                    setTimeLeft(prev => {
                      if (prev <= 1) {
                        clearInterval(questionTimerRef.current);
                        handleWsTimeout();
                        return 0;
                      }
                      return prev - 1;
                    });
                  }, 1000);
                  
                  return nextQIdx;
                });
              }
            }, 2800);
          }
          
          else if (msg.type === "round_end_sync") {
            const nextPlayerBigHP = myRole === "host" ? msg.host_big_hp : msg.guest_big_hp;
            const nextBotBigHP = myRole === "host" ? msg.guest_big_hp : msg.host_big_hp;
            
            setPlayerBigHP(nextPlayerBigHP);
            setBotBigHP(nextBotBigHP);
            
            const wonRound = (msg.winner_role === "host" && myRole === "host") || (msg.winner_role === "guest" && myRole === "guest");
            if (wonRound) {
              setFeedMessages(["🏆 Thắng ván đấu! Bạn lấy được 1 điểm đấu!"]);
            } else {
              setFeedMessages(["💔 Thua ván đấu! Đối thủ lấy được 1 điểm đấu!"]);
            }
            
            setTimeout(() => {
              if (nextPlayerBigHP <= 0 || nextBotBigHP <= 0) {
                if (myRole === "host") {
                  socketRef.current.send(JSON.stringify({
                    type: "match_end_action",
                    room_id: roomId
                  }));
                }
              } else {
                setGameState("card_choosing");
                setSelectedCard(null);
                setDiscardedCards([]);
                setAvailableCards(ALL_FORUM_CARDS);
                setGamePhase("discarding");
                setChooser(prev => prev === "player" ? "bot" : "player");
              }
            }, 3000);
          }
          
          else if (msg.type === "match_results") {
            setGameState("ended");
            clearInterval(questionTimerRef.current);
            
            const won = msg.won;
            const delta = msg.elo_delta;
            const nextElo = msg.new_elo;
            
            setEloDelta(delta);
            setPlayerElo(nextElo);
            const nextWins = won ? playerStats.wins + 1 : playerStats.wins;
            const nextLosses = !won ? playerStats.losses + 1 : playerStats.losses;
            setPlayerStats({ wins: nextWins, losses: nextLosses });
            saveStatsToStorage(nextWins, nextLosses, nextElo);
            
            const currentCard = selectedCard || ALL_FORUM_CARDS[0];
            const grade = getPerformanceGrade(roundCorrect, roundTotal, maxCombo);
            setMatchHistory(prev => [{
              opponent: botOpponent?.username || "Đối thủ",
              result: won ? "W" : "L",
              eloDelta: delta,
              map: currentCard?.title || "Mixed",
              grade,
            }, ...prev.slice(0, 4)]);
          }
          
          else if (msg.type === "opponent_left") {
            if (msg.won) {
              setGameState("ended");
              clearInterval(questionTimerRef.current);
              
              setEloDelta(msg.elo_delta);
              setPlayerElo(msg.new_elo);
              const nextWins = playerStats.wins + 1;
              setPlayerStats(prev => ({ ...prev, wins: nextWins }));
              saveStatsToStorage(nextWins, playerStats.losses, msg.new_elo);
              
              setFeedMessages([msg.reason]);
              
              const currentCard = selectedCard || ALL_FORUM_CARDS[0];
              setMatchHistory(prev => [{
                opponent: botOpponent?.username || "Đối thủ",
                result: "W",
                eloDelta: msg.elo_delta,
                map: currentCard?.title || "Mixed",
                grade: "A",
              }, ...prev.slice(0, 4)]);
            } else {
              setFeedMessages([msg.reason || "Đối thủ đã rời phòng!"]);
              setTimeout(() => {
                setGameState("lobby");
                setTab("browse");
              }, 2000);
            }
          }
        };
        
        ws.onclose = () => {
          console.log("[WS Closed]");
        };
      } catch (err) {
        console.error("[WS Connection error]", err);
      }
    };
    
    connectWs();
    
    return () => {
      isMounted = false;
      if (ws) ws.close();
    };
  }, [user]);

  const handleWsTimeout = () => {
    if (playerSubmitted || evaluating) return;
    setPlayerSubmitted(true);
    setPlayerSelected(-1);
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "submit_answer",
        room_id: roomId,
        q_idx: currentQ,
        option: -1,
        is_correct: false,
        time_taken: 30.0
      }));
    }
  };

  // ─── Hydration & LocalStorage ──────────────────────────────────────────
  useEffect(() => {
    const savedElo = localStorage.getItem("duomath_player_elo");
    const savedWins = localStorage.getItem("duomath_player_wins");
    const savedLosses = localStorage.getItem("duomath_player_losses");
    if (savedElo) setPlayerElo(parseInt(savedElo, 10));
    if (savedWins || savedLosses) {
      setPlayerStats({
        wins: savedWins ? parseInt(savedWins, 10) : 34,
        losses: savedLosses ? parseInt(savedLosses, 10) : 18,
      });
    }
  }, []);

  // Sync ELO from database user profile to prevent local resets
  useEffect(() => {
    if (user?.elo_rating !== undefined) {
      setPlayerElo(user.elo_rating);
      localStorage.setItem("duomath_player_elo", user.elo_rating.toString());
    }
  }, [user]);

  const saveStatsToStorage = (wins, losses, elo) => {
    localStorage.setItem("duomath_player_wins", wins.toString());
    localStorage.setItem("duomath_player_losses", losses.toString());
    localStorage.setItem("duomath_player_elo", elo.toString());
  };

  // ─── Real-time Lobby Simulation ───────────────────────────────────────
  useEffect(() => {
    if (gameState !== "lobby" || tab !== "browse") return;
    const interval = setInterval(() => {
      setOnlineCount(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4));
      setRooms(prev => prev.map(r => {
        if (Math.random() > 0.75) {
          const nextPlayers = r.players === 1 ? 2 : 1;
          return { ...r, players: nextPlayers, status: nextPlayers === 2 ? "in_game" : "waiting" };
        }
        return r;
      }));
    }, 4500);
    return () => clearInterval(interval);
  }, [gameState, tab]);

  // ─── Quick match search simulation ────────────────────────────────────
  const startMatching = () => {
    setGameState("matching");
    setMatchTimer(0);
    
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "matchmaking_search"
      }));
      
      let count = 0;
      matchingTimerRef.current = setInterval(() => {
        count += 1;
        setMatchTimer(count);
        if (count >= 6) {
          clearInterval(matchingTimerRef.current);
          socketRef.current.send(JSON.stringify({
            type: "matchmaking_cancel"
          }));
          
          // Bot fallback
          setIsRealMultiplayer(false);
          const matchedBot = BOTS[Math.floor(Math.random() * BOTS.length)];
          setBotOpponent(matchedBot);
          setGameState("faceoff");
          setTimeout(() => startCardChoosingPhase(matchedBot, true), 2500);
        }
      }, 1000);
    } else {
      matchingTimerRef.current = setInterval(() => {
        setMatchTimer(prev => {
          const next = prev + 1;
          if (next >= 4) {
            clearInterval(matchingTimerRef.current);
            const matchedBot = BOTS[Math.floor(Math.random() * BOTS.length)];
            setBotOpponent(matchedBot);
            setGameState("faceoff");
            setTimeout(() => startCardChoosingPhase(matchedBot, true), 2500);
          }
          return next;
        });
      }, 1000);
    }
  };

  const cancelMatching = () => {
    clearInterval(matchingTimerRef.current);
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      if (roomId) {
        socketRef.current.send(JSON.stringify({
          type: "leave_room",
          room_id: roomId
        }));
      }
      socketRef.current.send(JSON.stringify({
        type: "matchmaking_cancel"
      }));
    }
    setGameState("lobby");
    setTab("ranked");
  };

  // ─── Join Room countdown simulation ───────────────────────────────────
  const handleJoinRoom = (room) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && room.id && room.id.startsWith("r_")) {
      socketRef.current.send(JSON.stringify({
        type: "join_room",
        room_id: room.id
      }));
    } else {
      setJoiningRoomId(room.id);
      let c = 3;
      setCountdown(c);
      const interval = setInterval(() => {
        c -= 1;
        if (c <= 0) {
          clearInterval(interval);
          setCountdown(null);
          setJoiningRoomId(null);
          const botTemplate = BOTS.find(b => b.username === room.host) || BOTS[0];
          setBotOpponent(botTemplate);
          setGameState("faceoff");
          setTimeout(() => startCardChoosingPhase(botTemplate, true), 2500);
        } else {
          setCountdown(c);
        }
      }, 1000);
    }
  };

  // ─── Card Choosing Phase Initialization ───────────────────────────────
  const startCardChoosingPhase = (bot, isFirstRound = false) => {
    setGameState("card_choosing");
    setSelectedCard(null);
    setDiscardedCards([]);
    setAvailableCards(ALL_FORUM_CARDS);
    setGamePhase("discarding");
    if (isFirstRound) {
      setPlayerBigHP(3);
      setBotBigHP(3);
      setChooser(Math.random() < 0.5 ? "player" : "bot");
    } else {
      setChooser(prev => prev === "player" ? "bot" : "player");
    }
  };

  const handleDiscardCard = (card) => {
    if (discardedCards.length >= DISCARD_COUNT) return;
    const newDiscarded = [...discardedCards, card.id];
    setDiscardedCards(newDiscarded);
    
    if (isRealMultiplayer && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "card_phase_action",
        room_id: roomId,
        action: "discard",
        card: card,
        discarded_cards: newDiscarded,
        next_chooser_id: newDiscarded.length >= DISCARD_COUNT ? (chooser === "player" ? user.id : botOpponent?.uid) : (chooser === "player" ? user.id : botOpponent?.uid)
      }));
    }
    
    if (newDiscarded.length >= DISCARD_COUNT) {
      // Move to picking phase
      setGamePhase("picking");
      setAvailableCards(ALL_FORUM_CARDS.filter(c => !newDiscarded.includes(c.id)));
    }
  };

  const handleSelectCard = (card) => {
    setSelectedCard(card);
    
    if (isRealMultiplayer && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: "card_phase_action",
        room_id: roomId,
        action: "pick",
        card: card
      }));
    }
    
    setTimeout(() => initializeMatch(botOpponent, card), 2000);
  };

  // Bot card selection simulation
  useEffect(() => {
    if (isRealMultiplayer) return;
    if (gameState === "card_choosing" && chooser === "bot") {
      if (gamePhase === "discarding") {
        // Bot discards 2 random cards
        const timer = setTimeout(() => {
          const shuffled = [...ALL_FORUM_CARDS].sort(() => Math.random() - 0.5);
          const botDiscarded = shuffled.slice(0, DISCARD_COUNT).map(c => c.id);
          setDiscardedCards(botDiscarded);
          setGamePhase("picking");
          setAvailableCards(ALL_FORUM_CARDS.filter(c => !botDiscarded.includes(c.id)));
        }, 1800);
        return () => clearTimeout(timer);
      } else if (gamePhase === "picking" && !selectedCard) {
        const timer = setTimeout(() => {
          const remaining = ALL_FORUM_CARDS.filter(c => !discardedCards.includes(c.id));
          const randomCard = remaining[Math.floor(Math.random() * remaining.length)];
          handleSelectCard(randomCard);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState, chooser, selectedCard, gamePhase]);

  // ─── Initialize Battle Arena ───────────────────────────────────────────
  const initializeMatch = (bot, card) => {
    const questions = getQuestionsForCard(card);
    setActiveQuestions(questions);
    setGameState("playing");
    setCurrentQ(0);
    setPlayerHP(5);
    setBotHP(5);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setRoundCorrect(0);
    setRoundTotal(0);
    setEvaluating(false);
    setFeedMessages([`${card ? card.enTitle : "Mixed"} — Match Start!`]);
    loadQuestion(0, bot, questions);

    // ── Load map media: look up card's matching MathMap for bgImage + bgm
    if (card) {
      // Find map in MOCK_MATHMAPS that matches this card topic
      const matchKey = Object.keys(MOCK_MATHMAPS).find(k => {
        const m = MOCK_MATHMAPS[k];
        return m.bgmId && (
          k.startsWith(card.id.replace('fc','mm').slice(0,4)) ||
          (m.title_en && card.enTitle && m.title_en.toLowerCase().includes(card.enTitle.split(' ')[0].toLowerCase()))
        );
      });
      const mapMeta = matchKey ? MOCK_MATHMAPS[matchKey] : null;
      const bgUrl = mapMeta?.bgImageUrl || mapMeta?.thumbnail_url || card.bgImage || card.thumbnail || null;
      const opacity = mapMeta?.bgOpacity ?? 0.35; // slightly higher opacity for visual presence
      if (bgUrl) {
        showOpacityPanel(bgUrl, opacity);
      } else {
        setMapBgImage(null);
      }
    }
  };

  // ─── Load Question & Bot Timer ─────────────────────────────────────────
  const loadQuestion = (qIdx, bot, questions = activeQuestions) => {
    setPlayerSelected(null);
    setBotSelected(null);
    setPlayerSubmitted(false);
    setBotSubmitted(false);
    setPlayerCorrect(null);
    setBotCorrect(null);
    setPlayerAnswerTime(null);
    setBotAnswerTime(null);
    setEvaluating(false);
    setTimeLeft(30);

    clearInterval(questionTimerRef.current);
    questionTimerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(questionTimerRef.current);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    clearTimeout(botTimerRef.current);
    const botDelay = Math.floor(Math.random() * (bot.maxSpeed - bot.minSpeed) + bot.minSpeed);
    botTimerRef.current = setTimeout(() => {
      simulateBotAnswer(qIdx, bot, questions);
    }, botDelay);
  };

  // ─── Simulate Bot Answering ────────────────────────────────────────────
  const simulateBotAnswer = (qIdx, bot, questions = activeQuestions) => {
    const isBotCorrect = Math.random() < bot.accuracy;
    const currentQuestion = questions[qIdx];
    if (!currentQuestion) return;
    let chosenOption;
    if (isBotCorrect) {
      chosenOption = currentQuestion.correct;
    } else {
      const wrongs = [0, 1, 2, 3].filter(x => x !== currentQuestion.correct);
      chosenOption = wrongs[Math.floor(Math.random() * wrongs.length)];
    }
    setBotAnswerTime(Date.now());
    setBotSelected(chosenOption);
    setBotSubmitted(true);
  };

  const handleTimeExpired = () => {
    setEvaluating(true);
    let pSelected = playerSelected;
    let bSelected = botSelected;
    if (pSelected === null) { pSelected = -1; setPlayerSelected(-1); setPlayerSubmitted(true); }
    if (bSelected === null) { bSelected = -1; setBotSelected(-1); setBotSubmitted(true); }
    evaluateAnswers(pSelected, bSelected);
  };

  const handlePlayerAnswer = (optionIdx) => {
    if (playerSubmitted || evaluating) return;
    const timeNow = Date.now();
    setPlayerAnswerTime(timeNow);
    setPlayerSelected(optionIdx);
    setPlayerSubmitted(true);

    if (isRealMultiplayer && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const calcTimeTaken = 30 - timeLeft;
      const currentQuestion = activeQuestions[currentQ];
      const isCorrect = optionIdx === currentQuestion?.correct;
      
      socketRef.current.send(JSON.stringify({
        type: "submit_answer",
        room_id: roomId,
        q_idx: currentQ,
        option: optionIdx,
        is_correct: isCorrect,
        time_taken: calcTimeTaken
      }));
    }
  };

  useEffect(() => {
    if (playerSubmitted && botSubmitted && !evaluating && gameState === "playing") {
      if (!isRealMultiplayer) {
        setEvaluating(true);
        clearInterval(questionTimerRef.current);
        clearTimeout(botTimerRef.current);
        evaluateAnswers(playerSelected, botSelected);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerSubmitted, botSubmitted, evaluating, gameState, playerSelected, botSelected, isRealMultiplayer]);

  // ─── Evaluation ────────────────────────────────────────────────────────
  const evaluateAnswers = (pSelected, bSelected) => {
    const currentQuestion = activeQuestions[currentQ];
    if (!currentQuestion) return;
    const isPlayerCorrect = pSelected === currentQuestion.correct;
    const isBotCorrect = bSelected === currentQuestion.correct;

    setPlayerCorrect(isPlayerCorrect);
    setBotCorrect(isBotCorrect);
    setRoundTotal(prev => prev + 1);
    if (isPlayerCorrect) setRoundCorrect(prev => prev + 1);

    let nextPlayerHP = playerHP;
    let nextBotHP = botHP;
    const logs = [];

    if (isPlayerCorrect && isBotCorrect) {
      const pTime = playerAnswerTime || Infinity;
      const bTime = botAnswerTime || Infinity;
      if (pTime < bTime) {
        nextBotHP = Math.max(0, botHP - 1);
        setBotHP(nextBotHP);
        logs.push(`⚡ Faster! +DAMAGE on ${botOpponent?.username} / Bạn nhanh hơn!`);
        setCombo(prev => {
          const nextC = prev + 1;
          setMaxCombo(m => Math.max(m, nextC));
          setComboFlash(true);
          setTimeout(() => setComboFlash(false), 600);
          return nextC;
        });
        setScore(prev => prev + 100 + combo * 10);
      } else if (bTime < pTime) {
        nextPlayerHP = Math.max(0, playerHP - 1);
        setPlayerHP(nextPlayerHP);
        logs.push(`🔥 ${botOpponent?.username} faster! Bạn mất 1 HP.`);
        setCombo(0);
      } else {
        logs.push(`🤝 Tie — Both Correct / Cả hai đều đúng!`);
      }
    } else if (isPlayerCorrect && !isBotCorrect) {
      nextBotHP = Math.max(0, botHP - 1);
      setBotHP(nextBotHP);
      logs.push(`🎯 Correct! Damage dealt / Gây sát thương!`);
      setCombo(prev => {
        const nextC = prev + 1;
        setMaxCombo(m => Math.max(m, nextC));
        setComboFlash(true);
        setTimeout(() => setComboFlash(false), 600);
        return nextC;
      });
      setScore(prev => prev + 100 + combo * 10);
    } else if (!isPlayerCorrect && isBotCorrect) {
      nextPlayerHP = Math.max(0, playerHP - 1);
      setPlayerHP(nextPlayerHP);
      logs.push(`🔥 Wrong! ${botOpponent?.username} hits you / Bạn sai, mất HP.`);
      setCombo(0);
    } else {
      logs.push(`💨 Both miss! No damage / Cả hai cùng sai!`);
      setCombo(0);
    }

    setFeedMessages(logs);

    setTimeout(() => {
      if (nextPlayerHP <= 0 || nextBotHP <= 0 || currentQ === activeQuestions.length - 1) {
        endDuelRound(nextPlayerHP, nextBotHP);
      } else {
        setCurrentQ(prev => {
          const nextQIdx = prev + 1;
          loadQuestion(nextQIdx, botOpponent, activeQuestions);
          return nextQIdx;
        });
      }
    }, 2800);
  };

  // ─── End Duel Round ─────────────────────────────────────────────────────
  const endDuelRound = (finalPlayerHP, finalBotHP) => {
    clearInterval(questionTimerRef.current);
    clearTimeout(botTimerRef.current);

    let roundWinner = null;
    if (finalPlayerHP > 0 && finalBotHP === 0) roundWinner = "player";
    else if (finalPlayerHP === 0 && finalBotHP > 0) roundWinner = "bot";
    else {
      if (finalPlayerHP > finalBotHP) roundWinner = "player";
      else if (finalBotHP > finalPlayerHP) roundWinner = "bot";
      else roundWinner = score > 300 ? "player" : "bot";
    }

    let nextPlayerBigHP = playerBigHP;
    let nextBotBigHP = botBigHP;

    if (roundWinner === "player") {
      nextBotBigHP = Math.max(0, botBigHP - 1);
      setBotBigHP(nextBotBigHP);
      setFeedMessages(["🏆 Round Win! Set point taken / Bạn thắng ván này!"]);
    } else {
      nextPlayerBigHP = Math.max(0, playerBigHP - 1);
      setPlayerBigHP(nextPlayerBigHP);
      setFeedMessages(["💔 Round Lost! / Bạn thua ván này!"]);
    }

    setTimeout(() => {
      if (nextPlayerBigHP <= 0 || nextBotBigHP <= 0) {
        endMatch(nextPlayerBigHP, nextBotBigHP);
      } else {
        startCardChoosingPhase(botOpponent, false);
      }
    }, 3000);
  };

  // ─── End Match ─────────────────────────────────────────────────────────
  const endMatch = (finalPlayerBigHP, finalBotBigHP) => {
    setGameState("ended");
    clearInterval(questionTimerRef.current);
    clearTimeout(botTimerRef.current);

    const won = finalPlayerBigHP > 0 && finalBotBigHP === 0;
    const delta = won ? 25 : -15;
    const nextElo = Math.max(1000, playerElo + delta);
    const nextWins = won ? playerStats.wins + 1 : playerStats.wins;
    const nextLosses = !won ? playerStats.losses + 1 : playerStats.losses;

    setEloDelta(delta);
    setPlayerElo(nextElo);
    setPlayerStats({ wins: nextWins, losses: nextLosses });
    saveStatsToStorage(nextWins, nextLosses, nextElo);

    // Add to match history
    const currentCard = selectedCard || ALL_FORUM_CARDS[0];
    const grade = getPerformanceGrade(roundCorrect, roundTotal, maxCombo);
    setMatchHistory(prev => [{
      opponent: botOpponent?.username || "Unknown",
      result: won ? "W" : "L",
      eloDelta: delta,
      map: currentCard?.title || "Mixed",
      grade,
    }, ...prev.slice(0, 4)]);
  };

  const displayRooms = (() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      return [...wsRooms, ...rooms];
    }
    return rooms;
  })();
  const percentile = Math.min(99, Math.round(((playerElo - 1000) / 1200) * 100));

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "linear-gradient(135deg, #05020f 0%, #0a0520 40%, #110830 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', 'Outfit', sans-serif",
      color: "white",
      position: "relative",
    }}>
      <OrbBackground />
      <MathParticles />

      {/* ─── LOBBY SCREEN ─── */}
      {gameState === "lobby" && (
        <div className="mrm-slide-in" style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {/* HEADER */}
          <header style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "12px 28px",
            background: "rgba(5,2,15,0.85)", backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(167,139,250,0.12)",
            flexWrap: "wrap", flexShrink: 0,
          }}>
            <Link href="/mrm" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: "white", letterSpacing: 2, fontFamily: "monospace" }}>
                DUO<span style={{ color: "#a78bfa" }}>MATH</span>
              </span>
            </Link>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
            <span style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700 }}>
              Ranked Play
            </span>

            {/* Live players count */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)",
              borderRadius: 20, padding: "4px 12px",
            }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", animation: "mrmPulse 2s infinite" }} />
              <span style={{ fontSize: 11, color: "#4ade80", fontWeight: 700 }}>{onlineCount} online</span>
            </div>

            <div style={{ flex: 1 }} />

            {/* Player rank card */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(167,139,250,0.06)",
              border: `1px solid ${getRankColor(playerRank)}33`,
              borderRadius: 12, padding: "8px 14px",
            }}>
              <RankBadge rank={playerRank} size={34} />
              <div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "white" }}>{playerUsername}</div>
                <div style={{ fontSize: 10, color: getRankColor(playerRank), fontWeight: 700 }}>
                  {playerRank} · {playerElo} ELO
                </div>
              </div>
            </div>

            <Link href="/" style={{ textDecoration: "none" }}>
              <button style={{
                padding: "8px 16px", borderRadius: 8, fontSize: 12,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.6)", cursor: "pointer",
              }}>← Trang chủ</button>
            </Link>
          </header>

          {/* TAB BAR — osu! pill style */}
          <div style={{
            display: "flex", gap: 8,
            background: "rgba(5,2,15,0.8)", backdropFilter: "blur(12px)",
            padding: "12px 28px",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            flexShrink: 0,
          }}>
            {[
              { key: "browse", icon: "🔍", label: "Browse Rooms", enLabel: "Tìm phòng" },
              { key: "create", icon: "➕", label: "Create", enLabel: "Tạo phòng" },
              { key: "ranked", icon: "⚡", label: "Quick Match", enLabel: "Xếp hạng nhanh" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: "8px 18px", border: "none", cursor: "pointer",
                background: tab === t.key
                  ? "linear-gradient(135deg, rgba(167,139,250,0.25), rgba(109,40,217,0.2))"
                  : "rgba(255,255,255,0.03)",
                fontSize: 12, fontWeight: tab === t.key ? 800 : 500,
                color: tab === t.key ? "#a78bfa" : "rgba(255,255,255,0.45)",
                borderRadius: 20,
                border: tab === t.key ? "1px solid rgba(167,139,250,0.4)" : "1px solid rgba(255,255,255,0.06)",
                transition: "all 0.2s",
              }}>
                {t.icon} {t.label}
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginLeft: 4 }}>({t.enLabel})</span>
              </button>
            ))}
          </div>

          {/* MAIN CONTENT — 3 PANEL LAYOUT */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

            {/* CENTER: Tab content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>

              {/* BROWSE TAB */}
              {tab === "browse" && (
                <>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>
                      {displayRooms.filter(r => r.status === "waiting").length} ROOMS OPEN
                    </div>
                    <button onClick={() => {
                      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                        socketRef.current.send(JSON.stringify({ type: "join_lobby" }));
                      } else {
                        setRooms(INITIAL_ROOMS);
                      }
                    }} style={{
                      padding: "5px 14px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                      background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.25)",
                      color: "#a78bfa", fontWeight: 700,
                    }}>
                      ↻ Refresh
                    </button>
                  </div>

                  {displayRooms.map(room => {
                    const dc = getDiffColor(room.diff);
                    return (
                      <div key={room.id} className="mrm-room-item" style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: "14px 18px",
                        background: room.status === "in_game"
                          ? "rgba(10,5,25,0.4)"
                          : "rgba(15,10,35,0.65)",
                        border: `1px solid ${room.status === "in_game" ? "rgba(255,255,255,0.04)" : "rgba(167,139,250,0.1)"}`,
                        borderLeft: `3px solid ${room.status === "in_game" ? "#334155" : dc.color}`,
                        borderRadius: 12, marginBottom: 8,
                        opacity: room.status === "in_game" ? 0.55 : 1,
                        transition: "all 0.2s",
                      }}
                        onMouseEnter={e => room.status === "waiting" && (e.currentTarget.style.background = "rgba(167,139,250,0.08)")}
                        onMouseLeave={e => e.currentTarget.style.background = room.status === "in_game" ? "rgba(10,5,25,0.4)" : "rgba(15,10,35,0.65)"}
                      >
                        {/* Host avatar circle */}
                        <div style={{
                          width: 46, height: 46, borderRadius: "50%",
                          background: "linear-gradient(135deg, #4c1d95, #7c3aed)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 20, flexShrink: 0,
                          border: "2px solid rgba(167,139,250,0.3)",
                          overflow: "hidden"
                        }}>
                          {renderAvatar(room.host_avatar || BOTS.find(b => b.username === room.host)?.avatar || "⚔️", room.host)}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{room.host}</span>
                            <button
                              onClick={e => { e.stopPropagation(); setSelectedReportUser(room.host); setShowReportModal(true); }}
                              style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: 11, padding: "0 2px" }}
                              title="Report"
                            >🚩</button>
                            <DiffStars diff={room.diff} />
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{room.grade}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>
                            📐 {room.map}
                          </div>
                          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>
                              👥 {room.players}/{room.maxPlayers}
                            </span>
                            <span style={{
                              fontSize: 10, fontWeight: 700,
                              color: room.elo === "Tất cả" ? "#4ade80" : "#fbbf24",
                            }}>ELO {room.elo}</span>
                          </div>
                        </div>

                        {room.status === "waiting" ? (
                          <button
                            onClick={() => handleJoinRoom(room)}
                            disabled={joiningRoomId !== null}
                            style={{
                              padding: "10px 22px", borderRadius: 8, fontSize: 12, fontWeight: 800,
                              background: joiningRoomId === room.id
                                ? "rgba(167,139,250,0.2)"
                                : "linear-gradient(135deg, #a78bfa, #7c3aed)",
                              border: "none", color: "white",
                              cursor: joiningRoomId ? "default" : "pointer",
                              transition: "all 0.2s", flexShrink: 0,
                              boxShadow: joiningRoomId !== room.id ? "0 4px 16px rgba(167,139,250,0.35)" : "none",
                            }}
                          >
                            {joiningRoomId === room.id ? `Vào... ${countdown}` : "JOIN"}
                          </button>
                        ) : (
                          <span style={{
                            padding: "8px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700,
                            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                            color: "#f87171", flexShrink: 0,
                          }}>PLAYING</span>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {/* CREATE TAB */}
              {tab === "create" && (
                <div style={{ maxWidth: 480 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: "white", marginBottom: 20 }}>
                    Create Room / <span style={{ color: "#a78bfa" }}>Tạo phòng mới</span>
                  </div>
                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 700, display: "block", marginBottom: 5 }}>
                      MathMap / Chủ đề
                    </label>
                    <select 
                      value={createMap}
                      onChange={(e) => setCreateMap(e.target.value)}
                      style={{
                        width: "100%", padding: "11px 14px",
                        background: "rgba(10,5,30,0.8)", border: "1px solid rgba(167,139,250,0.2)",
                        borderRadius: 8, color: "white", fontSize: 13, cursor: "pointer", outline: "none",
                      }}
                    >
                      {["Phương trình bậc hai nâng cao", "Lượng giác - Tổng hợp", "Đạo hàm & Ứng dụng", "Hình học phẳng"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 700, display: "block", marginBottom: 5 }}>
                      Min ELO Requirement / ELO tối thiểu
                    </label>
                    <select 
                      value={createMinElo}
                      onChange={(e) => setCreateMinElo(e.target.value)}
                      style={{
                        width: "100%", padding: "11px 14px",
                        background: "rgba(10,5,30,0.8)", border: "1px solid rgba(167,139,250,0.2)",
                        borderRadius: 8, color: "white", fontSize: 13, cursor: "pointer", outline: "none",
                      }}
                    >
                      {["Tất cả", "1200+", "1400+", "1600+", "1800+", "2000+"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 700, display: "block", marginBottom: 5 }}>
                      Mode
                    </label>
                    <select 
                      value={createMode}
                      onChange={(e) => setCreateMode(e.target.value)}
                      style={{
                        width: "100%", padding: "11px 14px",
                        background: "rgba(10,5,30,0.8)", border: "1px solid rgba(167,139,250,0.2)",
                        borderRadius: 8, color: "white", fontSize: 13, cursor: "pointer", outline: "none",
                      }}
                    >
                      {["Ranked (Tính ELO)", "Friendly (Practice)"].map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <button onClick={() => {
                    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                      socketRef.current.send(JSON.stringify({
                        type: "create_room",
                        map_info: {
                          title: createMap,
                          grade: "Lớp 11",
                          difficulty_fmp: 7.8
                        },
                        wager: 0
                      }));
                    } else {
                      setTab("browse");
                      const newRoom = {
                        id: `r_${Date.now()}`, host: playerUsername, map: createMap,
                        grade: "Lớp 11", diff: 7.8, players: 1, maxPlayers: 2, status: "waiting",
                        elo: `${playerElo - 50}+`,
                      };
                      setRooms(prev => [newRoom, ...prev]);
                      setTimeout(() => handleJoinRoom(newRoom), 100);
                    }
                  }} style={{
                    width: "100%", padding: "14px 0", marginTop: 8, borderRadius: 10,
                    background: "linear-gradient(135deg, #a78bfa, #6d28d9)",
                    border: "none", color: "white", fontSize: 14, fontWeight: 900,
                    cursor: "pointer", boxShadow: "0 4px 20px rgba(167,139,250,0.4)",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    ⚔️ Create & Wait for Opponent
                  </button>
                </div>
              )}

              {/* RANKED TAB */}
              {tab === "ranked" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 20px" }}>
                  {/* Rank display */}
                  <div style={{ marginBottom: 28, textAlign: "center" }}>
                    <RankBadge rank={playerRank} size={80} />
                    <div style={{ fontSize: 22, fontWeight: 900, color: "white", marginTop: 12 }}>{playerRank}</div>
                    <div style={{ fontSize: 13, color: getRankColor(playerRank), marginTop: 4 }}>{playerElo} Rating</div>
                  </div>

                  {/* Stats grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24, width: "100%", maxWidth: 380 }}>
                    {[
                      { label: "Wins", value: playerStats.wins, color: "#4ade80" },
                      { label: "Losses", value: playerStats.losses, color: "#f87171" },
                      {
                        label: "Win Rate",
                        value: (playerStats.wins + playerStats.losses > 0
                          ? Math.round(playerStats.wins / (playerStats.wins + playerStats.losses) * 100)
                          : 0) + "%",
                        color: "#fbbf24",
                      },
                    ].map(s => (
                      <div key={s.label} style={{
                        textAlign: "center", padding: "14px 8px",
                        background: "rgba(10,5,30,0.6)", borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <div style={{ fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Percentile bar */}
                  <div style={{ width: "100%", maxWidth: 380, marginBottom: 28 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 5 }}>
                      <span>Skill Percentile / Phân vị kỹ năng</span>
                      <span style={{ color: "#a78bfa" }}>Top {100 - percentile}%</span>
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 6 }}>
                      <div style={{
                        width: `${percentile}%`, height: "100%",
                        background: `linear-gradient(90deg, ${getRankColor(playerRank)}, #a78bfa)`,
                        borderRadius: 6, transition: "width 1s ease",
                      }} />
                    </div>
                  </div>

                  <button onClick={startMatching} style={{
                    padding: "16px 64px", borderRadius: 12,
                    background: "linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #4c1d95 100%)",
                    border: "none", color: "white", fontSize: 16, fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: "0 0 40px rgba(167,139,250,0.5), 0 4px 24px rgba(167,139,250,0.4)",
                    transition: "all 0.25s", letterSpacing: 1,
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.05)"; e.currentTarget.style.boxShadow = "0 0 60px rgba(167,139,250,0.7), 0 8px 32px rgba(167,139,250,0.5)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 0 40px rgba(167,139,250,0.5), 0 4px 24px rgba(167,139,250,0.4)"; }}
                  >
                    ⚡ FIND MATCH
                  </button>
                  <div style={{ marginTop: 8, fontSize: 11, color: "rgba(255,255,255,0.2)" }}>
                    Est. ~4s queue time
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR */}
            <div style={{
              width: 270, flexShrink: 0,
              background: "rgba(5,2,15,0.9)", backdropFilter: "blur(16px)",
              borderLeft: "1px solid rgba(255,255,255,0.05)",
              display: "flex", flexDirection: "column", padding: 16, gap: 14,
              overflowY: "auto",
            }}>
              {/* Rating Display */}
              <div style={{
                background: "linear-gradient(135deg, rgba(167,139,250,0.08), rgba(109,40,217,0.05))",
                border: "1px solid rgba(167,139,250,0.15)",
                borderRadius: 12, padding: 14,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 10, letterSpacing: 1 }}>
                  ◆ RATING DISPLAY
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <RankBadge rank={playerRank} size={40} />
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: "white", lineHeight: 1 }}>{playerElo}</div>
                    <div style={{ fontSize: 10, color: getRankColor(playerRank), marginTop: 2 }}>{playerRank}</div>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                  Top {100 - percentile}% of active players
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 4 }}>
                  <div style={{
                    width: `${percentile}%`, height: "100%",
                    background: `linear-gradient(90deg, ${getRankColor(playerRank)}, #a78bfa)`,
                    borderRadius: 4,
                  }} />
                </div>
              </div>

              {/* Match History */}
              <div style={{
                background: "rgba(251,191,36,0.05)",
                border: "1px solid rgba(251,191,36,0.12)",
                borderRadius: 12, padding: 14,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24", marginBottom: 10, letterSpacing: 1 }}>
                  ◆ MATCH HISTORY
                </div>
                {matchHistory.slice(0, 5).map((m, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "7px 0",
                    borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>
                    {/* Grade badge */}
                    <div style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: m.grade === "S" ? "rgba(251,191,36,0.2)" : m.grade === "A" ? "rgba(74,222,128,0.15)" : m.grade === "B" ? "rgba(56,189,248,0.15)" : "rgba(239,68,68,0.15)",
                      border: `1px solid ${m.grade === "S" ? "#fbbf24" : m.grade === "A" ? "#4ade80" : m.grade === "B" ? "#38bdf8" : "#f87171"}44`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 900, flexShrink: 0,
                      color: m.grade === "S" ? "#fbbf24" : m.grade === "A" ? "#4ade80" : m.grade === "B" ? "#38bdf8" : "#f87171",
                    }}>{m.grade}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: m.result === "W" ? "#4ade80" : "#f87171", display: "flex", alignItems: "center", gap: 4 }}>
                        {m.result === "W" ? "WIN" : "LOSS"}
                        <span style={{ fontWeight: 700, color: m.eloDelta > 0 ? "#4ade80" : "#f87171", fontSize: 10 }}>
                          {m.eloDelta > 0 ? `+${m.eloDelta}` : m.eloDelta}
                        </span>
                      </div>
                      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        vs {m.opponent}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Season info */}
              <div style={{
                background: "rgba(14,165,233,0.05)",
                border: "1px solid rgba(14,165,233,0.12)",
                borderRadius: 12, padding: 14,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", marginBottom: 8, letterSpacing: 1 }}>
                  ◆ SEASON 1
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Kết thúc sau</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#38bdf8" }}>14 ngày</div>
              </div>

              {/* Rules */}
              <div style={{
                background: "rgba(167,139,250,0.04)",
                border: "1px solid rgba(167,139,250,0.1)",
                borderRadius: 12, padding: 14,
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", marginBottom: 10, letterSpacing: 1 }}>
                  ◆ HOW TO PLAY
                </div>
                {[
                  "Discard 2 maps from pool of 6 / Bỏ 2 lá khỏi bộ 6",
                  "Lower ELO picks the map / ELO thấp hơn chọn trước",
                  "Answer faster to deal damage / Trả lời nhanh hơn để gây sát thương",
                  "Win 3 sets to claim victory / Thắng 3 set để chiến thắng",
                ].map((s, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 7, marginBottom: 7, fontSize: 10,
                    color: "rgba(255,255,255,0.5)", alignItems: "flex-start",
                  }}>
                    <span style={{ color: "#a78bfa", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── MATCHMAKING SCREEN ─── */}
      {gameState === "matching" && (
        <div className="mrm-slide-in" style={{
          position: "relative", zIndex: 1,
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", padding: 24,
        }}>
          {/* Dual player cards */}
          <div style={{ display: "flex", alignItems: "center", gap: 48, marginBottom: 48 }}>
            {/* Your card */}
            <div className="mrm-slide-left" style={{
              background: "rgba(10,5,30,0.8)", border: "2px solid rgba(56,189,248,0.35)",
              borderRadius: 16, padding: "24px 20px", textAlign: "center", width: 180,
              boxShadow: "0 0 30px rgba(56,189,248,0.15), 0 12px 32px rgba(0,0,0,0.5)",
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: "50%",
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 10px", overflow: "hidden",
                border: "2px solid rgba(14,165,233,0.4)"
              }}>
                {renderAvatar(user?.avatar_url, playerUsername)}
              </div>
              <RankBadge rank={playerRank} size={36} />
              <div style={{ fontSize: 14, fontWeight: 900, color: "white", marginTop: 8 }}>{playerUsername}</div>
              <div style={{ fontSize: 11, color: getRankColor(playerRank), marginTop: 2 }}>{playerRank}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{playerElo} Rating</div>
            </div>

            {/* Center pulsing radar */}
            <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  position: "absolute", inset: i * 16, borderRadius: "50%",
                  border: "1.5px solid rgba(167,139,250,0.4)",
                  animation: `mrmRadar 2.4s ${i * 0.6}s cubic-bezier(0, 0, 0.2, 1) infinite`,
                }} />
              ))}
              <div style={{
                position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 36, filter: "drop-shadow(0 0 16px #a78bfa)",
              }}>⚡</div>
            </div>

            {/* Opponent ??? card */}
            <div className="mrm-slide-right" style={{
              background: "rgba(10,5,30,0.8)", border: "2px solid rgba(239,68,68,0.25)",
              borderRadius: 16, padding: "24px 20px", textAlign: "center", width: 180,
              boxShadow: "0 0 30px rgba(239,68,68,0.1), 0 12px 32px rgba(0,0,0,0.5)",
              opacity: 0.7,
            }}>
              <div style={{ fontSize: 44, marginBottom: 10 }}>❓</div>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 14, fontWeight: 900, color: "rgba(255,255,255,0.6)" }}>???</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>Searching...</div>
            </div>
          </div>

          <div style={{ fontSize: 22, fontWeight: 900, color: "white", marginBottom: 6 }}>Searching for Opponent</div>
          <div style={{ fontSize: 13, color: "#a78bfa", fontWeight: 700, marginBottom: 4 }}>
            ELO Range: {playerElo - 100 - matchTimer * 20} ~ {playerElo + 100 + matchTimer * 20}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 36 }}>
            {matchTimer}s elapsed — Đang tìm đối thủ...
          </div>

          <button onClick={cancelMatching} style={{
            padding: "12px 32px", borderRadius: 10, fontSize: 13, fontWeight: 700,
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171", cursor: "pointer", transition: "all 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
          >
            ✕ Cancel / Hủy tìm trận
          </button>
        </div>
      )}

      {/* ─── FACEOFF SCREEN ─── */}
      {gameState === "faceoff" && botOpponent && (
        <div className="mrm-slide-in" style={{
          position: "relative", zIndex: 1,
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", padding: 24,
          background: "radial-gradient(ellipse at center, rgba(109,40,217,0.15) 0%, transparent 70%)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 56, flexWrap: "wrap", justifyContent: "center", marginBottom: 36 }}>
            {/* Player */}
            <div className="mrm-slide-left" style={{
              width: 220, padding: "32px 20px",
              background: "rgba(8,5,25,0.85)", borderRadius: 16,
              border: "2px solid rgba(56,189,248,0.4)",
              boxShadow: "0 0 40px rgba(56,189,248,0.2), 0 16px 40px rgba(0,0,0,0.6)",
              textAlign: "center",
              transform: "skewX(-6deg)",
            }}>
              <div style={{ transform: "skewX(6deg)" }}>
                <div style={{
                  width: 70, height: 70, borderRadius: "50%",
                  background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px", overflow: "hidden",
                  border: "2px solid rgba(14,165,233,0.4)",
                  boxShadow: "0 0 12px rgba(14,165,233,0.3)"
                }}>
                  {renderAvatar(user?.avatar_url, playerUsername)}
                </div>
                <RankBadge rank={playerRank} size={44} />
                <div style={{ fontSize: 18, fontWeight: 900, color: "white", marginTop: 10 }}>{playerUsername}</div>
                <div style={{ fontSize: 12, color: getRankColor(playerRank), fontWeight: 800, marginTop: 2 }}>{playerRank}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{playerElo} Rating</div>
              </div>
            </div>

            {/* VS */}
            <div className="mrm-bounce-in" style={{
              fontSize: 52, fontWeight: 950, color: "#ef4444",
              fontStyle: "italic", textShadow: "0 0 30px rgba(239,68,68,0.7)",
              transform: "skewX(-10deg)", letterSpacing: -2,
            }}>VS</div>

            {/* Bot */}
            <div className="mrm-slide-right" style={{
              width: 220, padding: "32px 20px",
              background: "rgba(8,5,25,0.85)", borderRadius: 16,
              border: "2px solid rgba(239,68,68,0.4)",
              boxShadow: "0 0 40px rgba(239,68,68,0.2), 0 16px 40px rgba(0,0,0,0.6)",
              textAlign: "center",
              transform: "skewX(-6deg)",
            }}>
              <div style={{ transform: "skewX(6deg)" }}>
                <div style={{
                  width: 70, height: 70, borderRadius: "50%",
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 14px", overflow: "hidden",
                  border: "2px solid rgba(239,68,68,0.4)",
                  boxShadow: "0 0 12px rgba(239,68,68,0.3)"
                }}>
                  {renderAvatar(botOpponent.avatar, botOpponent.username)}
                </div>
                <RankBadge rank={botOpponent.rank} size={44} />
                <div style={{ fontSize: 18, fontWeight: 900, color: "white", marginTop: 10 }}>{botOpponent.username}</div>
                <div style={{ fontSize: 12, color: getRankColor(botOpponent.rank), fontWeight: 800, marginTop: 2 }}>{botOpponent.rank}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{botOpponent.elo} Rating</div>
              </div>
            </div>
          </div>

          <div style={{
            fontSize: 14, fontWeight: 900, color: "#a5b4fc", letterSpacing: 3,
            textTransform: "uppercase", animation: "mrmFlash 1.5s infinite",
          }}>
            Match Starting... / Trận đấu sắp bắt đầu
          </div>
        </div>
      )}

      {/* ─── CARD CHOOSING / DISCARD PHASE ─── */}
      {gameState === "card_choosing" && botOpponent && (
        <div className="mrm-slide-in" style={{
          position: "relative", zIndex: 1,
          flex: 1, display: "flex", flexDirection: "column",
          minHeight: "100vh",
          background: selectedCard 
            ? `linear-gradient(rgba(224, 34, 122, 0.65), rgba(92, 10, 48, 0.85)), url(${selectedCard.bgImage}) center/cover no-repeat`
            : "linear-gradient(160deg, #e0227a 0%, #a1114f 55%, #5c0a30 100%)",
          padding: "22px 18px 30px",
          boxSizing: "border-box",
          fontFamily: "system-ui, sans-serif",
          overflow: "hidden",
          transition: "background 0.5s ease"
        }}>
          {/* Custom style injection */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes floatUp {
              0% { transform: translateY(0) rotate(0deg); opacity: 0; }
              10% { opacity: 0.6; }
              90% { opacity: 0.4; }
              100% { transform: translateY(-700px) rotate(15deg); opacity: 0; }
            }
            @keyframes pulseTitle {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
            @keyframes dotPulse {
              0%, 100% { background: rgba(255,255,255,0.12); }
              50% { background: #ffe3ee; }
            }
            .pick-dot {
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: rgba(255,255,255,0.12);
              border: 1px solid rgba(255,255,255,0.35);
              animation: dotPulse 2.4s ease-in-out infinite;
            }
            .pick-dot:nth-child(1) { animation-delay: 0s; }
            .pick-dot:nth-child(2) { animation-delay: 0.3s; }
            .pick-dot:nth-child(3) { animation-delay: 0.6s; }
            .pick-dot:nth-child(4) { animation-delay: 0.9s; }
            .pick-dot:nth-child(5) { animation-delay: 1.2s; }

            .pick-card-item {
              transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1), z-index 0.1s;
            }
            .pick-card-item:hover {
              transform: translateY(-28px) rotate(0deg) !important;
              z-index: 1000 !important;
            }
            .pick-card-item:hover .card-inner {
              transform: rotateY(180deg);
              box-shadow: 0 15px 35px rgba(224, 34, 122, 0.6);
            }
            /* Flipped state if selected */
            .pick-card-item.is-selected .card-inner {
              transform: rotateY(180deg);
              box-shadow: 0 0 0 2px #fff, 0 10px 30px rgba(255,255,255,0.5);
            }
            /* Discarded state styling */
            .pick-card-item.is-discarded {
              opacity: 0.25;
              pointer-events: none;
            }
          `}} />

          {/* Floating Triangles Background */}
          <div id="tris" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
            {trisList.map(t => (
              <div key={t.id} style={{
                position: "absolute",
                left: `${t.left}%`,
                bottom: "-40px",
                width: t.size,
                height: t.size,
                background: "rgba(255,255,255,0.06)",
                clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                animation: `floatUp ${t.dur}s linear infinite`,
                animationDelay: `${t.delay}s`
              }} />
            ))}
          </div>

          {/* Header Row */}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 16 }}>⏱️</span>
              <span style={{ color: "#fbd7e6", fontSize: 12, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {gamePhase === "discarding" ? "discard phase" : "pick phase"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <div className="pick-dot"></div>
              <div className="pick-dot"></div>
              <div className="pick-dot"></div>
              <div className="pick-dot"></div>
              <div className="pick-dot"></div>
            </div>
          </div>

          {/* Pick Phase Progress Bar */}
          <div style={{ position: "relative", width: "100%", height: 8, background: "rgba(255,255,255,.15)", borderRadius: 6, marginTop: 12, overflow: "hidden", zIndex: 1 }}>
            <div id="hp" style={{
              height: "100%",
              width: `${(timeLeft / 30) * 100}%`,
              background: "#ffe3ee",
              borderRadius: 6,
              transition: "width 1s linear"
            }} />
          </div>

          {/* Title Area */}
          <div style={{ position: "relative", textAlign: "center", marginTop: 40, zIndex: 1 }}>
            <div id="ptitle" style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "0.08em",
              color: "#fff",
              textTransform: "uppercase",
              animation: "pulseTitle 1.8s ease-in-out infinite"
            }}>
              {gamePhase === "discarding" ? "LOẠI BỎ CHỦ ĐỀ" : "CHỌN MAP BẮT ĐẦU"}
            </div>
            <div style={{ fontSize: 13, color: "#ffc4dc", marginTop: 6, fontWeight: 600 }}>
              {chooser === "player" ? "Đến lượt bạn chọn — Rê chuột vào lá bài để lật" : `Đang chờ ${botOpponent.username} thao tác...`}
            </div>
            <div id="timer" style={{ marginTop: 12, fontSize: 20, color: "#fff", fontWeight: 900, background: "rgba(0,0,0,0.3)", display: "inline-block", padding: "4px 16px", borderRadius: 12 }}>
              {timeLeft}s
            </div>
          </div>

          {/* Fanned Cards Section */}
          <div style={{
            position: "relative",
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingBottom: 20,
            zIndex: 1
          }}>
            <div style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-end",
              height: 240,
              width: "100%",
              maxWidth: 900
            }}>
              {ALL_FORUM_CARDS.map((card, idx) => {
                const isDiscarded = discardedCards.includes(card.id);
                const isUnavailable = gamePhase === "picking" && discardedCards.includes(card.id);
                const isSelected = selectedCard && selectedCard.id === card.id;
                const canDiscard = gamePhase === "discarding" && chooser === "player" && discardedCards.length < DISCARD_COUNT && !isDiscarded;
                const canPick = gamePhase === "picking" && chooser === "player" && !isDiscarded && !selectedCard;

                // Fan Math (Rotation + TranslateY)
                const totalCards = ALL_FORUM_CARDS.length;
                const midIndex = (totalCards - 1) / 2;
                const rotateVal = (idx - midIndex) * 5.5; // Fan angles
                const translateVal = Math.abs(idx - midIndex) * 7.5; // Fan depth curve

                return (
                  <div
                    key={card.id}
                    className={`pick-card-item ${isDiscarded ? "is-discarded" : ""} ${isSelected ? "is-selected" : ""}`}
                    onClick={() => {
                      if (canPick) handleSelectCard(card);
                    }}
                    style={{
                      position: "relative",
                      width: 142,
                      height: 260,
                      perspective: 700,
                      cursor: (canDiscard || canPick) ? "pointer" : "default",
                      transform: `rotate(${rotateVal}deg) translateY(${translateVal}px)`,
                      margin: "0 -22px", // Overlap cards tightly
                      zIndex: isSelected ? 100 : idx,
                    }}
                  >
                    <div className="card-inner" style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      transformStyle: "preserve-3d",
                      transition: "transform 0.55s cubic-bezier(.2,.8,.2,1)",
                    }}>
                      {/* CARD FRONT: Cover logo */}
                      <div className="card-face card-front" style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        borderRadius: 10,
                        background: "linear-gradient(160deg, #c21868, #7a0e42)",
                        border: "1px solid rgba(255,255,255,.25)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        <span style={{ fontSize: 36, color: "rgba(255,255,255,.65)" }}>✨</span>
                        <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 8, fontWeight: 900, letterSpacing: 1.5, marginTop: 8 }}>DUOMATH</span>
                      </div>

                      {/* CARD BACK: Map details */}
                      <div className="card-face card-back" style={{
                        position: "absolute",
                        inset: 0,
                        backfaceVisibility: "hidden",
                        WebkitBackfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        borderRadius: 10,
                        background: "rgba(23, 13, 48, 0.95)",
                        border: isSelected ? "2px solid #fff" : "1px solid rgba(255,255,255,.25)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden"
                      }}>
                        {/* Discard trigger (inside card details) */}
                        {canDiscard && (
                          <button
                            onClick={e => { e.stopPropagation(); handleDiscardCard(card); }}
                            style={{
                              position: "absolute", top: 6, right: 6,
                              width: 20, height: 20, borderRadius: "50%",
                              background: "rgba(239,68,68,0.75)", border: "1px solid rgba(239,68,68,0.9)",
                              color: "#fff", fontSize: 10, fontWeight: 900,
                              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                              zIndex: 10
                            }}
                          >
                            ✕
                          </button>
                        )}

                        {/* Card Image Cover (osu! Style) */}
                        <div style={{
                          width: "100%",
                          height: "85px",
                          backgroundImage: `url(${card.thumbnail})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          position: "relative",
                          borderBottom: "1px solid rgba(255,255,255,0.15)"
                        }}>
                          {/* Title overlay */}
                          <div style={{
                            position: "absolute",
                            inset: 0,
                            background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 100%)",
                            display: "flex",
                            alignItems: "flex-end",
                            padding: "6px 8px"
                          }}>
                            <div>
                              <div style={{ fontSize: 7, color: "#ffc4dc", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.5 }}>
                                {card.enTitle}
                              </div>
                              <h3 style={{ fontSize: 10, fontWeight: 900, color: "#fff", margin: "1px 0 0" }}>{card.title}</h3>
                            </div>
                          </div>
                        </div>

                        {/* Card Details & Stats */}
                        <div style={{ padding: "8px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          {/* Stats block (resembling osu! metadata list) */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {/* Diff Bar */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4, fontSize: 8, color: "rgba(255,255,255,0.8)" }}>
                              <span>Difficulty:</span>
                              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ width: `${(card.diff / 10) * 100}%`, height: "100%", background: card.color || "#ffc4dc", borderRadius: 2 }} />
                              </div>
                              <span style={{ fontWeight: 800, fontSize: 8 }}>{card.diff}★</span>
                            </div>

                            {/* Questions Bar */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4, fontSize: 8, color: "rgba(255,255,255,0.8)" }}>
                              <span>Questions:</span>
                              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ width: "50%", height: "100%", background: "#4ade80", borderRadius: 2 }} />
                              </div>
                              <span style={{ fontWeight: 800 }}>5</span>
                            </div>

                            {/* Time limit Bar */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4, fontSize: 8, color: "rgba(255,255,255,0.8)" }}>
                              <span>Time Limit:</span>
                              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ width: "60%", height: "100%", background: "#38bdf8", borderRadius: 2 }} />
                              </div>
                              <span style={{ fontWeight: 800 }}>30s</span>
                            </div>

                            {/* Accuracy required Bar */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 4, fontSize: 8, color: "rgba(255,255,255,0.8)" }}>
                              <span>Req Acc:</span>
                              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.12)", borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ width: "80%", height: "100%", background: "#fbbf24", borderRadius: 2 }} />
                              </div>
                              <span style={{ fontWeight: 800 }}>80%</span>
                            </div>
                          </div>

                          {/* Description short text */}
                          <p style={{
                            fontSize: 7.5,
                            color: "rgba(255,255,255,0.45)",
                            lineHeight: 1.2,
                            margin: "4px 0 0",
                            overflow: "hidden",
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical"
                          }}>
                            {card.desc}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Match load indicator */}
          {selectedCard && (
            <div style={{
              position: "relative",
              alignSelf: "center",
              padding: "10px 24px",
              background: "rgba(34,197,94,0.15)",
              border: "1px solid rgba(34,197,94,0.4)",
              borderRadius: 20,
              color: "#4ade80",
              fontSize: 13,
              fontWeight: 800,
              zIndex: 1,
              animation: "mrmPulse 1.5s infinite",
              marginTop: 10
            }}>
              ✓ Đã chọn: &quot;{selectedCard.title}&quot; — Trận đấu đang tải...
            </div>
          )}
        </div>
      )}

      {/* ─── PLAYING ARENA ─── */}
      {gameState === "playing" && botOpponent && (
        <div className="mrm-slide-in" style={{
          position: "relative", zIndex: 1,
          flex: 1, display: "flex", flexDirection: "column",
          minHeight: "100vh",
          background: "radial-gradient(circle at 50% 60%, rgba(6, 182, 212, 0.22) 0%, #03020a 80%)",
        }}>
          {/* ── Map Background Image Layer ── */}
          {mapBgImage && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
              backgroundImage: `url(${mapBgImage})`,
              backgroundSize: "cover", backgroundPosition: "center",
              opacity: mapBgOpacity,
              transition: "opacity 0.5s ease",
            }} />
          )}

          {/* ── Opacity Adjustment Panel (5s toast) ── */}
          {showBgPanel && mapBgImage && (
            <div style={{
              position: "fixed", top: 80, right: 20, zIndex: 999,
              background: "rgba(5,8,20,0.92)", backdropFilter: "blur(16px)",
              border: "1px solid rgba(34,211,238,0.3)",
              borderRadius: 14, padding: "14px 18px", width: 280,
              boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 16px rgba(34,211,238,0.15)",
              animation: "mrmSlideIn 0.3s ease-out both",
            }}>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#22d3ee", letterSpacing: 0.5 }}>
                  🖼️ MAP BACKGROUND
                </div>
                <button
                  onClick={() => { setShowBgPanel(false); clearTimeout(bgPanelTimerRef.current); }}
                  style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 14 }}
                >✕</button>
              </div>

              {/* Mini preview strip */}
              <div style={{
                width: "100%", height: 54, borderRadius: 8, marginBottom: 10, overflow: "hidden",
                backgroundImage: `url(${mapBgImage})`,
                backgroundSize: "cover", backgroundPosition: "center",
                opacity: mapBgOpacity, border: "1px solid rgba(255,255,255,0.1)",
                position: "relative",
              }}>
                <div style={{
                  position: "absolute", inset: 0,
                  background: `rgba(3,2,10,${1 - mapBgOpacity})`,
                }} />
                <div style={{
                  position: "absolute", inset: 0, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontSize: 10, color: "rgba(255,255,255,0.7)", fontWeight: 700,
                }}>
                  Preview — {Math.round(mapBgOpacity * 100)}%
                </div>
              </div>

              {/* Opacity Slider */}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", minWidth: 18 }}>0%</span>
                <input
                  type="range" min={0} max={100} value={Math.round(mapBgOpacity * 100)}
                  onChange={e => setMapBgOpacity(Number(e.target.value) / 100)}
                  style={{ flex: 1, accentColor: "#22d3ee", height: 4, cursor: "pointer" }}
                />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", minWidth: 24 }}>100%</span>
              </div>

              {/* Value badge */}
              <div style={{ textAlign: "center", marginTop: 6 }}>
                <span style={{
                  fontSize: 12, fontWeight: 800, color: "#22d3ee",
                  background: "rgba(34,211,238,0.12)", borderRadius: 6,
                  padding: "2px 10px", border: "1px solid rgba(34,211,238,0.25)",
                }}>
                  Opacity: {Math.round(mapBgOpacity * 100)}%
                </span>
              </div>

              {/* Auto-close timer bar */}
              <div style={{
                marginTop: 10, height: 2, borderRadius: 2,
                background: "rgba(255,255,255,0.08)", overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", width: "100%",
                  background: "linear-gradient(90deg, #22d3ee, #0ea5e9)",
                  animation: "mrmTimerBar 5s linear forwards",
                  transformOrigin: "left",
                }} />
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textAlign: "right", marginTop: 3 }}>
                Tự đóng sau 5s
              </div>
            </div>
          )}

          {/* TOP HUD */}
          <div style={{
            background: "rgba(3,2,10,0.95)", backdropFilter: "blur(16px)",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            position: "relative", zIndex: 2,
          }}>
            {/* Player & bot info row */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 120px 1fr",
              padding: "12px 24px", gap: 16, alignItems: "center",
            }}>
              {/* Player panel */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, border: "2px solid rgba(14,165,233,0.4)",
                  boxShadow: "0 0 12px rgba(14,165,233,0.3)",
                  overflow: "hidden"
                }}>
                  {renderAvatar(user?.avatar_url, playerUsername)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{playerUsername}</span>
                    {playerSubmitted && (
                      <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 700, background: "rgba(74,222,128,0.1)", borderRadius: 4, padding: "1px 5px" }}>✓</span>
                    )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <span style={{ fontSize: 10, color: playerSubmitted ? "#4ade80" : "#a78bfa" }}>
                      {playerSubmitted ? "Answered" : "Thinking..."}
                    </span>
                    {combo > 1 && (
                      <span style={{
                        fontSize: 10, fontWeight: 900, color: "#fbbf24",
                        background: "rgba(251,191,36,0.15)", borderRadius: 4, padding: "1px 5px",
                        animation: comboFlash ? "mrmComboFlash 0.3s ease" : "none",
                      }}>
                        {combo}x COMBO
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Center timer + sound */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  border: `3px solid ${timeLeft < 10 ? "#ef4444" : "#a78bfa"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 17, fontWeight: 900, color: timeLeft < 10 ? "#ef4444" : "white",
                  boxShadow: `0 0 16px ${timeLeft < 10 ? "rgba(239,68,68,0.4)" : "rgba(167,139,250,0.3)"}`,
                  background: timeLeft < 10 ? "rgba(239,68,68,0.08)" : "transparent",
                  transition: "all 0.3s",
                }}>
                  {timeLeft}
                </div>
                <button onClick={() => {
                  if (isMuted) setIsMuted(false);
                  else { setIsMuted(true); stopBgm(); }
                }} style={{
                  background: "none", border: "none", color: "rgba(255,255,255,0.4)",
                  cursor: "pointer", fontSize: 13,
                }}>{isMuted ? "🔇" : "🔊"}</button>
                {mapBgImage && (
                  <button onClick={() => {
                    setShowBgPanel(true);
                    clearTimeout(bgPanelTimerRef.current);
                    bgPanelTimerRef.current = setTimeout(() => setShowBgPanel(false), 5000);
                  }} style={{
                    background: showBgPanel ? "rgba(34,211,238,0.15)" : "none",
                    border: showBgPanel ? "1px solid rgba(34,211,238,0.3)" : "none",
                    borderRadius: 6, color: "#22d3ee",
                    cursor: "pointer", fontSize: 12, padding: "2px 6px",
                    transition: "all 0.2s",
                  }} title="Điều chỉnh nền bản đồ">🖼️ BG</button>
                )}
              </div>

              {/* Bot panel */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
                <div style={{ flex: 1, textAlign: "right" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end" }}>
                    {botSubmitted && (
                      <span style={{ fontSize: 10, color: "#4ade80", fontWeight: 700, background: "rgba(74,222,128,0.1)", borderRadius: 4, padding: "1px 5px" }}>✓</span>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{botOpponent.username}</span>
                  </div>
                  <span style={{ fontSize: 10, color: botSubmitted ? "#4ade80" : "#f87171" }}>
                    {botSubmitted ? "Answered" : "Thinking..."}
                  </span>
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, border: "2px solid rgba(239,68,68,0.4)",
                  boxShadow: "0 0 12px rgba(239,68,68,0.3)",
                  overflow: "hidden"
                }}>{renderAvatar(botOpponent.avatar, botOpponent.username)}</div>
              </div>
            </div>

            {/* DAMAGE BAR — full width */}
            <div style={{ paddingBottom: 10 }}>
              <DamageBar
                playerHP={playerHP} botHP={botHP} maxHP={5}
                playerUsername={playerUsername} botUsername={botOpponent.username}
                playerBigHP={playerBigHP} botBigHP={botBigHP}
              />
            </div>
          </div>

          {/* FEED BAR */}
          <div style={{
            background: "rgba(10,5,25,0.5)",
            borderBottom: "1px solid rgba(255,255,255,0.03)",
            padding: "7px 28px", minHeight: 36,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, gap: 14,
          }}>
            {feedMessages.map((msg, i) => (
              <span key={i} style={{
                color: msg.includes("⚡") || msg.includes("🎯") || msg.includes("🏆") || msg.includes("Correct")
                  ? "#4ade80"
                  : msg.includes("🔥") || msg.includes("💔") || msg.includes("Wrong")
                  ? "#f87171"
                  : "#94a3b8",
                fontWeight: 700, animation: "mrmFadeUp 0.3s ease both",
              }}>{msg}</span>
            ))}
          </div>

          {/* QUESTION AREA */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "24px 20px", maxWidth: 760, margin: "0 auto", width: "100%",
          }}>
            {/* Q progress */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, width: "100%" }}>
              <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 4 }}>
                <div style={{
                  width: `${((currentQ + 1) / activeQuestions.length) * 100}%`, height: "100%",
                  background: "linear-gradient(90deg, #a78bfa, #38bdf8)",
                  borderRadius: 4, transition: "width 0.4s ease",
                }} />
              </div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700, flexShrink: 0 }}>
                {currentQ + 1}/{activeQuestions.length}
              </span>
              {/* Bilingual map label */}
              <span style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, flexShrink: 0 }}>
                {selectedCard?.enTitle || "Math"}
              </span>
            </div>

            {/* Question card */}
            <div style={{
              width: "100%",
              background: "rgba(10,6,26,0.75)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(167,139,250,0.2)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 0 20px rgba(167,139,250,0.04)",
              borderRadius: 16, padding: "28px 28px",
              fontSize: 18, fontWeight: 700, lineHeight: 1.6, textAlign: "center", color: "white",
              marginBottom: 20,
            }}>
              {activeQuestions[currentQ]?.text}
            </div>

            {/* Options */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "100%", marginBottom: 14 }}>
              {(activeQuestions[currentQ]?.options ?? []).map((opt, i) => {
                let bg = "rgba(10,6,26,0.7)";
                let border = "rgba(255,255,255,0.07)";
                let color = "white";
                let glow = "none";

                if (evaluating) {
                  if (i === activeQuestions[currentQ].correct) {
                    bg = "rgba(34,197,94,0.15)"; border = "rgba(34,197,94,0.5)"; color = "#4ade80";
                    glow = "0 0 12px rgba(34,197,94,0.2)";
                  } else if (i === playerSelected && i !== activeQuestions[currentQ].correct) {
                    bg = "rgba(239,68,68,0.15)"; border = "rgba(239,68,68,0.5)"; color = "#f87171";
                  }
                } else if (playerSelected === i) {
                  bg = "rgba(167,139,250,0.15)"; border = "rgba(167,139,250,0.5)"; color = "#a78bfa";
                  glow = "0 0 12px rgba(167,139,250,0.2)";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handlePlayerAnswer(i)}
                    disabled={playerSubmitted || evaluating}
                    style={{
                      padding: "16px 18px", borderRadius: 12, fontSize: 14,
                      fontWeight: (playerSelected === i || (evaluating && i === activeQuestions[currentQ].correct)) ? 700 : 400,
                      background: bg, border: `2px solid ${border}`, color,
                      cursor: playerSubmitted || evaluating ? "default" : "pointer",
                      transition: "all 0.18s", textAlign: "left",
                      boxShadow: glow,
                    }}
                    onMouseEnter={e => { if (!playerSubmitted && !evaluating) { e.currentTarget.style.borderColor = "rgba(167,139,250,0.45)"; e.currentTarget.style.background = "rgba(167,139,250,0.08)"; } }}
                    onMouseLeave={e => { if (!playerSubmitted && !evaluating) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(10,6,26,0.7)"; } }}
                  >
                    <span style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 22, height: 22, borderRadius: 6,
                      background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
                      fontSize: 11, fontWeight: 900, color: "rgba(255,255,255,0.5)",
                      marginRight: 10, flexShrink: 0,
                    }}>
                      {["A", "B", "C", "D"][i]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* Evaluating feedback */}
            {evaluating && (
              <div style={{
                width: "100%",
                background: "rgba(10,6,26,0.7)", borderRadius: 10, padding: "10px 18px",
                border: "1px solid rgba(255,255,255,0.05)", fontSize: 12,
                display: "flex", gap: 12, color: "rgba(255,255,255,0.5)", alignItems: "center", flexWrap: "wrap",
              }}>
                <span>
                  💡 Opponent ({botOpponent.username}) chose: <strong style={{ color: "white" }}>{["A", "B", "C", "D"][botSelected] || "—"}</strong>
                  {" "}({botCorrect ? <span style={{ color: "#4ade80" }}>Correct</span> : <span style={{ color: "#f87171" }}>Wrong</span>})
                </span>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
                <span style={{ color: "#a78bfa" }}>Explanation: {activeQuestions[currentQ]?.explain}</span>
              </div>
            )}
          </div>

          {/* LEAVE BUTTON */}
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0", background: "rgba(3,2,10,0.4)" }}>
            <button onClick={() => {
              if (confirm("Rời trận sẽ bị xử thua và trừ ELO. Chắc chưa?")) {
                if (isRealMultiplayer && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
                  socketRef.current.send(JSON.stringify({
                    type: "leave_room",
                    room_id: roomId
                  }));
                }
                endMatch(0, 3);
              }
            }} style={{
              padding: "7px 20px", borderRadius: 8, fontSize: 11, fontWeight: 700,
              background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.4)", cursor: "pointer",
            }}>🏳️ Surrender / Rời trận</button>
          </div>
        </div>
      )}

      {/* ─── RESULT / ENDED SCREEN ─── */}
      {gameState === "ended" && botOpponent && (
        <div className="mrm-slide-in" style={{
          position: "relative", zIndex: 1,
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          minHeight: "100vh", padding: 24,
          background: eloDelta > 0
            ? "radial-gradient(ellipse at center, rgba(251,191,36,0.08) 0%, rgba(5,2,15,1) 60%)"
            : "radial-gradient(ellipse at center, rgba(239,68,68,0.08) 0%, rgba(5,2,15,1) 60%)",
        }}>
          {/* Grade circle */}
          <div style={{ marginBottom: 20 }}>
            <GradeDisplay grade={getPerformanceGrade(roundCorrect, roundTotal, maxCombo)} />
          </div>

          {/* Win/Loss */}
          <h1 style={{
            fontSize: 44, fontWeight: 900,
            background: eloDelta > 0
              ? "linear-gradient(135deg, #fbbf24, #f59e0b)"
              : "linear-gradient(135deg, #ef4444, #f87171)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 4, letterSpacing: 2,
          }}>
            {eloDelta > 0 ? "VICTORY" : "DEFEAT"}
          </h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 28 }}>
            vs {botOpponent.username} ({botOpponent.elo} Rating)
          </p>

          {/* ELO delta card */}
          <div style={{
            background: "rgba(10,6,26,0.75)", backdropFilter: "blur(12px)",
            border: `1px solid ${eloDelta > 0 ? "rgba(251,191,36,0.2)" : "rgba(239,68,68,0.2)"}`,
            borderRadius: 16, padding: "20px 36px", textAlign: "center", marginBottom: 24,
            minWidth: 280,
          }}>
            <div style={{
              fontSize: 38, fontWeight: 900,
              color: eloDelta > 0 ? "#4ade80" : "#f87171",
              marginBottom: 4,
            }}>
              {eloDelta > 0 ? `+${eloDelta}` : eloDelta} Rating
            </div>
            <div style={{ fontSize: 13, color: "white", fontWeight: 800, marginBottom: 6 }}>
              {playerRank} · {playerElo} ELO
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 8 }}>
              <RankBadge rank={playerRank} size={28} />
            </div>
          </div>

          {/* Performance stats */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10,
            width: "100%", maxWidth: 440, marginBottom: 32,
          }}>
            {[
              { label: "Accuracy", value: roundTotal > 0 ? Math.round(roundCorrect / roundTotal * 100) + "%" : "0%", color: "#38bdf8" },
              { label: "Max Combo", value: `${maxCombo}x`, color: "#fbbf24" },
              { label: "Your Sets", value: `${playerBigHP}/3`, color: "#a78bfa" },
              { label: "Opp. Sets", value: `${botBigHP}/3`, color: "#f87171" },
            ].map(s => (
              <div key={s.label} style={{
                background: "rgba(255,255,255,0.03)", borderRadius: 10,
                padding: "12px 8px", textAlign: "center",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button onClick={startMatching} style={{
              padding: "13px 36px", borderRadius: 8, fontSize: 14, fontWeight: 900,
              background: "linear-gradient(135deg, #a78bfa, #6d28d9)",
              border: "1px solid rgba(167,139,250,0.4)", color: "white", cursor: "pointer",
              boxShadow: "0 4px 20px rgba(167,139,250,0.4)",
              transform: "skewX(-6deg)", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 28px rgba(167,139,250,0.6)"; e.currentTarget.style.transform = "skewX(-6deg) scale(1.02)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 4px 20px rgba(167,139,250,0.4)"; e.currentTarget.style.transform = "skewX(-6deg)"; }}
            >
              <span style={{ display: "inline-block", transform: "skewX(6deg)" }}>⚡ Play Again</span>
            </button>
            <button onClick={() => setGameState("lobby")} style={{
              padding: "13px 28px", borderRadius: 8, fontSize: 14, fontWeight: 800,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              color: "white", cursor: "pointer", transform: "skewX(-6deg)", transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            >
              <span style={{ display: "inline-block", transform: "skewX(6deg)" }}>Lobby</span>
            </button>
            <button onClick={() => { setSelectedReportUser(botOpponent.username); setShowReportModal(true); }} style={{
              padding: "13px 24px", borderRadius: 8, fontSize: 14, fontWeight: 800,
              background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)",
              color: "#f87171", cursor: "pointer", transform: "skewX(-6deg)", transition: "all 0.2s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.18)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.08)"}
            >
              <span style={{ display: "inline-block", transform: "skewX(6deg)" }}>🚩 Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportUserModal
          targetUsername={selectedReportUser}
          onClose={() => setShowReportModal(false)}
        />
      )}

      {/* ── CSS Animations ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@700;800;900&display=swap');

        .mrm-slide-in {
          animation: mrmSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .mrm-slide-left {
          animation: mrmSlideLeft 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .mrm-slide-right {
          animation: mrmSlideRight 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .mrm-bounce-in {
          animation: mrmBounceIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1.3) 0.2s both;
        }
        .mrm-room-item {
          animation: mrmFadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes mrmSlideIn {
          from { transform: translateY(14px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes mrmSlideLeft {
          from { transform: translateX(-80px) skewX(-6deg); opacity: 0; }
          to   { transform: translateX(0)     skewX(-6deg); opacity: 1; }
        }
        @keyframes mrmSlideRight {
          from { transform: translateX(80px) skewX(-6deg); opacity: 0; }
          to   { transform: translateX(0)    skewX(-6deg); opacity: 1; }
        }
        @keyframes mrmBounceIn {
          from { transform: scale(0.3) skewX(-10deg); opacity: 0; }
          to   { transform: scale(1)   skewX(-10deg); opacity: 1; }
        }
        @keyframes mrmRadar {
          0%   { transform: scale(0.5); opacity: 0.9; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes mrmPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.75; transform: scale(1.03); }
        }
        @keyframes mrmFlash {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.45; }
        }
        @keyframes mrmFadeUp {
          from { transform: translateY(8px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        @keyframes mrmParticleFloat {
          0%   { transform: translateY(0)     rotate(0deg);   opacity: var(--op, 0.06); }
          100% { transform: translateY(-110vh) rotate(360deg); opacity: 0; }
        }
        @keyframes orbFloat {
          0%   { transform: translate(0, 0)     scale(1); }
          100% { transform: translate(30px, 20px) scale(1.08); }
        }
        @keyframes mrmComboFlash {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
