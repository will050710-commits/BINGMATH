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

export default function Lesson19_HinhHocDoLuong2() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson19_HinhHocDoLuong2";
  const chapterTitle = { vi: "Chương VI · Hình Học Đo Lường", en: "Chapter VI · Geometry & Measurement" };
  const lessonTitle = { vi: "Bài 19: Diện Tích và Chu Vi", en: "Lesson 19: Area and Perimeter" };
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
        "text": "area and perimeter",
        "vi": "diện tích và chu vi",
        "detail": "<b>area and perimeter</b>: diện tích và chu vi.",
        "detailTitle": "area and perimeter (diện tích và chu vi)"
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
        "text": "triangle area",
        "vi": "diện tích tam giác",
        "detail": "<b>triangle area</b>: diện tích tam giác.",
        "detailTitle": "triangle area (diện tích tam giác)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "circle formula",
        "vi": "công thức đường tròn",
        "detail": "<b>circle formula</b>: công thức đường tròn.",
        "detailTitle": "circle formula (công thức đường tròn)"
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
        "text": "measurement application",
        "vi": "bài toán đo lường",
        "detail": "<b>measurement application</b>: bài toán đo lường.",
        "detailTitle": "measurement application (bài toán đo lường)"
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
        "text": "triangle area",
        "vi": "diện tích tam giác",
        "detail": "<b>triangle area</b>: diện tích tam giác.",
        "detailTitle": "triangle area (diện tích tam giác)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "circle formula",
        "vi": "công thức đường tròn",
        "detail": "<b>circle formula</b>: công thức đường tròn.",
        "detailTitle": "circle formula (công thức đường tròn)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "measurement application",
        "vi": "bài toán đo lường",
        "detail": "<b>measurement application</b>: bài toán đo lường.",
        "detailTitle": "measurement application (bài toán đo lường)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    {q:t("Diện tích hình thoi có hai đường chéo d₁ và d₂ là?","Area of rhombus with diagonals d₁, d₂?"),o:["d₁·d₂","(d₁+d₂)/2","d₁·d₂/2","(d₁·d₂)²"],a:2,ex:t("S=d₁·d₂/2. Hai đường chéo hình thoi vuông góc nhau.","S=d₁·d₂/2. Diagonals of a rhombus are perpendicular.")},
    {q:t("Hình thang đáy lớn a, đáy nhỏ b, chiều cao h. Diện tích S = ?","Trapezoid with parallel sides a,b and height h. Area?"),o:["(a+b)·h","(a+b)·h/2","a·b·h/2","(a−b)·h"],a:1,ex:t("S=(a+b)·h/2. Trung bình hai đáy nhân chiều cao.","S=(a+b)·h/2.")},
    {q:t("Diện tích hình tròn bán kính R là?","Area of circle with radius R?"),o:["2πR","πR²","πR²/2","2πR²"],a:1,ex:t("S=πR². Chu vi C=2πR.","S=πR². Circumference C=2πR.")},
    {q:t("Hình bình hành cạnh a và chiều cao h. Diện tích là?","Parallelogram side a and height h. Area?"),o:["a²","a·h/2","a·h","(a+h)²"],a:2,ex:t("S=a·h (đáy × chiều cao tương ứng).","S=a·h (base × corresponding height).")},
    {q:t("Hình vuông cạnh a có diện tích S = ?","Square side a has area?"),o:["4a","2a²","a²","a³"],a:2,ex:t("S=a². Chu vi=4a.","S=a². Perimeter=4a.")},
  ];
  const tfCards = [
    {s:t("Diện tích hình chữ nhật = chiều dài × chiều rộng.","Rectangle area = length × width."),a:true,ex:t("ĐÚNG — S=l×w, đây là công thức cơ bản nhất.","TRUE — S=l×w, most basic formula.")},
    {s:t("Diện tích hình thoi = tích hai đường chéo.","Rhombus area = product of diagonals."),a:false,ex:t("SAI — S=d₁·d₂/2 (chia 2, vì mỗi đường chéo chia đôi hình thoi thành 2 tam giác).","FALSE — S=d₁·d₂/2 (divide by 2).")},
    {s:t("Chu vi đường tròn C=2πR.","Circle circumference C=2πR."),a:true,ex:t("ĐÚNG — C=2πR=πd (d=đường kính).","TRUE — C=2πR=πd.")},
    {s:t("Hình bình hành và hình chữ nhật có cùng công thức diện tích.","Parallelogram and rectangle have the same area formula."),a:true,ex:t("ĐÚNG — cả hai đều S=đáy×chiều cao. Hình chữ nhật là trường hợp đặc biệt của hình bình hành.","TRUE — both S=base×height. Rectangle is a special case.")},
    {s:t("Diện tích hình thang = (tổng hai đáy) × chiều cao.","Trapezoid area = (sum of bases) × height."),a:false,ex:t("SAI — S=(a+b)/2×h (cần chia 2).","FALSE — S=(a+b)·h/2 (must divide by 2).")},
  ];
  const fillQuestions = [
    {id:"f1",tp:t("Diện tích hình tròn bán kính R: S = ___ · R²","Circle area: S = ___ · R²"),ans:"π",alt:["pi","π","3.14"],h:""},
    {id:"f2",tp:t("Diện tích hình thoi d₁=6, d₂=8: S = ___","Rhombus d₁=6, d₂=8: S = ___"),ans:"24",alt:["24"],h:"S=6×8/2"},
    {id:"f3",tp:t("Diện tích hình thang đáy 5 và 9, cao 4: S = ___","Trapezoid bases 5,9 height 4: S = ___"),ans:"28",alt:["28"],h:"S=(5+9)×4/2"},
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    const shapes = [
      {name:t("Tam giác","Triangle"),icon:"△",area:t("S = ½ · đáy · cao\nS = ½ · a · b · sinC\nS = √(s(s−a)(s−b)(s−c))","S=½·base·height\nS=½·a·b·sinC\nHeron formula"),perimeter:t("P = a + b + c","P=a+b+c"),c:"#38bdf8",bg:"rgba(14, 165, 233, 0.15)"},
      {name:t("Hình vuông","Square"),icon:"□",area:t("S = a²","S=a²"),perimeter:t("P = 4a","P=4a"),c:"#4ade80",bg:"rgba(16, 185, 129, 0.15)"},
      {name:t("Hình chữ nhật","Rectangle"),icon:"▭",area:t("S = a · b","S=a·b"),perimeter:t("P = 2(a+b)","P=2(a+b)"),c:"#c084fc",bg:"rgba(168, 85, 247, 0.15)"},
      {name:t("Hình bình hành","Parallelogram"),icon:"▱",area:t("S = đáy · chiều cao","S=base·height"),perimeter:t("P = 2(a+b)","P=2(a+b)"),c:"#fbbf24",bg:"rgba(245, 158, 11, 0.15)"},
      {name:t("Hình thoi","Rhombus"),icon:"◇",area:t("S = d₁ · d₂ / 2","S=d₁·d₂/2"),perimeter:t("P = 4a","P=4a"),c:"#f87171",bg:"rgba(239, 68, 68, 0.15)"},
      {name:t("Hình thang","Trapezoid"),icon:"⌓",area:t("S = (a + b) · h / 2","S=(a+b)·h/2"),perimeter:t("P = a+b+c+d","P=a+b+c+d"),c:"#22d3ee",bg:"rgba(20, 184, 166, 0.15)"},
    ];
    return (
      <>
        
      

      

      

      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize:16,lineHeight:1.8,marginBottom:16 }}>{t("Một người cần lát gạch sàn nhà. Phòng hình chữ nhật 5m×4m, có một bàn hình tròn bán kính 0.8m đặt ở giữa (không cần lát dưới bàn). Tính diện tích cần lát gạch — đây là bài toán kết hợp diện tích hình phẳng rất thực tế!","Someone needs to tile a floor. Room is 5m×4m rectangle, with a circular table radius 0.8m in the middle (no tile needed under table). Find the area to tile — this is a very practical combined-area problem!")}</div>
          <div style={{ fontSize:16 }}>❓ <em>{t("S = 5×4 − π×0.8² ≈ 20 − 2.01 ≈ 17.99 m². Đây là cách kết hợp diện tích.","S = 5×4 − π×0.8² ≈ 17.99 m². This is how to combine areas.")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="LoaBd-sPzkU"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (YouTube)", "Video by Khan Academy (YouTube)")}
          />
        </div>
      </section>

      {/* 1. DIỆN TÍCH ĐA GIÁC */}
      <section id="k1" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("1. Diện Tích và Chu Vi Đa Giác","1. Polygon Area & Perimeter")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:18,transition:"all 0.3s" }}>
          {shapes.map((s,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                <span style={{ fontSize:22,color:s.c }}>{s.icon}</span>
                <span style={{ fontSize:15,fontWeight:700,color:s.c }}>{s.name}</span>
              </div>
              <div style={{ background:s.bg,borderRadius:8,padding:"8px 12px",marginBottom:8 }}>
                <div style={{ fontSize:12,color:s.c,fontWeight:700,marginBottom:4 }}>DIỆN TÍCH / AREA</div>
                <div style={{ fontFamily:"monospace",fontSize:13,color:s.c,whiteSpace:"pre-wrap",lineHeight:1.7 }}>{s.area}</div>
              </div>
              <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:8,padding:"6px 12px",border:`1px solid ${s.bg}` }}>
                <div style={{ fontSize:12,color: "rgba(255, 255, 255, 0.5)",fontWeight:700,marginBottom:2 }}>CHU VI / PERIMETER</div>
                <div style={{ fontFamily:"monospace",fontSize:13,color: "rgba(255, 255, 255, 0.9)" }}>{s.perimeter}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. HÌNH TRÒN */}
      <section id="k2" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("2. Hình Tròn, Cung Tròn và Hình Quạt","2. Circles, Arcs and Sectors")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:20,transition:"all 0.3s" }}>
          {[{icon:"⭕",name:t("Hình tròn bán kính R","Circle radius R"),formulas:["S = πR²","C = 2πR","d = 2R (đường kính)"],c:"#38bdf8",bg:"rgba(14, 165, 233, 0.15)"},
            {icon:"🌙",name:t("Cung tròn góc α (radian)","Arc, central angle α (radians)"),formulas:["ℓ = R·α (độ dài cung)","ℓ = 2πR·α/360° (độ)","Vd: α=60°, ℓ=πR/3"],c:"#4ade80",bg:"rgba(16, 185, 129, 0.15)"},
            {icon:"🍕",name:t("Hình quạt tròn góc α","Sector, angle α"),formulas:["S = R²·α/2 (radian)","S = πR²·α/360° (độ)","Vd: α=90°, S=πR²/4"],c:"#f87171",bg:"rgba(239, 68, 68, 0.15)"},
            {icon:"🔵",name:t("Hình vành khăn (R và r)","Annulus (R and r)"),formulas:["S = π(R²−r²)","S = π(R+r)(R−r)","Vd: R=5, r=3: S=16π"],c:"#c084fc",bg:"rgba(168, 85, 247, 0.15)"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:24,marginBottom:6 }}>{card.icon}</div>
              <div style={{ fontSize:14,fontWeight:700,color:card.c,marginBottom:8 }}>{card.name}</div>
              <div style={{ background:card.bg,borderRadius:8,padding:"8px 12px" }}>
                {card.formulas.map((f,j)=><div key={j} style={{ fontFamily:"monospace",fontSize:13,color:card.c,lineHeight:1.8 }}>{f}</div>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. ĐA GIÁC ĐỀU */}
      <section id="k3" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("3. Đa Giác Đều n Cạnh","3. Regular n-gon")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color: "#22d3ee",marginBottom:12 }}>{t("Đa giác đều n cạnh, mỗi cạnh a:","Regular n-gon, each side a:")}</div>
          <div style={{ background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:14,lineHeight:2.2 }}>
            Chu vi: P = n·a<br/>
            Góc trung tâm: α = 360°/n<br/>
            Bán kính ngoại tiếp: R = a/(2sin(180°/n))<br/>
            Bán kính nội tiếp: r = a/(2tan(180°/n))<br/>
            Diện tích: S = (n·a·r)/2 = (n·a²)/(4tan(180°/n))
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,transition:"all 0.3s" }}>
          {[{n:3,name:t("Tam giác đều","Equilateral △"),S:"S = a²√3/4"},
            {n:4,name:t("Hình vuông","Square □"),S:"S = a²"},
            {n:5,name:t("Ngũ giác đều","Regular ⬠"),S:"S ≈ 1.72a²"},
            {n:6,name:t("Lục giác đều","Regular ⬡"),S:"S = 3a²√3/2"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:16,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center" }}>
              <div style={{ fontSize:28,fontWeight:700,color: "#22d3ee",marginBottom:4 }}>{card.n}</div>
              <div style={{ fontSize:13,color: "rgba(255, 255, 255, 0.5)",marginBottom:6 }}>{card.name}</div>
              <div style={{ fontFamily:"monospace",fontSize:12,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",padding:"4px 8px",borderRadius:6,color: "#22d3ee" }}>{card.S}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. ỨNG DỤNG */}
      <section id="k4" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("4. Mẹo Tính Diện Tích Hình Phức Tạp","4. Tips for Complex Shapes")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{icon:"➕",title:t("Cộng diện tích","Add areas"),desc:t("Chia hình phức tạp thành các hình đơn giản, tính từng phần rồi cộng lại.","Split complex shape into simples, compute each part and add."),ex:"S = S₁ + S₂ + S₃"},
            {icon:"➖",title:t("Trừ diện tích","Subtract areas"),desc:t("Tính diện tích hình lớn, trừ đi các phần bị khoét.","Compute large shape, subtract holes or cut-outs."),ex:"S = S_lớn − S_lỗ"},
            {icon:"📐",title:t("Dùng tọa độ","Use coordinates"),desc:t("Công thức Shoelace: S=½|Σ(xᵢyᵢ₊₁−xᵢ₊₁yᵢ)| cho đa giác bất kỳ.","Shoelace formula: S=½|Σ(xᵢyᵢ₊₁−xᵢ₊₁yᵢ)| for any polygon."),ex:"Shoelace / Gauss"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:28,marginBottom:8 }}>{card.icon}</div>
              <div style={{ fontSize:15,fontWeight:700,color: "#22d3ee",marginBottom:6 }}>{card.title}</div>
              <div style={{ fontSize:13,color: "rgba(255, 255, 255, 0.5)",lineHeight:1.6,marginBottom:8 }}>{card.desc}</div>
              <div style={{ fontFamily:"monospace",fontSize:13,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",padding:"6px 10px",borderRadius:6,color: "#22d3ee",fontWeight:600 }}>{card.ex}</div>
            </article>
          ))}
        </div>
      </section>

      {/* THỰC HÀNH */}
      <section id="th" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s" }}>
          {[
            {id:"e1",q:t("Tính diện tích hình thang ABCD có đáy lớn AB=12cm, đáy nhỏ CD=8cm, chiều cao h=5cm.","Trapezoid ABCD: base AB=12, top CD=8, height 5. Find area."),
             a:[t("S=(AB+CD)·h/2=(12+8)·5/2=20·5/2=50 cm²","S=(12+8)·5/2=50 cm²")]},
            {id:"e2",q:t("Hình vành khăn (annulus) bán kính ngoài R=10, bán kính trong r=6.\n(a) Diện tích\n(b) Chu vi ngoài + chu vi trong","Annulus: outer R=10, inner r=6.\n(a) Area\n(b) Outer + inner circumference"),
             a:[t("(a) S=π(R²−r²)=π(100−36)=64π≈201.06 cm²","S=64π≈201.06"),t("(b) C_ngoài=2π·10=20π≈62.83","C_outer=20π"),t("C_trong=2π·6=12π≈37.70","C_inner=12π"),t("Tổng chu vi=20π+12π=32π≈100.53 cm","Total=32π")]},
            {id:"e3",q:t("Lục giác đều cạnh a=4cm. Tính diện tích S.","Regular hexagon, side 4cm. Find area."),
             a:[t("S=3a²√3/2=3·16·√3/2=24√3≈41.57 cm²","S=3×16×√3/2=24√3≈41.57"),t("(Lục giác đều = 6 tam giác đều cạnh a)","(Regular hexagon = 6 equilateral triangles)")]},
          ].map(({id,q,a})=>(
            <article key={id}>
              <div style={{ padding:"16px 20px",borderRadius:"10px 10px 0 0",background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize:18,fontWeight:600,marginBottom:4 }}>📝 {t("Bài tập","Exercise")}</div>
                <div style={{ fontSize:15,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{q}</div>
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
      videoId="LoaBd-sPzkU"
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
