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

export default function Lesson10_DinhLiCosin() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson10_DinhLiCosin";
  const chapterTitle = { vi: "Chương IV · Hệ Thức Lượng Trong Tam Giác", en: "Chapter IV · Triangle Trigonometry" };
  const lessonTitle = { vi: "Bài 10: Định Lí Côsin", en: "Lesson 10: Law of Cosines" };
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
        "text": "law of cosines",
        "vi": "định lý cosin",
        "detail": "<b>law of cosines</b>: định lý cosin.",
        "detailTitle": "law of cosines (định lý cosin)"
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
        "text": "included angle",
        "vi": "góc xen giữa",
        "detail": "<b>included angle</b>: góc xen giữa.",
        "detailTitle": "included angle (góc xen giữa)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "triangle side",
        "vi": "cạnh tam giác",
        "detail": "<b>triangle side</b>: cạnh tam giác.",
        "detailTitle": "triangle side (cạnh tam giác)"
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
        "text": "formula",
        "vi": "công thức",
        "detail": "<b>formula</b>: công thức.",
        "detailTitle": "formula (công thức)"
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
        "text": "included angle",
        "vi": "góc xen giữa",
        "detail": "<b>included angle</b>: góc xen giữa.",
        "detailTitle": "included angle (góc xen giữa)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "triangle side",
        "vi": "cạnh tam giác",
        "detail": "<b>triangle side</b>: cạnh tam giác.",
        "detailTitle": "triangle side (cạnh tam giác)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "formula",
        "vi": "công thức",
        "detail": "<b>formula</b>: công thức.",
        "detailTitle": "formula (công thức)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    {q:t("Định lí Côsin: a² = ?","Law of Cosines: a² = ?"),o:["b²+c²+2bc·cosA","b²+c²−2bc·cosA","b²−c²+2bc·cosA","(b+c)²"],a:1,ex:t("a²=b²+c²−2bc·cosA — dấu trừ trước 2bc·cosA.","a²=b²+c²−2bc·cosA — note the minus sign before 2bc·cosA.")},
    {q:t("Tam giác ABC: b=3, c=4, A=90°. Tính a.","Triangle: b=3, c=4, A=90°. Find a."),o:["5","√7","7","√25"],a:0,ex:t("cosA=cos90°=0 → a²=9+16=25 → a=5.","cos90°=0 → a²=9+16=25 → a=5.")},
    {q:t("cosA = (b²+c²−a²)/(2bc) dùng để làm gì?","cosA=(b²+c²−a²)/(2bc) is used to?"),o:[t("Tính cạnh a","Find side a"),t("Tính góc A từ 3 cạnh","Find angle A from 3 sides"),t("Tính diện tích","Find area"),t("Tính chu vi","Find perimeter")],a:1,ex:t("Công thức ngược của Đ.L.Côsin để tính góc khi đã biết 3 cạnh.","Inverse Law of Cosines to find angle when all 3 sides are known.")},
    {q:t("Tam giác: a=3, b=4, c=5. cosC = ?","Triangle: a=3, b=4, c=5. cosC = ?"),o:["0","1/2","−1/2","3/5"],a:0,ex:t("cosC=(a²+b²−c²)/(2ab)=(9+16−25)/24=0 → C=90°.","cosC=(9+16−25)/24=0 → C=90°.")},
    {q:t("Tam giác đều cạnh a. cosA = ?","Equilateral triangle side a. cosA = ?"),o:["0","1","1/2","−1/2"],a:2,ex:t("cosA=(a²+a²−a²)/(2a²)=a²/(2a²)=1/2 → A=60°.","cosA=a²/(2a²)=1/2 → A=60°.")},
  ];
  const tfCards = [
    {s:t("Định lí Pythagore là trường hợp đặc biệt của Định lí Côsin khi góc C=90°.","The Pythagorean theorem is a special case of the Law of Cosines when C=90°."),a:true,ex:t("ĐÚNG — cosC=cos90°=0 → c²=a²+b².","TRUE — cos90°=0 → c²=a²+b².")},
    {s:t("Định lí Côsin: a²=b²+c²+2bc·cosA.","Law of Cosines: a²=b²+c²+2bc·cosA."),a:false,ex:t("SAI — dấu trừ: a²=b²+c²−2bc·cosA.","FALSE — it's minus: a²=b²+c²−2bc·cosA.")},
    {s:t("Nếu tam giác có cosA<0 thì A là góc tù.","If cosA<0 in a triangle then A is obtuse."),a:true,ex:t("ĐÚNG — cosA<0 ⟺ 90°<A<180°.","TRUE — cosA<0 ⟺ 90°<A<180°.")},
    {s:t("Từ 3 cạnh bất kỳ ta luôn tính được 3 góc bằng Định lí Côsin.","From any 3 sides we can always find all 3 angles using the Law of Cosines."),a:false,ex:t("SAI — 3 cạnh phải thỏa bất đẳng thức tam giác: tổng hai cạnh > cạnh còn lại.","FALSE — the 3 sides must satisfy the triangle inequality first.")},
    {s:t("Trong tam giác đều, Định lí Côsin cho cosA=1/2.","In an equilateral triangle, the Law of Cosines gives cosA=1/2."),a:true,ex:t("ĐÚNG — cosA=(a²+a²−a²)/(2a²)=1/2 → A=60°.","TRUE — cosA=1/2 → A=60°.")},
  ];
  const fillQuestions = [
    {id:"f1",tp:t("Định lí Côsin: a² = b² + c² − ___ · cosA","Law of Cosines: a² = b² + c² − ___ · cosA"),ans:"2bc",alt:["2bc"],h:""},
    {id:"f2",tp:t("cosC = (a² + b² − c²) / ___","cosC = (a² + b² − c²) / ___"),ans:"2ab",alt:["2ab"],h:""},
    {id:"f3",tp:t("Khi C=90°, Định lí Côsin cho: c² = a² + ___","When C=90°, Law of Cosines gives: c² = a² + ___"),ans:"b²",alt:["b²","b^2"],h:""},
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        

      

      

      

      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize:16,lineHeight:1.8,marginBottom:16 }}>{t("Nếu biết hai cạnh và góc xen giữa của tam giác, bạn có thể tính cạnh còn lại không? Hoặc biết 3 cạnh, bạn có thể tính các góc? Định lí Côsin trả lời chính xác điều đó.","If you know two sides and the included angle of a triangle, can you find the third side? Or knowing 3 sides, can you find all angles? The Law of Cosines answers exactly that.")}</div>
          <div style={{ fontSize:16 }}>❓ <em>{t("Định lí Pythagore có liên hệ gì với Định lí Côsin không?","How is the Pythagorean theorem related to the Law of Cosines?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="bEIre_g2X9A"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Brian McLogan (YouTube)", "Video by Brian McLogan (YouTube)")}
          />
        </div>
      </section>

      {/* 1. ĐỊNH LÍ */}
      <section id="k1" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("1. Phát Biểu Định Lí Côsin","1. Statement of the Law of Cosines")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:12 }}>📌 {t("Định lí","Theorem")}</div>
          <div style={{ fontSize:15,lineHeight:1.8,marginBottom:16 }}>{t("Trong tam giác ABC với a, b, c là các cạnh đối diện với góc A, B, C:","In triangle ABC with sides a, b, c opposite angles A, B, C:")}</div>
          <div style={{ background:"white",borderRadius:10,padding:"18px 24px",fontFamily:"monospace",fontSize:17,lineHeight:2.6,textAlign:"center" }}>
            a² = b² + c² − 2bc · cosA<br/>
            b² = a² + c² − 2ac · cosB<br/>
            c² = a² + b² − 2ab · cosC
          </div>
        </div>
        <div className="reveal" data-reveal style={{ padding:16,borderRadius:10,background:"#fff3cd",border:"1px solid #ffc107",fontSize:15 }}>
          💡 {t("Trường hợp đặc biệt: C=90° → cosC=0 → c²=a²+b² (Định lí Pythagore!). Định lí Côsin là mở rộng của Pythagore cho mọi tam giác.","Special case: C=90° → cosC=0 → c²=a²+b² (Pythagorean theorem!). Law of Cosines generalizes Pythagoras to any triangle.")}
        </div>
      </section>

      {/* 2. TÍNH GÓC */}
      <section id="k2" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("2. Tính Góc Khi Biết 3 Cạnh","2. Finding Angles from 3 Sides")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>{t("Rút ra công thức tính góc:","Rearranging for angles:")}</div>
          <div style={{ background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:16,lineHeight:2.4,textAlign:"center" }}>
            cosA = (b² + c² − a²) / (2bc)<br/>
            cosB = (a² + c² − b²) / (2ac)<br/>
            cosC = (a² + b² − c²) / (2ab)
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{label:t("cosA > 0","cosA > 0"),note:t("→ A nhọn (A < 90°)","→ A is acute (A < 90°)"),bg:"#eafaf1",c:"#1e8449"},
            {label:t("cosA = 0","cosA = 0"),note:t("→ A = 90° (vuông)","→ A = 90° (right angle)"),bg:"#eaf4fb",c:"#1a5276"},
            {label:t("cosA < 0","cosA < 0"),note:t("→ A tù (A > 90°)","→ A is obtuse (A > 90°)"),bg:"#fdf2f2",c:"#922b21"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center" }}>
              <div style={{ fontFamily:"monospace",fontSize:18,fontWeight:700,color:card.c,marginBottom:8 }}>{card.label}</div>
              <div style={{ background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8,fontSize:14,fontWeight:600 }}>{card.note}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. ỨNG DỤNG */}
      <section id="k3" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("3. Khi Nào Dùng Định Lí Côsin?","3. When to Use the Law of Cosines?")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,transition:"all 0.3s" }}>
          {[{case:t("Biết 2 cạnh + góc xen giữa (SAS)","2 sides + included angle (SAS)"),use:t("→ Tính cạnh thứ 3: a²=b²+c²−2bc·cosA","→ Find 3rd side: a²=b²+c²−2bc·cosA"),bg:"#eafaf1",c:"#1e8449"},
            {case:t("Biết 3 cạnh (SSS)","3 sides known (SSS)"),use:t("→ Tính cả 3 góc bằng công thức cosine ngược","→ Find all 3 angles using inverse cosine"),bg:"#eaf4fb",c:"#1a5276"},
            {case:t("Kiểm tra dạng tam giác","Check triangle type"),use:t("→ c²=a²+b² (vuông), <(nhọn), >(tù)","→ c²=a²+b² (right), < (acute), > (obtuse)"),bg:"#fff3cd",c:"#856404"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:14,fontWeight:700,color:card.c,marginBottom:8 }}>{card.case}</div>
              <div style={{ background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8,fontSize:13,fontFamily:"monospace" }}>{card.use}</div>
            </article>
          ))}
        </div>
      </section>

      {/* THỰC HÀNH */}
      <section id="th" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:40,transition:"all 0.3s" }}>
          {[
            {id:"e1",q:t("Tam giác ABC: b=5, c=7, A=60°. Tính cạnh a.","Triangle ABC: b=5, c=7, A=60°. Find side a."),
             a:[t("a²=b²+c²−2bc·cosA=25+49−2·5·7·cos60°","a²=25+49−2·5·7·cos60°"),t("=74−70·(1/2)=74−35=39","=74−35=39"),t("→ a=√39≈6.24","→ a=√39≈6.24")]},
            {id:"e2",q:t("Tam giác: a=7, b=5, c=6. Tính góc A.","Triangle: a=7, b=5, c=6. Find angle A."),
             a:[t("cosA=(b²+c²−a²)/(2bc)=(25+36−49)/(2·5·6)=12/60=1/5","cosA=(25+36−49)/60=1/5"),t("A=arccos(1/5)≈78.46°","A≈78.46°")]},
            {id:"e3",q:t("Tam giác a=3, b=4, c=5. Là tam giác gì?","Triangle: a=3, b=4, c=5. What type?"),
             a:[t("c²=25; a²+b²=9+16=25","c²=25; a²+b²=25"),t("Vì c²=a²+b² → C=90° → TAM GIÁC VUÔNG!","c²=a²+b² → C=90° → RIGHT triangle!")]},
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
      videoId="bEIre_g2X9A"
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
