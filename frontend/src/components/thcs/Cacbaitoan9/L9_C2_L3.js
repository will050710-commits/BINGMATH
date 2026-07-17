"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L9_C2_L3() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L9-C2-L3";
  const chapterTitle = {
    vi: "Chương 2 · Grade 9",
    en: "Chapter 2 · Grade 9"
  };
  const lessonTitle = {
    vi: "Bài 3: Vẽ & Đọc Đồ Thị Hàm Số",
    en: "Lesson 3: Graphing & Reading Functions"
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
    { q: t("Điểm (3, -2) nằm trên đồ thị → f(3) = ?", "Point (3, -2) is on the graph → f(3) = ?"), o: ["3", "-3", "2", "-2"], a: 3, ex: t("Điểm (a, b) trên đồ thị có nghĩa f(a) = b, nên f(3) = -2.", "Point (a, b) on graph means f(a) = b, so f(3) = -2.") }
  ];

  const tfCards = [
    { s: t("Mỗi điểm trên đồ thị y=f(x) có tọa độ (x, f(x)).", "Every point on the graph y=f(x) has coordinates (x, f(x))."), a: true, ex: t("ĐÚNG — Định nghĩa đồ thị hàm số.", "TRUE — Definition of the graph of a function.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Giao điểm của y = 2x - 4 với trục tung Oy có tung độ bằng ___", "The y-intercept of y = 2x - 4 has y-coordinate of ___"), ans: "-4", alt: ["âm bốn"], hint: t("Cho x = 0", "Set x = 0") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Nhiệt độ thay đổi theo giờ trong một ngày có thể biểu diễn bằng đồ thị. Đọc được đồ thị giúp bạn biết nhiều thông tin nhanh hơn đọc bảng số liệu!", "Temperature changes throughout the day can be shown as a graph. Reading graphs gives you information faster than reading a table!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Nhìn vào đồ thị, làm sao biết hàm số đồng biến hay nghịch biến tại một khoảng?", "From a graph, how can you tell if a function is increasing or decreasing on an interval?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Đọc thông tin từ đồ thị", "1. Reading Graph Information")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Điểm (a, b) trên đồ thị → f(a) = b. Hàm đồng biến: đồ thị đi lên từ trái sang phải. Nghịch biến: đi xuống.", "Point (a, b) on graph → f(a) = b. Increasing: graph goes up left to right. Decreasing: goes down.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Giao điểm với trục", "2. Intercepts")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Giao với trục Ox (y=0): nghiệm của hàm. Giao với trục Oy (x=0): giá trị f(0). Tọa độ giao điểm.", "Intersection with Ox (y=0): zeros of the function. Intersection with Oy (x=0): value f(0). Coordinates of intercepts.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Vẽ đồ thị", "3. Drawing Graphs")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("B1: Lập bảng giá trị. B2: Vẽ hệ trục tọa độ. B3: Đánh dấu các điểm. B4: Nối mượt (cong hoặc thẳng).", "Step 1: Make value table. Step 2: Draw coordinate axes. Step 3: Plot points. Step 4: Connect smoothly (curve or line).")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Intercept", "Giao điểm"], ["Coordinate", "Tọa độ"], ["Curve", "Đường cong"]].map(([en, vi]) => (
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
