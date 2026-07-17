"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L8_C4_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L8-C4-L2";
  const chapterTitle = {
    vi: "Chương 4 · Grade 8",
    en: "Chapter 4 · Grade 8"
  };
  const lessonTitle = {
    vi: "Bài 2: Hình Chóp & Hình Nón",
    en: "Lesson 2: Pyramids & Cones"
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
    { q: t("Hình chóp đáy vuông cạnh 6cm, cao 4cm. V=?", "Square pyramid with base 6cm, height 4cm. V=?"), o: ["48cm³", "72cm³", "96cm³", "144cm³"], a: 0, ex: t("V = (1/3)×6²×4 = (1/3)×144 = 48 cm³.", "V = (1/3)×6²×4 = (1/3)×144 = 48 cm³.") }
  ];

  const tfCards = [
    { s: t("V_nón = (1/3)πr²h.", "V_cone = (1/3)πr²h."), a: true, ex: t("ĐÚNG — Công thức thể tích hình nón.", "TRUE — The volume formula for a cone.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Nếu hình chóp có diện tích đáy là 30 và chiều cao là 5, thể tích là ___", "If a pyramid has base area 30 and height 5, its volume is ___"), ans: "50", alt: ["năm mươi"], hint: t("1/3 * 30 * 5", "1/3 * 30 * 5") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Kim tự tháp Ai Cập là hình chóp tứ giác khổng lồ. Để biết cần bao nhiêu đá, người Ai Cập cổ đại phải tính thể tích hình chóp. Cùng khám phá công thức này!", "The Egyptian pyramids are massive square pyramids. To know how much stone was needed, ancient Egyptians had to calculate pyramid volume. Let's explore this formula!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Hình nón giống hình chóp như thế nào? Khác ở điểm nào?", "How is a cone similar to a pyramid? How are they different?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Hình chóp", "1. Pyramids")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Hình chóp có một đáy đa giác và các mặt bên là tam giác hội tụ tại đỉnh. V = (1/3)×Sđáy×h.", "A pyramid has a polygon base and triangular side faces meeting at an apex. V = (1/3)×base area×h.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Diện tích xung quanh hình chóp", "2. Lateral Area of Pyramids")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Sxq = (1/2)×chu vi đáy×đường slant (l). Đường slant l = √(h² + r²) (hình chóp đều).", "Slat = (1/2)×base perimeter×slant height (l). Slant height l = √(h² + r²) (regular pyramid).")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Hình nón", "3. Cones")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Hình nón có đáy tròn bán kính r, chiều cao h, đường sinh l = √(r²+h²). Sxq = πrl. V = (1/3)πr²h.", "Cone has circular base radius r, height h, slant height l = √(r²+h²). Slat = πrl. V = (1/3)πr²h.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Pyramid", "Hình chóp"], ["Cone", "Hình nón"], ["Slant height", "Đường sinh"]].map(([en, vi]) => (
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
