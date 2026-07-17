"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L8_C2_L3() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L8-C2-L3";
  const chapterTitle = {
    vi: "Chương 2 · Grade 8",
    en: "Chapter 2 · Grade 8"
  };
  const lessonTitle = {
    vi: "Bài 3: Bài Toán Ứng Dụng Phương Trình",
    en: "Lesson 3: Applied Equation Problems"
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
    { q: t("Tàu A (60km/h) và B (80km/h) ngược chiều, cách 280km. Gặp sau:", "Ship A (60km/h) and B (80km/h) opposite direction, 280km apart. Meet after:"), o: ["2h", "2.5h", "3h", "3.5h"], a: 0, ex: t("(60+80)×t = 280 → t = 280/140 = 2h.", "(60+80)×t = 280 → t = 280/140 = 2h.") }
  ];

  const tfCards = [
    { s: t("Trong bài toán chuyển động, s = v × t.", "In motion problems, s = v × t."), a: true, ex: t("ĐÚNG — Quãng đường = vận tốc × thời gian.", "TRUE — Distance = speed × time.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Nếu hai số tự nhiên hơn kém nhau 5 và có tổng là 15, số bé là ___", "If two natural numbers differ by 5 and sum to 15, the smaller number is ___"), ans: "5", alt: ["năm"], hint: t("x + (x+5) = 15", "x + (x+5) = 15") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Tàu A và Tàu B khởi hành từ hai bến, cách nhau 240km, đi ngược chiều. Tàu A vận tốc 60 km/h, Tàu B 80 km/h. Sau bao lâu gặp nhau? Đây là bài toán chuyển động kinh điển!", "Ships A and B leave from ports 240km apart, heading toward each other. Ship A: 60 km/h, Ship B: 80 km/h. When do they meet? This is a classic motion problem!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Bước quan trọng nhất khi giải bài toán có lời văn bằng phương trình là gì?", "What is the most important step when solving a word problem using equations?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Phương pháp giải toán có lời văn", "1. Word Problem Method")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("B1: Đọc đề, tóm tắt. B2: Đặt ẩn, điều kiện. B3: Lập phương trình. B4: Giải. B5: Kiểm tra, kết luận.", "Step 1: Read & summarize. Step 2: Set variable & conditions. Step 3: Write equation. Step 4: Solve. Step 5: Check & conclude.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Bài toán chuyển động", "2. Motion Problems")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("v = s/t; s = v×t; t = s/v. Hai vật ngược chiều: s₁+s₂ = d. Cùng chiều đuổi nhau: s₁-s₂ = d.", "v = s/t; s = v×t; t = s/v. Opposite directions: s₁+s₂ = d. Same direction (chase): s₁-s₂ = d.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Bài toán số học & công việc", "3. Arithmetic & Work Problems")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Hai số hơn kém nhau k đơn vị: lớn - bé = k. Công việc: năng suất × thời gian = khối lượng.", "Two numbers differ by k: large - small = k. Work: rate × time = amount of work.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Motion", "Chuyển động"], ["Rate", "Năng suất"], ["Variable", "Ẩn số"]].map(([en, vi]) => (
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
