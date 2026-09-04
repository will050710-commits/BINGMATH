"use client";
import React from "react";

// ── Thể lệ giải đấu chính (Mùa Hè 2026) ────────────────────────────────────

const ROUNDS = [
  {
    icon: "🗓",
    label: "Vòng Đăng Ký",
    time: "15/08/2026 – 27/08/2026",
    desc: "Đăng ký tài khoản Duomath và xác nhận tham dự trước 23:59 ngày 27/08.",
  },
  {
    icon: "⚡",
    label: "Vòng Loại",
    time: "28/08/2026 – 01/09/2026 (20:00 – 22:00 mỗi ngày)",
    desc: "Hoàn thành bộ đề vòng loại trong khung giờ quy định. Điểm = Độ chính xác × Hệ số thời gian. Top 32 học sinh cao điểm nhất được vào bán kết.",
  },
  {
    icon: "🔥",
    label: "Bán Kết",
    time: "05/09/2026 – Thứ Sáu (20:00 – 21:30)",
    desc: "Top 32 vào vòng 1v1 theo hệ thống Đấu Nhóm thời gian thực. Trận đấu kéo dài tối đa 30 phút. Top 4 học sinh điểm cao nhất vào Chung Kết.",
  },
  {
    icon: "🏆",
    label: "Chung Kết",
    time: "10/09/2026 – Thứ Năm (20:00 – 22:00)",
    desc: "4 thí sinh tranh ngôi vô địch qua 2 vòng đấu loại trực tiếp. Kết quả được công bố ngay sau trận, trao huy hiệu và điểm XP ngay trong đêm.",
  },
];

const GENERAL_RULES = [
  "Mỗi thí sinh tham gia tối đa bằng 1 tài khoản Duomath chính chủ.",
  "Mọi hành vi can thiệp phần mềm hoặc gian lận sẽ bị hệ thống tự động loại khỏi bảng xếp hạng và khoá tài khoản vĩnh viễn.",
  "Điểm giải đấu được cộng hệ số 1.5x vào tổng XP tài khoản sau mỗi trận thắng.",
  "⚠️ Lưu ý: Nếu còn 10 phút mà thí sinh chưa hoàn thành lượt thi đấu của mình, hệ thống sẽ tự động tính thua và loại thí sinh đó khỏi vòng đấu.",
];

const REWARDS = [
  {
    tier: 1,
    name: "Quán Quân (Vô Địch)",
    medalBg: "linear-gradient(135deg, #FFE58A, #F59E0B)",
    medalColor: "#1A0512",
    prize: "5,000 XP + Cúp Vô Địch + Huy hiệu Vàng Độc Quyền",
  },
  {
    tier: 2,
    name: "Á Quân (Hạng Nhì)",
    medalBg: "linear-gradient(135deg, #E4E4F0, #94A3B8)",
    medalColor: "#0F172A",
    prize: "3,000 XP + Huy hiệu Bạc Độc Quyền",
  },
  {
    tier: 3,
    name: "Quý Quân (Hạng Ba)",
    medalBg: "linear-gradient(135deg, #FDBA74, #D97706)",
    medalColor: "#1A0512",
    prize: "1,500 XP + Huy hiệu Đồng Độc Quyền",
  },
  {
    tier: 4,
    name: "Top 10 Chung Cuộc",
    medalBg: "linear-gradient(135deg, #9FE6FF, #0EA5E9)",
    medalColor: "#041F38",
    prize: "800 XP + Khung Avatar Danh Dự",
  },
];

const panelStyle = {
  background: "linear-gradient(135deg, rgba(2,8,24,0.88) 0%, rgba(4,12,36,0.84) 100%)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 18,
  padding: "clamp(20px, 4vw, 36px) clamp(18px, 4vw, 32px)",
  boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
};

export default function RulesRewards() {
  return (
    <div id="rules" style={{ marginBottom: 40 }}>
      {/* Section heading */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 22 }}>📜</span>
        <h2 style={{
          fontSize: "clamp(17px, 4vw, 24px)", fontWeight: 900, margin: 0,
          background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Thể Lệ &amp; Cơ Cấu Giải Thưởng
        </h2>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 20,
      }}>
        {/* ── Left: Thể lệ + Lịch vòng ── */}
        <div style={panelStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "white", margin: "0 0 20px" }}>
            📜 Thể Lệ Giải Đấu Chính
          </h3>

          {/* Rounds timeline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 22 }}>
            {ROUNDS.map((round, idx) => (
              <div key={idx} style={{ display: "flex", gap: 14 }}>
                {/* Timeline line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: "rgba(99,102,241,0.18)", border: "1.5px solid rgba(99,102,241,0.4)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, flexShrink: 0,
                  }}>
                    {round.icon}
                  </div>
                  {idx < ROUNDS.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: "rgba(99,102,241,0.2)", margin: "4px 0" }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ paddingBottom: idx < ROUNDS.length - 1 ? 18 : 0, paddingTop: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 13.5, color: "white" }}>{round.label}</span>
                    <span style={{
                      fontFamily: "monospace", fontSize: 10, fontWeight: 700,
                      color: "#22d3ee", background: "rgba(34,211,238,0.08)",
                      border: "1px solid rgba(34,211,238,0.2)", borderRadius: 6,
                      padding: "1px 7px",
                    }}>
                      🕐 {round.time}
                    </span>
                  </div>
                  <p style={{
                    fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.65, margin: 0,
                  }}>
                    {round.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0 0 16px" }} />

          {/* General rules */}
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
            {GENERAL_RULES.map((r, idx) => {
              const isWarning = r.startsWith("⚠️");
              return (
                <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  {isWarning ? (
                    <span style={{ flexShrink: 0, fontSize: 13 }}>⚠️</span>
                  ) : (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", background: "#22d3ee",
                      flexShrink: 0, marginTop: 6,
                      boxShadow: "0 0 5px rgba(34,211,238,0.5)",
                    }} />
                  )}
                  <span style={{
                    fontSize: isWarning ? 12.5 : 13,
                    color: isWarning ? "#fde68a" : "rgba(255,255,255,0.6)",
                    lineHeight: 1.65,
                    fontStyle: isWarning ? "italic" : "normal",
                  }}>
                    {isWarning ? r.replace("⚠️ Lưu ý: ", "") : r}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* ── Right: Cơ cấu giải thưởng ── */}
        <div style={panelStyle}>
          <h3 style={{ fontSize: 16, fontWeight: 900, color: "white", margin: "0 0 20px" }}>
            🎁 Cơ Cấu Giải Thưởng
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {REWARDS.map((rw, idx) => (
              <div key={rw.tier} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "13px 0",
                borderBottom: idx < REWARDS.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              }}>
                {/* Medal */}
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: rw.medalBg, color: rw.medalColor,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "monospace", fontWeight: 900, fontSize: 15,
                  flexShrink: 0,
                  boxShadow: "0 3px 10px rgba(0,0,0,0.35)",
                }}>
                  {rw.tier}
                </div>

                {/* Tier Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: "block", fontWeight: 800, fontSize: 13.5, color: "white" }}>
                    {rw.name}
                  </span>
                  <span style={{
                    display: "block", fontSize: 11.5, fontFamily: "monospace",
                    color: "#fbbf24", marginTop: 3,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {rw.prize}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* XP bonus note */}
          <div style={{
            marginTop: 20, padding: "12px 16px", borderRadius: 12,
            background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.22)",
            fontSize: 12.5, color: "#fde68a", lineHeight: 1.7,
          }}>
            <strong>📌 Lưu ý về điểm XP:</strong> Điểm giải đấu được nhân hệ số{" "}
            <strong>1.5x</strong> cho giải lớn và <strong>1.2x</strong> cho giải nhỏ và được
            cộng trực tiếp vào tổng XP tài khoản sau mỗi trận thắng.
          </div>
        </div>
      </div>
    </div>
  );
}
