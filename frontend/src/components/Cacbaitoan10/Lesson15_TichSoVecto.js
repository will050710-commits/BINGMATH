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

export default function Lesson15_TichSoVecto() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson15_TichSoVecto";
  const chapterTitle = { vi: "Chương V · Vectơ", en: "Chương V · Vectơ" };
  const lessonTitle = { vi: "Bài 15: Tích của Số với Vectơ", en: "Bài 15: Tích của Số với Vectơ" };
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
        "text": "scalar multiplication of vectors",
        "vi": "tích của một số với véc-tơ",
        "detail": "<b>scalar multiplication of vectors</b>: tích của một số với véc-tơ.",
        "detailTitle": "scalar multiplication of vectors (tích của một số với véc-tơ)"
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
        "text": "scalar",
        "vi": "số thực",
        "detail": "<b>scalar</b>: số thực.",
        "detailTitle": "scalar (số thực)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "same direction",
        "vi": "cùng hướng",
        "detail": "<b>same direction</b>: cùng hướng.",
        "detailTitle": "same direction (cùng hướng)"
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
        "text": "opposite direction",
        "vi": "ngược hướng",
        "detail": "<b>opposite direction</b>: ngược hướng.",
        "detailTitle": "opposite direction (ngược hướng)"
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
        "text": "scalar",
        "vi": "số thực",
        "detail": "<b>scalar</b>: số thực.",
        "detailTitle": "scalar (số thực)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "same direction",
        "vi": "cùng hướng",
        "detail": "<b>same direction</b>: cùng hướng.",
        "detailTitle": "same direction (cùng hướng)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "opposite direction",
        "vi": "ngược hướng",
        "detail": "<b>opposite direction</b>: ngược hướng.",
        "detailTitle": "opposite direction (ngược hướng)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': 'k→a với k < 0 và →a ≠ →0. Kết quả k→a có hướng thế nào?', 'o': ['Cùng hướng →a', 'Ngược hướng →a', 'Hướng tùy ý', 'Không có hướng'], 'a': 1, 'ex': 'k<0 → k→a ngược hướng →a, độ dài |k|·|→a|.'}, {'q': '|−3→a| = ? khi |→a| = 5', 'o': ['−15', '15', '3', '8'], 'a': 1, 'ex': '|−3→a|=|−3|·|→a|=3·5=15.'}, {'q': '→b = k·→a nghĩa là?', 'o': ['→a và →b bằng nhau', '→a và →b cùng phương', '→a và →b vuông góc', '→a và →b cùng hướng'], 'a': 1, 'ex': '→b=k·→a ⟺ →a và →b cùng phương (song song hoặc trùng).'}, {'q': 'A,B,C thẳng hàng khi nào?', 'o': ['→AB ⊥ →AC', '→AB = k·→AC', '|→AB|=|→AC|', '→AB + →AC = →0'], 'a': 1, 'ex': 'A,B,C thẳng hàng ⟺ →AB = k·→AC (tồn tại k).'}, {'q': 'k(→a + →b) = ?', 'o': ['k→a + →b', '→a + k→b', 'k→a + k→b', 'k²(→a+→b)'], 'a': 2, 'ex': 'Tính chất phân phối: k(→a+→b)=k→a+k→b.'}];
  const tfCards = [{'s': 'k→a với k=0 cho kết quả là vectơ không →0.', 'a': true, 'ex': 'ĐÚNG — 0·→a = →0 với mọi →a.'}, {'s': '2→a có cùng hướng với →a.', 'a': true, 'ex': 'ĐÚNG — k=2>0 → cùng hướng.'}, {'s': '−→a có cùng hướng với →a.', 'a': false, 'ex': 'SAI — −→a=(−1)→a, k=−1<0 → NGƯỢC hướng →a.'}, {'s': '→b = k·→a ⟺ →a và →b cùng phương.', 'a': true, 'ex': 'ĐÚNG — điều kiện cùng phương cho →a ≠ →0.'}, {'s': '|k→a| = k·|→a| với mọi k.', 'a': false, 'ex': 'SAI — |k→a| = |k|·|→a| (giá trị tuyệt đối của k).'}];
  const fillQuestions = [{'id': 'f1', 'tp': '→b = k·→a ⟺ →a và →b ___.', 'ans': 'cùng phương', 'alt': ['cung phuong', 'parallel', 'song song'], 'h': ''}, {'id': 'f2', 'tp': '|k→a| = ___ · |→a|', 'ans': '|k|', 'alt': ['|k|', 'abs(k)'], 'h': ''}, {'id': 'f3', 'tp': '(−1)·→a = ___', 'ans': '−→a', 'alt': ['-a', '−a', '−→a', '-vec(a)'], 'h': ''}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
      
      
      

      <section id="w" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Nếu một người đi với vectơ vận tốc →v, thì sau 2 giờ họ đã di chuyển theo vectơ 2→v — cùng hướng nhưng gấp đôi độ dài. Đây là tích của số với vectơ!","If someone moves with velocity vector →v, after 2 hours they've displaced 2→v — same direction but double length. This is scalar multiplication of a vector!")}</div>
          <div style={{fontSize:16}}>❓ <em>{t("k→v với k < 0 nghĩa là gì về hướng?","What does k→v mean for direction when k < 0?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="68E6XGZ_E8M"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ 3Blue1Brown (CC BY)", "Video by 3Blue1Brown (CC BY)")}
          />
        </div>
      </section>
      <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("1. Định Nghĩa Tích Số với Vectơ","1. Definition: Scalar × Vector")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
          <div style={{fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10}}>📌 {t("Định nghĩa","Definition")}</div>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Cho số thực k và vectơ →a ≠ →0:","For real number k and vector →a ≠ →0:")}</div>
          <div style={{background:"white",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:15,lineHeight:2.2}}>
            |k→a| = |k| · |→a|<br/>
            k &gt; 0: k→a cùng hướng →a<br/>
            k &lt; 0: k→a ngược hướng →a<br/>
            k = 0: k→a = →0
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,transition:"all 0.3s"}}>
          {[{k:"k > 0",desc:t("Cùng hướng →a, dài |k|·|→a|","Same direction as →a, length |k|·|→a|"),bg:"#eafaf1",c:"#1e8449"},
            {k:"k < 0",desc:t("Ngược hướng →a, dài |k|·|→a|","Opposite to →a, length |k|·|→a|"),bg:"#fdf2f2",c:"#922b21"},
            {k:"k = 0",desc:t("Kết quả là vectơ không →0","Result is zero vector →0"),bg:"#eaf4fb",c:"#1a5276"},
            {k:"|k| > 1",desc:t("Phóng to vectơ (kéo dài)","Vector scaled up (stretched)"),bg:"#fff3cd",c:"#856404"},
          ].map((card,i)=><article key={i} style={{padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center"}}><div style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:card.c,marginBottom:8}}>{card.k}</div><div style={{background:card.bg,color:card.c,padding:"8px 10px",borderRadius:8,fontSize:13,lineHeight:1.6}}>{card.desc}</div></article>)}
        </div>
      </section>
      <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("2. Tính Chất","2. Properties")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
          <div style={{background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:15,lineHeight:2.2}}>
            k(→a + →b) = k→a + k→b  (phân phối)<br/>
            (k + l)→a = k→a + l→a   (phân phối)<br/>
            (kl)→a = k(l→a)          (kết hợp)<br/>
            1·→a = →a                 (đơn vị)<br/>
            (−1)·→a = −→a             (đối)
          </div>
        </div>
      </section>
      <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("3. Điều Kiện Cùng Phương","3. Collinearity Condition")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
          <div style={{fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:10}}>📌 {t("Định lý","Theorem")}</div>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Hai vectơ →a ≠ →0 và →b cùng phương khi và chỉ khi tồn tại số thực k sao cho:","Two vectors →a ≠ →0 and →b are parallel iff there exists a real k such that:")}</div>
          <div style={{background:"white",borderRadius:10,padding:"12px 18px",fontFamily:"monospace",fontSize:18,textAlign:"center",color:"#0B4F5C",fontWeight:700}}>→b = k·→a</div>
          <div style={{marginTop:12,padding:"10px 14px",background:"#fff3cd",borderRadius:8,fontSize:14}}>{t("💡 Ứng dụng: kiểm tra 3 điểm thẳng hàng. A, B, C thẳng hàng ⟺ →AB = k·→AC.","💡 Application: check if 3 points are collinear. A, B, C collinear ⟺ →AB = k·→AC.")}</div>
        </div>
      </section>
      <section id="th" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
          {[{id:"e1",q:t("Cho →a = →AB, |→a| = 4. Tính |3→a| và |−2→a|.","→a = →AB, |→a|=4. Find |3→a| and |−2→a|."),
             a:[t("|3→a| = |3|·|→a| = 3·4 = 12","| 3→a| = 3·4 = 12"),t("|−2→a| = |−2|·|→a| = 2·4 = 8","| −2→a| = 2·4 = 8")]},
            {id:"e2",q:t("Chứng minh G là trọng tâm tam giác ABC: →GA + →GB + →GC = →0","Prove G is centroid of triangle ABC: →GA+→GB+→GC=→0"),
             a:[t("Gọi M là trung điểm BC: →GM = (→GB+→GC)/2 → →GB+→GC = 2→GM","Let M be midpoint BC: →GB+→GC=2→GM"),t("G là trọng tâm → G trên AM với AG=2GM → →GA = −2→GM","G is centroid → AG=2GM → →GA=−2→GM"),t("→GA+→GB+→GC = −2→GM+2→GM = →0 ✓","→GA+→GB+→GC=0 ✓")]},
            {id:"e3",q:t("Ba điểm A, B, C thẳng hàng. →AB=(2,4), →AC=(1,2). Kiểm tra.","A,B,C collinear? →AB=(2,4), →AC=(1,2). Check."),
             a:[t("→AB = 2·(1,2) = 2·→AC","→AB = 2·→AC"),t("Vì →AB = k·→AC (k=2), nên A, B, C thẳng hàng ✓","Since →AB=2·→AC, points A,B,C are collinear ✓")]},
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
      videoId="68E6XGZ_E8M"
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
