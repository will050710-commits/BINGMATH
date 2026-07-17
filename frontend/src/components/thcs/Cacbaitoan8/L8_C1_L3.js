"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L8_C1_L3() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L8-C1-L3";
  const chapterTitle = {
    vi: "Chương 1 · Grade 8",
    en: "Chapter 1 · Grade 8"
  };
  const lessonTitle = {
    vi: "Bài 3: Phân Thức Đại Số",
    en: "Lesson 3: Algebraic Fractions"
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
    { q: t("Phân thức (x - 1)/(x - 2) xác định khi:", "The fraction (x - 1)/(x - 2) is defined when:"), o: ["x ≠ 1", "x ≠ 2", "x ≠ 0", "x ≠ -2"], a: 1, ex: t("Mẫu số phải khác 0: x - 2 ≠ 0 ⟺ x ≠ 2.", "The denominator must be non-zero: x - 2 ≠ 0 ⟺ x ≠ 2.") }
  ];

  const tfCards = [
    { s: t("(x - 1)/x = x - 1.", "(x - 1)/x = x - 1."), a: false, ex: t("SAI — Không thể rút gọn x ở tử và mẫu như vậy.", "FALSE — You cannot cancel x like that.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Để phân thức A/B xác định thì đa thức B phải khác ___", "For fraction A/B to be defined, polynomial B must be different from ___"), ans: "0", alt: ["không"], hint: t("Đa thức không", "Zero polynomial") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Khi ta chia đa thức này cho đa thức kia, ta nhận được một phân thức đại số. Hãy cùng tìm hiểu định nghĩa và tính chất của nó!", "When we divide one polynomial by another, we get an algebraic fraction. Let's study its definition and properties!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Điều kiện xác định của một phân thức đại số là gì?", "What is the domain condition of an algebraic fraction?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Định nghĩa phân thức", "1. Definition of Fraction")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Biểu thức có dạng A/B, trong đó A và B là các đa thức, B khác đa thức 0.", "An expression of the form A/B, where A and B are polynomials, and B is not the zero polynomial.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Tính chất cơ bản", "2. Fundamental Properties")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Nhân hoặc chia cả tử và mẫu với cùng một đa thức khác 0 ta được phân thức bằng phân thức đã cho.", "Multiply or divide numerator and denominator by same non-zero polynomial to get equivalent fraction.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Rút gọn phân thức", "3. Simplification")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Phân tích tử và mẫu thành nhân tử rồi chia cả tử và mẫu cho nhân tử chung.", "Factor both numerator and denominator, then cancel the common factors.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Algebraic fraction", "Phân thức đại số"], ["Domain", "Điều kiện xác định"], ["Cancel", "Triệt tiêu / Rút gọn"]].map(([en, vi]) => (
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
