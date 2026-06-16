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

// ─── FORMULA CARD ─────────────────────────────────────────────────────────────
function FormulaCard({ label, formula, note }) {
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 10,
      background: "rgba(99,102,241,0.08)",
      border: "1px solid rgba(99,102,241,0.2)",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontFamily: "monospace", fontSize: 18, color: "#a5b4fc", fontWeight: 700, marginBottom: 6 }}>{formula}</div>
      {note && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{note}</div>}
    </div>
  );
}

export default function Lesson8_HamSoBacHai() {
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const lessonSlug = "Lesson8_HamSoBacHai";

  const chapterTitle = {
    vi: "Chương III · Hàm Số và Đồ Thị",
    en: "Chapter III · Functions and Graphs"
  };

  const lessonTitle = {
    vi: "Bài 8: Hàm Số Bậc Hai",
    en: "Lesson 8: Quadratic Functions"
  };

  const learningObjectives = [
    { vi: "Nhận biết hàm số bậc hai y = ax² + bx + c (a ≠ 0)", en: "Identify quadratic function y = ax²+bx+c (a ≠ 0)" },
    { vi: "Tìm đỉnh, trục đối xứng của parabol", en: "Find vertex and axis of symmetry of a parabola" },
    { vi: "Xác định chiều biến thiên (đồng/nghịch biến)", en: "Determine monotonicity (increasing/decreasing)" },
    { vi: "Vẽ đồ thị parabol theo 5 bước chuẩn", en: "Sketch parabola using 5 standard steps" },
    { vi: "Tìm giá trị lớn nhất/nhỏ nhất", en: "Find maximum and minimum values" },
  ];

  const navItems = [
    ["khoiDong", "🚀", "Khởi động", "Warm-Up"],
    ["videoBaiGiang", "🎬", "Video", "Video"],
    ["khai1", "📖", "Định Nghĩa", "Definition"],
    ["khai2", "📐", "Đỉnh & Trục", "Vertex & Axis"],
    ["khai3", "📊", "Đơn Điệu", "Monotonicity"],
    ["khai4", "✏️", "Vẽ Đồ Thị", "Graphing"],
    ["thucHanh", "📝", "Thực Hành", "Practice"],
    ["miniGame", "🎮", "Mini Game", "Mini Game"],
  ];

  const videoSubtitles = [
    { start: 0, end: 12, words: [{ text: "This lesson introduces", vi: "Bài học này giới thiệu" }, { text: "quadratic functions", vi: "hàm số bậc hai", detail: "<b>quadratic functions</b>: hàm số bậc hai.", detailTitle: "quadratic functions (hàm số bậc hai)" }, { text: "and the main ideas used in Grade 10 math.", vi: "và các ý chính dùng trong Toán 10." }] },
    { start: 12, end: 30, words: [{ text: "First identify", vi: "Trước hết xác định" }, { text: "parabola", vi: "parabol", detail: "<b>parabola</b>: parabol.", detailTitle: "parabola (parabol)" }, { text: "then connect it with", vi: "sau đó liên hệ với" }, { text: "vertex", vi: "đỉnh", detail: "<b>vertex</b>: đỉnh.", detailTitle: "vertex (đỉnh)" }, { text: "through examples.", vi: "qua các ví dụ." }] },
    { start: 30, end: 55, words: [{ text: "Use", vi: "Sử dụng" }, { text: "axis of symmetry", vi: "trục đối xứng", detail: "<b>axis of symmetry</b>: trục đối xứng.", detailTitle: "axis of symmetry (trục đối xứng)" }, { text: "carefully and check every condition before solving.", vi: "một cách cẩn thận và kiểm tra mọi điều kiện trước khi giải." }] },
    { start: 55, end: 9999, words: [{ text: "For practice, combine", vi: "Khi luyện tập, hãy kết hợp" }, { text: "parabola", vi: "parabol", detail: "<b>parabola</b>: parabol.", detailTitle: "parabola (parabol)" }, { text: ",", vi: "," }, { text: "vertex", vi: "đỉnh", detail: "<b>vertex</b>: đỉnh.", detailTitle: "vertex (đỉnh)" }, { text: "and", vi: "và" }, { text: "axis of symmetry", vi: "trục đối xứng", detail: "<b>axis of symmetry</b>: trục đối xứng.", detailTitle: "axis of symmetry (trục đối xứng)" }, { text: "step by step.", vi: "theo từng bước." }] },
  ];

  const mcQuestions = [
    { q: "Hàm số bậc hai y = ax² + bx + c có dạng chuẩn (đỉnh) là?", options: ["y = a(x − h)² + k", "y = a(x + h)² − k", "y = ax² + k", "y = (x − h)² + k"], answer: 0, explain: "Dạng đỉnh: y = a(x − h)² + k, đỉnh I(h, k) với h = −b/(2a), k = f(h)." },
    { q: "Parabol y = 2x² − 4x + 1 có đỉnh tại?", options: ["(−1, −1)", "(1, −1)", "(2, 1)", "(−2, 9)"], answer: 1, explain: "h = −(−4)/(2×2) = 1. k = 2(1)²−4(1)+1 = −1. Đỉnh I(1, −1)." },
    { q: "Parabol y = −x² + 2x + 3 mở về phía nào?", options: ["Mở lên (a > 0)", "Mở xuống (a < 0)", "Không xác định", "Nằm ngang"], answer: 1, explain: "a = −1 < 0 → parabol mở xuống, đỉnh là điểm CỰC ĐẠI." },
    { q: "Trục đối xứng của parabol y = ax² + bx + c là?", options: ["x = b/(2a)", "x = −b/(2a)", "x = −b/a", "y = −b/(2a)"], answer: 1, explain: "Trục đối xứng: x = −b/(2a). Đây cũng là hoành độ của đỉnh." },
    { q: "Hàm y = x² − 2x đồng biến trên khoảng nào?", options: ["(−∞, 1)", "(1, +∞)", "(−∞, 0)", "(0, +∞)"], answer: 1, explain: "h = −(−2)/(2×1) = 1. a > 0 → đồng biến trên (1, +∞), nghịch biến trên (−∞, 1)." },
  ];

  const tfCards = [
    { stmt: "Parabol y = ax² + bx + c luôn có đúng một trục đối xứng.", answer: true, explain: "ĐÚNG — trục đối xứng x = −b/(2a) là duy nhất." },
    { stmt: "Nếu a > 0, hàm y = ax² + bx + c nghịch biến trên (−∞, h) với h = −b/(2a).", answer: true, explain: "ĐÚNG — parabol mở lên: nghịch biến bên trái đỉnh, đồng biến bên phải." },
    { stmt: "Đỉnh của parabol y = a(x−h)² + k là điểm (h, k).", answer: true, explain: "ĐÚNG — đây là dạng đỉnh, đỉnh I(h, k)." },
    { stmt: "Parabol y = x² − 4x + 5 cắt trục Ox tại 2 điểm phân biệt.", answer: false, explain: "SAI — Δ = 16 − 20 = −4 < 0, không cắt Ox (parabol nằm hoàn toàn phía trên Ox)." },
    { stmt: "Giá trị nhỏ nhất của y = 2(x−3)² + 1 là 1.", answer: true, explain: "ĐÚNG — a = 2 > 0, min = k = 1 tại x = 3." },
  ];

  const fillQuestions = [
    { id: "f1", template: "Trục đối xứng của y = 2x² − 8x + 3 là x = ___.", answer: "2", altAnswers: ["2"], hint: "x = −b/(2a) = 8/4 = ?" },
    { id: "f2", template: "Đỉnh của y = (x−2)² − 5 là I(___, ___).", answer: "2, -5", altAnswers: ["(2,-5)", "2,-5", "(2, -5)"], hint: "Dạng đỉnh a(x−h)²+k → đỉnh (h, k)." },
    { id: "f3", template: "Parabol y = −3x² + 6x mở ___ vì a = −3 ___ 0.", answer: "xuống, <", altAnswers: ["down, <", "xuong, <", "downward, <"], hint: "a âm → mở xuống." },
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        {/* ── Warm-Up ── */}
        <section id="khoiDong" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="🚀" title={t("Khởi động", "Warm-Up")} />
          <TheoryBlock>
            <div style={{ fontSize: 16, fontWeight: 600, color: "white", marginBottom: 8 }}>{t("Tình huống mở đầu", "Opening Situation")}</div>
            <div style={{ fontSize: 15, lineHeight: 1.85, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>
              {t("Một quả bóng được ném lên theo phương thẳng đứng. Độ cao h (mét) theo thời gian t (giây) có dạng: h(t) = −5t² + 20t + 1. Đây là một hàm số bậc hai. Đồ thị của nó là một parabol.", "A ball is thrown vertically. Height h (meters) vs time t (seconds): h(t) = −5t²+20t+1. This is a quadratic function. Its graph — a parabola — tells us speed, max height, fall time, etc.")}
            </div>
            <div style={{ fontSize: 15, color: "#a5b4fc", fontStyle: "italic" }}>
              ❓ {t("Đỉnh của parabol h(t) cho biết điều gì về quả bóng?", "What does the vertex of h(t) tell us about the ball?")}
            </div>
          </TheoryBlock>
        </section>

        {/* ── Video ── */}
        <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
          <div data-reveal>
            <LessonVideoPlayer videoId={videoId} subtitles={videoSubtitles} lang={lang} credit={t("Video từ Khan Academy (YouTube)", "Video by Khan Academy (YouTube)")} />
          </div>
        </section>

        {/* ── Definition ── */}
        <section id="khai1" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="📖" title={t("1. Hàm Số Bậc Hai", "1. Quadratic Function")} />
          <TheoryBlock>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#22d3ee", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 }}>📌 {t("Định nghĩa", "Definition")}</div>
            <div style={{ fontSize: 15.5, lineHeight: 1.85, color: "rgba(255,255,255,0.8)" }}>
              {t("Hàm số bậc hai là hàm số có dạng y = ax² + bx + c, trong đó a, b, c ∈ ℝ và a ≠ 0. Đồ thị là một parabol.", "A quadratic function has the form y = ax²+bx+c, where a, b, c ∈ ℝ and a ≠ 0. Its graph is a parabola.")}
            </div>
            <div style={{ marginTop: 10, fontSize: 14, color: "rgba(255,255,255,0.4)" }}>
              💡 {t("Tập xác định: D = ℝ (mọi x ∈ ℝ đều cho giá trị y xác định).", "Domain: D = ℝ (every x ∈ ℝ gives a defined y value).")}
            </div>
          </TheoryBlock>
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14 }}>
            {[["y = x²", "a=1, b=0, c=0"], ["y = −2x² + 4", "a=−2, b=0, c=4"], ["y = x² − 3x + 2", "a=1, b=−3, c=2"], ["y = 3(x−1)²", "a=3, b=−6, c=3"]].map(([expr, note], i) => (
              <div key={i} style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center" }}>
                <div style={{ fontFamily: "monospace", fontSize: 15, color: "#a5b4fc", marginBottom: 5, fontWeight: 700 }}>{expr}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>{note}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Vertex & Axis ── */}
        <section id="khai2" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="📐" title={t("2. Đỉnh và Trục Đối Xứng", "2. Vertex and Axis of Symmetry")} />
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
            <FormulaCard label={t("Hoành độ đỉnh", "x-coord of vertex")} formula="h = −b / (2a)" note={t("= trục đối xứng x = h", "= axis x = h")} />
            <FormulaCard label={t("Tung độ đỉnh", "y-coord of vertex")} formula="k = c − b²/(4a)" note={t("= f(h)", "= f(h)")} />
            <FormulaCard label={t("Trục đối xứng", "Axis of symmetry")} formula="x = −b/(2a)" note={t("Đường thẳng đứng", "Vertical line")} />
          </div>
          <TheoryBlock>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#22d3ee", marginBottom: 10 }}>📘 {t("Ví dụ: y = 2x² − 8x + 6", "Example: y = 2x²−8x+6")}</div>
            {["① a = 2, b = −8, c = 6", "② h = −(−8)/(2×2) = 8/4 = 2", "③ k = 2(4) − 8(2) + 6 = 8 − 16 + 6 = −2"].map((s, i) => (
              <div key={i} style={{ fontSize: 14.5, color: "rgba(255,255,255,0.7)", marginBottom: 5 }}>{s}</div>
            ))}
            <div style={{ marginTop: 10, padding: "10px 14px", background: "rgba(5,150,105,0.12)", border: "1px solid rgba(5,150,105,0.3)", borderRadius: 8, color: "#6ee7b7", fontSize: 14, fontWeight: 600 }}>
              ✅ {t("Đỉnh I(2, −2), trục đối xứng x = 2, parabol mở lên (a = 2 > 0)", "Vertex I(2,−2), axis x = 2, opens up (a = 2 > 0)")}
            </div>
          </TheoryBlock>
        </section>

        {/* ── Monotonicity ── */}
        <section id="khai3" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="📊" title={t("3. Sự Đơn Điệu", "3. Monotonicity")} />
          <div data-reveal style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {[
              { label: "a > 0", shape: t("Parabol mở lên ∪", "Parabola opens up ∪"), text1: t("↘ Nghịch biến trên (−∞, h)", "↘ Decreasing on (−∞, h)"), text2: t("↗ Đồng biến trên (h, +∞)", "↗ Increasing on (h, +∞)"), tag: t("Đỉnh là GTNN: y_min = k", "Vertex is MIN: y_min = k"), accentColor: "#059669", bgColor: "rgba(5,150,105,0.1)", borderColor: "rgba(5,150,105,0.25)" },
              { label: "a < 0", shape: t("Parabol mở xuống ∩", "Parabola opens down ∩"), text1: t("↗ Đồng biến trên (−∞, h)", "↗ Increasing on (−∞, h)"), text2: t("↘ Nghịch biến trên (h, +∞)", "↘ Decreasing on (h, +∞)"), tag: t("Đỉnh là GTLN: y_max = k", "Vertex is MAX: y_max = k"), accentColor: "#ef4444", bgColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.25)" },
            ].map((card, i) => (
              <div key={i} style={{ padding: 18, borderRadius: 12, background: card.bgColor, border: `1px solid ${card.borderColor}` }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: "white", marginBottom: 6 }}>{card.label}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>{card.shape}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{card.text1}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 12 }}>{card.text2}</div>
                <div style={{ padding: "8px 12px", background: card.bgColor, border: `1px solid ${card.borderColor}`, borderRadius: 8, fontSize: 13, color: card.accentColor, fontWeight: 700 }}>
                  🎯 {card.tag}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Graphing ── */}
        <section id="khai4" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="✏️" title={t("4. Vẽ Đồ Thị Parabol", "4. Graphing the Parabola")} />
          <TheoryBlock>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#22d3ee", marginBottom: 14 }}>📋 {t("5 bước vẽ đồ thị parabol", "5 steps to sketch a parabola")}</div>
            {[
              t("Xác định chiều mở: a > 0 → ∪, a < 0 → ∩", "Determine opening direction: a>0 → ∪, a<0 → ∩"),
              t("Tính đỉnh I(h, k) với h = −b/(2a)", "Find vertex I(h,k) with h = −b/(2a)"),
              t("Vẽ trục đối xứng x = h (đường nét đứt)", "Draw axis of symmetry x = h (dashed line)"),
              t("Tìm giao với trục Oy: x = 0 → y = c → điểm (0, c)", "Find y-intercept: x = 0 → y = c → point (0,c)"),
              t("Tìm giao với trục Ox (nếu có): giải ax²+bx+c = 0. Vẽ đường cong qua các điểm.", "Find x-intercepts (if any): solve ax²+bx+c = 0. Draw smooth curve."),
            ].map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
                <div style={{ minWidth: 28, height: 28, borderRadius: "50%", background: "rgba(99,102,241,0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, flexShrink: 0, color: "white" }}>{i + 1}</div>
                <div style={{ fontSize: 14.5, color: "rgba(255,255,255,0.75)", lineHeight: 1.7, paddingTop: 3 }}>{step}</div>
              </div>
            ))}
          </TheoryBlock>
        </section>

        {/* ── Practice ── */}
        <section id="thucHanh" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="📝" title={t("Thực Hành", "Practice Exercises")} />
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {[
              { id: "e1", q: t("Cho y = x² − 6x + 8.\n(a) Tìm đỉnh và trục đối xứng.\n(b) Parabol mở lên hay xuống?", "For y = x²−6x+8.\n(a) Find vertex and axis.\n(b) Does it open up or down?"), a: [t("h = 6/2 = 3, k = 9−18+8 = −1 → Đỉnh I(3, −1)", "h = 3, k = −1 → Vertex I(3,−1)"), t("Trục đối xứng: x = 3", "Axis: x = 3"), t("a = 1 > 0 → Mở lên, GTNN = −1 tại x = 3", "a = 1 > 0 → Opens up, MIN = −1 at x = 3")] },
              { id: "e2", q: t("Vẽ phác đồ thị y = −x² + 4x − 3.\nTìm giao điểm với các trục.", "Sketch y = −x²+4x−3.\nFind intersections with axes."), a: [t("a = −1 < 0 → mở xuống", "a < 0 → opens down"), t("h = 2, k = 1 → Đỉnh (2, 1)", "h = 2, k = 1 → Vertex (2,1)"), t("Giao Oy: (0,−3)\nGiao Ox: x=1, x=3", "y-intercept: (0,−3)\nx-intercepts: (1,0) and (3,0)")] },
              { id: "e3", q: t("Tìm giá trị lớn nhất/nhỏ nhất của y = 2x² − 4x + 5.", "Find max/min of y = 2x²−4x+5."), a: [t("a = 2 > 0 → parabol mở lên → hàm có GTNN", "a > 0 → opens up → has MINIMUM"), t("h = 1, k = 3\nGTNN = 3 tại x = 1. Không có GTLN.", "h = 1, k = 3\nMIN = 3 at x = 1. No maximum.")] },
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
      lessonSlug={lessonSlug}
      chapterTitle={chapterTitle}
      lessonTitle={lessonTitle}
      learningObjectives={learningObjectives}
      navItems={navItems}
      videoId="Hq2Up_1Ih5E"
      videoSubtitles={videoSubtitles}
      mcQuestions={mcQuestions}
      tfCards={tfCards}
      fillQuestions={fillQuestions}
      renderTheory={renderTheory}
    />
  );
}
