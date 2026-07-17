"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L7_C3_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L7-C3-L1";
  const chapterTitle = {
    vi: "Chương 3 · Grade 7",
    en: "Chapter 3 · Grade 7"
  };
  const lessonTitle = {
    vi: "Bài 1: Thu Thập & Biểu Diễn Số Liệu",
    en: "Lesson 1: Data Collection & Representation"
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
    { q: t("Tần số là gì?", "What is frequency?"), o: ["Số lần giá trị xuất hiện", "Giá trị trung bình", "Tổng số liệu", "Giá trị nhỏ nhất"], a: 0, ex: t("Tần số là số lần xuất hiện của mỗi giá trị trong dãy số liệu.", "Frequency is the number of times each value appears in the dataset.") }
  ];

  const tfCards = [
    { s: t("Tổng tất cả tần số bằng cỡ mẫu n.", "The sum of all frequencies equals the sample size n."), a: true, ex: t("ĐÚNG — Σnₖ = n.", "TRUE — Σnₖ = n.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Cỡ mẫu n=20, tần số của giá trị x=5 là 4. Tần suất là ___ %", "Sample size n=20, frequency of value x=5 is 4. Relative frequency is ___ %"), ans: "20", alt: ["hai mươi"], hint: t("4/20 = 20%", "4/20 = 20%") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Lớp bạn có 30 học sinh, bạn muốn biết môn học yêu thích của mọi người. Bạn sẽ thu thập và trình bày dữ liệu đó như thế nào? Đây là bài học về thống kê!", "Your class has 30 students and you want to know everyone's favorite subject. How do you collect and present that data? This is a lesson in statistics!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Biểu đồ cột và biểu đồ hình tròn khác nhau như thế nào?", "How are bar charts and pie charts different?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Thu thập số liệu", "1. Collecting Data")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Dấu hiệu thống kê X. Giá trị của dấu hiệu: x₁, x₂,... Tần số nₖ là số lần giá trị xₖ xuất hiện.", "Statistical characteristic X. Values: x₁, x₂,... Frequency nₖ is how many times value xₖ appears.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Bảng phân phối tần số", "2. Frequency Distribution Table")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Bảng liệt kê giá trị và tần số tương ứng. Tổng tần số = n (cỡ mẫu). Tần suất fₖ = nₖ/n.", "Table listing values and corresponding frequencies. Sum of frequencies = n (sample size). Relative frequency fₖ = nₖ/n.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Biểu đồ thống kê", "3. Statistical Charts")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Biểu đồ cột: so sánh các nhóm. Biểu đồ đoạn thẳng: xu hướng theo thời gian. Biểu đồ hình tròn: tỉ lệ phần.", "Bar chart: compare groups. Line chart: trends over time. Pie chart: proportional parts.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Frequency", "Tần số"], ["Sample size", "Cỡ mẫu"], ["Bar chart", "Biểu đồ cột"]].map(([en, vi]) => (
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
