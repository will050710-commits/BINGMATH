"use client";
import React, { useState, useEffect } from "react";

export default function BattleCard({
  activeBattle = {
    id: "bat_01",
    status: "active",
    clanA: {
      name: "Thánh Toán Học",
      tag: "TH",
      score: 4280,
      barColor: "#ec4899",
    },
    clanB: {
      name: "Đội Số Học Bay",
      tag: "SH",
      score: 3910,
      barColor: "#38bdf8",
    },
    initialTimeSeconds: 8073,
    winnerClanId: null,
  },
  battleHistory = [
    {
      id: "hist_1",
      opponentName: "Vòng Tròn Số Pi",
      opponentTag: "PI",
      type: "realtime",
      result: "win",
      myScore: 5420,
      oppScore: 4890,
      date: "2 ngày trước",
    },
    {
      id: "hist_2",
      opponentName: "Hàm Số Vô Cực",
      opponentTag: "HS",
      type: "score_based",
      result: "win",
      myScore: 18200,
      oppScore: 14650,
      date: "5 ngày trước",
    },
    {
      id: "hist_3",
      opponentName: "Đội Số Học Bay",
      opponentTag: "SH",
      type: "realtime",
      result: "loss",
      myScore: 4100,
      oppScore: 4350,
      date: "1 tuần trước",
    },
  ],
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(
    activeBattle.initialTimeSeconds || 3600
  );

  useEffect(() => {
    if (activeBattle.status !== "active") return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeBattle.status]);

  const formatTimer = (totalSec) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const totalScore = (activeBattle.clanA.score + activeBattle.clanB.score) || 1;
  const pctA = Math.round((activeBattle.clanA.score / totalScore) * 100);
  const pctB = 100 - pctA;

  const panelStyle = {
    background: "linear-gradient(135deg, rgba(2,8,24,0.92) 0%, rgba(15,23,42,0.88) 100%)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.09)",
    borderRadius: 18,
    boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {/* ── LIVE BATTLE ─────────────────────────────────────────────── */}
      <div>
        {/* Section Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>⚔️</span>
            <h2 style={{
              fontSize: "clamp(17px, 4vw, 24px)", fontWeight: 900, color: "white", margin: 0,
              background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Trận Đấu Đang Diễn Ra
            </h2>
          </div>

          {activeBattle.status === "active" ? (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 7,
              background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)",
              borderRadius: 100, padding: "5px 14px",
              fontFamily: "monospace", fontWeight: 800, fontSize: 11, color: "#f87171",
              letterSpacing: 0.8,
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: "50%", background: "#ef4444",
                display: "inline-block",
                boxShadow: "0 0 6px #ef4444",
                animation: "pulse 1.2s ease-in-out infinite",
              }} />
              TRẬN ĐẤU LIVE
            </div>
          ) : (
            <div style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 100, padding: "5px 14px",
              fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: 0.8,
            }}>
              Đã kết thúc
            </div>
          )}
        </div>

        {/* Battle Panel */}
        <div style={{ ...panelStyle, padding: "clamp(20px, 4vw, 36px) clamp(18px, 4vw, 32px)" }}>
          {/* VS Arena */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            gap: "clamp(16px, 3vw, 32px)",
          }}>
            {/* Clan A */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: "linear-gradient(135deg, #ec4899, #f43f5e)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 13, color: "white",
                  boxShadow: "0 4px 12px rgba(236,72,153,0.35)", flexShrink: 0,
                  userSelect: "none",
                }}>
                  {activeBattle.clanA.tag}
                </div>
                <span style={{ fontWeight: 800, fontSize: "clamp(14px, 3vw, 18px)", color: "white" }}>
                  {activeBattle.clanA.name}
                </span>
              </div>

              {/* Score Bar */}
              <div style={{ height: 12, background: "rgba(2,6,23,0.8)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 8,
                  width: `${pctA}%`,
                  background: `linear-gradient(90deg, #ec4899, #f43f5e)`,
                  transition: "width 0.7s ease",
                  boxShadow: "0 0 8px rgba(236,72,153,0.5)",
                }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, color: "#f472b6" }}>
                  {activeBattle.clanA.score.toLocaleString()} điểm
                </span>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                  {pctA}%
                </span>
              </div>
            </div>

            {/* Center VS */}
            <div style={{ textAlign: "center", flexShrink: 0 }}>
              <span style={{
                fontWeight: 900, fontSize: "clamp(20px, 4vw, 30px)", color: "rgba(255,255,255,0.35)",
                letterSpacing: 3, fontStyle: "italic", display: "block",
              }}>
                VS
              </span>
              {activeBattle.status === "active" && (
                <div style={{ marginTop: 10 }}>
                  <span style={{
                    fontFamily: "monospace", fontWeight: 800, fontSize: 12, color: "#fbbf24",
                    background: "rgba(2,6,23,0.8)", border: "1px solid rgba(245,158,11,0.3)",
                    borderRadius: 8, padding: "5px 10px",
                    display: "inline-block",
                  }}>
                    ⏱ {formatTimer(secondsRemaining)}
                  </span>
                </div>
              )}
            </div>

            {/* Clan B */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-end", textAlign: "right" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexDirection: "row-reverse" }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: "linear-gradient(135deg, #38bdf8, #0ea5e9)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 13, color: "white",
                  boxShadow: "0 4px 12px rgba(56,189,248,0.35)", flexShrink: 0,
                  userSelect: "none",
                }}>
                  {activeBattle.clanB.tag}
                </div>
                <span style={{ fontWeight: 800, fontSize: "clamp(14px, 3vw, 18px)", color: "white" }}>
                  {activeBattle.clanB.name}
                </span>
              </div>

              {/* Score Bar */}
              <div style={{
                height: 12, background: "rgba(2,6,23,0.8)", borderRadius: 8, overflow: "hidden",
                width: "100%", display: "flex", justifyContent: "flex-end",
              }}>
                <div style={{
                  height: "100%", borderRadius: 8,
                  width: `${pctB}%`,
                  background: "linear-gradient(90deg, #38bdf8, #0ea5e9)",
                  transition: "width 0.7s ease",
                  boxShadow: "0 0 8px rgba(56,189,248,0.5)",
                }} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 16, width: "100%" }}>
                <span style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.4)", flex: 1 }}>
                  {pctB}%
                </span>
                <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, color: "#38bdf8" }}>
                  {activeBattle.clanB.score.toLocaleString()} điểm
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BATTLE HISTORY ─────────────────────────────────────────── */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontSize: 20 }}>📜</span>
          <h2 style={{
            fontSize: "clamp(17px, 4vw, 24px)", fontWeight: 900, color: "white", margin: 0,
            background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            Lịch Sử Đấu Gần Đây
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {battleHistory.map((hist) => {
            const isWin = hist.result === "win";
            return (
              <div key={hist.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 20px",
                background: "rgba(10,10,24,0.8)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14,
                transition: "border-color 0.2s, background 0.2s",
                cursor: "default",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
                  e.currentTarget.style.background = "rgba(10,10,24,0.8)";
                }}
              >
                {/* Result Tag */}
                <div style={{
                  width: 52, textAlign: "center",
                  padding: "4px 0",
                  borderRadius: 7,
                  fontFamily: "monospace", fontWeight: 900, fontSize: 11,
                  background: isWin ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)",
                  color: isWin ? "#34d399" : "#f87171",
                  border: `1px solid ${isWin ? "rgba(52,211,153,0.35)" : "rgba(239,68,68,0.35)"}`,
                  flexShrink: 0, userSelect: "none",
                }}>
                  {isWin ? "THẮNG" : "THUA"}
                </div>

                {/* Opponent Tag */}
                <div style={{
                  width: 34, height: 34, borderRadius: 8,
                  background: "linear-gradient(135deg, #22d3ee, #6366f1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: 11, color: "white",
                  flexShrink: 0, userSelect: "none",
                }}>
                  {hist.opponentTag}
                </div>

                {/* Match Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 800, fontSize: 13, color: "rgba(255,255,255,0.9)" }}>
                      vs {hist.opponentName}
                    </span>
                    <span style={{
                      fontSize: 10, fontFamily: "monospace", color: "#22d3ee",
                      background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.2)",
                      borderRadius: 5, padding: "1px 7px",
                    }}>
                      {hist.type === "realtime" ? "Thời gian thực" : "Tính điểm"}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.38)" }}>
                    {hist.date}
                  </span>
                </div>

                {/* Scores */}
                <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 13, flexShrink: 0, textAlign: "right" }}>
                  <span style={{ color: isWin ? "#34d399" : "rgba(255,255,255,0.75)" }}>
                    {hist.myScore.toLocaleString()}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 6px" }}>-</span>
                  <span style={{ color: !isWin ? "#f87171" : "rgba(255,255,255,0.45)" }}>
                    {hist.oppScore.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
