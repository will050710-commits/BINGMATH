"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L7_C4_L3() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L7-C4-L3";
  const chapterTitle = {
    vi: "Chương 4 · Grade 7",
    en: "Chapter 4 · Grade 7"
  };
  const lessonTitle = {
    vi: "Bài 3: Nghiệm Của Đa Thức",
    en: "Lesson 3: Roots of Polynomials"
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
    { q: t("P(x) = 2x - 6. Nghiệm của P(x) là:", "P(x) = 2x - 6. Root of P(x) is:"), o: ["x=1", "x=3", "x=6", "x=2"], a: 1, ex: t("2x-6=0 → x=3.", "2x-6=0 → x=3.") }
  ];

  const tfCards = [
    { s: t("Đa thức bậc n có nhiều nhất n nghiệm.", "A degree-n polynomial has at most n roots."), a: true, ex: t("ĐÚNG — Đây là Định lý nghiệm của đa thức.", "TRUE — This is the Polynomial Root Theorem.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Nghiệm của đa thức x + 9 là ___", "The root of the polynomial x + 9 is ___"), ans: "-9", alt: ["âm chín"], hint: t("x + 9 = 0", "x + 9 = 0") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Nhiệt độ theo giờ mô tả bởi P(t) = -t² + 6t - 5. Hỏi vào lúc mấy giờ nhiệt độ bằng 0? Đây là bài toán tìm nghiệm đa thức!", "Temperature over hours modeled by P(t) = -t² + 6t - 5. At what times is the temperature 0? This is a polynomial root problem!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Nếu P(a) = 0 thì a là nghiệm của P. Đa thức bậc n có nhiều nhất bao nhiêu nghiệm?", "If P(a) = 0, then a is a root of P. At most how many roots does a degree-n polynomial have?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Giá trị đa thức", "1. Polynomial Values")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Giá trị của P(x) tại x=a ký hiệu P(a): thay x=a vào đa thức và tính. P(x)=3x-2 → P(1)=1, P(2)=4.", "Value of P(x) at x=a, written P(a): substitute x=a and calculate. P(x)=3x-2 → P(1)=1, P(2)=4.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Nghiệm của đa thức", "2. Roots of Polynomials")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("a là nghiệm của P(x) nếu P(a) = 0. Đa thức bậc n có nhiều nhất n nghiệm thực.", "a is a root of P(x) if P(a) = 0. A degree-n polynomial has at most n real roots.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Tìm nghiệm đơn giản", "3. Finding Simple Roots")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Với đa thức bậc 1: ax + b = 0 → x = -b/a. Với bậc 2: dùng công thức nghiệm hoặc nhẩm.", "For degree 1: ax + b = 0 → x = -b/a. For degree 2: use quadratic formula or inspection.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Root", "Nghiệm"], ["Evaluate", "Tính giá trị"], ["Theorem", "Định lý"]].map(([en, vi]) => (
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
