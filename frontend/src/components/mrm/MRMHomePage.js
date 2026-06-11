/* eslint-disable react-hooks/set-state-in-effect */
 
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import ReportUserModal from "@/components/ReportUserModal";

// ── Math particles background ──────────────────────────────────────────────
const MATH_SYMBOLS = ["∑", "∫", "π", "√", "∞", "Δ", "∂", "∇", "⊕", "≈", "≠", "±", "×", "÷", "α", "β", "θ", "λ", "μ", "σ"];

function MathParticles() {
  const [particles, setParticles] = useState([]);
  useEffect(() => {
    const generated = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      symbol: MATH_SYMBOLS[Math.floor(Math.random() * MATH_SYMBOLS.length)],
      left: `${Math.random() * 100}%`,
      animDuration: `${8 + Math.random() * 14}s`,
      animDelay: `${Math.random() * 10}s`,
      fontSize: `${14 + Math.random() * 22}px`,
      opacity: 0.08 + Math.random() * 0.18,
    }));
    setParticles(generated);
  }, []);

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "absolute",
          left: p.left,
          bottom: "-10%",
          fontSize: p.fontSize,
          color: "#22d3ee",
          opacity: p.opacity,
          animation: `particleFloat ${p.animDuration} ${p.animDelay} linear infinite`,
          userSelect: "none",
          fontFamily: "monospace",
          fontWeight: 700,
        }}>
          {p.symbol}
        </div>
      ))}
    </div>
  );
}

// ── Geometric background shapes ────────────────────────────────────────────
function BackgroundShapes() {
  const shapes = [
    { size: 180, left: "3%",  top: "8%",  delay: "0s",   dur: "22s", color: "#06b6d4", type: 0 },
    { size: 110, left: "80%", top: "6%",  delay: "3s",   dur: "26s", color: "#818cf8", type: 1 },
    { size: 90,  left: "58%", top: "62%", delay: "1.5s", dur: "18s", color: "#38bdf8", type: 2 },
    { size: 130, left: "12%", top: "70%", delay: "7s",   dur: "24s", color: "#a78bfa", type: 3 },
    { size: 70,  left: "88%", top: "48%", delay: "0.5s", dur: "15s", color: "#67e8f9", type: 4 },
    { size: 100, left: "42%", top: "18%", delay: "9s",   dur: "30s", color: "#c4b5fd", type: 0 },
    { size: 60,  left: "72%", top: "82%", delay: "4s",   dur: "20s", color: "#22d3ee", type: 1 },
    { size: 140, left: "28%", top: "45%", delay: "6s",   dur: "27s", color: "#7c3aed", type: 2 },
    { size: 50,  left: "50%", top: "88%", delay: "2s",   dur: "16s", color: "#0891b2", type: 3 },
    { size: 85,  left: "92%", top: "25%", delay: "11s",  dur: "21s", color: "#8b5cf6", type: 4 },
    { size: 75,  left: "20%", top: "30%", delay: "5s",   dur: "19s", color: "#4f46e5", type: 0 },
    { size: 55,  left: "65%", top: "35%", delay: "8s",   dur: "23s", color: "#0e7490", type: 1 },
  ];

  const renderShape = (s, i) => {
    const sharedProps = { stroke: s.color, strokeWidth: "1.5", fill: s.color + "18" };
    switch (s.type % 5) {
      case 0: return <polygon points="50,4 96,75 4,75" {...sharedProps} />;
      case 1: return <rect x="12" y="12" width="76" height="76" rx="6" {...sharedProps} />;
      case 2: return <polygon points="50,4 96,50 50,96 4,50" {...sharedProps} />;
      case 3: return <circle cx="50" cy="50" r="42" {...sharedProps} />;
      case 4: return <polygon points="50,4 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" {...sharedProps} />;
      default: return null;
    }
  };

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* Deep background gradient pulse */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 20% 40%, rgba(6,182,212,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 70% at 80% 70%, rgba(124,58,237,0.07) 0%, transparent 60%)",
      }} />
      {shapes.map((s, i) => (
        <svg key={i} viewBox="0 0 100 100" style={{
          position: "absolute", left: s.left, top: s.top,
          width: s.size, height: s.size,
          opacity: 0.1 + (i % 3) * 0.04,
          filter: `drop-shadow(0 0 20px ${s.color}99) drop-shadow(0 0 6px ${s.color}55)`,
          animation: `floatShape ${s.dur} ${s.delay} ease-in-out infinite alternate`,
        }}>
          {renderShape(s, i)}
        </svg>
      ))}
    </div>
  );
}

// ── Owl Mascot (homepage png image wrapper) ───────────────────────────────

// ── Mode Card Button ────────────────────────────────────────────────────────
function ModeCard({ icon, label, labelEn, desc, descEn, href, color, delay, index, onClick }) {
  const [hovered, setHovered] = useState(false);

  const cardContent = (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        animation: `btnExpand 0.5s ${delay} cubic-bezier(0.2,0.8,0.2,1) both`,
        width: 220,
        background: hovered
          ? `linear-gradient(135deg, ${color}33, ${color}22)`
          : "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(16px)",
        border: `2px solid ${hovered ? color : color + "55"}`,
        borderRadius: 20,
        padding: "28px 24px",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.2,0.8,0.2,1)",
        transform: hovered ? "translateY(-8px) scale(1.04)" : "translateY(0) scale(1)",
        boxShadow: hovered
          ? `0 24px 48px ${color}44, 0 0 32px ${color}22`
          : `0 8px 24px rgba(0,0,0,0.4)`,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Shine overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${color}18 0%, transparent 60%)`,
        borderRadius: 18,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.3s",
      }} />

      <div style={{ fontSize: 52, marginBottom: 12, display: "block", lineHeight: 1 }}>
        {icon}
      </div>
      <div style={{
        fontSize: 20, fontWeight: 800, color: "white",
        marginBottom: 4, letterSpacing: 0.5,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 12, color: color, fontWeight: 600,
        marginBottom: 10, opacity: 0.9,
      }}>
        {labelEn}
      </div>
      <div style={{
        fontSize: 12, color: "rgba(255,255,255,0.6)",
        lineHeight: 1.5,
      }}>
        {desc}
      </div>
      <div style={{
        marginTop: 16,
        background: hovered ? color : color + "33",
        color: hovered ? "white" : color,
        borderRadius: 10,
        padding: "8px 16px",
        fontSize: 13, fontWeight: 700,
        transition: "all 0.3s",
      }}>
        {hovered ? "→ Vào ngay!" : "Chọn →"}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} style={{ textDecoration: "none" }}>{cardContent}</Link>;
  }
  return cardContent;
}

// ── Main MRM Home Component ────────────────────────────────────────────────
export default function MRMHomePage() {
  const [owlActive, setOwlActive] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleOwlClick = () => {
    setOwlActive(true);
    setShowButtons(true);
    setHasInteracted(true);
  };

  const handleOwlHover = () => {
    if (!hasInteracted) {
      setOwlActive(true);
      setShowButtons(true);
    }
  };

  const modes = [
    {
      icon: "🎯",
      label: "Singleplayer",
      labelEn: "Solo Practice",
      desc: "Luyện tập một mình với MathMap đa dạng — Theo dõi tiến độ cá nhân",
      href: "/mrm/singleplayer",
      color: "#22d3ee",
      delay: "0.05s",
    },
    {
      icon: "⚔️",
      label: "Multiplayer",
      labelEn: "Ranked Match",
      desc: "Đấu Rank 1v1 theo hệ thống Elo — Cơ chế Tráo bài chiến thuật",
      href: "/mrm/multiplayer",
      color: "#a78bfa",
      delay: "0.15s",
    },
  ];

  const stats = [
    { value: "10,000+", label: "MathMaps", icon: "📚" },
    { value: "50,000+", label: "Học sinh", icon: "👥" },
    { value: "1M+", label: "Lượt chơi", icon: "🎮" },
    { value: "3 Khối", label: "10 · 11 · 12", icon: "📖" },
  ];

  return (
    <div style={{
      width: "100%", minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a0a1a 40%, #0c1a2e 100%)",
      position: "relative", overflow: "hidden",
      display: "flex", flexDirection: "column",
    }}>
      <BackgroundShapes />
      <MathParticles />

      {/* Scan line effect */}
      <div aria-hidden="true" style={{
        position: "fixed", left: 0, right: 0, height: "2px",
        background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.15), transparent)",
        zIndex: 1, animation: "scanline 8s linear infinite",
        pointerEvents: "none",
      }} />

      {/* ─── HEADER ─── */}
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "18px 40px", position: "relative", zIndex: 100,
        background: "rgba(2,6,23,0.7)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(34,211,238,0.15)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.3)",
      }}>
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: "white", letterSpacing: 2 }}>
            DUO<span style={{ color: "#22d3ee" }}>MATH</span>
          </span>
          <span style={{
            fontSize: 11, fontWeight: 700, color: "#22d3ee",
            background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)",
            borderRadius: 6, padding: "2px 8px", letterSpacing: 1,
          }}>MRM</span>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            onClick={() => setShowReportModal(true)}
            style={{
              color: "rgba(255,255,255,0.7)", background: "transparent",
              border: "none", textDecoration: "none",
              fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8,
              transition: "all 0.2s", cursor: "pointer",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; }}
          >
            🚩 Báo cáo
          </button>
          <Link href="/mrm/creator" style={{
            color: "rgba(255,255,255,0.7)", textDecoration: "none",
            fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(167,139,250,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; }}
          >
            🛠️ Creator Tool
          </Link>
          <Link href="/bmf" style={{
            color: "rgba(255,255,255,0.7)", textDecoration: "none",
            fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(251,191,36,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; }}
          >
            💬 BMF Forum
          </Link>
          <Link href="/" style={{
            padding: "8px 18px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255,255,255,0.15)", textDecoration: "none",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
          >
            ← Trang chủ
          </Link>
        </nav>
      </header>

      {/* ─── MAIN CONTENT ─── */}
      <main style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "40px 20px", position: "relative", zIndex: 10,
      }}>
        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, letterSpacing: 4,
            color: "#22d3ee", marginBottom: 12,
            textTransform: "uppercase",
          }}>
            Math Ranking Matches
          </div>
          <h1 style={{
            fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900,
            color: "white", lineHeight: 1.1, marginBottom: 12,
          }}>
            Prove Your <span style={{
              background: "linear-gradient(90deg, #22d3ee, #a78bfa)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>Math Mastery</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 16, maxWidth: 480, margin: "0 auto" }}>
            Hệ thống đấu Rank Toán học — Cơ chế Tráo bài chiến thuật · Elo Rating · Bilingual
          </p>
        </div>

        {/* ─── OWL HERO ─── */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          margin: "24px 0", position: "relative",
        }}>
          {/* Owl glow ring */}
          <div style={{
            position: "absolute",
            width: 280, height: 280, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,0.08) 0%, transparent 70%)",
            animation: "owlGlow 3s ease-in-out infinite",
            pointerEvents: "none",
          }} />

          {/* Hint text */}
          {!showButtons && (
            <div style={{
              position: "absolute", top: -36, left: "50%",
              transform: "translateX(-50%)",
              fontSize: 12, color: "rgba(255,255,255,0.45)",
              animation: "heartPulse 2s ease-in-out infinite",
              whiteSpace: "nowrap",
            }}>
              👆 Hover hoặc click vào Cú để bắt đầu
            </div>
          )}

          {/* Owl */}
          <div
            onClick={handleOwlClick}
            onMouseEnter={handleOwlHover}
            style={{
              cursor: "pointer",
              animation: "owlFloat 3.5s ease-in-out infinite",
              filter: owlActive
                ? "drop-shadow(0 0 32px rgba(34,211,238,0.8)) drop-shadow(0 0 64px rgba(99,102,241,0.4))"
                : "drop-shadow(0 0 16px rgba(34,211,238,0.4))",
              transition: "filter 0.4s ease",
              transform: owlActive ? "scale(1.05)" : "scale(1)",
              transformOrigin: "center bottom",
              position: "relative", zIndex: 2,
            }}
          >
            {owlActive && (
              <div style={{
                position: "absolute",
                top: -24,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(15,23,42,0.85)",
                color: "#22d3ee",
                padding: "6px 12px",
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 800,
                whiteSpace: "nowrap",
                border: "1px solid rgba(34,211,238,0.4)",
                boxShadow: "0 0 15px rgba(34,211,238,0.3)",
                backdropFilter: "blur(4px)",
                animation: "heartPulse 1.5s infinite"
              }}>
                E = mc² 🎓
              </div>
            )}
            <img
              src="/images/duosteamicon-removebg-preview.png"
              alt="DuoMath Mascot"
              style={{
                width: 200,
                height: 220,
                objectFit: "contain",
                filter: "drop-shadow(0 8px 25px rgba(34,211,238,0.3))"
              }}
            />
          </div>

          {/* Mode buttons — expand from owl */}
          {showButtons && (
            <div style={{
              display: "flex", gap: 24, marginTop: 28,
              flexWrap: "wrap", justifyContent: "center",
            }}>
              {modes.map((mode, i) => (
                <ModeCard key={mode.href} {...mode} index={i} />
              ))}
            </div>
          )}

          {/* Creator & Forum quick links below buttons */}
          {showButtons && (
            <div style={{
              display: "flex", gap: 16, marginTop: 20,
              animation: "btnExpand 0.5s 0.3s both",
            }}>
              <Link href="/mrm/creator" style={{ textDecoration: "none" }}>
                <button style={{
                  background: "rgba(167,139,250,0.12)",
                  border: "1px solid rgba(167,139,250,0.35)",
                  color: "#c4b5fd", borderRadius: 10, padding: "10px 20px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                  🛠️ Tạo MathMap
                </button>
              </Link>
              <Link href="/bmf" style={{ textDecoration: "none" }}>
                <button style={{
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.3)",
                  color: "#fde68a", borderRadius: 10, padding: "10px 20px",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  transition: "all 0.2s",
                }}>
                  💬 BMF Forum
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* ─── STATS BAR ─── */}
        <div style={{
          display: "flex", gap: 0,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(34,211,238,0.12)",
          borderRadius: 16, overflow: "hidden",
          marginTop: 40,
        }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{
              padding: "20px 36px", textAlign: "center",
              borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#22d3ee", lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4, fontWeight: 600 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ─── FEATURE HIGHLIGHTS ─── */}
        <div style={{
          display: "flex", gap: 16, marginTop: 32,
          flexWrap: "wrap", justifyContent: "center", maxWidth: 860,
        }}>
          {[
            { icon: "🃏", title: "Swap Card System", desc: "Tráo bài chiến thuật để phá vỡ chiến lược đối thủ" },
            { icon: "❤️", title: "HP System", desc: "5 tim · Cơ chế Last Chance khi còn nửa tim" },
            { icon: "📊", title: "Elo Rating", desc: "K-factor nhân đôi trong 20 trận đầu (Placement)" },
            { icon: "🎵", title: "BGM & Replay", desc: "Nhạc nền kịch tính · Chống gian lận bằng Replay" },
          ].map(f => (
            <div key={f.title} style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: "16px 20px",
              flex: "1 1 180px", maxWidth: 200,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(34,211,238,0.06)";
                e.currentTarget.style.borderColor = "rgba(34,211,238,0.2)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "white", marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </main>

      {showReportModal && (
        <ReportUserModal onClose={() => setShowReportModal(false)} />
      )}
    </div>
  );
}
