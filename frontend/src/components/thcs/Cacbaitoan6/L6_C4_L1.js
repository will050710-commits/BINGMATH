"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L6_C4_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L6-C4-L1";
  const chapterTitle = {
    vi: "Chương 4 · Grade 6",
    en: "Chapter 4 · Grade 6"
  };
  const lessonTitle = {
    vi: "Bài 1: Điểm, Đường Thẳng & Đoạn Thẳng",
    en: "Lesson 1: Points, Lines & Segments"
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
    { q: t("Cho AB = 12cm, M là trung điểm AB. AM = ?", "AB = 12cm, M is midpoint. AM = ?"), o: ["12cm", "6cm", "4cm", "3cm"], a: 1, ex: t("AM = AB/2 = 6cm.", "AM = AB/2 = 6cm.") }
  ];

  const tfCards = [
    { s: t("Tia và đoạn thẳng đều có hai đầu mút.", "Both rays and segments have two endpoints."), a: false, ex: t("SAI — Tia chỉ có một đầu mút (gốc).", "FALSE — A ray has only one endpoint (origin).") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Qua 2 điểm phân biệt vẽ được ___ đường thẳng.", "Through 2 distinct points we can draw ___ line(s)."), ans: "1", alt: ["một"], hint: t("Duy nhất", "Unique") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Một con kiến bò thẳng từ điểm A đến điểm B rồi tiếp tục sang C. Làm sao biết AB + BC = AC hay không? Đây là bài toán về đoạn thẳng cơ bản nhất!", "An ant walks straight from A to B then continues to C. How do you know if AB + BC = AC? This is the most fundamental problem about line segments!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Nếu M nằm giữa A và B thì AM + MB = AB. Điều này luôn đúng không?", "If M is between A and B then AM + MB = AB. Is this always true?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Điểm và đường thẳng", "1. Points and Lines")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Điểm là đối tượng cơ bản, không có kích thước. Đường thẳng trải dài vô tận hai phía. Qua 2 điểm phân biệt có đúng 1 đường thẳng.", "A point has no dimensions. A line extends infinitely in both directions. Through 2 distinct points there is exactly 1 line.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Đoạn thẳng và tia", "2. Segments and Rays")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Đoạn thẳng AB: phần giữa A và B (có 2 đầu mút). Tia Ox: xuất phát từ O qua x, kéo dài vô hạn về 1 phía.", "Segment AB: the part between A and B (has 2 endpoints). Ray Ox: starts at O, goes through x, extends infinitely in one direction.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Tính chất trung điểm", "3. Midpoint Properties")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("M là trung điểm của AB khi: M nằm giữa A, B và AM = MB = AB/2.", "M is the midpoint of AB when: M is between A and B, and AM = MB = AB/2.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Point", "Điểm"], ["Line", "Đường thẳng"], ["Segment", "Đoạn thẳng"]].map(([en, vi]) => (
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
