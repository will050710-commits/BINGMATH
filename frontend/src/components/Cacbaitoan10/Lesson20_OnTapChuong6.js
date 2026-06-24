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

export default function Lesson20_OnTapChuong6() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson20_OnTapChuong6";
  const chapterTitle = { vi: "Chương VI · Hình Học Đo Lường", en: "Chapter VI · Geometry & Measurement" };
  const lessonTitle = { vi: "Bài 20 · Hệ Thức Lượng Trong Tam Giác", en: "L20 · Triangle Metric Relations" };
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
        "text": "geometry measurement review",
        "vi": "ôn tập hình học đo lường",
        "detail": "<b>geometry measurement review</b>: ôn tập hình học đo lường.",
        "detailTitle": "geometry measurement review (ôn tập hình học đo lường)"
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
        "text": "area",
        "vi": "diện tích",
        "detail": "<b>area</b>: diện tích.",
        "detailTitle": "area (diện tích)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "perimeter",
        "vi": "chu vi",
        "detail": "<b>perimeter</b>: chu vi.",
        "detailTitle": "perimeter (chu vi)"
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
        "text": "problem solving",
        "vi": "giải toán",
        "detail": "<b>problem solving</b>: giải toán.",
        "detailTitle": "problem solving (giải toán)"
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
        "text": "area",
        "vi": "diện tích",
        "detail": "<b>area</b>: diện tích.",
        "detailTitle": "area (diện tích)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "perimeter",
        "vi": "chu vi",
        "detail": "<b>perimeter</b>: chu vi.",
        "detailTitle": "perimeter (chu vi)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "problem solving",
        "vi": "giải toán",
        "detail": "<b>problem solving</b>: giải toán.",
        "detailTitle": "problem solving (giải toán)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    {q:t("Tam giác đều cạnh a. Bán kính ngoại tiếp R = ?","Equilateral triangle side a. Circumradius R = ?"),o:["a/2","a√3/6","a√3/3","a√3/2"],a:2,ex:t("R = a/(2sin60°) = a/√3 = a√3/3.","R = a√3/3.")},
    {q:t("Diện tích hình thang đáy 6 và 10, cao 4 là?","Trapezoid bases 6 and 10, height 4. Area?"),o:["40","32","64","24"],a:1,ex:t("S=(6+10)·4/2=16·4/2=32.","S=(6+10)·4/2=32.")},
    {q:t("Đường trung tuyến ma² = ?","Median ma² = ?"),o:["(b²+c²−a²)/4","(2b²+2c²−a²)/4","(b+c)²/4","(b²+c²)/2"],a:1,ex:t("Công thức chính xác: ma²=(2b²+2c²−a²)/4.","Exact formula: ma²=(2b²+2c²−a²)/4.")},
    {q:t("Hình vành khăn R=7, r=4. Diện tích S = ?","Annulus R=7, r=4. Area S = ?"),o:["33π","49π","16π","π(7−4)²"],a:0,ex:t("S=π(R²−r²)=π(49−16)=33π.","S=π(49−16)=33π.")},
    {q:t("Bán kính nội tiếp r = S/p. Trong đó p là gì?","Inradius r=S/p. What is p?"),o:[t("Chu vi","Perimeter"),t("Nửa chu vi","Semi-perimeter"),t("Diện tích","Area"),t("Đường kính","Diameter")],a:1,ex:t("p=(a+b+c)/2 là nửa chu vi. r=S/p.","p=(a+b+c)/2 is the semi-perimeter.")},
  ];
  const tfCards = [
    {s:t("Tam giác đều có R = 2r.","Equilateral triangle has R = 2r."),a:true,ex:t("ĐÚNG — R=a√3/3, r=a√3/6 → R=2r.","TRUE — R=2r for equilateral triangles.")},
    {s:t("Diện tích hình thoi = d₁·d₂ (không chia 2).","Rhombus area = d₁·d₂ (no halving)."),a:false,ex:t("SAI — S=d₁·d₂/2.","FALSE — S=d₁·d₂/2.")},
    {s:t("Trong tam giác vuông tại C: R = c/2 (nửa cạnh huyền).","Right triangle at C: R = c/2."),a:true,ex:t("ĐÚNG — cạnh huyền là đường kính của đường tròn ngoại tiếp.","TRUE — hypotenuse is the diameter of the circumscribed circle.")},
    {s:t("Công thức Heron: S = √(s(s−a)(s−b)(s−c)) với s=(a+b+c)/2.","Heron: S=√(s(s−a)(s−b)(s−c)), s=(a+b+c)/2."),a:true,ex:t("ĐÚNG — công thức Heron tính diện tích từ 3 cạnh.","TRUE — Heron's formula gives area from 3 sides.")},
    {s:t("Diện tích hình tròn = 2πR.","Circle area = 2πR."),a:false,ex:t("SAI — Diện tích = πR². Chu vi = 2πR.","FALSE — Area = πR². Circumference = 2πR.")},
  ];
  const fillQuestions = [
    {id:"f1",tp:t("Đường cao ha = 2S / ___ (S=diện tích tam giác)","Altitude ha = 2S / ___ (S=area)"),ans:"a",alt:["a"],h:""},
    {id:"f2",tp:t("Diện tích lục giác đều cạnh a: S = 3a² · ___/2","Regular hexagon side a: S = 3a² · ___/2"),ans:"√3",alt:["√3","sqrt(3)","căn 3"],h:"6 tam giác đều"},
    {id:"f3",tp:t("Diện tích hình quạt góc α°, bán kính R: S = πR² · α / ___","Sector angle α°, radius R: S = πR²·α/___"),ans:"360",alt:["360"],h:""},
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
      

      {/* Quick links */}
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,marginBottom:40,transition:"all 0.3s" }}>
        {[{slug:"hinh-hoc-do-luong-1",num:"20",title:t("Hệ Thức Lượng Trong Tam Giác","Triangle Metric Relations")},{slug:"hinh-hoc-do-luong-2",num:"21",title:t("Diện Tích và Chu Vi","Area and Perimeter")}].map(l=>(
          <Link key={l.slug} href={`/cacbailam10/${l.slug}`} style={{ textDecoration:"none" }}>
            <article style={{ padding:16,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",cursor:"pointer" }}>
              <div style={{ fontSize:13,color: "rgba(255, 255, 255, 0.5)",marginBottom:3 }}>{t("Bài","Lesson")} {l.num}</div>
              <div style={{ fontSize:15,fontWeight:600,color: "#22d3ee" }}>{l.title}</div>
              <div style={{ fontSize:12,color:"#aaa",marginTop:3 }}>← {t("Ôn lại","Review")}</div>
            </article>
          </Link>
        ))}
      </div>

      

      {/* TÓM TẮT */}
      <section id="tomTat" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📚" title={t("Tóm Tắt Chương VI","Chapter VI Summary")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:22,transition:"all 0.3s" }}>
          {[{title:t("Bài 20 · Hệ Thức Lượng Trong Tam Giác","L20 · Triangle Metric Relations"),pts:[t("R = a/(2sinA) — bán kính ngoại tiếp","R = a/(2sinA) — circumradius"),t("r = S/p — bán kính nội tiếp (p=nửa chu vi)","r = S/p — inradius (p=semi-perimeter)"),t("ma² = (2b²+2c²−a²)/4 — đường trung tuyến","ma²=(2b²+2c²−a²)/4 — median"),t("ha = 2S/a — đường cao","ha=2S/a — altitude"),t("Tam giác đều: R=2r; R=a√3/3; r=a√3/6","Equilateral: R=2r; R=a√3/3")]},
            {title:t("Bài 21 · Diện Tích và Chu Vi","L21 · Area & Perimeter"),pts:[t("Tam giác: S=½·đáy·cao=½ab·sinC=Heron","Triangle: ½·base·height=½ab·sinC=Heron"),t("Hình thang: S=(a+b)·h/2","Trapezoid: S=(a+b)·h/2"),t("Hình thoi: S=d₁·d₂/2","Rhombus: S=d₁·d₂/2"),t("Hình tròn: S=πR², C=2πR","Circle: S=πR², C=2πR"),t("Vành khăn: S=π(R²−r²)","Annulus: S=π(R²−r²)"),t("Lục giác đều: S=3a²√3/2","Regular hexagon: S=3a²√3/2")]}
          ].map((card,i)=>(
            <article key={i} style={{ padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:15,fontWeight:700,color: "#22d3ee",marginBottom:12 }}>{card.title}</div>
              {card.pts.map((pt,j)=><div key={j} style={{ fontSize:13,color: "rgba(255, 255, 255, 0.7)",marginBottom:8,display:"flex",gap:8 }}><span style={{ color: "#22d3ee",fontWeight:700,flexShrink:0 }}>•</span><span style={{ fontFamily:"monospace" }}>{pt}</span></div>)}
            </article>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="B1HEzNTGeZ4"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Math Antics (YouTube)", "Video by Math Antics (YouTube)")}
          />
        </div>
      </section>

      {/* CÔNG THỨC */}
      <section id="congThuc" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📐" title={t("Bảng Công Thức Chương VI","Chapter VI Formula Sheet")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,transition:"all 0.3s" }}>
          {[{label:t("Đường tròn NT & NTiếp","Circum & Inradius"),formula:"R = a/(2sinA)\nr = S/p\np = (a+b+c)/2\nTam giác vuông: R=c/2, r=(a+b−c)/2\nTam giác đều: R=a√3/3, r=a√3/6"},
            {label:t("Đường trung tuyến & cao","Medians & Altitudes"),formula:"ma² = (2b²+2c²−a²)/4\nha = 2S/a = b·sinC = c·sinB\nTam giác đều: m=h=a√3/2\nTam giác vuông: mc=c/2"},
            {label:t("Diện tích đa giác","Polygon Areas"),formula:"Tam giác: ½·b·h; ½ab·sinC; Heron\nHình vuông: a²\nHình chữ nhật: a·b\nHình bình hành: đáy·cao\nHình thoi: d₁·d₂/2\nHình thang: (a+b)·h/2"},
            {label:t("Hình tròn & liên quan","Circles & Related"),formula:"S_tròn = πR²\nC = 2πR\nS_quạt = πR²·α/360°\nℓ_cung = 2πR·α/360°\nS_vành_khăn = π(R²−r²)\nS_lục_giác_đều = 3a²√3/2"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:14,fontWeight:700,color: "#22d3ee",marginBottom:10 }}>{card.label}</div>
              <div style={{ fontFamily:"monospace",fontSize:12,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",padding:"10px 12px",borderRadius:8,lineHeight:1.9,whiteSpace:"pre-wrap" }}>{card.formula}</div>
            </article>
          ))}
        </div>
      </section>

      {/* BÀI TẬP TỔNG HỢP */}
      <section id="baiTap" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Bài Tập Tổng Hợp","Mixed Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s" }}>
          {[
            {id:"e1",badge:"L20",q:t("Tam giác ABC có a=7, b=8, c=9.\n(a) Tính diện tích S (Heron).\n(b) Tính r và R.","Triangle a=7, b=8, c=9.\n(a) Area S (Heron).\n(b) Inradius r and circumradius R."),
             a:[t("p=(7+8+9)/2=12","p=12"),t("S=√(12·5·4·3)=√720=12√5≈26.83","S=12√5"),t("r=S/p=12√5/12=√5≈2.24","r=√5"),t("cosA=(b²+c²−a²)/(2bc)=(64+81−49)/144=96/144=2/3","cosA=2/3"),t("sinA=√(1−4/9)=√5/3","sinA=√5/3"),t("R=a/(2sinA)=7/(2·√5/3)=21/(2√5)=21√5/10≈4.70","R=21√5/10≈4.70")]},
            {id:"e2",badge:"L21",q:t("Một sân chơi có hình chữ nhật 20m×15m. Trong sân có một bể bơi hình tròn bán kính 5m. Tính:\n(a) Diện tích phần sân (không tính bể).\n(b) Chu vi bể bơi.","Playground 20m×15m rectangle. Inside: circular pool radius 5m.\n(a) Area of playground (excluding pool).\n(b) Pool circumference."),
             a:[t("(a) S_sân=20×15=300 m²","S_rect=300"),t("S_bể=π×25=25π≈78.54 m²","S_pool=25π"),t("S_phần_sân=300−25π≈221.46 m²","S_playground=300−25π≈221.46"),t("(b) C=2π×5=10π≈31.42 m","C=10π≈31.42")]},
            {id:"e3",badge:t("Tổng hợp","Mixed"),q:t("Tam giác đều cạnh a=6.\n(a) Tính R, r, h, và diện tích S.\n(b) Diện tích phần nằm trong đường tròn ngoại tiếp nhưng ngoài tam giác.","Equilateral triangle, side 6.\n(a) Find R, r, h, S.\n(b) Area inside circumscribed circle but outside triangle."),
             a:[t("h=6√3/2=3√3; R=6√3/3=2√3; r=6√3/6=√3","h=3√3, R=2√3, r=√3"),t("S_tam_giác=(√3/4)·36=9√3≈15.59","S_triangle=9√3"),t("S_ngoại_tiếp=π·(2√3)²=12π≈37.70","S_circumcircle=12π"),t("S_phần_ngoài=12π−9√3≈22.11","S_outside=12π−9√3≈22.11")]},
          ].map(({id,q,a,badge})=>(
            <article key={id}>
              <div style={{ padding:"16px 20px",borderRadius:"10px 10px 0 0",background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
                  <div style={{ fontSize:17,fontWeight:600 }}>📝 {t("Bài tập","Exercise")}</div>
                  <span style={{ background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)",color:"white",fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20 }}>{badge}</span>
                </div>
                <div style={{ fontSize:15,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{q}</div>
              </div>
              <button onClick={()=>tr(id)} style={{ display:"block",width:"100%",padding:"12px 20px",background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left" }}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>
              {rev[id]&&<div style={{ padding:"16px 20px",background:"rgba(16, 185, 129, 0.15)",borderRadius:"0 0 10px 10px" }}>{a.map((l,i)=><div key={i} style={{ fontSize:15,color: "rgba(255, 255, 255, 0.7)",marginBottom:6 }}>{l}</div>)}</div>}
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
      videoId="B1HEzNTGeZ4"
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
