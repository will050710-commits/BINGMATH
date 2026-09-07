import { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import CosmosBackground from "./CosmosBackground";
import { motion, AnimatePresence } from "framer-motion";
import { clearTestSession } from "@/utils/testTimer";
import { useAuth } from "@/context/authContext";
import { useMathMapStore } from "@/context/MathMapStore";
import MasteryRings from "./MasteryRings";
import KnowledgeAlbum from "../stats/KnowledgeAlbum";
import katex from "katex";
import "katex/dist/katex.min.css";
import { renderDuoIcon } from "@/components/DuoIcons";
import AppDownloadSection from "./AppDownloadSection";
import ScrollReveal from "../ScrollReveal";
import TypewriterText from "../TypewriterText";
import { useLanguage } from "@/context/LanguageContext";


// Dynamically import EditProfileModal to reduce initial JS bundle size
const EditProfileModal = dynamic(() => import("./EditProfileModal"), {
  ssr: false,
});

// ─── SPLIT-TEXT FADE-IN TITLE ─────────────────────────────────────────────────
function FadeInTitle({ text, gradient = "linear-gradient(135deg, #ffffff 60%, #93c5fd 100%)" }) {
  const words = text.split(" ");
  const container = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.09 } },
  };
  const child = {
    hidden: { opacity: 0, y: 22, scale: 0.96 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
  };
  return (
    <motion.h1
      variants={container}
      initial="hidden"
      animate="visible"
      style={{
        fontSize: "clamp(26px, 7vw, 44px)",
        fontWeight: 900,
        marginBottom: 12,
        lineHeight: 1.1,
        background: gradient,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        display: "flex",
        flexWrap: "wrap",
        gap: "0 8px"
      }}
    >
      {words.map((word, idx) => (
        <motion.span key={idx} variants={child} style={{ display: "inline-block" }}>
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}

// ─── PREMIUM SECTION HEADING ──────────────────────────────────────────────────────────────
function SectionHeading({ title, subtitle, badge, align = "center" }) {
  return (
    <div style={{
      textAlign: align,
      marginBottom: 44,
      display: "flex",
      flexDirection: "column",
      alignItems: align === "center" ? "center" : "flex-start",
      /* Dark glass panel — blocks planet bleeding through */
      background: "linear-gradient(135deg, rgba(2,8,24,0.82) 0%, rgba(4,12,36,0.78) 100%)",
      backdropFilter: "blur(22px)",
      WebkitBackdropFilter: "blur(22px)",
      border: "1px solid rgba(255,255,255,0.055)",
      borderRadius: 18,
      padding: align === "center"
        ? "clamp(16px, 4vw, 32px) clamp(16px, 6vw, 56px) clamp(20px, 5vw, 40px)"
        : "clamp(16px, 4vw, 28px) clamp(16px, 5vw, 36px) clamp(16px, 5vw, 36px)",
      boxShadow: "0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
      width: "100%",
      boxSizing: "border-box",
    }}>
      {/* Badge pill */}
      {badge && (
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(56,189,248,0.18) 100%)",
          border: "1px solid rgba(99,102,241,0.35)",
          borderRadius: 100,
          padding: "5px 16px",
          fontSize: 11,
          fontWeight: 800,
          color: "#a5b4fc",
          letterSpacing: 1.2,
          textTransform: "uppercase",
          marginBottom: 14,
          boxShadow: "0 0 18px rgba(99,102,241,0.15)",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#818cf8", display: "inline-block", boxShadow: "0 0 6px #818cf8" }} />
          {badge}
        </div>
      )}

      {/* Main title with gradient underline bar */}
      <div style={{ position: "relative", display: "inline-block", maxWidth: "100%" }}>
        <h2 style={{
          fontSize: "clamp(22px, 5vw, 34px)",
          fontWeight: 900,
          margin: 0,
          lineHeight: 1.15,
          background: "linear-gradient(135deg, #ffffff 30%, #a5b4fc 70%, #38bdf8 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: 0.3,
        }}>
          {title}
        </h2>
        {/* Glowing underline */}
        <div style={{
          position: "absolute",
          bottom: -8,
          left: align === "center" ? "50%" : 0,
          transform: align === "center" ? "translateX(-50%)" : "none",
          width: align === "center" ? "60%" : "80px",
          height: 3,
          borderRadius: 2,
          background: "linear-gradient(90deg, transparent, #6366f1, #38bdf8, transparent)",
          boxShadow: "0 0 12px rgba(99,102,241,0.6), 0 0 24px rgba(56,189,248,0.3)",
        }} />
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p style={{
          marginTop: 22,
          color: "rgba(255,255,255,0.48)",
          fontSize: "clamp(13px, 3.5vw, 15.5px)",
          maxWidth: 560,
          lineHeight: 1.6,
          margin: "22px auto 0",
        }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function getInitials(name) {
  const parts = (name || "U").trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0] || "U").slice(0, 2).toUpperCase();
}

function UserAvatar({ user, size = 34, style = {} }) {
  const initials = getInitials(user?.username || user?.email?.split("@")[0] || "U");
  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.username || "Avatar"}
        style={{
          width: size, height: size, borderRadius: "50%", objectFit: "cover",
          border: "2px solid rgba(56,189,248,0.4)",
          boxShadow: "0 0 10px rgba(56,189,248,0.2)",
          ...style,
        }}
      />
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "linear-gradient(135deg,#0ea5e9,#6366f1)",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontWeight: 800, fontSize: size <= 36 ? 12 : 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      letterSpacing: -0.5,
      ...style,
    }}>
      {initials}
    </div>
  );
}

const SYMBOL_COUNT = typeof window !== "undefined" && window.innerWidth < 768 ? 6 : 10;
const STATIC_MATH_SYMBOLS = Array.from({ length: SYMBOL_COUNT }).map((_, i) => {
  const symbols = ["π", "Σ", "θ", "∞", "∫", "Δ", "√", "f(x)", "dy/dx", "log"];
  return {
    id: i,
    char: symbols[i % symbols.length],
    size: 14 + (i * 7) % 16, // 14px to 30px (was 34px — smaller = less paint)
    left: `${8 + (i * 30) % 84}%`,
    delay: `${(i * 4) % 20}s`,
    dur: `${18 + (i * 5) % 15}s`,
  };
});

// ─── FEATURE SWIPE CAROUSEL ──────────────────────────────────────────────────
function FeatureSwipeCarousel({ features, router }) {
  const { t } = useLanguage();
  const trackRef   = useRef(null);
  const [active, setActive]   = useState(0);
  const [offset, setOffset]   = useState(0);    // px drag offset
  const [dragging, setDragging] = useState(false);
  const dragStart  = useRef(null);
  const dragOffset = useRef(0);
  const CARD_W     = useRef(380);
  const GAP        = 20;

  // Update card width on resize
  useEffect(() => {
    const updateW = () => {
      const vw = window.innerWidth;
      CARD_W.current = Math.min(380, vw * 0.82);
    };
    updateW();
    window.addEventListener("resize", updateW);
    return () => window.removeEventListener("resize", updateW);
  }, []);

  const goTo = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(features.length - 1, idx));
    setActive(clamped);
    setOffset(0);
    dragOffset.current = 0;
  }, [features.length]);

  // ── Mouse drag ──────────────────────────────────────────────────
  const onMouseDown = (e) => {
    setDragging(true);
    dragStart.current = e.clientX;
  };
  const onMouseMove = useCallback((e) => {
    if (!dragging || dragStart.current === null) return;
    const d = e.clientX - dragStart.current;
    dragOffset.current = d;
    setOffset(d);
  }, [dragging]);
  const onMouseUp = useCallback(() => {
    if (!dragging) return;
    setDragging(false);
    const threshold = CARD_W.current * 0.3;
    if (dragOffset.current < -threshold) goTo(active + 1);
    else if (dragOffset.current > threshold) goTo(active - 1);
    else goTo(active);
    dragStart.current = null;
  }, [dragging, active, goTo]);

  // ── Touch ────────────────────────────────────────────────────────
  const onTouchStart = (e) => {
    dragStart.current = e.touches[0].clientX;
  };
  const onTouchMove = (e) => {
    if (dragStart.current === null) return;
    const d = e.touches[0].clientX - dragStart.current;
    dragOffset.current = d;
    setOffset(d);
  };
  const onTouchEnd = () => {
    const threshold = CARD_W.current * 0.3;
    if (dragOffset.current < -threshold) goTo(active + 1);
    else if (dragOffset.current > threshold) goTo(active - 1);
    else goTo(active);
    dragStart.current = null;
  };

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup",   onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup",   onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const slideX = (i) => {
    const cw = CARD_W.current + GAP;
    return (i - active) * cw + offset;
  };

  return (
    <div className="reveal" data-reveal style={{ marginTop: 80, marginBottom: 60 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 44 }}>
        <SectionHeading
          badge={t("Hệ sinh thái học tập", "Learning Ecosystem")}
          title={t("Các Tính Năng Cốt Lõi", "Core Features")}
          subtitle={t("Khám phá hệ sinh thái học tập toàn diện — kéo để xem thêm", "Discover the comprehensive learning ecosystem — drag to see more")}
        />
      </div>

      {/* Carousel viewport */}
      <div style={{ position: "relative", overflow: "hidden", width: "100%", cursor: dragging ? "grabbing" : "grab" }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div ref={trackRef} style={{ display: "flex", justifyContent: "center", height: 420, position: "relative" }}>
          {features.map((f, i) => {
            const tx = slideX(i);
            const dist = Math.abs(i - active);
            const isActive = i === active;
            const scale = isActive ? 1 : Math.max(0.88, 1 - dist * 0.06);
            const opacity = isActive ? 1 : Math.max(0.4, 1 - dist * 0.35);
            return (
              <div
                key={i}
                onClick={() => { if (!dragging && Math.abs(offset) < 8) router.push(f.link); }}
                style={{
                  position:  "absolute",
                  left: "50%",
                  top: 0,
                  width: CARD_W.current,
                  height: 400,
                  transform: `translateX(calc(-50% + ${tx}px)) scale(${scale})`,
                  opacity,
                  transition: dragging ? "none" : "transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.3s ease",
                  background: "rgba(8, 18, 42, 0.75)",
                  border: isActive ? "1px solid rgba(0,210,255,0.35)" : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 20,
                  padding: 28,
                  backdropFilter: "blur(16px)",
                  boxShadow: isActive
                    ? "0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0,180,255,0.1), inset 0 1px 0 rgba(255,255,255,0.08)"
                    : "0 8px 24px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  userSelect: "none",
                  zIndex: isActive ? 2 : 1,
                }}
              >
                {/* Card glow overlay */}
                <div style={{
                  position: "absolute", inset: 0, borderRadius: 20, pointerEvents: "none",
                  background: `radial-gradient(circle at 15% 15%, ${f.glowColor} 0%, transparent 65%)`,
                  opacity: isActive ? 0.3 : 0,
                  transition: "opacity 0.4s",
                }} />

                <div>
                  {/* Top row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                    <div style={{
                      fontSize: 28, width: 54, height: 54, borderRadius: 14,
                      background: f.color, display: "flex", alignItems: "center", justifyContent: "center",
                      border: "1px solid rgba(255,255,255,0.07)",
                      boxShadow: isActive ? `0 0 20px ${f.glowColor}` : "none",
                    }}>
                      {renderDuoIcon(f.icon, { size: 28 })}
                    </div>
                    <span style={{
                      fontSize: 9.5, fontWeight: 800, color: "#38bdf8",
                      background: "rgba(0,200,255,0.1)", border: "1px solid rgba(0,200,255,0.25)",
                      borderRadius: 20, padding: "4px 11px", letterSpacing: 0.8, textTransform: "uppercase",
                    }}>
                      {f.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 21, fontWeight: 800, color: "white", marginBottom: 4, lineHeight: 1.2 }}>
                    {f.title}
                  </h3>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#38bdf8", marginBottom: 12, letterSpacing: 0.3 }}>
                    {f.titleVi}
                  </div>
                  <p style={{ fontSize: 13.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.65 }}>
                    {f.desc}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#38bdf8" }}>
                    {f.cta} →
                  </span>
                  {/* Card number indicator */}
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontVariantNumeric: "tabular-nums" }}>
                    {String(i + 1).padStart(2,"0")} / {String(features.length).padStart(2,"0")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
        {features.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === active ? 28 : 8,
              height: 8,
              borderRadius: 4,
              border: "none",
              cursor: "pointer",
              background: i === active ? "#00d4ff" : "rgba(255,255,255,0.2)",
              transition: "all 0.35s cubic-bezier(0.25,0.46,0.45,0.94)",
              boxShadow: i === active ? "0 0 12px rgba(0,212,255,0.6)" : "none",
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Arrow nav buttons */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
        {[
          { label: "‹", dir: -1 },
          { label: "›", dir: +1 },
        ].map(({ label, dir }) => (
          <button
            key={label}
            onClick={() => goTo(active + dir)}
            disabled={dir === -1 ? active === 0 : active === features.length - 1}
            style={{
              width: 42, height: 42, borderRadius: "50%",
              background: "rgba(0,200,255,0.08)", border: "1px solid rgba(0,200,255,0.25)",
              color: "rgba(255,255,255,0.7)", fontSize: 22, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
              opacity: (dir === -1 ? active === 0 : active === features.length - 1) ? 0.3 : 1,
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TrangChuForm() {

  const router = useRouter();
  const {
    user, ready,
    bestScores, recentActivity,
    totalTests, totalGames, avgTest, avgGame,
    competitiveStats,
    logout,
  } = useAuth();

  const { admins } = useMathMapStore();
  const { t } = useLanguage();

  const [showProfile, setShowProfile] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [mathSymbols] = useState(STATIC_MATH_SYMBOLS);

  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showGachaModal, setShowGachaModal] = useState(false);
  const [isOpeningChest, setIsOpeningChest] = useState(false);
  const [gachaRewardCard, setGachaRewardCard] = useState(null);

  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardFilter, setLeaderboardFilter] = useState("all"); // "all" | "school" | "grade"
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboardLoading(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      let url = `${API_BASE}/api/leaderboard`;
      const queryParams = [];
      if (leaderboardFilter === "school" && user?.school) {
        queryParams.push(`school=${encodeURIComponent(user.school)}`);
      } else if (leaderboardFilter === "grade" && user?.grade) {
        queryParams.push(`grade=${encodeURIComponent(user.grade)}`);
      }
      if (queryParams.length > 0) {
        url += `?${queryParams.join("&")}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaderboardData(data);
      }
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
    } finally {
      setLeaderboardLoading(false);
    }
  }, [leaderboardFilter, user]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleOpenGacha = async () => {
    if (!user) {
      alert(t("Vui lòng đăng nhập để mở rương tri thức!", "Please log in to open the knowledge chest!"));
      return;
    }
    const currentXp = competitiveStats?.xp || 0;
    if (currentXp < 50) {
      alert(t("Bạn cần tối thiểu 50 XP để mở rương tri thức!", "You need at least 50 XP to open the knowledge chest!"));
      return;
    }

    setIsOpeningChest(true);
    setShowGachaModal(true);
    setGachaRewardCard(null);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/gacha/open`, {
        method: "POST",
        headers,
        body: JSON.stringify({ cost: 50 })
      });

      // Shaking animation delay
      await new Promise(r => setTimeout(r, 1600));

      if (res.ok) {
        const data = await res.json();
        setGachaRewardCard(data.card);
        // Reload page data or notify user to update XP UI
        // We can reload after closing modal to sync the client state cleanly.
      } else {
        const err = await res.json();
        alert(err.detail || t("Có lỗi xảy ra khi mở rương.", "An error occurred while opening the chest."));
        setShowGachaModal(false);
      }
    } catch (err) {
      console.error(err);
      alert(t("Không thể kết nối đến máy chủ.", "Cannot connect to server."));
      setShowGachaModal(false);
    } finally {
      setIsOpeningChest(false);
    }
  };

  // Reveal animations on scroll
  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll("[data-reveal]");
    els.forEach((el) => {
      if (el.hasAttribute("data-reveal-stagger")) {
        const s = parseInt(el.getAttribute("data-stagger") || "80", 10);
        Array.from(el.children).forEach((c, i) => {
          c.style.opacity = "0"; c.style.transform = "translateY(24px) scale(0.97)";
          c.style.transition = `opacity .5s cubic-bezier(.2,.8,.2,1) ${i * s}ms,transform .45s cubic-bezier(.2,.8,.2,1) ${i * s}ms`;
          c.style.willChange = "opacity,transform";
        });
      }
    });

    const obs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const s = parseInt(el.getAttribute("data-stagger") || "80", 10);
        if (el.hasAttribute("data-reveal-stagger")) {
          Array.from(el.children).forEach((c, i) => setTimeout(() => { c.style.opacity = "1"; c.style.transform = "translateY(0) scale(1)"; }, i * s));
        }
        el.classList.add("visible");
        obs.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });

    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    if (!showProfile) return;
    const h = (e) => {
      if (!e.target.closest("[data-profile-root]")) setShowProfile(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showProfile]);

  function handleSignOut() { logout(); setShowProfile(false); router.push("/"); }

  const isUserAdmin = user && admins.map(e => e.toLowerCase()).includes(user.email.toLowerCase());

  const dropStyle = {
    position: "absolute", top: "calc(100% + 10px)", right: 0,
    width: 310, maxHeight: "82vh", overflowY: "auto",
    background: "rgba(15, 23, 42, 0.95)", borderRadius: 14,
    boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 20px rgba(99,102,241,0.15)", zIndex: 1000,
    border: "1px solid rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(16px)",
  };

  function ProfileDropdown() {
    if (!ready) return (
      <div style={dropStyle}>
        <div style={{ padding: 20, textAlign: "center", color: "#888", fontSize: 13 }}>{t("Đang tải…", "Loading...")}</div>
      </div>
    );

    if (!user) return (
      <div style={dropStyle}>
        <div style={{ padding: "20px 18px", textAlign: "center" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>👤</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#38bdf8", marginBottom: 4 }}>{t("Chưa đăng nhập", "Not logged in")}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 16 }}>{t("Đăng nhập để lưu tiến độ học tập", "Log in to save your learning progress")}</div>
          <Link href="/login" onClick={() => setShowProfile(false)}>
            <div style={{ background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "white", borderRadius: 8, padding: "10px 0", textAlign: "center", fontWeight: 600, fontSize: 13, marginBottom: 10, cursor: "pointer", boxShadow: "0 4px 12px rgba(99,102,241,0.2)" }}>
              {t("Đăng nhập", "Login")}
            </div>
          </Link>
          <Link href="/signup" onClick={() => setShowProfile(false)}>
            <div style={{ border: "1.5px solid rgba(255,255,255,0.3)", color: "white", borderRadius: 8, padding: "9px 0", textAlign: "center", fontWeight: 600, fontSize: 13, cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#38bdf8"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"}>
              {t("Tạo tài khoản miễn phí", "Create a free account")}
            </div>
          </Link>
        </div>
      </div>
    );

    return (
      <div style={dropStyle}>
        {/* Header */}
        <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 10 }}>
          <UserAvatar user={user} size={38} />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "white" }}>{user.username}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{user.email}</div>
          </div>
        </div>

        {/* Personal info */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{t("Thông tin cá nhân", "Personal Info")}</div>
          {[["📞", t("Điện thoại", "Phone"), user.phone || "—"], ["🏫", t("Trường", "School"), user.school || "—"], ["📚", t("Lớp", "Grade"), user.grade || "—"]].map(([ic, lb, val]) => (
            <div key={lb} style={{ display: "flex", gap: 7, fontSize: 12, color: "rgba(255,255,255,0.8)", marginBottom: 5, alignItems: "center" }}>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 14 }}>{renderDuoIcon(ic, { size: 14 })}</span>
              <span style={{ color: "rgba(255,255,255,0.4)", minWidth: 60 }}>{lb}:</span>
              <span style={{ fontWeight: 500 }}>{val}</span>
            </div>
          ))}
          <button
            onClick={() => {
              setShowEditModal(true);
              setShowProfile(false);
            }}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "7px 0",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              transition: "all 0.2s"
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          >
            <span style={{ display: "inline-flex", alignItems: "center" }}>{renderDuoIcon("✏️", { size: 12 })}</span> {t("Chỉnh sửa thông tin", "Edit Profile")}
          </button>
        </div>

        {/* Stats */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{t("Thống kê học tập", "Learning Stats")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {[["📝", t("Bài test", "Tests"), totalTests], ["🎮", t("Lượt game", "Games"), totalGames],
            ["📊", t("TB test", "Avg Test"), avgTest != null ? `${avgTest}%` : "—"], ["⭐", t("TB game", "Avg Game"), avgGame != null ? `${avgGame}%` : "—"]].map(([ic, lb, val]) => (
              <div key={lb} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "7px 9px" }}>
                <div style={{ fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", height: 16 }}>{renderDuoIcon(ic, { size: 16 })}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white", lineHeight: 1.2 }}>{val}</div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{lb}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitive Stats */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{t("🏆 Đấu Hạng & Cạnh Tranh", "🏆 Rank & Streaks")}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {[
              ["⭐", "XP", competitiveStats.xp || 0],
              ["🔥", t("Streak hiện tại", "Current Streak"), `${competitiveStats.current_streak || 0} ${t("ngày", "days")}`],
              ["🎯", t("Streak dài nhất", "Longest Streak"), `${competitiveStats.longest_streak || 0} ${t("ngày", "days")}`],
              ["🥇", t("Xếp hạng toàn cầu", "Global Rank"), `#${competitiveStats.global_rank || 0}`],
            ].map(([ic, lb, val]) => (
              <div key={lb} style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.1)", borderRadius: 8, padding: "7px 9px" }}>
                <div style={{ fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", height: 16 }}>{renderDuoIcon(ic, { size: 16 })}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#c084fc", lineHeight: 1.2 }}>{val}</div>
                <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{lb}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── My Clan Section in Profile Drawer ── */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#f472b6", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {t("🛡️ Math Clan của tôi", "🛡️ My Math Clan")}
            </div>
            <Link href="/clans" onClick={() => setShowProfile(false)} style={{ textDecoration: "none", fontSize: 10, color: "#22d3ee", fontWeight: 700 }}>
              {t("Xem tất cả →", "View all →")}
            </Link>
          </div>

          <div style={{
            background: "linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(99,102,241,0.1) 100%)",
            border: "1px solid rgba(244,114,182,0.25)",
            borderRadius: 10, padding: "10px 12px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, fontSize: 11, color: "white", flexShrink: 0,
              }}>
                TH
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  Thánh Toán Học
                </div>
                <div style={{ fontSize: 10, color: "#22d3ee", fontFamily: "monospace" }}>
                  #THTH · Trưởng Clan 👑
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 8 }}>
              <div style={{ background: "rgba(0,0,0,0.25)", padding: "5px 8px", borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>Cấp độ Clan</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#fbbf24" }}>Level 24</div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.25)", padding: "5px 8px", borderRadius: 6 }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)" }}>BXH Tháng</div>
                <div style={{ fontSize: 12, fontWeight: 800, color: "#34d399" }}>Top #1 🏆</div>
              </div>
            </div>

            <Link href="/mrm/profile/me" onClick={() => setShowProfile(false)} style={{ textDecoration: "none" }}>
              <button style={{
                width: "100%", padding: "7px 0",
                background: "linear-gradient(135deg, #f472b6, #8b5cf6)",
                border: "none", borderRadius: 6,
                color: "white", fontWeight: 800, fontSize: 11, cursor: "pointer",
                boxShadow: "0 2px 8px rgba(244,114,182,0.3)",
              }}>
                💬 Chat & BXH Clan Thành Viên →
              </button>
            </Link>
          </div>
        </div>

        {/* Stats Button */}
        <div style={{ padding: "10px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <Link href="/stats" onClick={() => setShowProfile(false)} style={{ textDecoration: "none" }}>
            <div style={{
              width: "100%", padding: "9px 0",
              background: "rgba(56,189,248,0.08)",
              color: "#38bdf8",
              border: "1px solid rgba(56,189,248,0.2)",
              borderRadius: 8, textAlign: "center", fontWeight: 700, fontSize: 13,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              transition: "all 0.2s"
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.16)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(56,189,248,0.08)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.2)"; }}
            >
              {t("📊 Thống Kê & Thành Tích", "📊 Stats & Achievements")}
            </div>
          </Link>
        </div>

        {isUserAdmin && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <Link href="/admin" onClick={() => setShowProfile(false)} style={{ textDecoration: "none" }}>
              <div style={{
                width: "100%", padding: "9px 0",
                background: "rgba(167, 139, 250, 0.12)",
                color: "#c084fc",
                border: "1px solid rgba(167, 139, 250, 0.3)",
                borderRadius: 8, textAlign: "center", fontWeight: 700, fontSize: 13,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                boxShadow: "0 0 10px rgba(167,139,250,0.15)"
              }}>
                {t("🛡️ Admin Panel", "🛡️ Admin Panel")}
              </div>
            </Link>
          </div>
        )}

        {recentActivity.length > 0 && (
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#38bdf8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{t("Hoạt động gần đây", "Recent Activity")}</div>
            {recentActivity.map((line, i) => (
              <div key={i} style={{ fontSize: 11.5, color: "rgba(255,255,255,0.7)", marginBottom: 4, padding: "3px 0", borderBottom: i < recentActivity.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                {line}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: "12px 16px" }}>
          <button onClick={handleSignOut}
            style={{ width: "100%", padding: "9px 0", background: "rgba(239,68,68,0.1)", color: "#f87171", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}>
            {t("Đăng xuất", "Log Out")}
          </button>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: "📖",
      title: t("Học Toán Song Ngữ", "Bilingual Lessons"),
      titleVi: t("Bilingual Lessons", "Học Toán Song Ngữ"),
      desc: t(
        "Trực quan hóa lý thuyết toán học THPT với hệ thống chương mục từ I đến X. Giao diện mượt mà hỗ trợ chuyển đổi tức thì giữa ngôn ngữ Tiếng Việt và Tiếng Anh để tăng vốn từ vựng chuyên ngành.",
        "Visualize high school math theory with chapters I to X. Smooth interface supporting instant toggle between Vietnamese and English to boost math vocabulary."
      ),
      link: "/Cacbaitoan",
      cta: t("Vào học ngay", "Learn Now"),
      color: "rgba(14, 165, 233, 0.15)",
      glowColor: "rgba(14, 165, 233, 0.45)",
      badge: t("Chương I - X", "Chapter I - X"),
    },
    {
      icon: "🤖",
      title: t("Trợ Lý Giải Toán AI", "DuoMCB AI Assistant"),
      titleVi: t("DuoMCB AI Assistant", "Trợ Lý Giải Toán AI"),
      desc: t(
        "Chatbot AI hỗ trợ đắc lực trong học tập song ngữ. Giải đáp các bài toán từ cơ bản tới nâng cao với từng bước gợi ý tư duy, giải chi tiết và tính năng nhận diện đề bài bằng hình ảnh cực nhạy.",
        "AI Chatbot to support bilingual learning. Solve basic to advanced math problems with step-by-step guidance, detailed solutions, and fast OCR scanning."
      ),
      link: "/DuoMCB",
      cta: t("Trò chuyện ngay", "Chat Now"),
      color: "rgba(99, 102, 241, 0.15)",
      glowColor: "rgba(99, 102, 241, 0.45)",
      badge: t("Học tập 24/7", "24/7 Learning"),
    },
    {
      icon: "🔍",
      title: t("Tra Từ Vựng Toán Học", "DuoTranslator"),
      titleVi: t("DuoTranslator", "Tra Từ Vựng Toán Học"),
      desc: t(
        "Tính năng tích hợp ngay trong trang bài học. Chỉ cần bôi đen thuật ngữ tiếng Anh, bảng tra cứu thông minh sẽ tự động hiện định nghĩa toán học tiếng Việt, phiên âm IPA chuẩn xác kèm ví dụ.",
        "Directly integrated into lesson pages. Highlight English math terms to instantly view Vietnamese definitions, IPA phonetics, and usage examples."
      ),
      link: "/Cacbaitoan",
      cta: t("Khám phá bài học", "Explore Lessons"),
      color: "rgba(16, 185, 129, 0.15)",
      glowColor: "rgba(16, 185, 129, 0.45)",
      badge: t("Tra từ thông minh", "Smart Dictionary"),
    },
    {
      icon: "🎮",
      title: t("Trò Chơi Toán Học", "Interactive Mini Games"),
      titleVi: t("Interactive Mini Games", "Trò Chơi Toán Học"),
      desc: t(
        "Luyện tập không nhàm chán với 3 thể loại mini-games ở cuối mỗi bài học: Trắc nghiệm (Multiple Choice), Đúng/Sai (True/False) và Điền từ thích hợp. Tự động thống kê kết quả học tập chi tiết.",
        "Fun practice with 3 types of mini-games at the end of each lesson: Multiple Choice, True/False, and Fill-in-the-blank, with automatically tracked progress."
      ),
      link: "/Cacbaitoan",
      cta: t("Chơi & ôn luyện", "Play & Practice"),
      color: "rgba(167, 139, 250, 0.15)",
      glowColor: "rgba(167, 139, 250, 0.45)",
      badge: t("3 Thể Loại Game", "3 Game Modes"),
    },
    {
      icon: "📝",
      title: t("Đề Thi Thử Song Ngữ", "Bilingual Exams"),
      titleVi: t("Bilingual Exams", "Đề Thi Thử Song Ngữ"),
      desc: t(
        "Trải nghiệm cấu trúc bài kiểm tra song ngữ chuẩn hóa (phối hợp các định dạng SAT Reading, IELTS True/False/Not Given và Tự luận toán) trong thời gian 60 phút có hệ thống tự động lưu kết quả.",
        "Take standardized bilingual exams (combining SAT Reading, IELTS True/False/Not Given, and Math open response formats) in 60 minutes with auto-saving."
      ),
      link: "/cacbailam",
      cta: t("Luyện thi thử", "Practice Exam"),
      color: "rgba(244, 63, 94, 0.15)",
      glowColor: "rgba(244, 63, 94, 0.45)",
      badge: t("SAT & IELTS Math", "SAT & IELTS Math"),
    },
    {
      icon: "⚔️",
      title: t("Đấu Hạng Toán Học (MRM)", "Math Ranking Match"),
      titleVi: t("Math Ranking Match", "Đấu Hạng Toán Học (MRM)"),
      desc: t(
        "Chế độ chơi Multiplayer thời gian thực kịch tính. Bạn sẽ được ghép trận với đối thủ để so tài tốc độ và độ chính xác (Speed-First tiebreaker) thông qua các MathMap phong phú từ cộng đồng.",
        "Thrilling real-time multiplayer mode. Match with opponents to compete on speed and accuracy (Speed-First tiebreaker) across community MathMaps."
      ),
      link: "/mrm",
      cta: t("Tham gia đấu ngay", "Match Now"),
      color: "rgba(234, 179, 8, 0.15)",
      glowColor: "rgba(234, 179, 8, 0.45)",
      badge: t("Realtime Multiplayer", "Real-time Match"),
    },
  ];

  return (
    <div style={{ width: "100%", minHeight: "100vh", background: "linear-gradient(160deg, #020c1b 0%, #030d1e 20%, #041226 50%, #03152d 80%, #020c1b 100%)", position: "relative", overflow: "hidden", color: "white" }}>
      {showEditModal && <EditProfileModal onClose={() => setShowEditModal(false)} />}

      {/* ═══════ FULLSCREEN 3D COSMOS BACKGROUND (Saturn-style) ═══════ */}
      <CosmosBackground />

      {/* ═══════ HEADER / NAVBAR ═══════ */}
      <header className="reveal" data-reveal
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          position: "sticky",
          top: 0,
          zIndex: 300,
          background: "rgba(6, 6, 16, 0.88)",
          backdropFilter: "blur(20px)",
          borderBottom: "2px solid rgba(167, 139, 250, 0.25)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.15)"
        }}>
        <div style={{ width: "1200px", maxWidth: "95%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0" }}>

          {/* Logo & Owl Mascot */}
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, transform: "skewX(-8deg)" }}>
            <img src="/images/duosteamicon-removebg-preview.webp" alt="BingMath" style={{ width: 34, height: 34, objectFit: "contain", borderRadius: 6, animation: "bounceMascot 4s ease-in-out infinite" }} />
            <span style={{ fontWeight: 950, fontSize: 22, color: "white", letterSpacing: 1.5, background: "linear-gradient(135deg, #00d2ff, #7c3aed)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              BINGMATH
            </span>
          </Link>

          <nav style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>
            <Link href="/Cacbaitoan" style={{ textDecoration: "none", color: "rgba(255,255,255,0.8)", padding: "8px 16px", borderRadius: 6, transition: "all 0.2s", fontWeight: 700, transform: "skewX(-8deg)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              className="nav-link-item"
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0, 210, 255, 0.12)"; e.currentTarget.style.borderColor = "rgba(0, 210, 255, 0.4)"; e.currentTarget.style.color = "#00d2ff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, transform: "skewX(8deg)" }}>
                {renderDuoIcon("📖", { size: 14 })}
                {t("Bài học", "Lessons")}
              </span>
            </Link>

            <Link href="/DuoMCB" style={{ textDecoration: "none", color: "rgba(255,255,255,0.8)", padding: "8px 16px", borderRadius: 6, transition: "all 0.2s", fontWeight: 700, transform: "skewX(-8deg)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              className="nav-link-item"
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(167, 139, 250, 0.12)"; e.currentTarget.style.borderColor = "rgba(167, 139, 250, 0.4)"; e.currentTarget.style.color = "#a5b4fc"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, transform: "skewX(8deg)" }}>
                {renderDuoIcon("🤖", { size: 14 })}
                {t("AI Chat", "AI Chat")}
              </span>
            </Link>

            <Link href="/cacbailam" style={{ textDecoration: "none", color: "rgba(255,255,255,0.8)", padding: "8px 16px", borderRadius: 6, transition: "all 0.2s", fontWeight: 700, transform: "skewX(-8deg)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              className="nav-link-item"
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0, 210, 255, 0.12)"; e.currentTarget.style.borderColor = "rgba(0, 210, 255, 0.4)"; e.currentTarget.style.color = "#00d2ff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, transform: "skewX(8deg)" }}>
                {renderDuoIcon("📝", { size: 14 })}
                {t("Đề thi", "Exams")}
              </span>
            </Link>

            <Link href="/tailieu" style={{ textDecoration: "none", color: "rgba(255,255,255,0.8)", padding: "8px 16px", borderRadius: 6, transition: "all 0.2s", fontWeight: 700, transform: "skewX(-8deg)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              className="nav-link-item"
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(20, 184, 166, 0.12)"; e.currentTarget.style.borderColor = "rgba(20, 184, 166, 0.4)"; e.currentTarget.style.color = "#14b8a6"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, transform: "skewX(8deg)" }}>
                {renderDuoIcon("📚", { size: 14 })}
                {t("Tài liệu", "Library")}
              </span>
            </Link>

            <Link href="/aithi" style={{ textDecoration: "none", color: "rgba(255,255,255,0.8)", padding: "8px 16px", borderRadius: 6, transition: "all 0.2s", fontWeight: 700, transform: "skewX(-8deg)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
              className="nav-link-item"
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(139, 92, 246, 0.12)"; e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.4)"; e.currentTarget.style.color = "#a78bfa"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "rgba(255,255,255,0.8)"; }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, transform: "skewX(8deg)" }}>
                {renderDuoIcon("✨", { size: 14 })}
                {t("AI Thi", "AI Exam")}
              </span>
            </Link>


            <Link href="/mrm" style={{ textDecoration: "none" }}>
              <button className="nav-mrm-btn" style={{
                color: "white",
                padding: "8px 20px", borderRadius: 6,
                background: "linear-gradient(135deg, #7c3aed, #00d2ff)",
                border: "1px solid rgba(0, 210, 255, 0.3)", fontSize: 13.5, cursor: "pointer",
                fontWeight: 800, display: "flex", alignItems: "center",
                gap: 6, transition: "all 0.25s",
                transform: "skewX(-8deg)",
                boxShadow: "0 0 15px rgba(0,210,255,0.3)"
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 25px rgba(0,210,255,0.6)"; e.currentTarget.style.transform = "skewX(-8deg) translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 15px rgba(0,210,255,0.3)"; e.currentTarget.style.transform = "skewX(-8deg)"; }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 6, transform: "skewX(8deg)" }}>
                  {renderDuoIcon("⚔️", { size: 14 })}
                  {t("MRM Đấu Hạng", "MRM Rank Match")}
                </span>
              </button>
            </Link>

            {ready && !user && (
              <Link href="/login" style={{ textDecoration: "none" }}>
                <button style={{ background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 6, padding: "8px 18px", fontWeight: 700, fontSize: 13.5, cursor: "pointer", transition: "all 0.2s", transform: "skewX(-8deg)" }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}>
                  <span style={{ display: "inline-block", transform: "skewX(8deg)" }}>{t("Đăng nhập", "Login")}</span>
                </button>
              </Link>
            )}

            {/* Profile Dropdown */}
            <div data-profile-root style={{ position: "relative" }}>
              <button onClick={() => setShowProfile(v => !v)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 3, display: "flex", alignItems: "center" }}
                title={user ? user.username : t("Tài khoản", "Account")}>
                {user ? (
                  <UserAvatar user={user} size={34} />
                ) : (
                  <UserAvatar user={{ username: "?" }} size={34} />
                )}
              </button>
              {showProfile && <ProfileDropdown />}
            </div>

          </nav>
        </div>
      </header>

      {/* ═══════ CONTENT MAIN ═══════ */}
      <div style={{ width: "100%", display: "flex", justifyContent: "center", position: "relative", zIndex: 1, paddingBottom: 60 }}>
        <div style={{ width: "1200px", maxWidth: "95%", color: "white" }}>

          {/* ═══════ HERO SECTION ═══════ */}
          <div className="reveal" data-reveal
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, paddingTop: 40, paddingBottom: 50, flexWrap: "wrap" }}>

            {/* Mascot Animation Block */}
            <div style={{ flex: "1 1 420px", display: "flex", justifyContent: "center", position: "relative" }}>
              <div className="mascot-container" style={{
                position: "relative",
                width: "360px",
                height: "360px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <img src="/images/duosteamicon-removebg-preview.webp" alt="BingMath mascot" style={{ width: "220px", maxWidth: "90%", filter: "drop-shadow(0 0 30px rgba(0,200,255,0.5)) drop-shadow(0 8px 30px rgba(0,100,200,0.4))", animation: "floatMascot 6s ease-in-out infinite" }} />
                <div style={{ position: "absolute", bottom: "10%", background: "rgba(4,18,48,0.75)", padding: "8px 18px", borderRadius: 20, border: "1px solid rgba(0,210,255,0.35)", backdropFilter: "blur(12px)", fontSize: 12, color: "#38bdf8", fontWeight: 700, letterSpacing: 0.8, boxShadow: "0 4px 20px rgba(0,150,255,0.2), 0 0 0 1px rgba(0,200,255,0.1)", animation: "badgeFloat 5s ease-in-out infinite" }}>
                  🌌 Explore the Universe of Math
                </div>
              </div>
            </div>

            {/* Intro text */}
            <div style={{ flex: "1 1 520px" }}>
              <div className="reveal" data-reveal data-reveal-stagger data-stagger="80"
                style={{
                  padding: "36px",
                  borderRadius: 20,
                  background: "rgba(15,23,42,0.45)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.4), 0 0 30px rgba(99,102,241,0.05)"
                }}>
                <div style={{ display: "inline-block", background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 30, padding: "4px 14px", fontSize: 12, fontWeight: 800, color: "#38bdf8", letterSpacing: 1, textTransform: "uppercase", marginBottom: 16 }}>
                  {t("Nền tảng Toán Song Ngữ", "Bilingual Math Platform")}
                </div>
                {user ? (
                  <h1 style={{ fontSize: "clamp(26px, 7vw, 44px)", fontWeight: 900, marginBottom: 12, lineHeight: 1.1, color: "white" }}>
                    <TypewriterText text={t(`Chào bạn, ${user.username}! 👋`, `Welcome, ${user.username}! 👋`)} speed={70} />
                  </h1>
                ) : (
                  <FadeInTitle text={t("Chào mừng tới BINGMATH!", "Welcome to BINGMATH!")} />
                )}
                <p style={{ color: "#bae6fd", fontSize: 20, lineHeight: 1.5, fontWeight: 500, marginBottom: 16 }}>
                  {t(
                    <span>Khơi mở tư duy, làm chủ toán học THPT với <strong>giáo trình song ngữ Anh - Việt</strong> tiên tiến!</span>,
                    <span>Unlock your potential and master high school math with an advanced <strong>Bilingual (EN-VI) curriculum</strong>!</span>
                  )}
                </p>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15.5, lineHeight: 1.65, marginBottom: 26 }}>
                  {t(
                    <span>Chúng tôi tin rằng tương lai của <strong>STEM</strong> gắn liền với <strong>năng lực song ngữ</strong>. BingMath mang tới trải nghiệm học tập đỉnh cao kết hợp bài học chuẩn hóa, AI chatbot thông minh và đấu hạng thời gian thực.</span>,
                    <span>We believe the future of <strong>STEM</strong> goes hand-in-hand with <strong>bilingual proficiency</strong>. BingMath delivers a premium learning experience with standardized lessons, smart AI chatbot, and real-time competitive ranking.</span>
                  )}
                </p>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Link href="/Cacbaitoan" style={{ textDecoration: "none" }}>
                    <button className="primary-hero-btn" style={{ padding: "14px 28px", background: "linear-gradient(135deg,#0ea5e9,#6366f1)", color: "white", borderRadius: 10, border: "none", fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 20px rgba(99,102,241,0.35)", transition: "all 0.25s", display: "flex", alignItems: "center", gap: 8 }}>
                      {t("Bắt đầu học ngay", "Start Learning")} {renderDuoIcon("🚀", { size: 18 })}
                    </button>
                  </Link>
                  {ready && !user && (
                    <Link href="/signup" style={{ textDecoration: "none" }}>
                      <button style={{ padding: "14px 28px", background: "rgba(255,255,255,0.06)", color: "white", borderRadius: 10, border: "1.5px solid rgba(255,255,255,0.2)", fontSize: 16, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}>
                        {t("Đăng ký miễn phí", "Sign up free")}
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ GAMIFICATION HUB ═══════ */}
          {user && (
            <div className="reveal visible" style={{ marginTop: 20, marginBottom: 50 }}>
              <SectionHeading
                badge={t("Hoạt động", "Gamification")}
                title={t("Thử Thách & Thành Tích Hàng Ngày", "Daily Challenges & Achievements")}
                subtitle={t("Hoàn thành chỉ tiêu, mở khóa thẻ bài công thức và thăng hạng cùng trường lớp!", "Complete daily goals, unlock formula cards, and level up with your schoolmates!")}
              />

              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 24,
                alignItems: "stretch"
              }}>
                {/* 1. Daily Rings */}
                <div style={{
                  background: "rgba(8, 18, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 24,
                  padding: 24,
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center"
                }}>
                  <MasteryRings />
                </div>

                {/* 2. Gacha Chest */}
                <div style={{
                  background: "rgba(8, 18, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 24,
                  padding: 28,
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textAlign: "center",
                  position: "relative"
                }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "white" }}>
                      📦 {t("Rương Công Thức", "Formula Chest")}
                    </h3>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                      {t(
                        "Tích lũy XP từ bài tập để mở rương nhận thẻ bài toán học ngẫu nhiên.",
                        "Earn XP from exercises to open chests and collect random math formula cards."
                      )}
                    </p>
                  </div>

                  <div style={{ margin: "24px 0", position: "relative" }}>
                    <div style={{
                      position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                      width: 120, height: 120, borderRadius: "50%",
                      background: "radial-gradient(circle, rgba(0, 210, 255, 0.25) 0%, transparent 70%)",
                      animation: "ringPulse 3s ease-in-out infinite",
                      zIndex: 0
                    }} />
                    <span style={{ fontSize: 72, display: "inline-block", cursor: "pointer", zIndex: 1, position: "relative", animation: "badgeFloat 4s ease-in-out infinite" }} onClick={handleOpenGacha}>
                      🎁
                    </span>
                  </div>

                  <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
                    <button
                      onClick={handleOpenGacha}
                      className="glow-btn"
                      style={{
                        width: "100%", padding: "12px 0", borderRadius: 12,
                        background: "linear-gradient(135deg, #00d4ff 0%, #0072ff 100%)",
                        color: "white", fontSize: 14, fontWeight: 800, border: "none",
                        cursor: "pointer"
                      }}
                    >
                      🎁 {t("Mở Rương Tri Thức (50 XP)", "Open Knowledge Chest (50 XP)")}
                    </button>

                    <button
                      onClick={() => setShowAlbumModal(true)}
                      style={{
                        width: "100%", padding: "11px 0", borderRadius: 12,
                        background: "rgba(255,255,255,0.04)",
                        color: "#38bdf8", fontSize: 13.5, fontWeight: 700,
                        border: "1px solid rgba(56,189,248,0.2)",
                        cursor: "pointer", transition: "all 0.2s"
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(56,189,248,0.1)"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    >
                      🎴 {t("Xem Album Thẻ Bài", "View Card Album")}
                    </button>
                  </div>
                </div>

                {/* 3. Leaderboard */}
                <div style={{
                  background: "rgba(8, 18, 42, 0.6)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  borderRadius: 24,
                  padding: 24,
                  backdropFilter: "blur(16px)",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <h3 className="glitch" data-text={t("🏆 Bảng Xếp Hạng", "🏆 Leaderboard")} style={{ margin: 0, fontSize: 19, fontWeight: 800, color: "white" }}>
                      {t("🏆 Bảng Xếp Hạng", "🏆 Leaderboard")}
                    </h3>
                    <div style={{ display: "flex", gap: 4 }}>
                      {[
                        { id: "all", label: t("Toàn cầu", "Global") },
                        { id: "school", label: t("Trường", "School") },
                        { id: "grade", label: t("Lớp", "Grade") }
                      ].map(f => {
                        const active = leaderboardFilter === f.id;
                        return (
                          <button
                            key={f.id}
                            onClick={() => setLeaderboardFilter(f.id)}
                            style={{
                              padding: "4px 8px", borderRadius: 6, fontSize: 11,
                              fontWeight: active ? 700 : 400,
                              background: active ? "rgba(0, 212, 255, 0.15)" : "rgba(255,255,255,0.02)",
                              border: active ? "1px solid rgba(0, 212, 255, 0.3)" : "1px solid rgba(255,255,255,0.06)",
                              color: active ? "#00d4ff" : "rgba(255,255,255,0.5)",
                              cursor: "pointer", transition: "all 0.15s"
                            }}
                          >
                            {f.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto", maxHeight: 220 }}>
                    {leaderboardLoading ? (
                      <div style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", padding: "40px 0", fontSize: 13 }}>
                        Đang tải xếp hạng...
                      </div>
                    ) : leaderboardData.length === 0 ? (
                      <div style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "40px 0", fontSize: 13 }}>
                        {leaderboardFilter === "school" && !user?.school ? "Hãy cập nhật trường trong hồ sơ!" : "Chưa có dữ liệu."}
                      </div>
                    ) : (
                      leaderboardData.slice(0, 5).map((entry, idx) => {
                        const isMe = entry.user_id === user.id;
                        const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
                        return (
                          <div key={idx} style={{
                            display: "flex", alignItems: "center", gap: 10,
                            padding: "8px 12px", borderRadius: 10,
                            background: isMe ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.02)",
                            border: isMe ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(255,255,255,0.04)"
                          }}>
                            <span style={{ fontSize: 13, fontWeight: 800, width: 20, color: "rgba(255,255,255,0.5)" }}>
                              {medal || `#${idx + 1}`}
                            </span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: isMe ? "#a78bfa" : "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {entry.username} {isMe && "(Bạn)"}
                              </div>
                              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
                                {entry.school ? `${entry.school} • ` : ""}Lớp {entry.grade || "10"}
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span style={{ fontSize: 13, fontWeight: 800, color: "#00d4ff" }}>
                                {entry.xp?.toLocaleString()} XP
                              </span>
                              <div style={{ fontSize: 9.5, color: "#f97316", fontWeight: 700 }}>
                                🔥 {entry.current_streak} ngày
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════ FEATURE SWIPE CAROUSEL ═══════ */}
          <FeatureSwipeCarousel features={features} router={router} />

          {/* ═══════ TESTS SECTION ═══════ */}
          <div className="reveal" data-reveal style={{ marginTop: 80 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
              <div>
                <SectionHeading
                  badge={t("Đề thi song ngữ", "Bilingual Exams")}
                  title={t("Đề Kiểm Tra Mới Nhất", "Latest Exams")}
                  subtitle={t("Hệ thống đề thi song ngữ SAT & IELTS tự luyện", "SAT & IELTS math self-practice test system")}
                  align="left"
                />
              </div>
              <Link href="/cacbailam" style={{ color: "#38bdf8", fontWeight: 700, textDecoration: "none", fontSize: 14.5 }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = "underline"}
                onMouseLeave={e => e.currentTarget.style.textDecoration = "none"}>
                {t("Xem tất cả ›", "See all ›")}
              </Link>
            </div>

            <div className="reveal" data-reveal data-reveal-stagger data-stagger="100"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: 28,
                padding: "28px",
                borderRadius: 20,
                background: "rgba(15, 23, 42, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
              }}>
              {[
                { href: "/L10-test1-section1", key: "reading-test-1", label: "Test 1", grade: t("Lớp 10", "Grade 10"), img: "/images/math10.webp" },
                { href: "/L10-test2-section1", key: "reading-test-2", label: "Test 2", grade: t("Lớp 10", "Grade 10"), img: "/images/math10.webp" },
                { href: "/L11-test1-section1", key: "reading-test-L11-1", label: "Test 1", grade: t("Lớp 11", "Grade 11"), img: "/images/math11.webp" },
                { href: "/L12-test1-section1", key: "reading-test-L12-1", label: "Test 1", grade: t("Lớp 12", "Grade 12"), img: "/images/math12.webp" },
              ].map((t_item, i) => {
                const myScores = t_item.key ? Object.entries(bestScores).filter(([k]) => k.startsWith(t_item.key)) : [];
                const scoreBadge = myScores.length > 0
                  ? `🏅 ${t("Điểm cao nhất", "Best score")}: ${myScores.map(([, r]) => `${r.score}/${r.total}`).join(", ")}`
                  : null;
                const card = (
                  <article key={i} className="test-card" style={{
                    transition: "all 0.3s ease",
                    borderRadius: 12,
                    overflow: "hidden",
                    opacity: t_item.disabled ? 0.45 : 1,
                  }}>
                    <div style={{ overflow: "hidden", borderRadius: 10, height: 180, marginBottom: 14 }}>
                      <img src={t_item.img} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }} className="test-card-image" />
                    </div>
                    <div style={{ fontSize: 19, fontWeight: 800, color: "white", marginBottom: 3 }}>{t_item.label}</div>
                    <div style={{ color: "#38bdf8", fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{t_item.grade}</div>
                    <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{t("15 câu hỏi • Bấm giờ 60 phút", "15 questions • 60-min timer")}</div>
                    {scoreBadge && (
                      <div style={{ marginTop: 4, fontSize: 11, color: "#38bdf8", fontWeight: 700, background: "rgba(56,189,248,0.12)", border: "1px solid rgba(56,189,248,0.25)", padding: "4px 10px", borderRadius: 6, display: "inline-block" }}>
                        {scoreBadge}
                      </div>
                    )}
                  </article>
                );
                return t_item.href
                  ? <Link key={i} href={t_item.href} style={{ textDecoration: "none", color: "inherit" }} onClick={() => t_item.key && clearTestSession(t_item.key)}>{card}</Link>
                  : card;
              })}
            </div>
          </div>

          {/* ═══════ APP DOWNLOAD SECTION ═══════ */}
          <AppDownloadSection />

          {/* ═══════ BRANDING FOOTER ═══════ */}
          <div className="reveal" data-reveal style={{ marginTop: 80 }}>
            <div style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 40,
              padding: "40px",
              borderRadius: 16,
              border: "1px solid rgba(255,255,255,0.08)",
              background: "rgba(15, 23, 42, 0.45)",
              backdropFilter: "blur(12px)",
              flexWrap: "wrap",
              boxShadow: "0 10px 40px rgba(0,0,0,0.3)"
            }}>
               {/* Left branding */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 220 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <img src="/images/duosteamicon-removebg-preview.webp" alt="BingMath" style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8 }} />
                  <span style={{ fontWeight: 900, fontSize: 20, color: "white", letterSpacing: 0.5 }}>BINGMATH</span>
                </div>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>
                  {t("Học toán song ngữ cho học sinh chuyên STEM", "Bilingual math education for STEM students")}
                </span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  {t("© 2026 BingMath. Mọi quyền được bảo lưu.", "© 2026 BingMath. All rights reserved.")}
                </span>
              </div>

              <div style={{ width: 1, background: "rgba(255,255,255,0.1)", alignSelf: "stretch", minHeight: 80 }} className="footer-divider" />

              {/* Right contacts */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, minWidth: 260 }}>
                {[
                  { icon: "📍", label: t("Địa chỉ", "Address"), value: t("Thpt Nguyễn Chí Thanh, TP Hồ Chí Minh", "Nguyen Chi Thanh High School, Ho Chi Minh City") },
                  { icon: "📧", label: t("Gmail", "Email"), value: "will050710@gmail.com", href: "mailto:will050710@gmail.com" },
                  { icon: "☎️", label: t("Hotline", "Hotline"), value: "+84 336 290 219", href: "tel:+84336290219" },
                ].map(({ icon, label, value, href }, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 24, flexShrink: 0 }}>
                      {renderDuoIcon(icon, { size: 18, color: "#38bdf8" })}
                    </span>
                    <span style={{ fontWeight: 700, fontSize: 13.5, color: "#38bdf8", width: 68, flexShrink: 0 }}>{label}</span>
                    {href
                      ? <a href={href} style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.color = "#38bdf8"}
                        onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.75)"}>{value}</a>
                      : <span style={{ fontSize: 13.5, color: "rgba(255,255,255,0.75)" }}>{value}</span>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 🎴 Album Modals & overlays */}
      <AnimatePresence>
        {showAlbumModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAlbumModal(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 9999, padding: 20, backdropFilter: "blur(12px)"
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 1000, maxHeight: "85vh", overflowY: "auto",
                background: "rgba(10, 20, 42, 0.95)",
                border: "1px solid rgba(56,189,248,0.3)",
                borderRadius: 24, padding: 32,
                boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
                position: "relative"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, color: "white", margin: 0 }}>{t("🎴 Album Công Thức", "🎴 Formula Album")}</h2>
                <button
                  onClick={() => setShowAlbumModal(false)}
                  style={{
                    background: "none", border: "none", color: "white",
                    fontSize: 24, cursor: "pointer"
                  }}
                >
                  ✕
                </button>
              </div>
              <KnowledgeAlbum />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showGachaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isOpeningChest ? () => { setShowGachaModal(false); window.location.reload(); } : undefined}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 9999, padding: 20, backdropFilter: "blur(16px)"
            }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 360,
                background: "rgba(13,31,60,0.95)",
                border: "1px solid rgba(0,212,255,0.35)",
                borderRadius: 24, padding: 32,
                boxShadow: "0 30px 60px rgba(0,0,0,0.6)",
                display: "flex", flexDirection: "column", alignItems: "center",
                textAlign: "center", gap: 20
              }}
            >
              {isOpeningChest ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                  <span style={{
                    fontSize: 84, display: "inline-block",
                    animation: "spinSlow 1s linear infinite"
                  }}>
                    🎁
                  </span>
                  <h4 style={{ margin: 0, fontSize: 18, color: "#00d4ff", fontWeight: 800 }}>
                    {t("Đang giải phóng tri thức...", "Unleashing knowledge...")}
                  </h4>
                </div>
              ) : gachaRewardCard ? (
                <>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#f59e0b", letterSpacing: 1, textTransform: "uppercase", background: "rgba(245,158,11,0.15)", padding: "4px 12px", borderRadius: 20 }}>
                    {t("THÀNH CÔNG!", "SUCCESS!")}
                  </span>
                  <div style={{
                    width: "100%",
                    background: "radial-gradient(circle at 50% 50%, rgba(245,158,11,0.15) 0%, rgba(8, 18, 42, 0.8) 100%)",
                    border: "1px solid rgba(245, 158, 11, 0.5)",
                    borderRadius: 16, padding: 24,
                    boxShadow: "0 10px 30px rgba(245,158,11,0.25)"
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", marginBottom: 6 }}>
                      {gachaRewardCard.rarity} Card
                    </div>
                    <h3 style={{ fontSize: 20, fontWeight: 900, color: "white", margin: "0 0 12px 0" }}>
                      {gachaRewardCard.name}
                    </h3>
                    <div style={{
                      background: "rgba(0,0,0,0.4)", borderRadius: 10, padding: 12, fontSize: 13.5, color: "white",
                      margin: "12px 0", border: "1px solid rgba(255,255,255,0.04)"
                    }}>
                      <div dangerouslySetInnerHTML={{
                        __html: (() => {
                          try {
                            return katex.renderToString(gachaRewardCard.formula, { throwOnError: false });
                          } catch {
                            return gachaRewardCard.formula;
                          }
                        })()
                      }} style={{ fontSize: 14, color: "white", textAlign: "center" }} />
                    </div>
                    <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
                      {gachaRewardCard.description}
                    </p>
                  </div>
                  <button
                    onClick={() => { setShowGachaModal(false); window.location.reload(); }}
                    style={{
                      width: "100%", padding: "12px 0", borderRadius: 12,
                      background: "linear-gradient(135deg, #00d4ff 0%, #0072ff 100%)",
                      color: "white", fontSize: 13.5, fontWeight: 800, border: "none",
                      cursor: "pointer"
                    }}
                  >
                    {t("Thêm vào Album 🎴", "Add to Album 🎴")}
                  </button>
                </>
              ) : (
                <div style={{ color: "red" }}>{t("Không thể mở rương.", "Cannot open chest.")}</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS enhancements */}
      <style dangerouslySetInnerHTML={{ __html: `
        .reveal {
          opacity: 0;
          transform: translateY(24px) scale(0.98);
          transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: opacity, transform;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        .reveal[data-reveal-stagger].visible {
          opacity: 1;
          transform: none;
        }
        .reveal[data-reveal-stagger] > * {
          opacity: 0;
          transform: translateY(20px) scale(0.97);
          will-change: opacity, transform;
        }
        header.reveal {
          transform: translateY(-12px);
          opacity: 0;
        }
        header.reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        /* Floating math symbols in background */
        .floating-math-symbol {
          pointer-events: none;
          opacity: 0;
          animation: floatUp 25s linear infinite;
        }
        
        @keyframes floatUp {
          0% {
            transform: translateY(105vh) rotate(0deg);
            opacity: 0;
          }
          5% {
            opacity: 0.15;
          }
          90% {
            opacity: 0.15;
          }
          100% {
            transform: translateY(-15vh) rotate(360deg);
            opacity: 0;
          }
        }
        
        /* Mascot gentle float */
        @keyframes floatMascot {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1.5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        
        /* Mascot light bounce */
        @keyframes bounceMascot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        
        /* Nav link hover effects */
        .nav-link-item:hover {
          color: white !important;
          background: rgba(255, 255, 255, 0.08);
        }
        
        /* Premium button hover states */
        .nav-mrm-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(99,102,241,0.5) !important;
        }
        .primary-hero-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(99,102,241,0.5) !important;
        }
        
        /* Antigravity grid card styling */
        .feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(99, 102, 241, 0.3) !important;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), 0 0 25px rgba(99, 102, 241, 0.12);
        }
        .feature-card:hover .card-glow {
          opacity: 0.7 !important;
        }
        .feature-card:hover .arrow-icon {
          transform: translateX(4px);
        }
        
        /* Test card image zoom */
        .test-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 24px rgba(56, 189, 248, 0.15);
        }
        .test-card:hover .test-card-image {
          transform: scale(1.05);
        }
        
        /* Responsive tweaks */
        @media (max-width: 768px) {
          .mascot-container {
            width: 280px !important;
            height: 280px !important;
          }
          .mascot-container img {
            width: 180px !important;
          }
          .footer-divider {
            display: none !important;
          }
        }
        /* Slow spin for hexagons and dashed circles */
        @keyframes spinSlow {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Galaxy ring pulse */
        @keyframes ringPulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 1;   transform: scale(1.03); }
        }

        /* Galaxy container gentle breath */
        @keyframes galaxyBreath {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50%       { transform: scale(1.025); filter: brightness(1.08); }
        }

        /* Floating badge bob */
        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }

        /* Mobile: shrink galaxy container */
        @media (max-width: 768px) {
          .mascot-container {
            width: 300px !important;
            height: 300px !important;
          }
          .mascot-container img {
            width: 120px !important;
          }
        }
      `}} />
    </div>
  );
}
