"use client";
import React from "react";
import Link from "next/link";

const DIFF_TIERS = [
  { max: 3, color: "#34d399", label: "Dễ" },
  { max: 5, color: "#fbbf24", label: "Trung bình" },
  { max: 7, color: "#f97316", label: "Khó" },
  { max: 10, color: "#ef4444", label: "Chuyên sâu" },
];

function getDiffTier(v) {
  return DIFF_TIERS.find((t) => v <= t.max) || DIFF_TIERS[DIFF_TIERS.length - 1];
}

function ProgressRing({ percent, size = 36, color = "#22d3ee", strokeWidth = 3 }) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(1, percent / 100));
  return (
    <svg width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${circ - offset} ${offset}`}
        strokeLinecap="round"
        style={{ transform: `rotate(-90deg)`, transformOrigin: `${size / 2}px ${size / 2}px` }}
      />
      <text x={size / 2} y={size / 2 + 4} textAnchor="middle" fontSize={8} fontWeight={800} fill={color}>
        {Math.round(percent)}%
      </text>
    </svg>
  );
}

export default function TopicList({
  mathmapId = "mm001",
  topics = [
    { id: "t1", sequenceIndex: 1, name: "Ôn tập phương trình bậc nhất & Đưa về bậc nhất", exerciseCount: 6, difficulty: 1.8, progress: 100, earnedRank: "SS", xp: 120, status: "completed" },
    { id: "t2", sequenceIndex: 2, name: "Phương trình bậc hai một ẩn & Biệt thức Delta", exerciseCount: 9, difficulty: 3.2, progress: 65, xp: 180, status: "in_progress" },
    { id: "t3", sequenceIndex: 3, name: "Định lý Vi-ét & Ứng dụng tìm tham số m", exerciseCount: 7, difficulty: 4.1, progress: 15, xp: 210, status: "in_progress" },
    { id: "t4", sequenceIndex: 4, name: "Hệ bất phương trình bậc hai hai ẩn", exerciseCount: 10, difficulty: 5.6, progress: 0, xp: 260, status: "not_started" },
    { id: "t5", sequenceIndex: 5, name: "Phương trình chứa căn & Đổi biến nâng cao", exerciseCount: 12, difficulty: 7.8, progress: 0, xp: 350, status: "locked", unlockRequirement: "Hoàn thành Chủ đề 4 với rank A trở lên" },
  ],
}) {
  const sorted = [...topics].sort((a, b) => (a.sequenceIndex || 0) - (b.sequenceIndex || 0));

  return (
    <div style={{ marginBottom: 40 }}>
      {/* Section Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <span style={{ fontSize: 22 }}>📚</span>
        <h2 style={{
          fontSize: "clamp(17px, 4vw, 24px)", fontWeight: 900, color: "white", margin: 0,
          background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Danh sách chủ đề
        </h2>
        <span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.35)", fontWeight: 700 }}>
          ({sorted.length} phần)
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {sorted.map((topic) => {
          const tier = getDiffTier(topic.difficulty);
          const isLocked = topic.status === "locked";
          const isCompleted = topic.progress === 100 || topic.status === "completed";

          const rowContent = (
            <div style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "16px 20px",
              background: isLocked ? "rgba(10,10,24,0.5)" : "rgba(10,10,24,0.8)",
              backdropFilter: "blur(12px)",
              border: `1px solid ${isLocked ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 14,
              opacity: isLocked ? 0.55 : 1,
              cursor: isLocked ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
              onMouseEnter={e => {
                if (!isLocked) {
                  e.currentTarget.style.borderColor = "rgba(34,211,238,0.35)";
                  e.currentTarget.style.background = "rgba(14,165,233,0.06)";
                  e.currentTarget.style.transform = "translateX(4px)";
                }
              }}
              onMouseLeave={e => {
                if (!isLocked) {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(10,10,24,0.8)";
                  e.currentTarget.style.transform = "none";
                }
              }}
            >
              {/* Difficulty Gem */}
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0,
                background: isLocked ? "rgba(71,85,105,0.5)" : `${tier.color}22`,
                border: `1px solid ${isLocked ? "rgba(71,85,105,0.3)" : `${tier.color}44`}`,
                boxShadow: isLocked ? "none" : `0 0 12px ${tier.color}33`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, userSelect: "none",
              }}>
                {isLocked ? "🔒" : (
                  <span style={{ fontFamily: "monospace", fontWeight: 900, fontSize: 11, color: tier.color }}>
                    {topic.sequenceIndex}
                  </span>
                )}
              </div>

              {/* Topic Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{
                    fontWeight: 700, fontSize: "clamp(13px, 3vw, 15px)",
                    color: isLocked ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.9)",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {topic.name}
                  </span>
                  {isLocked && (
                    <span style={{
                      fontSize: 9, fontWeight: 800, textTransform: "uppercase",
                      color: "#fbbf24", background: "rgba(245,158,11,0.1)",
                      border: "1px solid rgba(245,158,11,0.25)", borderRadius: 5,
                      padding: "1px 6px", flexShrink: 0, letterSpacing: 0.5,
                    }}>
                      Khóa
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.38)" }}>
                    {topic.exerciseCount} bài tập
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: tier.color, fontWeight: 700 }}>
                    {topic.difficulty} ★ {tier.label}
                  </span>
                  {isLocked && topic.unlockRequirement && (
                    <>
                      <span style={{ color: "rgba(255,255,255,0.2)" }}>•</span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", fontStyle: "italic" }}>
                        {topic.unlockRequirement}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Progress Ring + XP */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                <ProgressRing
                  percent={isLocked ? 0 : topic.progress}
                  size={36}
                  color={isCompleted ? "#34d399" : tier.color}
                  strokeWidth={3}
                />
                {isCompleted && topic.earnedRank && (
                  <div style={{
                    background: "linear-gradient(135deg, #fbbf24, #f59e0b)",
                    color: "#1a0512", borderRadius: 7,
                    padding: "3px 8px", fontWeight: 900, fontSize: 11,
                    boxShadow: "0 2px 8px rgba(251,191,36,0.4)",
                    userSelect: "none",
                  }}>
                    {topic.earnedRank}
                  </div>
                )}
                <div style={{ textAlign: "right", fontFamily: "monospace", fontWeight: 800, fontSize: 12, color: "#fbbf24", minWidth: 54 }}>
                  +{topic.xp} XP
                </div>
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 16 }}>
                  {isLocked ? "—" : "→"}
                </span>
              </div>
            </div>
          );

          if (isLocked) {
            return <div key={topic.id} title={`Chưa mở khóa: ${topic.unlockRequirement || ""}`}>{rowContent}</div>;
          }
          return (
            <Link key={topic.id} href={`/mrm/singleplayer?map=${mathmapId}&topic=${topic.id}`} style={{ textDecoration: "none" }}>
              {rowContent}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
