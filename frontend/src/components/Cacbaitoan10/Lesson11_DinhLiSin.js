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

export default function Lesson11_DinhLiSin() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson11_DinhLiSin";
  const chapterTitle = { vi: "Chương IV · Hệ Thức Lượng Trong Tam Giác", en: "Chapter IV · Triangle Trigonometry" };
  const lessonTitle = { vi: "Bài 11: Định Lí Sin", en: "Lesson 11: Law of Sines" };
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
        "text": "law of sines",
        "vi": "định lý sin",
        "detail": "<b>law of sines</b>: định lý sin.",
        "detailTitle": "law of sines (định lý sin)"
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
        "text": "sine ratio",
        "vi": "tỉ số sin",
        "detail": "<b>sine ratio</b>: tỉ số sin.",
        "detailTitle": "sine ratio (tỉ số sin)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "circumradius",
        "vi": "bán kính đường tròn ngoại tiếp",
        "detail": "<b>circumradius</b>: bán kính đường tròn ngoại tiếp.",
        "detailTitle": "circumradius (bán kính đường tròn ngoại tiếp)"
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
        "text": "ambiguous case",
        "vi": "trường hợp không xác định duy nhất",
        "detail": "<b>ambiguous case</b>: trường hợp không xác định duy nhất.",
        "detailTitle": "ambiguous case (trường hợp không xác định duy nhất)"
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
        "text": "sine ratio",
        "vi": "tỉ số sin",
        "detail": "<b>sine ratio</b>: tỉ số sin.",
        "detailTitle": "sine ratio (tỉ số sin)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "circumradius",
        "vi": "bán kính đường tròn ngoại tiếp",
        "detail": "<b>circumradius</b>: bán kính đường tròn ngoại tiếp.",
        "detailTitle": "circumradius (bán kính đường tròn ngoại tiếp)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "ambiguous case",
        "vi": "trường hợp không xác định duy nhất",
        "detail": "<b>ambiguous case</b>: trường hợp không xác định duy nhất.",
        "detailTitle": "ambiguous case (trường hợp không xác định duy nhất)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    {q:t("Định lí Sin: a/sinA = ?","Law of Sines: a/sinA = ?"),o:["b·sinB","b/sinB","2R","b/sinB = c/sinC = 2R"],a:3,ex:t("a/sinA = b/sinB = c/sinC = 2R, với R là bán kính đường tròn ngoại tiếp.","a/sinA = b/sinB = c/sinC = 2R, where R is the circumradius.")},
    {q:t("Tam giác: A=30°, a=5. Tính R.","Triangle: A=30°, a=5. Find R."),o:["5","10","5/2","2.5"],a:0,ex:t("R=a/(2sinA)=5/(2·sin30°)=5/(2·0.5)=5.","R=5/(2·0.5)=5.")},
    {q:t("Nên dùng Định lí Sin khi biết?","Use the Law of Sines when you know?"),o:[t("3 cạnh","3 sides"),t("2 cạnh + góc xen giữa","2 sides + included angle"),t("2 góc + 1 cạnh bất kỳ","2 angles + any 1 side"),t("chỉ 1 góc","only 1 angle")],a:2,ex:t("AAS hoặc ASA → 2 góc + 1 cạnh → dùng Định lí Sin.","AAS or ASA → 2 angles + 1 side → use Law of Sines.")},
    {q:t("Tam giác đều cạnh a. Tính R.","Equilateral triangle side a. Find R."),o:["a","a√3/3","a/2","a/√3"],a:3,ex:t("R=a/(2sin60°)=a/(2·√3/2)=a/√3=a√3/3≈0.577a.","R=a/√3=a√3/3.")},
    {q:t("a/sinA = b/sinB. Nếu a=b thì?","If a=b in a/sinA=b/sinB, then?"),o:["sinA>sinB","sinA<sinB","sinA=sinB (A=B)","A+B=90°"],a:2,ex:t("a=b → sinA=sinB → trong tam giác (góc 0°–180°) → A=B.","a=b → sinA=sinB → A=B (in a triangle).")},
  ];
  const tfCards = [
    {s:t("Định lí Sin: a/sinA = b/sinB = c/sinC = 2R.","Law of Sines: a/sinA = b/sinB = c/sinC = 2R."),a:true,ex:t("ĐÚNG — đây là phát biểu chuẩn với R là bán kính đường tròn ngoại tiếp.","TRUE — standard statement with R = circumradius.")},
    {s:t("Định lí Sin chỉ đúng với tam giác vuông.","The Law of Sines only holds for right triangles."),a:false,ex:t("SAI — Định lí Sin đúng với MỌI tam giác.","FALSE — it holds for ALL triangles.")},
    {s:t("Từ 2 góc và 1 cạnh ta giải được hoàn toàn tam giác bằng Định lí Sin.","2 angles + 1 side is enough to fully solve a triangle using the Law of Sines."),a:true,ex:t("ĐÚNG — tính góc thứ 3 (tổng 3 góc=180°), rồi dùng Định lí Sin tính 2 cạnh còn lại.","TRUE — find 3rd angle (sum=180°), then use Law of Sines for the other 2 sides.")},
    {s:t("Trong tam giác đều cạnh a: R = a.","Equilateral triangle side a: R = a."),a:false,ex:t("SAI — R=a/√3=a√3/3≈0.577a, không phải a.","FALSE — R=a√3/3≠a.")},
    {s:t("Định lí Sin cho phép tính bán kính đường tròn ngoại tiếp.","The Law of Sines allows computing the circumradius."),a:true,ex:t("ĐÚNG — R=a/(2sinA)=b/(2sinB)=c/(2sinC).","TRUE — R=a/(2sinA).")},
  ];
  const fillQuestions = [
    {id:"f1",tp:t("a / sinA = b / sinB = c / sinC = ___","a / sinA = b / sinB = c / sinC = ___"),ans:"2R",alt:["2r","2R"],h:""},
    {id:"f2",tp:t("R = a / (2 · ___)","R = a / (2 · ___)"),ans:"sinA",alt:["sina","sin A","sin(A)","sinA"],h:""},
    {id:"f3",tp:t("Dùng Định lí Sin khi biết ___ góc và 1 cạnh.","Use Law of Sines when you know ___ angles and 1 side."),ans:"2",alt:["2","hai","two"],h:""},
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        

      

      

      

      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize:16,lineHeight:1.8,marginBottom:16 }}>{t("Để đo khoảng cách giữa hai điểm không thể tiếp cận trực tiếp (ví dụ: hai bờ sông), người ta đặt một điểm đo thứ ba rồi dùng các góc đo được. Định lí Sin kết nối cạnh và góc đối diện — rất mạnh khi đã biết 2 góc!","To measure the distance between two inaccessible points (e.g. two riverbanks), a third measurement point is set up and angles are measured. The Law of Sines connects each side with its opposite angle — very powerful when 2 angles are known!")}</div>
          <div style={{ fontSize:16 }}>❓ <em>{t("Nếu biết 2 góc của tam giác, ta có thể tìm góc thứ 3 không?","If you know 2 angles of a triangle, can you always find the third?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="VjmFKle7xIw"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Brian McLogan (YouTube)", "Video by Brian McLogan (YouTube)")}
          />
        </div>
      </section>

      {/* 1. ĐỊNH LÍ SIN */}
      <section id="k1" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("1. Phát Biểu Định Lí Sin","1. Statement of the Law of Sines")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:17,color: "#22d3ee",marginBottom:12 }}>📌 {t("Định lí","Theorem")}</div>
          <div style={{ fontSize:15,lineHeight:1.8,marginBottom:16 }}>{t("Trong tam giác ABC với R là bán kính đường tròn ngoại tiếp:","In triangle ABC with R = circumradius:")}</div>
          <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:10,padding:"20px 24px",textAlign:"center" }}>
            <div style={{ fontFamily:"monospace",fontSize:22,color: "#22d3ee",fontWeight:700,letterSpacing:2 }}>
              a / sinA = b / sinB = c / sinC = 2R
            </div>
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{title:t("Cạnh lớn hơn","Larger side"),note:t("đối diện với góc lớn hơn","opposite the larger angle"),bg:"rgba(14, 165, 233, 0.15)",c:"#38bdf8"},
            {title:t("Cạnh bằng nhau","Equal sides"),note:t("khi và chỉ khi góc đối diện bằng nhau","iff opposite angles are equal"),bg:"rgba(16, 185, 129, 0.15)",c:"#4ade80"},
            {title:t("Cạnh lớn nhất","Largest side"),note:t("đối diện với góc lớn nhất","opposite the largest angle"),bg:"rgba(245, 158, 11, 0.15)",c:"#fbbf24"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:16,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:15,fontWeight:700,color:card.c,marginBottom:6 }}>{card.title}</div>
              <div style={{ background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8,fontSize:14 }}>{card.note}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. BÁN KÍNH R */}
      <section id="k2" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("2. Bán Kính Đường Tròn Ngoại Tiếp R","2. Circumradius R")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontFamily:"monospace",fontSize:16,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",padding:"14px 18px",borderRadius:8,lineHeight:2.2 }}>
            R = a / (2·sinA) = b / (2·sinB) = c / (2·sinC)
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{shape:t("Tam giác đều cạnh a","Equilateral, side a"),formula:"R = a / √3 = a√3/3"},
            {shape:t("Tam giác vuông (C=90°)","Right triangle (C=90°)"),formula:"R = c / 2 (nửa cạnh huyền)"},
            {shape:t("Tam giác cân b=c","Isosceles b=c"),formula:"R = b / (2·sinB)"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:16,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:14,color: "rgba(255, 255, 255, 0.5)",marginBottom:6 }}>{card.shape}</div>
              <div style={{ fontFamily:"monospace",fontSize:15,fontWeight:600,color: "#22d3ee" }}>{card.formula}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. KHI NÀO DÙNG */}
      <section id="k3" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("3. Khi Nào Dùng Định Lí Nào?","3. Law of Sines vs. Cosines")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,transition:"all 0.3s" }}>
          {[{title:t("✅ Dùng Định Lí SIN","✅ Use Law of SINES"),items:[t("Biết 2 góc + 1 cạnh bất kỳ (AAS)","2 angles + any 1 side (AAS)"),t("Biết 1 góc và cạnh đối diện + thêm 1 góc (ASA)","1 angle + opposite side + 1 more angle (ASA)"),t("Tính bán kính ngoại tiếp R","Computing circumradius R")],bg:"rgba(16, 185, 129, 0.15)",c:"#4ade80"},
            {title:t("✅ Dùng Định Lí CÔSIN","✅ Use Law of COSINES"),items:[t("Biết 3 cạnh → tìm góc (SSS)","3 sides → find angles (SSS)"),t("Biết 2 cạnh + góc xen giữa (SAS)","2 sides + included angle (SAS)"),t("Kiểm tra loại tam giác (nhọn/tù/vuông)","Check triangle type (acute/obtuse/right)")],bg:"rgba(14, 165, 233, 0.15)",c:"#38bdf8"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:15,fontWeight:700,color:card.c,marginBottom:10 }}>{card.title}</div>
              {card.items.map((item,j)=><div key={j} style={{ background:card.bg,color:card.c,padding:"7px 12px",borderRadius:6,fontSize:14,marginBottom:6 }}>• {item}</div>)}
            </article>
          ))}
        </div>
      </section>

      {/* THỰC HÀNH */}
      <section id="th" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:40,transition:"all 0.3s" }}>
          {[
            {id:"e1",q:t("Tam giác ABC: A=45°, B=60°, a=8. Tính b và R.","Triangle ABC: A=45°, B=60°, a=8. Find b and R."),
             a:[t("C=180°−45°−60°=75°","C=75°"),t("b=a·sinB/sinA=8·sin60°/sin45°=8·(√3/2)/(√2/2)=8√6/2=4√6≈9.8","b=4√6≈9.8"),t("R=a/(2sinA)=8/(2·sin45°)=8/√2=4√2≈5.66","R=4√2≈5.66")]},
            {id:"e2",q:t("Tam giác đều cạnh a=6. Tính R.","Equilateral triangle, side=6. Find R."),
             a:[t("Mọi góc=60°. R=a/(2sin60°)=6/(2·√3/2)=6/√3=2√3≈3.46","All angles=60°. R=6/√3=2√3≈3.46")]},
            {id:"e3",q:t("Tam giác ABC: A=30°, a=5, b=8. Tính sinB.","Triangle: A=30°, a=5, b=8. Find sinB."),
             a:[t("sinB/b=sinA/a → sinB=b·sinA/a=8·(1/2)/5=4/5","sinB=b·sinA/a=8·(1/2)/5=4/5"),t("B=arcsin(4/5)≈53.13° hoặc B'≈126.87°","B≈53.13° or B'≈126.87°")]},
          ].map(({id,q,a})=>(
            <article key={id}>
              <div style={{ padding:"16px 20px",borderRadius:"10px 10px 0 0",background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize:18,fontWeight:600,marginBottom:4 }}>📝 {t("Bài tập","Exercise")}</div>
                <div style={{ fontSize:15,lineHeight:1.7 }}>{q}</div>
              </div>
              <button onClick={()=>tr(id)} style={{ display:"block",width:"100%",padding:"12px 20px",background: "rgba(0, 0, 0, 0.3)", border: "1px solid rgba(255, 255, 255, 0.1)",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left" }}>
                {rev[id]?t("Ẩn đáp án ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}
              </button>
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
      videoId="VjmFKle7xIw"
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
