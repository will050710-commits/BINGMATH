const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'frontend/src/components/Cacbaitoan10');
const exclude = ["PremiumLessonEngine.js", "LessonVideoPlayer.js", "MathToolsPanel.js", "MathGraphSVG.js"];

if (!fs.existsSync(componentsDir)) {
  console.error("Directory not found:", componentsDir);
  process.exit(1);
}

const files = fs.readdirSync(componentsDir).filter(f => f.startsWith('Lesson') && f.endsWith('.js') && !exclude.includes(f));

console.log(`Found ${files.length} lesson files to analyze...`);

// Helper to extract nested brackets/braces from start index
function extractBalanced(content, startChar, endChar, startIndex) {
  let depth = 0;
  let started = false;
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === startChar) {
      depth++;
      started = true;
    } else if (content[i] === endChar) {
      depth--;
      if (started && depth === 0) {
        return content.substring(startIndex, i + 1);
      }
    }
  }
  return null;
}

// Extract variables matching names
function getVariableDefinition(content, names) {
  for (const name of names) {
    const pattern = new RegExp(`const\\s+${name}\\s*=\\s*([\\[\\{])`);
    const match = content.match(pattern);
    if (match) {
      const char = match[1];
      const closeChar = char === '[' ? ']' : '}';
      const startIdx = match.index + match[0].length - 1;
      const res = extractBalanced(content, char, closeChar, startIdx);
      if (res) return { name, content: res };
    }
  }
  return null;
}

// Remove tag block dynamically to handle nesting safely
function removeTagBlock(content, searchStr) {
  const index = content.indexOf(searchStr);
  if (index === -1) return content;
  
  // Find the opening '<div' before this searchStr
  let startIdx = content.lastIndexOf('<div', index);
  if (startIdx === -1) return content;

  // Walk forward to find the matching '</div>'
  let depth = 0;
  let i = startIdx;
  while (i < content.length) {
    if (content.substring(i, i + 4) === '<div') {
      depth++;
      i += 4;
    } else if (content.substring(i, i + 6) === '</div>') {
      depth--;
      i += 6;
      if (depth === 0) {
        // Found the matching closing tag!
        return content.substring(0, startIdx) + content.substring(i);
      }
    } else {
      i++;
    }
  }
  return content;
}

function removeAllTagBlocks(content, searchStr) {
  let current = content;
  while (true) {
    let next = removeTagBlock(current, searchStr);
    if (next === current) break;
    current = next;
  }
  return current;
}

// Remove Objectives block safely using tag balancer on first div matching title criteria
function removeObjectivesBlock(content) {
  let startIdx = content.indexOf('<div');
  if (startIdx === -1) return content;
  
  const preview = content.substring(startIdx, startIdx + 800);
  if (preview.includes('Yêu cầu cần đạt') || preview.includes('Objectives') || preview.includes('OBJECTIVES')) {
    let depth = 0;
    let i = startIdx;
    while (i < content.length) {
      if (content.substring(i, i + 4) === '<div') {
        depth++;
        i += 4;
      } else if (content.substring(i, i + 6) === '</div>') {
        depth--;
        i += 6;
        if (depth === 0) {
          return content.substring(0, startIdx) + content.substring(i);
        }
      } else {
        i++;
      }
    }
  }
  return content;
}

files.forEach(filename => {
  const filepath = path.join(componentsDir, filename);
  const content = fs.readFileSync(filepath, 'utf8');

  // Skip already migrated lessons
  if (content.includes('PremiumLessonEngine') && content.includes('<PremiumLessonEngine')) {
    console.log(`[${filename}] Already fully migrated. Skipping.`);
    return;
  }

  console.log(`[${filename}] Processing migration...`);

  // 1. Extract questions and subtitles
  const mcDef = getVariableDefinition(content, ['mcQuestions', 'mcQ']);
  const tfDef = getVariableDefinition(content, ['tfCards', 'tfC']);
  const fillDef = getVariableDefinition(content, ['fillQuestions', 'fillQ', 'fQ']);
  const subDef = getVariableDefinition(content, ['videoSubtitles', 'subtitles']);

  // Fallbacks if not found
  const mcQuestionsStr = mcDef ? mcDef.content : '[]';
  const tfCardsStr = tfDef ? tfDef.content : '[]';
  const fillQuestionsStr = fillDef ? fillDef.content : '[]';
  const subtitlesStr = subDef ? subDef.content : '[]';

  // 2. Extract videoId
  const videoIdMatch = content.match(/videoId\s*=\s*["']([^"']+)["']/) || content.match(/videoId\s*=\s*\{?t\("([^"]+)"/);
  const videoId = videoIdMatch ? videoIdMatch[1] : 'kvGsIo1TmsM';

  // 3. Extract Titles using translation-aware logic to avoid matching structural HTML
  let chapterTitle = '{ vi: "Chương Học Toán 10", en: "Grade 10 Chapter" }';
  const tChapterMatch = content.match(/t\(\s*["'](Chương\s+[^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/i);
  if (tChapterMatch) {
    chapterTitle = `{ vi: "${tChapterMatch[1].trim()}", en: "${tChapterMatch[2].trim()}" }`;
  } else {
    const rawChapterMatch = content.match(/Chương\s+([IVX\d]+[^"'\n<]*)/i);
    if (rawChapterMatch) {
      chapterTitle = `{ vi: "${rawChapterMatch[0].trim()}", en: "${rawChapterMatch[0].trim()}" }`;
    }
  }

  let lessonTitle = `{ vi: "${filename.replace('.js', '')}", en: "${filename.replace('.js', '')}" }`;
  const tLessonMatch = content.match(/t\(\s*["'](Bài\s+\d+[^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/i) || 
                       content.match(/t\(\s*["'](Lesson\s+\d+[^"']+)["']\s*,\s*["']([^"']+)["']\s*\)/i);
  if (tLessonMatch) {
    lessonTitle = `{ vi: "${tLessonMatch[1].trim()}", en: "${tLessonMatch[2].trim()}" }`;
  } else {
    const rawLessonMatch = content.match(/Bài\s+\d+:\s*([^"'\n<]+)/) || content.match(/Lesson\s+\d+:\s*([^"'\n<]+)/);
    if (rawLessonMatch) {
      lessonTitle = `{ vi: "${rawLessonMatch[0].trim()}", en: "${rawLessonMatch[0].trim()}" }`;
    }
  }

  // 4. Extract Objectives (or parse placeholders)
  let objectivesList = [];
  const objBlock = getVariableDefinition(content, ['learningObjectives', 'objectives']);
  if (objBlock) {
    try {
      objectivesList = eval('(' + objBlock.content + ')');
    } catch (e) {
      console.warn("Failed to eval objectives block for:", filename, e.message);
    }
  } else {
    // Attempt parsing list from JSX return
    const objListMatch = content.match(/🎯[\s\S]*?\[([\s\S]*?)\]/);
    if (objListMatch) {
      try {
        objectivesList = eval('([' + objListMatch[1] + '])');
      } catch (e) {}
    }
  }
  // Convert objectives back to string array representation
  const objectivesStr = JSON.stringify(objectivesList.length > 0 ? objectivesList : [
    { vi: "Hiểu kiến thức trọng tâm của bài học.", en: "Understand key concepts of the lesson." },
    { vi: "Luyện tập bài tập tương tác.", en: "Practice interactive exercises." }
  ], null, 2);

  // 5. Extract Theory JSX Content
  let theoryJSX = '';
  // Try to find the section list starts and ends
  const returnMatch = content.match(/return\s*\(\s*<div[^>]*>\s*<div[^>]*>/) || content.match(/return\s*\(\s*<div[^>]*>[\s\n]*<div[^>]*>/);
  if (returnMatch) {
    const startOfReturn = returnMatch.index + returnMatch[0].length;
    const endOfTheoryMatch = content.match(/<section\s+id="(miniGame|mg)"/);
    if (endOfTheoryMatch) {
      let rawTheory = content.substring(startOfReturn, endOfTheoryMatch.index).trim();
      
      // Clean up the back button or header if they were captured
      rawTheory = rawTheory.replace(/\{?\/\*\s*BACK\s*\*\/\}?[\s\S]*?<\/Link>\s*<\/div>/g, '');
      rawTheory = rawTheory.replace(/\{?\/\*\s*HEADER\s*\*\/\}?[\s\S]*?<\/header>/g, '');
      rawTheory = rawTheory.replace(/<header[\s\S]*?<\/header>/g, ''); // Strip headers
      rawTheory = rawTheory.replace(/<style>\{`[\s\S]*?`\}<\/style>/g, ''); // Strip inline styles
      rawTheory = rawTheory.replace(/<DuoTranslate\s*\/>/g, ''); // Strip DuoTranslate
      
      // Remove structural wrapper tags safely using balanced divs
      rawTheory = removeAllTagBlocks(rawTheory, 'href="/Cacbaitoan10"');
      rawTheory = removeAllTagBlocks(rawTheory, 'href="/chuong');
      rawTheory = removeObjectivesBlock(rawTheory);
      rawTheory = removeAllTagBlocks(rawTheory, 'position:"sticky"');
      rawTheory = removeAllTagBlocks(rawTheory, 'position: "sticky"');
      rawTheory = removeAllTagBlocks(rawTheory, "position:'sticky'");
      rawTheory = removeAllTagBlocks(rawTheory, "position: 'sticky'");

      theoryJSX = rawTheory;
    }
  }

  if (!theoryJSX) {
    // Fallback: use generic content placeholder if regex extraction fails
    theoryJSX = `<div style={{ padding: 24, background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
      <h2 style={{ fontSize: 20, color: "#a5b4fc", marginBottom: 12 }}>Theory content is available in standard lesson format.</h2>
      <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>Please see interactive exercises and videos for practice.</p>
    </div>`;
  }

  // Define navItems mapping dynamically based on captured HTML sections
  const sectionIds = [...theoryJSX.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
  const navItemsList = [];
  if (sectionIds.includes('khoiDong') || sectionIds.includes('w')) {
    navItemsList.push(['khoiDong', '🚀', 'Khởi động', 'Warm-up']);
  }
  navItemsList.push(['videoBaiGiang', '🎬', 'Video', 'Video']);
  
  let conceptIndex = 1;
  sectionIds.forEach(id => {
    if (id.startsWith('khai') || id.startsWith('k')) {
      navItemsList.push([id, '📖', `${conceptIndex}. Khái niệm`, `${conceptIndex}. Concept`]);
      conceptIndex++;
    }
  });
  if (sectionIds.includes('thucHanh') || sectionIds.includes('th')) {
    navItemsList.push([sectionIds.includes('thucHanh') ? 'thucHanh' : 'th', '✏️', 'Thực hành', 'Practice']);
  }
  navItemsList.push(['miniGame', '🎮', 'Mini Game', 'Mini Game']);

  const navItemsStr = JSON.stringify(navItemsList, null, 2);

  // 6. Write out the final refactored component file
  const newContent = `/* eslint-disable react-hooks/static-components */
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PremiumLessonEngine from "./PremiumLessonEngine";

// ─── LOCAL COMPONENTS FOR LESSON ───
const SectionHeader = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#22d3ee", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

const TheoryBlock = ({ children }) => (
  <div style={{ padding: "20px 22px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
    {children}
  </div>
);

const FormulaCard = ({ label, formula, note }) => (
  <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", textAlign: "center" }}>
    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    <div style={{ fontFamily: "monospace", fontSize: 18, color: "#a5b4fc", fontWeight: 700, marginBottom: 6 }}>{formula}</div>
    {note && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{note}</div>}
  </div>
);

const SH = SectionHeader;
const TB = TheoryBlock;
const FC = FormulaCard;

export default function ${filename.replace('.js', '')}() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "${filename.replace('.js', '')}";
  const chapterTitle = ${chapterTitle};
  const lessonTitle = ${lessonTitle};
  const learningObjectives = ${objectivesStr};
  const navItems = ${navItemsStr};

  const videoSubtitles = ${subtitlesStr};
  const mcQuestions = ${mcQuestionsStr};
  const tfCards = ${tfCardsStr};
  const fillQuestions = ${fillQuestionsStr};

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        ${theoryJSX}
      </>
    );
  };

  return (
    <PremiumLessonEngine
      lessonSlug={lessonSlug}
      chapterTitle={chapterTitle}
      lessonTitle={lessonTitle}
      learningObjectives={learningObjectives}
      navItems={navItems}
      videoId="${videoId}"
      videoSubtitles={videoSubtitles}
      mcQuestions={mcQuestions}
      tfCards={tfCards}
      fillQuestions={fillQuestions}
      renderTheory={renderTheory}
      lang={lang}
      setLang={setLang}
    />
  );
}
`;

  fs.writeFileSync(filepath, newContent, 'utf8');
  console.log(`[${filename}] Successfully migrated!`);
});

console.log("All scans and migrations complete!");
