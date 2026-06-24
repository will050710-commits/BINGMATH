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

export default function Lesson23_PhuongTrinhQuyVeBacHai() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson23_PhuongTrinhQuyVeBacHai";
  const chapterTitle = { vi: "Chương VII · Bất Phương Trình Bậc Hai Một Ẩn", en: "Chương VII · Bất Phương Trình Bậc Hai Một Ẩn" };
  const lessonTitle = { vi: "Bài 23: Phương Trình Quy Về Bậc Hai", en: "Bài 23: Phương Trình Quy Về Bậc Hai" };
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
        "text": "equations reducible to quadratic",
        "vi": "phương trình quy về bậc hai",
        "detail": "<b>equations reducible to quadratic</b>: phương trình quy về bậc hai.",
        "detailTitle": "equations reducible to quadratic (phương trình quy về bậc hai)"
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
        "text": "substitution",
        "vi": "đặt ẩn phụ",
        "detail": "<b>substitution</b>: đặt ẩn phụ.",
        "detailTitle": "substitution (đặt ẩn phụ)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "domain condition",
        "vi": "điều kiện xác định",
        "detail": "<b>domain condition</b>: điều kiện xác định.",
        "detailTitle": "domain condition (điều kiện xác định)"
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
        "text": "extraneous root",
        "vi": "nghiệm ngoại lai",
        "detail": "<b>extraneous root</b>: nghiệm ngoại lai.",
        "detailTitle": "extraneous root (nghiệm ngoại lai)"
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
        "text": "substitution",
        "vi": "đặt ẩn phụ",
        "detail": "<b>substitution</b>: đặt ẩn phụ.",
        "detailTitle": "substitution (đặt ẩn phụ)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "domain condition",
        "vi": "điều kiện xác định",
        "detail": "<b>domain condition</b>: điều kiện xác định.",
        "detailTitle": "domain condition (điều kiện xác định)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "extraneous root",
        "vi": "nghiệm ngoại lai",
        "detail": "<b>extraneous root</b>: nghiệm ngoại lai.",
        "detailTitle": "extraneous root (nghiệm ngoại lai)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': 'x⁴−5x²+4=0. Đặt t=x²: phương trình theo t là?', 'o': ['t²−5t+4=0', 't²+5t+4=0', 't²−5t−4=0', '2t−5=0'], 'a': 0, 'ex': 't=x²: (x²)²−5(x²)+4=t²−5t+4=0.'}, {'q': 'Phương trình trùng phương ax⁴+bx²+c=0 dùng ẩn phụ t=?', 'o': ['t=x', 't=x²', 't=x³', 't=√x'], 'a': 1, 'ex': 'Đặt t=x²≥0 để đưa về bậc hai.'}, {'q': 'Từ t=x²=4, giá trị x là?', 'o': ['x=4', 'x=2', 'x=±2', 'x=±4'], 'a': 2, 'ex': 'x²=4 → x=±2.'}, {'q': '√(x+1)=x−1. Điều kiện là?', 'o': ['x≥−1', 'x≥1', 'x≥0', 'x≥−1 và x≥1'], 'a': 3, 'ex': '√(x+1): x+1≥0→x≥−1; vế phải x−1≥0→x≥1. Kết hợp: x≥1.'}, {'q': 'x⁴−x²=0. Nghiệm?', 'o': ['x=0 hoặc x=1', 'x=0 hoặc x=±1', 'x=1', 'x=±1'], 'a': 1, 'ex': 'x²(x²−1)=0 → x²=0 (x=0) hoặc x²=1 (x=±1).'}];
  const tfCards = [{'s': 'x⁴−3x²+2=0 có tất cả 4 nghiệm thực.', 'a': true, 'ex': 'ĐÚNG — t²−3t+2=(t−1)(t−2)=0; t=1→x=±1; t=2→x=±√2. Tổng 4 nghiệm.'}, {'s': 'Khi giải √f(x)=g(x), sau khi bình phương phải kiểm tra lại nghiệm.', 'a': true, 'ex': 'ĐÚNG — bình phương có thể tạo ra nghiệm ngoại lai.'}, {'s': 'x⁴+x²+1=0 có 2 nghiệm thực.', 'a': false, 'ex': 'SAI — t²+t+1=0 (t=x²≥0): Δ=1−4=−3<0 → vô nghiệm. PT không có nghiệm thực.'}, {'s': 'Phương trình tích A·B=0 khi và chỉ khi A=0 hoặc B=0.', 'a': true, 'ex': 'ĐÚNG — đây là tính chất cơ bản.'}, {'s': 'Từ t=x²=−1, ta được x=±i (nghiệm ảo).', 'a': false, 'ex': 'SAI — trong ℝ, x²=−1 vô nghiệm (loại). Chỉ làm việc trong ℝ.'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'x⁴−10x²+9=0. Đặt t=x², phương trình: t²−10t+___ =0', 'ans': '9', 'alt': ['9'], 'h': ''}, {'id': 'f2', 'tp': 'x⁴−10x²+9=0 có ___ nghiệm thực.', 'ans': '4', 'alt': ['4', 'bốn', 'four'], 'h': 't=1→x=±1; t=9→x=±3'}, {'id': 'f3', 'tp': '√(2x+1)=3. Bình phương: 2x+1=___', 'ans': '9', 'alt': ['9'], 'h': '3²=9'}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Nhiều phương trình thoạt nhìn không phải bậc hai nhưng sau khi đặt ẩn phụ hoặc biến đổi sẽ trở thành phương trình bậc hai. Đây là kỹ năng quan trọng trong đại số.","Many equations that appear non-quadratic become quadratic after substitution or transformation. This is a key algebraic skill.")}</div>
        <div style={{fontSize:16}}>❓ <em>{t("x⁴−5x²+4=0 có phải phương trình bậc hai không? Gợi ý: đặt t=x².","Is x⁴−5x²+4=0 a quadratic? Hint: let t=x².")}</em></div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="0_fSIsZHeZk"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (YouTube)", "Video by Khan Academy (YouTube)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Phương Trình Trùng Phương","1. Biquadratic Equations")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{fontWeight:"bold",fontSize:16,color: "#22d3ee",marginBottom:10}}>{t("Dạng: ax⁴+bx²+c=0 (a≠0)","Form: ax⁴+bx²+c=0 (a≠0)")}</div>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Đặt t=x² (t≥0) → at²+bt+c=0 (phương trình bậc hai theo t).","Let t=x² (t≥0) → at²+bt+c=0.")}</div>
        <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:14,lineHeight:2}}>
          t = x² ≥ 0 (điều kiện cần nhớ!)<br/>
          t &gt; 0 → x = ±√t<br/>
          t = 0 → x = 0<br/>
          t &lt; 0 → loại (không có nghiệm thực)
        </div>
      </div>
      <div className="reveal" data-reveal style={{padding:16,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:15,fontWeight:700,color: "#22d3ee",marginBottom:10}}>📘 {t("Ví dụ: x⁴−5x²+4=0","Example: x⁴−5x²+4=0")}</div>
        <div style={{fontSize:14,color: "rgba(255, 255, 255, 0.7)",display:"flex",flexDirection:"column",gap:6}}>
          <div>{t("Đặt t=x²: t²−5t+4=0","Let t=x²: t²−5t+4=0")}</div>
          <div>{t("(t−1)(t−4)=0 → t=1 hoặc t=4","(t−1)(t−4)=0 → t=1 or t=4")}</div>
          <div>{t("t=1: x²=1 → x=±1; t=4: x²=4 → x=±2","t=1: x=±1; t=4: x=±2")}</div>
          <div style={{color:"#4ade80",fontWeight:600}}>{t("Nghiệm: x∈{−2,−1,1,2}","Solutions: x∈{−2,−1,1,2}")}</div>
        </div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Phương Trình Chứa Căn","2. Equations with Square Roots")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:18,transition:"all 0.3s"}}>
        {[{title:t("Dạng √f(x)=g(x)","Form √f(x)=g(x)"),steps:[t("ĐK: f(x)≥0 và g(x)≥0","Cond: f(x)≥0 and g(x)≥0"),t("Bình phương: f(x)=g²(x)","Square both: f(x)=g²(x)"),t("Giải và đối chiếu ĐK","Solve and check conditions")],c:"#38bdf8",bg:"rgba(14, 165, 233, 0.15)"},
          {title:t("Dạng √(ax²+bx+c)=√(dx²+ex+f)","Form with equal roots"),steps:[t("ĐK: cả hai vế ≥0","Cond: both sides ≥0"),t("Bình phương: ax²+bx+c=dx²+ex+f","Square: equate expressions"),t("Giải pt bậc 1 hoặc 2","Solve linear or quadratic")],c:"#4ade80",bg:"rgba(16, 185, 129, 0.15)"},
          {title:t("Đặt ẩn phụ √f(x)=t (t≥0)","Substitution √f(x)=t, t≥0"),steps:[t("Đặt t=√(ax²+bx+c), t≥0","Let t=√(ax²+bx+c), t≥0"),t("Biểu diễn pt theo t","Rewrite equation in t"),t("Giải, tìm x từ t","Solve, recover x from t")],c:"#f87171",bg:"rgba(239, 68, 68, 0.15)"},
        ].map((card,i)=>(<article key={i} style={{padding:18,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:14,fontWeight:700,color:card.c,marginBottom:10}}>{card.title}</div>{card.steps.map((s,j)=><div key={j} style={{fontSize:13,color: "rgba(255, 255, 255, 0.7)",marginBottom:6,display:"flex",gap:8}}><span style={{color:card.c,fontWeight:700}}>→</span><span>{s}</span></div>)}</article>))}
      </div>
    </section>
    <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("3. Phương Trình Tích","3. Product Form Equations")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Đưa về dạng tích A·B=0, rồi giải A=0 hoặc B=0:","Reduce to product A·B=0, then solve A=0 or B=0:")}</div>
        <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:14,lineHeight:2}}>
          x³−4x=0 → x(x²−4)=0 → x(x−2)(x+2)=0<br/>
          → x=0 hoặc x=2 hoặc x=−2<br/><br/>
          x⁴−x²−6=0 → (x²−3)(x²+2)=0<br/>
          → x²=3 (x=±√3) hoặc x²=−2 (loại)
        </div>
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:"x⁴−13x²+36=0",a:[t("Đặt t=x²: t²−13t+36=0","Let t=x²: t²−13t+36=0"),t("(t−4)(t−9)=0 → t=4 hoặc t=9","t=4 or t=9"),t("x²=4→x=±2; x²=9→x=±3","x=±2 or x=±3")]},
          {id:"e2",q:"√(x+3)=x−1",a:[t("ĐK: x+3≥0 → x≥−3; và x−1≥0 → x≥1","Cond: x≥−3 and x−1≥0 → x≥1"),t("Bình phương: x+3=(x−1)²=x²−2x+1","Square: x+3=x²−2x+1"),t("x²−3x−2=... đúng là x²−3x−2=0? Kiểm tra: x+3=x²−2x+1 → x²−3x−2=0","x²−3x−2=0"),t("x=(3±√17)/2. Kiểm tra x≥1: x=(3+√17)/2≈3.56 ✓; x=(3−√17)/2≈−0.56 ✗","x=(3+√17)/2 only")]},
          {id:"e3",q:"x⁴−5x²+4≤0",a:[t("Đặt t=x²≥0: t²−5t+4=(t−1)(t−4)≤0","Let t=x²: (t−1)(t−4)≤0"),t("1≤t≤4, kết hợp t=x²≥0: 1≤x²≤4","1≤x²≤4"),t("x²≥1 và x²≤4 → 1≤|x|≤2 → x∈[−2,−1]∪[1,2]","x∈[−2,−1]∪[1,2]")]},
        ].map(({id,q,a})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:18,fontWeight:600,marginBottom:4}}>📝 {t("Bài tập","Exercise")}</div><div style={{fontFamily:"monospace",fontSize:16,color: "#22d3ee"}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"rgba(16, 185, 129, 0.15)",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color: "rgba(255, 255, 255, 0.7)",marginBottom:6}}>{l}</div>)}</div>}</article>))}
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
      videoId="0_fSIsZHeZk"
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
