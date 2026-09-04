"use client";
import React, { useState } from "react";

// ── Thể lệ riêng cho từng sự kiện nhỏ ──────────────────────────────────────

const EVENTS = [
  {
    id: "ev1",
    status: "Sắp diễn ra",
    date: "28/08",
    title: "Thử thách Tốc độ Đại số 10 phút",
    description: "Giải 20 câu trắc nghiệm tốc độ cao, xếp hạng theo thời gian hoàn thành chính xác.",
    xpBonus: "1.2x",
    rules: {
      format: "Trắc nghiệm 20 câu — thời gian 10 phút",
      schedule: [
        { label: "Mở đăng ký", time: "25/08/2026 – 27/08/2026" },
        { label: "Thi đấu", time: "28/08/2026 | 20:00 – 20:10" },
        { label: "Công bố kết quả", time: "28/08/2026 | 20:30" },
      ],
      items: [
        "Mỗi câu đúng được 5 điểm; trả lời sai trừ 1 điểm.",
        "Thứ hạng cuối tính theo tổng điểm → thời gian hoàn thành (ai nhanh hơn xếp trên).",
        "Top 3 nhận Huy hiệu Tốc Độ + 600/400/200 XP.",
        "⚠️ Nếu còn 10 phút mà thí sinh chưa hoàn thành lượt thi, hệ thống sẽ tự động kết thúc bài và tính điểm dựa trên các câu đã trả lời.",
      ],
    },
  },
  {
    id: "ev2",
    status: "Sắp diễn ra",
    date: "05/09",
    title: "Đại chiến Clan liên trường Mùa Thu",
    description: "Vòng loại khu vực Bắc - Trung - Nam cho giải đấu Clan Championship 2026.",
    xpBonus: "1.2x",
    rules: {
      format: "Đấu Nhóm Clan — 3v3",
      schedule: [
        { label: "Đăng ký Clan", time: "01/09/2026 – 04/09/2026" },
        { label: "Vòng loại khu vực", time: "05/09/2026 | 19:30 – 21:00" },
        { label: "Chung kết khu vực", time: "12/09/2026 | 20:00 – 21:30" },
      ],
      items: [
        "Mỗi Clan cử 3 đại diện. Clan Leader phải tạo phòng giải đấu qua Multiplayer.",
        "Điểm đấu được tính theo tổng điểm 3 thành viên trong trận Đấu Nhóm.",
        "Top Clan mỗi khu vực (Bắc / Trung / Nam) vào chung kết toàn quốc.",
        "⚠️ Nếu Clan chưa đủ 3 người trong vòng 10 phút sau giờ bắt đầu, Clan đó xử thua trận đó.",
      ],
    },
  },
  {
    id: "ev3",
    status: "Định kỳ",
    date: "Hàng tuần",
    title: "MathMap của tuần (Double XP)",
    description: "Hoàn thành các MathMap được chọn lọc để nhận x2 điểm kinh nghiệm toàn bộ chủ đề.",
    xpBonus: "2.0x",
    rules: {
      format: "Hoàn thành MathMap — không giới hạn thời gian",
      schedule: [
        { label: "Công bố MathMap tuần", time: "Thứ Hai | 00:00" },
        { label: "Thời gian áp dụng x2 XP", time: "Thứ Hai – Chủ Nhật (00:00 – 23:59)" },
      ],
      items: [
        "Các MathMap được chọn lọc hàng tuần bởi ban biên tập Duomath.",
        "Hoàn thành ít nhất 80% số câu hỏi trong MathMap để nhận bonus XP.",
        "Bonus x2 XP được ghi nhận ngay sau khi submit kết quả.",
        "Không có giới hạn số lần làm — XP chỉ tính cho lần đạt điểm cao nhất.",
      ],
    },
  },
  {
    id: "ev4",
    status: "Sắp diễn ra",
    date: "15/09",
    title: "Đấu trường SAT Math 800",
    description: "Bài thi chuẩn hóa quốc tế 54 câu hỏi tiếng Anh với bộ đề sát thực tế nhất.",
    xpBonus: "1.2x",
    rules: {
      format: "Thi viết — 54 câu — 70 phút",
      schedule: [
        { label: "Đăng ký", time: "10/09/2026 – 14/09/2026" },
        { label: "Thi đấu", time: "15/09/2026 | 08:00 – 09:10" },
        { label: "Công bố điểm", time: "15/09/2026 | 12:00" },
      ],
      items: [
        "54 câu hỏi bám sát College Board — bao gồm Algebra, Advanced Math, Problem Solving, Geometry.",
        "Điểm quy đổi theo thang SAT 200–800; Top 10 nhận Huy hiệu SAT 800.",
        "Mỗi câu đúng +1 điểm thô; không trừ điểm câu sai.",
        "⚠️ Nếu còn 10 phút mà thí sinh chưa nộp bài, hệ thống sẽ tự động nộp và chấm những câu đã làm.",
      ],
    },
  },
];

const panelStyle = {
  background: "linear-gradient(135deg, rgba(2,8,24,0.92) 0%, rgba(4,12,36,0.88) 100%)",
  backdropFilter: "blur(22px)",
  WebkitBackdropFilter: "blur(22px)",
  border: "1px solid rgba(255,255,255,0.07)",
  borderRadius: 20,
  boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
};

function RulesModal({ ev, onClose }) {
  if (!ev?.rules) return null;
  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(2,6,23,0.82)", backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{
        ...panelStyle,
        width: "100%", maxWidth: 560,
        padding: "28px 32px",
        maxHeight: "88vh", overflowY: "auto",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{
                fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1,
                padding: "2px 9px", borderRadius: 100,
                background: "rgba(244,114,182,0.12)", color: "#f472b6",
                border: "1px solid rgba(244,114,182,0.3)",
              }}>
                {ev.status}
              </span>
              <span style={{
                fontSize: 10, fontWeight: 800, color: "#fbbf24",
                background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.28)",
                borderRadius: 100, padding: "2px 9px",
              }}>
                ⚡ {ev.xpBonus} XP
              </span>
            </div>
            <h2 style={{ margin: 0, fontSize: "clamp(14px, 3vw, 18px)", fontWeight: 900, color: "white", lineHeight: 1.3 }}>
              {ev.title}
            </h2>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.45)",
            fontSize: 22, cursor: "pointer", lineHeight: 1, flexShrink: 0, marginTop: -4,
          }}>✕</button>
        </div>

        {/* Format badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.28)",
          borderRadius: 8, padding: "6px 12px", marginBottom: 20,
          fontSize: 12, fontWeight: 700, color: "#a5b4fc",
        }}>
          📋 {ev.rules.format}
        </div>

        {/* Schedule */}
        <div style={{ marginBottom: 20 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.4)" }}>
            Lịch tổ chức
          </h4>
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {ev.rules.schedule.map((s, i) => (
              <div key={i} style={{ display: "flex", gap: 12 }}>
                {/* dot + line */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 5,
                    background: "#22d3ee", boxShadow: "0 0 6px rgba(34,211,238,0.5)",
                  }} />
                  {i < ev.rules.schedule.length - 1 && (
                    <div style={{ width: 1, flex: 1, background: "rgba(34,211,238,0.2)", margin: "4px 0" }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < ev.rules.schedule.length - 1 ? 14 : 0 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{s.label}</span>
                  <span style={{
                    display: "block", fontFamily: "monospace", fontSize: 11,
                    color: "#22d3ee", marginTop: 1,
                  }}>
                    🕐 {s.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0 0 16px" }} />

        {/* Rules */}
        <h4 style={{ margin: "0 0 12px", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1, color: "rgba(255,255,255,0.4)" }}>
          Thể lệ chi tiết
        </h4>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
          {ev.rules.items.map((item, i) => {
            const isWarning = item.startsWith("⚠️");
            return (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                {isWarning ? (
                  <span style={{ flexShrink: 0, fontSize: 13, marginTop: 1 }}>⚠️</span>
                ) : (
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%", background: "#f472b6",
                    flexShrink: 0, marginTop: 6, boxShadow: "0 0 5px rgba(244,114,182,0.4)",
                  }} />
                )}
                <span style={{
                  fontSize: 13, lineHeight: 1.65,
                  color: isWarning ? "#fde68a" : "rgba(255,255,255,0.65)",
                  fontStyle: isWarning ? "italic" : "normal",
                }}>
                  {isWarning ? item.replace("⚠️ ", "") : item}
                </span>
              </li>
            );
          })}
        </ul>

        <button onClick={onClose} style={{
          marginTop: 24, width: "100%", padding: "12px",
          background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, color: "rgba(255,255,255,0.6)", fontWeight: 700, fontSize: 13,
          cursor: "pointer",
        }}>
          Đóng
        </button>
      </div>
    </div>
  );
}

function EventCard({ ev, onViewRules }) {
  const [hovered, setHovered] = useState(false);
  const isWeekly = ev.status === "Định kỳ";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? "linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(15,23,42,0.95) 100%)"
          : "rgba(10,10,24,0.82)",
        backdropFilter: "blur(18px)",
        border: `1px solid ${hovered ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.07)"}`,
        borderRadius: 16, overflow: "hidden",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        transition: "all 0.3s cubic-bezier(0.2,0.8,0.2,1)",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered
          ? "0 16px 40px rgba(0,0,0,0.5), 0 0 20px rgba(34,211,238,0.1)"
          : "0 4px 20px rgba(0,0,0,0.4)",
        cursor: "pointer",
      }}
    >
      {/* Card Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 16px",
        background: "rgba(2,6,23,0.7)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <span style={{
          fontSize: 11, color: isWeekly ? "#34d399" : "rgba(255,255,255,0.45)",
          fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8,
        }}>
          {ev.status}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: "#fbbf24", fontFamily: "monospace" }}>
            ⚡{ev.xpBonus}
          </span>
          <span style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 12, color: "#22d3ee" }}>
            {ev.date}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: "18px 16px 10px", flex: 1 }}>
        <h4 style={{ fontSize: 14, fontWeight: 800, color: "white", margin: "0 0 10px", lineHeight: 1.35 }}>
          {ev.title}
        </h4>
        <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.65, margin: 0 }}>
          {ev.description}
        </p>
      </div>

      {/* Card Footer */}
      <div style={{ padding: "12px 16px" }}>
        <button
          onClick={() => onViewRules(ev)}
          style={{
            background: "none", border: "none", padding: 0, cursor: "pointer",
            fontSize: 11, fontWeight: 800, textTransform: "uppercase",
            letterSpacing: 1, color: "#f472b6",
            display: "inline-flex", alignItems: "center", gap: 4,
            transition: "color 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.color = "#fb7185"}
          onMouseLeave={e => e.currentTarget.style.color = "#f472b6"}
        >
          XEM THỂ LỆ <span>→</span>
        </button>
      </div>
    </div>
  );
}

export default function EventList({ events = EVENTS }) {
  const [activeModal, setActiveModal] = useState(null);

  return (
    <div style={{ marginBottom: 56 }}>
      {/* Section Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <span style={{ fontSize: 24 }}>📅</span>
        <h2 style={{
          fontSize: "clamp(18px, 4vw, 26px)", fontWeight: 900, color: "white",
          margin: 0, letterSpacing: -0.3,
          background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Lịch Trình Sự Kiện &amp; Thử Thách
        </h2>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: 16,
      }}>
        {events.map((ev) => (
          <EventCard key={ev.id} ev={ev} onViewRules={setActiveModal} />
        ))}
      </div>

      {/* Rules Modal */}
      {activeModal && (
        <RulesModal ev={activeModal} onClose={() => setActiveModal(null)} />
      )}
    </div>
  );
}
