
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "@/components/DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SectionHeader = ({ icon, title }) => (
  <div style={{ display:"flex", alignItems:"center", gap:12, fontSize:22, fontWeight:700, color:"#0B4F5C", marginBottom:20, paddingBottom:12, borderBottom:"2px solid #f0f0f0" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

const ResultSummary = ({ items, onReset, scoreLabel, t }) => (
  <div>
    <div style={{ textAlign:"center", marginBottom:24 }}>
      <div style={{ fontSize:48, marginBottom:8 }}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div>
      <div style={{ fontSize:26, fontWeight:700, color:"#0B4F5C" }}>{items.filter(i=>i.correct).length} / {items.length}</div>
      <div style={{ color:"#777", fontSize:16, marginTop:4 }}>{scoreLabel}</div>
    </div>
    <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:24 }}>
      {items.map((item,idx) => (
        <div key={idx} style={{ padding:"14px 18px", borderRadius:10, background:item.correct?"#eafaf1":"#fdf2f2", border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}` }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
            <span style={{ fontSize:18, flexShrink:0 }}>{item.correct?"✅":"❌"}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15, fontWeight:600, color:"#333", marginBottom:4 }}>{t("Câu","Q")} {idx+1}: {item.qText}</div>
              {!item.correct && <div style={{ fontSize:14, color:"#922b21" }}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}
              {item.yourText && !item.correct && <div style={{ fontSize:14, color:"#777" }}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ textAlign:"center" }}>
      <button onClick={onReset} style={{ padding:"12px 32px", background:"black", color:"white", border:"none", borderRadius:8, fontWeight:600, fontSize:15, cursor:"pointer" }}>🔄 {t("Chơi lại","Play Again")}</button>
    </div>
  </div>
);

export default function OnTapChuong1() {
  const [lang, setLang] = useState("vi");
  const [revealedAnswers, setRevealedAnswers] = useState({});
  const [gameMode, setGameMode] = useState("mc");
  const [mcIndex, setMcIndex] = useState(0);
  const [mcSelected, setMcSelected] = useState(null);
  const [mcScore, setMcScore] = useState(0);
  const [mcDone, setMcDone] = useState(false);
  const [mcHistory, setMcHistory] = useState([]);
  const [tfIndex, setTfIndex] = useState(0);
  const [tfFlipped, setTfFlipped] = useState(false);
  const [tfScore, setTfScore] = useState(0);
  const [tfDone, setTfDone] = useState(false);
  const [tfHistory, setTfHistory] = useState([]);
  const [fillAnswers, setFillAnswers] = useState({});
  const [fillChecked, setFillChecked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const els = document.querySelectorAll("[data-reveal]");
    els.forEach((el) => {
      if (el.hasAttribute("data-reveal-stagger")) {
        const stagger = parseInt(el.getAttribute("data-stagger") || "80", 10);
        Array.from(el.children).forEach((child, i) => {
          child.style.opacity = "0";
          child.style.transform = "translateY(24px) scale(0.97)";
          child.style.transition = `opacity 0.5s cubic-bezier(.2,.8,.2,1) ${i*stagger}ms, transform 0.45s cubic-bezier(.2,.8,.2,1) ${i*stagger}ms`;
          child.style.willChange = "opacity, transform";
        });
      }
    });
    const obs = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          if (el.hasAttribute("data-reveal-stagger")) {
            const stagger = parseInt(el.getAttribute("data-stagger") || "80", 10);
            Array.from(el.children).forEach((child, i) => {
              setTimeout(() => { child.style.opacity="1"; child.style.transform="translateY(0) scale(1)"; }, i*stagger);
            });
          }
          el.classList.add("visible");
          observer.unobserve(el);
        }
      });
    }, { threshold:0.12, rootMargin:"0px 0px -40px 0px" });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const t = (vi, en) => (lang==="vi" ? vi : en);

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
        "text": "propositions and sets",
        "vi": "mệnh đề và tập hợp",
        "detail": "<b>propositions and sets</b>: mệnh đề và tập hợp.",
        "detailTitle": "propositions and sets (mệnh đề và tập hợp)"
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
        "text": "logic",
        "vi": "logic",
        "detail": "<b>logic</b>: logic.",
        "detailTitle": "logic (logic)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "set notation",
        "vi": "ký hiệu tập hợp",
        "detail": "<b>set notation</b>: ký hiệu tập hợp.",
        "detailTitle": "set notation (ký hiệu tập hợp)"
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
        "text": "review strategy",
        "vi": "chiến lược ôn tập",
        "detail": "<b>review strategy</b>: chiến lược ôn tập.",
        "detailTitle": "review strategy (chiến lược ôn tập)"
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
        "text": "logic",
        "vi": "logic",
        "detail": "<b>logic</b>: logic.",
        "detailTitle": "logic (logic)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "set notation",
        "vi": "ký hiệu tập hợp",
        "detail": "<b>set notation</b>: ký hiệu tập hợp.",
        "detailTitle": "set notation (ký hiệu tập hợp)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "review strategy",
        "vi": "chiến lược ôn tập",
        "detail": "<b>review strategy</b>: chiến lược ôn tập.",
        "detailTitle": "review strategy (chiến lược ôn tập)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];


  const toggleAnswer = (id) => setRevealedAnswers(p=>({...p,[id]:!p[id]}));
  const scrollTo = (id) => { const el=document.getElementById(id); if(el) el.scrollIntoView({behavior:"smooth",block:"start"}); };

  const mcQuestions = [
    { q:t("Mệnh đề nào sau đây là mệnh đề ĐÚNG?","Which statement is TRUE?"), options:["2+2=5", t("Mọi số chẵn chia hết cho 2","Every even number is divisible by 2"), t("∃ x∈ℕ: x+1=0","∃ x∈ℕ: x+1=0"), t("Tam giác có 4 cạnh","A triangle has 4 sides")], answer:1, explain:t("Số chẵn = 2k → luôn chia hết cho 2. Đây là mệnh đề ĐÚNG.","Even number = 2k → always divisible by 2. TRUE.") },
    { q:t("A={1,2,3,4}, B={3,4,5,6}. A∩B = ?","A={1,2,3,4}, B={3,4,5,6}. A∩B = ?"), options:["{1,2,3,4,5,6}","{3,4}","{1,2}","{5,6}"], answer:1, explain:t("A∩B = phần tử chung của A và B = {3,4}.","A∩B = common elements = {3,4}.") },
    { q:t("Phủ định của '∀x∈ℝ: x²≥0' là?","Negation of '∀x∈ℝ: x²≥0' is?"), options:[t("∀x∈ℝ: x²<0","∀x∈ℝ: x²<0"),t("∃x∈ℝ: x²<0","∃x∈ℝ: x²<0"),t("∃x∈ℝ: x²≥0","∃x∈ℝ: x²≥0"),t("∀x∈ℝ: x²>0","∀x∈ℝ: x²>0")], answer:1, explain:t("Phủ định ∀→∃, và ≥0→<0. Kết quả: ∃x∈ℝ: x²<0.","Negate ∀→∃ and ≥0→<0. Result: ∃x∈ℝ: x²<0.") },
    { q:t("U={1,2,3,4,5,6}, A={2,4,6}. CᵤA = ?","U={1,2,3,4,5,6}, A={2,4,6}. Complement CᵤA = ?"), options:["{1,3,5}","{2,4,6}","{1,2,3,4,5,6}","∅"], answer:0, explain:t("CᵤA = U\\A = {1,2,3,4,5,6}\\{2,4,6} = {1,3,5}.","CᵤA = U\\A = {1,3,5}.") },
    { q:t("Tập hợp A={x∈ℝ | x²=4} bằng?","Set A={x∈ℝ | x²=4} equals?"), options:["{4}","{2}","{−2,2}","{0,2}"], answer:2, explain:t("x²=4 → x=±2 → A={−2,2}.","x²=4 → x=±2 → A={−2,2}.") },
  ];

  const tfCards = [
    { stmt:t("P⟹Q sai khi và chỉ khi P đúng và Q sai.","P⟹Q is false if and only if P is true and Q is false."), answer:true, explain:t("ĐÚNG — đây là định nghĩa từ bảng chân lý.","TRUE — this is the definition from the truth table.") },
    { stmt:t("Tập rỗng ∅ là tập con của mọi tập hợp.","∅ is a subset of every set."), answer:true, explain:t("ĐÚNG — không có phần tử nào của ∅ nằm ngoài A → ∅⊂A.","TRUE — no element of ∅ lies outside A → ∅⊂A.") },
    { stmt:t("A∪B = A∩B khi và chỉ khi A=B.","A∪B = A∩B if and only if A=B."), answer:true, explain:t("ĐÚNG — nếu A=B thì A∪B=A=B=A∩B và ngược lại.","TRUE — if A=B then A∪B=A=B=A∩B and vice versa.") },
    { stmt:t("A\\B và B\\A luôn bằng nhau với mọi tập A, B.","A\\B and B\\A are always equal for all sets A, B."), answer:false, explain:t("SAI — Ví dụ A={1,2}, B={2,3}: A\\B={1} nhưng B\\A={3}.","FALSE — e.g. A={1,2}, B={2,3}: A\\B={1} but B\\A={3}.") },
    { stmt:t("P⟺Q tương đương (P⟹Q) ∧ (Q⟹P).","P⟺Q is equivalent to (P⟹Q) ∧ (Q⟹P)."), answer:true, explain:t("ĐÚNG — đây là định nghĩa mệnh đề tương đương.","TRUE — this is the definition of logical equivalence.") },
  ];

  const fillQuestions = [
    { id:"f1", template:t("Phủ định của '∃x∈A: P(x)' là '___x∈A: ¬P(x)'.","Negation of '∃x∈A: P(x)' is '___x∈A: ¬P(x)'."), answer:"∀", altAnswers:["∀","forall","for all"], hint:"∃ → ∀" },
    { id:"f2", template:t("A={1,2,3}, B={2,3,4}: A∪B = {1, 2, 3, ___}.","A={1,2,3}, B={2,3,4}: A∪B = {1, 2, 3, ___ }."), answer:"4", altAnswers:["4"], hint:t("∪ gộp tất cả phần tử của cả hai tập.","∪ takes all elements from both sets.") },
    { id:"f3", template:t("U={1,2,3,4,5,6}, A={1,3,5}. CᵤA = {___, ___, ___}.","U={1..6}, A={1,3,5}. CᵤA = {___, ___, ___ }."), answer:"2, 4, 6", altAnswers:["2,4,6","{2,4,6}","2 4 6"], hint:t("CᵤA = U trừ A.","CᵤA = U minus A.") },
  ];

  const checkFill = (id) => {
    const q = fillQuestions.find(q=>q.id===id);
    const raw = (fillAnswers[id]||"").toLowerCase().trim().replace(/\s/g,"");
    return [q.answer,...(q.altAnswers||[])].map(a=>a.toLowerCase().replace(/\s/g,"")).includes(raw);
  };
  const fillScore = fillChecked ? fillQuestions.filter(q=>checkFill(q.id)).length : null;

  const handleMcSelect = (i) => {
    if (mcSelected!==null) return;
    setMcSelected(i);
    const correct = i===mcQuestions[mcIndex].answer;
    if (correct) setMcScore(s=>s+1);
    setMcHistory(h=>[...h,{q:mcIndex,selected:i,correct}]);
  };
  const handleMcNext = () => { if(mcIndex+1>=mcQuestions.length) setMcDone(true); else {setMcIndex(i=>i+1);setMcSelected(null);} };
  const resetMc = () => { setMcIndex(0);setMcSelected(null);setMcScore(0);setMcDone(false);setMcHistory([]); };

  const handleTfAnswer = (ans) => {
    if (tfFlipped) return;
    setTfFlipped(true);
    const correct = ans===tfCards[tfIndex].answer;
    if (correct) setTfScore(s=>s+1);
    setTfHistory(h=>[...h,{q:tfIndex,given:ans,correct}]);
  };
  const handleTfNext = () => { if(tfIndex+1>=tfCards.length) setTfDone(true); else {setTfIndex(i=>i+1);setTfFlipped(false);} };
  const resetTf = () => { setTfIndex(0);setTfFlipped(false);setTfScore(0);setTfDone(false);setTfHistory([]); };

  const mcResultItems = mcHistory.map(h=>({correct:h.correct,qText:mcQuestions[h.q].q,correctText:mcQuestions[h.q].options[mcQuestions[h.q].answer],yourText:mcQuestions[h.q].options[h.selected]}));
  const tfResultItems = tfHistory.map(h=>({correct:h.correct,qText:tfCards[h.q].stmt,correctText:tfCards[h.q].answer?t("ĐÚNG","TRUE"):t("SAI","FALSE"),yourText:h.given?t("ĐÚNG","TRUE"):t("SAI","FALSE")}));
  const fillResultItems = fillChecked ? fillQuestions.map(q=>({correct:checkFill(q.id),qText:q.template,correctText:q.answer,yourText:fillAnswers[q.id]||t("(bỏ trống)","(blank)")})) : [];

  const tabs = [["tomTat","📚",t("Tóm Tắt","Summary")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["congThuc","📐",t("Công Thức","Formulas")],["baiTapTH","✏️",t("Bài Tập TH","Mixed Exercises")],["miniGame","🎮",t("Mini Game","Mini Game")]];

  return (
    <div style={{ width: "100%", background: "#ffffff", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "1200px", maxWidth: "95%", color: "black", paddingTop: 60, paddingBottom: 80 }}>

        <div className="reveal" data-reveal style={{ marginBottom: 24 }}>
          <Link href="/Cacbaitoan10" style={{ textDecoration: "none", color: "black", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "12px 16px", borderRadius: 8, fontSize: 15 }}>← {t("Quay lại", "Back to lessons")}</Link>
        </div>

        <header className="reveal" data-reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", position: "relative", zIndex: 300 }}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: 22, color: "#0B4F5C", letterSpacing: 1 }}>{t("Chương I · Mệnh Đề và Tập Hợp", "Chapter I · Propositions and Sets")}</div>
            <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{t("Ôn Tập Chương I", "Chapter I Review")}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setLang("vi")} style={{ background: lang === "vi" ? "black" : "#f9f9f9", color: lang === "vi" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
            <button onClick={() => setLang("en")} style={{ background: lang === "en" ? "black" : "#f9f9f9", color: lang === "en" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
          </div>
        </header>

        {/* Quick lesson links */}
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 40, transition: "all 0.3s" }}>
          {[{ slug: "menh-de", num: "1", title: t("Mệnh Đề", "Propositions") }, { slug: "tap-hop", num: "2", title: t("Tập Hợp", "Sets") }, { slug: "phep-toan-tap-hop", num: "3", title: t("Phép Toán Tập Hợp", "Set Operations") }].map(lesson => (
            <Link key={lesson.slug} href={`/cacbailam10/${lesson.slug}`} style={{ textDecoration: "none" }}>
              <article style={{ padding: 16, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", cursor: "pointer" }}>
                <div style={{ fontSize: 13, color: "#777", marginBottom: 4 }}>{t("Bài", "Lesson")} {lesson.num}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#0B4F5C" }}>{lesson.title}</div>
                <div style={{ fontSize: 13, color: "#aaa", marginTop: 4 }}>← {t("Ôn lại", "Review")}</div>
              </article>
            </Link>
          ))}
        </div>

        {/* Sticky nav */}
        <div style={{ position: "sticky", top: 0, zIndex: 200, background: "#fff", paddingTop: 12, paddingBottom: 12, marginBottom: 48, boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {tabs.map(([id, icon, label]) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ background: "#f9f9f9", color: "black", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "black"; e.currentTarget.style.color = "white"; } }
                onMouseLeave={e => { e.currentTarget.style.background = "#f9f9f9"; e.currentTarget.style.color = "black"; } }>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* TÓM TẮT */}
        <section id="tomTat" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📚" title={t("Tóm Tắt Chương I", "Chapter I Summary")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24, transition: "all 0.3s" }}>
            {[
              { title: t("Bài 1 · Mệnh Đề", "L1 · Propositions"), points: [t("Mệnh đề: phát biểu có giá trị ĐÚNG hoặc SAI", "Proposition: statement that is TRUE or FALSE"), t("Phủ định ¬P: đảo giá trị chân lý của P", "Negation ¬P: flips truth value of P"), t("Kéo theo P⟹Q: SAI chỉ khi P đúng, Q sai", "Implication P⟹Q: FALSE only when P true, Q false"), t("Tương đương P⟺Q: đúng khi P và Q cùng giá trị", "Equivalence P⟺Q: true when same truth value"), t("∀ (với mọi) và ∃ (tồn tại)", "∀ (for all) and ∃ (there exists)")] },
              { title: t("Bài 2 · Tập Hợp", "L2 · Sets"), points: [t("Tập hợp: nhóm các phần tử phân biệt", "Set: collection of distinct elements"), t("Hai cách viết: liệt kê {…} và điều kiện {x|P(x)}", "Two notations: roster {…} and set-builder {x|P(x)}"), t("A⊂B: mọi phần tử A đều thuộc B", "A⊂B: every element of A is in B"), t("A=B ⟺ A⊂B và B⊂A", "A=B ⟺ A⊂B and B⊂A"), t("ℕ⊂ℤ⊂ℚ⊂ℝ", "ℕ⊂ℤ⊂ℚ⊂ℝ")] },
              { title: t("Bài 3 · Phép Toán Tập Hợp", "L3 · Set Operations"), points: [t("Hợp A∪B: x∈A hoặc x∈B", "Union A∪B: x∈A or x∈B"), t("Giao A∩B: x∈A và x∈B", "Intersection A∩B: x∈A and x∈B"), t("Hiệu A\\B: x∈A và x∉B", "Difference A\\B: x∈A and x∉B"), t("Bù CᵤA = U\\A", "Complement CᵤA = U\\A"), t("De Morgan: Cᵤ(A∪B)=CᵤA∩CᵤB", "De Morgan: Cᵤ(A∪B)=CᵤA∩CᵤB")] },
            ].map((card, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#0B4F5C", marginBottom: 12 }}>{card.title}</div>
                {card.points.map((pt, j) => (
                  <div key={j} style={{ fontSize: 14, color: "#555", marginBottom: 8, display: "flex", gap: 8 }}>
                    <span style={{ color: "#0B4F5C", fontWeight: 700, flexShrink: 0 }}>•</span><span>{pt}</span>
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="tyDKR4FG3Yw"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ TrevTutor (YouTube)", "Video by TrevTutor (YouTube)")}
          />
        </div>
      </section>

        {/* CÔNG THỨC */}
        <section id="congThuc" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="📐" title={t("Bảng Công Thức & Khái Niệm", "Key Formulas & Concepts")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24, transition: "all 0.3s" }}>
            {[
              { label: t("Bảng chân lý P⟹Q", "Truth table P⟹Q"), isTable: true, content: [["P", "Q", "P⟹Q"], ["T", "T", "T"], ["T", "F", "F"], ["F", "T", "T"], ["F", "F", "T"]] },
              { label: t("Phủ định lượng từ", "Negating quantifiers"), formula: "¬(∀x: P(x)) = ∃x: ¬P(x)\n¬(∃x: P(x)) = ∀x: ¬P(x)", isTable: false },
              { label: t("Công thức tập hợp", "Set formulas"), formula: "A∪B = {x | x∈A ∨ x∈B}\nA∩B = {x | x∈A ∧ x∈B}\nA\\B = {x | x∈A ∧ x∉B}\nCᵤA = U\\A", isTable: false },
              { label: t("De Morgan", "De Morgan's Laws"), formula: "Cᵤ(A∪B) = CᵤA ∩ CᵤB\nCᵤ(A∩B) = CᵤA ∪ CᵤB\n\nA\\B = A∩CᵤB", isTable: false },
            ].map((card, i) => (
              <article key={i} style={{ padding: 20, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0B4F5C", marginBottom: 10 }}>{card.label}</div>
                {card.isTable ? (
                  <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
                    <tbody>
                      {card.content.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci} style={{ padding: "6px 10px", border: "1px solid #ddd", textAlign: "center", background: ri === 0 ? "#0B4F5C" : "transparent", color: ri === 0 ? "white" : cell === "T" ? "#1e8449" : cell === "F" ? "#922b21" : "#333", fontWeight: ri === 0 || cell === "T" || cell === "F" ? 700 : 400 }}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ fontFamily: "monospace", fontSize: 13, background: "white", padding: "10px 14px", borderRadius: 8, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{card.formula}</div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* BÀI TẬP TỔNG HỢP */}
        <section id="baiTapTH" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="✏️" title={t("Bài Tập Tổng Hợp", "Mixed Practice")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 40, transition: "all 0.3s" }}>
            {[
              {
                id: "e1", badge: t("Bài 1", "L1"), q: t("Cho P: 'n chia hết cho 6', Q: 'n chia hết cho 2'.\n(a) Phát biểu P⟹Q bằng lời.\n(b) Mệnh đề P⟹Q đúng hay sai? Tại sao?", "P: 'n divisible by 6', Q: 'n divisible by 2'.\n(a) State P⟹Q in words.\n(b) Is P⟹Q true or false? Why?"),
                a: [t("(a) 'Nếu n chia hết cho 6 thì n chia hết cho 2'", "(a) 'If n is divisible by 6 then it is divisible by 2'"), t("(b) ĐÚNG — n=6k=2·(3k) luôn chia hết cho 2.", "(b) TRUE — n=6k=2·(3k) is always divisible by 2.")]
              },
              {
                id: "e2", badge: t("Bài 2+3", "L2+3"), q: t("A={x∈ℤ|−2≤x≤3}, B={x∈ℤ|0≤x≤5}.\nTìm A∪B, A∩B, A\\B, B\\A.", "A={x∈ℤ|−2≤x≤3}, B={x∈ℤ|0≤x≤5}.\nFind A∪B, A∩B, A\\B, B\\A."),
                a: ["A={−2,−1,0,1,2,3}, B={0,1,2,3,4,5}", t("A∪B = {−2,−1,0,1,2,3,4,5}", "A∪B = {−2,−1,0,1,2,3,4,5}"), t("A∩B = {0,1,2,3}", "A∩B = {0,1,2,3}"), t("A\\B = {−2,−1}; B\\A = {4,5}", "A\\B = {−2,−1}; B\\A = {4,5}")]
              },
              {
                id: "e3", badge: t("Tổng hợp", "Mixed"), q: t("Phủ định và xét đúng/sai:\n(a) ∀x∈ℝ: x²+1>0\n(b) ∃x∈ℝ: x²+x+1=0", "Negate and determine truth:\n(a) ∀x∈ℝ: x²+1>0\n(b) ∃x∈ℝ: x²+x+1=0"),
                a: [t("(a) Phủ định: ∃x∈ℝ: x²+1≤0. Gốc ĐÚNG (x²+1≥1>0). Phủ định SAI.", "(a) Negation: ∃x∈ℝ: x²+1≤0. Original TRUE. Negation FALSE."), t("(b) Phủ định: ∀x∈ℝ: x²+x+1≠0. Δ=1−4=−3<0 → vô nghiệm → gốc SAI. Phủ định ĐÚNG.", "(b) Negation: ∀x∈ℝ: x²+x+1≠0. Δ=−3<0 → no roots → original FALSE. Negation TRUE.")]
              },
            ].map(({ id, q, a, badge }) => (
              <article key={id}>
                <div style={{ padding: "16px 16px", borderRadius: "10px 10px 0 0", background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <div style={{ fontSize: 18, fontWeight: 600 }}>📝 {t("Bài tập", "Exercise")}</div>
                    <span style={{ background: "black", color: "white", fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{badge}</span>
                  </div>
                  <div style={{ color: "#777", fontSize: 14, marginBottom: 10 }}>{t("Toán 10", "Grade 10")}</div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{q}</div>
                </div>
                <button onClick={() => toggleAnswer(id)} style={{ display: "block", width: "100%", padding: "12px 20px", background: "black", color: "white", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", textAlign: "left" }}>
                  {revealedAnswers[id] ? t("Ẩn đáp án ▲", "Hide Answer ▲") : t("Xem đáp án ▼", "Show Answer ▼")}
                </button>
                {revealedAnswers[id] && <div style={{ padding: "16px 20px", background: "#eafaf1", borderRadius: "0 0 10px 10px" }}>{a.map((line, i) => <div key={i} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>{line}</div>)}</div>}
              </article>
            ))}
          </div>
        </section>

        {/* MINI GAME */}
        <section id="miniGame" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SectionHeader icon="🎮" title={t("Mini Game · Ôn Tập Chương I", "Mini Game · Chapter I Review")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 24, marginBottom: 32, transition: "all 0.3s" }}>
            {[["mc", "🧩", t("Trắc Nghiệm", "Multiple Choice"), t("5 câu", "5 questions")], ["tf", "🃏", t("Đúng / Sai", "True / False"), t("5 thẻ", "5 cards")], ["fill", "✍️", t("Điền Chỗ Trống", "Fill in Blank"), t("3 câu", "3 items")]].map(([mode, icon, label, sub]) => (
              <article key={mode} onClick={() => setGameMode(mode)} style={{ background: gameMode === mode ? "black" : "#f9f9f9", color: gameMode === mode ? "white" : "black", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20, borderRadius: 10 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
                <div style={{ fontSize: 18, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>{sub}</div>
              </article>
            ))}
          </div>

          {gameMode === "mc" && (
            <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!mcDone ? (
                <><div style={{ color: "#777", fontSize: 15, marginBottom: 8 }}>{t("Câu", "Q")} {mcIndex + 1}/{mcQuestions.length} · {t("Điểm:", "Score:")} {mcScore}</div>
                  <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>{mcQuestions[mcIndex].q}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {mcQuestions[mcIndex].options.map((opt, i) => {
                      let bg = "white", color = "black";
                      if (mcSelected !== null) { if (i === mcQuestions[mcIndex].answer) { bg = "#eafaf1"; color = "#1e8449"; } else if (i === mcSelected) { bg = "#fdf2f2"; color = "#922b21"; } }
                      return <button key={i} onClick={() => handleMcSelect(i)} style={{ textAlign: "left", padding: "14px 18px", borderRadius: 10, border: "none", background: bg, color, fontSize: 15, fontWeight: mcSelected !== null && (i === mcSelected || i === mcQuestions[mcIndex].answer) ? 600 : 400, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.15s" }}>{String.fromCharCode(65 + i)}. {opt}</button>;
                    })}
                  </div>
                  {mcSelected !== null && (<><div style={{ marginTop: 16, padding: "12px 16px", background: "white", borderRadius: 8, fontSize: 15, color: "#555", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💬 {mcQuestions[mcIndex].explain}</div><button onClick={handleMcNext} style={{ marginTop: 14, padding: "12px 28px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{mcIndex + 1 < mcQuestions.length ? t("Câu tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")}</button></>)}</>
              ) : <ResultSummary items={mcResultItems} onReset={resetMc} scoreLabel={mcScore === mcQuestions.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : mcScore >= 3 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} t={t} />}
            </div>
          )}

          {gameMode === "tf" && (
            <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!tfDone ? (
                <><div style={{ color: "#777", fontSize: 15, marginBottom: 14 }}>{t("Thẻ", "Card")} {tfIndex + 1}/{tfCards.length} · {t("Điểm:", "Score:")} {tfScore}</div>
                  <article style={{ background: "white", borderRadius: 10, padding: 24, marginBottom: 20, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                    <div style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 24 }}>{tfCards[tfIndex].stmt}</div>
                    {!tfFlipped ? (
                      <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                        <button onClick={() => handleTfAnswer(true)} style={{ padding: "12px 36px", background: "#eafaf1", color: "#1e8449", border: "2px solid #1e8449", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✅ {t("ĐÚNG", "TRUE")}</button>
                        <button onClick={() => handleTfAnswer(false)} style={{ padding: "12px 36px", background: "#fdf2f2", color: "#922b21", border: "2px solid #922b21", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>❌ {t("SAI", "FALSE")}</button>
                      </div>
                    ) : (
                      <><div style={{ padding: "12px 16px", background: "#f9f9f9", borderRadius: 8, fontSize: 15, color: "#555", textAlign: "left", marginBottom: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💬 {tfCards[tfIndex].explain}</div><button onClick={handleTfNext} style={{ padding: "12px 28px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{tfIndex + 1 < tfCards.length ? t("Thẻ tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")}</button></>
                    )}
                  </article></>
              ) : <ResultSummary items={tfResultItems} onReset={resetTf} scoreLabel={tfScore === tfCards.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : t("Cố gắng thêm! 💪", "Keep going! 💪")} t={t} />}
            </div>
          )}

          {gameMode === "fill" && (
            <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
              {!fillChecked ? (
                <><div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t("Điền câu trả lời vào chỗ trống", "Fill in each blank")}</div>
                  {fillQuestions.map((q, qi) => (
                    <div key={q.id} style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 15, color: "#777", marginBottom: 6 }}>{t("Câu", "Q")} {qi + 1}</div>
                      <div style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 10 }}>{q.template}</div>
                      <input value={fillAnswers[q.id] || ""} onChange={e => setFillAnswers(p => ({ ...p, [q.id]: e.target.value }))} placeholder={t("Nhập đáp án...", "Enter answer...")} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, fontSize: 15, outline: "none", border: "1px solid #ddd", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", boxSizing: "border-box" }} />
                    </div>
                  ))}
                  <button onClick={() => setFillChecked(true)} style={{ padding: "12px 32px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{t("Kiểm tra", "Check Answers")}</button></>
              ) : <ResultSummary items={fillResultItems} onReset={() => { setFillAnswers({}); setFillChecked(false); } } scoreLabel={fillScore === fillQuestions.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : fillScore >= 2 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} t={t} />}
            </div>
          )}
        </section>

        <hr style={{ width: "5px" }}></hr>
        <div className="reveal" data-reveal style={{ textAlign: "center", color: "#777", fontSize: 15, marginBottom: 60 }}>
          Toán 10 · Chân Trời Sáng Tạo · {t("Ôn Tập Chương I", "Chapter I Review")}
        </div>

        <style>{`
          .reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}
          .reveal.visible{opacity:1;transform:translateY(0) scale(1);}
          .reveal[data-reveal-stagger].visible{opacity:1;transform:none;}
          .reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}
          header.reveal{transform:translateY(-18px);opacity:0;}
          header.reveal.visible{opacity:1;transform:translateY(0);}
          article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}
          article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}
        `}</style>
        <DuoTranslate/> 
      </div>
    </div>
    
)}
