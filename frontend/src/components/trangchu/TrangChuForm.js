/* eslint-disable react-hooks/static-components */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Accordion, AccordionItem } from "@heroui/react";
import { Avatar } from "@heroui/react";
import DuoMCBSidebar from "../DuoMCB/DuoMCBSidebar";
import { clearTestSession } from "@/utils/testTimer";
import { useAuth } from "@/context/authContext";

export default function TrangChuForm() {
  const router = useRouter();
  const {
    user, ready,
    bestScores, recentActivity,
    totalTests, totalGames, avgTest, avgGame,
    logout,
  } = useAuth();

  const [showFlyer, setShowFlyer] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const flyerSteps = [
    {
      icon: "📖", title: "Bilingual Lessons", color: "#0B4F5C", bg: "#e8f4f6",
      steps: ['Vào "Học toán" → chọn chương (I – X).',
        "Gạt 🇻🇳 / 🇬🇧 để chuyển toàn bộ bài giữa tiếng Việt và tiếng Anh.",
        "Theo trình tự: Khởi động → Lý thuyết → Thực hành → Mini-game."]
    },
    {
      icon: "🤖", title: "DuoMCB — AI Chatbot", color: "#1a5276", bg: "#eaf4fb",
      steps: ["Nhấn vào bong bóng chat góc phải phía dưới bất kỳ trang nào.",
        "Đặt câu hỏi tiếng Việt hoặc tiếng Anh — AI trả lời song ngữ.",
        'Chọn "Gợi ý" để học từng bước, "Đáp án" để xem lời giải đầy đủ.',
        "Gửi ảnh đề bài — Vision AI sẽ nhận diện và giải."]
    },
    {
      icon: "🔍", title: "DuoTranslator", color: "#1e8449", bg: "#eafaf1",
      steps: ["Bôi đen bất kỳ đoạn tiếng Anh trên trang bài học.",
        "Panel dịch thuật tự hiện lên sau 1–2 giây.",
        "Xem bản dịch, tóm tắt, phiên âm IPA và ví dụ trong toán học."]
    },
    {
      icon: "🎮", title: "Mini-Games", color: "#7d3c98", bg: "#f5eef8",
      steps: ["Cuộn xuống cuối bài học.",
        "Chọn: 🧩 Trắc nghiệm · 🃏 Đúng/Sai · ✍️ Điền từ.",
        "Xem ResultSummary chi tiết sau mỗi lần chơi."]
    },
    {
      icon: "📝", title: "Bilingual Tests", color: "#922b21", bg: "#fdf2f2",
      steps: ["Chọn bộ đề Test 1 / Test 2 từ trang chủ.",
        "3 phần: SAT Reading → IELTS T/F/NG → Toán tự luận (60 phút).",
        "Câu trả lời tự lưu khi chuyển section."]
    },
  ];
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
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!showFlyer && !showProfile) return;
    const h = (e) => {
      if (!e.target.closest("[data-flyer-root]")) setShowFlyer(false);
      if (!e.target.closest("[data-profile-root]")) setShowProfile(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [showFlyer, showProfile]);

  function handleSignOut() { logout(); setShowProfile(false); router.push("/"); }

  const dropStyle = {
    position: "absolute", top: "calc(100% + 10px)", right: 0,
    width: 290, maxHeight: "80vh", overflowY: "auto",
    background: "#fff", borderRadius: 12,
    boxShadow: "0 20px 60px rgba(0,0,0,0.16)", zIndex: 1000,
    border: "1.5px solid #e0eef1",
  };

  function ProfileDropdown() {
    if (!ready) return (
      <div style={dropStyle}>
        <div style={{ padding: 20, textAlign: "center", color: "#888", fontSize: 13 }}>Đang tải…</div>
      </div>
    );

    if (!user) return (
      <div style={dropStyle}>
        <div style={{ padding: "18px 18px 16px", textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>👤</div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#0B4F5C", marginBottom: 4 }}>Chưa đăng nhập</div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 14 }}>Đăng nhập để lưu tiến độ học tập</div>
          <Link href="/login" onClick={() => setShowProfile(false)}>
            <div style={{ background: "#0B4F5C", color: "white", borderRadius: 7, padding: "9px 0", textAlign: "center", fontWeight: 600, fontSize: 13, marginBottom: 8, cursor: "pointer" }}>
              Đăng nhập
            </div>
          </Link>
          <Link href="/signup" onClick={() => setShowProfile(false)}>
            <div style={{ border: "1.5px solid #0B4F5C", color: "#0B4F5C", borderRadius: 7, padding: "9px 0", textAlign: "center", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              Tạo tài khoản miễn phí
            </div>
          </Link>
        </div>
      </div>
    );

    return (
      <div style={dropStyle}>
        {/* Header */}
        <div style={{ padding: "14px 16px 12px", borderBottom: "1px solid #eee", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#0B4F5C,#1a9ab5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
            {(user.username || "U")[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>{user.username}</div>
            <div style={{ fontSize: 11, color: "#888" }}>{user.email}</div>
          </div>
        </div>

        {/* Personal info */}
        <div style={{ padding: "11px 16px", borderBottom: "1px solid #eee" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#0B4F5C", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 7 }}>Thông tin cá nhân</div>
          {[["📱", "Điện thoại", user.phone || "—"], ["🏫", "Trường", user.school || "—"], ["📚", "Lớp", user.grade || "—"]].map(([ic, lb, val]) => (
            <div key={lb} style={{ display: "flex", gap: 7, fontSize: 12, color: "#444", marginBottom: 4, alignItems: "center" }}>
              <span>{ic}</span>
              <span style={{ color: "#aaa", minWidth: 60 }}>{lb}:</span>
              <span style={{ fontWeight: 500 }}>{val}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ padding: "11px 16px", borderBottom: "1px solid #eee" }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#0B4F5C", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 7 }}>Thống kê của tôi</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
            {[["📝", "Bài test", totalTests], ["🎮", "Lượt game", totalGames],
            ["📊", "TB test", avgTest != null ? `${avgTest}%` : "—"], ["⭐", "TB game", avgGame != null ? `${avgGame}%` : "—"]].map(([ic, lb, val]) => (
              <div key={lb} style={{ background: "#f5f8fa", borderRadius: 7, padding: "7px 9px" }}>
                <div style={{ fontSize: 15 }}>{ic}</div>
                <div style={{ fontSize: 17, fontWeight: 800, color: "#0B4F5C", lineHeight: 1 }}>{val}</div>
                <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>{lb}</div>
              </div>
            ))}
          </div>
        </div>

        {recentActivity.length > 0 && (
          <div style={{ padding: "11px 16px", borderBottom: "1px solid #eee" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0B4F5C", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 7 }}>Hoạt động gần đây</div>
            {recentActivity.map((line, i) => (
              <div key={i} style={{ fontSize: 11.5, color: "#555", marginBottom: 4, padding: "3px 0", borderBottom: i < recentActivity.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                {line}
              </div>
            ))}
          </div>
        )}

        {Object.keys(bestScores).length > 0 && (
          <div style={{ padding: "11px 16px", borderBottom: "1px solid #eee" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#0B4F5C", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 7 }}>Điểm cao nhất</div>
            {Object.entries(bestScores).map(([k, r]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#444", marginBottom: 3 }}>
                <span>{r.test_key} · {r.section}</span>
                <span style={{ fontWeight: 700, color: "#0B4F5C" }}>{r.score}/{r.total} ({r.accuracy}%)</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: "10px 16px" }}>
          <button onClick={handleSignOut}
            style={{ width: "100%", padding: "9px 0", background: "#fff0f0", color: "#c0392b", border: "1px solid #f5c6cb", borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", background: "#fff", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "1200px", maxWidth: "95%", color: "black" }}>

        {/* ═══════ HEADER ═══════ */}
        <header className="reveal" data-reveal
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 20px", position: "relative", zIndex: 300, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", background: "linear-gradient(135deg, #00d8fe, #13b0ff)", color: "white" }}>

          <div style={{ fontWeight: "bold", fontSize: 22, color: "#0B4F5C", letterSpacing: 1 }}>DUOMATH</div>

          <nav style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 15, position: "relative", zIndex: 300 }}>

            <Link href="/DuoMCB" style={{ textDecoration: "none", color: "black", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "10px 12px", borderRadius: 8, background: "white", whiteSpace: "nowrap" }}>
              Chatbot ›
            </Link>


            <div data-flyer-root style={{ position: "relative" }}>
              <button onClick={() => setShowFlyer(v => !v)}
                style={{ color: showFlyer ? "white" : "black", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "10px 12px", borderRadius: 8, background: showFlyer ? "#0B4F5C" : "white", border: "none", fontSize: 14, cursor: "pointer", fontWeight: 500, display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", transition: "all 0.2s" }}>
                📚 Hướng dẫn {showFlyer ? "▲" : "▼"}
              </button>
              {showFlyer && (
                <div style={{ position: "absolute", top: "calc(100% + 12px)", right: 0, width: 490, maxHeight: "78vh", overflowY: "auto", background: "#fff", borderRadius: 13, boxShadow: "0 24px 60px rgba(0,0,0,0.17)", zIndex: 1000, padding: "18px 18px 14px", border: "1.5px solid #d5eef3" }}>
                  <div style={{ background: "linear-gradient(135deg,#0B4F5C,#1a9ab5)", borderRadius: 9, padding: "12px 16px", marginBottom: 12, color: "white", textAlign: "center" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 2 }}>🎓 DuoMath — Hướng dẫn nhanh</div>
                    <div style={{ fontSize: 12, opacity: 0.82 }}>Song ngữ · AI Chatbot · Mini-Game · Bài kiểm tra</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {flyerSteps.map((s, si) => (
                      <div key={si} style={{ border: `1.5px solid ${s.color}26`, borderRadius: 9, overflow: "hidden" }}>
                        <div style={{ background: s.bg, padding: "7px 12px", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${s.color}18` }}>
                          <span style={{ fontSize: 15 }}>{s.icon}</span>
                          <div style={{ fontWeight: 700, fontSize: 12.5, color: s.color }}>
                            <span style={{ display: "inline-block", background: s.color, color: "white", borderRadius: 20, fontSize: 9, fontWeight: 800, padding: "1px 6px", marginRight: 5 }}>Step {si + 1}</span>
                            {s.title}
                          </div>
                        </div>
                        <div style={{ padding: "8px 12px 10px" }}>
                          {s.steps.map((step, i) => (
                            <div key={i} style={{ display: "flex", gap: 7, marginBottom: i < s.steps.length - 1 ? 5 : 0 }}>
                              <div style={{ minWidth: 16, height: 16, borderRadius: "50%", background: s.color, color: "white", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{i + 1}</div>
                              <div style={{ fontSize: 12, color: "#3a3a3a", lineHeight: 1.6 }}>{step}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, padding: "9px 12px", background: "#fffbea", borderRadius: 7, border: "1px solid #f3d23e", fontSize: 11.5, color: "#7a6200", lineHeight: 1.65, display: "flex", gap: 7 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>💡</span>
                    <span><strong>Pro tip:</strong> Đọc tiếng Việt → gạt sang tiếng Anh → làm mini-game. Vòng lặp 3 bước này giúp ghi nhớ thuật ngữ song ngữ nhanh nhất.</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <Link href="/Cacbaitoan" style={{ flex: 1, textDecoration: "none" }} onClick={() => setShowFlyer(false)}>
                      <div style={{ background: "#0B4F5C", color: "white", borderRadius: 7, padding: "9px 0", textAlign: "center", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>📖 Start learning</div>
                    </Link>
                    <Link href="/DuoMCB" style={{ flex: 1, textDecoration: "none" }} onClick={() => setShowFlyer(false)}>
                      <div style={{ background: "#f5f5f5", color: "#0B4F5C", border: "1.5px solid #0B4F5C", borderRadius: 7, padding: "9px 0", textAlign: "center", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>🤖 ask DuoMCB</div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link href="/Cacbaitoan" style={{ textDecoration: "none", color: "black", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "10px 12px", borderRadius: 8, background: "white", whiteSpace: "nowrap" }}>
              Math lessons ›
            </Link>
            {ready && !user && (
              <Link href="/login">
                <button style={{ background: "black", color: "white", border: "none", borderRadius: 8, padding: "10px 16px", fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
                  Log in
                </button>
              </Link>
            )}

            {/* Profile avatar */}
            <div data-profile-root style={{ position: "relative" }}>
              <button onClick={() => setShowProfile(v => !v)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 3, display: "flex", alignItems: "center" }}
                title={user ? user.username : "Tài khoản"}>
                {user ? (
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#0B4F5C,#1a9ab5)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 15, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
                    {(user.username || "U")[0].toUpperCase()}
                  </div>
                ) : (
                  <Avatar isBordered color="primary" src="/images/defaultuser.png" style={{ width: 36, height: 36 }} />
                )}
              </button>
              {showProfile && <ProfileDropdown />}
            </div>

          </nav>
        </header>

        {/* ═══════ HERO ═══════ */}
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="120"
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40, paddingTop: 20, flexWrap: "wrap" }}>
          <img src="/images/duosteamicon.png" style={{ width: "520px", maxWidth: "100%", cursor: "pointer" }} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="60"
            style={{ maxWidth: "520px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20, borderRadius: 10, background: "#f9f9f9" }}>
            <h1 style={{ fontSize: 40, marginBottom: 10, color: "black" }}>
              {user ? `Chào, ${user.username}! 👋` : "Welcome to DUOMATH!"}
            </h1>
            <p style={{ color: "#777", fontSize: 22, marginBottom: 20 }}>
              Broaden your mathematical horizons with <strong>DUOMATH</strong> — the ultimate <strong>bilingual math resource</strong> for high school students!
            </p>
            <p style={{ color: "#777", fontSize: 18, lineHeight: 1.6, marginBottom: 25 }}>
              At <strong>DUOMATH</strong>, we believe the future of <strong>STEM</strong> is <strong>bilingual</strong>. Dive into an immersive learning experience with resources that help you solve complex problems in two languages.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link href="/Cacbaitoan10" style={{ textDecoration: "none" }}>
                <button href="/Cacbaitoan" style={{ padding: "14px 24px", background: "black", color: "white", borderRadius: 10, border: "none", fontSize: 17, fontWeight: 600, cursor: "pointer" }}>
                  Start
                </button>
              </Link>
              {ready && !user && (
                <Link href="/signup" style={{ textDecoration: "none" }}>
                  <button style={{ padding: "14px 24px", background: "#e8f4f6", color: "#0B4F5C", borderRadius: 10, border: "1.5px solid #0B4F5C", fontSize: 17, fontWeight: 600, cursor: "pointer" }}>
                    Sign Up
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ═══════ TESTS ═══════ */}
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="60"
          style={{ marginTop: 70, marginBottom: 30, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontSize: 28 }}>Latest tests</h2>
          <Link href="/cacbailam" style={{ color: "#999" }}>Xem tất cả</Link>
        </div>

        <div className="reveal" data-reveal data-reveal-stagger data-stagger="100"
          style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 40, marginBottom: 60, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20, borderRadius: 10, background: "#f9f9f9" }}>
          {[
            { href: "/L10-test1-section1", key: "reading-test-1", label: "Test 1", grade: "Grade 10", img: "/images/math10.png" },
            { href: "/L10-test2-section1", key: "reading-test-2", label: "Test 2", grade: "Grade 10", img: "/images/math10.png" },
            { href: null, key: null, label: "Test 1", grade: "Grade 11 (coming soon)", img: "/images/math11.png" },
            { href: null, key: null, label: "Test 1", grade: "Grade 12 (coming soon)", img: "/images/math12.png" },
          ].map((t, i) => {
            const myScores = t.key ? Object.entries(bestScores).filter(([k]) => k.startsWith(t.key)) : [];
            const scoreBadge = myScores.length > 0
              ? `🏅 Best: ${myScores.map(([, r]) => `${r.score}/${r.total}`).join(", ")}`
              : null;
            const card = (
              <article key={i}>
                <img src={t.img} style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: 10, marginBottom: 14 }} />
                <div style={{ fontSize: 22, fontWeight: 600 }}>{t.label}</div>
                <div style={{ color: "#777", fontSize: 18 }}>{t.grade}</div>
                <div style={{ fontSize: 16 }}>15 questions • Short answer + T/F/NG</div>
                {scoreBadge && (
                  <div style={{ marginTop: 6, fontSize: 12, color: "#0B4F5C", fontWeight: 600, background: "#e8f4f6", padding: "3px 9px", borderRadius: 6, display: "inline-block" }}>
                    {scoreBadge}
                  </div>
                )}
              </article>
            );
            return t.href
              ? <Link key={i} href={t.href} style={{ textDecoration: "none", color: "inherit" }} onClick={() => t.key && clearTestSession(t.key)}>{card}</Link>
              : card;
          })}
        </div>

        <div className="reveal" data-reveal style={{ marginBottom: 60, marginTop: 60 }}>
          <div style={{
            display: "flex", alignItems: "flex-start", gap: 48,
            padding: "36px 40px", borderRadius: 14,
            border: "1px solid #e8edf0", background: "#fafcfd",
            flexWrap: "wrap",
          }}>
            {/* Left: Branding */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 160 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <img src="/images/duosteamicon.png" style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 8 }} />
                <span style={{ fontWeight: 800, fontSize: 18, color: "#0B4F5C", letterSpacing: "-0.5px" }}>DUOMATH</span>
              </div>
              <span style={{ fontSize: 12, color: "#999", fontStyle: "italic" }}>Bilingual Math for STEM learners</span>
            </div>

            <div style={{ width: 1, background: "#dde6ea", alignSelf: "stretch", minHeight: 80 }} />

            {/* Right: Contact rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, minWidth: 220 }}>
              {[
                { icon: "📍", label: "Địa chỉ", value: "Thpt Nguyễn Chí Thanh, TP Hồ Chí Minh" },
                { icon: "📧", label: "Gmail", value: "will050710@gmail.com", href: "mailto:will050710@gmail.com" },
                { icon: "☎️", label: "Hotline", value: "+84 336 290 219", href: "tel:+84336290219" },
              ].map(({ icon, label, value, href }, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 18, width: 24, textAlign: "center", flexShrink: 0 }}>{icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: "#0B4F5C", width: 64, flexShrink: 0 }}>{label}</span>
                  {href
                    ? <a href={href} style={{ fontSize: 13, color: "#333", textDecoration: "none" }}>{value}</a>
                    : <span style={{ fontSize: 13, color: "#333" }}>{value}</span>
                  }
                </div>
              ))}
            </div>
          </div>
        </div>

        <style jsx>{`
          .reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity .55s cubic-bezier(.2,.8,.2,1),transform .45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform}
          .reveal.visible{opacity:1;transform:translateY(0) scale(1)}
          .reveal[data-reveal-stagger].visible{opacity:1;transform:none}
          .reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform}
          header.reveal{transform:translateY(-18px);opacity:0}
          header.reveal.visible{opacity:1;transform:translateY(0)}
          article{transition:transform .25s cubic-bezier(.2,.8,.2,1),box-shadow .25s ease;border-radius:10px;padding:8px}
          article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12)}
        `}</style>
        <DuoMCBSidebar />
      </div>
    </div>
  );
}
