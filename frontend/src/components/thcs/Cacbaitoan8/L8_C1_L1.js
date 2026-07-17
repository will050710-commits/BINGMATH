"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L8_C1_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L8-C1-L1";
  const chapterTitle = {
    vi: "Chương 1 · Grade 8",
    en: "Chapter 1 · Grade 8"
  };
  const lessonTitle = {
    vi: "Bài 1: Hằng Đẳng Thức Đáng Nhớ",
    en: "Lesson 1: Notable Algebraic Identities"
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
    { q: t("Khai triển (x + 2)² ta được:", "Expand (x + 2)²:"), o: ["x² + 4", "x² + 2x + 4", "x² + 4x + 4", "x² + 4x + 2"], a: 2, ex: t("(x+2)² = x² + 2*x*2 + 2² = x² + 4x + 4.", "(x+2)² = x² + 2*x*2 + 2² = x² + 4x + 4.") }
  ];

  const tfCards = [
    { s: t("(a - b)² = (b - a)².", "(a - b)² = (b - a)²."), a: true, ex: t("ĐÚNG — Vì (-x)² = x².", "TRUE — Since (-x)² = x².") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Khai triển: x^2 - 9 = (x - 3)(x + ___)", "Expand: x^2 - 9 = (x - 3)(x + ___)"), ans: "3", alt: ["ba"], hint: t("Hiệu hai bình phương", "Difference of squares") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Hằng đẳng thức giúp ta nhân nhanh các đa thức mà không cần nhân từng hạng tử. Hãy tìm hiểu 7 hằng đẳng thức đáng nhớ nhé!", "Algebraic identities allow us to multiply polynomials quickly without expanding term-by-term. Let's learn them!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("(a + b)² có bằng a² + b² không?", "Does (a + b)² equal a² + b²?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Bình phương của một tổng/hiệu", "1. Square of a Sum/Difference")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("(a+b)² = a² + 2ab + b². (a-b)² = a² - 2ab + b².", "(a+b)² = a² + 2ab + b². (a-b)² = a² - 2ab + b².")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Hiệu hai bình phương", "2. Difference of Two Squares")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("a² - b² = (a - b)(a + b). Rất hữu ích để phân tích thành nhân tử.", "a² - b² = (a - b)(a + b). Very useful for factoring.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Lập phương của một tổng/hiệu", "3. Cube of a Sum/Difference")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("(a+b)³ = a³ + 3a²b + 3ab² + b³. (a-b)³ = a³ - 3a²b + 3ab² - b³.", "(a+b)³ = a³ + 3a²b + 3ab² + b³. (a-b)³ = a³ - 3a²b + 3ab² - b³.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Identity", "Hằng đẳng thức"], ["Expansion", "Khai triển"], ["Square", "Bình phương"]].map(([en, vi]) => (
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
