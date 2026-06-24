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

export default function Lesson25_QuyTacCongNhan() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const [revealedAnswers, setRevealedAnswers] = useState({});
  const toggleAnswer = (id) => setRevealedAnswers((p) => ({ ...p, [id]: !p[id] }));
  const rev = revealedAnswers;
  const tr = toggleAnswer;

  const lessonSlug = "Lesson25_QuyTacCongNhan";
  const chapterTitle = { vi: "Chương VIII · Tổ Hợp", en: "Chương VIII · Tổ Hợp" };
  const lessonTitle = { vi: "Bài 25: Quy Tắc Cộng và Nhân", en: "Bài 25: Quy Tắc Cộng và Nhân" };
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
        "text": "addition and multiplication principles",
        "vi": "quy tắc cộng và quy tắc nhân",
        "detail": "<b>addition and multiplication principles</b>: quy tắc cộng và quy tắc nhân.",
        "detailTitle": "addition and multiplication principles (quy tắc cộng và quy tắc nhân)"
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
        "text": "case",
        "vi": "trường hợp",
        "detail": "<b>case</b>: trường hợp.",
        "detailTitle": "case (trường hợp)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "outcome",
        "vi": "kết quả",
        "detail": "<b>outcome</b>: kết quả.",
        "detailTitle": "outcome (kết quả)"
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
        "text": "counting principle",
        "vi": "nguyên lý đếm",
        "detail": "<b>counting principle</b>: nguyên lý đếm.",
        "detailTitle": "counting principle (nguyên lý đếm)"
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
        "text": "case",
        "vi": "trường hợp",
        "detail": "<b>case</b>: trường hợp.",
        "detailTitle": "case (trường hợp)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "outcome",
        "vi": "kết quả",
        "detail": "<b>outcome</b>: kết quả.",
        "detailTitle": "outcome (kết quả)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "counting principle",
        "vi": "nguyên lý đếm",
        "detail": "<b>counting principle</b>: nguyên lý đếm.",
        "detailTitle": "counting principle (nguyên lý đếm)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];
  const mcQuestions = [{'q': 'Quy tắc nhân dùng khi?', 'o': ['Các việc xung khắc nhau', 'Các bước diễn ra liên tiếp (và...và...)', 'Chỉ có 2 lựa chọn', 'Tổng số phần tử'], 'a': 1, 'ex': 'Quy tắc nhân: các bước PHẢI xảy ra đồng thời → nhân.'}, {'q': 'Từ A→B có 3 đường, B→C có 4 đường. Số đường A→B→C?', 'o': ['7', '12', '3', '4'], 'a': 1, 'ex': '3×4=12 (quy tắc nhân vì phải đi qua cả hai chặng).'}, {'q': 'Chọn 1 sách trong 4 sách toán hoặc 3 sách lý. Bao nhiêu cách?', 'o': ['12', '7', '1', '24'], 'a': 1, 'ex': '4+3=7 (quy tắc cộng vì chỉ chọn 1 trong các loại).'}, {'q': 'Mật khẩu 3 chữ số (0-9, lặp được). Bao nhiêu mật khẩu?', 'o': ['30', '27', '1000', '300'], 'a': 2, 'ex': '10×10×10=1000.'}, {'q': 'Mã PIN 4 ký tự: 2 chữ cái (A-Z) và 2 chữ số (0-9). Bao nhiêu mã?', 'o': ['28×28', '26²×10²', '26×10', '52×100'], 'a': 1, 'ex': '26²×10²=676×100=67600.'}];
  const tfCards = [{'s': 'Quy tắc nhân dùng khi các lựa chọn loại trừ nhau.', 'a': false, 'ex': 'SAI — đó là Quy Tắc CỘNG. Quy tắc nhân dùng khi các bước xảy ra đồng thời.'}, {'s': '3 áo × 4 quần = 12 cách phối trang phục.', 'a': true, 'ex': 'ĐÚNG — quy tắc nhân: phải chọn CẢ áo VÀ quần.'}, {'s': "Quy tắc cộng: 'chọn 1 trong các lựa chọn xung khắc'.", 'a': true, 'ex': 'ĐÚNG — các cách loại trừ nhau → dùng cộng.'}, {'s': '10 chữ số và 26 chữ cái → mã 1 ký tự có 10+26=36 cách.', 'a': true, 'ex': 'ĐÚNG — chọn 1 ký tự: chữ số HOẶC chữ cái → cộng.'}, {'s': 'Số tự nhiên 2 chữ số (không lặp) từ {1,2,3}: 3×3=9.', 'a': false, 'ex': 'SAI — hàng chục 3 cách, hàng đơn vị 2 cách (không lặp) → 3×2=6.'}];
  const fillQuestions = [{'id': 'f1', 'tp': 'Quy tắc nhân: N = n₁ × n₂ × ... (các bước xảy ra ___)', 'ans': 'đồng thời', 'alt': ['dong thoi', 'simultaneously', 'cùng nhau'], 'h': ''}, {'id': 'f2', 'tp': '5 áo × 3 quần = ___ bộ trang phục', 'ans': '15', 'alt': ['15'], 'h': ''}, {'id': 'f3', 'tp': 'Mật khẩu 3 chữ số (0-9, lặp): ___ mật khẩu', 'ans': '1000', 'alt': ['1000'], 'h': '10×10×10'}];

  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <>
        
    
    
    

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Bạn muốn chọn một trang phục: 3 áo, 4 quần. Có bao nhiêu cách phối? (3×4=12). Và nếu chỉ chọn một trong hai: áo hoặc quần, thì 3+4=7. Đây chính là Quy Tắc Nhân và Quy Tắc Cộng!","You want to choose an outfit: 3 shirts, 4 pants. How many combos? (3×4=12). And if choosing just one item (shirt OR pants): 3+4=7. These are the Multiplication and Addition Rules!")}</div>
        <div style={{fontSize:16}}>❓ <em>{t("Từ Hà Nội đi Đà Nẵng có 3 cách. Từ Đà Nẵng đi TP.HCM có 4 cách. Có bao nhiêu cách đi từ HN → ĐN → HCM?","From Hanoi to Da Nang: 3 ways. Da Nang to HCM: 4 ways. How many routes HN→ĐN→HCM?")}</em></div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="Uscf6N2N3_0"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy India (YouTube)", "Video by Khan Academy India (YouTube)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Quy Tắc Nhân","1. Multiplication Rule")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{fontWeight:"bold",fontSize:17,color: "#22d3ee",marginBottom:10}}>📌 {t("Nội dung","Rule")}</div>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Một công việc gồm k bước liên tiếp. Bước 1 có n₁ cách, bước 2 có n₂ cách,..., bước k có nₖ cách. Số cách thực hiện công việc là:","A task has k consecutive steps. Step 1 has n₁ ways,..., step k has nₖ ways. Total ways:")}</div>
        <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:22,textAlign:"center",color: "#22d3ee",fontWeight:700}}>N = n₁ × n₂ × ... × nₖ</div>
        <div style={{marginTop:12,padding:"10px 14px",background:"rgba(16, 185, 129, 0.15)",borderRadius:8,fontSize:14}}>✅ {t("Dùng khi các bước PHẢI xảy ra đồng thời (và... và...).","Use when all steps MUST occur (and... and...).")}</div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Quy Tắc Cộng","2. Addition Rule")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{fontWeight:"bold",fontSize:17,color: "#22d3ee",marginBottom:10}}>📌 {t("Nội dung","Rule")}</div>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Một công việc có thể hoàn thành bằng k cách khác nhau (xung khắc). Cách 1 có n₁ phương án, cách 2 có n₂ phương án,...Số phương án là:","A task can be completed in k mutually exclusive ways. Way 1 has n₁ options,...Total options:")}</div>
        <div style={{background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:22,textAlign:"center",color: "#22d3ee",fontWeight:700}}>N = n₁ + n₂ + ... + nₖ</div>
        <div style={{marginTop:12,padding:"10px 14px",background:"rgba(239, 68, 68, 0.15)",borderRadius:8,fontSize:14}}>✅ {t("Dùng khi các cách LOẠI TRỪ nhau (hoặc... hoặc...).","Use when ways are MUTUALLY EXCLUSIVE (or... or...).")}</div>
      </div>
    </section>
    <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("3. Ví Dụ So Sánh","3. Comparison Examples")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,transition:"all 0.3s"}}>
        {[{icon:"✖️",rule:t("Quy Tắc NHÂN","MULTIPLY Rule"),ex:t("Mật khẩu 4 chữ số (mỗi chữ số 0-9): 10×10×10×10=10⁴=10000","4-digit PIN (each 0-9): 10×10×10×10=10,000"),ex2:t("Trang phục: 3 áo × 4 quần = 12 bộ","Outfit: 3 shirts × 4 pants = 12 combos"),c:"#4ade80",bg:"rgba(16, 185, 129, 0.15)"},
          {icon:"➕",rule:t("Quy Tắc CỘNG","ADD Rule"),ex:t("Đi từ A→B: 3 đường bộ hoặc 2 đường thủy = 3+2=5 lựa chọn","A→B: 3 roads or 2 water routes = 3+2=5 choices"),ex2:t("Chọn 1 sách trong 5 sách toán hoặc 3 sách văn = 5+3=8","Choose 1 book: 5 math OR 3 literature = 8"),c:"#38bdf8",bg:"rgba(14, 165, 233, 0.15)"},
        ].map((card,i)=>(<article key={i} style={{padding:20,borderRadius:10,background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:24,marginBottom:6}}>{card.icon}</div><div style={{fontSize:16,fontWeight:700,color:card.c,marginBottom:10}}>{card.rule}</div><div style={{background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8,fontSize:13,marginBottom:6}}>{card.ex}</div><div style={{background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8,fontSize:13}}>{card.ex2}</div></article>))}
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:t("Biển số xe gồm 2 chữ cái (26 chữ cái) và 4 chữ số (0-9). Biết chữ cái và chữ số có thể lặp lại. Có bao nhiêu biển số?","License plates: 2 letters (26) then 4 digits (0-9), repetition allowed. How many plates?"),a:["26×26×10×10×10×10 = 26²×10⁴ = 676×10000 = 6,760,000"]},
          {id:"e2",q:t("Từ các chữ số {1,2,3,4,5}, lập số tự nhiên có 3 chữ số khác nhau. Có bao nhiêu số?","From {1,2,3,4,5}, form 3-digit numbers with distinct digits. How many?"),a:[t("Hàng trăm: 5 cách, Hàng chục: 4 cách (còn lại), Hàng đơn vị: 3 cách","Hundreds: 5, Tens: 4, Units: 3"),"5×4×3 = 60"]},
          {id:"e3",q:t("Một lớp có 15 nam và 12 nữ. Cần chọn 1 lớp trưởng hoặc 1 lớp phó (không cùng người). Có bao nhiêu cách chọn?","Class: 15 boys, 12 girls. Choose 1 president OR 1 vice-president (different people). How many ways?"),a:[t("Quy tắc cộng: 1 lớp trưởng (27 người) + 1 lớp phó (26 người còn lại... nhưng nếu 'chọn một trong hai' thì: 27+27=54? Đề hỏi chọn 1 người bất kỳ làm 1 trong 2 chức: 27 cách cho mỗi chức, nhưng là HOẶC nên 27+27=54.","Addition rule: president (27) + VP (27) = 54"),"27 + 27 = 54"]},
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
      videoId="Uscf6N2N3_0"
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
