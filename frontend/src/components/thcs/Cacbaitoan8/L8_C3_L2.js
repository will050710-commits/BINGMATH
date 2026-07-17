"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L8_C3_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L8-C3-L2";
  const chapterTitle = {
    vi: "Chương 3 · Grade 8",
    en: "Chapter 3 · Grade 8"
  };
  const lessonTitle = {
    vi: "Bài 2: Giải & Biểu Diễn BPT",
    en: "Lesson 2: Solving & Graphing Inequalities"
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
    { q: t("Giải: 3x + 7 ≥ x + 15:", "Solve: 3x + 7 ≥ x + 15:"), o: ["x≥4", "x≤4", "x≥-4", "x≤8"], a: 0, ex: t("2x≥8 → x≥4.", "2x≥8 → x≥4.") }
  ];

  const tfCards = [
    { s: t("BPT x² > 0 có tập nghiệm là x > 0.", "Inequality x² > 0 has solution x > 0."), a: false, ex: t("SAI — x² > 0 khi x ≠ 0, nên tập nghiệm là x ≠ 0.", "FALSE — x² > 0 for all x ≠ 0, so solution set is x ≠ 0.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Tập nghiệm của x + 2 > 5 là x > ___", "The solution set of x + 2 > 5 is x > ___"), ans: "3", alt: ["ba"], hint: t("x > 5 - 2", "x > 5 - 2") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Nhiệt độ phải trên 0°C để nước không đóng băng. Bạn biết T > 0 — đây là bất phương trình! Hãy vẽ tập nghiệm lên trục số.", "Temperature must be above 0°C to keep water from freezing. You know T > 0 — this is an inequality! Let's graph the solution on a number line.")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Bất phương trình 2x + 1 ≥ 3x - 5 có tập nghiệm là gì?", "What is the solution set of 2x + 1 ≥ 3x - 5?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Phương pháp giải BPT", "1. Solving Inequality Steps")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("B1: Chuyển vế. B2: Thu gọn. B3: Chia cho hệ số (chú ý đổi chiều khi chia âm). B4: Biểu diễn.", "Step 1: Transpose. Step 2: Simplify. Step 3: Divide by coefficient (note reversal if negative). Step 4: Graph.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. BPT liên hợp", "2. Compound Inequalities")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("a < x < b biểu diễn đoạn mở. a ≤ x ≤ b biểu diễn đoạn đóng. Giải từng phần rồi giao nhau.", "a < x < b represents an open interval. a ≤ x ≤ b a closed interval. Solve each part then intersect.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Ứng dụng thực tế", "3. Real-World Applications")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Chi phí ≤ ngân sách: tổng chi phí ≤ M. Khoảng cách an toàn: d ≥ d_min. Điểm đỗ: điểm ≥ ngưỡng.", "Cost ≤ budget: total cost ≤ M. Safe distance: d ≥ d_min. Passing grade: score ≥ threshold.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Compound inequality", "BPT liên hợp"], ["Open interval", "Khoảng mở"], ["Closed interval", "Đoạn đóng"]].map(([en, vi]) => (
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
