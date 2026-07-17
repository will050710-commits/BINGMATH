"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L9_C4_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L9-C4-L1";
  const chapterTitle = {
    vi: "Chương 4 · Grade 9",
    en: "Chapter 4 · Grade 9"
  };
  const lessonTitle = {
    vi: "Bài 1: Đường Tròn & Tính Chất Cơ Bản",
    en: "Lesson 1: Circles & Basic Properties"
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
    { q: t("Đường tròn (O;5cm). Khoảng cách từ O đến điểm M = 3cm. M là:", "Circle (O;5cm). Distance from O to M = 3cm. M is:"), o: ["Nằm ngoài", "Nằm trên", "Nằm trong", "Là tâm"], a: 2, ex: t("3 < 5 = R → M nằm bên trong đường tròn.", "3 < 5 = R → M is inside the circle.") }
  ];

  const tfCards = [
    { s: t("Đường kính là bán kính nhân 2.", "Diameter equals radius times 2."), a: true, ex: t("ĐÚNG — D = 2R.", "TRUE — D = 2R.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Đường tròn bán kính R=5cm có đường kính bằng ___ cm", "A circle with radius R=5cm has diameter of ___ cm"), ans: "10", alt: ["mười"], hint: t("2 * R", "2 * R") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Bánh xe đạp là hình tròn. Mọi điểm trên vành đều cách trục bánh một khoảng bằng nhau — đó là bán kính. Tại sao bánh xe tròn lại lăn trơn mà bánh vuông thì không?", "A bicycle wheel is a circle. Every point on the rim is equally distant from the axle — that's the radius. Why does a round wheel roll smoothly but a square wheel doesn't?")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Đường kính có quan hệ gì với bán kính? Dây cung và cung tròn khác nhau thế nào?", "How is diameter related to radius? How are an arc and a chord different?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Định nghĩa đường tròn", "1. Circle Definition")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Đường tròn (O;R): tập hợp điểm cách O một khoảng = R. Điểm trong: d<R. Điểm ngoài: d>R. Đường kính D = 2R.", "Circle (O;R): set of points at distance R from O. Inside: d<R. Outside: d>R. Diameter D = 2R.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Dây cung và đường kính", "2. Chords and Diameters")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Dây cung AB: đoạn thẳng nối 2 điểm trên đường tròn. Đường kính là dây cung lớn nhất (qua tâm).", "Chord AB: line segment connecting 2 points on the circle. Diameter is the longest chord (through center).")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Tiếp tuyến đường tròn", "3. Tangent Lines")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Tiếp tuyến: đường thẳng chỉ tiếp xúc đường tròn tại 1 điểm. Tiếp tuyến ⊥ bán kính tại điểm tiếp xúc.", "Tangent: line touching circle at exactly 1 point. Tangent ⊥ radius at point of tangency.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Circle", "Đường tròn"], ["Radius", "Bán kính"], ["Tangent", "Tiếp tuyến"]].map(([en, vi]) => (
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
