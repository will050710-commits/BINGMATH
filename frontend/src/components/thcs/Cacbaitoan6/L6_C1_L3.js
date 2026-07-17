"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L6_C1_L3() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L6-C1-L3";
  const chapterTitle = {
    vi: "Chương 1 · Grade 6",
    en: "Chapter 1 · Grade 6"
  };
  const lessonTitle = {
    vi: "Bài 3: ƯCLN & BCNN",
    en: "Lesson 3: GCD & LCM"
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
    { q: t("ƯCLN(12, 18) =", "GCD(12, 18) ="), o: ["2", "3", "6", "12"], a: 2, ex: t("Ước chung của 12 và 18: 1, 2, 3, 6.", "Common divisors are 1, 2, 3, 6.") }
  ];

  const tfCards = [
    { s: t("BCNN của 4 và 6 là 24.", "LCM of 4 and 6 is 24."), a: false, ex: t("SAI — BCNN(4,6) = 12.", "FALSE — LCM(4,6) = 12.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("BCNN của 5 và 7 là ___", "LCM of 5 and 7 is ___"), ans: "35", alt: ["ba mươi lăm"], hint: t("5 và 7 nguyên tố cùng nhau", "5 and 7 are coprime") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Để chia đều 24 cái kẹo và 36 cái bánh vào các túi, số túi nhiều nhất có thể là bao nhiêu? Đó là bài toán ƯCLN!", "To divide 24 candies and 36 cakes equally into bags, what is the maximum number of bags? That's GCD!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Có thể tìm BCNN bằng cách nào nhanh nhất?", "What is the fastest way to find LCM?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Ước chung lớn nhất (ƯCLN)", "1. Greatest Common Divisor (GCD)")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("ƯCLN của hai hay nhiều số là số lớn nhất trong tập hợp các ước chung của chúng.", "GCD is the largest number that divides all given numbers without a remainder.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Bội chung nhỏ nhất (BCNN)", "2. Least Common Multiple (LCM)")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("BCNN của hai hay nhiều số là số nhỏ nhất khác 0 trong tập hợp các bội chung của chúng.", "LCM is the smallest non-zero positive integer that is a multiple of all given numbers.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Cách tìm nhanh", "3. Finding Methods")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Phân tích ra thừa số nguyên tố, chọn các thừa số chung và riêng với số mũ thích hợp.", "Factorize into primes, choose common and unique factors with correct exponents.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["GCD", "ƯCLN"], ["LCM", "BCNN"], ["Coprime", "Nguyên tố cùng nhau"]].map(([en, vi]) => (
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
