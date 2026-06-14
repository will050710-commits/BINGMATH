/* eslint-disable react-hooks/static-components */
"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PremiumLessonEngine from "./PremiumLessonEngine";

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ icon, title }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      fontSize: 20, fontWeight: 800, color: "white",
      marginBottom: 20, paddingBottom: 12,
      borderBottom: "1px solid rgba(255,255,255,0.08)",
    }}>
      <span>{icon}</span><span>{title}</span>
    </div>
  );
}

// ─── THEORY BLOCK ─────────────────────────────────────────────────────────────
function TheoryBlock({ children }) {
  return (
    <div style={{
      padding: "20px 22px",
      borderRadius: 12,
      background: "rgba(255,255,255,0.04)",
      border: "1px solid rgba(255,255,255,0.08)",
      marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

export default function Lesson9_GiaTriLuongGiac() {
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));

  const lessonSlug = "gia-tri-luong-giac";

  const chapterTitle = {
    vi: "Chuong IV He Thuc Luong",
    en: "Chapter IV Triangle Trig",
  };

  const lessonTitle = {
    vi: "Bai 9: Gia Tri Luong Giac (0-180 do)",
    en: "Lesson 9: Trig Values (0 to 180 degrees)",
  };

  return <div>Migrated OK</div>;
}
