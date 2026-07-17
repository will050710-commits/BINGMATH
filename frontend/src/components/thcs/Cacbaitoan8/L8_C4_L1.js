"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_L8_C4_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L8-C4-L1";
  const chapterTitle = {
    vi: "Chương 4 · Grade 8",
    en: "Chapter 4 · Grade 8"
  };
  const lessonTitle = {
    vi: "Bài 1: Hình Lăng Trụ & Hình Hộp Chữ Nhật",
    en: "Lesson 1: Prisms & Rectangular Boxes"
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
    { q: t("Hình hộp chữ nhật 5×4×3cm. Thể tích:", "Rectangular box 5×4×3cm. Volume:"), o: ["30cm³", "40cm³", "60cm³", "120cm³"], a: 2, ex: t("V = 5×4×3 = 60 cm³.", "V = 5×4×3 = 60 cm³.") }
  ];

  const tfCards = [
    { s: t("Hình lập phương là trường hợp đặc biệt của hình hộp chữ nhật.", "A cube is a special case of a rectangular box."), a: true, ex: t("ĐÚNG — Hình hộp với a=b=c là hình lập phương.", "TRUE — A box with a=b=c is a cube.") }
  ];

  const fillQuestions = [
    { id: "f1", template: t("Thể tích hình lập phương cạnh 2cm là ___ cm³", "Volume of a cube with side 2cm is ___ cm³"), ans: "8", alt: ["tám"], hint: t("2^3", "2^3") }
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t("Một thùng carton dạng hình hộp chữ nhật dài 40cm, rộng 30cm, cao 20cm. Cần bao nhiêu giấy bìa để làm thùng? Bao nhiêu thể tích chứa được? Đây là bài toán hình học không gian!", "A cardboard box is 40cm long, 30cm wide, 20cm tall. How much cardboard is needed? What volume can it hold? This is a 3D geometry problem!")}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "#14b8a6", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t("Hình lăng trụ và hình hộp chữ nhật khác nhau thế nào?", "How are prisms and rectangular boxes different?")}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Hình hộp chữ nhật", "1. Rectangular Boxes (Cuboids)")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Diện tích xung quanh: Sxq = 2(a+b)×h. Diện tích toàn phần: Stp = Sxq + 2×a×b. Thể tích: V = a×b×h.", "Lateral area: Slat = 2(a+b)×h. Total surface area: Stot = Slat + 2×a×b. Volume: V = a×b×h.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Hình lăng trụ đứng", "2. Right Prisms")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Sxq = chu vi đáy × chiều cao. V = diện tích đáy × chiều cao. Hai đáy song song, bằng nhau.", "Lateral area = perimeter of base × height. V = base area × height. Two parallel equal bases.")}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Hình lập phương", "3. Cubes")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t("Hình lập phương: a=b=h=a. Stp = 6a². V = a³. Trường hợp đặc biệt của hình hộp chữ nhật.", "Cube: all sides equal a. Stot = 6a². V = a³. Special case of rectangular box.")}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Prism", "Lăng trụ"], ["Cube", "Lập phương"], ["Volume", "Thể tích"]].map(([en, vi]) => (
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
