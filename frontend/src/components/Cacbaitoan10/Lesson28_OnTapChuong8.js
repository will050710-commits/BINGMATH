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

export default function Lesson28_OnTapChuong8() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson28_OnTapChuong8";
  const chapterTitle = { vi: "Chương VIII · Tổ Hợp", en: "Chương VIII · Tổ Hợp" };
  const lessonTitle = { vi: "Lesson28_OnTapChuong8", en: "Lesson28_OnTapChuong8" };
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
        "text": "combinatorics review",
        "vi": "ôn tập đại số tổ hợp",
        "detail": "<b>combinatorics review</b>: ôn tập đại số tổ hợp.",
        "detailTitle": "combinatorics review (ôn tập đại số tổ hợp)"
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
        "text": "counting principle",
        "vi": "nguyên lý đếm",
        "detail": "<b>counting principle</b>: nguyên lý đếm.",
        "detailTitle": "counting principle (nguyên lý đếm)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "combination",
        "vi": "tổ hợp",
        "detail": "<b>combination</b>: tổ hợp.",
        "detailTitle": "combination (tổ hợp)"
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
        "text": "binomial theorem",
        "vi": "nhị thức Newton",
        "detail": "<b>binomial theorem</b>: nhị thức Newton.",
        "detailTitle": "binomial theorem (nhị thức Newton)"
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
        "text": "counting principle",
        "vi": "nguyên lý đếm",
        "detail": "<b>counting principle</b>: nguyên lý đếm.",
        "detailTitle": "counting principle (nguyên lý đếm)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "combination",
        "vi": "tổ hợp",
        "detail": "<b>combination</b>: tổ hợp.",
        "detailTitle": "combination (tổ hợp)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "binomial theorem",
        "vi": "nhị thức Newton",
        "detail": "<b>binomial theorem</b>: nhị thức Newton.",
        "detailTitle": "binomial theorem (nhị thức Newton)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': 'A₅² = ?', 'o': ['10', '20', '15', '25'], 'a': 1, 'ex': '5×4=20.'}, {'q': 'C₈³ = ?', 'o': ['56', '28', '168', '336'], 'a': 0, 'ex': '8×7×6/6=56.'}, {'q': 'Σ C₄ᵏ = ?', 'o': ['4', '8', '16', '24'], 'a': 2, 'ex': '2⁴=16.'}, {'q': 'Hệ số x² trong (1+x)⁵?', 'o': ['5', '10', '20', '15'], 'a': 1, 'ex': 'C₅²=10.'}, {'q': 'P₆ = ?', 'o': ['720', '120', '24', '360'], 'a': 0, 'ex': '6!=720.'}];
  const tfCards = [{'s': 'Aₙᵏ = k!·Cₙᵏ.', 'a': true, 'ex': 'ĐÚNG — Aₙᵏ = Cₙᵏ×k!.'}, {'s': 'C₁₀⁴ = C₁₀⁶.', 'a': true, 'ex': 'ĐÚNG — Cₙᵏ=Cₙⁿ⁻ᵏ → C₁₀⁴=C₁₀⁶.'}, {'s': '(a+b)⁵ có 6 số hạng.', 'a': true, 'ex': 'ĐÚNG — n+1=6.'}, {'s': 'Trong nhị thức Newton, T₁ ứng với k=1.', 'a': false, 'ex': 'SAI — T₁ ứng với k=0 (T_{k+1} với k=0).'}, {'s': '5! = 120.', 'a': true, 'ex': 'ĐÚNG — 5!=5×4×3×2×1=120.'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'Cₙᵏ = n! / (k! × ___)', 'ans': '(n-k)!', 'alt': ['(n-k)!', '(n−k)!'], 'h': ''}, {'id': 'f2', 'tp': 'C₁₀² = ___', 'ans': '45', 'alt': ['45'], 'h': '10×9/2'}, {'id': 'f3', 'tp': 'Σₖ₌₀³ C₃ᵏ = ___', 'ans': '8', 'alt': ['8'], 'h': '2³=8'}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:40,transition:"all 0.3s"}}>
      {[{slug:"quy-tac-cong-nhan",num:"27",title:t("Quy Tắc Cộng & Nhân","Add & Mult. Rules")},{slug:"hoan-vi-chinh-hop-to-hop",num:"28",title:t("Hoán Vị, Chỉnh Hợp, Tổ Hợp","P, A, C")},{slug:"nhi-thuc-newton",num:"29",title:t("Nhị Thức Newton","Binomial Theorem")}].map(l=>(<Link key={l.slug} href={`/cacbailam10/${l.slug}`} style={{textDecoration:"none"}}><article style={{padding:14,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",cursor:"pointer"}}><div style={{fontSize:12,color: "rgba(255, 255, 255, 0.5)",marginBottom:3}}>{t("Bài","L")} {l.num}</div><div style={{fontSize:14,fontWeight:600,color: "#22d3ee"}}>{l.title}</div></article></Link>))}
    </div>
    <section id="tomTat" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📚" title={t("Tóm Tắt Chương VIII","Chapter VIII Summary")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,transition:"all 0.3s"}}>
        {[{title:t("Quy Tắc Đếm","Counting Rules"),pts:["QT Nhân: N=n₁×n₂×...×nₖ (đồng thời)","QT Cộng: N=n₁+n₂+...+nₖ (xung khắc)"]},
          {title:t("Công Thức","Formulas"),pts:["Pₙ = n! (hoán vị)","Aₙᵏ = n!/(n−k)! (chỉnh hợp, có TT)","Cₙᵏ = n!/(k!(n−k)!) (tổ hợp, không TT)","Cₙᵏ = Cₙⁿ⁻ᵏ"]},
          {title:t("Nhị Thức Newton","Binomial Theorem"),pts:["(a+b)ⁿ = ΣCₙᵏ·aⁿ⁻ᵏ·bᵏ","T_{k+1}=Cₙᵏ·aⁿ⁻ᵏ·bᵏ (k=0..n)","Σ Cₙᵏ = 2ⁿ (tổng hệ số)","Tam Giác Pascal: tổng 2 số trên"]},
        ].map((card,i)=>(<article key={i} style={{padding:18,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:15,fontWeight:700,color: "#22d3ee",marginBottom:10}}>{card.title}</div>{card.pts.map((pt,j)=><div key={j} style={{fontSize:13,color: "rgba(255, 255, 255, 0.7)",marginBottom:7,display:"flex",gap:8}}><span style={{color: "#22d3ee",fontWeight:700,flexShrink:0}}>•</span><span style={{fontFamily:"monospace"}}>{pt}</span></div>)}</article>))}
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="HDLBCv4yyIs"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
          />
        </div>
      </section>
    <section id="baiTap" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Bài Tập Tổng Hợp","Mixed Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",badge:"L27+28",q:t("Từ {0,1,2,3,4,5} lập số tự nhiên có 4 chữ số khác nhau và chữ số đầu ≠ 0. Bao nhiêu số?","From {0,1,2,3,4,5} form 4-digit numbers with distinct digits, first digit ≠ 0. How many?"),a:[t("Hàng nghìn: 5 cách (1-5, không dùng 0)","Thousands: 5 ways (1-5, not 0)"),t("Hàng trăm: 5 cách (0 và 4 số còn lại)","Hundreds: 5 ways"),t("Hàng chục: 4 cách, hàng đơn vị: 3 cách","Tens: 4, Units: 3"),"5×5×4×3 = 300"]},
          {id:"e2",badge:"L28",q:t("Lớp 10 có 20 HS: 12 nam, 8 nữ. Chọn 3 HS bao gồm ít nhất 1 nữ. Bao nhiêu cách?","Class of 20: 12 boys, 8 girls. Choose 3 including at least 1 girl. How many?"),a:[t("Cách 1: Tổng − (không có nữ) = C₂₀³ − C₁₂³","Total − all-boys = C₂₀³−C₁₂³"),"C₂₀³ = 1140; C₁₂³ = 220","1140 − 220 = 920"]},
          {id:"e3",badge:"L29",q:t("Tìm hệ số của x³ trong khai triển (2+x)⁵.","Find coefficient of x³ in (2+x)⁵."),a:["T_{k+1} = C₅ᵏ·2⁵⁻ᵏ·xᵏ",t("Cần k=3: T₄ = C₅³·2²·x³ = 10·4·x³ = 40x³","Need k=3: T₄=10·4=40"),"Hệ số x³ = 40"]},
        ].map(({id,q,a,badge})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{fontSize:17,fontWeight:600}}>📝 {t("Bài tập","Exercise")}</div><span style={{background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)",color:"white",fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20}}>{badge}</span></div><div style={{fontSize:15,lineHeight:1.7}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"rgba(16, 185, 129, 0.15)",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color: "rgba(255, 255, 255, 0.7)",marginBottom:6}}>{l}</div>)}</div>}</article>))}
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
      videoId="HDLBCv4yyIs"
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
