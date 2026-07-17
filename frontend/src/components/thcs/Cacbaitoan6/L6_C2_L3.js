"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L6_C2_L3() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L6-C2-L3";
  const chapterTitle = {
    vi: "Chương 2 · Grade 6",
    en: "Chapter 2 · Grade 6"
  };
  const lessonTitle = {
    vi: "Bài 3: Bội & Ước của Số Nguyên",
    en: "Lesson 3: Multiples & Divisors"
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
    { q: t("Số nào sau đây là ước của 30?", "Which is a divisor of 30?"), o: ["7", "8", "9", "6"], a: 3, ex: t("30 ÷ 6 = 5 dư 0, nên 6 là ước của 30.", "30 ÷ 6 = 5 remainder 0, so 6 is a divisor of 30.") }
  ];

  const tfCards = [
    { s: t("Số 0 là bội của mọi số nguyên khác 0.", "0 is a multiple of every nonzero integer."), a: true, ex: t("ĐÚNG — 0 = a × 0 với mọi a ≠ 0.", "TRUE — 0 = a × 0 for all a ≠ 0.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Số ước tự nhiên của 6 là ___", "The number of natural divisors of 6 is ___"), ans: "4", alt: ["bốn"], hint: t("Các ước là 1, 2, 3, 6.", "The divisors are 1, 2, 3, 6.") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Bạn xếp 24 cái kẹo vào các túi đều nhau. Bạn có thể xếp thành 2 túi, 3 túi, 4 túi, 6 túi hoặc 8 túi. Những số 2,3,4,6,8 chính là các ước của 24!", "You arrange 24 candies into equal bags. You can make 2, 3, 4, 6 or 8 bags. The numbers 2, 3, 4, 6, 8 are exactly the divisors of 24!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Số 12 có bao nhiêu ước? Hãy liệt kê tất cả.", "How many divisors does 12 have? List them all.")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Khái niệm bội và ước", "1. Multiples & Divisors Concepts")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Số nguyên a là bội của b nếu a ÷ b có dư bằng 0. Khi đó b là ước của a. Ký hiệu: b | a.", "Integer a is a multiple of b if a ÷ b has remainder 0. Then b is a divisor of a. Notation: b | a.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Tìm ước và bội", "2. Finding Divisors & Multiples")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Ước của 12: ±1, ±2, ±3, ±4, ±6, ±12. Bội của 3: 0, ±3, ±6, ±9, ±12, ...", "Divisors of 12: ±1, ±2, ±3, ±4, ±6, ±12. Multiples of 3: 0, ±3, ±6, ±9, ±12, ...")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Tính chất chia hết", "3. Divisibility Properties")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Nếu a⋮m và b⋮m thì (a+b)⋮m và (a−b)⋮m. Nếu a⋮b và b⋮c thì a⋮c.", "If a|m and b|m then (a+b)|m and (a−b)|m. If a|b and b|c then a|c.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Divisor", "Ước"], ["Multiple", "Bội"], ["Divisibility", "Tính chia hết"]].map(([en, vi]) => (
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
