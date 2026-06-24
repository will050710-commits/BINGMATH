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

export default function Lesson26_HoanViChinhHopToHop() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson26_HoanViChinhHopToHop";
  const chapterTitle = { vi: "Chương VIII · Tổ Hợp", en: "Chương VIII · Tổ Hợp" };
  const lessonTitle = { vi: "Bài 26: Hoán Vị, Chỉnh Hợp, Tổ Hợp", en: "Bài 26: Hoán Vị, Chỉnh Hợp, Tổ Hợp" };
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
    "k4",
    "📖",
    "4. Khái niệm",
    "4. Concept"
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
        "text": "permutations, arrangements, and combinations",
        "vi": "hoán vị, chỉnh hợp và tổ hợp",
        "detail": "<b>permutations, arrangements, and combinations</b>: hoán vị, chỉnh hợp và tổ hợp.",
        "detailTitle": "permutations, arrangements, and combinations (hoán vị, chỉnh hợp và tổ hợp)"
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
        "text": "factorial",
        "vi": "giai thừa",
        "detail": "<b>factorial</b>: giai thừa.",
        "detailTitle": "factorial (giai thừa)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "arrangement",
        "vi": "chỉnh hợp",
        "detail": "<b>arrangement</b>: chỉnh hợp.",
        "detailTitle": "arrangement (chỉnh hợp)"
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
        "text": "combination",
        "vi": "tổ hợp",
        "detail": "<b>combination</b>: tổ hợp.",
        "detailTitle": "combination (tổ hợp)"
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
        "text": "factorial",
        "vi": "giai thừa",
        "detail": "<b>factorial</b>: giai thừa.",
        "detailTitle": "factorial (giai thừa)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "arrangement",
        "vi": "chỉnh hợp",
        "detail": "<b>arrangement</b>: chỉnh hợp.",
        "detailTitle": "arrangement (chỉnh hợp)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "combination",
        "vi": "tổ hợp",
        "detail": "<b>combination</b>: tổ hợp.",
        "detailTitle": "combination (tổ hợp)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': 'Pₙ = ?', 'o': ['n+1', 'n²', 'n!', '2n'], 'a': 2, 'ex': 'Pₙ = n! (giai thừa).'}, {'q': 'A₅³ = ?', 'o': ['10', '20', '60', '120'], 'a': 2, 'ex': 'A₅³=5×4×3=60.'}, {'q': 'C₆² = ?', 'o': ['12', '15', '30', '36'], 'a': 1, 'ex': 'C₆²=6!/(2!4!)=30/2=15.'}, {'q': 'Chọn 3 người từ 8 không quan tâm thứ tự: dùng công thức nào?', 'o': ['P₈', 'A₈³', 'C₈³', '8³'], 'a': 2, 'ex': 'Không thứ tự → Tổ hợp C₈³=56.'}, {'q': 'C₁₀³ = ?', 'o': ['60', '90', '120', '720'], 'a': 2, 'ex': 'C₁₀³=10×9×8/(3×2×1)=720/6=120.'}];
  const tfCards = [{'s': 'Cₙᵏ = Cₙⁿ⁻ᵏ.', 'a': true, 'ex': 'ĐÚNG — tính chất đối xứng của tổ hợp.'}, {'s': 'Chỉnh hợp và tổ hợp khác nhau ở chỗ thứ tự.', 'a': true, 'ex': 'ĐÚNG — chỉnh hợp có thứ tự, tổ hợp không.'}, {'s': 'P₄ = 4! = 24.', 'a': true, 'ex': 'ĐÚNG — 4!=24.'}, {'s': 'A₅² = C₅².', 'a': false, 'ex': 'SAI — A₅²=20, C₅²=10. Khác nhau k! lần.'}, {'s': 'C₁₀⁰ = 1.', 'a': true, 'ex': 'ĐÚNG — C_n^0 = 1 (chọn 0 phần tử, 1 cách).'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'Aₙᵏ = n! / ___', 'ans': '(n-k)!', 'alt': ['(n-k)!', '(n−k)!'], 'h': ''}, {'id': 'f2', 'tp': 'C₅² = ___', 'ans': '10', 'alt': ['10'], 'h': '5!/(2!3!)'}, {'id': 'f3', 'tp': 'Cₙᵏ = Cₙ___', 'ans': 'n-k', 'alt': ['n-k', 'n−k'], 'h': 'Tính chất đối xứng'}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Xếp 4 người vào 4 ghế: 4!=24 cách. Chọn đội trưởng và phó từ 10 người: P(10,2)=90 cách. Chọn 3 người từ 10 người (không phân biệt thứ tự): C(10,3)=120 cách. Ba khái niệm này là nền tảng của tổ hợp!","Arrange 4 people in 4 chairs: 4!=24. Choose captain and vice from 10: P(10,2)=90. Choose 3 from 10 (unordered): C(10,3)=120. These 3 concepts are the foundation of combinatorics!")}</div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="XqQTXW7SKf0"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Hoán Vị","1. Permutations of n Elements")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Hoán vị của n phần tử là một cách sắp xếp n phần tử đó theo một thứ tự xác định.","A permutation of n elements is an arrangement of all n elements in a specific order.")}</div>
        <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:20,textAlign:"center",color: "#22d3ee",fontWeight:700,lineHeight:2.2}}>Pₙ = n! = n×(n−1)×...×2×1<br/><span style={{fontSize:14,fontWeight:400,color: "rgba(255, 255, 255, 0.5)"}}>0! = 1 &nbsp;|&nbsp; 1! = 1 &nbsp;|&nbsp; 5! = 120</span></div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Chỉnh Hợp","2. Arrangements (k from n)")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Chỉnh hợp chập k của n phần tử: số cách chọn và sắp xếp k phần tử từ n phần tử (có THỨ TỰ).","Arrangement of k from n: ways to select and order k from n elements (ORDER matters).")}</div>
        <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:19,textAlign:"center",color: "#22d3ee",fontWeight:700,lineHeight:2.4}}>
          Aₙᵏ = n! / (n−k)! = n(n−1)...(n−k+1)
        </div>
        <div style={{marginTop:10,fontSize:14,color: "rgba(255, 255, 255, 0.5)",textAlign:"center"}}>{t("Ví dụ: A₅² = 5×4 = 20","Example: A₅² = 5×4 = 20")}</div>
      </div>
    </section>
    <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("3. Tổ Hợp","3. Combinations (k from n)")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Tổ hợp chập k của n phần tử: số cách chọn k phần tử từ n (KHÔNG có thứ tự, không phân biệt).","Combination of k from n: ways to choose k from n (NO ORDER, unordered).")}</div>
        <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:19,textAlign:"center",color: "#22d3ee",fontWeight:700,lineHeight:2.4}}>
          Cₙᵏ = n! / (k!(n−k)!) = Aₙᵏ / k!
        </div>
        <div style={{marginTop:10,fontSize:14,color: "rgba(255, 255, 255, 0.5)",textAlign:"center"}}>{t("Ví dụ: C₅² = 10, C₁₀³ = 120","Example: C₅² = 10, C₁₀³ = 120")}</div>
      </div>
      <div className="reveal" data-reveal style={{padding:16,borderRadius:10,background:"rgba(245, 158, 11, 0.15)",border:"1px solid #ffc107",fontSize:14,marginTop:8}}>
        ⭐ {t("Tính chất: Cₙᵏ = Cₙⁿ⁻ᵏ. Tức C₁₀³ = C₁₀⁷ = 120.","Property: Cₙᵏ=Cₙⁿ⁻ᵏ. So C₁₀³=C₁₀⁷=120.")}
      </div>
    </section>
    <section id="k4" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("4. So Sánh Ba Khái Niệm","4. Comparing the Three Concepts")} />
      <div className="reveal" data-reveal style={{overflowX:"auto",borderRadius:10,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:14,minWidth:500}}>
          <thead><tr style={{background:"#22d3ee",color:"white"}}>{[t("Khái niệm","Concept"),t("Công thức","Formula"),t("Thứ tự?","Order?"),t("Lấy bao nhiêu?","Take k?"),t("Ví dụ","Example")].map((h,i)=><td key={i} style={{padding:"10px 12px",fontWeight:700,border:"1px solid rgba(255,255,255,0.2)"}}>{h}</td>)}</tr></thead>
          <tbody>
            {[[t("Hoán vị Pₙ","Permutation Pₙ"),"n!",t("CÓ","YES"),t("Tất cả n","All n"),"P₄=24"],
              [t("Chỉnh hợp Aₙᵏ","Arrangement Aₙᵏ"),"n!/(n−k)!",t("CÓ","YES"),"k","A₅²=20"],
              [t("Tổ hợp Cₙᵏ","Combination Cₙᵏ"),"n!/(k!(n−k)!)",t("KHÔNG","NO"),"k","C₅²=10"]
            ].map((row,ri)=>(<tr key={ri} style={{background:ri%2===0?"#f9f9f9":"white"}}>{row.map((cell,ci)=>(<td key={ci} style={{padding:"9px 12px",border:"1px solid #e0e0e0",fontFamily:ci===1||ci===4?"monospace":"inherit",fontSize:ci===1?13:14,fontWeight:ci===0?700:400,color:ci===0?"#22d3ee":ci===2?ri===2?"#f87171":"#4ade80":"#333"}}>{cell}</td>))}</tr>))}
          </tbody>
        </table>
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:t("Có bao nhiêu cách xếp 5 học sinh vào 5 ghế khác nhau?","How many ways to arrange 5 students in 5 different chairs?"),a:["P₅ = 5! = 5×4×3×2×1 = 120"]},
          {id:"e2",q:t("Chọn lớp trưởng và lớp phó từ 10 HS (thứ tự quan trọng). Bao nhiêu cách?","Choose president then vice from 10 students (order matters). How many?"),a:["A₁₀² = 10×9 = 90",t("(Chỉnh hợp vì thứ tự quan trọng: chức vụ khác nhau)","(Arrangement since president ≠ vice)")],},
          {id:"e3",q:t("Chọn 3 đại diện từ 10 HS (không phân biệt thứ tự). Bao nhiêu cách?","Choose 3 representatives from 10 students (unordered). How many?"),a:["C₁₀³ = 10!/(3!×7!) = 120",t("(Tổ hợp vì không phân biệt thứ tự)","(Combination since order doesn't matter)")]},
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
      videoId="XqQTXW7SKf0"
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
