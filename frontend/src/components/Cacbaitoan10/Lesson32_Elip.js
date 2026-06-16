
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
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
      <div style={{ fontSize: 48, marginBottom: 8 }}>
        {items.filter(i => i.correct).length === items.length ? "🏆" : items.filter(i => i.correct).length >= items.length * 0.6 ? "👍" : "💪"}
      </div>
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
      <button onClick={onReset} style={{ padding: "12px 32px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
        🔄 {t("Chơi lại", "Play Again")}
      </button>
    </div>
  </div>
);

export default function Lesson32_Elip() {
  const { user, saveGameResult } = useAuth();
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
          c.style.transition = `opacity 0.5s cubic-bezier(.2,.8,.2,1) ${i * s}ms, transform 0.45s cubic-bezier(.2,.8,.2,1) ${i * s}ms`;
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
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const t = (vi, en) => lang === "vi" ? vi : en;

  const videoSubtitles = [
  {
    "start": 0,
    "end": 12,
    "words": [
      {
        "text": "This lesson introduces",
        "vi": "Bài học này giới thiệu"
      },
      {
        "text": "ellipse",
        "vi": "elip",
        "detail": "<b>ellipse</b>: elip.",
        "detailTitle": "ellipse (elip)"
      },
      {
        "text": "and the main ideas used in Grade 10 math.",
        "vi": "và các ý chính dùng trong Toán 10."
      }
    ]
  },
  {
    "start": 12,
    "end": 30,
    "words": [
      {
        "text": "First identify",
        "vi": "Trước hết xác định"
      },
      {
        "text": "foci",
        "vi": "tiêu điểm",
        "detail": "<b>foci</b>: tiêu điểm.",
        "detailTitle": "foci (tiêu điểm)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "major axis",
        "vi": "trục lớn",
        "detail": "<b>major axis</b>: trục lớn.",
        "detailTitle": "major axis (trục lớn)"
      },
      {
        "text": "through examples.",
        "vi": "qua các ví dụ."
      }
    ]
  },
  {
    "start": 30,
    "end": 55,
    "words": [
      {
        "text": "Use",
        "vi": "Sử dụng"
      },
      {
        "text": "standard equation",
        "vi": "phương trình chính tắc",
        "detail": "<b>standard equation</b>: phương trình chính tắc.",
        "detailTitle": "standard equation (phương trình chính tắc)"
      },
      {
        "text": "carefully and check every condition before solving.",
        "vi": "một cách cẩn thận và kiểm tra mọi điều kiện trước khi giải."
      }
    ]
  },
  {
    "start": 55,
    "end": 9999,
    "words": [
      {
        "text": "For practice, combine",
        "vi": "Khi luyện tập, hãy kết hợp"
      },
      {
        "text": "foci",
        "vi": "tiêu điểm",
        "detail": "<b>foci</b>: tiêu điểm.",
        "detailTitle": "foci (tiêu điểm)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "major axis",
        "vi": "trục lớn",
        "detail": "<b>major axis</b>: trục lớn.",
        "detailTitle": "major axis (trục lớn)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "standard equation",
        "vi": "phương trình chính tắc",
        "detail": "<b>standard equation</b>: phương trình chính tắc.",
        "detailTitle": "standard equation (phương trình chính tắc)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];


  const sc = (id) => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
  const tr = (id) => setRev(p => (({ ...p, [id]: !p[id] })));

  const mcQ = [
    { 'q': 'Phương trình chính tắc của Elip có dạng nào?', 'o': ['x²/a² - y²/b² = 1', 'x²/a² + y²/b² = 1', 'y = ax² + bx + c', 'x² + y² = R²'], 'a': 1, 'ex': 'Elip (E) luôn có dấu cộng giữa hai phân số.' },
    { 'q': 'Trong Elip (a > b > 0), mối liên hệ giữa a, b, c là gì?', 'o': ['a² = b² + c²', 'c² = a² + b²', 'b² = a² + c²', 'a = b + c'], 'a': 0, 'ex': 'Với Elip, a là bán trục lớn nên a² = b² + c².' },
    { 'q': 'Tiêu cự của Elip là khoảng cách nào?', 'o': ['2a', '2b', '2c', 'a+b'], 'a': 2, 'ex': 'Khoảng cách giữa hai tiêu điểm F₁F₂ gọi là tiêu cự, độ dài bằng 2c.' },
    { 'q': 'Điểm M nằm trên Elip khi nào?', 'o': ['MF₁ - MF₂ = 2a', 'MF₁ + MF₂ = 2c', 'MF₁ + MF₂ = 2a', 'MF₁ = MF₂'], 'a': 2, 'ex': 'Định nghĩa: Tổng khoảng cách từ M đến hai tiêu điểm bằng 2a.' },
    { 'q': 'Elip x²/25 + y²/9 = 1 có bán trục lớn a bằng?', 'o': ['25', '9', '5', '3'], 'a': 2, 'ex': 'a² = 25 suy ra a = 5.' }
  ];

  const tfC = [
    { 's': 'Trục lớn của Elip nằm trên trục hoành Ox (với pt chính tắc).', 'a': true, 'ex': 'ĐÚNG — Theo quy ước phương trình chính tắc x²/a² + y²/b² = 1.' },
    { 's': 'Tâm sai e của Elip luôn lớn hơn 1.', 'a': false, 'ex': 'SAI — Tâm sai e = c/a, vì c < a nên 0 < e < 1.' },
    { 's': 'Hình tròn là một trường hợp đặc biệt của Elip khi a = b.', 'a': true, 'ex': 'ĐÚNG — Khi a = b, phương trình trở thành x² + y² = a².' },
    { 's': 'Bốn đỉnh của Elip là A₁(a;0), A₂(-a;0), B₁(0;b), B₂(0;-b).', 'a': true, 'ex': 'ĐÚNG — Đây là các giao điểm của Elip với hai trục tọa độ.' },
    { 's': 'Độ dài trục nhỏ của Elip bằng c.', 'a': false, 'ex': 'SAI — Độ dài trục nhỏ bằng 2b.' }
  ];

  const fQ = [
    { 'id': 'f1', 'tp': 'Độ dài trục lớn của Elip bằng ___.', 'ans': '2a', 'alt': ['2 a'], 'h': 'Gấp đôi bán trục lớn' },
    { 'id': 'f2', 'tp': 'Elip x²/16 + y²/7 = 1 có c = ___.', 'ans': '3', 'alt': ['ba'], 'h': 'c² = 16 - 7 = 9' },
    { 'id': 'f3', 'tp': 'Tỉ số e = c/a được gọi là ___ của Elip.', 'ans': 'tâm sai', 'alt': ['tam sai'], 'h': 'Độ dẹt của hình' }
  ];

  const cf = (id) => {
    const q = fQ.find(q => q.id === id);
    const r = (fa[id] || "").toLowerCase().trim();
    return [q.ans, ...(q.alt || [])].includes(r);
  };
  const fs = fc ? fQ.filter(q => cf(q.id)).length : null;

  const sel = (i) => { if (ms !== null) return; setMs(i); if (i === mcQ[mi].a) setMsc(s => s + 1); setMh(h => [...h, { q: mi, s: i, c: i === mcQ[mi].a }]); };
  const nx = () => { if (mi + 1 >= mcQ.length) setMd(true); else { setMi(i => i + 1); setMs(null); } };
  const rm = () => { setMi(0); setMs(null); setMsc(0); setMd(false); setMh([]); };

  const ta = (a) => { if (tf) return; setTf(true); if (a === tfC[ti].a) setTs(s => s + 1); setTh(h => [...h, { q: ti, g: a, c: a === tfC[ti].a }]); };
  const tn = () => { if (ti + 1 >= tfC.length) setTd(true); else { setTi(i => i + 1); setTf(false); } };
  const rt = () => { setTi(0); setTf(false); setTs(0); setTd(false); setTh([]); };

  const mri = mh.map(h => ({ correct: h.c, qText: mcQ[h.q].q, correctText: mcQ[h.q].o[mcQ[h.q].a], yourText: mcQ[h.q].o[h.s] }));
  const tri = th.map(h => ({ correct: h.c, qText: tfC[h.q].s, correctText: tfC[h.q].a ? t("Đúng", "True") : t("Sai", "False"), yourText: h.g ? t("Đúng", "True") : t("Sai", "False") }));
  const fri = fc ? fQ.map(q => ({ correct: cf(q.id), qText: q.tp, correctText: q.ans, yourText: fa[q.id] || t("(trống)", "(empty)") })) : [];

  
  useEffect(() => {
    if (md && user) {
      saveGameResult({
        lesson_slug: "Lesson32_Elip",
        mode: "mc",
        score: msc,
        total: mcQ.length
      });
    }
  }, [md, msc, user]);

  useEffect(() => {
    if (td && user) {
      saveGameResult({
        lesson_slug: "Lesson32_Elip",
        mode: "tf",
        score: ts,
        total: tfC.length
      });
    }
  }, [td, ts, user]);

  useEffect(() => {
    if (fc && user) {
      const correctCount = fQ.filter(q => {
        const r = (fa[q.id] || "").toLowerCase().trim().replace(/\s/g, "");
        return [q.ans, ...(q.alt || [])].map(a => a.toLowerCase().replace(/\s/g, "")).includes(r);
      }).length;
      saveGameResult({
        lesson_slug: "Lesson32_Elip",
        mode: "fill",
        score: correctCount,
        total: fQ.length
      });
    }
  }, [fc, fa, user]);

  return (
    <div style={{ width: "100%", background: "#fff", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "1100px", maxWidth: "95%", color: "black", padding: "60px 0" }}>
        <div className="reveal" data-reveal style={{ marginBottom: 24 }}>
          <Link href="/Cacbaitoan10" style={{ textDecoration: "none", color: "#666", fontSize: 15, fontWeight: 500 }}>
            ← {t("Danh sách bài học", "Lesson List")}
          </Link>
        </div>

        <header className="reveal" data-reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0B4F5C", textTransform: "uppercase", letterSpacing: 1 }}>{t("Chương IX: Phương pháp tọa độ trong mặt phẳng", "Chapter IX: Coordinate Methods in the Plane")}</div>
            <h1 style={{ fontSize: 36, fontWeight: 800, marginTop: 8, color: "#1a1a1a" }}>{t("Bài 32: Đường Elip", "Lesson 32: The Ellipse")}</h1>
          </div>
          <div style={{ display: "flex", background: "#f0f0f0", padding: 4, borderRadius: 10 }}>
            <button onClick={() => setLang("vi")} style={{ padding: "8px 16px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, background: lang === "vi" ? "white" : "transparent", boxShadow: lang === "vi" ? "0 2px 8px rgba(0,0,0,0.1)" : "none" }}>VN</button>
            <button onClick={() => setLang("en")} style={{ padding: "8px 16px", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, background: lang === "en" ? "white" : "transparent", boxShadow: lang === "en" ? "0 2px 8px rgba(0,0,0,0.1)" : "none" }}>EN</button>
          </div>
        </header>

        {/* ════════════════════════════════════════
            VIDEO BÀI GIẢNG
        ════════════════════════════════════════ */}
        <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
          <div className="reveal" data-reveal>
            <LessonVideoPlayer
              videoId="HO2zAU3Eppo"
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
            />
          </div>
        </section>

        <section id="definition" className="reveal" data-reveal style={{ marginBottom: 60 }}>
          <SH icon="📍" title={t("1. Định nghĩa đường Elip", "1. Definition of Ellipse")} />
          <div style={{ background: "#f9fbfb", padding: 30, borderRadius: 16, borderLeft: "6px solid #0B4F5C" }}>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: "#333" }}>
              {t("Cho hai điểm cố định F₁ và F₂ với F₁F₂ = 2c (c > 0). Đường Elip là tập hợp các điểm M sao cho:", "Given two fixed points F₁ and F₂ with F₁F₂ = 2c (c > 0). An ellipse is the set of points M such that:")}
            </p>
            <div style={{ fontSize: 24, fontWeight: 800, textAlign: "center", margin: "20px 0", color: "#0B4F5C" }}>
              MF₁ + MF₂ = 2a &nbsp; (a &gt; c)
            </div>
            <p style={{ fontSize: 15, color: "#666", fontStyle: "italic" }}>
              {t("* F₁, F₂ gọi là các tiêu điểm. Khoảng cách 2c gọi là tiêu cụ.", "* F₁, F₂ are called foci. The distance 2c is the focal length.")}
            </p>
          </div>
        </section>

        <section id="equation" className="reveal" data-reveal style={{ marginBottom: 60 }}>
          <SH icon="📐" title={t("2. Phương trình chính tắc", "2. Standard Equation")} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 30 }}>
            <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid #eee" }}>
              <div style={{ fontWeight: 700, marginBottom: 12, color: "#0B4F5C" }}>{t("Dạng phương trình:", "Equation Form:")}</div>
              <div style={{ fontSize: 28, fontWeight: 700, textAlign: "center", padding: "20px 0" }}>
                <span style={{ borderBottom: "2px solid #333" }}>x²</span> / a² + <span style={{ borderBottom: "2px solid #333" }}>y²</span> / b² = 1
              </div>
              <div style={{ fontSize: 14, color: "#777", textAlign: "center" }}>{t("(với a > b > 0)", "(where a > b > 0)")}</div>
            </div>
            <div style={{ background: "#f0f4f4", padding: 24, borderRadius: 16 }}>
              <div style={{ fontWeight: 700, marginBottom: 12 }}>{t("Các thông số:", "Parameters:")}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, lineHeight: 2 }}>
                <li>• <b>a:</b> {t("Bán trục lớn", "Semi-major axis")}</li>
                <li>• <b>b:</b> {t("Bán trục nhỏ", "Semi-minor axis")}</li>
                <li>• <b>c = √(a² - b²):</b> {t("Nửa tiêu cự", "Half focal length")}</li>
                <li>• <b>e = c/a:</b> {t("Tâm sai (0 < e < 1)", "Eccentricity")}</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="practice" className="reveal" data-reveal style={{ marginBottom: 60 }}>
          <SH icon="✍️" title={t("3. Thực hành", "3. Practice")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { id: 'p1', q: t("Viết phương trình chính tắc của Elip có độ dài trục lớn bằng 10 và tiêu cự bằng 6.", "Write the standard equation of an ellipse with major axis length 10 and focal length 6."), a: "Ta có: 2a = 10 ⇒ a = 5. 2c = 6 ⇒ c = 3. Bán trục nhỏ b² = a² - c² = 25 - 9 = 16. Vậy PT là: x²/25 + y²/16 = 1." },
              { id: 'p2', q: t("Xác định tọa độ các tiêu điểm của Elip (E): x²/25 + y²/9 = 1.", "Identify the coordinates of the foci of ellipse (E): x²/25 + y²/9 = 1."), a: "a² = 25, b² = 9 ⇒ c² = a² - b² = 16 ⇒ c = 4. Vậy tiêu điểm là F₁(-4; 0) và F₂(4; 0)." }
            ].map(item => (
              <div key={item.id} style={{ background: "white", borderRadius: 12, border: "1px solid #eee", overflow: "hidden" }}>
                <div style={{ padding: 20, fontWeight: 600 }}>{item.q}</div>
                <button onClick={() => tr(item.id)} style={{ width: "100%", padding: "10px", border: "none", background: "#f9f9f9", cursor: "pointer", fontSize: 13, color: "#0B4F5C", fontWeight: 700 }}>
                  {rev[item.id] ? t("Ẩn đáp án", "Hide Answer") : t("Xem hướng dẫn giải", "Show Solution")}
                </button>
                {rev[item.id] && <div style={{ padding: 20, background: "#f0fdf4", color: "#166534", fontSize: 15, lineHeight: 1.6 }}>{item.a}</div>}
              </div>
            ))}
          </div>
        </section>

        <section id="game" className="reveal" data-reveal style={{ marginBottom: 100 }}>
          <SH icon="🎮" title="Mini Game Challenge" />
          <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
            {[["mc", t("Trắc nghiệm", "Quiz")], ["tf", t("Đúng/Sai", "True/False")], ["fill", t("Điền khuyết", "Fill")]].map(([k, label]) => (
              <button key={k} onClick={() => setGm(k)} style={{ padding: "10px 20px", borderRadius: 30, border: "none", cursor: "pointer", fontWeight: 700, background: gm === k ? "#0B4F5C" : "#f0f0f0", color: gm === k ? "white" : "#666" }}>{label}</button>
            ))}
          </div>

          <div style={{ background: "#f9f9f9", padding: 30, borderRadius: 20, boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)" }}>
            {gm === "mc" && (
              !md ? (
                <div>
                  <div style={{ marginBottom: 20, color: "#666", fontWeight: 600 }}>{t("Câu", "Question")} {mi + 1}/{mcQ.length}</div>
                  <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 24 }}>{mcQ[mi].q}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {mcQ[mi].o.map((o, i) => (
                      <button key={i} onClick={() => sel(i)} style={{ padding: 16, borderRadius: 12, border: "2px solid", borderColor: ms === i ? (i === mcQ[mi].a ? "#22c55e" : "#ef4444") : "#eee", background: "white", cursor: "pointer", textAlign: "left", fontWeight: 600 }}>{o}</button>
                    ))}
                  </div>
                  {ms !== null && (
                    <div style={{ marginTop: 24 }}>
                      <div style={{ padding: 16, background: "#fff", borderRadius: 12, marginBottom: 16, borderLeft: "4px solid #0B4F5C" }}>💡 {mcQ[mi].ex}</div>
                      <button onClick={nx} style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: "black", color: "white", fontWeight: 700, cursor: "pointer" }}>{mi === mcQ.length - 1 ? t("Kết thúc", "Finish") : t("Tiếp theo", "Next")}</button>
                    </div>
                  )}
                </div>
              ) : <RS items={mri} onReset={rm} t={t} scoreLabel={t("Kết quả trắc nghiệm", "Quiz Results")} />
            )}

            {gm === "tf" && (
              !td ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ marginBottom: 20, color: "#666" }}>{t("Thẻ", "Card")} {ti + 1}/{tfC.length}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 40, minHeight: 80 }}>{tfC[ti].s}</div>
                  {!tf ? (
                    <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
                      <button onClick={() => ta(true)} style={{ padding: "15px 40px", borderRadius: 12, border: "none", background: "#22c55e", color: "white", fontWeight: 800, cursor: "pointer" }}>{t("ĐÚNG", "TRUE")}</button>
                      <button onClick={() => ta(false)} style={{ padding: "15px 40px", borderRadius: 12, border: "none", background: "#ef4444", color: "white", fontWeight: 800, cursor: "pointer" }}>{t("SAI", "FALSE")}</button>
                    </div>
                  ) : (
                    <div>
                      <div style={{ padding: 16, background: "#fff", borderRadius: 12, marginBottom: 16 }}>{tfC[ti].ex}</div>
                      <button onClick={tn} style={{ padding: "12px 24px", borderRadius: 8, border: "none", background: "black", color: "white", fontWeight: 700, cursor: "pointer" }}>{t("Tiếp theo", "Next")}</button>
                    </div>
                  )}
                </div>
              ) : <RS items={tri} onReset={rt} t={t} scoreLabel={t("Kết quả Đúng/Sai", "True/False Results")} />
            )}

            {gm === "fill" && (
              !fc ? (
                <div>
                  {fQ.map((q, idx) => (
                    <div key={q.id} style={{ marginBottom: 24 }}>
                      <div style={{ fontWeight: 600, marginBottom: 8 }}>{idx + 1}. {q.tp}</div>
                      <input 
                        type="text" 
                        onChange={(e) => setFa({...fa, [q.id]: e.target.value})}
                        style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #ccc" }}
                        placeholder={t("Nhập đáp án...", "Type answer...")}
                      />
                    </div>
                  ))}
                  <button onClick={() => setFc(true)} style={{ padding: "12px 30px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>{t("Kiểm tra", "Check")}</button>
                </div>
              ) : <RS items={fri} onReset={() => {setFa({}); setFc(false);}} t={t} scoreLabel={t("Kết quả điền khuyết", "Fill-in Results")} />
            )}
          </div>
        </section>

        <footer className="reveal" data-reveal style={{ textAlign: "center", borderTop: "1px solid #eee", paddingTop: 40, color: "#999", fontSize: 14 }}>
          <p>DUOMATH - {t("Nền tảng học Toán song ngữ", "Bilingual Math Learning Platform")}</p>
          <p style={{ marginTop: 8 }}>{t("Toán 10 · Chân trời sáng tạo · Bài 32", "Math 10 · Creative Horizon · Lesson 32")}</p>
        </footer>

        <style>{`
          .reveal { opacity: 0; transform: translateY(20px); transition: all 0.6s ease-out; }
          .reveal.visible { opacity: 1; transform: translateY(0); }
        `}</style>
         <DuoTranslate/>
      </div>
    </div>
   
  );
}