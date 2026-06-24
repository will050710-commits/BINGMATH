/* eslint-disable react-hooks/static-components */
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

export default function Lesson14_TongHieuVecto() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson14_TongHieuVecto";
  const chapterTitle = { vi: "Chương V · Vectơ", en: "Chương V · Vectơ" };
  const lessonTitle = { vi: "Bài 14: Tổng và Hiệu Hai Vectơ", en: "Bài 14: Tổng và Hiệu Hai Vectơ" };
  const learningObjectives = [
  {
    "vi": "Hiểu kiến thức trọng tâm của bài học.",
    "en": "Understand key concepts of the lesson."
  },
  {
    "vi": "Luyện tập bài tập tương tác.",
    "en": "Practice interactive exercises."
  }
];
  const navItems = [
  [
    "khoiDong",
    "🚀",
    "Khởi động",
    "Warm-up"
  ],
  [
    "videoBaiGiang",
    "🎬",
    "Video",
    "Video"
  ],
  [
    "k1",
    "📖",
    "1. Khái niệm",
    "1. Concept"
  ],
  [
    "k2",
    "📖",
    "2. Khái niệm",
    "2. Concept"
  ],
  [
    "k3",
    "📖",
    "3. Khái niệm",
    "3. Concept"
  ],
  [
    "th",
    "✏️",
    "Thực hành",
    "Practice"
  ],
  [
    "miniGame",
    "🎮",
    "Mini Game",
    "Mini Game"
  ]
];

  const videoSubtitles = [
  {
    "start": 0,
    "end": 12,
    "words": [
      {
        "text": "This lesson introduces",
        "vi": "Bài học này giới thiệu"
      },
      {
        "text": "vector addition and subtraction",
        "vi": "tổng và hiệu véc-tơ",
        "detail": "<b>vector addition and subtraction</b>: tổng và hiệu véc-tơ.",
        "detailTitle": "vector addition and subtraction (tổng và hiệu véc-tơ)"
      },
      {
        "text": "and the main ideas used in Grade 10 math.",
        "vi": "và các ý chính dùng trong Toán 10."
      }
    ]
  },
  {
    "start": 12,
    "end": 30,
    "words": [
      {
        "text": "First identify",
        "vi": "Trước hết xác định"
      },
      {
        "text": "sum",
        "vi": "tổng",
        "detail": "<b>sum</b>: tổng.",
        "detailTitle": "sum (tổng)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "difference",
        "vi": "hiệu",
        "detail": "<b>difference</b>: hiệu.",
        "detailTitle": "difference (hiệu)"
      },
      {
        "text": "through examples.",
        "vi": "qua các ví dụ."
      }
    ]
  },
  {
    "start": 30,
    "end": 55,
    "words": [
      {
        "text": "Use",
        "vi": "Sử dụng"
      },
      {
        "text": "parallelogram rule",
        "vi": "quy tắc hình bình hành",
        "detail": "<b>parallelogram rule</b>: quy tắc hình bình hành.",
        "detailTitle": "parallelogram rule (quy tắc hình bình hành)"
      },
      {
        "text": "carefully and check every condition before solving.",
        "vi": "một cách cẩn thận và kiểm tra mọi điều kiện trước khi giải."
      }
    ]
  },
  {
    "start": 55,
    "end": 9999,
    "words": [
      {
        "text": "For practice, combine",
        "vi": "Khi luyện tập, hãy kết hợp"
      },
      {
        "text": "sum",
        "vi": "tổng",
        "detail": "<b>sum</b>: tổng.",
        "detailTitle": "sum (tổng)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "difference",
        "vi": "hiệu",
        "detail": "<b>difference</b>: hiệu.",
        "detailTitle": "difference (hiệu)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "parallelogram rule",
        "vi": "quy tắc hình bình hành",
        "detail": "<b>parallelogram rule</b>: quy tắc hình bình hành.",
        "detailTitle": "parallelogram rule (quy tắc hình bình hành)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': '→AB + →BC = ?', 'o': ['→CA', '→AC', '→BA', '→0'], 'a': 1, 'ex': 'Quy tắc ba điểm: →AB+→BC=→AC.'}, {'q': '→a + (−→a) = ?', 'o': ['→a', '2→a', '→0', '−2→a'], 'a': 2, 'ex': '→a + (−→a) = →0. Vectơ cộng với vectơ đối của nó bằng vectơ không.'}, {'q': 'Hình bình hành ABCD. →AB + →AD = ?', 'o': ['→BD', '→AC', '→BC', '→CD'], 'a': 1, 'ex': 'Quy tắc hình bình hành: →AB+→AD=→AC (đường chéo).'}, {'q': '→AB − →AC = ?', 'o': ['→BC', '→CB', '→AC', '→CA'], 'a': 1, 'ex': '→AB − →AC = →AB + →CA = →CA + →AB = →CB.'}, {'q': 'Tính chất: →a + →b = →b + →a là?', 'o': ['Kết hợp', 'Giao hoán', 'Phân phối', 'Đơn vị'], 'a': 1, 'ex': 'Tính chất GIAO HOÁN: →a+→b=→b+→a.'}];
  const tfCards = [{'s': '→AB + →BC = →AC (quy tắc ba điểm).', 'a': true, 'ex': 'ĐÚNG — đây là quy tắc ba điểm chuẩn.'}, {'s': '→a + →0 = →0.', 'a': false, 'ex': 'SAI — →a + →0 = →a (vectơ không là phần tử trung lập).'}, {'s': '→AB = →OB − →OA.', 'a': true, 'ex': 'ĐÚNG — →AB = →AO+→OB = −→OA+→OB = →OB−→OA.'}, {'s': '(→a + →b) + →c = →a + (→b + →c).', 'a': true, 'ex': 'ĐÚNG — tính chất kết hợp của phép cộng vectơ.'}, {'s': '→a − →b = →b − →a.', 'a': false, 'ex': 'SAI — phép trừ không giao hoán: →a−→b = →a+(−→b) ≠ →b−→a.'}];
  const fillQuestions = [{'id': 'f1', 'tp': '→AB + →BC + →CA = ___', 'ans': '→0', 'alt': ['0', 'vec0', '→0'], 'h': ''}, {'id': 'f2', 'tp': 'Hình bình hành OABC: →OA + →OC = ___', 'ans': '→OB', 'alt': ['OB', 'vec(OB)'], 'h': 'Quy tắc hình bình hành'}, {'id': 'f3', 'tp': '→AB = →OB − ___', 'ans': '→OA', 'alt': ['OA', 'vec(OA)', '→OA'], 'h': ''}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
      
      
      

      <section id="w" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Nếu bạn đi bộ 3km về hướng đông rồi 4km về hướng bắc, bạn đã di chuyển tổng cộng bao nhiêu km (theo đường thẳng)? Đây là bài toán cộng vectơ trong thực tế!","If you walk 3km east then 4km north, how far have you actually moved (straight line)? This is vector addition in real life!")}</div>
          <div style={{fontSize:16}}>❓ <em>{t("Câu trả lời: 5km (tam giác vuông 3-4-5). Hướng là gì?","Answer: 5km (3-4-5 right triangle). What direction?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="YmXbE0EUTG4"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ 3Blue1Brown (CC BY)", "Video by 3Blue1Brown (CC BY)")}
          />
        </div>
      </section>
      <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("1. Tổng Hai Vectơ","1. Sum of Two Vectors")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
          <div style={{fontWeight:"bold",fontSize:17,color: "#22d3ee",marginBottom:10}}>📌 {t("Quy tắc ba điểm","Three-point rule")}</div>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Cho hai vectơ →a và →b. Đặt điểm đầu của →b tại điểm cuối của →a:","Given →a and →b. Place the start of →b at the end of →a:")}</div>
          <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:16,textAlign:"center",lineHeight:2.4}}>
            →AB + →BC = →AC<br/>
            →a + →b = →a + →b (quy tắc nối đầu đuôi)
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s"}}>
          {[{title:t("Tính chất giao hoán","Commutative"),formula:"→a + →b = →b + →a",bg:"rgba(14, 165, 233, 0.15)",c:"#38bdf8"},
            {title:t("Tính chất kết hợp","Associative"),formula:"(→a + →b) + →c = →a + (→b + →c)",bg:"rgba(16, 185, 129, 0.15)",c:"#4ade80"},
            {title:t("Phần tử trung lập","Identity element"),formula:"→a + →0 = →0 + →a = →a",bg:"rgba(245, 158, 11, 0.15)",c:"#fbbf24"},
            {title:t("Phần tử đối","Inverse element"),formula:"→a + (−→a) = →0",bg:"rgba(239, 68, 68, 0.15)",c:"#f87171"},
          ].map((card,i)=><article key={i} style={{padding:16,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,color:card.c,marginBottom:8}}>{card.title}</div><div style={{fontFamily:"monospace",fontSize:14,background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8}}>{card.formula}</div></article>)}
        </div>
      </section>
      <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("2. Quy Tắc Hình Bình Hành","2. Parallelogram Rule")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Nếu →a = →OA và →b = →OB (cùng điểm đầu O), thì →a + →b = →OC, trong đó C là đỉnh còn lại của hình bình hành OACB.","If →a = →OA and →b = →OB (same start O), then →a + →b = →OC, where C is the remaining vertex of parallelogram OACB.")}</div>
          <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",fontFamily:"monospace",fontSize:15,padding:"10px 14px",borderRadius:8,color: "#22d3ee",fontWeight:600}}>→OA + →OB = →OC (C là đỉnh đối của O trong hình bình hành OACB)</div>
        </div>
      </section>
      <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("3. Hiệu Hai Vectơ","3. Difference of Two Vectors")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Hiệu của →a và →b được định nghĩa:","Difference of →a and →b is defined as:")}</div>
          <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:16,textAlign:"center",lineHeight:2.4}}>
            →a − →b = →a + (−→b)<br/>
            →AB − →AC = →CB (quy tắc trừ)
          </div>
          <div style={{marginTop:12,padding:"10px 14px",background:"rgba(245, 158, 11, 0.15)",borderRadius:8,fontSize:14}}>
            💡 {t("Nhớ: →AB = →OB − →OA (hiệu vectơ vị trí)","Remember: →AB = →OB − →OA (position vector difference)")}
          </div>
        </div>
      </section>
      <section id="th" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
          {[{id:"e1",q:t("Cho tam giác ABC. Chứng minh: →AB + →BC + →CA = →0","Given triangle ABC. Prove: →AB + →BC + →CA = →0"),
             a:[t("→AB + →BC = →AC (quy tắc ba điểm)","→AB + →BC = →AC (three-point rule)"),t("→AC + →CA = →AA = →0","→AC + →CA = →AA = →0"),t("Vậy →AB + →BC + →CA = →0 ✓","Therefore →AB + →BC + →CA = →0 ✓")]},
            {id:"e2",q:t("Cho hình bình hành ABCD. Tính →AB + →AD.","Parallelogram ABCD. Compute →AB + →AD."),
             a:[t("Theo quy tắc hình bình hành (chung điểm đầu A):","Parallelogram rule (common start A):"),t("→AB + →AD = →AC (đường chéo AC)","→AB + →AD = →AC (diagonal AC)")]},
            {id:"e3",q:t("Cho →OA, →OB là vectơ vị trí. Tính →AB.","Given position vectors →OA, →OB. Find →AB."),
             a:[t("→AB = →AO + →OB = −→OA + →OB","→AB = −→OA + →OB"),t("→AB = →OB − →OA","→AB = →OB − →OA")]},
          ].map(({id,q,a})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:18,fontWeight:600,marginBottom:4}}>📝 {t("Bài tập","Exercise")}</div><div style={{fontSize:15,lineHeight:1.7}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"rgba(16, 185, 129, 0.15)",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color: "rgba(255, 255, 255, 0.7)",marginBottom:6}}>{l}</div>)}</div>}</article>))}
        </div>
      </section>
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
      videoId="YmXbE0EUTG4"
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
