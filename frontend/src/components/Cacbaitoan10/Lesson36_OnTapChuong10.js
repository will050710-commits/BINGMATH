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

export default function Lesson36_OnTapChuong10() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson36_OnTapChuong10";
  const chapterTitle = { vi: "Chương X · Xác Suất", en: "Chương X · Xác Suất" };
  const lessonTitle = { vi: "Bài 36 · Không Gian Mẫu", en: "L36 · Sample Space" };
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
        "text": "probability review",
        "vi": "ôn tập xác suất",
        "detail": "<b>probability review</b>: ôn tập xác suất.",
        "detailTitle": "probability review (ôn tập xác suất)"
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
        "text": "sample space",
        "vi": "không gian mẫu",
        "detail": "<b>sample space</b>: không gian mẫu.",
        "detailTitle": "sample space (không gian mẫu)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "event operation",
        "vi": "phép toán biến cố",
        "detail": "<b>event operation</b>: phép toán biến cố.",
        "detailTitle": "event operation (phép toán biến cố)"
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
        "text": "probability rule",
        "vi": "quy tắc xác suất",
        "detail": "<b>probability rule</b>: quy tắc xác suất.",
        "detailTitle": "probability rule (quy tắc xác suất)"
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
        "text": "sample space",
        "vi": "không gian mẫu",
        "detail": "<b>sample space</b>: không gian mẫu.",
        "detailTitle": "sample space (không gian mẫu)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "event operation",
        "vi": "phép toán biến cố",
        "detail": "<b>event operation</b>: phép toán biến cố.",
        "detailTitle": "event operation (phép toán biến cố)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "probability rule",
        "vi": "quy tắc xác suất",
        "detail": "<b>probability rule</b>: quy tắc xác suất.",
        "detailTitle": "probability rule (quy tắc xác suất)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': 'Tung 2 xúc xắc. n(Ω)=?', 'o': ['12', '36', '6', '72'], 'a': 1, 'ex': '6×6=36.'}, {'q': 'P(A)=0.4. P(Ā)=?', 'o': ['0.4', '0.6', '1.4', '0.04'], 'a': 1, 'ex': 'P(Ā)=1−0.4=0.6.'}, {'q': "Hộp 4 đỏ, 6 xanh. Rút 1: P('đỏ')=?", 'o': ['4/6', '4/10', '6/10', '1/4'], 'a': 1, 'ex': 'P=4/10=2/5.'}, {'q': 'A,B độc lập: P(A)=0.5, P(B)=0.4. P(A∩B)=?', 'o': ['0.9', '0.1', '0.2', '0.45'], 'a': 2, 'ex': 'P(A∩B)=0.5×0.4=0.2.'}, {'q': "Tung 3 đồng xu. P('ít nhất 1 ngửa')=?", 'o': ['3/8', '5/8', '7/8', '1/8'], 'a': 2, 'ex': '1−P(tất cả sấp)=1−1/8=7/8.'}];
  const tfCards = [{'s': 'P(A)=n(A)/n(Ω) chỉ dùng khi các kết quả đồng khả năng.', 'a': true, 'ex': 'ĐÚNG.'}, {'s': 'P(A)+P(B)=P(A∪B) với mọi A,B.', 'a': false, 'ex': 'SAI — P(A∪B)=P(A)+P(B)−P(A∩B).'}, {'s': 'P(Ω)=1 và P(∅)=0.', 'a': true, 'ex': 'ĐÚNG.'}, {'s': 'Biến cố độc lập A,B: P(A∩B)=P(A)·P(B).', 'a': true, 'ex': 'ĐÚNG — định nghĩa độc lập.'}, {'s': 'n(Ω) khi rút không hoàn lại 2 từ 10 là 10×9=90.', 'a': false, 'ex': 'SAI — không hoàn lại và không quan tâm thứ tự → C₁₀²=45.'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'P(A)=n(A)/n(Ω). Với A={2,4,6} trên xúc xắc: P(A)=___', 'ans': '1/2', 'alt': ['1/2', '0.5', '3/6'], 'h': ''}, {'id': 'f2', 'tp': 'P(A)=0.3, P(B)=0.5, xung khắc. P(A∪B)=___', 'ans': '0.8', 'alt': ['0.8'], 'h': ''}, {'id': 'f3', 'tp': 'A,B độc lập: P(A)=0.6, P(B)=0.5. P(A∩B)=___', 'ans': '0.3', 'alt': ['0.3'], 'h': '0.6×0.5'}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:40,transition:"all 0.3s"}}>
      {[{slug:"khong-gian-mau",num:"36",title:t("Không Gian Mẫu","Sample Spaces")},{slug:"xac-suat-bien-co",num:"37",title:t("Xác Suất Biến Cố","Probability")}].map(l=>(<Link key={l.slug} href={`/cacbailam10/${l.slug}`} style={{textDecoration:"none"}}><article style={{padding:14,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",cursor:"pointer"}}><div style={{fontSize:12,color: "rgba(255, 255, 255, 0.5)",marginBottom:3}}>{t("Bài","L")} {l.num}</div><div style={{fontSize:15,fontWeight:600,color: "#22d3ee"}}>{l.title}</div></article></Link>))}
    </div>
    <section id="tomTat" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📚" title={t("Tóm Tắt Chương X","Chapter X Summary")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,transition:"all 0.3s"}}>
        {[{title:t("Bài 36 · Không Gian Mẫu","L36 · Sample Space"),pts:["Ω = tập tất cả kết quả có thể","Biến cố A ⊆ Ω","Ā = Ω\A (biến cố đối)","A∩B=∅: xung khắc","n(A∪B)=n(A)+n(B)−n(A∩B)"]},
          {title:t("Bài 37 · Xác Suất","L37 · Probability"),pts:["P(A)=n(A)/n(Ω) (đồng khả năng)","0≤P(A)≤1","P(Ā)=1−P(A)","P(A∪B)=P(A)+P(B)−P(A∩B)","Độc lập: P(A∩B)=P(A)·P(B)"]},
        ].map((card,i)=>(<article key={i} style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:15,fontWeight:700,color: "#22d3ee",marginBottom:12}}>{card.title}</div>{card.pts.map((pt,j)=><div key={j} style={{fontSize:13,color: "rgba(255, 255, 255, 0.7)",marginBottom:8,display:"flex",gap:8}}><span style={{color: "#22d3ee",fontWeight:700,flexShrink:0}}>•</span><span style={{fontFamily:"monospace"}}>{pt}</span></div>)}</article>))}
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="KFgvOQtH0Z0"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
          />
        </div>
      </section>
    <section id="baiTap" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Bài Tập Tổng Hợp","Mixed Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",badge:"L36+37",q:t("Rút 1 lá từ 52. A='át đỏ'. Tính P(A) và P(Ā).","Draw 1 card from 52. A='red ace'. Find P(A) and P(Ā)."),a:[t("4 át trong 52 lá, trong đó 2 át đỏ (♥,♦)","4 aces total, 2 red (♥,♦)"),"P(A)=2/52=1/26≈0.038","P(Ā)=1−1/26=25/26≈0.962"]},
          {id:"e2",badge:"L37",q:t("Hộp có 5 bóng đỏ, 3 bóng xanh. Rút ngẫu nhiên 2 bóng. P('cả 2 đỏ')?","Box: 5 red, 3 blue balls. Draw 2 randomly. P('both red')?"),a:[t("n(Ω)=C₈²=28","n(Ω)=C₈²=28"),t("A='2 bóng đỏ': n(A)=C₅²=10","A: n(A)=C₅²=10"),"P(A)=10/28=5/14≈0.357"]},
          {id:"e3",badge:t("Tổng hợp","Mixed"),q:t("Tung 3 đồng xu. P('đúng 2 mặt ngửa')?","Flip 3 coins. P('exactly 2 heads')?"),a:[t("Ω gồm 2³=8 kết quả","Ω has 2³=8 outcomes"),t("A={NNS,NSN,SNN}: n(A)=C₃²=3","A has C₃²=3 outcomes"),"P(A)=3/8=0.375"]},
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
      videoId="KFgvOQtH0Z0"
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
