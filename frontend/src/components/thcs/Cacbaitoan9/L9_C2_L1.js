"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L9_C2_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L9-C2-L1";
  const chapterTitle = {
    vi: "Chương 2 · Grade 9",
    en: "Chapter 2 · Grade 9"
  };
  const lessonTitle = {
    vi: "Bài 1: Hàm Số Bậc Nhất",
    en: "Lesson 1: Linear Functions"
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
    { q: t("Hàm số nào sau đây đồng biến?", "Which of the following functions is increasing?"), o: ["y = -2x + 1", "y = 3x - 5", "y = -x", "y = 2 - 4x"], a: 1, ex: t("Hệ số góc a = 3 > 0 nên hàm đồng biến.", "Slope a = 3 > 0, so the function is increasing.") }
  ];

  const tfCards = [
    { s: t("Đồ thị hàm số y = ax + b đi qua gốc tọa độ khi b = 0.", "The graph of y = ax + b passes through the origin when b = 0."), a: true, ex: t("ĐÚNG — y = ax đi qua (0,0).", "TRUE — y = ax passes through (0,0).") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Hệ số góc của đường thẳng y = -5x + 3 là ___", "The slope of the line y = -5x + 3 is ___"), ans: "-5", alt: ["âm năm"], hint: t("Hệ số đứng trước x", "The coefficient of x") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Hàm số bậc nhất mô tả mối quan hệ tỉ lệ tuyến tính trong thực tế, ví dụ như tiền taxi theo số km. Đồ thị của nó là một đường thẳng.", "Linear functions describe linear relationships in real life, such as taxi fare based on kilometers. Its graph is a straight line.")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Khi nào hàm số bậc nhất đồng biến?", "When is a linear function increasing?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Định nghĩa", "1. Definition")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Hàm số bậc nhất có dạng y = ax + b, trong đó a và b là các số cho trước, a ≠ 0.", "A linear function is of the form y = ax + b, where a and b are given constants, a ≠ 0.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Tính biến thiên", "2. Monotonicity")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Hàm số y = ax + b đồng biến trên R khi a > 0, nghịch biến trên R khi a < 0.", "The function y = ax + b is increasing on R if a > 0, and decreasing on R if a < 0.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Hệ số góc", "3. Slope")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Hệ số a được gọi là hệ số góc của đường thẳng y = ax + b. Hệ số b là tung độ gốc.", "a is the slope of the line y = ax + b. b is the y-intercept.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Linear function", "Hàm số bậc nhất"], ["Slope", "Hệ số góc"], ["y-intercept", "Tung độ gốc"]].map(([en, vi]) => (
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
