"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L6_C2_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L6-C2-L2";
  const chapterTitle = {
    vi: "Chương 2 · Grade 6",
    en: "Chapter 2 · Grade 6"
  };
  const lessonTitle = {
    vi: "Bài 2: Quy Tắc Dấu",
    en: "Lesson 2: Sign Rules"
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
    { q: t("(-3) × 4 = ?", "(-3) × 4 = ?"), o: ["-12", "12", "-7", "7"], a: 0, ex: t("Khác dấu → âm: 3×4 = 12, kết quả là -12.", "Different signs → negative: 3×4=12, result is -12.") },
    { q: t("(-5) × (-6) = ?", "(-5) × (-6) = ?"), o: ["-30", "30", "-11", "11"], a: 1, ex: t("Cùng dấu âm → dương: 5×6 = 30.", "Both negative → positive: 5×6=30.") }
  ];

  const tfCards = [
    { s: t("Tích của hai số nguyên âm luôn là số nguyên dương.", "The product of two negative integers is always positive."), a: true, ex: t("ĐÚNG — âm × âm = dương.", "TRUE — negative × negative = positive.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("(-2) nhân (-2) nhân (-2) = ___", "(-2) times (-2) times (-2) = ___"), ans: "-8", alt: [" âm tám"], hint: t("Mũ lẻ ra âm", "Odd power yields negative") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Khi tính điểm trong trò chơi, mỗi lần đúng được +5, mỗi lần sai bị -3. Nếu bạn sai 4 lần liên tiếp, bạn mất bao nhiêu điểm? Đây chính là bài toán nhân số nguyên âm!", "In a game, each correct answer gives +5, each wrong answer -3. If you get 4 wrong in a row, how many points do you lose? This is exactly the problem of multiplying negative integers!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Kết quả của (-3) × (-4) là dương hay âm? Vì sao?", "Is the result of (-3) × (-4) positive or negative? Why?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Nhân hai số nguyên", "1. Multiplying Two Integers")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("(+) × (+) = (+); (−) × (−) = (+); (+) × (−) = (−); (−) × (+) = (−). Hai số cùng dấu nhân nhau ra dương, khác dấu ra âm.", "(+)×(+)=(+); (−)×(−)=(+); (+)×(−)=(−); (−)×(+)=(−). Same signs → positive; different signs → negative.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Chia hai số nguyên", "2. Dividing Integers")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Quy tắc dấu khi chia giống hệt khi nhân. (+) ÷ (−) = (−); (−) ÷ (−) = (+).", "Division sign rules mirror multiplication. (+)÷(−)=(−); (−)÷(−)=(+).")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Lũy thừa số nguyên âm", "3. Powers of Negative Integers")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("(−a)^n = a^n nếu n chẵn (dương); (−a)^n = −a^n nếu n lẻ (âm). Ví dụ: (−2)⁴ = 16; (−2)³ = −8.", "(−a)^n = a^n if n is even (positive); (−a)^n = −a^n if n is odd (negative). Ex: (−2)⁴ = 16; (−2)³ = −8.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Product", "Tích"], ["Quotient", "Thương"], ["Power", "Lũy thừa"]].map(([en, vi]) => (
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
