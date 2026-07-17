"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L9_C2_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L9-C2-L2";
  const chapterTitle = {
    vi: "Chương 2 · Grade 9",
    en: "Chapter 2 · Grade 9"
  };
  const lessonTitle = {
    vi: "Bài 2: Hàm Số Bậc Hai y = ax²",
    en: "Lesson 2: Quadratic Function y = ax²"
  };

  const learningObjectives = [
    { vi: "Hiểu kiến thức trọng tâm của bài học.", en: "Understand key concepts of the lesson." },
    { vi: "Luyện tập bài tập tương tác.", en: "Practice interactive exercises." }
  ];

  const navItems = [
    ["w", "🚀", "Khởi động", "Warm-up"],
    ["k1", "📖", "1. Khái niệm", "1. Concept"],
    ["k2", "📖", "2. Chi tiết", "2. Details"],
    ["k3", "📖", "3. Ứng dụng", "3. Applications"],
    ["miniGame", "🎮", "Luyện tập", "Practice"],
    ["trans", "🌐", "Từ điển", "Glossary"]
  ];

  const mcQuestions = [
    { q: t("Đồ thị y = -3x² mở về phía:", "The graph of y = -3x² opens:"), o: ["Phía trên", "Phía dưới", "Phải", "Trái"], a: 1, ex: t("a = -3 < 0 → parabol mở xuống.", "a = -3 < 0 → parabola opens downward.") }
  ];

  const tfCards = [
    { s: t("Đỉnh của đồ thị y = ax² luôn là điểm gốc tọa độ O(0,0).", "The vertex of y = ax² is always the origin O(0,0)."), a: true, ex: t("ĐÚNG — Vì đây là hàm bậc hai dạng đơn giản y = ax².", "TRUE — Since this is the simple quadratic form y = ax².") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Giá trị của y = 2x^2 tại x = 3 là ___", "The value of y = 2x^2 at x = 3 is ___"), ans: "18", alt: ["mười tám"], hint: t("2 * 3^2", "2 * 3^2") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Quả bóng ném lên không trung theo đường Parabol. Độ cao h(t) = -5t² + 20t. Đây là hàm số bậc hai! Đồ thị của nó là đường cong hình chữ U.", "A ball thrown upward follows a parabolic path. Height h(t) = -5t² + 20t. This is a quadratic function! Its graph is a U-shaped curve.")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("y = 2x² và y = -2x²: đồ thị khác nhau như thế nào? Khi nào parabol mở lên trên?", "y = 2x² vs y = -2x². How do their graphs differ? When does the parabola open upward?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Hàm số y = ax²", "1. Quadratic Function y = ax²")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("a > 0: parabol mở lên, đỉnh (0,0) là điểm nhỏ nhất. a < 0: mở xuống, đỉnh là điểm lớn nhất. |a| lớn → parabol hẹp hơn.", "a > 0: parabola opens up, vertex (0,0) is minimum. a < 0: opens down, vertex is maximum. Larger |a| → narrower parabola.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Tính chất hàm số bậc hai", "2. Properties of Quadratic Functions")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Đối xứng qua trục y. Với a>0: đồng biến x>0, nghịch biến x<0. Với a<0: ngược lại. y ≥ 0 khi a>0.", "Symmetric about y-axis. For a>0: increasing on x>0, decreasing on x<0. For a<0: opposite. y ≥ 0 when a>0.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Bảng giá trị và vẽ đồ thị", "3. Value Table & Graphing")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Lập bảng x=-2,-1,0,1,2 → tính y. Vẽ các điểm → nối mượt bằng đường cong.", "Make table for x=-2,-1,0,1,2 → calculate y. Plot points → connect smoothly with a curve.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Quadratic", "Bậc hai"], ["Parabola", "Parabol"], ["Vertex", "Đỉnh"]].map(([en, vi]) => (
            <div key={en} style={{ padding: "12px 16px", background: "rgba(20,184,166,0.06)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.15)" }}>
              <div style={{ fontWeight: 700, color: "#14b8a6", fontSize: 14 }}>{en}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 }}>{vi}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  return (
    <PremiumLessonEngine
      lessonSlug={lessonSlug}
      chapterTitle={chapterTitle}
      lessonTitle={lessonTitle}
      learningObjectives={learningObjectives}
      navItems={navItems}
      mcQuestions={mcQuestions}
      tfCards={tfCards}
      fillQuestions={fillQuestions}
      renderTheory={renderTheory}
      lang={lang}
      setLang={setLang}
    />
  );
}
