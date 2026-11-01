"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";
import BilingualBlock from "@/components/clil/BilingualBlock";
import MathTermTrigger from "@/components/clil/MathTermTrigger";
import { L6_C1_L1_MANIFEST } from "@/content/clil/lessons/L6-C1-L1";
import { MATH_TERMS_CATALOG } from "@/content/clil/mathTerms";

const SH = ({ icon, title, segment, catalog }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#14b8a6", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span>
    <div style={{ flex: 1, minWidth: 0 }}>
      {segment ? (
        <BilingualBlock segment={segment} catalog={catalog} variant="heading" />
      ) : (
        <span>{title}</span>
      )}
    </div>
  </div>
);

export default function Lesson_L6_C1_L1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "L6-C1-L1";
  const chapterTitle = {
    vi: "Chương 1 · Lớp 6",
    en: "Chapter 1 · Grade 6"
  };
  const lessonTitle = {
    vi: "Bài 1: Tập Hợp",
    en: "Lesson 1: Introduction to Sets"
  };

  const learningObjectives = [
    { vi: "Hiểu khái niệm trọng tâm về tập hợp và các phần tử của tập hợp.", en: "Understand the core concept of a set and its elements." },
    { vi: "Luyện tập bài tập tương tác với kí hiệu thuộc và không thuộc.", en: "Practice interactive exercises using membership notation." }
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
    {
      id: "mc-1",
      q: t("Cho A = {2; 4; 6}. Phát biểu nào ĐÚNG?", "Let A = {2; 4; 6}. Which statement is TRUE?"),
      o: ["2 ∉ A", "5 ∈ A", "4 ∈ A", t("A có 2 phần tử", "A has 2 elements")],
      a: 2,
      ex: t("4 là phần tử nằm trong tập hợp A.", "4 is an element in set A.")
    },
    {
      id: "mc-2",
      q: t("Tập hợp B các số tự nhiên nhỏ hơn 5 là:", "Set B of natural numbers less than 5 is:"),
      o: ["{1; 2; 3; 4}", "{0; 1; 2; 3; 4}", "{0; 1; 2; 3; 4; 5}", "{1; 2; 3; 4; 5}"],
      a: 1,
      ex: t("Số tự nhiên bắt đầu từ 0.", "Natural numbers start from 0.")
    }
  ];

  const tfCards = [
    {
      id: "tf-1",
      s: t("Mọi tập hợp đều có ít nhất 1 phần tử.", "Every set has at least 1 element."),
      a: false,
      ex: t("SAI — Tập rỗng { } không có phần tử nào.", "FALSE — The empty set { } has no elements.")
    }
  ];

  const fillQuestions = [
    {
      id: "f1",
      template: t("Tập rỗng kí hiệu là ___", "The empty set is symbolized by ___"),
      ans: "∅",
      alt: ["O", "empty"],
      hint: t("Kí hiệu tròn gạch chéo (∅)", "Circle with a diagonal slash (∅)")
    }
  ];

  const seg = (id) => L6_C1_L1_MANIFEST.segments[id];

  const renderTheory = ({ t }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} segment={seg("sec.w.heading")} catalog={MATH_TERMS_CATALOG} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.88)", fontSize: 15 }}>
            <BilingualBlock segment={seg("sec.w.body")} catalog={MATH_TERMS_CATALOG} />
          </div>
          <div style={{ marginTop: 16, padding: 14, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <div style={{ color: "#14b8a6", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <span>💡</span>
              <BilingualBlock segment={seg("sec.w.callout.title")} catalog={MATH_TERMS_CATALOG} variant="inline" />
            </div>
            <div style={{ fontSize: 14.5 }}>
              <BilingualBlock segment={seg("sec.w.callout.body")} catalog={MATH_TERMS_CATALOG} variant="compact" />
            </div>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("1. Khái niệm tập hợp", "1. Definition of a Set")} segment={seg("sec.k1.heading")} catalog={MATH_TERMS_CATALOG} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div style={{ lineHeight: 1.75, fontSize: 15 }}>
            <BilingualBlock segment={seg("sec.k1.body")} catalog={MATH_TERMS_CATALOG} />
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("2. Kí hiệu thuộc và không thuộc", "2. Membership Symbols")} segment={seg("sec.k2.heading")} catalog={MATH_TERMS_CATALOG} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div style={{ lineHeight: 1.75, fontSize: 15 }}>
            <BilingualBlock segment={seg("sec.k2.body")} catalog={MATH_TERMS_CATALOG} />
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t("3. Cách mô tả tập hợp", "3. Describing a Set")} segment={seg("sec.k3.heading")} catalog={MATH_TERMS_CATALOG} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <div style={{ lineHeight: 1.75, fontSize: 15 }}>
            <BilingualBlock segment={seg("sec.k3.body")} catalog={MATH_TERMS_CATALOG} />
          </div>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} segment={seg("sec.trans.heading")} catalog={MATH_TERMS_CATALOG} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {L6_C1_L1_MANIFEST.termIds.map((termId) => {
            const term = MATH_TERMS_CATALOG[termId];
            if (!term) return null;
            return (
              <div
                key={term.id}
                data-testid={`glossary-card-${term.id}`}
                style={{
                  padding: "14px 16px",
                  background: "rgba(20,184,166,0.06)",
                  borderRadius: 10,
                  border: "1px solid rgba(20,184,166,0.18)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                  <MathTermTrigger
                    termId={term.id}
                    surface={term.en}
                    segmentId={`glossary.${term.id}`}
                    assessmentAllowsLookup={true}
                    interactiveParent={false}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {term.latex && (
                      <span style={{ fontSize: 12, fontFamily: "monospace", color: "#5eead4", background: "rgba(20,184,166,0.12)", padding: "1px 6px", borderRadius: 4 }}>
                        {term.latex}
                      </span>
                    )}
                    {term.ipa && (
                      <span style={{ fontSize: 12, fontFamily: "monospace", color: "rgba(148,163,184,0.85)" }}>
                        {term.ipa}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ color: "#6ee7b7", fontWeight: 600, fontSize: 13.5 }}>{term.vi}</div>
                <div style={{ color: "rgba(226,232,240,0.85)", fontSize: 12.5, lineHeight: 1.5 }}>
                  {term.definition.en}
                </div>
                <div style={{ color: "rgba(148,163,184,0.85)", fontSize: 12, lineHeight: 1.45 }}>
                  {term.definition.vi}
                </div>
              </div>
            );
          })}
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
      clilManifest={L6_C1_L1_MANIFEST}
      clilTermsCatalog={MATH_TERMS_CATALOG}
    />
  );
}
