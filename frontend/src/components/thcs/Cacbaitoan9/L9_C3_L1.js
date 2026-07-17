"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L9_C3_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L9-C3-L1";
  const chapterTitle = {
    vi: "Chương 3 · Grade 9",
    en: "Chapter 3 · Grade 9"
  };
  const lessonTitle = {
    vi: "Bài 1: Hệ Phương Trình Bậc Nhất Hai Ẩn",
    en: "Lesson 1: Two-Variable Linear Systems"
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
    { q: t("Giải hệ: x+y=5; x-y=1:", "Solve: x+y=5; x-y=1:"), o: ["(2,3)", "(3,2)", "(4,1)", "(1,4)"], a: 1, ex: t("Cộng hai vế: 2x = 6 → x = 3. Thay vào: y = 2.", "Add: 2x = 6 → x = 3. Substitute: y = 2.") }
  ];

  const tfCards = [
    { s: t("Hai phương trình song song (cùng hệ số góc) → hệ vô nghiệm.", "Two parallel equations (same slope) → inconsistent system."), a: true, ex: t("ĐÚNG — Hai đường song song không giao nhau.", "TRUE — Parallel lines do not intersect.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Giải hệ: x + y = 3; x - y = 1. Nghiệm x = ___", "Solve: x + y = 3; x - y = 1. Solution x = ___"), ans: "2", alt: ["hai"], hint: t("Cộng hai vế ta được 2x = 4", "Add equations to get 2x = 4") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Mua 3 bút và 2 vở hết 28,000đ. Mua 1 bút và 4 vở hết 24,000đ. Hỏi giá mỗi loại? Đây cần hệ phương trình hai ẩn!", "3 pens + 2 notebooks cost 28,000 VND. 1 pen + 4 notebooks cost 24,000 VND. Find the price of each. This requires a two-variable system!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Hệ phương trình bậc nhất hai ẩn có bao nhiêu nghiệm? Khi nào vô nghiệm?", "How many solutions can a two-variable linear system have? When is it inconsistent?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Hệ phương trình bậc nhất hai ẩn", "1. Two-Variable Linear System")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Hệ: {ax+by=c; dx+ey=f}. Nghiệm là cặp (x₀, y₀) thỏa cả hai phương trình đồng thời.", "System: {ax+by=c; dx+ey=f}. Solution is pair (x₀, y₀) satisfying both equations simultaneously.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Phương pháp thế", "2. Substitution Method")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("B1: Biểu diễn một ẩn theo ẩn kia từ PT1. B2: Thế vào PT2. B3: Giải PT một ẩn. B4: Tính ẩn còn lại.", "Step 1: Express one variable from Eq 1. Step 2: Substitute into Eq 2. Step 3: Solve one-variable eq. Step 4: Find remaining variable.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Phương pháp cộng đại số", "3. Elimination Method")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Nhân các phương trình với hệ số phù hợp để triệt tiêu một ẩn. Cộng hai phương trình lại.", "Multiply equations by suitable coefficients to eliminate one variable. Add the equations.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["System of equations", "Hệ phương trình"], ["Substitution", "Thế"], ["Elimination", "Cộng đại số"]].map(([en, vi]) => (
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
