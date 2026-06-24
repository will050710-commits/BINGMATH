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

export default function Lesson31_DuongTron() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson31_DuongTron";
  const chapterTitle = { vi: "Chương IX · Phương Pháp Tọa Độ Trong Mặt Phẳng", en: "Chương IX · Phương Pháp Tọa Độ Trong Mặt Phẳng" };
  const lessonTitle = { vi: "Bài 31: Đường Tròn Trong Mặt Phẳng", en: "Bài 31: Đường Tròn Trong Mặt Phẳng" };
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
        "text": "circle equations",
        "vi": "phương trình đường tròn",
        "detail": "<b>circle equations</b>: phương trình đường tròn.",
        "detailTitle": "circle equations (phương trình đường tròn)"
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
        "text": "center",
        "vi": "tâm",
        "detail": "<b>center</b>: tâm.",
        "detailTitle": "center (tâm)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "radius",
        "vi": "bán kính",
        "detail": "<b>radius</b>: bán kính.",
        "detailTitle": "radius (bán kính)"
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
        "text": "tangent",
        "vi": "tiếp tuyến",
        "detail": "<b>tangent</b>: tiếp tuyến.",
        "detailTitle": "tangent (tiếp tuyến)"
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
        "text": "center",
        "vi": "tâm",
        "detail": "<b>center</b>: tâm.",
        "detailTitle": "center (tâm)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "radius",
        "vi": "bán kính",
        "detail": "<b>radius</b>: bán kính.",
        "detailTitle": "radius (bán kính)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "tangent",
        "vi": "tiếp tuyến",
        "detail": "<b>tangent</b>: tiếp tuyến.",
        "detailTitle": "tangent (tiếp tuyến)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': 'PT đường tròn tâm I(0,0) bán kính 5?', 'o': ['x+y=5', 'x²+y²=25', 'x²+y²=5', '(x+y)²=25'], 'a': 1, 'ex': '(x−0)²+(y−0)²=25 → x²+y²=25.'}, {'q': '(x−2)²+(y+3)²=16. Tâm và R?', 'o': ['I(2,3),R=4', 'I(2,−3),R=4', 'I(−2,3),R=16', 'I(2,−3),R=16'], 'a': 1, 'ex': 'Tâm I(2,−3), R=√16=4.'}, {'q': 'Điểm M(0,3) có nằm trên đường tròn x²+y²=9?', 'o': ['Trong', 'Trên', 'Ngoài', 'Không xác định'], 'a': 1, 'ex': '0²+3²=9=R² → M nằm trên đường tròn.'}, {'q': 'd(I,ℓ)<R thì đường thẳng ℓ và đường tròn tâm I?', 'o': ['Không giao', 'Tiếp xúc', 'Cắt tại 2 điểm', 'Cắt tại 1 điểm'], 'a': 2, 'ex': 'd<R → đường thẳng cắt đường tròn tại 2 điểm.'}, {'q': 'x²+y²−4x−6y+9=0. Dạng chính tắc?', 'o': ['(x−2)²+(y−3)²=4', '(x+2)²+(y+3)²=4', '(x−2)²+(y−3)²=9', '(x−4)²+(y−6)²=9'], 'a': 0, 'ex': '(x²−4x+4)+(y²−6y+9)=9+4=4 → (x−2)²+(y−3)²=4.'}];
  const tfCards = [{'s': 'PT đường tròn tâm I(a,b) bán kính R: (x−a)²+(y−b)²=R².', 'a': true, 'ex': 'ĐÚNG — đây là dạng chính tắc.'}, {'s': 'x²+y²+2x−4y+5=0 là PT đường tròn.', 'a': false, 'ex': 'SAI — (x+1)²+(y−2)²=0, chỉ là điểm (−1,2), không phải đường tròn (R=0).'}, {'s': 'Đường tròn tâm I, bán kính R tiếp xúc đường thẳng ℓ khi d(I,ℓ)=R.', 'a': true, 'ex': 'ĐÚNG — tiếp tuyến ⟺ khoảng cách từ tâm bằng bán kính.'}, {'s': 'x²+y²=R² là đường tròn tâm gốc O.', 'a': true, 'ex': 'ĐÚNG — (x−0)²+(y−0)²=R².'}, {'s': 'Hai đường tròn không giao nhau khi d(I₁,I₂)=R₁+R₂.', 'a': false, 'ex': 'SAI — d=R₁+R₂ là tiếp xúc ngoài. Không giao khi d>R₁+R₂.'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'Đường tròn tâm I(3,−1) R=5: (x−3)²+(y+1)²=___', 'ans': '25', 'alt': ['25'], 'h': 'R²=25'}, {'id': 'f2', 'tp': 'x²+y²−2x+4y=0 → tâm I=(___, ___)', 'ans': '1, -2', 'alt': ['(1,-2)', '1,-2', '1 -2'], 'h': 'x²−2x+1+y²+4y+4=5 → I(1,−2)'}, {'id': 'f3', 'tp': 'd(I,ℓ)=R thì đường thẳng ℓ là ___ đường tròn', 'ans': 'tiếp tuyến', 'alt': ['tiep tuyen', 'tangent', 'tangent line'], 'h': ''}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8}}>{t("Sóng radio lan truyền theo hình tròn. Radar quét theo hình tròn. Bánh xe, đồng hồ, cung tròn — đường tròn xuất hiện khắp nơi. Trong tọa độ, một đường tròn được mô tả bằng một phương trình bậc hai đơn giản!","Radio waves spread in circles. Radar sweeps in circles. Wheels, clocks, arcs — circles appear everywhere. In coordinates, a circle is described by a simple second-degree equation!")}</div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="6r1f5I676Ew"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ NancyPi (YouTube)", "Video by NancyPi (YouTube)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Phương Trình Đường Tròn","1. Circle Equation")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:17,textAlign:"center",color: "#22d3ee",fontWeight:700,lineHeight:2.6}}>
          (x−a)² + (y−b)² = R² &nbsp; [Dạng chính tắc]<br/>
          x²+y²−2ax−2by+(a²+b²−R²) = 0 &nbsp; [Dạng mở rộng]
        </div>
        <div style={{marginTop:10,fontSize:14,color: "rgba(255, 255, 255, 0.5)",lineHeight:1.8}}>
          {t("Tâm I(a,b), bán kính R. Điểm M(x,y)∈đường tròn ⟺ IM=R.","Center I(a,b), radius R. Point M(x,y) is on circle ⟺ IM=R.")}
        </div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Vị Trí Tương Đối","2. Relative Position")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,transition:"all 0.3s"}}>
        {[{title:t("Điểm M và đường tròn","Point and circle"),items:[t("d(I,M)<R: M nằm trong","d(I,M)<R: inside"),t("d(I,M)=R: M trên đường tròn","d(I,M)=R: on circle"),t("d(I,M)>R: M nằm ngoài","d(I,M)>R: outside")],c:"#38bdf8",bg:"rgba(14, 165, 233, 0.15)"},
          {title:t("Đường thẳng và đường tròn","Line and circle"),items:[t("d(I,d)<R: cắt (2 điểm)","d(I,d)<R: intersects (2 pts)"),t("d(I,d)=R: tiếp tuyến","d(I,d)=R: tangent"),t("d(I,d)>R: không giao","d(I,d)>R: no intersection")],c:"#4ade80",bg:"rgba(16, 185, 129, 0.15)"},
          {title:t("Hai đường tròn","Two circles"),items:[t("d<|R₁−R₂|: trong nhau","d<|R₁−R₂|: one inside"),t("|R₁−R₂|≤d≤R₁+R₂: cắt nhau","intersect"),t("d>R₁+R₂: ngoài nhau","d>R₁+R₂: external")],c:"#f87171",bg:"rgba(239, 68, 68, 0.15)"},
        ].map((card,i)=>(<article key={i} style={{padding:16,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:14,fontWeight:700,color:card.c,marginBottom:8}}>{card.title}</div>{card.items.map((item,j)=><div key={j} style={{background:card.bg,color:card.c,padding:"5px 10px",borderRadius:6,fontSize:12,marginBottom:4}}>{item}</div>)}</article>))}
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:t("Viết PT đường tròn tâm I(2,−1), bán kính R=3.","Write circle equation: center I(2,−1), radius R=3."),a:["(x−2)²+(y+1)²=9","Mở rộng: x²+y²−4x+2y+4+1−9=0","x²+y²−4x+2y−4=0"]},
          {id:"e2",q:t("Tìm tâm và bán kính: x²+y²−6x+4y−3=0","Find center and radius: x²+y²−6x+4y−3=0"),a:["(x²−6x+9)+(y²+4y+4)=3+9+4=16","(x−3)²+(y+2)²=16",t("Tâm I(3,−2), R=4","Center I(3,−2), R=4")]},
          {id:"e3",q:t("Kiểm tra điểm M(5,1) có thuộc đường tròn (x−2)²+(y−1)²=9 không.","Check if M(5,1) is on circle (x−2)²+(y−1)²=9."),a:["(5−2)²+(1−1)²=9+0=9=R²",t("M thuộc đường tròn ✓","M is on the circle ✓")]},
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
      videoId="6r1f5I676Ew"
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
