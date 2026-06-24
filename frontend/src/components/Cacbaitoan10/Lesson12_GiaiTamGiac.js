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

export default function Lesson12_GiaiTamGiac() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson12_GiaiTamGiac";
  const chapterTitle = { vi: "Chương IV · Hệ Thức Lượng Trong Tam Giác", en: "Chapter IV · Triangle Trigonometry" };
  const lessonTitle = { vi: "Bài 12: Giải Tam Giác và Ứng Dụng", en: "Lesson 12: Solving Triangles & Applications" };
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
        "text": "solving triangles",
        "vi": "giải tam giác",
        "detail": "<b>solving triangles</b>: giải tam giác.",
        "detailTitle": "solving triangles (giải tam giác)"
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
        "text": "triangle data",
        "vi": "dữ kiện tam giác",
        "detail": "<b>triangle data</b>: dữ kiện tam giác.",
        "detailTitle": "triangle data (dữ kiện tam giác)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "trigonometry",
        "vi": "lượng giác",
        "detail": "<b>trigonometry</b>: lượng giác.",
        "detailTitle": "trigonometry (lượng giác)"
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
        "text": "application",
        "vi": "ứng dụng",
        "detail": "<b>application</b>: ứng dụng.",
        "detailTitle": "application (ứng dụng)"
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
        "text": "triangle data",
        "vi": "dữ kiện tam giác",
        "detail": "<b>triangle data</b>: dữ kiện tam giác.",
        "detailTitle": "triangle data (dữ kiện tam giác)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "trigonometry",
        "vi": "lượng giác",
        "detail": "<b>trigonometry</b>: lượng giác.",
        "detailTitle": "trigonometry (lượng giác)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "application",
        "vi": "ứng dụng",
        "detail": "<b>application</b>: ứng dụng.",
        "detailTitle": "application (ứng dụng)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [
    {q:t("'Giải tam giác' nghĩa là gì?","What does 'solving a triangle' mean?"),o:[t("Tính diện tích","Find the area"),t("Tìm tất cả cạnh và góc chưa biết","Find all unknown sides and angles"),t("Tính chu vi","Find the perimeter"),t("Chứng minh tam giác đồng dạng","Prove similarity")],a:1,ex:t("Giải tam giác = tìm tất cả 3 góc và 3 cạnh từ dữ kiện đã cho.","Solving = finding all 3 angles and 3 sides from the given data.")},
    {q:t("Công thức diện tích tam giác theo 2 cạnh và góc xen giữa là?","Area of triangle from 2 sides and included angle?"),o:["S = a·b","S = (1/2)·a·b·sinC","S = (1/2)·base·height","S = a²·sinC"],a:1,ex:t("S=(1/2)·a·b·sinC — diện tích qua 2 cạnh a, b và góc C xen giữa.","S=(1/2)·a·b·sinC using sides a, b and included angle C.")},
    {q:t("Biết 3 cạnh a=3, b=4, c=5. Diện tích tam giác là?","Sides 3,4,5. Area of triangle?"),o:["6","7","8","12"],a:0,ex:t("Tam giác vuông (3-4-5). S=(1/2)·3·4=6.","Right triangle (3-4-5). S=(1/2)·3·4=6.")},
    {q:t("Tam giác ABC: A=30°, b=6, c=4. Diện tích S = ?","Triangle: A=30°, b=6, c=4. Find area S."),o:["6","12","3","24"],a:0,ex:t("S=(1/2)·b·c·sinA=(1/2)·6·4·sin30°=12·(1/2)=6.","S=(1/2)·6·4·sin30°=12·0.5=6.")},
    {q:t("Muốn tính chiều cao ngọn núi từ xa, người ta dùng?","To find a mountain's height from a distance, you use?"),o:[t("Chỉ thước đo","Only a ruler"),t("Chỉ Định lí Pythagore","Only Pythagoras"),t("Định lí Sin hoặc Côsin + đo góc","Law of Sines or Cosines + angle measurement"),t("Không thể tính được","Cannot be calculated")],a:2,ex:t("Đo các góc từ hai điểm đã biết khoảng cách → dùng định lí Sin/Côsin → tính chiều cao.","Measure angles from 2 known points → use Sin/Cosine law → find height.")},
  ];
  const tfCards = [
    {s:t("S=(1/2)·a·b·sinC là công thức diện tích tam giác qua 2 cạnh và góc xen giữa.","S=(1/2)·a·b·sinC is the triangle area formula using 2 sides and the included angle."),a:true,ex:t("ĐÚNG — đây là công thức chuẩn.","TRUE — this is the standard formula.")},
    {s:t("Tam giác vuông a=3, b=4, c=5 có diện tích S=10.","Right triangle 3-4-5 has area S=10."),a:false,ex:t("SAI — S=(1/2)·3·4=6, không phải 10.","FALSE — S=(1/2)·3·4=6, not 10.")},
    {s:t("Để giải tam giác cần ít nhất 3 dữ kiện độc lập (trong đó có ít nhất 1 cạnh).","To solve a triangle you need at least 3 independent pieces of data (including at least 1 side)."),a:true,ex:t("ĐÚNG — 3 góc thôi thì chưa đủ (không xác định kích thước). Cần ít nhất 1 cạnh.","TRUE — 3 angles alone don't determine size. Need at least 1 side.")},
    {s:t("Hai tam giác đồng dạng có thể giải được bằng cùng một bộ số góc và cạnh.","Two similar triangles can be solved with the same set of angles and sides."),a:false,ex:t("SAI — đồng dạng có cùng góc nhưng cạnh khác nhau (tỉ lệ).","FALSE — similar triangles share angles but have proportionally different sides.")},
    {s:t("Công thức S=(1/2)·a·b·sinC đúng với mọi góc C từ 0° đến 180°.","S=(1/2)·a·b·sinC holds for any angle C from 0° to 180°."),a:true,ex:t("ĐÚNG — sinC≥0 với 0°≤C≤180°, nên S≥0 và công thức luôn đúng.","TRUE — sinC≥0 for 0°≤C≤180°, so S≥0 and the formula always holds.")},
  ];
  const fillQuestions = [
    {id:"f1",tp:t("Công thức diện tích qua 2 cạnh a, b và góc C xen giữa: S = (1/2) · a · b · ___","Area via 2 sides a,b and included angle C: S = (1/2) · a · b · ___"),ans:"sinC",alt:["sinc","sin C","sin(C)","sinC"],h:""},
    {id:"f2",tp:t("Tam giác vuông (C=90°): S = (1/2) · a · b · sin90° = (1/2) · a · ___","Right triangle (C=90°): S=(1/2)·a·b·sin90°=(1/2)·a·___"),ans:"b",alt:["b"],h:"sin90°=1"},
    {id:"f3",tp:t("Để giải hoàn toàn một tam giác cần biết ít nhất ___ dữ kiện (có ít nhất 1 cạnh).","To fully solve a triangle you need at least ___ pieces of data (at least 1 side)."),ans:"3",alt:["3","ba","three"],h:""},
  ];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        

      

      

      

      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize:16,lineHeight:1.8,marginBottom:16 }}>{t("Các nhà khảo sát địa hình, kiến trúc sư và hoa tiêu tàu biển đều cần giải tam giác mỗi ngày. Biết góc và khoảng cách từ các điểm quan sát, họ tính ra chiều cao núi, chiều dài cầu hay vị trí tàu. Tất cả đều quy về bài toán giải tam giác.","Surveyors, architects, and navigators solve triangles daily. From observed angles and known distances, they compute mountain heights, bridge lengths, or ship positions. All reduce to solving triangles.")}</div>
          <div style={{ fontSize:16 }}>❓ <em>{t("Cần tối thiểu bao nhiêu dữ kiện (bao gồm ít nhất 1 cạnh) để xác định duy nhất một tam giác?","What is the minimum number of pieces of data (including at least 1 side) to uniquely determine a triangle?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="tIen_7vX-C8"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ The Organic Chemistry Tutor (YouTube)", "Video by The Organic Chemistry Tutor (YouTube)")}
          />
        </div>
      </section>

      {/* 1. KHÁI NIỆM */}
      <section id="k1" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("1. Khái Niệm Giải Tam Giác","1. Solving a Triangle — Concept")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10 }}>📌 {t("Định nghĩa","Definition")}</div>
          <div style={{ fontSize:15,lineHeight:1.8 }}>{t("Giải tam giác ABC là tìm tất cả các cạnh (a, b, c) và các góc (A, B, C) chưa biết, từ một số dữ kiện đã cho.","Solving triangle ABC means finding all unknown sides (a, b, c) and angles (A, B, C) from given data.")}</div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{icon:"📐",title:t("Dữ kiện tối thiểu","Minimum data"),note:t("3 dữ kiện, trong đó ít nhất 1 cạnh (3 góc không đủ)","3 pieces, at least 1 side (3 angles not enough)")},
            {icon:"🔑",title:t("Công cụ chính","Main tools"),note:t("Định lí Sin + Định lí Côsin + A+B+C=180°","Law of Sines + Law of Cosines + A+B+C=180°")},
            {icon:"✅",title:t("Nghiệm hợp lệ","Valid solution"),note:t("Các góc dương, tổng 3 góc=180°, cạnh dương","Positive angles, sum=180°, positive sides")},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center" }}>
              <div style={{ fontSize:28,marginBottom:8 }}>{card.icon}</div>
              <div style={{ fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:6 }}>{card.title}</div>
              <div style={{ fontSize:13,color:"#777",lineHeight:1.6 }}>{card.note}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. DIỆN TÍCH */}
      <section id="k2" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("2. Công Thức Diện Tích","2. Area Formula")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>{t("Diện tích tam giác qua 2 cạnh và góc xen giữa:","Area via 2 sides and included angle:")}</div>
          <div style={{ background:"white",borderRadius:10,padding:"16px 20px",textAlign:"center",fontFamily:"monospace",fontSize:20,color:"#0B4F5C",fontWeight:700,lineHeight:2.4 }}>
            S = (1/2) · a · b · sinC<br/>
            S = (1/2) · b · c · sinA<br/>
            S = (1/2) · a · c · sinB
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{shape:t("Tam giác vuông (C=90°)","Right triangle (C=90°)"),formula:"S = (1/2)·a·b",note:t("sin90°=1","sin90°=1"),bg:"#eafaf1",c:"#1e8449"},
            {shape:t("Tam giác đều cạnh a","Equilateral, side a"),formula:"S = (√3/4)·a²",note:t("sinA=sin60°=√3/2","sinA=√3/2"),bg:"#eaf4fb",c:"#1a5276"},
            {shape:t("Công thức Heron (biết 3 cạnh)","Heron's formula (3 sides known)"),formula:"S = √(s(s-a)(s-b)(s-c))",note:t("s=(a+b+c)/2","s=(a+b+c)/2"),bg:"#f5eef8",c:"#6c3483"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:14,color:"#777",marginBottom:6 }}>{card.shape}</div>
              <div style={{ fontFamily:"monospace",fontSize:15,fontWeight:700,color:card.c,marginBottom:4 }}>{card.formula}</div>
              <div style={{ background:card.bg,color:card.c,padding:"4px 10px",borderRadius:6,fontSize:12,display:"inline-block" }}>{card.note}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. CÁC TRƯỜNG HỢP GIẢI */}
      <section id="k3" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("3. Các Trường Hợp Giải Tam Giác","3. Triangle Solving Cases")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{case:"SAS",vi:t("Biết 2 cạnh + góc xen giữa","2 sides + included angle"),step:t("1. Dùng Đ.L.Côsin → cạnh thứ 3\n2. Dùng Đ.L.Sin → góc thứ 2\n3. Tổng 3 góc → góc thứ 3","1. Law of Cosines → 3rd side\n2. Law of Sines → 2nd angle\n3. Sum=180° → 3rd angle"),bg:"#eaf4fb",c:"#1a5276"},
            {case:"SSS",vi:t("Biết 3 cạnh","3 sides known"),step:t("1. Đ.L.Côsin → tính cosA\n2. Đ.L.Côsin → tính cosB\n3. Tổng góc → C=180°−A−B","1. Cosine law → cosA\n2. Cosine law → cosB\n3. C=180°−A−B"),bg:"#eafaf1",c:"#1e8449"},
            {case:"AAS/ASA",vi:t("Biết 2 góc + 1 cạnh","2 angles + 1 side"),step:t("1. Tổng 3 góc → góc thứ 3\n2. Đ.L.Sin → cạnh thứ 2\n3. Đ.L.Sin → cạnh thứ 3","1. Sum=180° → 3rd angle\n2. Law of Sines → 2nd side\n3. Law of Sines → 3rd side"),bg:"#fff3cd",c:"#856404"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                <span style={{ background:card.c,color:"white",fontWeight:700,padding:"3px 12px",borderRadius:20,fontSize:14 }}>{card.case}</span>
                <span style={{ fontSize:14,color:card.c,fontWeight:600 }}>{card.vi}</span>
              </div>
              <div style={{ background:card.bg,color:card.c,padding:"10px 12px",borderRadius:8,fontSize:13,fontFamily:"monospace",whiteSpace:"pre-wrap",lineHeight:1.8 }}>{card.step}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. ỨNG DỤNG */}
      <section id="k4" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("4. Ứng Dụng Thực Tế","4. Real-World Applications")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:20,transition:"all 0.3s" }}>
          {[{icon:"⛰️",title:t("Đo chiều cao núi","Mountain height"),desc:t("Đứng tại 2 điểm A, B cách nhau d đo góc ngẩng α, β → h=d·sinα·sinβ/sin(β−α)","From 2 points A,B distance d apart, measure elevation angles α,β → h=d·sinα·sinβ/sin(β−α)")},
            {icon:"🌊",title:t("Đo chiều rộng sông","River width"),desc:t("Chọn điểm C bên kia sông, đo đường cơ sở AB và góc CAB, CBA → dùng Định lí Sin tính AC hoặc BC","Choose point C across river, measure baseline AB and angles CAB, CBA → use Sines to find AC or BC")},
            {icon:"🛸",title:t("Định vị (GPS/Hàng không)","Navigation (GPS/Aviation)"),desc:t("Từ 3 trạm biết tọa độ, đo góc tới mục tiêu → giải hệ tam giác → xác định vị trí chính xác","From 3 known stations, measure angles to target → solve triangle system → find exact position")},
            {icon:"🏗️",title:t("Xây dựng & Kiến trúc","Construction & Architecture"),desc:t("Tính góc mái nhà, độ dài kèo, chiều cao cột từ các số liệu đo đạc thực địa","Compute roof angles, rafter lengths, column heights from field measurements")},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:28,marginBottom:8 }}>{card.icon}</div>
              <div style={{ fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:6 }}>{card.title}</div>
              <div style={{ fontSize:13,color:"#777",lineHeight:1.6 }}>{card.desc}</div>
            </article>
          ))}
        </div>
      </section>

      {/* THỰC HÀNH */}
      <section id="th" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:40,transition:"all 0.3s" }}>
          {[
            {id:"e1",q:t("Tam giác ABC: A=45°, b=6, c=4. Tính diện tích S và cạnh a.","Triangle ABC: A=45°, b=6, c=4. Find area S and side a."),
             a:[t("S=(1/2)·b·c·sinA=(1/2)·6·4·sin45°=12·(√2/2)=6√2≈8.49","S=6√2≈8.49"),t("a²=b²+c²−2bc·cosA=36+16−48·(√2/2)=52−24√2≈52−33.9≈18.1","a²≈18.1 → a≈4.25")]},
            {id:"e2",q:t("Từ điểm A trên bờ sông, nhìn điểm C bên kia sông theo góc 60° so với bờ. Từ điểm B cách A 100m cùng phía, góc nhìn C là 45°. Tính BC.","From point A on a riverbank, point C across is seen at 60° from the bank. From B, 100m from A, the angle to C is 45°. Find BC."),
             a:[t("Góc ACB=180°−60°−45°=75°","Angle ACB=75°"),t("BC/sinA = AB/sinACB → BC=100·sin60°/sin75°=100·(√3/2)/sin75°≈89.7m","BC=100·sin60°/sin75°≈89.7m")]},
            {id:"e3",q:t("Tam giác ABC: a=5, b=7, c=8. Tính diện tích S bằng công thức Heron.","Triangle: a=5, b=7, c=8. Find area using Heron's formula."),
             a:["s=(5+7+8)/2=10",t("S=√(10·5·3·2)=√300=10√3≈17.32","S=√300=10√3≈17.32")]},
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
      videoId="tIen_7vX-C8"
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
