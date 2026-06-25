"use client";
import { useState } from "react";
import PremiumLessonEngine from "../Cacbaitoan10/PremiumLessonEngine";
import { getLessonData } from "@/data/lessonsData";

export default function L11_C2_L3() {
  const [lang, setLang] = useState("vi");
  const lessonSlug = "L11-C2-L3";
  const lessonData = getLessonData(lessonSlug);
  
  if (!lessonData) return <div style={{ color: "white", padding: 40 }}>Loading...</div>;

  return (
    <PremiumLessonEngine
      lessonSlug={lessonSlug}
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
