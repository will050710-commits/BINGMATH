/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ── Mock data ──────────────────────────────────────────────────────────────
const MOCK_ROOMS = [
  { id: "r001", host: "MathGod_2k7", map: "Phương trình bậc hai nâng cao", grade: "Lớp 11", diff: 7.8, players: 1, maxPlayers: 2, status: "waiting", elo: "1850+" },
  { id: "r002", host: "QuadraticKing", map: "Lượng giác - Tổng hợp", grade: "Lớp 11", diff: 6.3, players: 1, maxPlayers: 2, status: "waiting", elo: "Tất cả" },
  { id: "r003", host: "PiMaster", map: "Đạo hàm & Ứng dụng", grade: "Lớp 12", diff: 8.5, players: 2, maxPlayers: 2, status: "in_game", elo: "2000+" },
  { id: "r004", host: "TrigWhiz", map: "Hình học phẳng cơ bản", grade: "Lớp 10", diff: 4.2, players: 1, maxPlayers: 2, status: "waiting", elo: "Tất cả" },
  { id: "r005", host: "Sigma_Boy", map: "Dãy số - Cấp số cộng & nhân", grade: "Lớp 11", diff: 6.8, players: 1, maxPlayers: 2, status: "waiting", elo: "1600+" },
];

const PLAYER_STATS = {
  username: "Bạn",
  elo: 1743,
  rank: "Gold II",
  wins: 34,
  losses: 18,
  winrate: 65.4,
};

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
  const [tab, setTab] = useState("browse"); // browse | create | ranked
  const [joining, setJoining] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const router = useRouter();

  const handleJoin = (roomId) => {
    setJoining(roomId);
    let c = 3;
    setCountdown(c);
    const interval = setInterval(() => {
      c -= 1;
      if (c <= 0) {
        clearInterval(interval);
        setCountdown(null);
        setJoining(null);
        // In a real app, would navigate to the match room
      } else {
        setCountdown(c);
      }
    }, 1000);
  };

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a0a1a 40%, #150a2e 100%)",
      display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif",
      color: "white",
    }}>
      {/* ─── HEADER ─── */}
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
          border: "1px solid rgba(167,139,250,0.2)",
          borderRadius: 10, padding: "8px 14px",
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, #a78bfa, #6d28d9)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16,
          }}>🎓</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{PLAYER_STATS.username}</div>
            <div style={{ fontSize: 10, color: "#a78bfa" }}>
              {PLAYER_STATS.rank} · {PLAYER_STATS.elo} ELO
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

      {/* ─── TAB BAR ─── */}
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

      {/* ─── MAIN CONTENT ─── */}
      <div style={{ flex: 1, display: "flex", gap: 0, overflow: "hidden" }}>

        {/* LEFT: Rooms list / Create / Quick Ranked */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>

          {tab === "browse" && (
            <>
              <div style={{ marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                  {MOCK_ROOMS.filter(r => r.status === "waiting").length} phòng đang chờ
                </div>
                <button style={{
                  padding: "6px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
                  background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.3)",
                  color: "#a78bfa", fontWeight: 600,
                }}>🔄 Làm mới</button>
              </div>

              {MOCK_ROOMS.map(room => (
                <div key={room.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 18px",
                  background: "rgba(15,23,42,0.6)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12, marginBottom: 10,
                  opacity: room.status === "in_game" ? 0.5 : 1,
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => room.status === "waiting" && (e.currentTarget.style.borderColor = "rgba(167,139,250,0.3)")}
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
                      onClick={() => handleJoin(room.id)}
                      disabled={joining !== null}
                      style={{
                        padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                        background: joining === room.id
                          ? "rgba(167,139,250,0.3)"
                          : "linear-gradient(135deg, #a78bfa, #6d28d9)",
                        border: "none", color: "white", cursor: joining ? "default" : "pointer",
                        transition: "all 0.2s", flexShrink: 0,
                        boxShadow: joining !== room.id ? "0 4px 16px rgba(167,139,250,0.4)" : "none",
                      }}
                    >
                      {joining === room.id ? `Vào phòng ${countdown}...` : "Tham gia"}
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
            <div style={{ maxWidth: 500 }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 20 }}>
                ➕ Tạo phòng đấu mới
              </div>
              {[
                { label: "Chọn MathMap", type: "select", options: ["Phương trình bậc hai nâng cao", "Lượng giác - Tổng hợp", "Đạo hàm & Ứng dụng"] },
                { label: "Yêu cầu ELO tối thiểu", type: "select", options: ["Tất cả", "1200+", "1400+", "1600+", "1800+", "2000+"] },
                { label: "Chế độ", type: "select", options: ["Thường (Normal)", "Ranked (ELO)", "Bạn bè (Private)"] },
              ].map(field => (
                <div key={field.label} style={{ marginBottom: 14 }}>
                  <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontWeight: 600, display: "block", marginBottom: 6 }}>
                    {field.label}
                  </label>
                  <select style={{
                    width: "100%", padding: "10px 14px",
                    background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 8, color: "white", fontSize: 13, cursor: "pointer",
                  }}>
                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
              <button style={{
                width: "100%", padding: "14px 0", marginTop: 8, borderRadius: 10,
                background: "linear-gradient(135deg, #a78bfa, #6d28d9)",
                border: "none", color: "white", fontSize: 15, fontWeight: 800,
                cursor: "pointer", boxShadow: "0 4px 20px rgba(167,139,250,0.4)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                ⚔️ Tạo phòng
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
                ELO hiện tại: {PLAYER_STATS.elo} · {PLAYER_STATS.rank}
              </div>

              <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                gap: 12, marginBottom: 30, width: "100%", maxWidth: 400,
              }}>
                {[
                  { label: "Thắng", value: PLAYER_STATS.wins, color: "#4ade80" },
                  { label: "Thua", value: PLAYER_STATS.losses, color: "#f87171" },
                  { label: "Tỷ lệ", value: PLAYER_STATS.winrate + "%", color: "#fbbf24" },
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

              <button style={{
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
                Thời gian ghép trận ước tính: ~15 giây
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Info sidebar */}
        <div style={{
          width: 280, flexShrink: 0,
          background: "rgba(2,6,23,0.9)",
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
              "Swap Card: tráo bài để đổi câu hỏi",
              "Last Chance khi còn ½ tim cuối",
              "ELO thay đổi dựa trên kết quả trận đấu",
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
              Season 1 · Kết thúc sau
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fbbf24" }}>14 ngày</div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                <span>Tiến độ rank</span>
                <span>Gold II</span>
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 4 }}>
                <div style={{ width: "65%", height: "100%", background: "linear-gradient(90deg, #fbbf24, #f59e0b)", borderRadius: 4 }} />
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
            <div style={{ fontSize: 28, fontWeight: 800, color: "white" }}>347</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>người chơi · 89 trận đang diễn ra</div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}
