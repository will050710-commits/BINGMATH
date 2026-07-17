"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L9_C1_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L9-C1-L2";
  const chapterTitle = {
    vi: "Chương 1 · Grade 9",
    en: "Chapter 1 · Grade 9"
  };
  const lessonTitle = {
    vi: "Bài 2: Rút Gọn Biểu Thức Căn",
    en: "Lesson 2: Simplifying Radical Expressions"
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
    { q: t("Rút gọn biểu thức √18 + √8:", "Simplify √18 + √8:"), o: ["√26", "5", "5√2", "2√5"], a: 2, ex: t("√18 = 3√2, √8 = 2√2. Tổng: 5√2.", "√18 = 3√2, √8 = 2√2. Total: 5√2.") }
  ];

  const tfCards = [
    { s: t("√(x²) = x với mọi x.", "√(x²) = x for all x."), a: false, ex: t("SAI — √(x²) = |x|. Nếu x âm thì √(x²) = -x.", "FALSE — √(x²) = |x|. If x is negative, √(x²) = -x.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Trục căn thức: 1/(√2) = (√2) / ___", "Rationalize: 1/(√2) = (√2) / ___"), ans: "2", alt: ["hai"], hint: t("Nhân cả tử và mẫu với √2", "Multiply numerator and denominator by √2") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Để rút gọn các biểu thức chứa căn phức tạp, ta cần áp dụng các phép biến đổi như đưa thừa số ra ngoài/vào trong dấu căn, trục căn thức ở mẫu.", "To simplify complex radical expressions, we need to apply transformations like extracting/inserting factors, rationalizing denominators.")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("√(A²) bằng gì?", "What is √(A²) equal to?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Hằng đẳng thức √(A²) = |A|", "1. Identity √(A²) = |A|")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Với mọi đa thức A, √(A²) = |A|. Nếu A ≥ 0 thì |A| = A. Nếu A < 0 thì |A| = -A.", "For any expression A, √(A²) = |A|. If A ≥ 0, |A| = A. If A < 0, |A| = -A.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Đưa thừa số ra ngoài/vào trong căn", "2. Extracting/Inserting Factors")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("√(A²B) = |A|√B (với B ≥ 0). A√B = √(A²B) (với A ≥ 0, B ≥ 0).", "√(A²B) = |A|√B (with B ≥ 0). A√B = √(A²B) (with A ≥ 0, B ≥ 0).")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Trục căn thức ở mẫu", "3. Rationalizing Denominators")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Nhân cả tử và mẫu với biểu thức liên hợp để làm mất căn thức ở mẫu số.", "Multiply numerator and denominator by conjugate expression to eliminate radicals in denominator.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Simplify", "Rút gọn"], ["Conjugate", "Biểu thức liên hợp"], ["Rationalize", "Trục căn thức"]].map(([en, vi]) => (
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
