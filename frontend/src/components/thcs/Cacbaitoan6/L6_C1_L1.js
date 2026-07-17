"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L6_C1_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L6-C1-L1";
  const chapterTitle = {
    vi: "Chương 1 · Grade 6",
    en: "Chapter 1 · Grade 6"
  };
  const lessonTitle = {
    vi: "Bài 1: Tập Hợp",
    en: "Lesson 1: Introduction to Sets"
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
    { q: t("Cho A = {2; 4; 6}. Phát biểu nào ĐÚNG?", "Let A = {2; 4; 6}. Which statement is TRUE?"), o: ["2 ∉ A", "5 ∈ A", "4 ∈ A", "A có 2 phần tử"], a: 2, ex: t("4 là phần tử nằm trong tập hợp A.", "4 is an element in set A.") },
    { q: t("Tập hợp B các số tự nhiên nhỏ hơn 5 là:", "Set B of natural numbers less than 5 is:"), o: ["{1; 2; 3; 4}", "{0; 1; 2; 3; 4}", "{0; 1; 2; 3; 4; 5}", "{1; 2; 3; 4; 5}"], a: 1, ex: t("Số tự nhiên bắt đầu từ 0.", "Natural numbers start from 0.") }
  ];

  const tfCards = [
    { s: t("Mọi tập hợp đều có ít nhất 1 phần tử.", "Every set has at least 1 element."), a: false, ex: t("SAI — Tập rỗng { } không có phần tử nào.", "FALSE — The empty set { } has no elements.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Tập rỗng kí hiệu là ___", "The empty set is symbolized by ___"), ans: "∅", alt: ["O", "empty"], hint: t("Kí hiệu tròn gạch chéo", "Circle with slash") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Khi bạn xếp các đồ dùng học tập lên bàn: bút, sách, thước, chúng tạo thành một tập hợp. Tập hợp là gì? Hãy cùng khám phá!", "When you place school items on the table: pens, books, rulers, they form a set. What is a set? Let's find out!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Một nhóm các học sinh cao trên 1m50 có phải là một tập hợp không?", "Is a group of students taller than 1.50m a set?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Khái niệm tập hợp", "1. Definition of a Set")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Tập hợp là nhóm các đối tượng được xác định rõ ràng. Mỗi đối tượng là một phần tử.", "A set is a well-defined collection of objects. Each object is called an element.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Kí hiệu thuộc và không thuộc", "2. Membership Symbols")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Kí hiệu ∈ chỉ phần tử thuộc tập hợp. Kí hiệu ∉ chỉ phần tử không thuộc tập hợp.", "The symbol ∈ denotes membership. The symbol ∉ denotes non-membership.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Cách mô tả tập hợp", "3. Describing a Set")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Có hai cách: Liệt kê các phần tử hoặc chỉ ra tính chất đặc trưng của các phần tử.", "Two ways: Listing the elements or specifying the characteristic property of the elements.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Set", "Tập hợp"], ["Element", "Phần tử"], ["Empty set", "Tập hợp rỗng"]].map(([en, vi]) => (
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
