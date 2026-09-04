"use client";
import React from "react";

export default function LearningObjectives({
  objectives = [
    "Giải thành thạo phương trình bậc hai bằng 3 phương pháp khác nhau (phân tích nhân tử, dùng biệt thức Delta, đổi biến)",
    "Áp dụng định lý Vi-ét vào giải các bài toán thực tế và tìm tham số m để phương trình có nghiệm",
    "Giải hệ bất phương trình và biện luận tập nghiệm chuẩn cấu trúc đề thi THPT Quốc Gia",
  ],
}) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(2,8,24,0.88) 0%, rgba(4,12,36,0.84) 100%)",
      backdropFilter: "blur(22px)",
      WebkitBackdropFilter: "blur(22px)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 18,
      padding: "clamp(22px, 4vw, 36px) clamp(20px, 4vw, 32px)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)",
      marginBottom: 32,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
        <span style={{ fontSize: 20 }}>🎯</span>
        <h3 style={{
          fontSize: "clamp(16px, 3vw, 20px)", fontWeight: 900, color: "white", margin: 0,
          background: "linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Mục tiêu học tập
        </h3>
      </div>

      <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>
        {objectives.map((obj, idx) => (
          <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 2,
              background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="11" height="11" viewBox="0 0 16 16">
                <path d="M2 8l4 4 8-8" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <span style={{ fontSize: "clamp(13px, 3vw, 15px)", color: "rgba(255,255,255,0.65)", lineHeight: 1.7 }}>
              {obj}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
