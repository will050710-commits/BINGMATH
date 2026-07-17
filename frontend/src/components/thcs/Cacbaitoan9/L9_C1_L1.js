"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L9_C1_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L9-C1-L1";
  const chapterTitle = {
    vi: "Chương 1 · Grade 9",
    en: "Chapter 1 · Grade 9"
  };
  const lessonTitle = {
    vi: "Bài 1: Căn Bậc Hai & Tính Chất",
    en: "Lesson 1: Square Roots & Properties"
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
    { q: t("Căn bậc hai số học của 9 là:", "The arithmetic square root of 9 is:"), o: ["3", "-3", "±3", "81"], a: 0, ex: t("Căn bậc hai số học luôn không âm, √9 = 3.", "The arithmetic square root is always non-negative, √9 = 3.") }
  ];

  const tfCards = [
    { s: t("Mọi số thực đều có căn bậc hai số học.", "Every real number has an arithmetic square root."), a: false, ex: t("SAI — Số âm không có căn bậc hai số học trong tập số thực.", "FALSE — Negative numbers have no real square roots.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Căn thức √(x - 3) xác định khi x ≥ ___", "The radical √(x - 3) is defined when x ≥ ___"), ans: "3", alt: ["ba"], hint: t("x - 3 >= 0", "x - 3 >= 0") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Phép toán ngược của bình phương là căn bậc hai. Căn bậc hai giúp ta tìm cạnh của một hình vuông khi biết diện tích của nó.", "The inverse operation of squaring is the square root. Square roots help us find the side of a square when its area is known.")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("√a xác định khi nào?", "Under what conditions is √a defined?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Khái niệm căn bậc hai", "1. Concept of Square Roots")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Căn bậc hai của số thực a không âm là số x sao cho x² = a. Số dương a có đúng hai căn bậc hai là √a và -√a.", "A square root of a non-negative real number a is a number x such that x² = a. A positive number a has two square roots: √a and -√a.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Căn bậc hai số học", "2. Arithmetic Square Root")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Kí hiệu √a biểu diễn căn bậc hai số học (không âm) của a. √a = x ⟺ (x ≥ 0 và x² = a).", "The symbol √a denotes the non-negative arithmetic square root of a. √a = x ⟺ (x ≥ 0 and x² = a).")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Điều kiện xác định", "3. Domain Condition")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Căn thức √A xác định (hay có nghĩa) khi A lấy giá trị không âm: A ≥ 0.", "The radical expression √A is defined (has meaning) when A is non-negative: A ≥ 0.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Square root", "Căn bậc hai"], ["Arithmetic", "Số học"], ["Radical", "Căn thức"]].map(([en, vi]) => (
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
