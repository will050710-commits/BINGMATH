"use client";
import { useParams } from "next/navigation";
import { getLessonData } from "@/data/lessonsData";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";
import { useState } from "react";
import { renderDuoIcon } from "@/components/DuoIcons";

export default function DynamicLessonPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [lang, setLang] = useState("vi");

  const lessonData = getLessonData(slug);
  
  if (!lessonData) {
    return (
      <div style={{
        background: "linear-gradient(160deg, #020c1b 0%, #0a1628 100%)",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
        fontFamily: "system-ui, sans-serif"
      }}>
        <div style={{ fontSize: 48, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{renderDuoIcon("🔍", { size: 48 })}</div>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Bài Học Không Tồn Tại</h2>
        <p style={{ color: "rgba(255,255,255,0.5)", margin: 0 }}>Không tìm thấy bài học có mã: <code>{slug}</code></p>
        <a href="/Cacbaitoan" style={{
          marginTop: 10,
          background: "#0ea5e9",
          color: "white",
          padding: "8px 20px",
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600,
          fontSize: 14,
          transition: "background 0.2s"
        }} onMouseEnter={e => e.currentTarget.style.background = "#0284c7"} onMouseLeave={e => e.currentTarget.style.background = "#0ea5e9"}>
          Quay lại danh sách
        </a>
      </div>
    );
  }

  return (
    <PremiumLessonEngine
      lessonSlug={slug}
      chapterTitle={lessonData.chapterTitle}
      lessonTitle={lessonData.lessonTitle}
      learningObjectives={lessonData.learningObjectives}
      navItems={lessonData.navItems}
      videoId={lessonData.videoId}
      videoSubtitles={lessonData.videoSubtitles}
      mcQuestions={lessonData.mcQuestions}
      tfCards={lessonData.tfCards}
      fillQuestions={lessonData.fillQuestions}
      renderTheory={lessonData.renderTheory}
      lang={lang}
      setLang={setLang}
    />
  );
}
