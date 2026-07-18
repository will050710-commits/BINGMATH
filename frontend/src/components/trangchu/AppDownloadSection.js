"use client";
// ═══════════════════════════════════════════════════════════════
//  AppDownloadSection — DuoMath Native App Download
//  Premium cross-platform section for the homepage
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion } from "framer-motion";

// ─── Phone Mockup ─────────────────────────────────────────────
function PhoneMockup() {
  const [activeScreen, setActiveScreen] = useState(0);
  const screens = [
    {
      bg: "linear-gradient(160deg, #020c1b 0%, #0c2340 60%, #0e3158 100%)",
      content: (
        <div style={{ padding: "14px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#38bdf8", marginBottom: 10, letterSpacing: 0.5 }}>📚 BÀI HỌC HÔM NAY</div>
          {["Đạo hàm & Tích phân", "Lượng giác nâng cao", "Xác suất thống kê"].map((t, i) => (
            <div key={i} style={{
              background: i === 0 ? "linear-gradient(135deg,rgba(99,102,241,0.25),rgba(56,189,248,0.15))" : "rgba(255,255,255,0.04)",
              border: `1px solid ${i === 0 ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`,
              borderRadius: 10, padding: "9px 11px", marginBottom: 7,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 14 }}>{["🔢", "📐", "🎲"][i]}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: i === 0 ? "#a5b4fc" : "white" }}>{t}</div>
                <div style={{ fontSize: 8.5, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
                  {["Đang học • Lớp 12", "Hoàn thành 80%", "Chưa bắt đầu"][i]}
                </div>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      bg: "linear-gradient(160deg, #0d0524 0%, #1a0a3d 60%, #160730 100%)",
      content: (
        <div style={{ padding: "14px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#a78bfa", marginBottom: 10, letterSpacing: 0.5 }}>⚔️ ĐẤU HẠNG MRM</div>
          <div style={{ background: "linear-gradient(135deg,rgba(167,139,250,0.2),rgba(99,102,241,0.1))", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 12, padding: 11, marginBottom: 8 }}>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Hạng của bạn</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: "#a78bfa" }}>💎 DIAMOND</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>Top 5% toàn quốc</div>
          </div>
          {[["🔥", "Streak", "12 ngày"], ["⭐", "XP", "4,820"], ["🏆", "Thắng", "47 trận"]].map(([ic, lb, val], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{ic} {lb}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "white" }}>{val}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      bg: "linear-gradient(160deg, #001a0d 0%, #003a1a 60%, #00291a 100%)",
      content: (
        <div style={{ padding: "14px 12px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: "#34d399", marginBottom: 10, letterSpacing: 0.5 }}>🎮 MINI GAME</div>
          <div style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)", borderRadius: 12, padding: 12, marginBottom: 10, textAlign: "center" }}>
            <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Câu hỏi 3/10</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "white", marginBottom: 10 }}>
              Giá trị của sin(π/6) là?
            </div>
            {[["A. 1/2", true], ["B. √3/2", false], ["C. 1", false], ["D. 0", false]].map(([opt, correct], i) => (
              <div key={i} style={{
                background: correct ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.04)",
                border: `1px solid ${correct ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 8, padding: "6px 10px", marginBottom: 5,
                fontSize: 10, color: correct ? "#34d399" : "rgba(255,255,255,0.7)",
                fontWeight: correct ? 700 : 400, textAlign: "left",
              }}>{opt}</div>
            ))}
          </div>
        </div>
      )
    },
  ];

  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center" }}>
      {/* Glow behind phone */}
      <div style={{
        position: "absolute",
        width: 220, height: 380,
        borderRadius: "50%",
        background: "radial-gradient(ellipse at 50% 50%, rgba(56,189,248,0.18) 0%, rgba(99,102,241,0.12) 50%, transparent 70%)",
        filter: "blur(30px)",
      }} />

      {/* Phone frame */}
      <div style={{
        width: 200, height: 390,
        background: "linear-gradient(160deg, #1a2035 0%, #0d1425 100%)",
        borderRadius: 36,
        border: "2px solid rgba(255,255,255,0.12)",
        boxShadow: "0 30px 60px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 0 1px rgba(0,0,0,0.5)",
        overflow: "hidden",
        position: "relative",
        animation: "phoneFloat 4s ease-in-out infinite",
      }}>
        {/* Notch */}
        <div style={{
          position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
          width: 80, height: 22,
          background: "#0d1425",
          borderRadius: "0 0 16px 16px",
          zIndex: 10,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#1a2035" }} />
          <div style={{ width: 28, height: 4, borderRadius: 4, background: "#1a2035" }} />
        </div>

        {/* Screen content */}
        <div style={{ width: "100%", height: "100%", background: screens[activeScreen].bg, paddingTop: 26, overflowY: "hidden" }}>
          {/* Status bar */}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "0 12px 4px", fontSize: 7.5, color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>
            <span>9:41</span>
            <span>●●●●● 5G 🔋</span>
          </div>
          {screens[activeScreen].content}
        </div>

        {/* Home indicator */}
        <div style={{
          position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)",
          width: 60, height: 3, borderRadius: 2,
          background: "rgba(255,255,255,0.25)",
        }} />
      </div>

      {/* Screen dots */}
      <div style={{ position: "absolute", bottom: -24, display: "flex", gap: 6 }}>
        {screens.map((_, i) => (
          <button
            key={i}
            onClick={() => setActiveScreen(i)}
            style={{
              width: i === activeScreen ? 18 : 6, height: 6,
              borderRadius: 3, border: "none", cursor: "pointer",
              background: i === activeScreen ? "#38bdf8" : "rgba(255,255,255,0.2)",
              transition: "all 0.3s",
              padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main AppDownloadSection ──────────────────────────────────
export default function AppDownloadSection() {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://duomath.app").then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const platforms = [
    {
      id: "android-native",
      icon: "📦",
      name: "Android Native App (APK)",
      sub: "Cài đặt trực tiếp bằng file APK",
      desc: "Tải file APK trực tiếp cho thiết bị Android",
      gradient: "linear-gradient(135deg, #1b263b, #0d1b2a)",
      border: "rgba(56,189,248,0.35)",
      glow: "rgba(56,189,248,0.15)",
      textColor: "#38bdf8",
      action: () => window.open("/duomath.apk", "_blank"),
      btnLabel: "Tải file APK",
      available: true,
    },
    {
      id: "ios-native",
      icon: "🍎",
      name: "iOS App (IPA)",
      sub: "App Store / TestFlight",
      desc: "Phiên bản dành cho iPhone / iPad sắp ra mắt",
      gradient: "linear-gradient(135deg, #1d2030, #2a1f40)",
      border: "rgba(167,139,250,0.2)",
      glow: "rgba(167,139,250,0.05)",
      textColor: "rgba(255,255,255,0.4)",
      action: undefined,
      btnLabel: "Sắp ra mắt",
      available: false,
    }
  ];

  const benefits = [
    { icon: "⚡", title: "Nhanh hơn 3x", desc: "Tải tức thì, không cần chờ" },
    { icon: "📴", title: "Học Offline", desc: "Xem bài đã học khi mất mạng" },
    { icon: "🔔", title: "Nhắc nhở học tập", desc: "Thông báo streak hàng ngày" },
    { icon: "🏠", title: "Trực quan", desc: "Chạy mượt mà, đầy đủ hiệu ứng" },
  ];

  return (
    <div className="reveal" data-reveal style={{ marginTop: 80 }}>
      {/* Section header */}
      <div style={{
        textAlign: "center",
        marginBottom: 48,
        background: "linear-gradient(135deg, rgba(2,8,24,0.82) 0%, rgba(4,12,36,0.78) 100%)",
        backdropFilter: "blur(22px)",
        WebkitBackdropFilter: "blur(22px)",
        border: "1px solid rgba(255,255,255,0.055)",
        borderRadius: 18,
        padding: "clamp(20px,4vw,36px) clamp(20px,6vw,56px)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
      }}>
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "linear-gradient(135deg, rgba(56,189,248,0.15), rgba(99,102,241,0.15))",
          border: "1px solid rgba(56,189,248,0.3)",
          borderRadius: 100, padding: "5px 16px",
          fontSize: 11, fontWeight: 800, color: "#7dd3fc",
          letterSpacing: 1.2, textTransform: "uppercase",
          marginBottom: 16,
          boxShadow: "0 0 18px rgba(56,189,248,0.12)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#38bdf8", display: "inline-block", boxShadow: "0 0 6px #38bdf8" }} />
          📱 Ứng dụng di động
        </div>

        <h2 style={{
          fontSize: "clamp(22px,5vw,34px)",
          fontWeight: 900, margin: 0, lineHeight: 1.15,
          background: "linear-gradient(135deg, #ffffff 30%, #7dd3fc 65%, #a5b4fc 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          letterSpacing: 0.3,
        }}>
          Tải DuoMath — Trải Nghiệm Mượt Mà Nhất
        </h2>

        {/* Underline */}
        <div style={{
          margin: "10px auto 0",
          width: "60%", height: 3, borderRadius: 2,
          background: "linear-gradient(90deg, transparent, #38bdf8, #6366f1, transparent)",
          boxShadow: "0 0 12px rgba(56,189,248,0.5)",
        }} />

        <p style={{
          marginTop: 20,
          color: "rgba(255,255,255,0.48)",
          fontSize: "clamp(13px,3.5vw,15.5px)",
          maxWidth: 560, lineHeight: 1.6, margin: "20px auto 0",
        }}>
          Tải ứng dụng DuoMath Native trực tiếp để học tập và đấu hạng với tốc độ tối đa, đầy đủ các tính năng ngoại tuyến và nhắc nhở học tập.
        </p>
      </div>

      {/* Main grid: Phone + Platforms */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 40,
        alignItems: "center",
        marginBottom: 48,
      }}>
        {/* Left: Phone mockup */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "40px 0" }}>
          <PhoneMockup />
        </div>

        {/* Right: Platform cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase", letterSpacing: 1, marginBottom: 4,
          }}>
            Tải phiên bản phù hợp
          </div>

          {platforms.map((p) => (
            <motion.div
              key={p.id}
              whileHover={p.action ? { scale: 1.02, y: -2 } : {}}
              whileTap={p.action ? { scale: 0.98 } : {}}
              style={{
                background: p.gradient,
                border: `1px solid ${p.border}`,
                borderRadius: 16,
                padding: "16px 20px",
                cursor: p.action ? "pointer" : "default",
                boxShadow: `0 4px 20px rgba(0,0,0,0.3), inset 0 0 30px ${p.glow}`,
                display: "flex", alignItems: "center", gap: 14,
                transition: "box-shadow 0.3s",
                position: "relative", overflow: "hidden",
                opacity: p.available ? 1 : 0.6,
              }}
              onClick={p.action}
            >
              {/* Glow orb */}
              <div style={{
                position: "absolute", top: -20, right: -20,
                width: 80, height: 80, borderRadius: "50%",
                background: p.glow, filter: "blur(20px)",
                pointerEvents: "none",
              }} />

              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: "rgba(255,255,255,0.06)",
                border: `1px solid ${p.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>
                {p.icon}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: "white" }}>{p.name}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{p.sub}</div>
                <div style={{ fontSize: 12, color: p.textColor, marginTop: 3, fontWeight: 600 }}>{p.desc}</div>
              </div>

              <div style={{
                flexShrink: 0,
                background: p.available
                  ? `linear-gradient(135deg, ${p.border.replace("0.35)", "0.45)")} , ${p.glow.replace("0.15)", "0.25)")})`
                  : "rgba(255,255,255,0.05)",
                border: `1px solid ${p.available ? p.border : "rgba(255,255,255,0.1)"}`,
                borderRadius: 10,
                padding: "7px 14px",
                fontSize: 11.5, fontWeight: 700,
                color: p.available ? p.textColor : "rgba(255,255,255,0.35)",
                whiteSpace: "nowrap",
                minHeight: 36,
                display: "flex", alignItems: "center",
                cursor: p.action ? "pointer" : "default",
              }}>
                {p.btnLabel}
              </div>
            </motion.div>
          ))}

          {/* Copy link row */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, padding: "12px 16px",
            display: "flex", alignItems: "center", gap: 12,
          }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              🔗 duomath.app
            </div>
            <button
              onClick={handleCopyLink}
              style={{
                background: copied ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.07)",
                border: `1px solid ${copied ? "rgba(52,211,153,0.4)" : "rgba(255,255,255,0.12)"}`,
                borderRadius: 8, padding: "6px 14px",
                fontSize: 12, fontWeight: 700,
                color: copied ? "#34d399" : "rgba(255,255,255,0.6)",
                cursor: "pointer", transition: "all 0.25s",
                minHeight: 32, whiteSpace: "nowrap",
              }}
            >
              {copied ? "✅ Đã sao chép" : "📋 Sao chép"}
            </button>
          </div>
        </div>
      </div>

      {/* Benefits grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
        gap: 16,
        padding: "28px",
        borderRadius: 16,
        background: "rgba(15,23,42,0.4)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
      }}>
        {benefits.map(({ icon, title, desc }) => (
          <div key={title} style={{
            display: "flex", alignItems: "flex-start", gap: 12,
            padding: "12px 14px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 12,
            transition: "all 0.2s",
          }}>
            <div style={{
              width: 36, height: 36, flexShrink: 0,
              borderRadius: 10,
              background: "linear-gradient(135deg,rgba(56,189,248,0.15),rgba(99,102,241,0.15))",
              border: "1px solid rgba(56,189,248,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>{icon}</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: "white", marginBottom: 3 }}>{title}</div>
              <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", lineHeight: 1.4 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Embedded CSS animations */}
      <style>{`
        @keyframes phoneFloat {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-14px) rotate(1deg); }
        }
      `}</style>
    </div>
  );
}
