"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L7_C4_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L7-C4-L1";
  const chapterTitle = {
    vi: "Chương 4 · Grade 7",
    en: "Chapter 4 · Grade 7"
  };
  const lessonTitle = {
    vi: "Bài 1: Đơn Thức & Đa Thức",
    en: "Lesson 1: Monomials & Polynomials"
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
    { q: t("Bậc của đơn thức 4x³y²:", "Degree of monomial 4x³y²:"), o: ["3", "2", "5", "6"], a: 2, ex: t("Bậc = 3+2 = 5.", "Degree = 3+2 = 5.") }
  ];

  const tfCards = [
    { s: t("Đa thức 3x² + 2x + 1 có 4 hạng tử.", "The polynomial 3x² + 2x + 1 has 4 terms."), a: false, ex: t("SAI — Nó có 3 hạng tử: 3x², 2x, 1.", "FALSE — It has 3 terms: 3x², 2x, 1.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Bậc của đa thức x^5 - 3x^2 + 1 là ___", "The degree of polynomial x^5 - 3x^2 + 1 is ___"), ans: "5", alt: ["năm"], hint: t("Mũ lớn nhất", "The largest exponent") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Diện tích hình chữ nhật có chiều dài (x+3) và chiều rộng 2 là 2(x+3) = 2x+6. Đây là một đa thức trong x! Đại số giúp ta biểu diễn bài toán tổng quát.", "Area of a rectangle with length (x+3) and width 2 is 2(x+3) = 2x+6. This is a polynomial in x! Algebra lets us express general problems.")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("2x² + 3x - 5: đây là đa thức bậc mấy? Có bao nhiêu hạng tử?", "2x² + 3x - 5: what degree is this polynomial? How many terms does it have?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Đơn thức", "1. Monomials")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Đơn thức là biểu thức đại số gồm 1 hạng tử: tích của số và các biến. Bậc = tổng số mũ. Ví dụ: -3x²y³ bậc 5.", "A monomial is an algebraic expression with one term: product of a number and variables. Degree = sum of exponents. E.g. -3x²y³ has degree 5.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Đa thức", "2. Polynomials")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Đa thức là tổng của nhiều đơn thức. Bậc của đa thức = bậc của hạng tử bậc cao nhất. 2x³ - 4x + 7 bậc 3.", "A polynomial is a sum of monomials. Degree = highest degree term. 2x³ - 4x + 7 has degree 3.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Đa thức một biến", "3. Single-Variable Polynomials")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("P(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀. Hệ số cao nhất aₙ ≠ 0. Hệ số tự do a₀.", "P(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀. Leading coefficient aₙ ≠ 0. Constant term a₀.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Monomial", "Đơn thức"], ["Polynomial", "Đa thức"], ["Degree", "Bậc"]].map(([en, vi]) => (
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
