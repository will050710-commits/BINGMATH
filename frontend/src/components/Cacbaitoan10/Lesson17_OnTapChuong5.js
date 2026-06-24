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

export default function Lesson17_OnTapChuong5() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson17_OnTapChuong5";
  const chapterTitle = { vi: "Chương V · Vectơ", en: "Chapter V · Vectors" };
  const lessonTitle = { vi: "Bài 15 · Khái Niệm Vectơ", en: "L15 · Vector Concept" };
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
        "text": "vector review",
        "vi": "ôn tập véc-tơ",
        "detail": "<b>vector review</b>: ôn tập véc-tơ.",
        "detailTitle": "vector review (ôn tập véc-tơ)"
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
        "text": "vector operation",
        "vi": "phép toán véc-tơ",
        "detail": "<b>vector operation</b>: phép toán véc-tơ.",
        "detailTitle": "vector operation (phép toán véc-tơ)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "dot product",
        "vi": "tích vô hướng",
        "detail": "<b>dot product</b>: tích vô hướng.",
        "detailTitle": "dot product (tích vô hướng)"
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
        "text": "geometry application",
        "vi": "ứng dụng hình học",
        "detail": "<b>geometry application</b>: ứng dụng hình học.",
        "detailTitle": "geometry application (ứng dụng hình học)"
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
        "text": "vector operation",
        "vi": "phép toán véc-tơ",
        "detail": "<b>vector operation</b>: phép toán véc-tơ.",
        "detailTitle": "vector operation (phép toán véc-tơ)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "dot product",
        "vi": "tích vô hướng",
        "detail": "<b>dot product</b>: tích vô hướng.",
        "detailTitle": "dot product (tích vô hướng)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "geometry application",
        "vi": "ứng dụng hình học",
        "detail": "<b>geometry application</b>: ứng dụng hình học.",
        "detailTitle": "geometry application (ứng dụng hình học)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    {q:t("Hai vectơ bằng nhau khi nào?","When are two vectors equal?"),o:[t("Cùng điểm đầu","Same start point"),t("Cùng độ dài và cùng hướng","Same length and direction"),t("Cùng điểm cuối","Same end point"),t("Cùng độ dài","Same length")],a:1,ex:t("→a=→b ⟺ cùng độ dài VÀ cùng hướng.","Equal ⟺ same length AND direction.")},
    {q:t("Hình bình hành ABCD. →AB + →AD = ?","Parallelogram ABCD. →AB + →AD = ?"),o:["→BD","→AC","→BC","→CD"],a:1,ex:t("Quy tắc hình bình hành: →AB+→AD=→AC (đường chéo).","Parallelogram rule: sum = diagonal →AC.")},
    {q:t("→b = k·→a nghĩa là?","→b=k·→a means?"),o:[t("→a và →b bằng nhau","equal"),t("→a và →b cùng phương","parallel"),t("→a và →b vuông góc","perpendicular"),t("→a và →b cùng hướng","same direction")],a:1,ex:t("→b=k·→a ⟺ cùng phương (tồn tại số thực k).","→b=k·→a ⟺ parallel (k real).")},
    {q:t("→a=(3,4). |→a| = ?","→a=(3,4). |→a|=?"),o:["7","1","5","√7"],a:2,ex:t("|→a|=√(9+16)=√25=5.","| →a|=5.")},
    {q:t("→a·→b = 0 nghĩa là?","→a·→b=0 means?"),o:[t("→a = →b","→a=→b"),t("→a ⊥ →b","→a⊥→b"),t("→a và →b cùng hướng","same direction"),t("|→a|=|→b|","same length")],a:1,ex:t("→a·→b=|→a||→b|cosφ=0 ⟺ cosφ=0 ⟺ φ=90° ⟺ →a⊥→b.","dot product=0 ⟺ perpendicular.")},
  ];
  const tfCards = [
    {s:t("Vectơ đối của →AB là →BA.","Opposite of →AB is →BA."),a:true,ex:t("ĐÚNG — cùng độ dài, ngược hướng.","TRUE — same length, opposite direction.")},
    {s:t("→AB + →BC + →CA = →0.","→AB+→BC+→CA=→0."),a:true,ex:t("ĐÚNG — quy tắc ba điểm áp dụng hai lần.","TRUE — apply three-point rule twice.")},
    {s:t("k→a với k<0 cùng hướng →a.","k→a with k<0 has same direction as →a."),a:false,ex:t("SAI — k<0 → ngược hướng →a.","FALSE — k<0 → opposite direction.")},
    {s:t("→a·→a = |→a|²","→a·→a = |→a|²"),a:true,ex:t("ĐÚNG — φ=0°, cosφ=1 → →a·→a=|→a|².","TRUE — φ=0°, cosφ=1.")},
    {s:t("→a·→b = →b·→a (giao hoán).","→a·→b=→b·→a (commutative)."),a:true,ex:t("ĐÚNG — tích vô hướng giao hoán.","TRUE — dot product is commutative.")},
  ];
  const fillQuestions = [
    {id:"f1",tp:t("Quy tắc ba điểm: →AB + →BC = ___","Three-point rule: →AB+→BC=___"),ans:"→AC",alt:["AC","vec(AC)","→AC"],h:""},
    {id:"f2",tp:t("→a ⊥ →b ⟺ →a · →b = ___","→a⊥→b ⟺ →a·→b=___"),ans:"0",alt:["0"],h:""},
    {id:"f3",tp:t("A,B,C thẳng hàng ⟺ →AB = k · ___","A,B,C collinear ⟺ →AB=k·___"),ans:"→AC",alt:["AC","→AC","vec(AC)"],h:""},
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
      

      {/* Quick links */}
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginBottom:40,transition:"all 0.3s" }}>
        {[{slug:"khai-niem-vecto",num:"15",title:t("Khái Niệm Vectơ","Vector Concept")},{slug:"tong-hieu-vecto",num:"16",title:t("Tổng & Hiệu Vectơ","Sum & Difference")},{slug:"tich-so-vecto",num:"17",title:t("Tích Số với Vectơ","Scalar Mult.")},{slug:"tich-vo-huong",num:"18",title:t("Tích Vô Hướng","Dot Product")}].map(l=>(
          <Link key={l.slug} href={`/cacbailam10/${l.slug}`} style={{ textDecoration:"none" }}>
            <article style={{ padding:14,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",cursor:"pointer" }}>
              <div style={{ fontSize:12,color:"#777",marginBottom:3 }}>{t("Bài","L")} {l.num}</div>
              <div style={{ fontSize:14,fontWeight:600,color:"#0B4F5C" }}>{l.title}</div>
              <div style={{ fontSize:12,color:"#aaa",marginTop:3 }}>← {t("Ôn lại","Review")}</div>
            </article>
          </Link>
        ))}
      </div>

      

      {/* TÓM TẮT */}
      <section id="tomTat" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📚" title={t("Tóm Tắt Chương V","Chapter V Summary")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:22,transition:"all 0.3s" }}>
          {[{title:t("Bài 15 · Khái Niệm Vectơ","L15 · Vector Concept"),pts:[t("Vectơ = đoạn thẳng có hướng","Vector = directed segment"),t("→a=→b ⟺ cùng độ dài + cùng hướng","→a=→b ⟺ same length + direction"),t("Vectơ đối: −→a (ngược hướng, cùng độ dài)","Opposite: −→a (reverse direction, same length)"),t("Vectơ không: |→0|=0","Zero vector: |→0|=0")]},
            {title:t("Bài 16 · Tổng & Hiệu","L16 · Sum & Difference"),pts:[t("Quy tắc 3 điểm: →AB+→BC=→AC","Three-point: →AB+→BC=→AC"),t("Hình bình hành: →OA+→OB=→OC","Parallelogram: →OA+→OB=→OC"),t("→AB=→OB−→OA (vectơ vị trí)","→AB=→OB−→OA (position vectors)"),t("→a+(−→a)=→0","→a+(−→a)=→0")]},
            {title:t("Bài 17 · Tích Số với Vectơ","L17 · Scalar Multiplication"),pts:[t("|k→a|=|k|·|→a|","| k→a|=|k|·|→a|"),t("k>0: cùng hướng; k<0: ngược hướng","k>0: same dir; k<0: opposite"),t("→b=k·→a ⟺ →a//→b (cùng phương)","→b=k·→a ⟺ →a//→b (parallel)"),t("A,B,C thẳng hàng ⟺ →AB=k·→AC","A,B,C collinear ⟺ →AB=k·→AC")]},
            {title:t("Bài 18 · Tích Vô Hướng","L18 · Dot Product"),pts:[t("→a·→b=|→a||→b|cosφ (số thực!)","→a·→b=|→a||→b|cosφ (scalar!)"),t("→a⊥→b ⟺ →a·→b=0","→a⊥→b ⟺ →a·→b=0"),t("→a=(x₁,y₁), →b=(x₂,y₂): →a·→b=x₁x₂+y₁y₂","Coordinates: →a·→b=x₁x₂+y₁y₂"),t("|→a|=√(x²+y²)","| →a|=√(x²+y²)")]},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:10 }}>{card.title}</div>
              {card.pts.map((pt,j)=><div key={j} style={{ fontSize:13,color:"#555",marginBottom:7,display:"flex",gap:8 }}><span style={{ color:"#0B4F5C",fontWeight:700,flexShrink:0 }}>•</span><span style={{ fontFamily:"monospace" }}>{pt}</span></div>)}
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
            videoId="Kz_Mre-X0T0"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ 3Blue1Brown (CC BY)", "Video by 3Blue1Brown (CC BY)")}
          />
        </div>
      </section>

      {/* CÔNG THỨC */}
      <section id="congThuc" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📐" title={t("Bảng Công Thức Chương V","Chapter V Formula Sheet")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,transition:"all 0.3s" }}>
          {[{label:t("Tổng & Hiệu","Sum & Difference"),formula:"→AB + →BC = →AC\n→a − →b = →a + (−→b)\n→AB = →OB − →OA\n→GA + →GB + →GC = →0 (trọng tâm)"},
            {label:t("Tích số với vectơ","Scalar multiplication"),formula:"|k→a| = |k| · |→a|\nk(→a+→b) = k→a + k→b\n(k+l)→a = k→a + l→a\n→b = k·→a ⟺ →a // →b"},
            {label:t("Tích vô hướng","Dot product"),formula:"→a·→b = |→a|·|→b|·cosφ\n→a=(x₁,y₁): →a·→b=x₁x₂+y₁y₂\n→a⊥→b ⟺ →a·→b=0\ncosφ=(→a·→b)/(|→a|·|→b|)"},
            {label:t("Độ dài & Điều kiện","Length & Conditions"),formula:"|→a|=√(x²+y²)\n|→a|²=→a·→a\n3 điểm thẳng hàng: →AB=k·→AC\nHình bình hành: →OA+→OB=→OC"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:14,fontWeight:700,color:"#0B4F5C",marginBottom:10 }}>{card.label}</div>
              <div style={{ fontFamily:"monospace",fontSize:13,background:"white",padding:"10px 12px",borderRadius:8,lineHeight:1.9,whiteSpace:"pre-wrap" }}>{card.formula}</div>
            </article>
          ))}
        </div>
      </section>

      {/* BÀI TẬP TỔNG HỢP */}
      <section id="baiTap" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Bài Tập Tổng Hợp","Mixed Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s" }}>
          {[
            {id:"e1",badge:"L15+16",q:t("Cho hình bình hành ABCD, G là giao điểm hai đường chéo.\n(a) Tính →AC bằng →AB và →AD.\n(b) Chứng minh G là trung điểm AC: →GA+→GC=→0.","Parallelogram ABCD, G = intersection of diagonals.\n(a) Express →AC via →AB and →AD.\n(b) Prove G is midpoint of AC: →GA+→GC=→0."),
             a:[t("(a) →AC = →AB + →BC = →AB + →AD (vì →BC=→AD)","(a) →AC=→AB+→AD (since →BC=→AD)"),t("(b) G là trung điểm AC → →GA = −→GC → →GA+→GC=→0 ✓","(b) G midpoint AC → →GA=−→GC → sum=→0 ✓")]},
            {id:"e2",badge:"L17+18",q:t("Cho →a=(2,1), →b=(−1,3).\n(a) Tính →a·→b.\n(b) Tính góc φ giữa →a và →b.","→a=(2,1), →b=(−1,3).\n(a) Find →a·→b.\n(b) Find angle φ."),
             a:["→a·→b = 2·(−1)+1·3 = −2+3 = 1",t("|→a|=√5, |→b|=√10","| →a|=√5, |→b|=√10"),t("cosφ = 1/(√5·√10) = 1/√50 = √2/10 → φ=arccos(√2/10)≈81.87°","cosφ=1/√50 → φ≈81.87°")]},
            {id:"e3",badge:t("Tổng hợp","Mixed"),q:t("Cho A(1,2), B(3,6), C(4,8). Kiểm tra A, B, C có thẳng hàng không.","A(1,2), B(3,6), C(4,8). Are A, B, C collinear?"),
             a:[t("→AB=(3−1, 6−2)=(2,4)","→AB=(2,4)"),t("→AC=(4−1, 8−2)=(3,6)","→AC=(3,6)"),t("→AB=2·(1,2) và →AC=3·(1,2). Cả hai cùng phương (1,2).","Both parallel to (1,2)."),t("→AB = (2/3)·→AC → A, B, C THẲNG HÀNG ✓","→AB=(2/3)→AC → A,B,C are COLLINEAR ✓")]},
          ].map(({id,q,a,badge})=>(
            <article key={id}>
              <div style={{ padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
                  <div style={{ fontSize:17,fontWeight:600 }}>📝 {t("Bài tập","Exercise")}</div>
                  <span style={{ background:"black",color:"white",fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20 }}>{badge}</span>
                </div>
                <div style={{ fontSize:15,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{q}</div>
              </div>
              <button onClick={()=>tr(id)} style={{ display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left" }}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>
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
