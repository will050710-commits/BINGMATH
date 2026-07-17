"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L9_C3_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L9-C3-L2";
  const chapterTitle = {
    vi: "Chương 3 · Grade 9",
    en: "Chapter 3 · Grade 9"
  };
  const lessonTitle = {
    vi: "Bài 2: Phương Trình Bậc Hai Một Ẩn",
    en: "Lesson 2: One-Variable Quadratic Equations"
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
    { q: t("Giải x² - 5x + 6 = 0:", "Solve x² - 5x + 6 = 0:"), o: ["x=2;x=3", "x=1;x=6", "x=-2;x=-3", "x=2;x=-3"], a: 0, ex: t("Δ=25-24=1. x=(5±1)/2 → x=3 hoặc x=2.", "Δ=25-24=1. x=(5±1)/2 → x=3 or x=2.") }
  ];

  const tfCards = [
    { s: t("Biệt thức Δ = b² - 4ac.", "The discriminant Δ = b² - 4ac."), a: true, ex: t("ĐÚNG — Đây là công thức biệt thức của PT bậc hai.", "TRUE — This is the discriminant formula for quadratic equations.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Nếu x^2 - 4x + 4 = 0, thì nghiệm kép x = ___", "If x^2 - 4x + 4 = 0, then the repeated root x = ___"), ans: "2", alt: ["hai"], hint: t("(x - 2)^2 = 0", "(x - 2)^2 = 0") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Diện tích hình chữ nhật là 12m², chiều dài hơn chiều rộng 1m. Gọi chiều rộng là x: x(x+1)=12 → x²+x-12=0. Đây là phương trình bậc hai!", "Rectangle area is 12m², length exceeds width by 1m. Let width = x: x(x+1)=12 → x²+x-12=0. This is a quadratic equation!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Phương trình bậc hai ax²+bx+c=0 có thể có 0, 1 hoặc 2 nghiệm. Điều gì quyết định số nghiệm?", "Quadratic ax²+bx+c=0 can have 0, 1, or 2 roots. What determines the number of roots?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Phương trình bậc hai", "1. Quadratic Equations")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("ax²+bx+c=0 (a≠0). Biệt thức Δ = b²-4ac. Δ>0: 2 nghiệm; Δ=0: 1 nghiệm kép; Δ<0: vô nghiệm thực.", "ax²+bx+c=0 (a≠0). Discriminant Δ = b²-4ac. Δ>0: 2 roots; Δ=0: 1 repeated root; Δ<0: no real roots.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Công thức nghiệm", "2. Quadratic Formula")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("x = (-b ± √Δ) / 2a = (-b ± √(b²-4ac)) / 2a.", "x = (-b ± √Δ) / 2a = (-b ± √(b²-4ac)) / 2a.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Hệ thức Viète", "3. Vieta's Formulas")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Nếu x₁, x₂ là nghiệm: x₁+x₂ = -b/a; x₁×x₂ = c/a.", "If x₁, x₂ are roots: x₁+x₂ = -b/a; x₁×x₂ = c/a.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Discriminant", "Biệt thức"], ["Repeated root", "Nghiệm kép"], ["Vieta's formulas", "Hệ thức Viète"]].map(([en, vi]) => (
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
