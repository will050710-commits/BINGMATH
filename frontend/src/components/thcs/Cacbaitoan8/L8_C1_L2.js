"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L8_C1_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L8-C1-L2";
  const chapterTitle = {
    vi: "Chương 1 · Grade 8",
    en: "Chapter 1 · Grade 8"
  };
  const lessonTitle = {
    vi: "Bài 2: Phân Tích Đa Thức Thành Nhân Tử",
    en: "Lesson 2: Polynomial Factorization"
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
    { q: t("Phân tích x² - 4x thành nhân tử:", "Factor x² - 4x:"), o: ["x(x - 4)", "x(x + 4)", "(x - 2)²", "(x - 2)(x + 2)"], a: 0, ex: t("Đặt x làm nhân tử chung: x(x - 4).", "Extract x as common factor: x(x - 4).") }
  ];

  const tfCards = [
    { s: t("Không phải đa thức nào cũng phân tích được thành nhân tử trên tập số thực.", "Not every polynomial can be factored over the real numbers."), a: true, ex: t("ĐÚNG — Ví dụ x² + 1 không thể phân tích tiếp.", "TRUE — E.g. x² + 1 cannot be factored further.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Phân tích x^2 - 25 = (x - 5)(x + ___)", "Factor x^2 - 25 = (x - 5)(x + ___)"), ans: "5", alt: ["năm"], hint: t("Hiệu hai bình phương", "Difference of squares") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Phân tích đa thức thành nhân tử là biến đổi một đa thức thành tích của những đa thức khác, giống như phân tích một số thành các thừa số nguyên tố.", "Polynomial factorization is transforming a polynomial into a product of other polynomials, similar to prime factorization.")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Tại sao phân tích thành nhân tử lại giúp giải phương trình dễ dàng hơn?", "Why does factoring help in solving equations?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Phương pháp đặt nhân tử chung", "1. Common Factor Method")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Tìm nhân tử chung của tất cả hạng tử rồi đưa ra ngoài dấu ngoặc: ab + ac = a(b+c).", "Find the common factor of all terms and extract it: ab + ac = a(b+c).")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Phương pháp dùng hằng đẳng thức", "2. Using Identities")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Áp dụng các hằng đẳng thức đáng nhớ để viết đa thức dưới dạng tích.", "Apply notable algebraic identities to express the polynomial as a product.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Phương pháp nhóm hạng tử", "3. Grouping Terms")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Nhóm các hạng tử thích hợp để làm xuất hiện nhân tử chung hoặc hằng đẳng thức.", "Group appropriate terms together to reveal common factors or identities.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Factorization", "Phân tích thành nhân tử"], ["Factor", "Nhân tử"], ["Grouping", "Nhóm hạng tử"]].map(([en, vi]) => (
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
