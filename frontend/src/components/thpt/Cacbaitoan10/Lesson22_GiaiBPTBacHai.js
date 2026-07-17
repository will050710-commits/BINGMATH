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

export default function Lesson22_GiaiBPTBacHai() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson22_GiaiBPTBacHai";
  const chapterTitle = { vi: "Chương VII · Bất Phương Trình Bậc Hai Một Ẩn", en: "Chương VII · Bất Phương Trình Bậc Hai Một Ẩn" };
  const lessonTitle = { vi: "Bài 22: Giải Bất Phương Trình Bậc Hai", en: "Bài 22: Giải Bất Phương Trình Bậc Hai" };
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
        "text": "quadratic inequalities",
        "vi": "bất phương trình bậc hai",
        "detail": "<b>quadratic inequalities</b>: bất phương trình bậc hai.",
        "detailTitle": "quadratic inequalities (bất phương trình bậc hai)"
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
        "text": "interval",
        "vi": "khoảng nghiệm",
        "detail": "<b>interval</b>: khoảng nghiệm.",
        "detailTitle": "interval (khoảng nghiệm)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "root",
        "vi": "nghiệm",
        "detail": "<b>root</b>: nghiệm.",
        "detailTitle": "root (nghiệm)"
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
        "text": "solution set",
        "vi": "tập nghiệm",
        "detail": "<b>solution set</b>: tập nghiệm.",
        "detailTitle": "solution set (tập nghiệm)"
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
        "text": "interval",
        "vi": "khoảng nghiệm",
        "detail": "<b>interval</b>: khoảng nghiệm.",
        "detailTitle": "interval (khoảng nghiệm)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "root",
        "vi": "nghiệm",
        "detail": "<b>root</b>: nghiệm.",
        "detailTitle": "root (nghiệm)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "solution set",
        "vi": "tập nghiệm",
        "detail": "<b>solution set</b>: tập nghiệm.",
        "detailTitle": "solution set (tập nghiệm)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': 'x²−3x−4<0. Tập nghiệm?', 'o': ['(−1,4)', '(−∞,−1)∪(4,+∞)', '[−1,4]', '∅'], 'a': 0, 'ex': 'Δ=9+16=25>0; x₁=−1,x₂=4. a>0,BPT<0 → (−1,4).'}, {'q': '2x²−8>0. Tập nghiệm?', 'o': ['(−2,2)', '(−∞,−2)∪(2,+∞)', '[−2,2]', 'ℝ'], 'a': 1, 'ex': 'x²>4 → x<−2 hoặc x>2.'}, {'q': '−x²+6x−9≤0. Tập nghiệm?', 'o': ['∅', 'ℝ', '{3}', 'ℝ\\{3}'], 'a': 1, 'ex': '−(x−3)²≤0 luôn đúng vì −(x−3)²≤0 với mọi x → ℝ.'}, {'q': 'x²+4x+5>0. Tập nghiệm?', 'o': ['(−5,−1)', '∅', 'ℝ', '(−∞,−5)∪(−1,+∞)'], 'a': 2, 'ex': 'Δ=16−20=−4<0, a=1>0 → f(x)>0 mọi x → ℝ.'}, {'q': 'Giải x²≤9.', 'o': ['(−3,3)', '[−3,3]', '(−∞,−3]∪[3,+∞)', '∅'], 'a': 1, 'ex': 'x²−9≤0, x₁=−3,x₂=3, a>0,BPT≤0 → [−3,3].'}];
  const tfCards = [{'s': 'Nghiệm của x²>0 là ℝ\\{0}.', 'a': true, 'ex': 'ĐÚNG — x²>0 khi x≠0. Tại x=0, x²=0 không thỏa.'}, {'s': 'Nghiệm của x²+1<0 là ∅.', 'a': true, 'ex': 'ĐÚNG — x²+1≥1>0 mọi x → không có nghiệm.'}, {'s': 'Khi giải BPT, nhân 2 vế với số âm thì không đổi chiều bất phương trình.', 'a': false, 'ex': 'SAI — nhân với số ÂM thì phải ĐỔI CHIỀU BPT.'}, {'s': 'Nghiệm của ax²+bx+c>0 (a>0, Δ=0) là x∈ℝ\\{x₀}.', 'a': true, 'ex': 'ĐÚNG — a>0,Δ=0: f(x)=a(x−x₀)²≥0, bằng 0 tại x₀, dương với x≠x₀.'}, {'s': 'Nghiệm của (x−1)²<0 là ∅.', 'a': true, 'ex': 'ĐÚNG — bình phương luôn ≥0, không thể < 0.'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'x²−5x+6≤0. Nghiệm (Solution): ___.', 'ans': '[2,3]', 'alt': ['[2,3]', '2≤x≤3'], 'h': 'x₁=2,x₂=3'}, {'id': 'f2', 'tp': 'a>0, Δ<0. BPT f(x)>0 có nghiệm (solution): ___.', 'ans': 'ℝ', 'alt': ['R', 'ℝ', 'all real'], 'h': ''}, {'id': 'f3', 'tp': 'a<0, Δ<0. BPT f(x)≤0 có nghiệm (solution): ___.', 'ans': 'ℝ', 'alt': ['R', 'ℝ', 'all real'], 'h': ''}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Bài toán kinh tế: doanh thu R(x)=−x²+10x và chi phí C(x)=2x+15. Cần tìm x để có lãi: R(x)>C(x), tức −x²+10x>2x+15, tức −x²+8x−15>0. Đây là bất phương trình bậc hai!","Economic problem: revenue R(x)=−x²+10x, cost C(x)=2x+15. Find x for profit: R(x)>C(x) → −x²+8x−15>0. This is a quadratic inequality!")}</div>
        <div style={{fontSize:16}}>❓ <em>{t("Giải −x²+8x−15>0. Gợi ý: tìm nghiệm rồi dùng bảng xét dấu.","Solve −x²+8x−15>0. Hint: find roots then use sign table.")}</em></div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="xdiBjypYFRQ"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Quy Trình Giải BPT Bậc Hai","1. Steps to Solve Quadratic Inequality")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{fontWeight:"bold",fontSize:16,color: "#22d3ee",marginBottom:14}}>{t("3 bước giải bất phương trình bậc hai ax²+bx+c ≥ 0 (hoặc >0, ≤0, <0):","3 steps to solve ax²+bx+c≥0 (or >0,≤0,<0):")}</div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"flex",flexDirection:"column",gap:12,transition:"all 0.3s"}}>
          {[t("① Tính Δ=b²−4ac. Nếu Δ>0 tìm x₁<x₂; Δ=0 tìm x₀; Δ<0 ghi 'vô nghiệm'","① Compute Δ=b²−4ac. If Δ>0 find x₁<x₂; Δ=0 find x₀; Δ<0 note 'no real roots'"),
            t("② Lập bảng xét dấu của f(x)=ax²+bx+c","② Build the sign table for f(x)=ax²+bx+c"),
            t("③ Đọc nghiệm từ bảng dấu theo yêu cầu bất phương trình","③ Read solution from sign table according to the inequality direction")
          ].map((step,i)=>(<div key={i} style={{display:"flex",gap:14,alignItems:"flex-start"}}><div style={{minWidth:32,height:32,borderRadius:"50%",background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,flexShrink:0}}>{i+1}</div><div style={{fontSize:15,color: "rgba(255, 255, 255, 0.7)",lineHeight:1.7,paddingTop:4}}>{step}</div></div>))}
        </div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Bảng Tổng Hợp Nghiệm","2. Solution Summary Table")} />
      <div className="reveal" data-reveal style={{overflowX:"auto",borderRadius:10,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:13,minWidth:600}}>
          <thead><tr style={{background:"#22d3ee",color:"white"}}>
            {[t("Điều kiện","Condition"),t("BPT: f(x)>0","f(x)>0"),t("BPT: f(x)≥0","f(x)≥0"),t("BPT: f(x)<0","f(x)<0"),t("BPT: f(x)≤0","f(x)≤0")].map((h,i)=>
              <td key={i} style={{padding:"10px 12px",textAlign:"center",fontWeight:700,border:"1px solid rgba(255,255,255,0.2)"}}>{h}</td>)}
          </tr></thead>
          <tbody>
            {[["a>0, Δ>0","(−∞,x₁)∪(x₂,+∞)","(−∞,x₁]∪[x₂,+∞)","(x₁,x₂)","[x₁,x₂]"],
              ["a>0, Δ=0","x≠x₀ (ℝ\{x₀})","ℝ","∅","{x₀}"],
              ["a>0, Δ<0","ℝ","ℝ","∅","∅"],
              ["a<0, Δ>0","(x₁,x₂)","[x₁,x₂]","(−∞,x₁)∪(x₂,+∞)","(−∞,x₁]∪[x₂,+∞)"],
              ["a<0, Δ=0","∅","{x₀}","x≠x₀ (ℝ\{x₀})","ℝ"],
              ["a<0, Δ<0","∅","∅","ℝ","ℝ"]
            ].map((row,ri)=>(
              <tr key={ri} style={{background:ri%2===0?"#f9f9f9":"white"}}>
                {row.map((cell,ci)=>(<td key={ci} style={{padding:"8px 12px",textAlign:"center",border:"1px solid #e0e0e0",fontFamily:"monospace",fontSize:12,fontWeight:ci===0?700:400,color:ci===0?"#22d3ee":"#333"}}>{cell}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
    <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("3. Ví Dụ Minh Hoạ","3. Worked Examples")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,transition:"all 0.3s"}}>
        {[{title:"x²−5x+6<0",steps:[t("a=1>0, Δ=25−24=1>0","a=1>0, Δ=1>0"),t("x₁=2, x₂=3","x₁=2, x₂=3"),t("a>0,Δ>0,BPT<0 → nghiệm: (2,3)","a>0,Δ>0,BPT<0 → solution: (2,3)")],c:"#4ade80",bg:"rgba(16, 185, 129, 0.15)"},
          {title:"−x²+4x−3≥0",steps:[t("Nhân (−1): x²−4x+3≤0","Multiply by −1: x²−4x+3≤0 (flip sign)"),t("a=1>0, Δ=16−12=4>0","a=1>0, Δ=4>0"),t("x₁=1, x₂=3. BPT≤0 → nghiệm: [1,3]","x₁=1, x₂=3. → solution: [1,3]")],c:"#38bdf8",bg:"rgba(14, 165, 233, 0.15)"},
          {title:"x²+x+1>0",steps:[t("a=1>0, Δ=1−4=−3<0","a=1>0, Δ=−3<0"),t("a>0, Δ<0 → f(x)>0 mọi x","a>0, Δ<0 → f(x)>0 for all x"),t("Nghiệm: x∈ℝ","Solution: x∈ℝ")],c:"#fbbf24",bg:"rgba(245, 158, 11, 0.15)"},
        ].map((ex,i)=>(<article key={i} style={{padding:18,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:ex.c,background:ex.bg,padding:"4px 12px",borderRadius:6,display:"inline-block",marginBottom:10}}>{ex.title}</div>{ex.steps.map((s,j)=><div key={j} style={{fontSize:14,color: "rgba(255, 255, 255, 0.7)",marginBottom:6,display:"flex",gap:8}}><span style={{color:ex.c,fontWeight:700,flexShrink:0}}>→</span><span>{s}</span></div>)}</article>))}
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:"2x²−7x+3≤0",a:[t("a=2>0, Δ=49−24=25","a=2>0, Δ=25"),t("x₁=(7−5)/4=1/2, x₂=(7+5)/4=3","x₁=1/2, x₂=3"),t("a>0,Δ>0,BPT≤0 → [1/2, 3]","solution: [1/2, 3]")]},
          {id:"e2",q:"−3x²+6x−3<0",a:[t("−3(x²−2x+1)=−3(x−1)²","factor: −3(x−1)²"),t("Δ=0, x₀=1. a=−3<0","Δ=0, x₀=1, a<0"),t("a<0,Δ=0: f<0 khi x≠1 → nghiệm: x∈ℝ\{1}","solution: ℝ\{1}")]},
          {id:"e3",q:t("Tìm m để x²−2mx+m²−1>0 với mọi x.","Find m so that x²−2mx+m²−1>0 for all x."),a:[t("a=1>0. Cần Δ<0 để luôn dương.","a=1>0. Need Δ<0 for always positive."),t("Δ=4m²−4(m²−1)=4<0? → 4<0 vô lý!","Δ=4<0? → impossible! Δ=4>0 always"),t("Δ=4>0 luôn đúng → không có m nào thoả mãn.","Δ=4>0 always → no such m exists.")]},
        ].map(({id,q,a})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:18,fontWeight:600,marginBottom:4}}>📝 {t("Giải BPT","Solve")}</div><div style={{fontFamily:"monospace",fontSize:16,color: "#22d3ee"}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"rgba(16, 185, 129, 0.15)",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color: "rgba(255, 255, 255, 0.7)",marginBottom:6}}>{l}</div>)}</div>}</article>))}
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
      videoId="xdiBjypYFRQ"
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
