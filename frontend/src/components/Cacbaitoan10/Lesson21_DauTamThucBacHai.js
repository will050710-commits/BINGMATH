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

export default function Lesson21_DauTamThucBacHai() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson21_DauTamThucBacHai";
  const chapterTitle = { vi: "Chương VII · Bất Phương Trình Bậc Hai Một Ẩn", en: "Chapter VII · Quadratic Inequalities in One Variable" };
  const lessonTitle = { vi: "Bài 21: Dấu của Tam Thức Bậc Hai", en: "Lesson 21: Sign of a Quadratic Trinomial" };
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
        "text": "sign of a quadratic trinomial",
        "vi": "dấu của tam thức bậc hai",
        "detail": "<b>sign of a quadratic trinomial</b>: dấu của tam thức bậc hai.",
        "detailTitle": "sign of a quadratic trinomial (dấu của tam thức bậc hai)"
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
        "text": "root",
        "vi": "nghiệm",
        "detail": "<b>root</b>: nghiệm.",
        "detailTitle": "root (nghiệm)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "sign chart",
        "vi": "bảng xét dấu",
        "detail": "<b>sign chart</b>: bảng xét dấu.",
        "detailTitle": "sign chart (bảng xét dấu)"
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
        "text": "parabola",
        "vi": "parabol",
        "detail": "<b>parabola</b>: parabol.",
        "detailTitle": "parabola (parabol)"
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
        "text": "root",
        "vi": "nghiệm",
        "detail": "<b>root</b>: nghiệm.",
        "detailTitle": "root (nghiệm)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "sign chart",
        "vi": "bảng xét dấu",
        "detail": "<b>sign chart</b>: bảng xét dấu.",
        "detailTitle": "sign chart (bảng xét dấu)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "parabola",
        "vi": "parabol",
        "detail": "<b>parabola</b>: parabol.",
        "detailTitle": "parabola (parabol)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    {q:t("Tam thức f(x)=ax²+bx+c (a>0) có Δ>0. Dấu của f(x) khi x∈(x₁,x₂)?","f(x)=ax²+bx+c (a>0), Δ>0. Sign of f(x) for x∈(x₁,x₂)?"),o:[t("Dương","Positive"),t("Âm","Negative"),t("Bằng 0","Zero"),t("Không xác định","Undefined")],a:1,ex:t("a>0, Δ>0: f(x)<0 khi x∈(x₁,x₂), f(x)>0 khi x<x₁ hoặc x>x₂.","a>0, Δ>0: f(x)<0 for x∈(x₁,x₂), f(x)>0 outside.")},
    {q:t("f(x)=x²−5x+6. Dấu của f(x) khi x∈(2,3)?","f(x)=x²−5x+6. Sign for x∈(2,3)?"),o:[t("Dương","Positive"),t("Âm","Negative"),"=0",t("Không xác định","Undefined")],a:1,ex:t("Δ=25−24=1>0; x₁=2, x₂=3. a=1>0 → f(x)<0 giữa 2 nghiệm.","Roots 2 and 3. a>0 → f<0 between roots.")},
    {q:t("f(x)=−x²+4x−5. Δ=?","f(x)=−x²+4x−5. Δ=?"),o:["4","−4","36","−36"],a:1,ex:t("Δ=b²−4ac=16−4·(−1)·(−5)=16−20=−4<0.","Δ=16−20=−4<0.")},
    {q:t("f(x)=ax²+bx+c (a>0), Δ<0. Dấu của f(x)?","f(x)=ax²+bx+c, a>0, Δ<0. Sign?"),o:[t("Luôn âm","Always negative"),t("Luôn dương","Always positive"),t("Đổi dấu","Changes sign"),t("Bằng 0","Always zero")],a:1,ex:t("a>0, Δ<0: parabol không cắt Ox, luôn nằm trên Ox → f(x)>0 với mọi x.","a>0, Δ<0: parabola above Ox → f(x)>0 for all x.")},
    {q:t("f(x)=2x²−8x+8. Tập nghiệm f(x)≤0 là?","f(x)=2x²−8x+8. Solution set of f(x)≤0?"),o:["{2}","(−∞,2]","[2,+∞)","∅"],a:0,ex:t("Δ=64−64=0; x₀=2. a=2>0 → f(x)≥0, f=0 chỉ tại x=2. Vậy f(x)≤0 ⟺ x=2.","Δ=0, x₀=2. f(x)≥0 with equality only at x=2.")},
  ];
  const tfCards = [
    {s:t("Nếu a>0 và Δ<0, thì f(x)=ax²+bx+c>0 với mọi x.","If a>0 and Δ<0, then f(x)>0 for all x."),a:true,ex:t("ĐÚNG — parabol mở lên, không cắt Ox → luôn dương.","TRUE — opens up, no x-intercepts → always positive.")},
    {s:t("f(x)=x²−4x+4=(x−2)² luôn không âm.","f(x)=(x−2)² is always non-negative."),a:true,ex:t("ĐÚNG — bình phương ≥0, bằng 0 khi x=2.","TRUE — square ≥0, equals 0 when x=2.")},
    {s:t("Nếu a<0 và Δ>0, f(x)>0 với x ngoài khoảng (x₁,x₂).","If a<0 and Δ>0, f(x)>0 outside (x₁,x₂)."),a:false,ex:t("SAI — a<0: f(x)>0 trong khoảng (x₁,x₂), âm ngoài khoảng.","FALSE — a<0: f>0 INSIDE (x₁,x₂), negative outside.")},
    {s:t("Tam thức bậc hai có thể có 0, 1 hoặc 2 nghiệm thực.","A quadratic trinomial can have 0, 1, or 2 real roots."),a:true,ex:t("ĐÚNG — tùy thuộc Δ<0 (vô nghiệm), Δ=0 (nghiệm kép), Δ>0 (2 nghiệm).","TRUE — depends on sign of Δ.")},
    {s:t("Nếu Δ=0, tam thức có nghiệm kép x₀=−b/(2a) và f(x)≥0 khi a>0.","If Δ=0, f has double root x₀=−b/2a and f(x)≥0 for a>0."),a:true,ex:t("ĐÚNG — Δ=0: f(x)=a(x−x₀)²≥0 khi a>0.","TRUE — Δ=0: f=a(x−x₀)²≥0 for a>0.")},
  ];
  const fillQuestions = [
    {id:"f1",tp:t("f(x)=ax²+bx+c, a>0, Δ>0. Dấu f(x)<0 khi x thuộc ___.","f(x)=ax²+bx+c, a>0, Δ>0. f(x)<0 when x ∈ ___."),ans:"(x₁,x₂)",alt:["(x1,x2)","x1x2","giữa hai nghiệm","between roots"],h:t("Giữa hai nghiệm","Between the two roots")},
    {id:"f2",tp:t("Δ = b² − ___ · a · c","Δ = b² − ___ · a · c"),ans:"4",alt:["4"],h:""},
    {id:"f3",tp:t("f(x)=x²−6x+9=(x−___)²","f(x)=x²−6x+9=(x−___)²"),ans:"3",alt:["3"],h:"√9=3"},
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
      

      

      

      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize:16,lineHeight:1.8,marginBottom:16 }}>{t("Trong lợi nhuận kinh doanh, hàm lợi nhuận có dạng f(x) = −x² + 10x − 16 (nghìn đồng), với x là số sản phẩm. Hỏi với x nào thì f(x) > 0 (có lãi)? Đây là bài toán xét dấu tam thức bậc hai.","In a business profit model, profit is f(x) = −x²+10x−16 (thousands). For which x is f(x)>0 (profitable)? This is a sign-analysis problem for a quadratic trinomial.")}</div>
          <div style={{ fontSize:16 }}>❓ <em>{t("Hãy tính Δ và tìm 2 nghiệm của f(x) trước khi học lý thuyết.","Try computing Δ and the two roots of f(x) before studying the theory.")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="pYgP8v6DGl4"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ NancyPi (YouTube)", "Video by NancyPi (YouTube)")}
          />
        </div>
      </section>

      {/* 1. ĐỊNH NGHĨA */}
      <section id="k1" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("1. Tam Thức Bậc Hai","1. Quadratic Trinomial")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10 }}>📌 {t("Định nghĩa","Definition")}</div>
          <div style={{ fontSize:15,lineHeight:1.8,marginBottom:12 }}>{t("Tam thức bậc hai (theo x) là biểu thức dạng f(x) = ax² + bx + c, trong đó a ≠ 0. Biệt thức Δ = b² − 4ac quyết định số nghiệm và dấu của f(x).","A quadratic trinomial in x has the form f(x)=ax²+bx+c, a≠0. The discriminant Δ=b²−4ac determines the number of roots and sign of f(x).")}</div>
          <div style={{ background:"white",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:15,lineHeight:2.2 }}>
            Δ = b² − 4ac<br/>
            Δ &gt; 0 → 2 nghiệm phân biệt x₁,x₂ (x₁ &lt; x₂)<br/>
            Δ = 0 → nghiệm kép x₀ = −b/(2a)<br/>
            Δ &lt; 0 → vô nghiệm thực
          </div>
        </div>
      </section>

      {/* 2. BẢNG XÉT DẤU */}
      <section id="k2" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("2. Bảng Xét Dấu (Định Lý)","2. Sign Table (Theorem)")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>📌 {t("Định lý về dấu tam thức bậc hai (a>0, Δ>0, nghiệm x₁<x₂):","Sign theorem (a>0, Δ>0, roots x₁<x₂):")}</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ borderCollapse:"collapse",width:"100%",fontSize:14,minWidth:500 }}>
              <tbody>
                {[["x","−∞","","x₁","","x₂","","+∞"],
                  ["f(x)","+","","0","−","0","+",""]].map((row,ri)=>(
                  <tr key={ri} style={{ background:ri===0?"#0B4F5C":"white" }}>
                    {row.map((cell,ci)=>(
                      <td key={ci} style={{ padding:"10px 14px",textAlign:"center",border:"1px solid #ddd",color:ri===0?"white":cell==="0"?"#1a5276":cell==="−"?"#922b21":cell==="+"?"#1e8449":"#555",fontWeight:cell==="0"||cell==="+"||cell==="−"?700:400,fontFamily:"monospace",fontSize:15 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop:12,padding:"10px 14px",background:"#fff3cd",borderRadius:8,fontSize:14 }}>
            💡 {t("Quy tắc: f(x) cùng dấu với a ở ngoài khoảng (x₁,x₂), và ngược dấu với a ở trong khoảng (x₁,x₂).","Rule: f(x) has the same sign as a outside (x₁,x₂), and opposite sign inside (x₁,x₂).")}
          </div>
        </div>
      </section>

      {/* 3. CÁC TRƯỜNG HỢP */}
      <section id="k3" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("3. Bảng Tổng Hợp 6 Trường Hợp","3. All 6 Cases Summary")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{cond:"a>0, Δ>0",roots:t("x₁<x₂","x₁<x₂"),sign:t("+ ngoài | − trong | + ngoài","+outside | −inside | +outside"),pos:t("x<x₁ hoặc x>x₂","x<x₁ or x>x₂"),neg:t("x₁<x<x₂","x₁<x<x₂"),c:"#1e8449",bg:"#eafaf1"},
            {cond:"a>0, Δ=0",roots:"x₀",sign:t("≥0 mọi x, =0 tại x₀","≥0 for all x, =0 at x₀"),pos:t("mọi x≠x₀","all x≠x₀"),neg:t("∅ (không âm)","∅ (not negative)"),c:"#1a5276",bg:"#eaf4fb"},
            {cond:"a>0, Δ<0",roots:t("Vô nghiệm","No roots"),sign:t(">0 mọi x",">0 for all x"),pos:"ℝ",neg:"∅",c:"#856404",bg:"#fff3cd"},
            {cond:"a<0, Δ>0",roots:t("x₁<x₂","x₁<x₂"),sign:t("− ngoài | + trong | − ngoài","−outside | +inside | −outside"),pos:t("x₁<x<x₂","x₁<x<x₂"),neg:t("x<x₁ hoặc x>x₂","x<x₁ or x>x₂"),c:"#922b21",bg:"#fdf2f2"},
            {cond:"a<0, Δ=0",roots:"x₀",sign:t("≤0 mọi x, =0 tại x₀","≤0 for all x, =0 at x₀"),pos:t("∅ (không dương)","∅ (not positive)"),neg:t("mọi x≠x₀","all x≠x₀"),c:"#6c3483",bg:"#f5eef8"},
            {cond:"a<0, Δ<0",roots:t("Vô nghiệm","No roots"),sign:t("<0 mọi x","<0 for all x"),pos:"∅",neg:"ℝ",c:"#555",bg:"#f4f6f7"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontFamily:"monospace",fontSize:15,fontWeight:700,color:card.c,background:card.bg,padding:"4px 10px",borderRadius:6,display:"inline-block",marginBottom:8 }}>{card.cond}</div>
              <div style={{ fontSize:13,color:"#555",marginBottom:4 }}>📋 {card.sign}</div>
              <div style={{ fontSize:13,color:"#1e8449",marginBottom:2 }}>✅ f(x)&gt;0: {card.pos}</div>
              <div style={{ fontSize:13,color:"#922b21" }}>❌ f(x)&lt;0: {card.neg}</div>
            </article>
          ))}
        </div>
      </section>

      {/* THỰC HÀNH */}
      <section id="th" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s" }}>
          {[{id:"e1",q:t("Xét dấu f(x) = x² − 3x + 2.","Determine the sign of f(x)=x²−3x+2."),
             a:[t("a=1>0; Δ=9−8=1>0","a=1>0; Δ=1>0"),t("x₁=1, x₂=2","x₁=1, x₂=2"),t("f(x)>0 khi x<1 hoặc x>2","f(x)>0 when x<1 or x>2"),t("f(x)<0 khi 1<x<2","f(x)<0 when 1<x<2")]},
           {id:"e2",q:t("Xét dấu f(x) = −2x² + 4x − 3.","Sign of f(x)=−2x²+4x−3."),
             a:[t("a=−2<0; Δ=16−24=−8<0","a=−2<0; Δ=−8<0"),t("Δ<0 và a<0 → f(x)<0 với mọi x ∈ ℝ","Δ<0 and a<0 → f(x)<0 for all x∈ℝ")]},
           {id:"e3",q:t("Tìm x để f(x)=x²−4x+4≥0.","Find x such that x²−4x+4≥0."),
             a:[t("f(x)=(x−2)²","f(x)=(x−2)²"),t("Δ=16−16=0; x₀=2","Δ=0; double root x₀=2"),t("(x−2)²≥0 với mọi x → nghiệm: x∈ℝ","(x−2)²≥0 for all x → solution: x∈ℝ")]},
          ].map(({id,q,a})=>(
            <article key={id}>
              <div style={{ padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize:18,fontWeight:600,marginBottom:4 }}>📝 {t("Bài tập","Exercise")}</div>
                <div style={{ fontSize:15,lineHeight:1.7 }}>{q}</div>
              </div>
              <button onClick={()=>tr(id)} style={{ display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left" }}>
                {rev[id]?t("Ẩn đáp án ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}
              </button>
              {rev[id]&&<div style={{ padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px" }}>{a.map((l,i)=><div key={i} style={{ fontSize:15,color:"#555",marginBottom:6 }}>{l}</div>)}</div>}
            </article>
          ))}
        </div>
      </section>

      {/* MINI GAME */}
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
      videoId="pYgP8v6DGl4"
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
