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

export default function Lesson27_NhiThucNewton() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson27_NhiThucNewton";
  const chapterTitle = { vi: "Chương VIII · Tổ Hợp", en: "Chương VIII · Tổ Hợp" };
  const lessonTitle = { vi: "Bài 27: Nhị Thức Newton", en: "Bài 27: Nhị Thức Newton" };
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
        "text": "binomial theorem",
        "vi": "nhị thức Newton",
        "detail": "<b>binomial theorem</b>: nhị thức Newton.",
        "detailTitle": "binomial theorem (nhị thức Newton)"
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
        "text": "binomial coefficient",
        "vi": "hệ số nhị thức",
        "detail": "<b>binomial coefficient</b>: hệ số nhị thức.",
        "detailTitle": "binomial coefficient (hệ số nhị thức)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "expansion",
        "vi": "khai triển",
        "detail": "<b>expansion</b>: khai triển.",
        "detailTitle": "expansion (khai triển)"
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
        "text": "Pascal triangle",
        "vi": "tam giác Pascal",
        "detail": "<b>Pascal triangle</b>: tam giác Pascal.",
        "detailTitle": "Pascal triangle (tam giác Pascal)"
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
        "text": "binomial coefficient",
        "vi": "hệ số nhị thức",
        "detail": "<b>binomial coefficient</b>: hệ số nhị thức.",
        "detailTitle": "binomial coefficient (hệ số nhị thức)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "expansion",
        "vi": "khai triển",
        "detail": "<b>expansion</b>: khai triển.",
        "detailTitle": "expansion (khai triển)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "Pascal triangle",
        "vi": "tam giác Pascal",
        "detail": "<b>Pascal triangle</b>: tam giác Pascal.",
        "detailTitle": "Pascal triangle (tam giác Pascal)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': 'Số hạng tổng quát trong (a+b)ⁿ là?', 'o': ['Cₙᵏ·aᵏ·bⁿ⁻ᵏ', 'Cₙᵏ·aⁿ⁻ᵏ·bᵏ', 'Cₙᵏ·(ab)ⁿ', 'n!·aᵏbⁿ'], 'a': 1, 'ex': 'T_{k+1}=Cₙᵏ·aⁿ⁻ᵏ·bᵏ (k từ 0 đến n).'}, {'q': '(a+b)⁴ có bao nhiêu số hạng?', 'o': ['4', '5', '6', '16'], 'a': 1, 'ex': '(a+b)ⁿ có n+1 số hạng → (a+b)⁴ có 5 số hạng.'}, {'q': 'Σₖ₌₀ⁿ Cₙᵏ = ?', 'o': ['n', 'n²', '2ⁿ', 'n!'], 'a': 2, 'ex': 'Thay a=b=1: (1+1)ⁿ=2ⁿ.'}, {'q': 'Hệ số x² trong khai triển (x+1)⁴?', 'o': ['4', '6', '4', '1'], 'a': 1, 'ex': 'T₃=C₄²·x²·1²=6x².'}, {'q': 'Số hạng không chứa x trong (x+1/x)⁶?', 'o': ['C₆³', 'C₆²', 'C₆⁴', '20'], 'a': 0, 'ex': 'T_{k+1}=C₆ᵏ·x⁶⁻ᵏ·x⁻ᵏ=C₆ᵏ·x⁶⁻²ᵏ. Cần 6−2k=0→k=3. T₄=C₆³=20.'}];
  const tfCards = [{'s': '(a+b)ⁿ có n+1 số hạng.', 'a': true, 'ex': 'ĐÚNG — từ T₁ (k=0) đến T_{n+1} (k=n).'}, {'s': 'Hệ số của T_{k+1} trong (a+b)ⁿ là Cₙᵏ.', 'a': true, 'ex': 'ĐÚNG — T_{k+1}=Cₙᵏ·aⁿ⁻ᵏ·bᵏ.'}, {'s': 'Σ Cₙᵏ = n!.', 'a': false, 'ex': 'SAI — Σ Cₙᵏ = 2ⁿ (không phải n!).'}, {'s': '(1+x)³ = 1+3x+3x²+x³.', 'a': true, 'ex': 'ĐÚNG — C₃⁰+C₃¹x+C₃²x²+C₃³x³=1+3x+3x²+x³.'}, {'s': 'Trong Tam Giác Pascal, mỗi số bằng tích của hai số phía trên.', 'a': false, 'ex': 'SAI — bằng TỔNG (không phải tích) hai số phía trên.'}];
  const fillQuestions = [{'id': 'f1', 'tp': '(a+b)ⁿ: số hạng tổng quát T_{k+1} = Cₙᵏ · aⁿ⁻ᵏ · ___', 'ans': 'bᵏ', 'alt': ['b^k', 'bk', 'b ᵏ'], 'h': ''}, {'id': 'f2', 'tp': 'Σₖ₌₀⁵ C₅ᵏ = ___', 'ans': '32', 'alt': ['32'], 'h': '2⁵=32'}, {'id': 'f3', 'tp': 'Hệ số x² trong (x+1)³ là ___', 'ans': '3', 'alt': ['3'], 'h': 'C₃²=3'}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("(a+b)² = a²+2ab+b². (a+b)³ = a³+3a²b+3ab²+b³. Các hệ số 1,2,1 và 1,3,3,1 có quy luật gì? Đó là Tam Giác Pascal và Nhị Thức Newton — cho phép khai triển (a+b)ⁿ với mọi n!","(a+b)²=a²+2ab+b². (a+b)³=a³+3a²b+3ab²+b³. The coefficients 1,2,1 and 1,3,3,1 follow a pattern: Pascal's Triangle and the Binomial Theorem — allowing expansion of (a+b)ⁿ for any n!")}</div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="Y7Z6S7OuhIs"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ NancyPi (YouTube)", "Video by NancyPi (YouTube)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Nhị Thức Newton","1. Binomial Theorem")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{fontWeight:"bold",fontSize:16,color: "#22d3ee",marginBottom:12}}>📌 {t("Công thức tổng quát:","General formula:")}</div>\n        <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:15,textAlign:"center",color: "#22d3ee",fontWeight:700,lineHeight:2.4}}>
          (a+b)ⁿ = Σₖ₌₀ⁿ Cₙᵏ · aⁿ⁻ᵏ · bᵏ<br/>
          = Cₙ⁰aⁿ + Cₙ¹aⁿ⁻¹b + Cₙ²aⁿ⁻²b² + ... + Cₙⁿbⁿ
        </div>
        <div style={{marginTop:12,padding:"10px 14px",background:"rgba(245, 158, 11, 0.15)",borderRadius:8,fontSize:14}}>
          💡 {t("Số hạng tổng quát (STQ): T_{k+1} = Cₙᵏ · aⁿ⁻ᵏ · bᵏ (k = 0,1,...,n)","General term: T_{k+1} = Cₙᵏ·aⁿ⁻ᵏ·bᵏ")}
        </div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Tam Giác Pascal","2. Pascal's Triangle")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
        <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:14,lineHeight:2.2,textAlign:"center"}}>
          n=0:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1<br/>
          n=1:&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1&nbsp;&nbsp;1<br/>
          n=2:&nbsp;&nbsp;&nbsp;&nbsp;1&nbsp;&nbsp;2&nbsp;&nbsp;1<br/>
          n=3:&nbsp;&nbsp;1&nbsp;&nbsp;3&nbsp;&nbsp;3&nbsp;&nbsp;1<br/>
          n=4:&nbsp;1&nbsp;&nbsp;4&nbsp;&nbsp;6&nbsp;&nbsp;4&nbsp;&nbsp;1
        </div>
        <div style={{marginTop:10,fontSize:14,color: "rgba(255, 255, 255, 0.5)"}}>{t("Quy luật: mỗi số = tổng hai số ngay trên nó. Hàng n cho các hệ số Cₙ⁰, Cₙ¹, ..., Cₙⁿ.","Rule: each number = sum of the two directly above. Row n gives coefficients Cₙ⁰,...,Cₙⁿ.")}</div>
      </div>
    </section>
    <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("3. Tính Chất Quan Trọng","3. Key Properties")} />
  <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s"}}>
    {[
      {title:t("Tổng hệ số","Sum of coefficients"), formula:"(1+1)ⁿ = 2ⁿ\nΣCₙᵏ = 2ⁿ", note:t("Thay a=b=1","Set a=b=1"), c:"#38bdf8", bg:"rgba(14, 165, 233, 0.15)"},
      {title:t("Tổng hệ số xen kẽ","Alternating sum"), formula:"(1−1)ⁿ = 0\nΣ(−1)ᵏCₙᵏ = 0", note:t("Thay a=1, b=−1","Set a=1, b=−1"), c:"#f87171", bg:"rgba(239, 68, 68, 0.15)"},
      {title:t("Số hạng giữa","Middle term"), formula:"n chẵn: T_{n/2+1} = Cₙⁿ/²·aⁿ/²·bⁿ/²\nn lẻ: 2 số hạng giữa", note:t("STQ có k=n/2","Term with k=n/2"), c:"#fbbf24", bg:"rgba(245, 158, 11, 0.15)"},
    ].map((card,i)=>(
      <article key={i} style={{padding:18,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:14,fontWeight:700,color:card.c,marginBottom:8}}>{card.title}</div>
        <div style={{fontFamily:"monospace",fontSize:13,background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8,whiteSpace:"pre-wrap",lineHeight:1.8,marginBottom:6}}>
          {card.formula}
        </div>
        <div style={{fontSize:12,color: "rgba(255, 255, 255, 0.5)"}}>{card.note}</div>
      </article>
    ))}
  </div>
</section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:t("Khai triển (x+2)⁴ bằng nhị thức Newton.","Expand (x+2)⁴ using the Binomial Theorem."),a:["T_{k+1} = C₄ᵏ·x⁴⁻ᵏ·2ᵏ","C₄⁰x⁴+C₄¹·2x³+C₄²·4x²+C₄³·8x+C₄⁴·16","= x⁴+8x³+24x²+32x+16"]},
          {id:"e2",q:t("Tìm số hạng chứa x³ trong khai triển (2x−1)⁵.","Find the term containing x³ in (2x−1)⁵."),a:["T_{k+1} = C₅ᵏ·(2x)⁵⁻ᵏ·(−1)ᵏ",t("Cần 5−k=3 → k=2","Need 5−k=3 → k=2"),"T₃ = C₅²·(2x)³·(−1)² = 10·8x³·1 = 80x³"]},
          {id:"e3",q:t("Tính tổng Σₖ₌₀⁶ Cₙᵏ với n=6.","Find the sum Σₖ₌₀⁶ C₆ᵏ."),a:[t("Dùng tính chất: (1+1)⁶ = 2⁶","Property: (1+1)⁶=2⁶"),"Σ C₆ᵏ = 2⁶ = 64"]},
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
      videoId="Y7Z6S7OuhIs"
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
