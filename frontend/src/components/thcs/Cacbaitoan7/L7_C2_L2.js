"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L7_C2_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L7-C2-L2";
  const chapterTitle = {
    vi: "Chương 2 · Grade 7",
    en: "Chapter 2 · Grade 7"
  };
  const lessonTitle = {
    vi: "Bài 2: Tỉ Lệ Thuận & Nghịch",
    en: "Lesson 2: Direct & Inverse Proportion"
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
    { q: t("Biết y tỉ lệ thuận với x, y=6 khi x=2. Khi x=5, y=?", "y is directly proportional to x. y=6 when x=2. When x=5, y=?"), o: ["10", "12", "15", "18"], a: 2, ex: t("k = y/x = 6/2 = 3. y = 3×5 = 15.", "k = y/x = 6/2 = 3. y = 3×5 = 15.") }
  ];

  const tfCards = [
    { s: t("Vận tốc và thời gian (quãng đường không đổi) tỉ lệ thuận.", "Speed and time (fixed distance) are directly proportional."), a: false, ex: t("SAI — v×t = s (hằng số) → tỉ lệ nghịch.", "FALSE — v×t = s (constant) → inverse proportion.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Nếu y tỉ lệ thuận với x theo hệ số k=3, thì x=2 cho y= ___", "If y is directly proportional to x with k=3, then x=2 yields y= ___"), ans: "6", alt: ["sáu"], hint: t("y = 3*x", "y = 3*x") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Nếu đi nhanh gấp đôi, thời gian đến nơi giảm còn một nửa. Nếu mua gấp đôi số hàng, tổng tiền tăng gấp đôi. Đây là hai loại tỉ lệ khác nhau!", "If you travel twice as fast, it takes half the time. If you buy twice the goods, the total cost doubles. These are two different types of proportion!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Vận tốc và thời gian (quãng đường không đổi) tỉ lệ thuận hay nghịch?", "Speed and time (fixed distance) — are they directly or inversely proportional?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Tỉ lệ thuận", "1. Direct Proportion")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("y tỉ lệ thuận với x: y = kx (k ≠ 0). Nếu x tăng k lần thì y tăng k lần. Ký hiệu y ∝ x.", "y is directly proportional to x: y = kx (k ≠ 0). If x multiplies by k, y multiplies by k. Notation y ∝ x.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Tỉ lệ nghịch", "2. Inverse Proportion")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("y tỉ lệ nghịch với x: y = k/x (k ≠ 0). Nếu x tăng k lần thì y giảm k lần. x×y = k = hằng số.", "y is inversely proportional to x: y = k/x (k ≠ 0). If x multiplies by k, y divides by k. x×y = k = constant.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Bài toán ứng dụng", "3. Applied Problems")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Xác định loại tỉ lệ → lập bảng → tìm hệ số k → tính toán. Lưu ý: Tỉ lệ thuận: y₁/y₂ = x₁/x₂; Tỉ lệ nghịch: y₁×x₁ = y₂×x₂.", "Identify proportion type → set up table → find k → calculate. Note: Direct: y₁/y₂ = x₁/x₂; Inverse: y₁×x₁ = y₂×x₂.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Direct proportion", "Tỉ lệ thuận"], ["Inverse proportion", "Tỉ lệ nghịch"], ["Constant", "Hằng số"]].map(([en, vi]) => (
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
