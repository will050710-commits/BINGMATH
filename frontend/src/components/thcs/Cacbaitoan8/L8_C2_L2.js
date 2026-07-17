"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L8_C2_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L8-C2-L2";
  const chapterTitle = {
    vi: "Chương 2 · Grade 8",
    en: "Chapter 2 · Grade 8"
  };
  const lessonTitle = {
    vi: "Bài 2: Phương Trình Chứa Ẩn Ở Mẫu",
    en: "Lesson 2: Equations with Variable Denominators"
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
    { q: t("ĐKXĐ của phương trình 1/x + 2/(x-3) = 5 là:", "Domain condition of 1/x + 2/(x-3) = 5:"), o: ["x≠0", "x≠3", "x≠0 và x≠3", "x≠-3"], a: 2, ex: t("Mẫu x≠0 và mẫu (x-3)≠0 → x≠3.", "Denominators x≠0 and (x-3)≠0 → x≠3.") }
  ];

  const tfCards = [
    { s: t("Luôn phải kiểm tra nghiệm so với ĐKXĐ.", "You must always check solutions against the domain condition."), a: true, ex: t("ĐÚNG — Nghiệm vi phạm ĐKXĐ là nghiệm ngoại lai.", "TRUE — Solutions violating the domain condition are extraneous.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Phương trình x/(x-1) = 1/(x-1) có ĐKXĐ là x khác ___", "The equation x/(x-1) = 1/(x-1) has domain x different from ___"), ans: "1", alt: ["một"], hint: t("Mẫu số x-1 khác 0", "Denominator x-1 not zero") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Khoảng cách 1/(x+1) + 1/(x-1) = 0. Nhìn thấy x ở mẫu? Bạn cần loại bỏ mẫu, nhưng phải kiểm tra điều kiện x ≠ ±1!", "The expression 1/(x+1) + 1/(x-1) = 0. See x in the denominator? You need to clear it, but must check the condition x ≠ ±1!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Tại sao phải tìm điều kiện xác định trước khi giải phương trình chứa ẩn ở mẫu?", "Why must you find the domain conditions before solving equations with variable denominators?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Điều kiện xác định", "1. Domain Conditions")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("ĐKXĐ: tập hợp giá trị x làm cho tất cả mẫu ≠ 0. Phải tìm ĐKXĐ trước khi giải.", "Domain condition (DC): set of x-values making all denominators ≠ 0. Must find DC before solving.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Quy trình giải", "2. Solution Process")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("1. Tìm ĐKXĐ. 2. Quy đồng mẫu. 3. Nhân hai vế với mẫu chung (khử mẫu). 4. Giải. 5. Kiểm tra.", "1. Find domain condition. 2. Find LCD. 3. Multiply both sides by LCD (clear denominators). 4. Solve. 5. Check.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Loại nghiệm ngoại lai", "3. Excluding Extraneous Solutions")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Nghiệm tìm được phải thỏa ĐKXĐ. Nếu vi phạm ĐKXĐ thì đó là nghiệm ngoại lai, loại bỏ.", "Solutions found must satisfy the domain condition. If they violate DC, they are extraneous solutions and must be rejected.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Domain", "Điều kiện xác định"], ["Extraneous", "Ngoại lai"], ["Denominator", "Mẫu số"]].map(([en, vi]) => (
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
