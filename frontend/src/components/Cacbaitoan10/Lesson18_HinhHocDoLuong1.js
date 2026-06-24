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

export default function Lesson18_HinhHocDoLuong1() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson18_HinhHocDoLuong1";
  const chapterTitle = { vi: "Chương VI · Hình Học Đo Lường", en: "Chapter VI · Geometry & Measurement" };
  const lessonTitle = { vi: "Bài 18: Hình Học Phẳng – Hệ Thức Lượng", en: "Lesson 18: Plane Geometry – Metric Relations" };
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
        "text": "geometric measurement",
        "vi": "hình học đo lường",
        "detail": "<b>geometric measurement</b>: hình học đo lường.",
        "detailTitle": "geometric measurement (hình học đo lường)"
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
        "text": "length",
        "vi": "độ dài",
        "detail": "<b>length</b>: độ dài.",
        "detailTitle": "length (độ dài)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "angle",
        "vi": "góc",
        "detail": "<b>angle</b>: góc.",
        "detailTitle": "angle (góc)"
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
        "text": "shape property",
        "vi": "tính chất hình học",
        "detail": "<b>shape property</b>: tính chất hình học.",
        "detailTitle": "shape property (tính chất hình học)"
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
        "text": "length",
        "vi": "độ dài",
        "detail": "<b>length</b>: độ dài.",
        "detailTitle": "length (độ dài)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "angle",
        "vi": "góc",
        "detail": "<b>angle</b>: góc.",
        "detailTitle": "angle (góc)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "shape property",
        "vi": "tính chất hình học",
        "detail": "<b>shape property</b>: tính chất hình học.",
        "detailTitle": "shape property (tính chất hình học)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    {q:t("Bán kính đường tròn ngoại tiếp tam giác R liên hệ với Định lí Sin như thế nào?","How does circumradius R relate to the Law of Sines?"),o:["R = a·sinA","R = a/(2sinA)","R = 2a·sinA","R = sinA/a"],a:1,ex:t("Từ Định lí Sin: a/sinA=2R → R=a/(2sinA).","From Law of Sines: a/sinA=2R → R=a/(2sinA).")},
    {q:t("Đường trung tuyến ma của tam giác ABC tính theo công thức?","The median ma of triangle ABC is given by?"),o:["ma²=b²+c²−a²/2","ma²=(2b²+2c²−a²)/4","ma=√(b²+c²)/2","ma=(b+c)/2"],a:1,ex:t("Công thức đường trung tuyến: ma²=(2b²+2c²−a²)/4.","Median formula: ma²=(2b²+2c²−a²)/4.")},
    {q:t("Tam giác đều cạnh a. Bán kính nội tiếp r = ?","Equilateral triangle side a. Inradius r = ?"),o:["a√3/6","a√3/3","a/2","a√3/2"],a:0,ex:t("r=a√3/6 (= R/2 với R=a√3/3 là ngoại tiếp).","r=a√3/6 (= R/2 where R=a√3/3 is circumradius).")},
    {q:t("Công thức liên hệ bán kính nội tiếp r, diện tích S và nửa chu vi p là?","The formula relating inradius r, area S and semi-perimeter p is?"),o:["S=r·p","S=r/p","r=S·p","p=r·S"],a:0,ex:t("S=r·p, trong đó p=(a+b+c)/2 là nửa chu vi.","S=r·p, where p=(a+b+c)/2 is the semi-perimeter.")},
    {q:t("Trong tam giác ABC vuông tại C, bán kính ngoại tiếp R = ?","Right triangle with right angle at C. Circumradius R = ?"),o:["a/2","b/2","c/2","(a+b)/2"],a:2,ex:t("Trong tam giác vuông, cạnh huyền c là đường kính → R=c/2.","In a right triangle, hypotenuse c is diameter → R=c/2.")},
  ];
  const tfCards = [
    {s:t("Đường tròn ngoại tiếp tam giác đi qua cả 3 đỉnh.","The circumscribed circle passes through all 3 vertices."),a:true,ex:t("ĐÚNG — định nghĩa đường tròn ngoại tiếp.","TRUE — definition of circumscribed circle.")},
    {s:t("Bán kính nội tiếp r = S/p với S là diện tích và p là nửa chu vi.","Inradius r = S/p where S = area and p = semi-perimeter."),a:true,ex:t("ĐÚNG — từ S=r·p → r=S/p.","TRUE — from S=r·p → r=S/p.")},
    {s:t("Tam giác đều luôn có R = 2r.","An equilateral triangle always has R = 2r."),a:true,ex:t("ĐÚNG — đều: R=a√3/3, r=a√3/6 → R=2r.","TRUE — equilateral: R=a√3/3, r=a√3/6 → R=2r.")},
    {s:t("Công thức đường trung tuyến: ma²=b²+c²−a²/2.","Median formula: ma²=b²+c²−a²/2."),a:false,ex:t("SAI — đúng là ma²=(2b²+2c²−a²)/4.","FALSE — correct is ma²=(2b²+2c²−a²)/4.")},
    {s:t("Trong tam giác vuông tại C, đường trung tuyến mc=c/2.","Right triangle at C: median mc=c/2."),a:true,ex:t("ĐÚNG — trong tam giác vuông, trung tuyến tới cạnh huyền = nửa cạnh huyền.","TRUE — in a right triangle, median to hypotenuse = half hypotenuse.")},
  ];
  const fillQuestions = [
    {id:"f1",tp:t("Bán kính ngoại tiếp: R = a / (2 · ___)","Circumradius: R = a / (2 · ___)"),ans:"sinA",alt:["sina","sin A","sinA","sin(A)"],h:""},
    {id:"f2",tp:t("Diện tích tam giác: S = r · ___ (r = bán kính nội tiếp)","Area: S = r · ___ (r = inradius)"),ans:"p",alt:["p"],h:t("p = nửa chu vi","p = semi-perimeter")},
    {id:"f3",tp:t("Tam giác đều cạnh a: đường trung tuyến m = (a___ )/2","Equilateral side a: median m = (a___ )/2"),ans:"√3",alt:["√3","sqrt(3)","căn 3","can 3"],h:t("Trung tuyến = chiều cao trong tam giác đều","Median = altitude in equilateral triangle")},
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
      

      

      

      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize:16,lineHeight:1.8,marginBottom:16 }}>{t("Các nhà thiết kế mạch điện, kiến trúc sư xây vòm, và kỹ sư cơ khí thường xuyên cần tính đường tròn bao quanh hoặc nằm trong một hình tam giác. Những công thức hệ thức lượng trong tam giác giúp giải quyết chính xác các bài toán đó.","Circuit designers, arch architects, and mechanical engineers regularly need circles surrounding or inscribed in triangles. The metric relations of triangles solve these problems precisely.")}</div>
          <div style={{ fontSize:16 }}>❓ <em>{t("Nếu đường tròn ngoại tiếp tam giác có bán kính R, thì R liên hệ gì với cạnh và góc của tam giác?","If the circumscribed circle has radius R, how does R relate to the triangle's sides and angles?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="5UfCOfG9I1k"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
          />
        </div>
      </section>

      {/* 1. ĐƯỜNG TRÒN NGOẠI TIẾP & NỘI TIẾP */}
      <section id="k1" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("1. Đường Tròn Ngoại Tiếp và Nội Tiếp","1. Circumscribed and Inscribed Circles")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24,transition:"all 0.3s" }}>
          {[{
            icon:"⭕",title:t("Đường tròn NGOẠI TIẾP","Circumscribed Circle"),
            items:[t("Bán kính R: đi qua 3 đỉnh","Radius R: passes through 3 vertices"),t("R = a/(2sinA) = b/(2sinB) = c/(2sinC)","R = a/(2sinA)"),t("Tam giác vuông tại C: R = c/2","Right at C: R = c/2"),t("Tam giác đều cạnh a: R = a√3/3","Equilateral: R = a√3/3")],
            bg:"#eaf4fb",c:"#1a5276"
          },{
            icon:"🔵",title:t("Đường tròn NỘI TIẾP","Inscribed Circle"),
            items:[t("Bán kính r: tiếp xúc 3 cạnh","Radius r: tangent to 3 sides"),t("r = S/p (S=diện tích, p=nửa chu vi)","r = S/p (S=area, p=semi-perimeter)"),t("Tam giác vuông: r = (a+b−c)/2","Right triangle: r = (a+b−c)/2"),t("Tam giác đều cạnh a: r = a√3/6","Equilateral: r = a√3/6")],
            bg:"#eafaf1",c:"#1e8449"
          },{
            icon:"📐",title:t("Quan hệ R và r","Relationship R and r"),
            items:[t("Euler: OI² = R²−2Rr (O=tâm ngoại, I=tâm nội)","Euler: OI²=R²−2Rr"),t("R ≥ 2r (dấu = khi tam giác đều)","R ≥ 2r (equality for equilateral)"),t("Tam giác đều: R = 2r","Equilateral: R = 2r")],
            bg:"#f5eef8",c:"#6c3483"
          }].map((card,i)=>(
            <article key={i} style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:24,marginBottom:8 }}>{card.icon}</div>
              <div style={{ fontSize:16,fontWeight:700,color:card.c,marginBottom:12 }}>{card.title}</div>
              {card.items.map((item,j)=>(
                <div key={j} style={{ fontSize:13,color:"#555",marginBottom:8,display:"flex",gap:8 }}>
                  <span style={{ color:card.c,fontWeight:700,flexShrink:0 }}>•</span>
                  <span style={{ fontFamily:"monospace" }}>{item}</span>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>

      {/* 2. ĐƯỜNG TRUNG TUYẾN */}
      <section id="k2" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("2. Đường Trung Tuyến","2. Medians")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>{t("Công thức đường trung tuyến:","Median formulas:")}</div>
          <div style={{ background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:15,lineHeight:2.4,textAlign:"center" }}>
            ma² = (2b² + 2c² − a²) / 4<br/>
            mb² = (2a² + 2c² − b²) / 4<br/>
            mc² = (2a² + 2b² − c²) / 4
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{title:t("Tính chất trọng tâm G","Centroid G"),note:t("G chia mỗi đường trung tuyến theo tỉ lệ 2:1 kể từ đỉnh.","G divides each median 2:1 from vertex."),formula:"AG = (2/3)ma"},
            {title:t("Tam giác đều cạnh a","Equilateral, side a"),note:t("3 đường trung tuyến bằng nhau.","All 3 medians are equal."),formula:"m = a√3/2"},
            {title:t("Tam giác vuông tại C","Right triangle at C"),note:t("Trung tuyến tới cạnh huyền = R.","Median to hypotenuse = R."),formula:"mc = c/2 = R"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:6 }}>{card.title}</div>
              <div style={{ fontSize:13,color:"#777",marginBottom:8,lineHeight:1.6 }}>{card.note}</div>
              <div style={{ fontFamily:"monospace",fontSize:14,fontWeight:600,color:"#0B4F5C",background:"white",padding:"6px 12px",borderRadius:6 }}>{card.formula}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. ĐƯỜNG CAO */}
      <section id="k3" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("3. Đường Cao","3. Altitudes")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>{t("Công thức đường cao:","Altitude formulas:")}</div>
          <div style={{ background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:15,lineHeight:2.4,textAlign:"center" }}>
            ha = 2S / a &nbsp;&nbsp;&nbsp; hb = 2S / b &nbsp;&nbsp;&nbsp; hc = 2S / c
          </div>
          <div style={{ marginTop:12,padding:"10px 14px",background:"#fff3cd",borderRadius:8,fontSize:14 }}>
            💡 {t("Cũng có thể dùng: ha = b·sinC = c·sinB","Also: ha = b·sinC = c·sinB")}
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{shape:t("Tam giác đều cạnh a","Equilateral, side a"),formula:"h = a√3/2 (= đường trung tuyến)"},
            {shape:t("Tam giác vuông tại C (cạnh góc vuông a, b)","Right triangle, legs a, b"),formula:"hc = ab/c (đường cao tới cạnh huyền)"},
            {shape:t("Hệ thức trong tam giác vuông","Right triangle relations"),formula:"hc² = ha'·hb'\n(tích các hình chiếu trên huyền)"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:14,color:"#777",marginBottom:6 }}>{card.shape}</div>
              <div style={{ fontFamily:"monospace",fontSize:14,fontWeight:600,color:"#0B4F5C",whiteSpace:"pre-wrap",lineHeight:1.8 }}>{card.formula}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. HỆ THỨC ĐẶC BIỆT */}
      <section id="k4" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("4. Hệ Thức Trong Tam Giác Vuông","4. Right Triangle Relations")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>{t("Tam giác vuông tại C, đường cao CH = h, hình chiếu A&apos; và B&apos;:","Right triangle at C, altitude CH=h, projections A&apos; and B&apos;:")}</div>
          <div style={{ background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:14,lineHeight:2.2 }}>
            c² = a² + b² (Pythagore)<br/>
            h = ab/c<br/>
            a² = c·CA&apos;  &nbsp;&nbsp;  b² = c·CB&apos;<br/>
            h² = CA&apos;·CB&apos;<br/>
            1/h² = 1/a² + 1/b²
          </div>
        </div>
        <div className="reveal" data-reveal style={{ padding:14,borderRadius:10,background:"#fff3cd",border:"1px solid #ffc107",fontSize:15 }}>
          ⭐ {t("Các hệ thức này rất quan trọng trong thi cử và ứng dụng thực tế (tính độ dốc, chiều cao tòa nhà, v.v.).","These relations are crucial in exams and applications (slope, building height, etc.).")}
        </div>
      </section>

      {/* THỰC HÀNH */}
      <section id="th" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s" }}>
          {[
            {id:"e1",q:t("Tam giác ABC: a=5, b=7, c=8. Tính:\n(a) Bán kính ngoại tiếp R\n(b) Bán kính nội tiếp r","Triangle: a=5, b=7, c=8.\n(a) Circumradius R\n(b) Inradius r"),
             a:[t("Diện tích: s=(5+7+8)/2=10, S=√(10·5·3·2)=√300=10√3","Area: s=10, S=10√3"),t("(a) R=a/(2sinA). Trước: cosA=(b²+c²−a²)/(2bc)=(49+64−25)/112=88/112=11/14","cosA=11/14, sinA=√(1−121/196)=√(75/196)=5√3/14"),t("R=5/(2·5√3/14)=5·14/(10√3)=7/√3=7√3/3≈4.04","R=7√3/3≈4.04"),t("(b) r=S/p=10√3/10=√3≈1.73","r=√3≈1.73")]},
            {id:"e2",q:t("Tam giác ABC: a=6, b=8, c=10. Tính đường cao ha và đường trung tuyến ma.","Triangle: a=6, b=8, c=10.\nFind altitude ha and median ma."),
             a:[t("Kiểm tra: 6²+8²=36+64=100=10² → tam giác VUÔNG tại C (c=10)","6²+8²=100=10² → RIGHT at C"),t("S=(1/2)·6·8=24","S=24"),t("ha=2S/a=48/6=8","ha=8"),t("ma²=(2·64+2·100−36)/4=(128+200−36)/4=292/4=73 → ma=√73≈8.54","ma=√73≈8.54")]},
            {id:"e3",q:t("Tam giác đều cạnh a=6. Tính R, r, và đường cao h.","Equilateral, side 6. Find R, r, and altitude h."),
             a:[t("h = 6√3/2 = 3√3≈5.20","h=3√3"),t("R = a√3/3 = 6√3/3 = 2√3≈3.46","R=2√3"),t("r = a√3/6 = 6√3/6 = √3≈1.73","r=√3"),t("Kiểm tra: R = 2r = 2√3 ✓","R=2r ✓")]},
          ].map(({id,q,a})=>(
            <article key={id}>
              <div style={{ padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize:18,fontWeight:600,marginBottom:4 }}>📝 {t("Bài tập","Exercise")}</div>
                <div style={{ fontSize:15,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{q}</div>
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
      videoId="5UfCOfG9I1k"
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
