"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L8_C2_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L8-C2-L1";
  const chapterTitle = {
    vi: "Chương 2 · Grade 8",
    en: "Chapter 2 · Grade 8"
  };
  const lessonTitle = {
    vi: "Bài 1: Phương Trình Bậc Nhất Một Ẩn",
    en: "Lesson 1: One-Variable Linear Equations"
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
    { q: t("Giải phương trình: 3x - 9 = 0", "Solve: 3x - 9 = 0"), o: ["x=1", "x=2", "x=3", "x=9"], a: 2, ex: t("3x=9 → x=3.", "3x=9 → x=3.") },
    { q: t("Giải: 2x + 5 = 13", "Solve: 2x + 5 = 13"), o: ["x=3", "x=4", "x=5", "x=9"], a: 1, ex: t("2x=8 → x=4.", "2x=8 → x=4.") }
  ];

  const tfCards = [
    { s: t("Phương trình bậc nhất có đúng một nghiệm.", "A linear equation has exactly one solution."), a: true, ex: t("ĐÚNG — ax+b=0 (a≠0) → x=-b/a là nghiệm duy nhất.", "TRUE — ax+b=0 (a≠0) → x=-b/a is the unique solution.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Nghiệm của phương trình 5x - 10 = 0 là x = ___", "The solution of 5x - 10 = 0 is x = ___"), ans: "2", alt: ["hai"], hint: t("5x = 10", "5x = 10") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Một cây cầu dài gấp đôi một con đường. Tổng cộng là 900m. Cây cầu dài bao nhiêu? Đặt x là độ dài con đường: x + 2x = 900. Đây là phương trình bậc nhất!", "A bridge is twice as long as a road. Together they are 900m. How long is the bridge? Let x = road length: x + 2x = 900. This is a linear equation!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Phương trình 3x + 5 = 14 có bao nhiêu nghiệm? Làm sao tìm?", "How many solutions does 3x + 5 = 14 have? How do you find them?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Định nghĩa phương trình", "1. Equation Definition")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Phương trình bậc nhất: ax + b = 0 (a≠0). Nghiệm: x = -b/a. Hai phương trình tương đương có cùng tập nghiệm.", "Linear equation: ax + b = 0 (a≠0). Solution: x = -b/a. Equivalent equations have the same solution set.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Giải phương trình", "2. Solving Equations")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Các bước: Chuyển vế (đổi dấu), thu gọn hai vế, chia cả hai vế cho hệ số của ẩn.", "Steps: Transpose (change sign), simplify both sides, divide both sides by the coefficient.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Bài toán có lời văn", "3. Word Problems")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Bước 1: Đặt ẩn (chọn x). Bước 2: Lập phương trình. Bước 3: Giải. Bước 4: Kiểm tra, trả lời.", "Step 1: Set variable (choose x). Step 2: Write equation. Step 3: Solve. Step 4: Check and answer.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Linear equation", "Phương trình bậc nhất"], ["Solution", "Nghiệm"], ["Transpose", "Chuyển vế"]].map(([en, vi]) => (
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
