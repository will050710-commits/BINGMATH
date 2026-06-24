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

export default function Lesson30_DuongThang() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson30_DuongThang";
  const chapterTitle = { vi: "Chương IX · Phương Pháp Tọa Độ Trong Mặt Phẳng", en: "Chương IX · Phương Pháp Tọa Độ Trong Mặt Phẳng" };
  const lessonTitle = { vi: "Bài 30: Đường Thẳng Trong Mặt Phẳng", en: "Bài 30: Đường Thẳng Trong Mặt Phẳng" };
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
        "text": "line equations",
        "vi": "phương trình đường thẳng",
        "detail": "<b>line equations</b>: phương trình đường thẳng.",
        "detailTitle": "line equations (phương trình đường thẳng)"
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
        "text": "normal vector",
        "vi": "véc-tơ pháp tuyến",
        "detail": "<b>normal vector</b>: véc-tơ pháp tuyến.",
        "detailTitle": "normal vector (véc-tơ pháp tuyến)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "direction vector",
        "vi": "véc-tơ chỉ phương",
        "detail": "<b>direction vector</b>: véc-tơ chỉ phương.",
        "detailTitle": "direction vector (véc-tơ chỉ phương)"
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
        "text": "distance",
        "vi": "khoảng cách",
        "detail": "<b>distance</b>: khoảng cách.",
        "detailTitle": "distance (khoảng cách)"
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
        "text": "normal vector",
        "vi": "véc-tơ pháp tuyến",
        "detail": "<b>normal vector</b>: véc-tơ pháp tuyến.",
        "detailTitle": "normal vector (véc-tơ pháp tuyến)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "direction vector",
        "vi": "véc-tơ chỉ phương",
        "detail": "<b>direction vector</b>: véc-tơ chỉ phương.",
        "detailTitle": "direction vector (véc-tơ chỉ phương)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "distance",
        "vi": "khoảng cách",
        "detail": "<b>distance</b>: khoảng cách.",
        "detailTitle": "distance (khoảng cách)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': 'Đường thẳng 3x−4y+5=0. Vectơ pháp tuyến →n=?', 'o': ['(3,4)', '(3,−4)', '(4,3)', '(−4,3)'], 'a': 1, 'ex': 'Dạng ax+by+c=0: →n=(a,b)=(3,−4).'}, {'q': 'Khoảng cách từ O(0,0) đến 3x+4y−10=0?', 'o': ['2', '10', '10/5=2', '10/√25=2'], 'a': 0, 'ex': 'd=|0+0−10|/√(9+16)=10/5=2.'}, {'q': 'Đường thẳng qua A(1,2) song song Ox (y=const).', 'o': ['x=1', 'y=2', 'x+y=3', 'x−y=−1'], 'a': 1, 'ex': 'Song song Ox → y=const=2 → y=2.'}, {'q': '2x+3y−6=0 cắt Oy tại điểm?', 'o': ['(0,2)', '(0,3)', '(0,−2)', '(3,0)'], 'a': 0, 'ex': 'x=0: 3y=6 → y=2. Cắt Oy tại (0,2).'}, {'q': 'd₁: 2x+y=1 và d₂: 4x+2y=5. Quan hệ?', 'o': ['Cắt nhau', 'Song song', 'Trùng nhau', 'Vuông góc'], 'a': 1, 'ex': 'a₁/a₂=1/2; b₁/b₂=1/2; c₁/c₂=1/5. Tỉ lệ a=b≠c → song song.'}];
  const tfCards = [{'s': 'Vectơ pháp tuyến của ax+by+c=0 là (a,b).', 'a': true, 'ex': 'ĐÚNG — hệ số x và y cho pháp tuyến.'}, {'s': 'Vectơ chỉ phương của ax+by+c=0 là (a,b).', 'a': false, 'ex': 'SAI — vectơ chỉ phương là (−b,a) hoặc (b,−a).'}, {'s': 'Khoảng cách từ M(x₀,y₀) đến ax+by+c=0 là |ax₀+by₀+c|/√(a²+b²).', 'a': true, 'ex': 'ĐÚNG — công thức chuẩn.'}, {'s': 'Hai đường song song khi a₁b₂=a₂b₁.', 'a': true, 'ex': 'ĐÚNG — a₁/a₂=b₁/b₂ ⟺ a₁b₂=a₂b₁.'}, {'s': 'y=2x+3 có vectơ pháp tuyến (2,1).', 'a': false, 'ex': 'SAI — 2x−y+3=0: →n=(2,−1).'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'PT đường thẳng: ax+by+c=0. Vectơ pháp tuyến →n=(___, ___)', 'ans': 'a, b', 'alt': ['(a,b)', 'a b', 'a,b'], 'h': ''}, {'id': 'f2', 'tp': 'd(O, 3x+4y−10=0) = ___', 'ans': '2', 'alt': ['2'], 'h': '|0+0−10|/5'}, {'id': 'f3', 'tp': 'Đường thẳng qua (0,0) có hệ số góc m=3: y = ___x', 'ans': '3', 'alt': ['3'], 'h': 'y=mx'}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8}}>{t("Thiết kế đường ray tàu, lập trình robot di chuyển theo đường thẳng, thiết kế kiến trúc — tất cả cần phương trình đường thẳng. Tọa độ giúp ta mô tả mọi đường thẳng bằng một công thức.","Designing railroad tracks, programming robot paths, architectural design — all require line equations. Coordinates let us describe any line with a formula.")}</div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="rgvysb9emcQ"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (YouTube)", "Video by Khan Academy (YouTube)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Phương Trình Tổng Quát","1. General Equation")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{background:"white",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:17,textAlign:"center",color:"#0B4F5C",fontWeight:700,lineHeight:2.4}}>
          ax + by + c = 0 (a²+b²≠0)
        </div>
        <div style={{marginTop:10,fontSize:14,color:"#777",lineHeight:1.8}}>
          {t("Vectơ pháp tuyến: →n=(a,b) | Vectơ chỉ phương: →u=(−b,a) hoặc (b,−a)","Normal vector: →n=(a,b) | Direction vector: →u=(−b,a) or (b,−a)")}
        </div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Các Dạng Phương Trình","2. Forms of Line Equations")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16,transition:"all 0.3s"}}>
        {[{name:t("PT tổng quát","General"),formula:"ax + by + c = 0",note:t("Vectơ pháp →n=(a,b)","Normal →n=(a,b)"),c:"#1a5276",bg:"#eaf4fb"},
          {name:t("PT tham số","Parametric"),formula:"x=x₀+at, y=y₀+bt (t∈ℝ)",note:t("Vectơ chỉ phương →u=(a,b)","Direction →u=(a,b)"),c:"#1e8449",bg:"#eafaf1"},
          {name:t("PT chính tắc","Standard"),formula:"(x−x₀)/a = (y−y₀)/b",note:t("Qua M(x₀,y₀), hướng (a,b)","Through M(x₀,y₀), dir (a,b)"),c:"#856404",bg:"#fff3cd"},
          {name:t("PT góc tung độ (y=mx+n)","Slope-intercept"),formula:"y = mx + n",note:t("m=−a/b là hệ số góc","m=−a/b is slope"),c:"#922b21",bg:"#fdf2f2"},
        ].map((card,i)=>(<article key={i} style={{padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:13,fontWeight:700,color:card.c,marginBottom:6}}>{card.name}</div><div style={{fontFamily:"monospace",fontSize:14,background:card.bg,color:card.c,padding:"6px 10px",borderRadius:6,marginBottom:4}}>{card.formula}</div><div style={{fontSize:12,color:"#777"}}>{card.note}</div></article>))}
      </div>
    </section>
    <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("3. Vị Trí Tương Đối & Khoảng Cách","3. Relative Position & Distance")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:14,lineHeight:2.2}}>
          2 đường thẳng: a₁x+b₁y+c₁=0 và a₂x+b₂y+c₂=0<br/>
          Cắt nhau: a₁/a₂ ≠ b₁/b₂<br/>
          Song song: a₁/a₂ = b₁/b₂ ≠ c₁/c₂<br/>
          Trùng nhau: a₁/a₂ = b₁/b₂ = c₁/c₂<br/><br/>
          Khoảng cách điểm M(x₀,y₀) đến đường ax+by+c=0:<br/>
          d = |ax₀+by₀+c| / √(a²+b²)
        </div>
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:t("Viết PT đường thẳng qua A(2,3) có vectơ pháp tuyến →n=(1,−2).","Write equation of line through A(2,3) with normal →n=(1,−2)."),a:["1(x−2)+(−2)(y−3)=0","x−2−2y+6=0","x−2y+4=0"]},
          {id:"e2",q:t("Tính khoảng cách từ M(1,2) đến đường thẳng 3x+4y−10=0.","Distance from M(1,2) to line 3x+4y−10=0."),a:["d=|3×1+4×2−10|/√(9+16)","=|3+8−10|/5 = |1|/5 = 1/5 = 0.2"]},
          {id:"e3",q:t("Hai đường thẳng d₁: 2x−y+1=0 và d₂: 4x−2y+3=0. Quan hệ?","Lines d₁: 2x−y+1=0 and d₂: 4x−2y+3=0. Relationship?"),a:[t("a₁/a₂=2/4=1/2; b₁/b₂=(−1)/(−2)=1/2; c₁/c₂=1/3","ratios: 1/2, 1/2, 1/3"),t("a₁/a₂=b₁/b₂≠c₁/c₂ → SONG SONG","equal first two ratios, different third → PARALLEL")]},
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
      videoId="rgvysb9emcQ"
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
