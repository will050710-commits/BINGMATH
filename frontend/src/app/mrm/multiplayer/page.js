"use client";
import { useState } from "react";
import MultiplayerLobby from "@/components/mrm/MultiplayerLobby";
import Link from "next/link";

export default function MultiplayerPage() {
  const [selectedLevel, setSelectedLevel] = useState(null); // null | "thcs" | "thpt"

  if (selectedLevel) {
    return <MultiplayerLobby level={selectedLevel} />;
  }

  return (
    <div style={{
      width: "100%", minHeight: "100vh", background: "#0a0a1a",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      color: "white", fontFamily: "system-ui, sans-serif", position: "relative", overflow: "hidden",
      padding: "24px"
    }}>
      {/* Decorative Blur Orbs */}
      <div style={{ position: "absolute", width: 300, height: 300, background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)", left: "10%", top: "10%", borderRadius: "50%", filter: "blur(40px)" }} />
      <div style={{ position: "absolute", width: 300, height: 300, background: "radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)", right: "10%", bottom: "10%", borderRadius: "50%", filter: "blur(40px)" }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 640 }}>
        {/* Back Button */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 8, padding: "8px 16px", marginBottom: 40,
            fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)",
            cursor: "pointer", transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(56,189,248,0.1)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
          >
            ← Trang chủ
          </div>
        </Link>

        <h1 style={{ fontSize: 36, fontWeight: "900", color: "white", marginBottom: 12, letterSpacing: 1.5, background: "linear-gradient(135deg, #fff 30%, #93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          MATH RACE MULTIPLAYER
        </h1>
        <p style={{ color: "#94a3b8", fontSize: 18, marginBottom: 48, fontWeight: "500" }}>
          Chọn cấp học của bạn để kết nối với server tương ứng
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, width: "100%" }}>
          {/* Option Cấp 2 */}
          <div
            onClick={() => setSelectedLevel("thcs")}
            style={{
              background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(13,148,136,0.2)", borderRadius: 16,
              padding: "40px 24px", cursor: "pointer",
              transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(13,148,136,0.25)"; e.currentTarget.style.borderColor = "rgba(45,212,191,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(13,148,136,0.2)"; }}
          >
            <div style={{ fontSize: 48, marginBottom: 20 }}>🏫</div>
            <h2 style={{ fontSize: 24, fontWeight: "800", color: "#2dd4bf", marginBottom: 12 }}>SERVER CẤP 2</h2>
            <div style={{ display: "inline-block", background: "rgba(13,148,136,0.15)", color: "#2dd4bf", border: "1px solid rgba(13,148,136,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
              Lớp 6 – Lớp 9
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Bao gồm các chủ đề: Số học, Đại số cơ bản, Hình học trực quan, Phương trình, Hệ thức lượng đường tròn.
            </p>
          </div>

          {/* Option Cấp 3 */}
          <div
            onClick={() => setSelectedLevel("thpt")}
            style={{
              background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)",
              border: "1px solid rgba(99,102,241,0.2)", borderRadius: 16,
              padding: "40px 24px", cursor: "pointer",
              transition: "transform 0.3s, box-shadow 0.3s, border-color 0.3s"
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 12px 30px rgba(99,102,241,0.25)"; e.currentTarget.style.borderColor = "rgba(129,140,248,0.5)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "rgba(99,102,241,0.2)"; }}
          >
            <div style={{ fontSize: 48, marginBottom: 20 }}>🎓</div>
            <h2 style={{ fontSize: 24, fontWeight: "800", color: "#818cf8", marginBottom: 12 }}>SERVER CẤP 3</h2>
            <div style={{ display: "inline-block", background: "rgba(99,102,241,0.15)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.3)", borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
              Lớp 10 – Lớp 12
            </div>
            <p style={{ color: "#94a3b8", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
              Bao gồm các chủ đề: Khảo sát hàm số, Đạo hàm, Tích phân, Lượng giác nâng cao, Hình học giải tích Oxyz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
