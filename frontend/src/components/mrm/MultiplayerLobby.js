/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";

// ── Constants & Configs ──────────────────────────────────────────────────
const BOTS = [
  { username: "MathGod_2k7", elo: 1850, rank: "Gold II", accuracy: 0.88, minSpeed: 3000, maxSpeed: 6500, avatar: "🧙‍♂️" },
  { username: "QuadraticKing", elo: 1700, rank: "Gold I", accuracy: 0.80, minSpeed: 4000, maxSpeed: 8500, avatar: "👑" },
  { username: "PiMaster", elo: 1650, rank: "Gold I", accuracy: 0.76, minSpeed: 5000, maxSpeed: 9500, avatar: "🧠" },
  { username: "TrigWhiz", elo: 1520, rank: "Silver III", accuracy: 0.70, minSpeed: 6000, maxSpeed: 11000, avatar: "📐" },
  { username: "Sigma_Boy", elo: 1600, rank: "Gold I", accuracy: 0.74, minSpeed: 5000, maxSpeed: 10000, avatar: "🐺" },
];

const MULTIPLAYER_QUESTIONS = [
  { text: "Tìm nghiệm thực của phương trình: x² - 5x + 6 = 0", options: ["x = 2 và x = 3", "x = 1 và x = 6", "x = -2 và x = -3", "x = 2 và x = -3"], correct: 0, explain: "x² - 5x + 6 = (x-2)(x-3) = 0" },
  { text: "Trong tam giác vuông, cos(60°) bằng bao nhiêu?", options: ["1/2", "√3/2", "√2/2", "1"], correct: 0, explain: "cos(60°) = 1/2 là giá trị cơ bản" },
  { text: "Đạo hàm của hàm số y = x³ là:", options: ["3x²", "x²", "3x", "2x²"], correct: 0, explain: "(x³)' = 3x²" },
  { text: "Cho cấp số cộng có u₁ = 2 và công sai d = 3. Tìm u₅:", options: ["14", "17", "11", "15"], correct: 0, explain: "u₅ = u₁ + 4d = 2 + 12 = 14" },
  { text: "Đồ thị hàm số bậc hai y = ax² + bx + c (a ≠ 0) là hình gì?", options: ["Parabol", "Đường thẳng", "Hyperbol", "Đường tròn"], correct: 0, explain: "Đồ thị hàm số bậc hai là một đường Parabol." },
  { text: "Diện tích tam giác có cạnh đáy a = 6cm, chiều cao h = 4cm là:", options: ["12 cm²", "24 cm²", "10 cm²", "8 cm²"], correct: 0, explain: "S = (1/2) * a * h = 12" },
  { text: "Đạo hàm của hàm số y = sin(x) là:", options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"], correct: 0, explain: "(sin x)' = cos x" },
  { text: "Phương trình x² + 2x + 5 = 0 có bao nhiêu nghiệm thực?", options: ["0 nghiệm", "1 nghiệm kép", "2 nghiệm phân biệt", "Vô số nghiệm"], correct: 0, explain: "Δ = 4 - 20 = -16 < 0 nên vô nghiệm thực." },
  { text: "Giá trị của log₂ (8) bằng:", options: ["3", "4", "2", "8"], correct: 0, explain: "8 = 2³ nên log₂ (8) = 3" },
  { text: "Cho cấp số nhân có u₁ = 3, công bội q = 2. Tìm u₄:", options: ["24", "18", "12", "48"], correct: 0, explain: "u₄ = u₁ * q³ = 3 * 8 = 24" }
];

const INITIAL_ROOMS = [
  { id: "r001", host: "MathGod_2k7", map: "Phương trình bậc hai nâng cao", grade: "Lớp 11", diff: 7.8, players: 1, maxPlayers: 2, status: "waiting", elo: "1850+" },
  { id: "r002", host: "QuadraticKing", map: "Lượng giác - Tổng hợp", grade: "Lớp 11", diff: 6.3, players: 1, maxPlayers: 2, status: "waiting", elo: "Tất cả" },
  { id: "r003", host: "PiMaster", map: "Đạo hàm & Ứng dụng", grade: "Lớp 12", diff: 8.5, players: 2, maxPlayers: 2, status: "in_game", elo: "2000+" },
  { id: "r004", host: "TrigWhiz", map: "Hình học phẳng cơ bản", grade: "Lớp 10", diff: 4.2, players: 1, maxPlayers: 2, status: "waiting", elo: "Tất cả" },
  { id: "r005", host: "Sigma_Boy", map: "Dãy số - Cấp số cộng & nhân", grade: "Lớp 11", diff: 6.8, players: 1, maxPlayers: 2, status: "waiting", elo: "1600+" },
];

function getRankTitle(elo) {
  if (elo < 1200) return "Bronze I";
  if (elo < 1400) return "Silver III";
  if (elo < 1600) return "Gold I";
  if (elo < 1800) return "Gold II";
  if (elo < 2000) return "Platinum I";
  return "Diamond III";
}

function getRankBadgeColor(rank) {
  if (rank.startsWith("Bronze")) return "#cd7f32";
  if (rank.startsWith("Silver")) return "#94a3b8";
  if (rank.startsWith("Gold")) return "#fbbf24";
  if (rank.startsWith("Platinum")) return "#38bdf8";
  return "#e0f2fe";
}

function DiffBadge({ fmp }) {
  const tier =
    fmp < 4 ? { label: "Easy", color: "#4ade80" }
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

export default function MultiplayerLobby() {
  const { user } = useAuth();
  const router = useRouter();

  // ─── Core ELO / Stats States ──────────────────────────────────────────
  const [playerElo, setPlayerElo] = useState(1743);
  const [playerStats, setPlayerStats] = useState({ wins: 34, losses: 18 });
  const [onlineCount, setOnlineCount] = useState(347);
  const [rooms, setRooms] = useState(INITIAL_ROOMS);

  // ─── Lobby / Flow States ───────────────────────────────────────────────
  const [tab, setTab] = useState("browse"); // browse | create | ranked
  const [joiningRoomId, setJoiningRoomId] = useState(null);
  const [countdown, setCountdown] = useState(null);

  // ─── Matchmaker / Game States ──────────────────────────────────────────
  const [gameState, setGameState] = useState("lobby"); // lobby | matching | faceoff | playing | ended
  const [matchTimer, setMatchTimer] = useState(0);
  const [botOpponent, setBotOpponent] = useState(null);

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

  const [playerCorrect, setPlayerCorrect] = useState(null); // null | true | false
  const [botCorrect, setBotCorrect] = useState(null);
  const [feedMessages, setFeedMessages] = useState([]);
  const [evaluating, setEvaluating] = useState(false);

  const [timeLeft, setTimeLeft] = useState(30);

  // ─── ELO Delta state ───────────────────────────────────────────────────
  const [eloDelta, setEloDelta] = useState(0);

  // Refs for timers
  const questionTimerRef = useRef(null);
  const botTimerRef = useRef(null);
  const matchingTimerRef = useRef(null);

  const playerUsername = user?.username || user?.email?.split("@")[0] || "Bạn";
  const playerRank = getRankTitle(playerElo);

  // ─── Hydration & LocalStorage persistence ─────────────────────────────
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

  const saveStatsToStorage = (wins, losses, elo) => {
    localStorage.setItem("duomath_player_wins", wins.toString());
    localStorage.setItem("duomath_player_losses", losses.toString());
    localStorage.setItem("duomath_player_elo", elo.toString());
  };

  // ─── Real-time Lobby Simulation ───────────────────────────────────────
  useEffect(() => {
    if (gameState !== "lobby" || tab !== "browse") return;
    const interval = setInterval(() => {
      // Online players fluctuate
      setOnlineCount(prev => prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 4));

      // Fluctuate room counts and status
      setRooms(prev => {
        return prev.map(r => {
          if (Math.random() > 0.75) {
            const nextPlayers = r.players === 1 ? 2 : 1;
            const nextStatus = nextPlayers === 2 ? "in_game" : "waiting";
            return { ...r, players: nextPlayers, status: nextStatus };
          }
          return r;
        });
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [gameState, tab]);

  // ─── Quick match search simulation ────────────────────────────────────
  const startMatching = () => {
    setGameState("matching");
    setMatchTimer(0);
    matchingTimerRef.current = setInterval(() => {
      setMatchTimer(prev => {
        const next = prev + 1;
        // Search matches after 4 seconds
        if (next >= 4) {
          clearInterval(matchingTimerRef.current);
          const matchedBot = BOTS[Math.floor(Math.random() * BOTS.length)];
          setBotOpponent(matchedBot);
          setGameState("faceoff");

          // Transit to game after faceoff countdown
          setTimeout(() => {
            initializeMatch(matchedBot);
          }, 2500);
        }
        return next;
      });
    }, 1000);
  };

  const cancelMatching = () => {
    clearInterval(matchingTimerRef.current);
    setGameState("lobby");
    setTab("ranked");
  };

  // ─── Join Room countdown simulation ───────────────────────────────────
  const handleJoinRoom = (room) => {
    setJoiningRoomId(room.id);
    let c = 3;
    setCountdown(c);
    const interval = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(interval);
        setCountdown(null);
        setJoiningRoomId(null);

        // Match bot associated with host
        const botTemplate = BOTS.find(b => b.username === room.host) || BOTS[0];
        setBotOpponent(botTemplate);
        setGameState("faceoff");

        setTimeout(() => {
          initializeMatch(botTemplate);
        }, 2500);
      } else {
        setCountdown(c);
      }
    }, 1000);
  };

  // ─── Initialize Battle Arena ──────────────────────────────────────────
  const initializeMatch = (bot) => {
    setGameState("playing");
    setCurrentQ(0);
    setPlayerHP(5);
    setBotHP(5);
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setEvaluating(false);
    setFeedMessages(["Trận đấu bắt đầu! Chúc may mắn."]);
    loadQuestion(0, bot);
  };

  // ─── Load Question & Bot Timer ────────────────────────────────────────
  const loadQuestion = (qIdx, bot) => {
    setPlayerSelected(null);
    setBotSelected(null);
    setPlayerSubmitted(false);
    setBotSubmitted(false);
    setPlayerCorrect(null);
    setBotCorrect(null);
    setEvaluating(false);
    setTimeLeft(30);

    // Reset current question timer
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

    // Bot answer timer
    clearTimeout(botTimerRef.current);
    const botDelay = Math.floor(Math.random() * (bot.maxSpeed - bot.minSpeed) + bot.minSpeed);
    botTimerRef.current = setTimeout(() => {
      simulateBotAnswer(qIdx, bot);
    }, botDelay);
  };

  // ─── Simulate Bot Answering ───────────────────────────────────────────
  const simulateBotAnswer = (qIdx, bot) => {
    const isBotCorrect = Math.random() < bot.accuracy;
    const currentQuestion = MULTIPLAYER_QUESTIONS[qIdx];
    let chosenOption;

    if (isBotCorrect) {
      chosenOption = currentQuestion.correct;
    } else {
      const wrongs = [0, 1, 2, 3].filter(x => x !== currentQuestion.correct);
      chosenOption = wrongs[Math.floor(Math.random() * wrongs.length)];
    }

    setBotSelected(chosenOption);
    setBotSubmitted(true);
  };

  // ─── Time expired handler ─────────────────────────────────────────────
  const handleTimeExpired = () => {
    setEvaluating(true);
    let pSelected = playerSelected;
    let bSelected = botSelected;

    if (pSelected === null) {
      pSelected = -1;
      setPlayerSelected(-1);
      setPlayerSubmitted(true);
    }
    if (bSelected === null) {
      bSelected = -1;
      setBotSelected(-1);
      setBotSubmitted(true);
    }
    evaluateAnswers(pSelected, bSelected);
  };

  // ─── Player selects answer ────────────────────────────────────────────
  const handlePlayerAnswer = (optionIdx) => {
    if (playerSubmitted || evaluating) return;
    setPlayerSelected(optionIdx);
    setPlayerSubmitted(true);
  };

  // ─── Auto Evaluate when both submit ───────────────────────────────────
  useEffect(() => {
    if (playerSubmitted && botSubmitted && !evaluating && gameState === "playing") {
      setEvaluating(true);
      clearInterval(questionTimerRef.current);
      clearTimeout(botTimerRef.current);
      evaluateAnswers(playerSelected, botSelected);
    }
  }, [playerSubmitted, botSubmitted, evaluating, gameState, playerSelected, botSelected]);

  // ─── Evaluation details ───────────────────────────────────────────────
  const evaluateAnswers = (pSelected, bSelected) => {
    const currentQuestion = MULTIPLAYER_QUESTIONS[currentQ];
    const isPlayerCorrect = pSelected === currentQuestion.correct;
    const isBotCorrect = bSelected === currentQuestion.correct;

    setPlayerCorrect(isPlayerCorrect);
    setBotCorrect(isBotCorrect);

    let nextPlayerHP = playerHP;
    let nextBotHP = botHP;
    const logs = [];

    // Player damages bot
    if (isPlayerCorrect) {
      nextBotHP = Math.max(0, botHP - 1);
      setBotHP(nextBotHP);
      logs.push(`🎯 Bạn trả lời đúng! Gây 1 ST lên ${botOpponent.username}.`);
      setCombo(prev => {
        const nextC = prev + 1;
        setMaxCombo(m => Math.max(m, nextC));
        return nextC;
      });
      // Score calculation
      setScore(prev => prev + 100 + combo * 10);
    } else {
      logs.push(`❌ Bạn trả lời sai.`);
      setCombo(0);
    }

    // Bot damages player
    if (isBotCorrect) {
      nextPlayerHP = Math.max(0, playerHP - 1);
      setPlayerHP(nextPlayerHP);
      logs.push(`🔥 ${botOpponent.username} trả lời đúng! Bạn mất 1 HP.`);
    } else {
      logs.push(`💨 Đối thủ trả lời sai.`);
    }

    setFeedMessages(logs);

    // Timeout evaluation before next step
    setTimeout(() => {
      if (nextPlayerHP <= 0 || nextBotHP <= 0 || currentQ === MULTIPLAYER_QUESTIONS.length - 1) {
        endMatch(nextPlayerHP, nextBotHP);
      } else {
        setCurrentQ(prev => {
          const nextQIdx = prev + 1;
          loadQuestion(nextQIdx, botOpponent);
          return nextQIdx;
        });
      }
    }, 2800);
  };

  // ─── End Match ────────────────────────────────────────────────────────
  const endMatch = (finalPlayerHP, finalBotHP) => {
    setGameState("ended");
    clearInterval(questionTimerRef.current);
    clearTimeout(botTimerRef.current);

    let won = false;
    if (finalPlayerHP > 0 && finalBotHP === 0) {
      won = true;
    } else if (finalPlayerHP === 0 && finalBotHP > 0) {
      won = false;
    } else {
      // tiebreaker: compare HP, then score
      won = finalPlayerHP > finalBotHP || (finalPlayerHP === finalBotHP && score > 300);
    }

    // ELO Updates
    const delta = won ? 25 : -15;
    const nextElo = Math.max(1000, playerElo + delta);
    const nextWins = won ? playerStats.wins + 1 : playerStats.wins;
    const nextLosses = !won ? playerStats.losses + 1 : playerStats.losses;

    setEloDelta(delta);
    setPlayerElo(nextElo);
    setPlayerStats({ wins: nextWins, losses: nextLosses });
    saveStatsToStorage(nextWins, nextLosses, nextElo);
  };

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a0a1a 40%, #150a2e 100%)",
      display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif",
      color: "white",
    }}>
      {/* ─── LOBBY / NON-GAME SCREEN ─── */}
      {gameState === "lobby" && (
        <>
          {/* HEADER */}
          <header style={{
            display: "flex", alignItems: "center", gap: 16,
            padding: "14px 28px",
            background: "rgba(2,6,23,0.85)", backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(167,139,250,0.15)",
            flexWrap: "wrap",
          }}>
            <Link href="/mrm" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: "white", letterSpacing: 2 }}>
                DUO<span style={{ color: "#22d3ee" }}>MATH</span>
              </span>
            </Link>
            <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
            <span style={{ fontSize: 14, color: "#a78bfa", fontWeight: 600 }}>
              ⚔️ Multiplayer — Ranked Lobby
            </span>

            <div style={{ flex: 1 }} />

            {/* Player ELO card */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(167,139,250,0.08)",
              border: `1px solid ${getRankBadgeColor(playerRank)}44`,
              borderRadius: 10, padding: "8px 14px",
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: `linear-gradient(135deg, ${getRankBadgeColor(playerRank)}, #6d28d9)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16,
              }}>🎓</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{playerUsername}</div>
                <div style={{ fontSize: 10, color: getRankBadgeColor(playerRank) }}>
                  {playerRank} · {playerElo} ELO
                </div>
              </div>
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

          {/* TAB BAR */}
          <div style={{
            display: "flex", gap: 0,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(10,10,26,0.8)",
            padding: "0 28px",
          }}>
            {[
              { key: "browse", label: "🔍 Tìm phòng" },
              { key: "create", label: "➕ Tạo phòng" },
              { key: "ranked", label: "⚡ Quick Ranked" },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                padding: "14px 22px", border: "none", cursor: "pointer",
                background: "transparent",
                fontSize: 13, fontWeight: tab === t.key ? 700 : 400,
                color: tab === t.key ? "#a78bfa" : "rgba(255,255,255,0.5)",
                borderBottom: tab === t.key ? "2px solid #a78bfa" : "2px solid transparent",
                marginBottom: -1, transition: "all 0.2s",
              }}>{t.label}</button>
            ))}
          </div>

          {/* MAIN CONTENT */}
          <div style={{ flex: 1, display: "flex", gap: 0, overflow: "hidden" }}>
            {/* LEFT SIDEBAR: Tab contents */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
              {tab === "browse" && (
                <>
                  <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                      {rooms.filter(r => r.status === "waiting").length} phòng đang chờ đối thủ
                    </div>
                    <button onClick={() => {
                      setRooms(INITIAL_ROOMS);
                      setFeedMessages(["Danh sách phòng đã được làm mới!"]);
                    }} style={{
                      padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                      background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)",
                      color: "#a78bfa", fontWeight: 600, transition: "all 0.2s"
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(167,139,250,0.2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(167,139,250,0.1)"}
                    >🔄 Làm mới</button>
                  </div>

                  {rooms.map(room => (
                    <div key={room.id} style={{
                      display: "flex", alignItems: "center", gap: 14,
                      padding: "14px 18px",
                      background: "rgba(15,23,42,0.65)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 12, marginBottom: 10,
                      opacity: room.status === "in_game" ? 0.5 : 1,
                      transition: "all 0.2s",
                    }}
                      onMouseEnter={e => room.status === "waiting" && (e.currentTarget.style.borderColor = "rgba(167,139,250,0.35)")}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"}
                    >
                      {/* Host avatar */}
                      <div style={{
                        width: 44, height: 44, borderRadius: "50%",
                        background: "linear-gradient(135deg, #a78bfa, #6d28d9)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, flexShrink: 0,
                      }}>⚔️</div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{room.host}</span>
                          <DiffBadge fmp={room.diff} />
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{room.grade}</span>
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 3 }}>
                          📐 {room.map}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                            👥 {room.players}/{room.maxPlayers}
                          </span>
                          <span style={{ fontSize: 10, color: room.elo === "Tất cả" ? "#4ade80" : "#fbbf24" }}>
                            ELO: {room.elo}
                          </span>
                        </div>
                      </div>

                      {/* Status / Join */}
                      {room.status === "waiting" ? (
                        <button
                          onClick={() => handleJoinRoom(room)}
                          disabled={joiningRoomId !== null}
                          style={{
                            padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                            background: joiningRoomId === room.id
                              ? "rgba(167,139,250,0.3)"
                              : "linear-gradient(135deg, #a78bfa, #6d28d9)",
                            border: "none", color: "white", cursor: joiningRoomId ? "default" : "pointer",
                            transition: "all 0.2s", flexShrink: 0,
                            boxShadow: joiningRoomId !== room.id ? "0 4px 16px rgba(167,139,250,0.4)" : "none",
                          }}
                        >
                          {joiningRoomId === room.id ? `Đang vào ${countdown}...` : "Tham gia"}
                        </button>
                      ) : (
                        <span style={{
                          padding: "8px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                          background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                          color: "#f87171", flexShrink: 0,
                        }}>Đang đấu</span>
                      )}
                    </div>
                  ))}
                </>
              )}

              {tab === "create" && (
                <div style={{ maxWidth: 500, background: "rgba(15,23,42,0.5)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: 28 }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20 }}>
                    ➕ Tạo phòng đấu mới
                  </div>
                  {[
                    { label: "Chọn MathMap", options: ["Phương trình bậc hai nâng cao", "Lượng giác - Tổng hợp", "Đạo hàm & Ứng dụng", "Hình học phẳng cơ bản"] },
                    { label: "Yêu cầu ELO tối thiểu", options: ["Tất cả", "1200+", "1400+", "1600+", "1800+", "2000+"] },
                    { label: "Chế độ", options: ["Ranked (Tính ELO)", "Bạn bè (Private - Chỉ đấu tập)"] },
                  ].map(field => (
                    <div key={field.label} style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, display: "block", marginBottom: 6 }}>
                        {field.label}
                      </label>
                      <select style={{
                        width: "100%", padding: "12px 14px",
                        background: "rgba(15,23,42,0.85)",
                        border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 8, color: "white", fontSize: 13, cursor: "pointer",
                        outline: "none"
                      }}>
                        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                  ))}
                  <button onClick={() => {
                    // Create simulated room and go directly into matchmaking
                    setTab("browse");
                    const newRoomId = `r_${Date.now()}`;
                    const newRoom = {
                      id: newRoomId,
                      host: playerUsername,
                      map: "Phương trình bậc hai nâng cao",
                      grade: "Lớp 11",
                      diff: 7.8,
                      players: 1,
                      maxPlayers: 2,
                      status: "waiting",
                      elo: `${playerElo - 50}+`
                    };
                    setRooms(prev => [newRoom, ...prev]);
                    // Auto match with random bot after 1s
                    setTimeout(() => handleJoinRoom(newRoom), 100);
                  }} style={{
                    width: "100%", padding: "14px 0", marginTop: 8, borderRadius: 10,
                    background: "linear-gradient(135deg, #a78bfa, #6d28d9)",
                    border: "none", color: "white", fontSize: 15, fontWeight: 800,
                    cursor: "pointer", boxShadow: "0 4px 20px rgba(167,139,250,0.4)",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                  >
                    ⚔️ Tạo phòng và chờ đấu
                  </button>
                </div>
              )}

              {tab === "ranked" && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
                  <div style={{
                    fontSize: 72, marginBottom: 20,
                    filter: "drop-shadow(0 0 32px rgba(167,139,250,0.6))",
                    animation: "pulse 2s ease-in-out infinite",
                  }}>⚔️</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "white", marginBottom: 8 }}>
                    Quick Ranked Match
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6, textAlign: "center" }}>
                    Hệ thống sẽ tự động ghép bạn với đối thủ có ELO tương đương
                  </div>
                  <div style={{
                    fontSize: 12, color: "#a78bfa", marginBottom: 30,
                    background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)",
                    borderRadius: 8, padding: "6px 16px",
                  }}>
                    ELO hiện tại: {playerElo} · {playerRank}
                  </div>

                  <div style={{
                    display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12, marginBottom: 30, width: "100%", maxWidth: 400,
                  }}>
                    {[
                      { label: "Thắng", value: playerStats.wins, color: "#4ade80" },
                      { label: "Thua", value: playerStats.losses, color: "#f87171" },
                      { label: "Tỷ lệ", value: (playerStats.wins + playerStats.losses > 0 ? Math.round((playerStats.wins / (playerStats.wins + playerStats.losses)) * 100) : 0) + "%", color: "#fbbf24" },
                    ].map(stat => (
                      <div key={stat.label} style={{
                        textAlign: "center", padding: "14px",
                        background: "rgba(15,23,42,0.6)", borderRadius: 10,
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  <button onClick={startMatching} style={{
                    padding: "16px 56px", borderRadius: 12,
                    background: "linear-gradient(135deg, #a78bfa, #6d28d9)",
                    border: "none", color: "white", fontSize: 16, fontWeight: 800,
                    cursor: "pointer", boxShadow: "0 4px 24px rgba(167,139,250,0.5)",
                    transition: "all 0.25s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.04)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(167,139,250,0.6)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(167,139,250,0.5)"; }}
                  >
                    ⚡ Tìm trận ngay
                  </button>
                  <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.25)" }}>
                    Thời gian ghép trận ước tính: ~4 giây
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR: Stats info */}
            <div style={{
              width: 280, flexShrink: 0,
              background: "rgba(2,6,23,0.95)",
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              display: "flex", flexDirection: "column", padding: 18, gap: 16,
              overflowY: "auto",
            }}>
              {/* How to play */}
              <div style={{
                background: "rgba(167,139,250,0.06)",
                border: "1px solid rgba(167,139,250,0.15)",
                borderRadius: 10, padding: 14,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#a78bfa", marginBottom: 10 }}>
                  ⚔️ Cách chơi Multiplayer
                </div>
                {[
                  "2 người chơi cùng giải một bộ câu hỏi",
                  "Mỗi câu trả lời đúng gây sát thương cho đối thủ",
                  "Khóa câu hỏi khi cả hai đã nộp bài",
                  "Càng trả lời đúng liên tiếp, sát thương càng tăng",
                  "Nhận ELO khi Thắng, bị trừ ELO khi Thua",
                ].map((step, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 8, marginBottom: 8, fontSize: 11,
                    color: "rgba(255,255,255,0.6)", alignItems: "flex-start",
                  }}>
                    <span style={{ color: "#a78bfa", fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
                    {step}
                  </div>
                ))}
              </div>

              {/* Season info */}
              <div style={{
                background: "rgba(251,191,36,0.06)",
                border: "1px solid rgba(251,191,36,0.15)",
                borderRadius: 10, padding: 14,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", marginBottom: 8 }}>
                  🏆 Mùa giải hiện tại
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>
                  Mùa 1 · Kết thúc sau
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#fbbf24" }}>14 ngày</div>
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                    <span>Tiến độ rank</span>
                    <span>{playerRank}</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>
                    <div style={{ width: `${Math.min(100, Math.max(10, ((playerElo - 1000) / 1200) * 100))}%`, height: "100%", background: "linear-gradient(90deg, #fbbf24, #f59e0b)", borderRadius: 4 }} />
                  </div>
                </div>
              </div>

              {/* Online players */}
              <div style={{
                background: "rgba(34,211,238,0.04)",
                border: "1px solid rgba(34,211,238,0.1)",
                borderRadius: 10, padding: 14,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#22d3ee", marginBottom: 8 }}>
                  👥 Đang online
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>{onlineCount}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>người chơi đang ở phòng chờ</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── MATCHMAKER ACTIVE SEARCH SCREEN ─── */}
      {gameState === "matching" && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "radial-gradient(circle, #0f0728 0%, #030010 100%)",
        }}>
          {/* Radar animation */}
          <div style={{ position: "relative", width: 160, height: 160, marginBottom: 30 }}>
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: "2px solid rgba(167,139,250,0.3)",
              animation: "pingRadar 2s cubic-bezier(0, 0, 0.2, 1) infinite",
            }} />
            <div style={{
              position: "absolute", inset: 20, borderRadius: "50%",
              border: "2px solid rgba(167,139,250,0.5)",
              animation: "pingRadar 2s cubic-bezier(0, 0, 0.2, 1) 0.6s infinite",
            }} />
            <div style={{
              position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 60, filter: "drop-shadow(0 0 24px #a78bfa)",
            }}>⚔️</div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8, letterSpacing: 0.5 }}>
            Đang ghép trận...
          </h2>
          <p style={{ fontSize: 14, color: "#a78bfa", marginBottom: 4, fontWeight: 600 }}>
            ELO tìm kiếm: {playerElo - 100 - matchTimer * 20} ~ {playerElo + 100 + matchTimer * 20} ELO
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 40 }}>
            Thời gian trôi qua: {matchTimer} giây
          </p>

          <button onClick={cancelMatching} style={{
            padding: "12px 36px", borderRadius: 10, fontSize: 14, fontWeight: 700,
            background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)",
            color: "#f87171", cursor: "pointer", transition: "all 0.15s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.12)"}
          >
            Hủy tìm trận
          </button>

          <style>{`
            @keyframes pingRadar {
              0% { transform: scale(0.6); opacity: 1; }
              100% { transform: scale(1.4); opacity: 0; }
            }
          `}</style>
        </div>
      )}

      {/* ─── FACEOFF SCREEN ─── */}
      {gameState === "faceoff" && botOpponent && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #090514 0%, #020106 100%)",
          padding: 24,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 60, marginBottom: 40, flexWrap: "wrap", justifyContent: "center" }}>
            {/* Player */}
            <div style={{
              width: 200, padding: "24px 16px", background: "rgba(167,139,250,0.06)",
              border: "2px solid rgba(167,139,250,0.35)", borderRadius: 20, textAlign: "center",
              boxShadow: "0 8px 32px rgba(167,139,250,0.15)",
              animation: "slideInLeft 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both",
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 4 }}>{playerUsername}</div>
              <div style={{ fontSize: 13, color: getRankBadgeColor(playerRank), fontWeight: 700 }}>{playerRank}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{playerElo} ELO</div>
            </div>

            {/* VS */}
            <div style={{
              fontSize: 36, fontWeight: 900, color: "#f87171",
              fontStyle: "italic", textShadow: "0 0 20px rgba(239,68,68,0.5)",
              animation: "bounceIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1.2) both",
            }}>VS</div>

            {/* Bot */}
            <div style={{
              width: 200, padding: "24px 16px", background: "rgba(239,68,68,0.06)",
              border: "2px solid rgba(239,68,68,0.35)", borderRadius: 20, textAlign: "center",
              boxShadow: "0 8px 32px rgba(239,68,68,0.15)",
              animation: "slideInRight 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) both",
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>{botOpponent.avatar}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 4 }}>{botOpponent.username}</div>
              <div style={{ fontSize: 13, color: getRankBadgeColor(botOpponent.rank), fontWeight: 700 }}>{botOpponent.rank}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>{botOpponent.elo} ELO</div>
            </div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 900, color: "#a78bfa", textTransform: "uppercase", letterSpacing: 2, animation: "flash 1.5s infinite" }}>
            Trận đấu chuẩn bị bắt đầu...
          </h2>

          <style>{`
            @keyframes slideInLeft { from { transform: translateX(-100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideInRight { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes bounceIn { from { transform: scale(0.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes flash { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          `}</style>
        </div>
      )}

      {/* ─── 1V1 DUEL PLAYING ARENA ─── */}
      {gameState === "playing" && botOpponent && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          background: "linear-gradient(135deg, #02020a, #0b0718)",
        }}>
          {/* TOP BAR / HEAD-TO-HEAD HP */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 120px 1fr",
            padding: "16px 28px", borderBottom: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(2,2,8,0.9)", backdropFilter: "blur(12px)",
          }}>
            {/* Player panel (Left) */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontSize: 28 }}>🎓</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>{playerUsername}</div>
                <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{
                      fontSize: 16,
                      filter: i < playerHP ? "none" : "grayscale(1) opacity(0.2)",
                      transition: "all 0.3s",
                    }}>❤️</span>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 10, display: "block", color: "rgba(255,255,255,0.4)" }}>TRẠNG THÁI</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: playerSubmitted ? "#4ade80" : "#a78bfa" }}>
                  {playerSubmitted ? "✓ Đã trả lời" : "⚡ Đang nghĩ..."}
                </span>
              </div>
            </div>

            {/* Timer (Center) */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%",
                border: `3px solid ${timeLeft < 10 ? "#ef4444" : "#a78bfa"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 16, fontWeight: 900, color: timeLeft < 10 ? "#ef4444" : "white",
                boxShadow: `0 0 16px ${timeLeft < 10 ? "rgba(239,68,68,0.3)" : "rgba(167,139,250,0.3)"}`,
              }}>
                {timeLeft}
              </div>
            </div>

            {/* Bot panel (Right) */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "flex-end", textAlign: "right" }}>
              <div style={{ textAlign: "left" }}>
                <span style={{ fontSize: 10, display: "block", color: "rgba(255,255,255,0.4)", textAlign: "right" }}>TRẠNG THÁI</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: botSubmitted ? "#4ade80" : "#ef4444" }}>
                  {botSubmitted ? "✓ Đã trả lời" : "⚡ Đang nghĩ..."}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 800, color: "white" }}>{botOpponent.username}</div>
                <div style={{ display: "flex", gap: 3, marginTop: 4, justifyContent: "flex-end" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} style={{
                      fontSize: 16,
                      filter: i < botHP ? "none" : "grayscale(1) opacity(0.2)",
                      transition: "all 0.3s",
                    }}>❤️</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: 28 }}>{botOpponent.avatar}</div>
            </div>
          </div>

          {/* COMBINED ROUND FEEDS */}
          <div style={{
            background: "rgba(15,23,42,0.4)", borderBottom: "1px solid rgba(255,255,255,0.04)",
            padding: "8px 24px", minHeight: 40, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, color: "#cbd5e1", gap: 16,
          }}>
            {feedMessages.map((msg, i) => (
              <span key={i} style={{
                color: msg.includes("🎯") ? "#4ade80" : msg.includes("🔥") ? "#f87171" : "#cbd5e1",
                fontWeight: 600, animation: "fadeInUp 0.3s ease-out both"
              }}>{msg}</span>
            ))}
          </div>

          {/* QUESTION BOX */}
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "24px 20px", maxWidth: 720, margin: "0 auto", width: "100%",
          }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontWeight: 700, marginBottom: 12 }}>
              CÂU HỎI {currentQ + 1} / {MULTIPLAYER_QUESTIONS.length}
            </div>

            <div style={{
              width: "100%", background: "rgba(15,23,42,0.7)",
              border: "1px solid rgba(167,139,250,0.2)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 0 16px rgba(167,139,250,0.05)",
              borderRadius: 16, padding: "28px 24px", marginBottom: 24,
              fontSize: 18, fontWeight: 700, lineHeight: 1.6, textAlign: "center",
              color: "white",
            }}>
              {MULTIPLAYER_QUESTIONS[currentQ].text}
            </div>

            {/* OPTIONS */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "100%", marginBottom: 16 }}>
              {MULTIPLAYER_QUESTIONS[currentQ].options.map((opt, i) => {
                let bg = "rgba(15,23,42,0.75)";
                let border = "rgba(255,255,255,0.08)";
                let color = "white";

                if (evaluating) {
                  if (i === MULTIPLAYER_QUESTIONS[currentQ].correct) {
                    bg = "rgba(34,197,94,0.18)"; border = "rgba(34,197,94,0.6)"; color = "#4ade80";
                  } else if (i === playerSelected && i !== MULTIPLAYER_QUESTIONS[currentQ].correct) {
                    bg = "rgba(239,68,68,0.18)"; border = "rgba(239,68,68,0.6)"; color = "#f87171";
                  }
                } else if (playerSelected === i) {
                  bg = "rgba(167,139,250,0.18)"; border = "rgba(167,139,250,0.6)"; color = "#a78bfa";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handlePlayerAnswer(i)}
                    disabled={playerSubmitted || evaluating}
                    style={{
                      padding: "16px 20px", borderRadius: 12, fontSize: 14,
                      fontWeight: playerSelected === i || (evaluating && i === MULTIPLAYER_QUESTIONS[currentQ].correct) ? 700 : 400,
                      background: bg, border: `2px solid ${border}`, color,
                      cursor: playerSubmitted || evaluating ? "default" : "pointer",
                      transition: "all 0.18s", textAlign: "left",
                    }}
                    onMouseEnter={e => { if (!playerSubmitted && !evaluating) e.currentTarget.style.borderColor = "rgba(167,139,250,0.5)"; }}
                    onMouseLeave={e => { if (!playerSubmitted && !evaluating) e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
                  >
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginRight: 6 }}>
                      {["A", "B", "C", "D"][i]}.
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* BOT ACTION FEEDBACK */}
            {evaluating && (
              <div style={{
                marginTop: 10, fontSize: 13, display: "flex", gap: 12, color: "rgba(255,255,255,0.5)",
                background: "rgba(15,23,42,0.6)", borderRadius: 10, padding: "8px 18px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}>
                <span>💡 Đối thủ chọn: <strong>{["A", "B", "C", "D"][botSelected] || "—"}</strong> ({botCorrect ? "Đúng" : "Sai"})</span>
                <span>•</span>
                <span>Giải thích: {MULTIPLAYER_QUESTIONS[currentQ].explain}</span>
              </div>
            )}
          </div>

          {/* LEAVE BUTTON */}
          <div style={{ display: "flex", justifyContent: "center", padding: "16px 0", background: "rgba(2,2,8,0.3)" }}>
            <button onClick={() => {
              if (confirm("Bạn có chắc muốn bỏ chạy? Bạn sẽ bị trừ ELO.")) {
                endMatch(0, 5);
              }
            }} style={{
              padding: "8px 24px", borderRadius: 8, fontSize: 12, fontWeight: 700,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.5)", cursor: "pointer", transition: "all 0.15s"
            }}>🏳️ Rời trận đấu</button>
          </div>
        </div>
      )}

      {/* ─── DUEL RESULT / ENDED SCREEN ─── */}
      {gameState === "ended" && botOpponent && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          background: "linear-gradient(135deg, #090514 0%, #020106 100%)",
          padding: 24,
        }}>
          {/* Trophy / Broken Sword Icon */}
          <div style={{
            fontSize: 80, marginBottom: 20,
            filter: `drop-shadow(0 0 32px ${eloDelta > 0 ? "rgba(251,191,36,0.6)" : "rgba(239,68,68,0.4)"})`,
            animation: "pulse 2s ease-in-out infinite",
          }}>
            {eloDelta > 0 ? "🏆" : "⚔️"}
          </div>

          <h1 style={{
            fontSize: 40, fontWeight: 900,
            background: eloDelta > 0 ? "linear-gradient(135deg, #fbbf24, #f59e0b)" : "linear-gradient(135deg, #ef4444, #f87171)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 6,
          }}>
            {eloDelta > 0 ? "CHIẾN THẮNG!" : "THẤT BẠI"}
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", marginBottom: 30 }}>
            Đối đầu với {botOpponent.username} ({botOpponent.elo} ELO)
          </p>

          {/* ELO Delta card */}
          <div style={{
            background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16, padding: "24px 36px", textAlign: "center", marginBottom: 36,
            minWidth: 260,
          }}>
            <div style={{
              fontSize: 32, fontWeight: 900,
              color: eloDelta > 0 ? "#4ade80" : "#f87171",
              marginBottom: 4,
            }}>
              {eloDelta > 0 ? `+${eloDelta}` : eloDelta} ELO
            </div>
            <div style={{ fontSize: 13, color: "white", fontWeight: 700, marginBottom: 8 }}>
              Rank: {playerRank}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
              ELO mới: {playerElo}
            </div>
          </div>

          {/* Stats details */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10,
            width: "100%", maxWidth: 360, marginBottom: 40,
          }}>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>HP CỦA BẠN</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2, color: "#fbbf24" }}>{playerHP} / 5</div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 12, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>ĐỐI THỦ HP</div>
              <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2, color: "#ef4444" }}>{botHP} / 5</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 16 }}>
            <button onClick={startMatching} style={{
              padding: "14px 36px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: "linear-gradient(135deg, #a78bfa, #6d28d9)",
              border: "none", color: "white", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(167,139,250,0.4)",
            }}>
              ⚡ Tìm trận tiếp
            </button>
            <button onClick={() => setGameState("lobby")} style={{
              padding: "14px 32px", borderRadius: 10, fontSize: 14, fontWeight: 700,
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              color: "white", cursor: "pointer",
            }}>
              Quay lại Lobby
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
