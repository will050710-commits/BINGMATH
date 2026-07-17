"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L9_C4_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L9-C4-L2";
  const chapterTitle = {
    vi: "Chương 4 · Grade 9",
    en: "Chapter 4 · Grade 9"
  };
  const lessonTitle = {
    vi: "Bài 2: Góc Nội Tiếp & Tứ Giác Nội Tiếp",
    en: "Lesson 2: Inscribed Angles & Cyclic Quadrilaterals"
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
    { q: t("Góc tâm AOB = 80°. Góc nội tiếp AMB (M trên cung lớn):", "Central angle AOB = 80°. Inscribed angle AMB (M on major arc):"), o: ["80°", "40°", "160°", "20°"], a: 1, ex: t("Góc nội tiếp = (1/2)×góc tâm = 80°/2 = 40°.", "Inscribed angle = (1/2)×central angle = 80°/2 = 40°.") }
  ];

  const tfCards = [
    { s: t("Tứ giác nội tiếp có tổng hai góc đối = 180°.", "A cyclic quadrilateral has opposite angles summing to 180°."), a: true, ex: t("ĐÚNG — Tính chất đặc trưng của tứ giác nội tiếp.", "TRUE — Characteristic property of cyclic quadrilaterals.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Góc nội tiếp chắn nửa đường tròn bằng ___ độ", "An inscribed angle subtending a semicircle is ___ degrees"), ans: "90", alt: ["chín mươi"], hint: t("Góc vuông", "Right angle") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Nhìn từ hai điểm khác nhau trên cùng một bờ hồ về một cây cầu, bạn thấy góc cùng bằng nhau — đây là tính chất góc nội tiếp! Tất cả góc nội tiếp chắn cùng cung đều bằng nhau.", "Viewing a bridge from two different points on the same shore, you see equal angles — this is the inscribed angle theorem! All inscribed angles subtending the same arc are equal.")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Góc nội tiếp và góc tâm cùng chắn một cung có quan hệ gì?", "What is the relationship between an inscribed angle and a central angle subtending the same arc?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Góc nội tiếp", "1. Inscribed Angles")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Góc nội tiếp: góc có đỉnh trên đường tròn, hai cạnh là dây cung. Góc nội tiếp = (1/2) × góc tâm cùng chắn cung.", "Inscribed angle: vertex on circle, sides are chords. Inscribed angle = (1/2) × central angle subtending same arc.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Hệ quả góc nội tiếp", "2. Inscribed Angle Corollaries")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Các góc nội tiếp cùng chắn một cung thì bằng nhau. Góc nội tiếp chắn nửa đường tròn = 90° (góc Thales).", "Inscribed angles subtending the same arc are equal. Inscribed angle in a semicircle = 90° (Thales' theorem).")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Tứ giác nội tiếp", "3. Cyclic Quadrilaterals")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Tứ giác ABCD nội tiếp đường tròn nếu 4 đỉnh cùng nằm trên đường tròn. Hai góc đối bù nhau: A+C = B+D = 180°.", "Quadrilateral ABCD is cyclic if all 4 vertices lie on the circle. Opposite angles are supplementary: A+C = B+D = 180°.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Inscribed angle", "Góc nội tiếp"], ["Cyclic quadrilateral", "Tứ giác nội tiếp"], ["Semicircle", "Nửa đường tròn"]].map(([en, vi]) => (
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
