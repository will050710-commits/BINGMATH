"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L6_C4_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L6-C4-L2";
  const chapterTitle = {
    vi: "Chương 4 · Grade 6",
    en: "Chapter 4 · Grade 6"
  };
  const lessonTitle = {
    vi: "Bài 2: Góc & Đo Góc",
    en: "Lesson 2: Angles & Measurement"
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
    { q: t("Góc có số đo 130° là góc gì?", "An angle measuring 130° is a(n):"), o: ["Góc nhọn", "Góc vuông", "Góc tù", "Góc bẹt"], a: 2, ex: t("90° < 130° < 180° → Góc tù.", "90° < 130° < 180° → Obtuse angle.") }
  ];

  const tfCards = [
    { s: t("Góc vuông có số đo bằng 90°.", "A right angle measures 90°."), a: true, ex: t("ĐÚNG — Đây là định nghĩa góc vuông.", "TRUE — This is the definition of a right angle.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Góc bẹt có số đo là ___ độ", "A straight angle measures ___ degrees"), ans: "180", alt: ["một trăm tám mươi"], hint: t("Bằng 2 lần góc vuông", "Twice a right angle") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Kim giờ và kim phút của đồng hồ tạo thành một góc. Lúc 3 giờ, góc đó là 90°. Lúc 6 giờ là 180°. Bạn có biết lúc mấy giờ góc là 0° không?", "The hour and minute hands of a clock form an angle. At 3 o'clock it's 90°. At 6 o'clock it's 180°. Can you find when the angle is 0°?")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Góc bẹt là 180°. Góc nào lớn hơn 90° nhưng nhỏ hơn 180°?", "A straight angle is 180°. What type of angle is greater than 90° but less than 180°?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Định nghĩa góc", "1. Angle Definition")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Góc xOy là hình gồm hai tia Ox và Oy có chung gốc O. O là đỉnh, Ox và Oy là hai cạnh.", "Angle xOy is formed by two rays Ox and Oy with common endpoint O. O is the vertex, Ox and Oy are the sides.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Các loại góc", "2. Types of Angles")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Góc nhọn: 0° < α < 90°. Góc vuông: α = 90°. Góc tù: 90° < α < 180°. Góc bẹt: α = 180°.", "Acute: 0° < α < 90°. Right: α = 90°. Obtuse: 90° < α < 180°. Straight: α = 180°.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Tia phân giác góc", "3. Angle Bisector")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Tia phân giác của góc xOy là tia Oz nằm giữa Ox, Oy và ∠xOz = ∠zOy = ∠xOy / 2.", "The angle bisector of xOy is ray Oz between Ox and Oy where ∠xOz = ∠zOy = ∠xOy / 2.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Angle", "Góc"], ["Vertex", "Đỉnh"], ["Obtuse", "Tù"]].map(([en, vi]) => (
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
