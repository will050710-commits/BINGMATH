/* eslint-disable react-hooks/static-components */
"use client";
import Link from "next/link";
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

export default function Lesson33_OnTapChuong9() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson33_OnTapChuong9";
  const chapterTitle = { vi: "Chương IX · Phương Pháp Tọa Độ Trong Mặt Phẳng", en: "Chương IX · Phương Pháp Tọa Độ Trong Mặt Phẳng" };
  const lessonTitle = { vi: "Lesson33_OnTapChuong9", en: "Lesson33_OnTapChuong9" };
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
    "videoBaiGiang",
    "🎬",
    "Video",
    "Video"
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
        "text": "coordinate geometry review",
        "vi": "ôn tập phương pháp tọa độ",
        "detail": "<b>coordinate geometry review</b>: ôn tập phương pháp tọa độ.",
        "detailTitle": "coordinate geometry review (ôn tập phương pháp tọa độ)"
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
        "text": "line",
        "vi": "đường thẳng",
        "detail": "<b>line</b>: đường thẳng.",
        "detailTitle": "line (đường thẳng)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "circle",
        "vi": "đường tròn",
        "detail": "<b>circle</b>: đường tròn.",
        "detailTitle": "circle (đường tròn)"
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
        "text": "ellipse",
        "vi": "elip",
        "detail": "<b>ellipse</b>: elip.",
        "detailTitle": "ellipse (elip)"
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
        "text": "line",
        "vi": "đường thẳng",
        "detail": "<b>line</b>: đường thẳng.",
        "detailTitle": "line (đường thẳng)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "circle",
        "vi": "đường tròn",
        "detail": "<b>circle</b>: đường tròn.",
        "detailTitle": "circle (đường tròn)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "ellipse",
        "vi": "elip",
        "detail": "<b>ellipse</b>: elip.",
        "detailTitle": "ellipse (elip)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': '→AB với A(0,0), B(3,4): |→AB|=?', 'o': ['7', '5', '12', '√7'], 'a': 1, 'ex': '|→AB|=√(9+16)=5.'}, {'q': 'PT đường thẳng đi qua O(0,0) có hệ số góc 2?', 'o': ['y=2', 'x=2', 'y=2x', '2x+y=0'], 'a': 2, 'ex': 'y=2x+0=2x.'}, {'q': 'Đường tròn x²+y²=25, điểm A(3,4). A ở đâu?', 'o': ['Trong', 'Trên', 'Ngoài', 'Tâm'], 'a': 1, 'ex': '3²+4²=25=R² → A nằm trên đường tròn.'}, {'q': 'Elip x²/9+y²/4=1: tiêu điểm?', 'o': ['(±√5,0)', '(±√13,0)', '(±2,0)', '(±3,0)'], 'a': 0, 'ex': 'c²=9−4=5 → c=√5. F(±√5,0).'}, {'q': 'Khoảng cách từ O(0,0) đến 3x+4y+10=0?', 'o': ['2', '10', '2.5', '√10'], 'a': 0, 'ex': 'd=|0+0+10|/√(9+16)=10/5=2.'}];
  const tfCards = [{'s': '→AB = →OB − →OA theo tọa độ.', 'a': true, 'ex': 'ĐÚNG.'}, {'s': 'PT đường tròn x²+y²+Dx+Ey+F=0 luôn là đường tròn.', 'a': false, 'ex': 'SAI — cần D²+E²−4F>0 để là đường tròn thực sự.'}, {'s': 'Elip x²/a²+y²/b²=1 với a=b là đường tròn.', 'a': true, 'ex': 'ĐÚNG — x²/R²+y²/R²=1 → đường tròn.'}, {'s': 'Tiếp tuyến đường tròn tại điểm M vuông góc bán kính IM.', 'a': true, 'ex': 'ĐÚNG — bán kính ⊥ tiếp tuyến tại điểm tiếp xúc.'}, {'s': 'Hai đường thẳng song song có cùng vectơ pháp tuyến.', 'a': true, 'ex': 'ĐÚNG — song song → cùng phương → cùng (hoặc tỉ lệ) →n.'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'd(O, 4x+3y−10=0) = ___', 'ans': '2', 'alt': ['2'], 'h': '|0+0−10|/5'}, {'id': 'f2', 'tp': 'x²+y²=R². Tâm I=(___, ___)', 'ans': '0, 0', 'alt': ['(0,0)', '0,0', 'O'], 'h': ''}, {'id': 'f3', 'tp': 'Elip x²/a²+y²/b²=1: c²=a²−___', 'ans': 'b²', 'alt': ['b²', 'b^2'], 'h': ''}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:40,transition:"all 0.3s"}}>
      {[{slug:"toa-do-vecto",num:"31",title:t("Tọa Độ Vectơ","Vector Coords")},{slug:"duong-thang",num:"32",title:t("Đường Thẳng","Lines")},{slug:"duong-tron",num:"33",title:t("Đường Tròn","Circles")},{slug:"elip",num:"34",title:"Elip"}].map(l=>(<Link key={l.slug} href={`/cacbailam10/${l.slug}`} style={{textDecoration:"none"}}><article style={{padding:12,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",cursor:"pointer"}}><div style={{fontSize:11,color:"#777",marginBottom:2}}>{t("Bài","L")} {l.num}</div><div style={{fontSize:13,fontWeight:600,color:"#0B4F5C"}}>{l.title}</div></article></Link>))}
    </div>
    <section id="tomTat" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📚" title={t("Tóm Tắt Chương IX","Chapter IX Summary")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:18,transition:"all 0.3s"}}>
        {[{title:t("Tọa Độ Vectơ","Vector Coords"),pts:["→AB=(xB−xA,yB−yA)","|→a|=√(a₁²+a₂²)","→a·→b=a₁b₁+a₂b₂","Midpoint:((xA+xB)/2,(yA+yB)/2)","Centroid:((xA+xB+xC)/3,(yA+yB+yC)/3)"]},
          {title:t("Đường Thẳng","Lines"),pts:["ax+by+c=0 (→n=(a,b))","y=mx+n (m=hệ số góc)","d(M,ℓ)=|ax₀+by₀+c|/√(a²+b²)","Song song: a₁b₂=a₂b₁, c₁/c₂≠a₁/a₂","Cắt nhau: a₁/a₂≠b₁/b₂"]},
          {title:t("Đường Tròn","Circles"),pts:["(x−a)²+(y−b)²=R²","Tâm I(a,b), bán kính R","d(I,M)<R: trong; =R: trên; >R: ngoài","d(I,ℓ)<R: cắt; =R: tiếp; >R: ngoài"]},
          {title:"Elip",pts:["x²/a²+y²/b²=1 (a>b>0)","c²=a²−b²; F(±c,0)","MF₁+MF₂=2a","e=c/a (0<e<1)"]},
        ].map((card,i)=>(<article key={i} style={{padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:14,fontWeight:700,color:"#0B4F5C",marginBottom:10}}>{card.title}</div>{card.pts.map((pt,j)=><div key={j} style={{fontSize:12,color:"#555",marginBottom:6,display:"flex",gap:6}}><span style={{color:"#0B4F5C",fontWeight:700,flexShrink:0}}>•</span><span style={{fontFamily:"monospace"}}>{pt}</span></div>)}</article>))}
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="HO2zAU3Eppo"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
          />
        </div>
      </section>
    <section id="baiTap" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Bài Tập Tổng Hợp","Mixed Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",badge:"L31+32",q:t("A(1,2), B(4,6). Viết PT đường thẳng AB.","A(1,2), B(4,6). Write equation of line AB."),a:["→AB=(3,4). Vectơ pháp tuyến →n=(4,−3) (hoặc (−4,3))",t("PT: 4(x−1)−3(y−2)=0","4(x−1)−3(y−2)=0"),"4x−4−3y+6=0 → 4x−3y+2=0"]},
          {id:"e2",badge:"L33",q:t("Đường tròn (x−1)²+(y+2)²=25. Tìm giao điểm với trục Ox.","Circle (x−1)²+(y+2)²=25. Find intersections with Ox."),a:[t("y=0: (x−1)²+4=25 → (x−1)²=21","y=0: (x−1)²=21"),"x=1±√21",t("Hai giao điểm: (1+√21,0) và (1−√21,0)","Two points: (1±√21,0)")]},
          {id:"e3",badge:"L34",q:t("Elip x²/16+y²/7=1. Tính c, e và tiêu điểm.","Ellipse x²/16+y²/7=1. Find c, e and foci."),a:["c²=16−7=9 → c=3","e=c/a=3/4=0.75",t("Tiêu điểm F₁(−3,0) và F₂(3,0)","Foci F₁(−3,0), F₂(3,0)")]},
        ].map(({id,q,a,badge})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{fontSize:17,fontWeight:600}}>📝 {t("Bài tập","Exercise")}</div><span style={{background:"black",color:"white",fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20}}>{badge}</span></div><div style={{fontSize:15,lineHeight:1.7}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color:"#555",marginBottom:6}}>{l}</div>)}</div>}</article>))}
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
      videoId="HO2zAU3Eppo"
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
