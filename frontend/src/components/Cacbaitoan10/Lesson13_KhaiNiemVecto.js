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

export default function Lesson13_KhaiNiemVecto() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson13_KhaiNiemVecto";
  const chapterTitle = { vi: "Chương V · Vectơ", en: "Chương V · Vectơ" };
  const lessonTitle = { vi: "Bài 13: Khái Niệm Vectơ", en: "Bài 13: Khái Niệm Vectơ" };
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
        "text": "vectors",
        "vi": "véc-tơ",
        "detail": "<b>vectors</b>: véc-tơ.",
        "detailTitle": "vectors (véc-tơ)"
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
        "text": "magnitude",
        "vi": "độ dài",
        "detail": "<b>magnitude</b>: độ dài.",
        "detailTitle": "magnitude (độ dài)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "direction",
        "vi": "hướng",
        "detail": "<b>direction</b>: hướng.",
        "detailTitle": "direction (hướng)"
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
        "text": "directed segment",
        "vi": "đoạn thẳng có hướng",
        "detail": "<b>directed segment</b>: đoạn thẳng có hướng.",
        "detailTitle": "directed segment (đoạn thẳng có hướng)"
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
        "text": "magnitude",
        "vi": "độ dài",
        "detail": "<b>magnitude</b>: độ dài.",
        "detailTitle": "magnitude (độ dài)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "direction",
        "vi": "hướng",
        "detail": "<b>direction</b>: hướng.",
        "detailTitle": "direction (hướng)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "directed segment",
        "vi": "đoạn thẳng có hướng",
        "detail": "<b>directed segment</b>: đoạn thẳng có hướng.",
        "detailTitle": "directed segment (đoạn thẳng có hướng)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': 'Vectơ là gì?', 'o': ['Đoạn thẳng có độ dài', 'Đoạn thẳng có hướng', 'Điểm trên mặt phẳng', 'Số thực'], 'a': 1, 'ex': 'Vectơ = đoạn thẳng có hướng (định hướng từ điểm đầu đến điểm cuối).'}, {'q': 'Hai vectơ bằng nhau khi nào?', 'o': ['Cùng điểm đầu', 'Cùng độ dài và cùng hướng', 'Cùng điểm cuối', 'Cùng độ dài'], 'a': 1, 'ex': '→a=→b ⟺ cùng độ dài VÀ cùng hướng. Vị trí không quan trọng.'}, {'q': 'Vectơ đối của →AB là?', 'o': ['→AB', '→BA', '→0', '→AA'], 'a': 1, 'ex': 'Vectơ đối của →AB là →BA (cùng độ dài, ngược hướng).'}, {'q': 'Vectơ không →0 có đặc điểm gì?', 'o': ['Độ dài = 1', 'Độ dài = 0', 'Hướng về phía đông', 'Không tồn tại'], 'a': 1, 'ex': '|→0| = 0. Điểm đầu = điểm cuối, hướng tùy ý (không xác định).'}, {'q': 'Hình bình hành ABCD. →AB = ?', 'o': ['→BC', '→DC', '→CD', '→CA'], 'a': 1, 'ex': 'Trong hình bình hành ABCD: AB // DC, cùng chiều → →AB = →DC.'}];
  const tfCards = [{'s': 'Hai vectơ cùng độ dài thì bằng nhau.', 'a': false, 'ex': 'SAI — cần cùng độ dài VÀ cùng hướng.'}, {'s': 'Vectơ →0 có độ dài bằng 0.', 'a': true, 'ex': 'ĐÚNG — |→0|=0, điểm đầu trùng điểm cuối.'}, {'s': '→AB = →CD ⟺ ABDC là hình bình hành.', 'a': true, 'ex': 'ĐÚNG — cùng độ dài, cùng hướng ⟺ AB // CD, AB=CD, cùng chiều ⟺ ABDC là hình bình hành.'}, {'s': 'Vectơ đối của →a là →a.', 'a': false, 'ex': 'SAI — vectơ đối của →a là −→a (cùng độ dài nhưng NGƯỢC hướng).'}, {'s': 'Mọi vectơ đều có điểm đầu tại gốc tọa độ O.', 'a': false, 'ex': 'SAI — vectơ tự do, có thể đặt điểm đầu bất kỳ.'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'Vectơ đối của →AB là ___.', 'ans': '→BA', 'alt': ['BA', 'vec(BA)', '→BA'], 'h': ''}, {'id': 'f2', 'tp': '→a = →b khi chúng có cùng ___ và cùng ___.', 'ans': 'độ dài, hướng', 'alt': ['do dai, huong', 'length, direction', 'do dai huong'], 'h': ''}, {'id': 'f3', 'tp': '|→0| = ___.', 'ans': '0', 'alt': ['0'], 'h': ''}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
      
      
      

      <section id="w" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Khi mô tả chuyển động, lực, hoặc tốc độ gió, chúng ta cần biết không chỉ độ lớn mà còn cả hướng. Đó chính là lý do vectơ ra đời — đại lượng có cả độ lớn lẫn hướng.","When describing motion, force, or wind speed, we need not just magnitude but also direction. That is why vectors exist — quantities with both magnitude and direction.")}</div>
          <div style={{fontSize:16}}>❓ <em>{t("Lực kéo 10N theo hướng đông và lực kéo 10N theo hướng bắc có giống nhau không?","Is a 10N force east the same as a 10N force north?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="pimr9I92GZY"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (YouTube)", "Video by Khan Academy (YouTube)")}
          />
        </div>
      </section>
      <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("1. Khái Niệm Vectơ","1. Vector Concept")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
          <div style={{fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10}}>📌 {t("Định nghĩa","Definition")}</div>
          <div style={{fontSize:15,lineHeight:1.8}}>{t("Vectơ là một đoạn thẳng có hướng. Vectơ AB (ký hiệu →AB) có: điểm đầu A, điểm cuối B, hướng từ A đến B, độ dài |AB|.","A vector is a directed line segment. Vector AB (written →AB) has: initial point A, terminal point B, direction from A to B, length |AB|.")}</div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,transition:"all 0.3s"}}>
          {[{icon:"📏",title:t("Độ dài (Modulus)","Length (Modulus)"),desc:t("|→AB| = khoảng cách A đến B. |→u| ≥ 0","| →AB | = distance A to B. |→u| ≥ 0")},
            {icon:"🧭",title:t("Hướng (Direction)","Direction"),desc:t("Góc mà vectơ tạo với chiều dương trục Ox","Angle the vector makes with positive x-axis")},
            {icon:"📍",title:t("Vectơ không","Zero Vector"),desc:t("→0: điểm đầu = điểm cuối, |→0|=0, hướng tùy ý","→0: start=end, |→0|=0, direction undefined")},
          ].map((card,i)=><article key={i} style={{padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center"}}><div style={{fontSize:28,marginBottom:8}}>{card.icon}</div><div style={{fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:6}}>{card.title}</div><div style={{fontSize:13,color:"#777",lineHeight:1.6}}>{card.desc}</div></article>)}
        </div>
      </section>
      <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("2. Hai Vectơ Bằng Nhau","2. Equal Vectors")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
          <div style={{fontSize:15,lineHeight:1.8}}>{t("Hai vectơ bằng nhau (→a = →b) khi và chỉ khi chúng có cùng độ dài VÀ cùng hướng. Vị trí điểm gốc không quan trọng!","Two vectors are equal (→a = →b) iff they have the same length AND same direction. The position of the starting point doesn't matter!")}</div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s"}}>
      {[
  {
    title: t("→a = →b nếu", "→a = →b if"),
    cond: t(
      `• Cùng độ dài: |→a|=|→b|\n• Cùng hướng`,
      `• Same length: |→a|=|→b|\n• Same direction`
    ),
    bg: "#eafaf1", c: "#1e8449"
  },
  {
    title: t("→a ≠ →b nếu", "→a ≠ →b if"),
    cond: t(
      `• Độ dài khác nhau, HOẶC\n• Hướng khác nhau`,
      `• Different lengths, OR\n• Different directions`
    ),
    bg: "#fdf2f2", c: "#922b21"
  },
  {
    title: t("Vectơ đối −→a", "Opposite vector −→a"),
    cond: t(
      `• Cùng độ dài với →a\n• Ngược hướng với →a`,
      `• Same length as →a\n• Opposite direction to →a`
    ),
    bg: "#eaf4fb", c: "#1a5276"
  },
].map((card, i) => (
     <article key={i} style={{padding:16, borderRadius:10, background:"#f9f9f9", boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
       <div style={{fontSize:14, fontWeight:700, color:card.c, marginBottom:8}}>{card.title}</div>
       <div style={{background:card.bg, color:card.c, padding:"8px 12px", borderRadius:8, fontSize:13, whiteSpace:"pre-wrap", lineHeight:1.7}}>{card.cond}</div>
     </article>
   ))}
        </div>
      </section>
      <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("3. Vectơ Cùng Phương, Cùng Hướng","3. Parallel & Same-Direction Vectors")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s"}}>
          {[{title:t("Cùng phương","Parallel"),desc:t("→a và →b cùng phương khi giá của chúng song song hoặc trùng nhau.","→a and →b are parallel when their lines of action are parallel or identical."),ex:t("→AB và →CD cùng phương nếu AB // CD","→AB and →CD are parallel if AB // CD"),c:"#1a5276",bg:"#eaf4fb"},
            {title:t("Cùng hướng","Same direction"),desc:t("Cùng phương VÀ cùng chiều (không ngược chiều).","Parallel AND same direction (not opposite)."),ex:t("→AB và →CD cùng hướng nếu → từ A→B và C→D cùng chiều","→AB and →CD same direction if both point the same way"),c:"#1e8449",bg:"#eafaf1"},
            {title:t("Ngược hướng","Opposite direction"),desc:t("Cùng phương NHƯNG ngược chiều nhau.","Parallel BUT pointing in opposite directions."),ex:t("→AB và →DC ngược hướng (D→C ngược A→B)","→AB and →DC are opposite (D→C vs A→B)"),c:"#922b21",bg:"#fdf2f2"},
          ].map((card,i)=><article key={i} style={{padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:15,fontWeight:700,color:card.c,marginBottom:8}}>{card.title}</div><div style={{fontSize:13,color:"#555",marginBottom:8,lineHeight:1.6}}>{card.desc}</div><div style={{background:card.bg,color:card.c,padding:"6px 10px",borderRadius:6,fontSize:12}}>{card.ex}</div></article>)}
        </div>
      </section>
      <section id="th" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
          {[{id:"e1",q:t("Cho hình bình hành ABCD. Tìm tất cả các vectơ bằng →AB.","Given parallelogram ABCD. Find all vectors equal to →AB."),
             a:[t("Trong hình bình hành ABCD: AB // DC và AB = DC (cùng chiều)","In parallelogram ABCD: AB // DC and AB = DC (same direction)"),t("→DC = →AB (cùng độ dài, cùng hướng)","→DC = →AB (same length, same direction)")]},
            {id:"e2",q:t("→a và →b có |→a|=3, |→b|=3. Khi nào →a = →b?","→a and →b have |→a|=3, |→b|=3. When is →a = →b?"),
             a:[t("Cần thêm điều kiện: →a và →b phải CÙNG HƯỚNG.","Need extra condition: →a and →b must have the SAME DIRECTION."),t("Chỉ có độ dài bằng nhau chưa đủ — hai vectơ có thể khác hướng!","Equal lengths alone are not enough — they could point in different directions!")]},
            {id:"e3",q:t("Vectơ →0 có bằng bất kỳ vectơ không?","Is the zero vector equal to any other vector?"),
             a:[t("Không. →0 chỉ bằng chính nó: →0 = →0.","No. →0 equals only itself: →0 = →0."),t("|→0|=0, nhưng mọi vectơ khác không đều có độ dài >0.","| →0|=0, but every nonzero vector has length >0.")]},
          ].map(({id,q,a})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:18,fontWeight:600,marginBottom:4}}>📝 {t("Bài tập","Exercise")}</div><div style={{fontSize:15,lineHeight:1.7}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color:"#555",marginBottom:6}}>{l}</div>)}</div>}</article>))}
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
      videoId="pimr9I92GZY"
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
