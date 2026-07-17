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

export default function Lesson35_XacSuatBienCo() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson35_XacSuatBienCo";
  const chapterTitle = { vi: "Chương X · Xác Suất", en: "Chương X · Xác Suất" };
  const lessonTitle = { vi: "Bài 37: Xác Suất Biến Cố", en: "Bài 37: Xác Suất Biến Cố" };
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
        "text": "probability of an event",
        "vi": "xác suất của biến cố",
        "detail": "<b>probability of an event</b>: xác suất của biến cố.",
        "detailTitle": "probability of an event (xác suất của biến cố)"
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
        "text": "favorable outcome",
        "vi": "kết quả thuận lợi",
        "detail": "<b>favorable outcome</b>: kết quả thuận lợi.",
        "detailTitle": "favorable outcome (kết quả thuận lợi)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "equally likely",
        "vi": "đồng khả năng",
        "detail": "<b>equally likely</b>: đồng khả năng.",
        "detailTitle": "equally likely (đồng khả năng)"
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
        "text": "complement",
        "vi": "biến cố đối",
        "detail": "<b>complement</b>: biến cố đối.",
        "detailTitle": "complement (biến cố đối)"
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
        "text": "favorable outcome",
        "vi": "kết quả thuận lợi",
        "detail": "<b>favorable outcome</b>: kết quả thuận lợi.",
        "detailTitle": "favorable outcome (kết quả thuận lợi)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "equally likely",
        "vi": "đồng khả năng",
        "detail": "<b>equally likely</b>: đồng khả năng.",
        "detailTitle": "equally likely (đồng khả năng)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "complement",
        "vi": "biến cố đối",
        "detail": "<b>complement</b>: biến cố đối.",
        "detailTitle": "complement (biến cố đối)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': "Tung xúc xắc. P('ra số 3')=?", 'o': ['1/3', '1/2', '1/6', '1/4'], 'a': 2, 'ex': 'n({3})=1, n(Ω)=6: P=1/6.'}, {'q': 'P(Ā)=0.3. P(A)=?', 'o': ['0.3', '0.7', '0.6', '0.4'], 'a': 1, 'ex': 'P(A)=1−P(Ā)=1−0.3=0.7.'}, {'q': 'A và B xung khắc, P(A)=0.3, P(B)=0.4. P(A∪B)=?', 'o': ['0.7', '0.12', '0.1', '1'], 'a': 0, 'ex': 'Xung khắc: P(A∪B)=0.3+0.4=0.7.'}, {'q': "Tung 2 xúc xắc. P('cả 2 ra số 6')=?", 'o': ['1/6', '1/12', '1/36', '2/6'], 'a': 2, 'ex': 'Độc lập: P=1/6×1/6=1/36.'}, {'q': 'P(A)=0.6, P(B)=0.5, P(A∩B)=0.2. P(A∪B)=?', 'o': ['1.1', '0.9', '0.7', '0.8'], 'a': 1, 'ex': 'P(A∪B)=0.6+0.5−0.2=0.9.'}];
  const tfCards = [{'s': 'P(A)=n(A)/n(Ω) chỉ đúng khi các kết quả đồng khả năng.', 'a': true, 'ex': 'ĐÚNG — công thức cổ điển áp dụng cho không gian mẫu đồng khả năng.'}, {'s': '0 ≤ P(A) ≤ 1 với mọi biến cố A.', 'a': true, 'ex': 'ĐÚNG — xác suất luôn trong [0,1].'}, {'s': 'P(A) + P(Ā) = 2.', 'a': false, 'ex': 'SAI — P(A)+P(Ā)=1.'}, {'s': 'P(A∩B)=P(A)·P(B) đúng khi A và B độc lập.', 'a': true, 'ex': 'ĐÚNG — nhân xác suất khi độc lập.'}, {'s': 'P(∅) = 1.', 'a': false, 'ex': 'SAI — P(∅)=0 (biến cố không thể xảy ra).'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'P(A) = n(A) / ___', 'ans': 'n(Ω)', 'alt': ['n(omega)', 'n(O)', 'n(Ω)'], 'h': ''}, {'id': 'f2', 'tp': 'P(Ā) = 1 − ___', 'ans': 'P(A)', 'alt': ['P(A)', 'p(a)'], 'h': ''}, {'id': 'f3', 'tp': "Tung xúc xắc: P('số chẵn') = ___", 'ans': '1/2', 'alt': ['1/2', '0.5', '3/6'], 'h': 'A={2,4,6}'}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8}}>{t("Dự báo thời tiết '70% khả năng mưa', thống kê bệnh '1/1000 người mắc', trò chơi casino '47% thắng' — tất cả dùng xác suất. Xác suất là cách đo 'khả năng xảy ra' của một sự kiện!","Weather forecast '70% chance of rain', disease statistics '1 in 1000', casino '47% win rate' — all use probability. Probability measures the 'likelihood' of an event!")}</div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="q0P9xTHbSus"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Định Nghĩa Xác Suất","1. Definition of Probability")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Trong không gian mẫu đồng khả năng (mọi kết quả như nhau), xác suất của biến cố A là:","In a uniform sample space (equally likely outcomes), probability of event A is:")}</div>
        <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:20,textAlign:"center",color: "#22d3ee",fontWeight:700,lineHeight:2.4}}>
          P(A) = n(A) / n(Ω)
        </div>
        <div style={{marginTop:10,fontSize:14,color: "rgba(255, 255, 255, 0.5)",lineHeight:1.8}}>{t("0 ≤ P(A) ≤ 1 | P(Ω)=1 (chắc chắn) | P(∅)=0 (không thể)","0≤P(A)≤1 | P(Ω)=1 (certain) | P(∅)=0 (impossible)")}</div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Các Quy Tắc Tính Xác Suất","2. Probability Rules")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16,transition:"all 0.3s"}}>
        {[{title:t("Xác suất biến cố đối","Complement rule"),formula:"P(Ā) = 1 − P(A)",note:t("Rất hữu dụng: tính P(ít nhất 1) = 1 − P(không có)","Useful: P(at least 1)=1−P(none)"),c:"#38bdf8",bg:"rgba(14, 165, 233, 0.15)"},
          {title:t("Quy tắc cộng tổng quát","General addition"),formula:"P(A∪B)=P(A)+P(B)−P(A∩B)",note:t("Dùng cho mọi biến cố","For any events"),c:"#4ade80",bg:"rgba(16, 185, 129, 0.15)"},
          {title:t("Cộng biến cố xung khắc","Addition for exclusive"),formula:"P(A∪B)=P(A)+P(B)",note:t("Khi A∩B=∅","When A and B mutually exclusive"),c:"#fbbf24",bg:"rgba(245, 158, 11, 0.15)"},
          {title:t("Nhân biến cố độc lập","Multiplication for independent"),formula:"P(A∩B)=P(A)×P(B)",note:t("Khi A và B độc lập nhau","When A and B are independent"),c:"#f87171",bg:"rgba(239, 68, 68, 0.15)"},
        ].map((card,i)=>(<article key={i} style={{padding:18,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:14,fontWeight:700,color:card.c,marginBottom:8}}>{card.title}</div><div style={{fontFamily:"monospace",fontSize:14,background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8,marginBottom:6}}>{card.formula}</div><div style={{fontSize:12,color: "rgba(255, 255, 255, 0.5)"}}>{card.note}</div></article>))}
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:t("Tung xúc xắc. Tính P('ra số chẵn') và P('ra số>4').","Roll die. Find P('even') and P('>4')."),a:["A={2,4,6}, n(A)=3: P(A)=3/6=1/2","B={5,6}, n(B)=2: P(B)=2/6=1/3"]},
          {id:"e2",q:t("Rút 1 lá từ 52 lá bài. P('rút được át') = ?","Draw 1 card from 52. P('draw an ace') = ?"),a:[t("Có 4 lá át trong 52 lá","4 aces in 52 cards"),"P(át) = 4/52 = 1/13 ≈ 0.077"]},
          {id:"e3",q:t("Tung 2 đồng xu. P('ít nhất 1 mặt ngửa').","Flip 2 coins. P('at least 1 head')."),a:["Cách 1: Ω={SS,SN,NS,NN}. Biến cố: {SN,NS,NN}. P=3/4",t("Cách 2: P(ít nhất 1 ngửa)=1−P(không ngửa)=1−P(SS)=1−1/4=3/4","Method 2: 1−P(no heads)=1−1/4=3/4")]},
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
      videoId="q0P9xTHbSus"
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
