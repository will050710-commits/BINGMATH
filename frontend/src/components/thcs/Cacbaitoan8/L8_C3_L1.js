"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L8_C3_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L8-C3-L1";
  const chapterTitle = {
    vi: "Chương 3 · Grade 8",
    en: "Chapter 3 · Grade 8"
  };
  const lessonTitle = {
    vi: "Bài 1: Bất Phương Trình Bậc Nhất Một Ẩn",
    en: "Lesson 1: One-Variable Linear Inequalities"
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
    { q: t("Giải: 2x - 4 > 6:", "Solve: 2x - 4 > 6:"), o: ["x>1", "x>5", "x<5", "x>-5"], a: 1, ex: t("2x>10 → x>5.", "2x>10 → x>5.") }
  ];

  const tfCards = [
    { s: t("Nhân cả hai vế với -2 thì đổi chiều bất đẳng thức.", "Multiplying both sides by -2 reverses the inequality."), a: true, ex: t("ĐÚNG — Nhân/chia với số âm phải đổi chiều.", "TRUE — Multiplying/dividing by a negative number reverses the inequality.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Giải BPT: -2x < 6. Ta được x > ___", "Solve BPT: -2x < 6. We get x > ___"), ans: "-3", alt: ["âm ba"], hint: t("Chia cho -2 và đổi chiều", "Divide by -2 and reverse") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Giá vé tàu lửa tối thiểu 50,000đ. Bạn có x đồng. Điều kiện để đủ tiền mua vé: x ≥ 50,000. Đây là bất phương trình! Khác phương trình ở chỗ dấu = đổi thành <, >, ≤, ≥.", "Train ticket minimum price 50,000 VND. You have x VND. Condition to afford a ticket: x ≥ 50,000. This is an inequality! Unlike an equation, = becomes <, >, ≤, or ≥.")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Giải 2x + 3 > 7. Nghiệm là tất cả x thỏa mãn, biểu diễn trên trục số.", "Solve 2x + 3 > 7. The solution is all x that satisfy it, shown on a number line.")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Bất phương trình và nghiệm", "1. Inequalities & Solutions")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("BPT bậc nhất: ax + b > 0 (a≠0). Tập nghiệm là một khoảng. Ký hiệu: x > c hoặc x ≤ c.", "Linear inequality: ax + b > 0 (a≠0). Solution set is an interval. Notation: x > c or x ≤ c.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Quy tắc biến đổi BPT", "2. Inequality Transformation Rules")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Cộng/trừ cùng số → chiều bất đẳng thức không đổi. Nhân/chia số DƯƠNG → không đổi. Nhân/chia số ÂM → ĐỔI CHIỀU bất đẳng thức.", "Add/subtract same number → direction unchanged. Multiply/divide by POSITIVE → unchanged. Multiply/divide by NEGATIVE → REVERSE inequality direction.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Biểu diễn tập nghiệm", "3. Graphing Solution Sets")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Biểu diễn tập nghiệm trên trục số bằng nửa đường thẳng. Dấu ≤, ≥: điểm đầu tô đặc. Dấu <, >: điểm đầu để trống.", "Represent solution set on number line as a half-line. ≤, ≥: filled circle. <, >: open circle.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Inequality", "Bất phương trình"], ["Interval", "Khoảng"], ["Reverse", "Đổi chiều"]].map(([en, vi]) => (
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
