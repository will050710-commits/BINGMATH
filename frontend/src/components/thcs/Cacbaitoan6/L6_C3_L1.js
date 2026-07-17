"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L6_C3_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L6-C3-L1";
  const chapterTitle = {
    vi: "Chương 3 · Grade 6",
    en: "Chapter 3 · Grade 6"
  };
  const lessonTitle = {
    vi: "Bài 1: Phân Số & Rút Gọn",
    en: "Lesson 1: Fractions & Simplification"
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
    { q: t("Rút gọn phân số 18/24:", "Simplify 18/24:"), o: ["3/4", "2/3", "5/8", "9/12"], a: 0, ex: t("18 và 24 chia hết cho 6.", "18 and 24 are divisible by 6.") }
  ];

  const tfCards = [
    { s: t("Phân số 3/6 và 1/2 bằng nhau.", "Fractions 3/6 and 1/2 are equal."), a: true, ex: t("ĐÚNG — Cùng rút gọn về 1/2.", "TRUE — Both simplify to 1/2.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Tử số của phân số 5/9 là ___", "The numerator of 5/9 is ___"), ans: "5", alt: ["năm"], hint: t("Số ở trên", "The top number") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Bạn ăn 3 miếng pizza trong số 8 miếng. Bạn đã ăn 3/8 cái pizza. Nhưng nếu bạn ăn 4 trong 6 miếng, thì 4/6 = 2/3. Đây là rút gọn phân số!", "You eat 3 slices out of 8. You ate 3/8 of the pizza. But if you eat 4 out of 6 slices, 4/6 = 2/3. This is fraction simplification!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Làm thế nào để biết hai phân số có bằng nhau không?", "How can you tell if two fractions are equal?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Định nghĩa phân số", "1. Fraction Definition")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Phân số a/b (b≠0) biểu diễn a phần trong b phần bằng nhau. Tử số a, mẫu số b.", "Fraction a/b (b≠0) represents a parts out of b equal parts. Numerator a, denominator b.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Phân số bằng nhau", "2. Equivalent Fractions")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("a/b = c/d ⟺ a×d = b×c. Nhân/chia tử và mẫu cùng một số khác 0 → phân số bằng nhau.", "a/b = c/d ⟺ a×d = b×c. Multiply/divide both numerator and denominator by same nonzero number.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Rút gọn phân số", "3. Simplifying Fractions")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Chia cả tử và mẫu cho ƯCLN(tử, mẫu). Phân số tối giản khi ƯCLN = 1.", "Divide both numerator and denominator by GCD. Lowest terms when GCD = 1.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Numerator", "Tử số"], ["Denominator", "Mẫu số"], ["Simplify", "Rút gọn"]].map(([en, vi]) => (
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
