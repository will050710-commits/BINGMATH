"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L7_C2_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L7-C2-L1";
  const chapterTitle = {
    vi: "Chương 2 · Grade 7",
    en: "Chapter 2 · Grade 7"
  };
  const lessonTitle = {
    vi: "Bài 1: Tỉ Lệ Thức",
    en: "Lesson 1: Ratios & Proportionality"
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
    { q: t("Tìm x biết: x/5 = 6/10", "Find x: x/5 = 6/10"), o: ["2", "3", "4", "6"], a: 1, ex: t("x×10 = 5×6 = 30, x = 3.", "x×10 = 5×6 = 30, x = 3.") }
  ];

  const tfCards = [
    { s: t("Nếu a/b = c/d thì a×d = b×c.", "If a/b = c/d then a×d = b×c."), a: true, ex: t("ĐÚNG — Đây là tính chất tích chéo của tỉ lệ thức.", "TRUE — This is the cross-multiplication property of proportions.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Tìm x biết: 4/x = 8/14, x = ___", "Find x: 4/x = 8/14, x = ___"), ans: "7", alt: ["bảy"], hint: t("Tích chéo: 4×14/8", "Cross multiply: 4×14/8") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Công thức pha sơn: 2 phần xanh : 3 phần trắng. Nếu bạn cần 12 lít xanh thì cần bao nhiêu lít trắng? Tỉ lệ thức giúp giải quyết bài toán này!", "Paint mixing ratio: 2 parts blue to 3 parts white. If you need 12 liters of blue, how much white do you need? Proportionality solves this!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("a/b = c/d thì a × d = b × c. Tại sao tích chéo bằng nhau?", "a/b = c/d means a × d = b × c. Why are cross-products equal?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Tỉ số và tỉ lệ thức", "1. Ratios & Proportions")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Tỉ số a:b = a/b (b≠0). Tỉ lệ thức a:b = c:d ⟺ a/b = c/d ⟺ a×d = b×c.", "Ratio a:b = a/b (b≠0). Proportion a:b = c:d ⟺ a/b = c/d ⟺ a×d = b×c.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Tính chất tỉ lệ thức", "2. Properties of Proportions")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Nếu a/b = c/d thì: (a+b)/b = (c+d)/d; a/(a+b) = c/(c+d); (a-b)/b = (c-d)/d.", "If a/b = c/d then: (a+b)/b = (c+d)/d; a/(a+b) = c/(c+d); (a-b)/b = (c-d)/d.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Dãy tỉ số bằng nhau", "3. Equal Ratio Chains")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("a/b = c/d = e/f = (a+c+e)/(b+d+f). Đây là tính chất dãy tỉ số bằng nhau.", "a/b = c/d = e/f = (a+c+e)/(b+d+f). This is the property of equal ratio chains.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Ratio", "Tỉ số"], ["Proportion", "Tỉ lệ thức"], ["Cross-multiplication", "Tích chéo"]].map(([en, vi]) => (
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
