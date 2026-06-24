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

export default function Lesson34_KhongGianMau() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson34_KhongGianMau";
  const chapterTitle = { vi: "Chương X · Xác Suất", en: "Chương X · Xác Suất" };
  const lessonTitle = { vi: "Bài 36: Không Gian Mẫu và Biến Cố", en: "Bài 36: Không Gian Mẫu và Biến Cố" };
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
        "text": "sample spaces and events",
        "vi": "không gian mẫu và biến cố",
        "detail": "<b>sample spaces and events</b>: không gian mẫu và biến cố.",
        "detailTitle": "sample spaces and events (không gian mẫu và biến cố)"
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
        "text": "outcome",
        "vi": "kết quả",
        "detail": "<b>outcome</b>: kết quả.",
        "detailTitle": "outcome (kết quả)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "event",
        "vi": "biến cố",
        "detail": "<b>event</b>: biến cố.",
        "detailTitle": "event (biến cố)"
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
        "text": "probability model",
        "vi": "mô hình xác suất",
        "detail": "<b>probability model</b>: mô hình xác suất.",
        "detailTitle": "probability model (mô hình xác suất)"
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
        "text": "outcome",
        "vi": "kết quả",
        "detail": "<b>outcome</b>: kết quả.",
        "detailTitle": "outcome (kết quả)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "event",
        "vi": "biến cố",
        "detail": "<b>event</b>: biến cố.",
        "detailTitle": "event (biến cố)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "probability model",
        "vi": "mô hình xác suất",
        "detail": "<b>probability model</b>: mô hình xác suất.",
        "detailTitle": "probability model (mô hình xác suất)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': 'Tung 1 xúc xắc. n(Ω)=?', 'o': ['2', '4', '6', '12'], 'a': 2, 'ex': 'Ω={1,2,3,4,5,6} → n(Ω)=6.'}, {'q': "A='ra số chẵn' khi tung xúc xắc. n(A)=?", 'o': ['2', '3', '4', '6'], 'a': 1, 'ex': 'A={2,4,6} → n(A)=3.'}, {'q': 'Ā là biến cố gì?', 'o': ['A xảy ra hai lần', 'A KHÔNG xảy ra', 'A luôn xảy ra', 'A xảy ra một nửa'], 'a': 1, 'ex': 'Ā là biến cố đối — khi A không xảy ra.'}, {'q': 'Hai biến cố xung khắc khi?', 'o': ['A⊂B', 'A∩B=∅', 'A=B', 'A∪B=Ω'], 'a': 1, 'ex': 'Xung khắc: không thể cùng xảy ra → A∩B=∅.'}, {'q': 'Tung 2 xúc xắc. n(Ω)=?', 'o': ['12', '6', '36', '72'], 'a': 2, 'ex': '6×6=36 (quy tắc nhân).'}];
  const tfCards = [{'s': 'Không gian mẫu Ω là tập hợp tất cả kết quả có thể.', 'a': true, 'ex': 'ĐÚNG — định nghĩa Ω.'}, {'s': 'Biến cố là tập con của Ω.', 'a': true, 'ex': 'ĐÚNG — mọi biến cố A ⊆ Ω.'}, {'s': 'Ā và A là hai biến cố xung khắc.', 'a': true, 'ex': 'ĐÚNG — A∩Ā=∅.'}, {'s': 'n(A∪B)=n(A)+n(B) luôn đúng.', 'a': false, 'ex': 'SAI — n(A∪B)=n(A)+n(B)−n(A∩B). Chỉ đúng khi A∩B=∅.'}, {'s': 'Biến cố chắc chắn bằng Ω.', 'a': true, 'ex': 'ĐÚNG — biến cố chắc chắn luôn xảy ra = toàn bộ Ω.'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'Tung 2 đồng xu: n(Ω) = ___', 'ans': '4', 'alt': ['4'], 'h': '2×2'}, {'id': 'f2', 'tp': 'Biến cố đối của A: Ā = Ω ___ A', 'ans': '\\', 'alt': ['\\', 'minus', 'trừ'], 'h': 'tập hiệu'}, {'id': 'f3', 'tp': 'Tung xúc xắc, A={1,3,5}. n(Ā) = ___', 'ans': '3', 'alt': ['3'], 'h': 'Ā={2,4,6}'}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8}}>{t("Khi tung đồng xu, có 2 kết quả: sấp (S) hoặc ngửa (N). Tập {S,N} là không gian mẫu. Biến cố 'ra mặt ngửa' = {N}. Xác suất = số kết quả thuận lợi / tổng số kết quả. Đây là nền tảng của lý thuyết xác suất!","When flipping a coin: 2 outcomes: Tails (T) or Heads (H). Set {T,H} is the sample space. Event 'heads' = {H}. Probability = favorable outcomes / total outcomes. This is the foundation of probability theory!")}</div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="3g83I7unRcs"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (YouTube)", "Video by Khan Academy (YouTube)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Không Gian Mẫu","1. Sample Space")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:10}}>📌 {t("Định nghĩa","Definitions")}</div>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:8}}>{t("• Phép thử ngẫu nhiên: thí nghiệm với kết quả không tiên đoán được.","• Random experiment: trial with unpredictable outcome.")}</div>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:8}}>{t("• Không gian mẫu Ω: tập hợp tất cả kết quả có thể.","• Sample space Ω: set of all possible outcomes.")}</div>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:8}}>{t("• Biến cố A: tập con của Ω (tập hợp các kết quả thuận lợi cho A).","• Event A: a subset of Ω (set of favorable outcomes).")}</div>
      </div>
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,transition:"all 0.3s"}}>
        {[{ex:t("Tung 1 đồng xu","Flip 1 coin"),omega:"Ω={S,N}",n:"n(Ω)=2",c:"#1a5276",bg:"#eaf4fb"},
          {ex:t("Tung 1 xúc xắc","Roll 1 die"),omega:"Ω={1,2,3,4,5,6}",n:"n(Ω)=6",c:"#1e8449",bg:"#eafaf1"},
          {ex:t("Tung 2 đồng xu","Flip 2 coins"),omega:"Ω={SS,SN,NS,NN}",n:"n(Ω)=4",c:"#856404",bg:"#fff3cd"},
          {ex:t("Rút 1 lá bài từ 52","Draw 1 card from 52"),omega:"Ω={52 lá}",n:"n(Ω)=52",c:"#922b21",bg:"#fdf2f2"},
        ].map((card,i)=>(<article key={i} style={{padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:13,color:"#777",marginBottom:6}}>{card.ex}</div><div style={{fontFamily:"monospace",fontSize:13,color:card.c,background:card.bg,padding:"6px 10px",borderRadius:6,marginBottom:4}}>{card.omega}</div><div style={{fontSize:12,color:"#777"}}>{card.n}</div></article>))}
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Quan Hệ Giữa Các Biến Cố","2. Relations Between Events")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s"}}>
        {[{name:t("Biến cố đối Ā","Complement Ā"),def:t("Tất cả kết quả KHÔNG thuộc A","All outcomes NOT in A"),formula:"Ā = Ω \ A; n(Ā)=n(Ω)−n(A)",c:"#1a5276",bg:"#eaf4fb"},
          {name:t("Hợp A∪B","Union A∪B"),def:t("A hoặc B (hoặc cả hai) xảy ra","A or B or both occur"),formula:"n(A∪B)=n(A)+n(B)−n(A∩B)",c:"#1e8449",bg:"#eafaf1"},
          {name:t("Giao A∩B","Intersection A∩B"),def:t("Cả A và B đều xảy ra","Both A and B occur"),formula:t("A và B xung khắc: A∩B=∅","A and B mutually exclusive: A∩B=∅"),c:"#922b21",bg:"#fdf2f2"},
        ].map((card,i)=>(<article key={i} style={{padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:14,fontWeight:700,color:card.c,marginBottom:6}}>{card.name}</div><div style={{fontSize:13,color:"#555",marginBottom:6}}>{card.def}</div><div style={{fontFamily:"monospace",fontSize:12,background:card.bg,color:card.c,padding:"6px 10px",borderRadius:6}}>{card.formula}</div></article>))}
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:t("Tung 1 xúc xắc. Xác định Ω và biến cố A='ra số chẵn'.","Roll 1 die. Define Ω and event A='even number'."),a:["Ω={1,2,3,4,5,6}","A={2,4,6}","Ā={1,3,5}"]},
          {id:"e2",q:t("Tung 2 đồng xu. Biến cố B='ít nhất 1 mặt ngửa'. Liệt kê B.","Flip 2 coins. Event B='at least 1 head'. List B."),a:["Ω={SS,SN,NS,NN}","B={SN,NS,NN}",t("n(B)=3","n(B)=3")]},
          {id:"e3",q:t("Xúc xắc: A='số lẻ'={1,3,5}, B='số>3'={4,5,6}. Tìm A∩B và A∪B.","Die: A='odd'={1,3,5}, B='>3'={4,5,6}. Find A∩B and A∪B."),a:["A∩B={5}","A∪B={1,3,4,5,6}"]},
        ].map(({id,q,a})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:18,fontWeight:600,marginBottom:4}}>📝 {t("Bài tập","Exercise")}</div><div style={{fontSize:15,lineHeight:1.7}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color:"#555",marginBottom:6}}>{l}</div>)}</div>}</article>))}
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
      videoId="3g83I7unRcs"
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
