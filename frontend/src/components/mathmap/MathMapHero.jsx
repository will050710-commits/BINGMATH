"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function MathMapHero({
  id = "mm001",
  title = "Phương Trình & Bất Phương Trình Nâng Cao",
  grade = "Lớp 11",
  subject = "Đại số",
  description = "MathMap tổng hợp toàn diện các dạng phương trình bậc hai, hệ phương trình và ứng dụng thực tế từ cơ bản đến chuyên sâu. Phù hợp cho học sinh ôn luyện thi THPT QG và nâng cao tư duy giải toán.",
  difficulty_fmp = 4.3,
  topicCount = 18,
  learnersCount = 4920,
  maxXP = 1250,
  completionRate = 78,
  userProgress = 45,
  isSaved = false,
  onToggleSave = () => {},
}) {
  const [saved, setSaved] = useState(isSaved);
  const [startHovered, setStartHovered] = useState(false);
  const [saveHovered, setSaveHovered] = useState(false);

  const stars = Math.min(5, Math.max(1, Math.round(difficulty_fmp / 2)));
  const starStr = "★".repeat(stars) + "☆".repeat(5 - stars);

  const difficultyLabel =
    difficulty_fmp < 2 ? "Dễ" :
    difficulty_fmp < 3.5 ? "Trung bình" :
    difficulty_fmp < 4.5 ? "Khó" : "Chuyên sâu";

  const diffColor =
    difficulty_fmp < 2 ? "#34d399" :
    difficulty_fmp < 3.5 ? "#fbbf24" :
    difficulty_fmp < 4.5 ? "#f97316" : "#ef4444";

  const stats = [
    { value: topicCount, label: "Chủ đề", color: "white" },
    { value: Number(learnersCount).toLocaleString(), label: "Người học", color: "white" },
    { value: "+" + Number(maxXP).toLocaleString(), label: "XP Tối đa", color: "#fbbf24" },
    { value: completionRate + "%", label: "Tỉ lệ hoàn thành", color: "#34d399" },
  ];

  return (
    <div style={{
      position: "relative", borderRadius: 20, overflow: "hidden", marginBottom: 40,
      background: "radial-gradient(ellipse 800px 400px at 85% 15%, rgba(14,165,233,0.22), transparent 60%), radial-gradient(ellipse 700px 400px at 15% 85%, rgba(236,72,153,0.25), transparent 60%), linear-gradient(135deg, #0a1628 0%, #0c2340 50%, #0a1424 100%)",
      border: "1px solid rgba(255,255,255,0.09)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      padding: "clamp(28px, 5vw, 52px) clamp(24px, 5vw, 48px)",
    }}>
      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.18,
        backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.06) 0 2px, transparent 2px 30px)",
      }} />

      <div style={{ position: "relative" }}>
        {/* Top: Tag + Title */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 28 }}>
          <div style={{ flex: "1 1 300px", maxWidth: 620 }}>
            {/* Subject Tag */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)",
              borderRadius: 100, padding: "4px 14px",
              fontSize: 11, fontWeight: 800, color: "#22d3ee",
              letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 14,
            }}>
              {subject} · {grade}
            </div>

            <h1 style={{
              fontSize: "clamp(20px, 4vw, 34px)", fontWeight: 900, color: "white",
              margin: "0 0 14px 0", lineHeight: 1.15, letterSpacing: -0.5,
            }}>
              {title}
            </h1>
            <p style={{
              fontSize: "clamp(13px, 3vw, 15px)", color: "rgba(255,255,255,0.58)",
              lineHeight: 1.7, margin: 0,
            }}>
              {description}
            </p>
          </div>

          {/* Difficulty */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
            <span style={{ fontSize: 20, letterSpacing: 2, color: "#f472b6", userSelect: "none" }}>
              {starStr}
            </span>
            <div style={{
              background: `${diffColor}18`,
              border: `1px solid ${diffColor}44`,
              borderRadius: 8, padding: "5px 12px",
              fontWeight: 800, fontSize: 12, color: diffColor,
              letterSpacing: 0.5,
            }}>
              {difficulty_fmp.toFixed(1)} — {difficultyLabel}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 0,
          padding: "24px 0",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          marginBottom: 28,
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{
              textAlign: "center",
              borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
              padding: "0 12px",
            }}>
              <span style={{
                display: "block", fontFamily: "monospace", fontWeight: 900,
                fontSize: "clamp(20px, 3.5vw, 28px)", color: s.color,
              }}>
                {s.value}
              </span>
              <span style={{
                display: "block", fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                letterSpacing: 1.2, color: "rgba(255,255,255,0.38)", marginTop: 5,
              }}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <Link href={`/mrm/singleplayer?map=${id}`} style={{ textDecoration: "none" }}>
            <button
              onMouseEnter={() => setStartHovered(true)}
              onMouseLeave={() => setStartHovered(false)}
              style={{
                padding: "13px 28px",
                background: startHovered
                  ? "linear-gradient(135deg, #0ea5e9, #6366f1)"
                  : "linear-gradient(135deg, #22d3ee, #0ea5e9)",
                border: "none", borderRadius: 12,
                color: "white", fontWeight: 800, fontSize: 14, cursor: "pointer",
                transition: "all 0.25s", transform: startHovered ? "translateY(-2px) scale(1.02)" : "none",
                boxShadow: startHovered ? "0 8px 24px rgba(14,165,233,0.45)" : "0 4px 16px rgba(14,165,233,0.3)",
                letterSpacing: 0.3,
              }}
            >
              {userProgress > 0 ? "⚡ Tiếp tục học" : "🚀 Bắt đầu học"}
            </button>
          </Link>

          <button
            onMouseEnter={() => setSaveHovered(true)}
            onMouseLeave={() => setSaveHovered(false)}
            onClick={() => { setSaved(!saved); onToggleSave(!saved); }}
            style={{
              padding: "13px 24px",
              background: saved ? "rgba(244,114,182,0.08)" : saveHovered ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${saved ? "rgba(244,114,182,0.35)" : "rgba(255,255,255,0.15)"}`,
              borderRadius: 12,
              color: saved ? "#f472b6" : "rgba(255,255,255,0.7)",
              fontWeight: 800, fontSize: 14, cursor: "pointer",
              transition: "all 0.25s", transform: saveHovered ? "translateY(-2px)" : "none",
            }}
          >
            {saved ? "❤️ Đã lưu MathMap" : "🤍 Lưu MathMap"}
          </button>
        </div>
      </div>
    </div>
  );
}
