"use client";
import React, { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

const CHANGELOG_ENTRIES = [
  {
    id: "cl1",
    version: "v2.4.0",
    date: "23/08/2026",
    tag: "new",
    tagLabelVi: "Tính năng mới",
    tagLabelEn: "New Feature",
    icon: "🚀",
    color: "#ec4899",
    titleVi: "Ra mắt tính năng Math Clans & Đấu Nhóm thời gian thực",
    titleEn: "Launched Math Clans & Real-time Team Battles",
    descriptionVi:
      "Người dùng có thể tự do thành lập Clan, tải ảnh đại diện & banner tùy chỉnh, so tài trực tiếp theo cặp đấu với thanh điểm đồng bộ và leo bảng xếp hạng tuần/tháng/mùa/toàn thời gian.",
    descriptionEn:
      "Users can now create custom Clans, upload custom avatars & banners, compete in real-time team battles with live sync scorebars, and climb weekly/monthly/seasonal/all-time leaderboards.",
    highlightsVi: ["Tải ảnh đại diện & banner Clan", "Khung Chat nội bộ Clan", "Đấu Nhóm Clan 2v2 - 5v5"],
    highlightsEn: ["Custom Clan Avatar & Banner upload", "Internal Clan Chatbox", "Clan Team Battles 2v2 - 5v5"],
  },
  {
    id: "cl2",
    version: "v2.3.5",
    date: "18/08/2026",
    tag: "improve",
    tagLabelVi: "Nâng cấp",
    tagLabelEn: "Improvement",
    icon: "⚡",
    color: "#22d3ee",
    titleVi: "Tối ưu hóa tốc độ tải trang MathMap Detail & KaTeX Render",
    titleEn: "Optimized MathMap Detail & KaTeX Math Rendering Speed",
    descriptionVi:
      "Giảm 40% thời gian tải trang chi tiết MathMap và hiển thị mượt mà hơn trên các thiết bị di động có cấu hình phổ thông. Tăng tốc độ render công thức toán học KaTeX lên gấp 2 lần.",
    descriptionEn:
      "Reduced MathMap detail page load time by 40% with smoother rendering on mobile devices. Boosted KaTeX math formula rendering speed by 2x.",
    highlightsVi: ["Tăng tốc KaTeX 2x", "Giảm 40% thời gian tải trang", "Hỗ trợ thiết bị yếu"],
    highlightsEn: ["2x KaTeX Acceleration", "40% Faster Page Load", "Low-end Device Support"],
  },
  {
    id: "cl3",
    version: "v2.3.0",
    date: "12/08/2026",
    tag: "new",
    tagLabelVi: "Tính năng mới",
    tagLabelEn: "New Feature",
    icon: "💬",
    color: "#a855f7",
    titleVi: "Hệ thống Thảo luận & Báo cáo bình luận cộng đồng",
    titleEn: "Community Discussion & Comment Moderation System",
    descriptionVi:
      "Hỗ trợ hỏi đáp đa tầng dưới từng MathMap, bình chọn câu trả lời hữu ích (upvote), gắn huy hiệu thành viên tích cực và hệ thống kiểm duyệt nội dung tự động bảo vệ môi trường học tập.",
    descriptionEn:
      "Enabled nested Q&A discussions under every MathMap, helpful answer upvoting, active member badges, and automated comment moderation to protect the learning environment.",
    highlightsVi: ["Hỏi đáp đa tầng", "Upvote câu trả lời hay", "Kiểm duyệt tự động"],
    highlightsEn: ["Nested Discussions", "Answer Upvoting", "Automated Moderation"],
  },
  {
    id: "cl4",
    version: "v2.2.8",
    date: "05/08/2026",
    tag: "fix",
    tagLabelVi: "Sửa lỗi",
    tagLabelEn: "Bug Fix",
    icon: "🛠️",
    color: "#34d399",
    titleVi: "Sửa lỗi đồng bộ điểm thi đấu khi mất kết nối mạng đột ngột",
    titleEn: "Fixed Match Score Sync upon Sudden Network Disconnection",
    descriptionVi:
      "Hệ thống tự động lưu cache cục bộ và gửi lại dữ liệu làm bài ngay khi thiết bị kết nối mạng Internet trở lại, đảm bảo kết quả thi đấu của học sinh không bao giờ bị mất.",
    descriptionEn:
      "Automated local state caching and instant background score resubmission when internet reconnects, ensuring students never lose match progress.",
    highlightsVi: ["Tự động lưu Local Cache", "Khôi phục trạng thái làm bài", "Đảm bảo công bằng"],
    highlightsEn: ["Auto Local Caching", "Progress Recovery", "Fair Play Guarantee"],
  },
];

export default function Changelog({ entries = CHANGELOG_ENTRIES }) {
  const { lang, t } = useLanguage();
  const [filter, setFilter] = useState("all");

  const FILTER_BUTTONS = [
    { id: "all", label: t("Tất cả", "All") },
    { id: "new", label: t("🚀 Tính năng mới", "🚀 New Features") },
    { id: "improve", label: t("⚡ Nâng cấp", "⚡ Improvements") },
    { id: "fix", label: t("🛠️ Sửa lỗi", "🛠️ Fixes") },
  ];

  const filteredEntries = filter === "all"
    ? entries
    : entries.filter(e => e.tag === filter);

  return (
    <div style={{ marginBottom: 64 }}>
      {/* Header & Filter Controls */}
      <div style={{
        display: "flex", flexWrap: "wrap", alignItems: "center",
        justifyContent: "space-between", gap: 16, marginBottom: 28,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "linear-gradient(135deg, rgba(236,72,153,0.18), rgba(99,102,241,0.18))",
            border: "1px solid rgba(236,72,153,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22,
          }}>
            📜
          </div>
          <div>
            <h3 style={{
              fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 900, color: "white", margin: 0,
              background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {t("Nhật Ký Cập Nhật", "Changelog & System Updates")}
            </h3>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
              {t("Lịch sử phát triển, tính năng mới và cải tiến hiệu năng DuoMath", "History of new features, optimizations and stability releases")}
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{
          display: "inline-flex",
          background: "rgba(2,6,23,0.8)", backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12,
          padding: 4, gap: 4,
        }}>
          {FILTER_BUTTONS.map((btn) => {
            const active = filter === btn.id;
            return (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8, border: "none", cursor: "pointer",
                  fontWeight: 800, fontSize: 11, letterSpacing: 0.5,
                  background: active
                    ? "linear-gradient(135deg, #ec4899, #8b5cf6)"
                    : "transparent",
                  color: active ? "white" : "rgba(255,255,255,0.45)",
                  transition: "all 0.2s",
                  boxShadow: active ? "0 2px 10px rgba(236,72,153,0.3)" : "none",
                }}
                onMouseEnter={e => {
                  if (!active) {
                    e.currentTarget.style.color = "white";
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                {btn.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Vertical Timeline */}
      <div style={{ position: "relative", paddingLeft: "clamp(24px, 6vw, 130px)" }}>
        {/* Glowing timeline spine */}
        <div style={{
          position: "absolute",
          left: "clamp(12px, 3vw, 100px)",
          top: 8, bottom: 8, width: 2,
          background: "linear-gradient(180deg, #ec4899 0%, #22d3ee 50%, #34d399 100%)",
          boxShadow: "0 0 12px rgba(34,211,238,0.4)",
          borderRadius: 2,
        }} />

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {filteredEntries.map((entry) => {
            const isVi = lang === "vi";
            const tagLabel = isVi ? entry.tagLabelVi : entry.tagLabelEn;
            const title = isVi ? entry.titleVi : entry.titleEn;
            const description = isVi ? entry.descriptionVi : entry.descriptionEn;
            const highlights = isVi ? entry.highlightsVi : entry.highlightsEn;

            return (
              <div key={entry.id} style={{ position: "relative" }}>
                {/* Desktop Date & Version label (left of timeline) */}
                <div style={{
                  position: "absolute",
                  left: "clamp(-130px, -6vw, -24px)",
                  top: 14,
                  width: 80,
                  textAlign: "right",
                  display: "none",
                }}
                  className="changelog-desktop-date"
                >
                  <span style={{ display: "block", fontFamily: "monospace", fontWeight: 800, fontSize: 11, color: "#22d3ee" }}>
                    {entry.date}
                  </span>
                  <span style={{ fontSize: 10, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>
                    {entry.version}
                  </span>
                </div>

                {/* Glowing Marker Pin */}
                <div style={{
                  position: "absolute",
                  left: "clamp(-20px, -3vw, -36px)",
                  top: 18,
                  width: 14, height: 14,
                  borderRadius: "50%",
                  background: entry.color,
                  border: "2.5px solid #020617",
                  boxShadow: `0 0 14px ${entry.color}`,
                  zIndex: 2,
                }} />

                {/* Glassmorphism Card */}
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(10,10,28,0.85) 0%, rgba(4,12,36,0.8) 100%)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 18,
                    padding: "clamp(18px, 4vw, 24px)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
                    transition: "all 0.25s cubic-bezier(0.2,0.8,0.2,1)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${entry.color}66`;
                    e.currentTarget.style.transform = "translateY(-3px)";
                    e.currentTarget.style.boxShadow = `0 12px 36px rgba(0,0,0,0.5), 0 0 24px ${entry.color}22`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)";
                  }}
                >
                  {/* Top Bar: Tag + Version + Date */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {/* Tag Badge */}
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8,
                        padding: "3px 10px", borderRadius: 100,
                        background: `${entry.color}15`,
                        color: entry.color,
                        border: `1px solid ${entry.color}44`,
                      }}>
                        <span>{entry.icon}</span>
                        <span>{tagLabel}</span>
                      </span>

                      {/* Version Pill */}
                      <span style={{
                        fontFamily: "monospace", fontSize: 11, fontWeight: 800,
                        padding: "2px 8px", borderRadius: 6,
                        background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.75)",
                      }}>
                        {entry.version}
                      </span>
                    </div>

                    {/* Date */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#22d3ee" }}>
                      <span>📅</span>
                      <span>{entry.date}</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h4 style={{
                    fontSize: "clamp(14.5px, 3vw, 17px)", fontWeight: 800,
                    color: "white", margin: "0 0 8px", lineHeight: 1.4,
                  }}>
                    {title}
                  </h4>

                  {/* Description */}
                  <p style={{
                    fontSize: 13, color: "rgba(255,255,255,0.65)",
                    lineHeight: 1.7, margin: "0 0 14px",
                  }}>
                    {description}
                  </p>

                  {/* Key Highlights */}
                  {highlights && highlights.length > 0 && (
                    <div style={{
                      display: "flex", flexWrap: "wrap", gap: 6,
                      paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}>
                      {highlights.map((h, i) => (
                        <span key={i} style={{
                          fontSize: 11, fontWeight: 700,
                          padding: "2px 9px", borderRadius: 6,
                          background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.55)",
                        }}>
                          ✦ {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
