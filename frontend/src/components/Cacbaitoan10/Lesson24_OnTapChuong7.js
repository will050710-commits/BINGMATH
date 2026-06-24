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

export default function Lesson24_OnTapChuong7() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson24_OnTapChuong7";
  const chapterTitle = { vi: "Chương VII · Bất Phương Trình Bậc Hai Một Ẩn", en: "Chương VII · Bất Phương Trình Bậc Hai Một Ẩn" };
  const lessonTitle = { vi: "Bài 23 · Dấu Tam Thức Bậc Hai", en: "L23 · Sign of Quadratic Trinomial" };
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
        "text": "quadratic inequality review",
        "vi": "ôn tập bất phương trình bậc hai",
        "detail": "<b>quadratic inequality review</b>: ôn tập bất phương trình bậc hai.",
        "detailTitle": "quadratic inequality review (ôn tập bất phương trình bậc hai)"
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
        "text": "sign chart",
        "vi": "bảng xét dấu",
        "detail": "<b>sign chart</b>: bảng xét dấu.",
        "detailTitle": "sign chart (bảng xét dấu)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "solution interval",
        "vi": "khoảng nghiệm",
        "detail": "<b>solution interval</b>: khoảng nghiệm.",
        "detailTitle": "solution interval (khoảng nghiệm)"
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
        "text": "quadratic equation",
        "vi": "phương trình bậc hai",
        "detail": "<b>quadratic equation</b>: phương trình bậc hai.",
        "detailTitle": "quadratic equation (phương trình bậc hai)"
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
        "text": "sign chart",
        "vi": "bảng xét dấu",
        "detail": "<b>sign chart</b>: bảng xét dấu.",
        "detailTitle": "sign chart (bảng xét dấu)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "solution interval",
        "vi": "khoảng nghiệm",
        "detail": "<b>solution interval</b>: khoảng nghiệm.",
        "detailTitle": "solution interval (khoảng nghiệm)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "quadratic equation",
        "vi": "phương trình bậc hai",
        "detail": "<b>quadratic equation</b>: phương trình bậc hai.",
        "detailTitle": "quadratic equation (phương trình bậc hai)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [];
  const tfCards = [{'s': 'f(x)=x²−2x+1=(x−1)²≥0 với mọi x.', 'a': true, 'ex': 'ĐÚNG — bình phương ≥0, bằng 0 tại x=1.'}, {'s': 'Nghiệm của x²−4x+4<0 là ∅.', 'a': true, 'ex': 'ĐÚNG — (x−2)²<0 vô nghiệm vì bình phương ≥0.'}, {'s': 'x⁴+1=0 có 2 nghiệm phức.', 'a': false, 'ex': 'SAI — trong bài toán Toán 10, ta chỉ xét nghiệm THỰC. Vô nghiệm thực.'}, {'s': 'Để ax²+bx+c>0 với mọi x∈ℝ, cần a>0 và Δ<0.', 'a': true, 'ex': 'ĐÚNG — cả hai điều kiện cần và đủ.'}, {'s': 'Nghiệm của x²−9≤0 là [−3,3].', 'a': true, 'ex': 'ĐÚNG — x₁=−3,x₂=3. a>0,≤0→[−3,3].'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'Để f(x)=ax²+bx+c>0 mọi x, cần a>0 và Δ___ 0', 'ans': '<', 'alt': ['<', 'nhỏ hơn', 'less than'], 'h': ''}, {'id': 'f2', 'tp': 'Nghiệm của x²−x−6≤0 là [___,___]', 'ans': '-2, 3', 'alt': ['-2,3', '[−2,3]', '−2,3', '-2 3'], 'h': 'x₁=−2,x₂=3'}, {'id': 'f3', 'tp': 'x⁴−5x²+4=0: sau đặt t=x² ta có (t−1)(t−___)=0', 'ans': '4', 'alt': ['4'], 'h': ''}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:40,transition:"all 0.3s"}}>
      {[{slug:"dau-tam-thuc-bac-hai",num:"23",title:t("Dấu Tam Thức Bậc Hai","Sign of Quadratic")},{slug:"giai-bpt-bac-hai",num:"24",title:t("Giải BPT Bậc Hai","Solving Quadratic Ineq.")},{slug:"phuong-trinh-quy-ve-bac-hai",num:"25",title:t("PT Quy Về Bậc Hai","Reducible Equations")}].map(l=>(<Link key={l.slug} href={`/cacbailam10/${l.slug}`} style={{textDecoration:"none"}}><article style={{padding:14,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",cursor:"pointer"}}><div style={{fontSize:12,color:"#777",marginBottom:3}}>{t("Bài","L")} {l.num}</div><div style={{fontSize:14,fontWeight:600,color:"#0B4F5C"}}>{l.title}</div><div style={{fontSize:12,color:"#aaa",marginTop:3}}>← {t("Ôn lại","Review")}</div></article></Link>))}
    </div>
    <section id="tomTat" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📚" title={t("Tóm Tắt Chương VII","Chapter VII Summary")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:22,transition:"all 0.3s"}}>
        {[{title:t("Bài 23 · Dấu Tam Thức Bậc Hai","L23 · Sign of Quadratic Trinomial"),pts:[t("f(x)=ax²+bx+c; Δ=b²−4ac","f(x)=ax²+bx+c; Δ=b²−4ac"),t("a>0,Δ>0: − trong (x₁,x₂), + ngoài","a>0,Δ>0: − inside (x₁,x₂), + outside"),t("a>0,Δ≤0: f(x)≥0 mọi x","a>0,Δ≤0: f(x)≥0 for all x"),t("a<0,Δ>0: + trong, − ngoài","a<0,Δ>0: + inside, − outside"),t("a<0,Δ≤0: f(x)≤0 mọi x","a<0,Δ≤0: f(x)≤0 for all x")]},
          {title:t("Bài 24 · Giải BPT Bậc Hai","L24 · Solving Quadratic Inequalities"),pts:[t("3 bước: tính Δ → bảng dấu → đọc nghiệm","3 steps: Δ → sign table → read solution"),t("a>0,Δ>0: f<0↔(x₁,x₂); f>0↔ngoài","a>0,Δ>0: f<0↔(x₁,x₂); f>0↔outside"),t("Đặc biệt: Δ<0,a>0→luôn dương","Special: Δ<0,a>0→always positive"),t("BPT tham số: điều kiện trên Δ","Parameter: condition on Δ")]},
          {title:t("Bài 25 · PT Quy Về Bậc Hai","L25 · Equations Reducible to Quadratic"),pts:[t("Trùng phương: đặt t=x²≥0","Biquadratic: let t=x²≥0"),t("t>0→x=±√t; t=0→x=0; t<0→loại","t>0→x=±√t; t=0→x=0; t<0→reject"),t("PT chứa căn: đặt ĐK rồi bình phương","Root equations: set conditions then square"),t("PT tích: A·B=0↔A=0 hoặc B=0","Product: A·B=0↔A=0 or B=0")]},
        ].map((card,i)=>(<article key={i} style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:12}}>{card.title}</div>{card.pts.map((pt,j)=><div key={j} style={{fontSize:13,color:"#555",marginBottom:8,display:"flex",gap:8}}><span style={{color:"#0B4F5C",fontWeight:700,flexShrink:0}}>•</span><span style={{fontFamily:"monospace"}}>{pt}</span></div>)}</article>))}
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="8Xw3Z_O_bZ0"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
          />
        </div>
      </section>
    <section id="congThuc" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📐" title={t("Bảng Công Thức & Nghiệm","Formula & Solution Table")} />
      <div className="reveal" data-reveal style={{overflowX:"auto",borderRadius:10,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:13,minWidth:600}}>
          <thead><tr style={{background:"#0B4F5C",color:"white"}}>{["Điều kiện","f>0","f≥0","f<0","f≤0"].map((h,i)=><td key={i} style={{padding:"10px 12px",textAlign:"center",fontWeight:700,border:"1px solid rgba(255,255,255,0.2)"}}>{h}</td>)}</tr></thead>
          <tbody>
            {[["a>0, Δ>0","(−∞,x₁)∪(x₂,+∞)","(−∞,x₁]∪[x₂,+∞)","(x₁,x₂)","[x₁,x₂]"],
              ["a>0, Δ=0","ℝ\{x₀}","ℝ","∅","{x₀}"],
              ["a>0, Δ<0","ℝ","ℝ","∅","∅"],
              ["a<0, Δ>0","(x₁,x₂)","[x₁,x₂]","(−∞,x₁)∪(x₂,+∞)","(−∞,x₁]∪[x₂,+∞)"],
              ["a<0, Δ=0","∅","{x₀}","ℝ\{x₀}","ℝ"],
              ["a<0, Δ<0","∅","∅","ℝ","ℝ"]
            ].map((row,ri)=>(<tr key={ri} style={{background:ri%2===0?"#f9f9f9":"white"}}>{row.map((cell,ci)=>(<td key={ci} style={{padding:"8px 12px",textAlign:"center",border:"1px solid #e0e0e0",fontFamily:"monospace",fontSize:12,fontWeight:ci===0?700:400,color:ci===0?"#0B4F5C":"#333"}}>{cell}</td>))}</tr>))}
          </tbody>
        </table>
      </div>
    </section>
    <section id="baiTap" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Bài Tập Tổng Hợp","Mixed Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",badge:"L23+24",q:t(`Giải bất phương trình:
(a) x²−x−6>0
(b) −2x²+4x−2≥0`,`Solve:
(a) x²−x−6>0
(b) −2x²+4x−2≥0`),a:[t("(a) Δ=1+24=25; x₁=−2,x₂=3. a>0,BPT>0 → (−∞,−2)∪(3,+∞)","(a) roots −2,3. a>0,>0 → (−∞,−2)∪(3,+∞)"),t("(b) −2(x²−2x+1)=−2(x−1)²≥0","−2(x−1)²≥0"),t("−2(x−1)²≤0 mọi x, =0 khi x=1 → −2(x−1)²≥0 chỉ khi x=1","Only x=1 gives ≥0 → solution: {1}")]},
          {id:"e2",badge:"L25",q:t("Giải phương trình: x⁴−10x²+9=0","Solve: x⁴−10x²+9=0"),a:[t("Đặt t=x²≥0: t²−10t+9=0","Let t=x²: t²−10t+9=0"),t("(t−1)(t−9)=0 → t=1 hoặc t=9","t=1 or t=9"),t("x²=1→x=±1; x²=9→x=±3","x=±1 or x=±3"),t("Tất cả 4 nghiệm: {−3,−1,1,3}","4 solutions: {−3,−1,1,3}")]},
          {id:"e3",badge:t("Tổng hợp","Mixed"),q:t("Tìm m để BPT x²−2(m+1)x+m²+3m+2>0 đúng với mọi x.","Find m so that x²−2(m+1)x+m²+3m+2>0 for all x."),a:[t("a=1>0. Cần Δ<0.","a=1>0. Need Δ<0."),t("Δ=4(m+1)²−4(m²+3m+2)","Δ=4(m+1)²−4(m²+3m+2)"),t("=4(m²+2m+1−m²−3m−2)=4(−m−1)=−4m−4","=−4m−4"),t("Δ<0: −4m−4<0 → m>−1","Δ<0 → m>−1")]},
        ].map(({id,q,a,badge})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{fontSize:17,fontWeight:600}}>📝 {t("Bài tập","Exercise")}</div><span style={{background:"black",color:"white",fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20}}>{badge}</span></div><div style={{fontSize:15,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color:"#555",marginBottom:6}}>{l}</div>)}</div>}</article>))}
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
      videoId="8Xw3Z_O_bZ0"
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
