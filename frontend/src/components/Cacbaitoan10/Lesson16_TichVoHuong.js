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

export default function Lesson16_TichVoHuong() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson16_TichVoHuong";
  const chapterTitle = { vi: "Chương V · Vectơ", en: "Chương V · Vectơ" };
  const lessonTitle = { vi: "Bài 16: Tích Vô Hướng", en: "Bài 16: Tích Vô Hướng" };
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
        "text": "dot product",
        "vi": "tích vô hướng",
        "detail": "<b>dot product</b>: tích vô hướng.",
        "detailTitle": "dot product (tích vô hướng)"
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
        "text": "angle between vectors",
        "vi": "góc giữa hai véc-tơ",
        "detail": "<b>angle between vectors</b>: góc giữa hai véc-tơ.",
        "detailTitle": "angle between vectors (góc giữa hai véc-tơ)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "projection",
        "vi": "hình chiếu",
        "detail": "<b>projection</b>: hình chiếu.",
        "detailTitle": "projection (hình chiếu)"
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
        "text": "perpendicular vectors",
        "vi": "véc-tơ vuông góc",
        "detail": "<b>perpendicular vectors</b>: véc-tơ vuông góc.",
        "detailTitle": "perpendicular vectors (véc-tơ vuông góc)"
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
        "text": "angle between vectors",
        "vi": "góc giữa hai véc-tơ",
        "detail": "<b>angle between vectors</b>: góc giữa hai véc-tơ.",
        "detailTitle": "angle between vectors (góc giữa hai véc-tơ)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "projection",
        "vi": "hình chiếu",
        "detail": "<b>projection</b>: hình chiếu.",
        "detailTitle": "projection (hình chiếu)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "perpendicular vectors",
        "vi": "véc-tơ vuông góc",
        "detail": "<b>perpendicular vectors</b>: véc-tơ vuông góc.",
        "detailTitle": "perpendicular vectors (véc-tơ vuông góc)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': '→a·→b = ?', 'o': ['→a×→b', '→a+→b', '|→a|·|→b|·cosφ', '|→a|·|→b|·sinφ'], 'a': 2, 'ex': '→a·→b=|→a|·|→b|·cosφ, với φ là góc giữa hai vectơ.'}, {'q': '→a ⊥ →b ⟺ ?', 'o': ['→a·→b=1', '→a·→b=0', '→a·→b=|→a|', '→a=→b'], 'a': 1, 'ex': 'Vuông góc ⟺ cosφ=cos90°=0 ⟺ →a·→b=0.'}, {'q': '→a=(3,4). |→a| = ?', 'o': ['7', '1', '5', '√7'], 'a': 2, 'ex': '|→a|=√(3²+4²)=√(9+16)=√25=5.'}, {'q': '→a=(1,0), →b=(0,1). →a·→b = ?', 'o': ['1', '0', '-1', '2'], 'a': 1, 'ex': '→a·→b=1·0+0·1=0 → vuông góc.'}, {'q': 'cosφ=(→a·→b)/(|→a|·|→b|). Nếu →a·→b<0 thì φ ∈ ?', 'o': ['(0°,90°)', 'φ=90°', '(90°,180°)', 'φ=180°'], 'a': 2, 'ex': '→a·→b<0 → cosφ<0 → φ ∈ (90°,180°) → góc tù.'}];
  const tfCards = [{'s': 'Tích vô hướng →a·→b là một số thực.', 'a': true, 'ex': 'ĐÚNG — kết quả là SCALAR (số thực), không phải vectơ.'}, {'s': '→a·→b = →b·→a (giao hoán).', 'a': true, 'ex': 'ĐÚNG — tích vô hướng giao hoán.'}, {'s': '→a·→a = |→a|.', 'a': false, 'ex': 'SAI — →a·→a = |→a|² (bình phương độ dài, không phải độ dài).'}, {'s': '→a ⊥ →b ⟺ →a·→b = 0.', 'a': true, 'ex': 'ĐÚNG — vuông góc ⟺ cosφ=0 ⟺ →a·→b=0.'}, {'s': 'Nếu →a·→b > 0 thì góc φ là góc nhọn.', 'a': true, 'ex': 'ĐÚNG — →a·→b>0 ⟺ cosφ>0 ⟺ 0°<φ<90° (góc nhọn).'}];
  const fillQuestions = [{'id': 'f1', 'tp': '→a=(3,4). →a·→a = ___.', 'ans': '25', 'alt': ['25'], 'h': '|→a|²=9+16=25'}, {'id': 'f2', 'tp': '→a ⊥ →b ⟺ →a · →b = ___', 'ans': '0', 'alt': ['0'], 'h': ''}, {'id': 'f3', 'tp': '→a=(1,2), →b=(4,−2). →a·→b = ___.', 'ans': '0', 'alt': ['0'], 'h': '1×4+2×(−2)=4−4=0'}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
      
      
      

      <section id="w" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Trong vật lý, công của một lực F dọc theo đường dịch chuyển d là: W = F·d·cosθ. Đây chính là tích vô hướng của hai vectơ! Nếu lực vuông góc với chuyển vị thì cosθ=0 → W=0 (không sinh công).","In physics, work done by force F over displacement d is W=F·d·cosθ. This IS the dot product! If force is perpendicular to displacement, cosθ=0 → W=0 (no work done).")}</div>
          <div style={{fontSize:16}}>❓ <em>{t("Tại sao tích vô hướng lại trả về một số, không phải một vectơ?","Why does the dot product return a scalar, not a vector?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="Kz_Mre-X0T0"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ 3Blue1Brown (CC BY)", "Video by 3Blue1Brown (CC BY)")}
          />
        </div>
      </section>
      <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("1. Định Nghĩa Tích Vô Hướng","1. Definition of Dot Product")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
          <div style={{fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10}}>📌 {t("Định nghĩa","Definition")}</div>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Cho hai vectơ →a và →b. Góc giữa chúng là φ (0° ≤ φ ≤ 180°):","For vectors →a and →b with angle φ between them (0°≤φ≤180°):")}</div>
          <div style={{background:"white",borderRadius:10,padding:"16px 20px",textAlign:"center",fontFamily:"monospace",fontSize:20,color:"#0B4F5C",fontWeight:700,lineHeight:2.2}}>
            →a · →b = |→a| · |→b| · cosφ
          </div>
          <div style={{marginTop:12,padding:"10px 14px",background:"#fff3cd",borderRadius:8,fontSize:14}}>💡 {t("Kết quả là một SỐ THỰC (scalar), không phải vectơ!","The result is a REAL NUMBER (scalar), not a vector!")}</div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,transition:"all 0.3s"}}>
          {[{cond:t("φ = 0° (cùng hướng)","φ=0° (same direction)"),result:"→a·→b = |→a|·|→b|",note:"+",bg:"#eafaf1",c:"#1e8449"},
            {cond:t("φ = 90° (vuông góc)","φ=90° (perpendicular)"),result:"→a·→b = 0",note:"0",bg:"#eaf4fb",c:"#1a5276"},
            {cond:t("φ = 180° (ngược hướng)","φ=180° (opposite)"),result:"→a·→b = −|→a|·|→b|",note:"−",bg:"#fdf2f2",c:"#922b21"},
          ].map((card,i)=><article key={i} style={{padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center"}}><div style={{fontSize:12,color:card.c,fontWeight:700,marginBottom:6}}>{card.cond}</div><div style={{fontFamily:"monospace",fontSize:13,background:card.bg,color:card.c,padding:"6px 10px",borderRadius:6,marginBottom:4}}>{card.result}</div><div style={{fontSize:20,fontWeight:700,color:card.c}}>{card.note}</div></article>)}
        </div>
      </section>
      <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("2. Tính Chất & Ứng Dụng","2. Properties & Applications")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
          <div style={{background:"white",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:14,lineHeight:2.0}}>
            →a · →b = →b · →a  (giao hoán)<br/>
            →a · (→b + →c) = →a·→b + →a·→c  (phân phối)<br/>
            (k→a)·→b = k(→a·→b)  (tuyến tính)<br/>
            →a · →a = |→a|² ≥ 0
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16,transition:"all 0.3s"}}>
          {[{title:t("Tính độ dài","Compute length"),formula:`|→a|² = →a · →a
|→a| = √(→a · →a)`,bg:"#eaf4fb",c:"#1a5276"},
            {title:t("Kiểm tra vuông góc","Check perpendicular"),formula:"→a ⊥ →b ⟺ →a · →b = 0",bg:"#eafaf1",c:"#1e8449"},
            {title:t("Tính góc giữa 2 vectơ","Compute angle"),formula:"cosφ = (→a·→b) / (|→a|·|→b|)",bg:"#fff3cd",c:"#856404"},
          ].map((card,i)=><article key={i} style={{padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:14,fontWeight:700,color:card.c,marginBottom:8}}>{card.title}</div><div style={{background:card.bg,color:card.c,fontFamily:"monospace",fontSize:13,padding:"8px 12px",borderRadius:8,whiteSpace:"pre-wrap",lineHeight:1.8}}>{card.formula}</div></article>)}
        </div>
      </section>
      <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("3. Tích Vô Hướng Theo Toạ Độ","3. Dot Product via Coordinates")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Nếu →a = (x₁, y₁) và →b = (x₂, y₂):","If →a=(x₁,y₁) and →b=(x₂,y₂):")}</div>
          <div style={{background:"white",borderRadius:10,padding:"14px 18px",textAlign:"center",fontFamily:"monospace",fontSize:17,color:"#0B4F5C",fontWeight:700,lineHeight:2.4}}>
            →a · →b = x₁x₂ + y₁y₂<br/>
            |→a|² = x₁² + y₁²<br/>
            cosφ = (x₁x₂+y₁y₂) / (√(x₁²+y₁²)·√(x₂²+y₂²))
          </div>
        </div>
      </section>
      <section id="th" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
          {[{id:"e1",q:t("→a=(3,4), →b=(4,−3). Tính →a·→b và kiểm tra vuông góc.","→a=(3,4), →b=(4,−3). Find →a·→b and check perpendicularity."),
             a:[t("→a·→b = 3·4 + 4·(−3) = 12 − 12 = 0","→a·→b=12−12=0"),t("→a·→b=0 → →a ⊥ →b ✓","→a⊥→b ✓")]},
            {id:"e2",q:t("Tam giác ABC: A(0,0), B(4,0), C(0,3). Tính góc A.","Triangle ABC: A(0,0), B(4,0), C(0,3). Find angle A."),
             a:[t("→AB=(4,0), →AC=(0,3)","→AB=(4,0), →AC=(0,3)"),t("→AB·→AC=4·0+0·3=0 → cos A=0 → A=90°","→AB·→AC=0 → A=90°")]},
            {id:"e3",q:t("→a=(1,1), →b=(1,0). Tính góc φ giữa →a và →b.","→a=(1,1), →b=(1,0). Find angle φ."),
             a:["→a·→b=1·1+1·0=1",t("|→a|=√2, |→b|=1","| →a|=√2, |→b|=1"),t("cosφ=1/(√2·1)=1/√2=√2/2 → φ=45°","cosφ=1/√2 → φ=45°")]},
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
      videoId="Kz_Mre-X0T0"
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
