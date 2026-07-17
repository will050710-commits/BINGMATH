/* eslint-disable react-hooks/static-components */
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PremiumLessonEngine from "./PremiumLessonEngine";

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      fontSize: 20, fontWeight: 800, color: "white",
      marginBottom: 20, paddingBottom: 12,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      <span>{icon}</span><span>{title}</span>
    </div>
  );
}

// ─── THEORY BLOCK ─────────────────────────────────────────────────────────────
function TheoryBlock({ children }) {
  return (
    <div style={{
      padding: "20px 22px",
      borderRadius: 12,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

export default function Lesson7_HamSoVaDoThi() {
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));

  const chapterTitle = {
    vi: "Chương III · Hàm Số và Đồ Thị",
    en: "Chapter III · Functions and Graphs"
  };

  const lessonTitle = {
    vi: "Bài 7: Hàm Số và Đồ Thị",
    en: "Lesson 7: Functions and Graphs"
  };

  const learningObjectives = [
    { vi: "Hiểu khái niệm hàm số, tập xác định, tập giá trị.", en: "Understand functions, domain, and range." },
    { vi: "Phân biệt hàm đồng biến và nghịch biến.", en: "Distinguish increasing and decreasing functions." },
    { vi: "Nhận biết hàm số chẵn, hàm số lẻ.", en: "Identify even and odd functions." },
    { vi: "Vẽ và đọc đồ thị hàm số.", en: "Draw and read graphs of functions." },
    { vi: "Biết kiểm tra đường thẳng đứng (vertical line test).", en: "Apply the vertical line test." },
  ];

  const navItems = [
    ["khoiDong", "🚀", "Khởi động", "Warm-Up"],
    ["videoBaiGiang", "🎬", "Video", "Video"],
    ["khai1", "📖", "Khái Niệm", "Concept"],
    ["khai2", "📖", "Tập Xác Định", "Domain"],
    ["khai3", "📊", "Đơn Điệu", "Monotonicity"],
    ["khai4", "📖", "Chẵn / Lẻ", "Even / Odd"],
    ["khai5", "📊", "Đồ Thị", "Graph"],
    ["thucHanh", "📝", "Thực Hành", "Practice"],
    ["miniGame", "🎮", "Mini Game", "Mini Game"],
  ];

  const videoSubtitles = [
    {
      start: 0,
      end: 12,
      words: [
        { text: "This lesson introduces", vi: "Bài học này giới thiệu" },
        { text: "functions and graphs", vi: "hàm số và đồ thị", detail: "<b>functions and graphs</b>: hàm số và đồ thị.", detailTitle: "functions and graphs (hàm số và đồ thị)" },
        { text: "and the main ideas used in Grade 10 math.", vi: "và các ý chính dùng trong Toán 10." }
      ]
    },
    {
      start: 12,
      end: 30,
      words: [
        { text: "First identify", vi: "Trước hết xác định" },
        { text: "domain", vi: "tập xác định", detail: "<b>domain</b>: tập xác định.", detailTitle: "domain (tập xác định)" },
        { text: "then connect it with", vi: "sau đó liên hệ với" },
        { text: "range", vi: "tập giá trị", detail: "<b>range</b>: tập giá trị.", detailTitle: "range (tập giá trị)" },
        { text: "through examples.", vi: "qua các ví dụ." }
      ]
    },
    {
      start: 30,
      end: 55,
      words: [
        { text: "Use", vi: "Sử dụng" },
        { text: "graph", vi: "đồ thị", detail: "<b>graph</b>: đồ thị.", detailTitle: "graph (đồ thị)" },
        { text: "carefully and check every condition before solving.", vi: "một cách cẩn thận và kiểm tra mọi điều kiện trước khi giải." }
      ]
    },
    {
      start: 55,
      end: 9999,
      words: [
        { text: "For practice, combine", vi: "Khi luyện tập, hãy kết hợp" },
        { text: "domain", vi: "tập xác định", detail: "<b>domain</b>: tập xác định.", detailTitle: "domain (tập xác định)" },
        { text: ",", vi: "," },
        { text: "range", vi: "tập giá trị", detail: "<b>range</b>: tập giá trị.", detailTitle: "range (tập giá trị)" },
        { text: "and", vi: "và" },
        { text: "graph", vi: "đồ thị", detail: "<b>graph</b>: đồ thị.", detailTitle: "graph (đồ thị)" },
        { text: "step by step.", vi: "theo từng bước." }
      ]
    }
  ];

  const mcQuestions = [
    {
      q: "Hàm số y = f(x) được định nghĩa như thế nào?",
      options: [
        "Mỗi x cho nhiều giá trị y",
        "Mỗi x trong tập xác định cho đúng một giá trị y",
        "Mỗi y cho đúng một giá trị x",
        "x và y luôn bằng nhau",
      ],
      answer: 1,
      explain: "Hàm số: với mỗi x ∈ D, tồn tại đúng MỘT giá trị y tương ứng. Đây là tính đơn trị.",
    },
    {
      q: "Tập xác định của hàm số y = 1/(x−2) là?",
      options: ["ℝ", "ℝ \\ {2}", "ℝ \\ {−2}", "(2, +∞)"],
      answer: 1,
      explain: "Mẫu số x−2 ≠ 0 → x ≠ 2. Tập xác định D = ℝ \\ {2}.",
    },
    {
      q: "Hàm số y = f(x) đồng biến trên (a,b) khi nào?",
      options: [
        "x₁ < x₂ ⟹ f(x₁) > f(x₂)",
        "x₁ < x₂ ⟹ f(x₁) < f(x₂)",
        "f(x₁) = f(x₂) với mọi x₁, x₂",
        "f(x) > 0 với mọi x ∈ (a,b)",
      ],
      answer: 1,
      explain: "Đồng biến: x₁ < x₂ trong (a,b) ⟹ f(x₁) < f(x₂). Nghịch biến thì ngược lại.",
    },
    {
      q: "Hàm số chẵn thỏa mãn điều kiện nào?",
      options: ["f(−x) = f(x)", "f(−x) = −f(x)", "f(x) = f(x+T)", "f(0) = 0"],
      answer: 0,
      explain: "Hàm chẵn: f(−x) = f(x) với mọi x ∈ D. Đồ thị đối xứng qua trục Oy.",
    },
    {
      q: "Đồ thị của hàm số y = f(x) là gì?",
      options: [
        "Tập hợp các điểm (x, 0)",
        "Tập hợp các điểm (x, f(x)) trên mặt phẳng Oxy",
        "Một đường thẳng",
        "Một đường tròn",
      ],
      answer: 1,
      explain: "Đồ thị = {(x, f(x)) | x ∈ D} — tập các điểm có hoành độ x và tung độ f(x).",
    },
  ];

  const tfCards = [
    { stmt: "Mọi đường cong trong mặt phẳng đều là đồ thị của một hàm số.", answer: false, explain: "SAI — chỉ khi mỗi đường thẳng x = const cắt đường cong tại ĐÚNG MỘT điểm (kiểm tra đường thẳng đứng)." },
    { stmt: "Hàm số y = x² là hàm số chẵn.", answer: true, explain: "ĐÚNG — f(−x) = (−x)² = x² = f(x) ✓. Đồ thị đối xứng qua Oy." },
    { stmt: "Hàm số y = x³ là hàm số lẻ.", answer: true, explain: "ĐÚNG — f(−x) = (−x)³ = −x³ = −f(x) ✓. Đồ thị đối xứng qua gốc O." },
    { stmt: "Tập xác định của y = √x là D = ℝ.", answer: false, explain: "SAI — √x chỉ xác định khi x ≥ 0. D = [0, +∞)." },
    { stmt: "Hai hàm số y = x và y = (x²)/x có cùng đồ thị.", answer: false, explain: "SAI — y = x²/x = x với x ≠ 0, tức thiếu điểm (0,0). Tập xác định khác nhau." },
  ];

  const fillQuestions = [
    { id: "f1", template: "Tập xác định của y = √(x − 3) là D = [___, +∞).", answer: "3", altAnswers: ["3"], hint: "x − 3 ≥ 0 → x ≥ ?" },
    { id: "f2", template: "Hàm số đồng biến: x₁ < x₂ ⟹ f(x₁) ___ f(x₂).", answer: "<", altAnswers: ["<"], hint: "Giá trị hàm tăng theo x." },
    { id: "f3", template: "Hàm chẵn thỏa f(−x) = ___ với mọi x ∈ D.", answer: "f(x)", altAnswers: ["f(x)"], hint: "Đối xứng qua trục Oy." },
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        {/* KHỞI ĐỘNG */}
        <section id="khoiDong" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <TheoryBlock>
            <div style={{ fontSize: 16, fontWeight: 600, color: "white", marginBottom: 8 }}>{t("Tình huống mở đầu", "Opening Situation")}</div>
            <div style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
              {t("Nhiệt độ ngoài trời thay đổi theo giờ trong ngày. Nếu đo nhiệt độ T(t) tại mỗi thời điểm t, ta có một quy tắc: mỗi giờ t cho đúng một nhiệt độ T. Đây chính là khái niệm hàm số trong thực tế.",
                "Outside temperature changes by the hour. If we measure T(t) at each moment t, we have a rule: each hour t gives exactly one temperature T. This is a real-world function.")}
            </div>
            <div style={{ fontSize: 15, color: "#a5b4fc", fontStyle: "italic" }}>
              ❓ {t("Cho ví dụ một quy tắc không phải hàm số (một giá trị đầu vào cho nhiều đầu ra).", "Give an example of a rule that is NOT a function (one input giving multiple outputs).")}
            </div>
          </TheoryBlock>
        </section>

        {/* VIDEO BÀI GIẢNG */}
        <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
          <div data-reveal>
            <LessonVideoPlayer videoId={videoId} subtitles={videoSubtitles} lang={lang} credit={t("Video từ Math Antics (YouTube)", "Video by Math Antics (YouTube)")} />
          </div>
        </section>

        {/* 1. HÀM SỐ */}
        <section id="khai1" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="📖" title={t("1. Khái Niệm Hàm Số", "1. Function Concept")} />
          <TheoryBlock>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#22d3ee", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 15.5, lineHeight: 1.85, color: "rgba(255,255,255,0.8)" }}>
              {t("Hàm số là quy tắc f đặt tương ứng mỗi phần tử x thuộc tập D với đúng một phần tử y ∈ ℝ. Ký hiệu: y = f(x), x là biến số, y là giá trị hàm.", "A function is a rule f that assigns to each element x in set D exactly one element y ∈ ℝ. Notation: y = f(x), x is the variable, y is the function value.")}
            </div>
            <div style={{ marginTop: 10, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
              💡 {t("D là tập xác định (domain). Tập giá trị = {f(x) | x ∈ D}.", "D is the domain. Range = {f(x) | x ∈ D}.")}
            </div>
          </TheoryBlock>
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
            {[
              { label: t("✅ Là hàm số", "✅ Is a function"), items: ["y = 2x + 1", "y = x²", "y = sin x", "y = |x|"], ok: true },
              { label: t("❌ KHÔNG phải hàm số", "❌ NOT a function"), items: [t("x² + y² = 4 (đường tròn — mỗi x cho 2 giá trị y)", "x² + y² = 4 (circle)"), t("y² = x (mỗi x > 0 cho y = ±√x)", "y² = x")], ok: false },
            ].map((g, i) => (
              <div key={i} style={{ padding: 18, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "white", marginBottom: 10 }}>{g.label}</div>
                {g.items.map((item, ii) => (
                  <div key={ii} style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "monospace" }}>{item}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: g.ok ? "rgba(5,150,105,0.15)" : "rgba(239,68,68,0.15)", color: g.ok ? "#6ee7b7" : "#fca5a5", padding: "2px 8px", borderRadius: 20 }}>{g.ok ? "✓" : "✗"}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* 2. TẬP XÁC ĐỊNH */}
        <section id="khai2" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="📖" title={t("2. Tập Xác Định", "2. Domain")} />
          <TheoryBlock>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#22d3ee", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 15.5, lineHeight: 1.85, color: "rgba(255,255,255,0.8)" }}>
              {t("Tập xác định D là tập hợp tất cả các giá trị x mà hàm số f(x) có nghĩa (xác định được giá trị).", "The domain D is the set of all x-values for which f(x) is defined.")}
            </div>
          </TheoryBlock>
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {[
              { type: t("Mẫu số ≠ 0", "Denominator ≠ 0"), rule: "y = 1/(x−a): x ≠ a", example: "y = 1/(x+3)", domain: "ℝ \\ {−3}" },
              { type: t("Căn bậc hai ≥ 0", "Square root ≥ 0"), rule: "y = √g(x): g(x) ≥ 0", example: "y = √(x−1)", domain: "[1, +∞)" },
              { type: t("Căn + mẫu", "Root + denominator"), rule: t("Kết hợp cả hai điều kiện", "Combine both conditions"), example: "y = √x / (x−2)", domain: "[0,+∞) \\ {2}" },
            ].map((card, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#a5b4fc", marginBottom: 6 }}>{card.type}</div>
                <div style={{ fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>{card.rule}</div>
                <div style={{ fontSize: 14, color: "white", marginBottom: 8 }}>📘 <code>{card.example}</code></div>
                <div style={{ background: "rgba(5,150,105,0.12)", border: "1px solid rgba(5,150,105,0.3)", color: "#6ee7b7", fontWeight: 700, padding: "4px 10px", borderRadius: 8, fontSize: 13, display: "inline-block" }}>D = {card.domain}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. ĐƠN ĐIỆU */}
        <section id="khai3" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="📊" title={t("3. Tính Đơn Điệu", "3. Monotonicity")} />
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { title: t("📈 Đồng biến (Tăng)", "📈 Increasing"), condition: "∀ x₁ < x₂: f(x₁) < f(x₂)", note: t("Đồ thị đi từ trái sang phải theo hướng ĐI LÊN.", "Graph goes from left to right UPWARD."), color: "#059669", bg: "rgba(5,150,105,0.1)", border: "rgba(5,150,105,0.25)" },
              { title: t("📉 Nghịch biến (Giảm)", "📉 Decreasing"), condition: "∀ x₁ < x₂: f(x₁) > f(x₂)", note: t("Đồ thị đi từ trái sang phải theo hướng ĐI XUỐNG.", "Graph goes from left to right DOWNWARD."), color: "#ef4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
            ].map((card, i) => (
              <div key={i} style={{ padding: 18, borderRadius: 12, background: card.bg, border: `1px solid ${card.border}` }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: "white", marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, color: "#a5b4fc", background: "rgba(255,255,255,0.04)", padding: "6px 10px", borderRadius: 8, marginBottom: 10, display: "inline-block" }}>{card.condition}</div>
                <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13.5 }}>{card.note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. CHẴN / LẺ */}
        <section id="khai4" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="📖" title={t("4. Hàm Số Chẵn và Hàm Số Lẻ", "4. Even and Odd Functions")} />
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { title: t("Hàm số CHẴN", "EVEN function"), cond: "f(-x) = f(x)", sym: t("Đối xứng qua trục Oy", "Symmetric about y-axis"), ex: ["y = x²", "y = cos x", "y = |x|"], color: "#22d3ee", bg: "rgba(34,211,238,0.08)", border: "rgba(34,211,238,0.25)" },
              { title: t("Hàm số LẺ", "ODD function"), cond: "f(-x) = -f(x)", sym: t("Đối xứng qua gốc O(0,0)", "Symmetric about origin O(0,0)"), ex: ["y = x³", "y = sin x", "y = x"], color: "#a78bfa", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.25)" },
            ].map((card, i) => (
              <div key={i} style={{ padding: 18, borderRadius: 12, background: card.bg, border: `1px solid ${card.border}` }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontFamily: "monospace", fontSize: 16, color: card.color, fontWeight: 700, marginBottom: 8 }}>{card.cond}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>🔁 {card.sym}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{t("Ví dụ:", "Examples:")} {card.ex.join(", ")}</div>
              </div>
            ))}
          </div>
          <div data-reveal style={{ marginTop: 16, padding: 16, borderRadius: 10, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", fontSize: 14, color: "#fbbf24" }}>
            ⚠️ {t("Điều kiện cần: tập xác định D phải đối xứng qua gốc O (nếu x ∈ D thì −x ∈ D).", "Necessary condition: domain D must be symmetric about O (if x ∈ D then −x ∈ D).")}
          </div>
        </section>

        {/* 5. ĐỒ THỊ */}
        <section id="khai5" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="📖" title={t("5. Đồ Thị Hàm Số", "5. Graph of a Function")} />
          <TheoryBlock>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#22d3ee", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 15.5, lineHeight: 1.85, color: "rgba(255,255,255,0.8)" }}>
              {t("Đồ thị của hàm số y = f(x) trên tập D là tập hợp tất cả các điểm M(x, f(x)) trong mặt phẳng Oxy với x ∈ D.", "The graph of y = f(x) on D is the set of all points M(x, f(x)) in the Oxy plane with x ∈ D.")}
            </div>
          </TheoryBlock>
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {[
              { icon: "📏", title: t("Kiểm tra đường thẳng đứng", "Vertical Line Test"), desc: t("Mỗi đường thẳng x = c cắt đồ thị tại đúng 1 điểm → là hàm số.", "Each vertical line x = c intersects graph at exactly 1 point → it's a function.") },
              { icon: "📐", title: t("Hàm bậc nhất y = ax + b", "Linear y = ax + b"), desc: t("Đồ thị là đường thẳng. a > 0: đồng biến. a < 0: nghịch biến.", "Graph is a line. a > 0: increasing. a < 0: decreasing.") },
              { icon: "⛰️", title: t("Hàm bậc hai y = ax²", "Quadratic y = ax²"), desc: t("Đồ thị là parabol đỉnh O. a > 0: mở lên. a < 0: mở xuống.", "Graph is parabola with vertex O. a > 0: opens up. a < 0: opens down.") },
            ].map((card, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>{card.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "white", marginBottom: 6 }}>{card.title}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{card.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* THỰC HÀNH */}
        <section id="thucHanh" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="✏️" title={t("Thực Hành", "Practice Exercises")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { id: "e1", q: t("Tìm tập xác định của:\n(a) y = √(2x − 4)\n(b) y = 1/(x² − 1)", "Find the domain of:\n(a) y = √(2x − 4)\n(b) y = 1/(x² − 1)"), a: [t("(a) 2x−4 ≥ 0 → x ≥ 2 → D = [2, +∞)", "(a) 2x−4 ≥ 0 → x ≥ 2 → D = [2, +∞)"), t("(b) x²−1 ≠ 0 → x ≠ ±1 → D = ℝ \\ {−1, 1}", "(b) x²−1 ≠ 0 → x ≠ ±1 → D = ℝ \\ {−1, 1}")] },
              { id: "e2", q: t("Xét tính chẵn/lẻ của:\n(a) f(x) = x⁴ − 2x²\n(b) g(x) = x³ + x\n(c) h(x) = x² + x", "Determine even/odd for:\n(a) f(x) = x⁴ − 2x²\n(b) g(x) = x³ + x\n(c) h(x) = x² + x"), a: [t("(a) f(−x) = x⁴−2x² = f(x) → HÀM CHẴN ✓", "(a) f(−x) = x⁴−2x² = f(x) → EVEN ✓"), t("(b) g(−x) = −x³−x = −g(x) → HÀM LẺ ✓", "(b) g(−x) = −x³−x = −g(x) → ODD ✓"), t("(c) h(−x) = x²−x ≠ h(x) và ≠ −h(x) → KHÔNG CHẴN KHÔNG LẺ", "(c) h(−x) = x²−x ≠ h(x) and ≠ −h(x) → NEITHER")] },
              { id: "e3", q: t("Cho f(x) = 2x − 3. Tính f(0), f(2), f(−1) và xét chiều biến thiên.", "For f(x) = 2x − 3. Find f(0), f(2), f(−1) and determine monotonicity."), a: ["f(0) = −3,  f(2) = 1,  f(−1) = −5", t("Hệ số a = 2 > 0 → f đồng biến trên ℝ.", "Coefficient a = 2 > 0 → f is increasing on ℝ.")] },
            ].map(({ id, q, a }) => (
              <motion.div key={id} whileHover={{ y: -2 }} style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div style={{ padding: "16px 20px", background: "rgba(255,255,255,0.04)" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#6366f1", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>{t("Bài tập", "Exercise")}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.82)", whiteSpace: "pre-wrap" }}>{q}</div>
                </div>
                <button onClick={() => toggleAnswer(id)} style={{ display: "block", width: "100%", padding: "11px 20px", background: revealedAnswers[id] ? "rgba(99,102,241,0.25)" : "rgba(99,102,241,0.12)", color: "#a5b4fc", border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer", textAlign: "left", transition: "all 0.2s" }}>
                  {revealedAnswers[id] ? t("Ẩn đáp án ▲", "Hide Answer ▲") : t("Xem đáp án ▼", "Show Answer ▼")}
                </button>
                <AnimatePresence>
                  {revealedAnswers[id] && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: "hidden" }}>
                      <div style={{ padding: "16px 20px", background: "rgba(5,150,105,0.08)", borderTop: "1px solid rgba(5,150,105,0.2)" }}>
                        {a.map((line, i) => <div key={i} style={{ fontSize: 14, color: "#6ee7b7", marginBottom: 5, whiteSpace: "pre-wrap" }}>{line}</div>)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </section>
      </>
    );
  };

  return (
    <PremiumLessonEngine
      lessonSlug="Lesson7_HamSoVaDoThi"
      chapterTitle={chapterTitle}
      lessonTitle={lessonTitle}
      learningObjectives={learningObjectives}
      navItems={navItems}
      videoId="kvGsIo1TmsM"
      videoSubtitles={videoSubtitles}
      mcQuestions={mcQuestions}
      tfCards={tfCards}
      fillQuestions={fillQuestions}
      renderTheory={renderTheory}
    />
  );
}
