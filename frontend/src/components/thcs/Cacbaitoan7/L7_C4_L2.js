"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L7_C4_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L7-C4-L2";
  const chapterTitle = {
    vi: "Chương 4 · Grade 7",
    en: "Chapter 4 · Grade 7"
  };
  const lessonTitle = {
    vi: "Bài 2: Cộng & Trừ Đa Thức",
    en: "Lesson 2: Adding & Subtracting Polynomials"
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
    { q: t("(2x + 3) + (4x - 1) = ?", "(2x + 3) + (4x - 1) = ?"), o: ["6x+4", "6x+2", "6x-2", "8x+2"], a: 1, ex: t("Nhóm: (2x+4x) + (3-1) = 6x + 2.", "Group: (2x+4x) + (3-1) = 6x + 2.") }
  ];

  const tfCards = [
    { s: t("Khi trừ đa thức, đổi dấu TẤT CẢ các hạng tử của đa thức trừ.", "When subtracting a polynomial, change ALL signs of the subtracted polynomial."), a: true, ex: t("ĐÚNG — -(a+b-c) = -a-b+c.", "TRUE — -(a+b-c) = -a-b+c.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("(3x^2) + (5x^2) = ___ x^2", "(3x^2) + (5x^2) = ___ x^2"), ans: "8", alt: ["tám"], hint: t("Cộng hệ số: 3 + 5", "Add coefficients: 3 + 5") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Chu vi mảnh vườn hình chữ nhật có chiều dài (3x+2) m và chiều rộng (x+4) m là: 2(3x+2) + 2(x+4) = 8x+12. Đây là cộng đa thức!", "Perimeter of a rectangle with length (3x+2) m and width (x+4) m: 2(3x+2) + 2(x+4) = 8x+12. This is polynomial addition!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Để cộng (3x² - 2x + 1) + (x² + 4x - 3), bạn phải nhóm những hạng tử nào?", "To add (3x² - 2x + 1) + (x² + 4x - 3), which terms do you group?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Cộng đa thức", "1. Adding Polynomials")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Nhóm các hạng tử đồng dạng rồi cộng. (2x² + 3x) + (x² - x + 5) = 3x² + 2x + 5.", "Group like terms then add. (2x² + 3x) + (x² - x + 5) = 3x² + 2x + 5.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Trừ đa thức", "2. Subtracting Polynomials")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Đổi dấu tất cả hạng tử của đa thức trừ rồi cộng. (5x² - 3) - (2x² + x - 1) = 3x² - x - 2.", "Change the sign of every term in the subtracted polynomial then add. (5x² - 3) - (2x² + x - 1) = 3x² - x - 2.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Sắp xếp đa thức", "3. Ordering Polynomials")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Sắp xếp theo bậc giảm dần: P(x) = 4x³ - 2x² + 0x + 7. Điền hệ số 0 cho hạng tử thiếu.", "Arrange by descending degree: P(x) = 4x³ - 2x² + 0x + 7. Fill in 0 for missing terms.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Like terms", "Hạng tử đồng dạng"], ["Simplify", "Thu gọn"], ["Sum", "Tổng"]].map(([en, vi]) => (
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
