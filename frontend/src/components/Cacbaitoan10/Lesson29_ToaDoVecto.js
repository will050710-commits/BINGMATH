"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#0B4F5C", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid #f0f0f0" }}>
    <span>{icon}</span>
    <span>{title}</span>
  </div>
);

const RS = ({ items, onReset, scoreLabel, t }) => (
  <div>
    <div style={{ textAlign: "center", marginBottom: 24 }}>
      <div style={{ fontSize: 48, marginBottom: 8 }}>{items.filter(i => i.correct).length === items.length ? "🏆" : items.filter(i => i.correct).length >= items.length * 0.6 ? "👍" : "💪"}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: "#0B4F5C" }}>{items.filter(i => i.correct).length} / {items.length}</div>
      <div style={{ color: "#777", fontSize: 16, marginTop: 4 }}>{scoreLabel}</div>
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
      {items.map((item, idx) => (
        <div key={idx} style={{ padding: "14px 18px", borderRadius: 10, background: item.correct ? "#eafaf1" : "#fdf2f2", border: `1px solid ${item.correct ? "#a9dfbf" : "#f1948a"}` }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <span style={{ fontSize: 18, flexShrink: 0 }}>{item.correct ? "✅" : "❌"}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 4 }}>{t("Câu", "Q")} {idx + 1}: {item.qText}</div>
              {!item.correct && <div style={{ fontSize: 14, color: "#922b21" }}>{t("Đáp án đúng:", "Correct:")} <strong>{item.correctText}</strong></div>}
              {item.yourText && !item.correct && <div style={{ fontSize: 14, color: "#777" }}>{t("Bạn chọn:", "You chose:")} {item.yourText}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ textAlign: "center" }}>
      <button onClick={onReset} style={{ padding: "12px 32px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>🔄 {t("Chơi lại", "Play Again")}</button>
    </div>
  </div>
);

export default function Lesson29_ToaDoVecto() {
  const [lang, setLang] = useState("vi");
  const [rev, setRev] = useState({});
  const [gm, setGm] = useState("mc");
  const [mi, setMi] = useState(0), [ms, setMs] = useState(null), [msc, setMsc] = useState(0), [md, setMd] = useState(false), [mh, setMh] = useState([]);
  const [ti, setTi] = useState(0), [tf, setTf] = useState(false), [ts, setTs] = useState(0), [td, setTd] = useState(false), [th, setTh] = useState([]);
  const [fa, setFa] = useState({}), [fc, setFc] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll("[data-reveal]");
    els.forEach(el => {
      if (el.hasAttribute("data-reveal-stagger")) {
        const s = parseInt(el.getAttribute("data-stagger") || "80", 10);
        Array.from(el.children).forEach((c, i) => {
          c.style.opacity = "0";
          c.style.transform = "translateY(24px) scale(0.97)";
          c.style.transition = `opacity 0.5s cubic-bezier(.2,.8,.2,1) ${i * s}ms,transform 0.45s cubic-bezier(.2,.8,.2,1) ${i * s}ms`;
          c.style.willChange = "opacity,transform";
        });
      }
    });
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.hasAttribute("data-reveal-stagger")) {
            const s = parseInt(el.getAttribute("data-stagger") || "80", 10);
            Array.from(el.children).forEach((c, i) => setTimeout(() => {
              c.style.opacity = "1";
              c.style.transform = "translateY(0) scale(1)";
            }, i * s));
          }
          el.classList.add("visible");
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(el => obs.observe(el)); return () => obs.disconnect();
  }, []);

  const t = (vi, en) => lang === "vi" ? vi : en;

  const videoSubtitles = [
    {
      start: 0, end: 10,
      words: [
        { text: "Welcome", vi: "Chào mừng" },
        { text: "to", vi: "đến với" },
        { text: "this", vi: "bài" },
        { text: "lesson.", vi: "học." }
      ]
    }
  ];

  const sc = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const tr = (id) => setRev(p => (({ ...p, [id]: !p[id] })));

  const mcQ = [{ 'q': '→AB với A(1,3), B(4,7) = ?', 'o': ['(5,10)', '(3,4)', '(−3,−4)', '(4,7)'], 'a': 1, 'ex': '→AB=(4−1,7−3)=(3,4).' }, { 'q': '|(3,4)| = ?', 'o': ['7', '5', '√7', '1'], 'a': 1, 'ex': '|→a|=√(9+16)=5.' }, { 'q': '→a=(2,3), →b=(−3,2). →a·→b = ?', 'o': ['0', '12', '−6', '13'], 'a': 0, 'ex': '2×(−3)+3×2=−6+6=0 → vuông góc.' }, { 'q': 'Trung điểm M của A(2,0) và B(6,4)?', 'o': ['(4,2)', '(8,4)', '(2,2)', '(4,4)'], 'a': 0, 'ex': 'M=((2+6)/2,(0+4)/2)=(4,2).' }, { 'q': '→a=(1,0), →b=(0,1). Góc giữa →a và →b?', 'o': ['0°', '45°', '90°', '180°'], 'a': 2, 'ex': '→a·→b=0 → vuông góc → 90°.' }];
  const tfC = [{ 's': '→AB = B − A theo tọa độ.', 'a': true, 'ex': 'ĐÚNG — →AB=(xB−xA, yB−yA).' }, { 's': '|(3,4)| = 7.', 'a': false, 'ex': 'SAI — |(3,4)|=√(9+16)=5.' }, { 's': '→a⊥→b ⟺ →a·→b=0.', 'a': true, 'ex': 'ĐÚNG — vuông góc ⟺ tích vô hướng bằng 0.' }, { 's': 'Trọng tâm G = trung bình cộng tọa độ 3 đỉnh.', 'a': true, 'ex': 'ĐÚNG — G=((xA+xB+xC)/3,(yA+yB+yC)/3).' }, { 's': '→a=(a₁,a₂). k→a = (ka₁,a₂).', 'a': false, 'ex': 'SAI — k→a=(ka₁,ka₂), nhân cả hai thành phần.' }];
  const fQ = [{ 'id': 'f1', 'tp': 'A(2,3),B(6,7): |→AB| = ___', 'ans': '4√2', 'alt': ['4√2', '4root2', '√32'], 'h': '√((6-2)²+(7-3)²)' }, { 'id': 'f2', 'tp': '→a=(3,4). |→a| = ___', 'ans': '5', 'alt': ['5'], 'h': '√(9+16)' }, { 'id': 'f3', 'tp': '→a=(2,−1),→b=(1,2): →a·→b = ___', 'ans': '0', 'alt': ['0'], 'h': '2×1+(−1)×2' }];
  
  const cf = (id) => { 
    const q = fQ.find(q => q.id === id); 
    const r = (fa[id] || "").toLowerCase().trim().replace(/\s/g, ""); 
    return [q.ans, ...(q.alt || [])].map(a => a.toLowerCase().replace(/\s/g, "")).includes(r); 
  };
  
  const fs = fc ? fQ.filter(q => cf(q.id)).length : null;
  const sel = (i) => { if (ms !== null) return; setMs(i); const c = i === mcQ[mi].a; if (c) setMsc(s => s + 1); setMh(h => [...h, { q: mi, s: i, c }]); };
  const nx = () => { if (mi + 1 >= mcQ.length) setMd(true); else { setMi(i => i + 1); setMs(null); } };
  const rm = () => { setMi(0); setMs(null); setMsc(0); setMd(false); setMh([]); };
  const ta = (a) => { if (tf) return; setTf(true); const c = a === tfC[ti].a; if (c) setTs(s => s + 1); setTh(h => [...h, { q: ti, g: a, c }]); };
  const tn = () => { if (ti + 1 >= tfC.length) setTd(true); else { setTi(i => i + 1); setTf(false); } };
  const rt = () => { setTi(0); setTf(false); setTs(0); setTd(false); setTh([]); };
  
  const mri = mh.map(h => ({ correct: h.c, qText: mcQ[h.q].q, correctText: mcQ[h.q].o[mcQ[h.q].a], yourText: mcQ[h.q].o[h.s] }));
  const tri = th.map(h => ({ correct: h.c, qText: tfC[h.q].s, correctText: tfC[h.q].a ? t("ĐÚNG", "TRUE") : t("SAI", "FALSE"), yourText: h.g ? t("ĐÚNG", "TRUE") : t("SAI", "FALSE") }));
  const fri = fc ? fQ.map(q => ({ correct: cf(q.id), qText: q.tp, correctText: q.ans, yourText: fa[q.id] || t("(bỏ trống)", "(blank)") })) : [];
  
  const tabs = [["w", "🚀", t("Khởi động", "Warm-Up")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")], ["k1", "📖", t("1. Tọa Độ Vectơ", "1. Coordinates")], ["k2", "📖", t("2. Trung Điểm & TT", "2. Midpoint & Centroid")], ["th", "✏️", t("Thực Hành", "Practice")], ["mg", "🎮", t("Mini Game", "Mini Game")]];
  
  return (
    <div style={{ width: "100%", background: "#fff", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "1200px", maxWidth: "95%", color: "black", paddingTop: 60, paddingBottom: 80 }}>
        <div className="reveal" data-reveal style={{ marginBottom: 24 }}>
          <Link href="/Cacbaitoan10" style={{ textDecoration: "none", color: "black", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "12px 16px", borderRadius: 8, fontSize: 15 }}>← {t("Quay lại", "Back")}</Link>
        </div>
        <header className="reveal" data-reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", position: "relative", zIndex: 300 }}>
          <div><div style={{ fontWeight: "bold", fontSize: 22, color: "#0B4F5C" }}>Chương IX · Phương Pháp Tọa Độ Trong Mặt Phẳng</div><div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>Bài 29: Tọa Độ Vectơ</div></div>
          <div style={{ display: "flex", gap: 10 }}><button onClick={() => setLang("vi")} style={{ background: lang === "vi" ? "black" : "#f9f9f9", color: lang === "vi" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 VI</button><button onClick={() => setLang("en")} style={{ background: lang === "en" ? "black" : "#f9f9f9", color: lang === "en" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 EN</button></div>
        </header>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom: 40, padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 14 }}>🎯 {t("Yêu cầu cần đạt", "Objectives")}</div>
          <div key={"0"} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>• Biểu diễn vectơ qua tọa độ (a₁,a₂). / Express vectors via coordinates (a₁,a₂).</div>
          <div key={"1"} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>• Tính độ dài |→a|=√(a₁²+a₂²). / Compute length |→a|=√(a₁²+a₂²).</div>
          <div key={"2"} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>• Thực hiện phép toán vectơ qua tọa độ. / Perform vector operations via coordinates.</div>
          <div key={"3"} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>• Kiểm tra song song và vuông góc. / Check parallel and perpendicular.</div>
          <div key={"4"} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>• Tính trung điểm và trọng tâm. / Find midpoint and centroid.</div>
        </div>
        <div style={{ position: "sticky", top: 0, zIndex: 200, background: "#fff", paddingTop: 12, paddingBottom: 12, marginBottom: 48, boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}><div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{tabs.map(([id, icon, label]) => (<button key={id} onClick={() => sc(id)} style={{ background: "#f9f9f9", color: "black", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.15s" }} onMouseEnter={e => { e.currentTarget.style.background = "black"; e.currentTarget.style.color = "white"; }} onMouseLeave={e => { e.currentTarget.style.background = "#f9f9f9"; e.currentTarget.style.color = "black"; }}>{icon} {label}</button>))}</div></div>

        <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}><SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 16, lineHeight: 1.8 }}>{t("Trong GPS và bản đồ số, mỗi địa điểm được xác định bởi một cặp số (kinh độ, vĩ độ). Đây chính là hệ tọa độ — và một vectơ cũng có thể biểu diễn qua tọa độ!", "In GPS and digital maps, each location is defined by a pair (longitude, latitude). This is the coordinate system — and a vector can also be expressed through coordinates!")}</div>
          </div>
        </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="hJkKADcQWj0"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (CC BY-NC-SA)", "Video by Khan Academy (CC BY-NC-SA)")}
          />
        </div>
      </section>
        <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}><SH icon="📖" title={t("1. Tọa Độ Vectơ", "1. Vector Coordinates")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: 20 }}>
            <div style={{ fontSize: 15, lineHeight: 1.8, marginBottom: 12 }}>{t("Với hệ trục Oxy, vectơ →a được biểu diễn qua các vectơ đơn vị →i=(1,0) và →j=(0,1):", "In coordinate system Oxy, vector →a is expressed via unit vectors →i=(1,0) and →j=(0,1):")}</div>
            <div style={{ background: "white", borderRadius: 10, padding: "14px 18px", fontFamily: "monospace", fontSize: 16, textAlign: "center", lineHeight: 2.4, color: "#0B4F5C", fontWeight: 700 }}>
              →a = (a₁, a₂) = a₁→i + a₂→j<br />
              |→a| = √(a₁² + a₂²)
            </div>
          </div>
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16, transition: "all 0.3s" }}>
            {[
              {
                title: t("Tọa độ điểm và vectơ", "Point and vector coordinates"),
                formula: `A(x,y) → →OA = (x,y)
→AB = (xB−xA, yB−yA)`,
                c: "#1a5276", bg: "#eaf4fb"
              },
              {
                title: t("Phép toán theo tọa độ", "Operations via coordinates"),
                formula: `→a±→b = (a₁±b₁, a₂±b₂)
k→a = (ka₁, ka₂)
→a·→b = a₁b₁+a₂b₂`,
                c: "#1e8449", bg: "#eafaf1"
              },
              {
                title: t("Điều kiện // và ⊥", "Parallel and perpendicular"),
                formula: `//: a₁b₂−a₂b₁=0
⊥: a₁b₁+a₂b₂=0
Góc: cosφ=(→a·→b)/(|→a||→b|)`,
                c: "#922b21", bg: "#fdf2f2"
              },
            ].map((card, i) => (
              <article key={i} style={{ padding: 18, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: card.c, marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, background: card.bg, color: card.c, padding: "8px 12px", borderRadius: 8, whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{card.formula}</div>
              </article>
            ))}
          </div>
        </section>
        <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}><SH icon="📖" title={t("2. Tọa Độ Trung Điểm và Trọng Tâm", "2. Midpoint and Centroid")} />
          <div className="reveal" data-reveal style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ background: "white", borderRadius: 8, padding: "14px 18px", fontFamily: "monospace", fontSize: 15, lineHeight: 2.4 }}>
              Trung điểm M của AB: M = ((xA+xB)/2, (yA+yB)/2)<br />
              Trọng tâm G của △ABC: G = ((xA+xB+xC)/3, (yA+yB+yC)/3)
            </div>
          </div>
        </section>
        <section id="th" style={{ scrollMarginTop: 80, marginBottom: 64 }}><SH icon="✏️" title={t("Thực Hành", "Practice")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 36, transition: "all 0.3s" }}>
            {[{ id: "e1", q: t("A(1,2), B(5,6). Tính →AB, |→AB|, trung điểm M.", "A(1,2), B(5,6). Find →AB, |→AB|, midpoint M."), a: ["→AB=(5−1,6−2)=(4,4)", "|→AB|=√(16+16)=4√2≈5.66", "M=((1+5)/2,(2+6)/2)=(3,4)"] },
            { id: "e2", q: t("→a=(3,4), →b=(−4,3). Kiểm tra →a⊥→b.", "→a=(3,4), →b=(−4,3). Check →a⊥→b."), a: ["→a·→b=3×(−4)+4×3=−12+12=0", t("→a·→b=0 → →a⊥→b ✓", "→a·→b=0 → perpendicular ✓")] },
            { id: "e3", q: t("A(0,0), B(4,0), C(2,6). Tìm trọng tâm G.", "A(0,0), B(4,0), C(2,6). Find centroid G."), a: ["G=((0+4+2)/3,(0+0+6)/3)=(6/3,6/3)=(2,2)"] },
            ].map(({ id, q, a }) => (
              <article key={id}>
                <div style={{ padding: "16px 20px", borderRadius: "10px 10px 0 0", background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>📝 {t("Bài tập", "Exercise")}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7 }}>{q}</div>
                </div>
                <button onClick={() => tr(id)} style={{ display: "block", width: "100%", padding: "12px 20px", background: "black", color: "white", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", textAlign: "left" }}>{rev[id] ? t("Ẩn ▲", "Hide ▲") : t("Xem đáp án ▼", "Show ▼")}</button>
                {rev[id] && <div style={{ padding: "16px 20px", background: "#eafaf1", borderRadius: "0 0 10px 10px" }}>{a.map((l, i) => <div key={i} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>{l}</div>)}</div>}
              </article>
            ))}
          </div>
        </section>
        <section id="mg" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SH icon="🎮" title="Mini Game" />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 24, marginBottom: 32, transition: "all 0.3s" }}>
            {[["mc", "🧩", t("Trắc Nghiệm", "Multiple Choice"), t("5 câu", "5 Q")], ["tf", "🃏", t("Đúng / Sai", "True / False"), t("5 thẻ", "5 cards")], ["fill", "✍️", t("Điền Chỗ Trống", "Fill in Blank"), t("3 câu", "3 items")]].map(([mode, icon, label, sub]) => (<article key={mode} onClick={() => setGm(mode)} style={{ background: gm === mode ? "black" : "#f9f9f9", color: gm === mode ? "white" : "black", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20, borderRadius: 10 }}><div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div><div style={{ fontSize: 18, fontWeight: 600 }}>{label}</div><div style={{ fontSize: 14, opacity: 0.7 }}>{sub}</div></article>))}
          </div>
          {gm === "mc" && (
            <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!md ? (
                <>
                  <div style={{ color: "#777", fontSize: 15, marginBottom: 8 }}>{t("Câu", "Q")} {mi + 1}/{mcQ.length} · {t("Điểm:", "Score:")} {msc}</div>
                  <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>{mcQ[mi].q}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {mcQ[mi].o.map((opt, i) => {
                      let bg = "white", co = "black";
                      if (ms !== null) {
                        if (i === mcQ[mi].a) { bg = "#eafaf1"; co = "#1e8449"; }
                        else if (i === ms) { bg = "#fdf2f2"; co = "#922b21"; }
                      }
                      return <button key={i} onClick={() => sel(i)} style={{ textAlign: "left", padding: "14px 18px", borderRadius: 10, border: "none", background: bg, color: co, fontSize: 15, fontWeight: ms !== null && (i === ms || i === mcQ[mi].a) ? 600 : 400, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{String.fromCharCode(65 + i)}. {opt}</button>;
                    })}
                  </div>
                  {ms !== null && (
                    <>
                      <div style={{ marginTop: 16, padding: "12px 16px", background: "white", borderRadius: 8, fontSize: 15, color: "#555", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💬 {mcQ[mi].ex}</div>
                      <button onClick={nx} style={{ marginTop: 14, padding: "12px 28px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{mi + 1 < mcQ.length ? t("Câu tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")}</button>
                    </>
                  )}
                </>
              ) : (
                <RS items={mri} onReset={rm} scoreLabel={msc === mcQ.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : msc >= 3 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} t={t} />
              )}
            </div>
          )}
          {gm === "tf" && (
            <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!td ? (
                <>
                  <div style={{ color: "#777", fontSize: 15, marginBottom: 14 }}>{t("Thẻ", "Card")} {ti + 1}/{tfC.length} · {t("Điểm:", "Score:")} {ts}</div>
                  <article style={{ background: "white", borderRadius: 10, padding: 24, marginBottom: 20, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 24 }}>{tfC[ti].s}</div>
                    {!tf ? (
                      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                        <button onClick={() => ta(true)} style={{ padding: "12px 36px", background: "#eafaf1", color: "#1e8449", border: "2px solid #1e8449", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✅ {t("ĐÚNG", "TRUE")}</button>
                        <button onClick={() => ta(false)} style={{ padding: "12px 36px", background: "#fdf2f2", color: "#922b21", border: "2px solid #922b21", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>❌ {t("SAI", "FALSE")}</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ padding: "12px 16px", background: "#f9f9f9", borderRadius: 8, fontSize: 15, color: "#555", textAlign: "left", marginBottom: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💬 {tfC[ti].ex}</div>
                        <button onClick={tn} style={{ padding: "12px 28px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{ti + 1 < tfC.length ? t("Thẻ tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")}</button>
                      </>
                    )}
                  </article>
                </>
              ) : (
                <RS items={tri} onReset={rt} scoreLabel={ts === tfC.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : t("Cố gắng thêm! 💪", "Keep going! 💪")} t={t} />
              )}
            </div>
          )}
          {gm === "fill" && (
            <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!fc ? (
                <>
                  <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t("Điền câu trả lời", "Fill in the blanks")}</div>
                  {fQ.map((q, qi) => (
                    <div key={q.id} style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 15, color: "#777", marginBottom: 6 }}>{t("Câu", "Q")} {qi + 1}</div>
                      <div style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 10 }}>{q.tp}</div>
                      <input value={fa[q.id] || ""} onChange={e => setFa(p => ({ ...p, [q.id]: e.target.value }))} placeholder={t("Nhập đáp án...", "Answer...")} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, fontSize: 15, outline: "none", border: "1px solid #ddd", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <button onClick={() => setFc(true)} style={{ padding: "12px 32px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{t("Kiểm tra", "Check Answers")}</button>
                </>
              ) : (
                <RS items={fri} onReset={() => { setFa({}); setFc(false); }} scoreLabel={fs === fQ.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : fs >= 2 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} t={t} />
              )}
            </div>
          )}
        </section>
        <hr style={{ width: "5px" }}></hr>
        <div className="reveal" data-reveal style={{ textAlign: "center", color: "#777", fontSize: 15, marginBottom: 60 }}>Toán 10 · Chân Trời Sáng Tạo · Bài 29 / Chương IX</div>
        <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
      <DuoTranslate/> 
      </div>
    </div>
  );
}