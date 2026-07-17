"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L7_C3_L2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L7-C3-L2";
  const chapterTitle = {
    vi: "Chương 3 · Grade 7",
    en: "Chapter 3 · Grade 7"
  };
  const lessonTitle = {
    vi: "Bài 2: Số Trung Bình Cộng, Mốt, Trung Vị",
    en: "Lesson 2: Mean, Mode & Median"
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
    { q: t("Dữ liệu: 4,6,3,8,4,7,4. Mốt là:", "Data: 4,6,3,8,4,7,4. Mode is:"), o: ["3", "4", "6", "7"], a: 1, ex: t("4 xuất hiện 3 lần, nhiều nhất.", "4 appears 3 times, the most.") }
  ];

  const tfCards = [
    { s: t("Trung vị chia dữ liệu đã sắp xếp thành hai nửa bằng nhau.", "The median divides sorted data into two equal halves."), a: true, ex: t("ĐÚNG — Đây là định nghĩa trung vị.", "TRUE — This is the definition of median.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Trung bình cộng của 3, 5, 7 là ___", "The mean of 3, 5, 7 is ___"), ans: "5", alt: ["năm"], hint: t("(3+5+7)/3", "(3+5+7)/3") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Điểm của 5 bài kiểm tra: 7, 8, 6, 9, 7. Điểm trung bình là bao nhiêu? Điểm nào xuất hiện nhiều nhất? Điểm ở giữa sau khi sắp xếp là gì?", "Scores from 5 tests: 7, 8, 6, 9, 7. What is the average? Which score appears most? What is the middle value after sorting?")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Khi nào nên dùng trung vị thay vì trung bình cộng để đại diện cho dữ liệu?", "When should you use median instead of mean to represent data?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Số trung bình cộng (Mean)", "1. Arithmetic Mean")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("x̄ = (x₁+x₂+...+xₙ)/n = Σ(xᵢ×nᵢ)/n (với bảng phân phối tần số).", "x̄ = (x₁+x₂+...+xₙ)/n = Σ(xᵢ×nᵢ)/n (with frequency distribution).")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Mốt (Mode)", "2. Mode")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Mốt M₀ là giá trị xuất hiện nhiều nhất. Dữ liệu có thể có 1, nhiều hoặc không có mốt.", "Mode M₀ is the most frequent value. Data may have one, multiple, or no mode.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Trung vị (Median)", "3. Median")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Sắp xếp tăng dần. Nếu n lẻ: trung vị = phần tử giữa. Nếu n chẵn: trung vị = trung bình 2 phần tử giữa.", "Sort ascending. If n is odd: median = middle element. If n is even: median = average of 2 middle elements.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Mean", "Số trung bình cộng"], ["Mode", "Mốt"], ["Median", "Trung vị"]].map(([en, vi]) => (
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
