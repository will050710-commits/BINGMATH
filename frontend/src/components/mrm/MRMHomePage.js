/* eslint-disable @next/next/no-img-element */
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
    { size: 160, left: "5%",  top: "12%", delay: "0s",   dur: "20s", color: "#06b6d4" },
    { size: 100, left: "82%", top: "8%",  delay: "4s",   dur: "25s", color: "#818cf8" },
    { size: 80,  left: "60%", top: "65%", delay: "2s",   dur: "17s", color: "#38bdf8" },
    { size: 120, left: "15%", top: "72%", delay: "7s",   dur: "22s", color: "#a78bfa" },
    { size: 60,  left: "90%", top: "50%", delay: "1s",   dur: "14s", color: "#67e8f9" },
    { size: 90,  left: "45%", top: "20%", delay: "9s",   dur: "28s", color: "#c4b5fd" },
  ];

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {shapes.map((s, i) => (
        <svg key={i} viewBox="0 0 100 100" style={{
          position: "absolute", left: s.left, top: s.top,
          width: s.size, height: s.size, opacity: 0.12,
          filter: `drop-shadow(0 0 16px ${s.color}88)`,
          animation: `floatShape ${s.dur} ${s.delay} ease-in-out infinite alternate`,
        }}>
          {i % 3 === 0
            ? <polygon points="50,5 95,90 5,90" stroke={s.color} strokeWidth="2" fill={s.color + "20"} />
            : i % 3 === 1
              ? <rect x="15" y="15" width="70" height="70" stroke={s.color} strokeWidth="2" fill={s.color + "20"} />
              : <polygon points="50,5 95,50 50,95 5,50" stroke={s.color} strokeWidth="2" fill={s.color + "20"} />
          }
        </svg>
      ))}
    </div>
  );
}

// ── SVG Owl Mascot ─────────────────────────────────────────────────────────
function OwlSVG({ isActive }) {
  return (
    <svg viewBox="0 0 200 220" width="200" height="220" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="60%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0e7490" />
        </radialGradient>
        <radialGradient id="bellyGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#bae6fd" />
        </radialGradient>
        <radialGradient id="eyeGrad" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e0f2fe" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Body */}
      <ellipse cx="100" cy="130" rx="65" ry="75" fill="url(#bodyGrad)" />

      {/* Wings */}
      <ellipse cx="42" cy="145" rx="28" ry="48" fill="#0891b2" transform="rotate(-15, 42, 145)" />
      <ellipse cx="158" cy="145" rx="28" ry="48" fill="#0891b2" transform="rotate(15, 158, 145)" />

      {/* Wing feather lines */}
      {[0, 10, 20].map(off => (
        <line key={off} x1={30 + off} y1={120 + off * 1.5} x2={20 + off} y2={175 + off} stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" />
      ))}
      {[0, 10, 20].map(off => (
        <line key={off + 10} x1={170 - off} y1={120 + off * 1.5} x2={180 - off} y2={175 + off} stroke="#06b6d4" strokeWidth="1.5" opacity="0.5" />
      ))}

      {/* Belly */}
      <ellipse cx="100" cy="145" rx="38" ry="50" fill="url(#bellyGrad)" />

      {/* Belly feather pattern */}
      {[130, 145, 160, 175].map((y, i) => (
        <ellipse key={y} cx="100" cy={y} rx={32 - i * 3} ry="7" fill="none" stroke="#93c5fd" strokeWidth="1" opacity="0.4" />
      ))}

      {/* Head */}
      <ellipse cx="100" cy="75" rx="52" ry="52" fill="url(#bodyGrad)" />

      {/* Ear tufts */}
      <polygon points="62,30 52,8 75,28" fill="#0891b2" />
      <polygon points="138,30 148,8 125,28" fill="#0891b2" />
      <line x1="62" y1="30" x2="52" y2="8" stroke="#22d3ee" strokeWidth="1" />
      <line x1="138" y1="30" x2="148" y2="8" stroke="#22d3ee" strokeWidth="1" />

      {/* Eye rings */}
      <circle cx="78" cy="76" r="22" fill="white" opacity="0.95" filter="url(#glow)" />
      <circle cx="122" cy="76" r="22" fill="white" opacity="0.95" filter="url(#glow)" />
      <circle cx="78" cy="76" r="18" fill="url(#eyeGrad)" />
      <circle cx="122" cy="76" r="18" fill="url(#eyeGrad)" />

      {/* Pupils — with blink */}
      <g style={{ animation: "owlBlink 4s 2s ease-in-out infinite", transformOrigin: "78px 76px" }}>
        <circle cx="78" cy="76" r="10" fill="#0c4a6e" />
        <circle cx="122" cy="76" r="10" fill="#0c4a6e" />
        <circle cx="74" cy="72" r="3.5" fill="white" opacity="0.9" />
        <circle cx="118" cy="72" r="3.5" fill="white" opacity="0.9" />
      </g>

      {/* Iris shine */}
      <circle cx="84" cy="70" r="4" fill="#22d3ee" opacity="0.4" />
      <circle cx="128" cy="70" r="4" fill="#22d3ee" opacity="0.4" />

      {/* Beak */}
      <polygon points="100,88 90,100 110,100" fill="#fbbf24" />
      <line x1="90" y1="94" x2="110" y2="94" stroke="#f59e0b" strokeWidth="1.5" />

      {/* Feet */}
      <g fill="#fbbf24">
        <rect x="82" y="198" width="8" height="14" rx="3" transform="rotate(-10,82,198)" />
        <rect x="90" y="200" width="8" height="14" rx="3" />
        <rect x="98" y="198" width="8" height="14" rx="3" transform="rotate(10,98,198)" />
        <rect x="110" y="198" width="8" height="14" rx="3" transform="rotate(-10,110,198)" />
        <rect x="118" y="200" width="8" height="14" rx="3" />
        <rect x="126" y="198" width="8" height="14" rx="3" transform="rotate(10,126,198)" />
      </g>

      {/* Graduation cap when active */}
      {isActive && (
        <g>
          <rect x="68" y="38" width="64" height="8" rx="2" fill="#1e1b4b" />
          <polygon points="100,20 140,38 100,44 60,38" fill="#312e81" />
          <line x1="140" y1="38" x2="148" y2="55" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="148" cy="58" r="4" fill="#fbbf24" />
        </g>
      )}

      {/* Math formula floating above when active */}
      {isActive && (
        <text x="100" y="14" textAnchor="middle" fill="#22d3ee" fontSize="11" fontFamily="monospace" fontWeight="bold" opacity="0.9">
          E = mc²
        </text>
      )}
    </svg>
  );
}

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
        {hovered ? (href ? "→ Vào ngay!" : "→ Báo cáo!") : "Chọn →"}
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
      icon: "🚩",
      label: "Báo cáo",
      labelEn: "Report Player",
      desc: "Báo cáo hành vi vi phạm hoặc gian lận trong đấu hạng",
      onClick: () => setShowReportModal(true),
      color: "#ef4444",
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
          <Link href="/mrm/singleplayer" style={{
            color: "rgba(255,255,255,0.7)", textDecoration: "none",
            fontSize: 14, fontWeight: 500, padding: "8px 14px", borderRadius: 8,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(34,211,238,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "transparent"; }}
          >
            🎯 Singleplayer
          </Link>
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
            <OwlSVG isActive={owlActive} />
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
