
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";

const SH = ({ icon, title }) => (
  <div style={{ display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);
const RS = ({ items, onReset, scoreLabel, t }) => (
  <div>
    <div style={{ textAlign:"center",marginBottom:24 }}>
      <div style={{ fontSize:48,marginBottom:8 }}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div>
      <div style={{ fontSize:26,fontWeight:700,color:"#0B4F5C" }}>{items.filter(i=>i.correct).length} / {items.length}</div>
      <div style={{ color:"#777",fontSize:16,marginTop:4 }}>{scoreLabel}</div>
    </div>
    <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:24 }}>
      {items.map((item,idx)=>(
        <div key={idx} style={{ padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}` }}>
          <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
            <span style={{ fontSize:18,flexShrink:0 }}>{item.correct?"✅":"❌"}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15,fontWeight:600,color:"#333",marginBottom:4 }}>{t("Câu","Q")} {idx+1}: {item.qText}</div>
              {!item.correct&&<div style={{ fontSize:14,color:"#922b21" }}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}
              {item.yourText&&!item.correct&&<div style={{ fontSize:14,color:"#777" }}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ textAlign:"center" }}>
      <button onClick={onReset} style={{ padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer" }}>🔄 {t("Chơi lại","Play Again")}</button>
    </div>
  </div>
);

export default function OnTapChuong4() {
  const { user, saveGameResult } = useAuth();
  const [lang,setLang]=useState("vi");
  const [rev,setRev]=useState({});
  const [gm,setGm]=useState("mc");
  const [mi,setMi]=useState(0),[ms,setMs]=useState(null),[msc,setMsc]=useState(0),[md,setMd]=useState(false),[mh,setMh]=useState([]);
  const [ti,setTi]=useState(0),[tf,setTf]=useState(false),[ts,setTs]=useState(0),[td,setTd]=useState(false),[th,setTh]=useState([]);
  const [fa,setFa]=useState({}),[fc,setFc]=useState(false);

  useEffect(()=>{
    if(typeof window==="undefined")return;
    const els=document.querySelectorAll("[data-reveal]");
    els.forEach(el=>{if(el.hasAttribute("data-reveal-stagger")){const s=parseInt(el.getAttribute("data-stagger")||"80",10);Array.from(el.children).forEach((c,i)=>{c.style.opacity="0";c.style.transform="translateY(24px) scale(0.97)";c.style.transition=`opacity 0.5s cubic-bezier(.2,.8,.2,1) ${i*s}ms,transform 0.45s cubic-bezier(.2,.8,.2,1) ${i*s}ms`;c.style.willChange="opacity,transform";})}});
    const obs=new IntersectionObserver((entries,observer)=>{entries.forEach(entry=>{if(entry.isIntersecting){const el=entry.target;if(el.hasAttribute("data-reveal-stagger")){const s=parseInt(el.getAttribute("data-stagger")||"80",10);Array.from(el.children).forEach((c,i)=>setTimeout(()=>{c.style.opacity="1";c.style.transform="translateY(0) scale(1)"},i*s));}el.classList.add("visible");observer.unobserve(el);}});},{threshold:0.12,rootMargin:"0px 0px -40px 0px"});
    els.forEach(el=>obs.observe(el));return()=>obs.disconnect();
  },[]);

  const t=(vi,en)=>lang==="vi"?vi:en;

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
        "text": "triangle trigonometry review",
        "vi": "ôn tập hệ thức lượng trong tam giác",
        "detail": "<b>triangle trigonometry review</b>: ôn tập hệ thức lượng trong tam giác.",
        "detailTitle": "triangle trigonometry review (ôn tập hệ thức lượng trong tam giác)"
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
        "text": "law of cosines",
        "vi": "định lý cosin",
        "detail": "<b>law of cosines</b>: định lý cosin.",
        "detailTitle": "law of cosines (định lý cosin)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "law of sines",
        "vi": "định lý sin",
        "detail": "<b>law of sines</b>: định lý sin.",
        "detailTitle": "law of sines (định lý sin)"
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
        "vi": "bài toán ứng dụng",
        "detail": "<b>application</b>: bài toán ứng dụng.",
        "detailTitle": "application (bài toán ứng dụng)"
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
        "text": "law of cosines",
        "vi": "định lý cosin",
        "detail": "<b>law of cosines</b>: định lý cosin.",
        "detailTitle": "law of cosines (định lý cosin)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "law of sines",
        "vi": "định lý sin",
        "detail": "<b>law of sines</b>: định lý sin.",
        "detailTitle": "law of sines (định lý sin)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "application",
        "vi": "bài toán ứng dụng",
        "detail": "<b>application</b>: bài toán ứng dụng.",
        "detailTitle": "application (bài toán ứng dụng)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];


  const sc=(id)=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});};
  const tr=(id)=>setRev(p=>({...p,[id]:!p[id]}));

  const mcQ=[
    {q:t("sin(180°−α) = ?","sin(180°−α) = ?"),o:["−sinα","sinα","cosα","−cosα"],a:1,ex:t("Công thức góc bù: sin(180°−α)=sinα.","Supplementary formula: sin(180°−α)=sinα.")},
    {q:t("Định lí Côsin: a² = ?","Law of Cosines: a² = ?"),o:["b²+c²+2bc·cosA","b²+c²−2bc·cosA","(b+c)²−a","b²−c²+2a"],a:1,ex:t("a²=b²+c²−2bc·cosA (dấu trừ).","a²=b²+c²−2bc·cosA (minus sign).")},
    {q:t("Định lí Sin: a/sinA = ?","Law of Sines: a/sinA = ?"),o:["b·sinB","2R","b/sinB","1"],a:1,ex:t("a/sinA=b/sinB=c/sinC=2R.","a/sinA=b/sinB=c/sinC=2R.")},
    {q:t("Tam giác: A=30°, b=6, c=4. Diện tích S = ?","Triangle: A=30°, b=6, c=4. Area S = ?"),o:["6","12","3","24"],a:0,ex:t("S=(1/2)·b·c·sinA=(1/2)·6·4·(1/2)=6.","S=(1/2)·6·4·sin30°=6.")},
    {q:t("Tam giác a=5, b=7, c=8. cosC = ?","Triangle a=5, b=7, c=8. cosC = ?"),o:["1/7","2/7","1/2","−1/2"],a:1,ex:t("cosC=(a²+b²−c²)/(2ab)=(25+49−64)/70=10/70=1/7. Đúng: 2/7... Chờ: (25+49−64)=10 → 10/70=1/7. Đáp án A.","cosC=(25+49−64)/70=10/70=1/7.")},
  ];
  const tfC=[
    {s:t("cos(180°−α)=cosα với mọi α.","cos(180°−α)=cosα for all α."),a:false,ex:t("SAI — cos(180°−α)=−cosα (đổi dấu).","FALSE — cos(180°−α)=−cosα.")},
    {s:t("Định lí Pythagore là trường hợp đặc biệt của Định lí Côsin khi C=90°.","Pythagorean theorem is a special case of Law of Cosines when C=90°."),a:true,ex:t("ĐÚNG — cos90°=0 → c²=a²+b².","TRUE — cos90°=0 → c²=a²+b².")},
    {s:t("Định lí Sin đúng với mọi tam giác.","The Law of Sines holds for every triangle."),a:true,ex:t("ĐÚNG — a/sinA=b/sinB=c/sinC=2R luôn đúng.","TRUE — always holds.")},
    {s:t("S=(1/2)·a·b·sinC là công thức diện tích qua 2 cạnh và góc xen giữa.","S=(1/2)·a·b·sinC is the area formula using 2 sides and the included angle."),a:true,ex:t("ĐÚNG — đây là công thức chuẩn.","TRUE — standard formula.")},
    {s:t("Nên dùng Định lí Sin khi biết 3 cạnh tam giác.","Use Law of Sines when 3 sides are known."),a:false,ex:t("SAI — biết 3 cạnh → dùng Định lí CÔSIN để tính góc.","FALSE — 3 sides → use Law of COSINES to find angles.")},
  ];
  const fQ=[
    {id:"f1",tp:t("sin²α + cos²α = ___","sin²α + cos²α = ___"),ans:"1",alt:["1"],h:""},
    {id:"f2",tp:t("cosA = (b² + c² − a²) / ___","cosA = (b² + c² − a²) / ___"),ans:"2bc",alt:["2bc"],h:""},
    {id:"f3",tp:t("Diện tích: S = (1/2) · a · b · ___","Area: S = (1/2) · a · b · ___"),ans:"sinC",alt:["sinc","sin C","sin(C)"],h:""},
  ];

  const cf=(id)=>{const q=fQ.find(q=>q.id===id);const r=(fa[id]||"").toLowerCase().trim().replace(/\s/g,"");return[q.ans,...(q.alt||[])].map(a=>a.toLowerCase().replace(/\s/g,"")).includes(r);};
  const fs=fc?fQ.filter(q=>cf(q.id)).length:null;
  const sel=(i)=>{if(ms!==null)return;setMs(i);const c=i===mcQ[mi].a;if(c)setMsc(s=>s+1);setMh(h=>[...h,{q:mi,s:i,c}]);};
  const nx=()=>{if(mi+1>=mcQ.length)setMd(true);else{setMi(i=>i+1);setMs(null);}};
  const rm=()=>{setMi(0);setMs(null);setMsc(0);setMd(false);setMh([]);};
  const ta=(a)=>{if(tf)return;setTf(true);const c=a===tfC[ti].a;if(c)setTs(s=>s+1);setTh(h=>[...h,{q:ti,g:a,c}]);};
  const tn=()=>{if(ti+1>=tfC.length)setTd(true);else{setTi(i=>i+1);setTf(false);}};
  const rt=()=>{setTi(0);setTf(false);setTs(0);setTd(false);setTh([]);};
  const mri=mh.map(h=>({correct:h.c,qText:mcQ[h.q].q,correctText:mcQ[h.q].o[mcQ[h.q].a],yourText:mcQ[h.q].o[h.s]}));
  const tri=th.map(h=>({correct:h.c,qText:tfC[h.q].s,correctText:tfC[h.q].a?t("ĐÚNG","TRUE"):t("SAI","FALSE"),yourText:h.g?t("ĐÚNG","TRUE"):t("SAI","FALSE")}));
  const fri=fc?fQ.map(q=>({correct:cf(q.id),qText:q.tp,correctText:q.ans,yourText:fa[q.id]||t("(bỏ trống)","(blank)")})):[];
  const tabs=[["tomTat","📚",t("Tóm Tắt","Summary")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["congThuc","📐",t("Công Thức","Formulas")],["baiTap","✏️",t("Bài Tập TH","Mixed")],["miniGame","🎮","Mini Game"]];

  
  useEffect(() => {
    if (md && user) {
      saveGameResult({
        lesson_slug: "OnTapChuong4",
        mode: "mc",
        score: msc,
        total: mcQ.length
      });
    }
  }, [md, msc, user]);

  useEffect(() => {
    if (td && user) {
      saveGameResult({
        lesson_slug: "OnTapChuong4",
        mode: "tf",
        score: ts,
        total: tfC.length
      });
    }
  }, [td, ts, user]);

  useEffect(() => {
    if (fc && user) {
      const correctCount = fQ.filter(q => {
        const r = (fa[q.id] || "").toLowerCase().trim().replace(/\s/g, "");
        return [q.ans, ...(q.alt || [])].map(a => a.toLowerCase().replace(/\s/g, "")).includes(r);
      }).length;
      saveGameResult({
        lesson_slug: "OnTapChuong4",
        mode: "fill",
        score: correctCount,
        total: fQ.length
      });
    }
  }, [fc, fa, user]);

  return (
    <><div style={{ width: "100%", background: "#fff", display: "flex", justifyContent: "center" }}>
      <div style={{ width: "1200px", maxWidth: "95%", color: "black", paddingTop: 60, paddingBottom: 80 }}>
        <div className="reveal" data-reveal style={{ marginBottom: 24 }}><Link href="/Cacbaitoan10" style={{ textDecoration: "none", color: "black", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: "12px 16px", borderRadius: 8, fontSize: 15 }}>← {t("Quay lại", "Back")}</Link></div>
        <header className="reveal" data-reveal style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0", position: "relative", zIndex: 300 }}>
          <div>
            <div style={{ fontWeight: "bold", fontSize: 22, color: "#0B4F5C" }}>{t("Chương IV · Hệ Thức Lượng Trong Tam Giác", "Chapter IV · Triangle Trigonometry")}</div>
            <div style={{ fontSize: 28, fontWeight: 600, marginTop: 4 }}>{t("Ôn Tập Chương IV", "Chapter IV Review")}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setLang("vi")} style={{ background: lang === "vi" ? "black" : "#f9f9f9", color: lang === "vi" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
            <button onClick={() => setLang("en")} style={{ background: lang === "en" ? "black" : "#f9f9f9", color: lang === "en" ? "white" : "black", border: "none", borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
          </div>
        </header>

        <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 40, transition: "all 0.3s" }}>
          {[{ slug: "gia-tri-luong-giac", num: "10", title: t("Giá Trị Lượng Giác", "Trig Values") }, { slug: "dinh-li-cosin", num: "11", title: t("Định Lí Côsin", "Law of Cosines") }, { slug: "dinh-li-sin", num: "12", title: t("Định Lí Sin", "Law of Sines") }, { slug: "giai-tam-giac", num: "13", title: t("Giải Tam Giác", "Solving Triangles") }].map(l => (
            <Link key={l.slug} href={`/cacbailam10/${l.slug}`} style={{ textDecoration: "none" }}>
              <article style={{ padding: 14, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", cursor: "pointer" }}>
                <div style={{ fontSize: 12, color: "#777", marginBottom: 3 }}>{t("Bài", "L")} {l.num}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#0B4F5C" }}>{l.title}</div>
                <div style={{ fontSize: 12, color: "#aaa", marginTop: 3 }}>← {t("Ôn lại", "Review")}</div>
              </article>
            </Link>
          ))}
        </div>

        <div style={{ position: "sticky", top: 0, zIndex: 200, background: "#fff", paddingTop: 12, paddingBottom: 12, marginBottom: 48, boxShadow: "0 4px 16px rgba(0,0,0,0.07)" }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {tabs.map(([id, icon, label]) => (<button key={id} onClick={() => sc(id)} style={{ background: "#f9f9f9", color: "black", border: "none", borderRadius: 8, padding: "10px 14px", fontWeight: 600, fontSize: 13, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", transition: "all 0.15s" }} onMouseEnter={e => { e.currentTarget.style.background = "black"; e.currentTarget.style.color = "white"; } } onMouseLeave={e => { e.currentTarget.style.background = "#f9f9f9"; e.currentTarget.style.color = "black"; } }>{icon} {label}</button>))}
          </div>
        </div>

        <section id="tomTat" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SH icon="📚" title={t("Tóm Tắt Chương IV", "Chapter IV Summary")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 22, transition: "all 0.3s" }}>
            {[{ title: t("Bài 10 · Giá Trị Lượng Giác (0°–180°)", "L10 · Trig Values (0°–180°)"), pts: [t("sinα>0 với 0°<α<180°", "sinα>0 for 0°<α<180°"), t("cosα<0 với 90°<α<180°", "cosα<0 for 90°<α<180°"), t("sin(180°−α)=sinα; cos(180°−α)=−cosα", "sin(180°−α)=sinα; cos(180°−α)=−cosα"), t("sin²α+cos²α=1", "sin²α+cos²α=1")] },
            { title: t("Bài 11 · Định Lí Côsin", "L11 · Law of Cosines"), pts: ["a²=b²+c²−2bc·cosA", "cosA=(b²+c²−a²)/(2bc)", t("Dùng khi: SAS hoặc SSS", "Use when: SAS or SSS"), t("Pythagore là TH đặc biệt (C=90°)", "Pythagoras is a special case (C=90°)")] },
            { title: t("Bài 12 · Định Lí Sin", "L12 · Law of Sines"), pts: ["a/sinA=b/sinB=c/sinC=2R", "R=a/(2sinA)", t("Dùng khi: AAS, ASA", "Use when: AAS, ASA"), t("Cạnh lớn đối góc lớn", "Larger side opposite larger angle")] },
            { title: t("Bài 13 · Giải Tam Giác", "L13 · Solving Triangles"), pts: [t("S=(1/2)·a·b·sinC (diện tích)", "S=(1/2)·a·b·sinC (area)"), t("Cần ≥ 3 dữ kiện (ít nhất 1 cạnh)", "Need ≥ 3 data (at least 1 side)"), t("SAS→Côsin; AAS→Sin", "SAS→Cosines; AAS→Sines"), t("Heron: S=√(s(s−a)(s−b)(s−c))", "Heron: S=√(s(s−a)(s−b)(s−c))")] }
            ].map((card, i) => (
              <article key={i} style={{ padding: 18, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0B4F5C", marginBottom: 10 }}>{card.title}</div>
                {card.pts.map((pt, j) => <div key={j} style={{ fontSize: 13, color: "#555", marginBottom: 7, display: "flex", gap: 8 }}><span style={{ color: "#0B4F5C", fontWeight: 700, flexShrink: 0 }}>•</span><span style={{ fontFamily: "monospace" }}>{pt}</span></div>)}
              </article>
            ))}
          </div>
        </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="Em2HiOJUS5E"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy India (YouTube)", "Video by Khan Academy India (YouTube)")}
          />
        </div>
      </section>

        <section id="congThuc" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SH icon="📐" title={t("Bảng Công Thức Chương IV", "Chapter IV Formula Sheet")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, transition: "all 0.3s" }}>
            {[{ label: t("Góc bù & Hệ thức cơ bản", "Supplementary & Identity"), formula: "sin(180°−α) = sinα\ncos(180°−α) = −cosα\ntan(180°−α) = −tanα\nsin²α + cos²α = 1" },
            { label: t("Định lí Côsin", "Law of Cosines"), formula: "a² = b² + c² − 2bc·cosA\ncosA = (b²+c²−a²) / (2bc)\ncosB = (a²+c²−b²) / (2ac)\ncosC = (a²+b²−c²) / (2ab)" },
            { label: t("Định lí Sin", "Law of Sines"), formula: "a/sinA = b/sinB = c/sinC = 2R\nR = a / (2sinA)\nsinA = a / (2R)" },
            { label: t("Diện tích & Heron", "Area & Heron"), formula: "S = (½)·b·c·sinA\nS = (½)·a·c·sinB\nS = (½)·a·b·sinC\ns=(a+b+c)/2\nS = √(s(s−a)(s−b)(s−c))" },
            ].map((card, i) => (
              <article key={i} style={{ padding: 18, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0B4F5C", marginBottom: 10 }}>{card.label}</div>
                <div style={{ fontFamily: "monospace", fontSize: 13, background: "white", padding: "10px 12px", borderRadius: 8, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{card.formula}</div>
              </article>
            ))}
          </div>
        </section>

        <section id="baiTap" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SH icon="✏️" title={t("Bài Tập Tổng Hợp", "Mixed Practice")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 36, transition: "all 0.3s" }}>
            {[
              {
                id: "e1", badge: "L10+11", q: t("Tam giác ABC: A=120°, b=4, c=5.\n(a) Tính cạnh a.\n(b) Tính sin B.", "Triangle ABC: A=120°, b=4, c=5.\n(a) Find side a.\n(b) Find sinB."),
                a: [t("(a) a²=16+25−2·4·5·cos120°=41−40·(−1/2)=41+20=61 → a=√61≈7.81", "a²=41+20=61 → a=√61≈7.81"), t("(b) sinB/b=sinA/a → sinB=4·sin120°/√61=4·(√3/2)/√61=2√3/√61≈0.444", "sinB=2√3/√61≈0.444")]
              },
              {
                id: "e2", badge: "L11+12", q: t("Tam giác: a=6, b=7, c=8.\n(a) Tính cosC.\n(b) Tính diện tích S.", "Triangle: a=6, b=7, c=8.\n(a) Find cosC.\n(b) Find area S."),
                a: [t("(a) cosC=(36+49−64)/(2·6·7)=21/84=1/4", "cosC=21/84=1/4"), t("(b) sinC=√(1−1/16)=√(15/16)=√15/4", "sinC=√15/4"), t("S=(1/2)·a·b·sinC=(1/2)·6·7·(√15/4)=21√15/4≈20.3", "S=21√15/4≈20.3")]
              },
              {
                id: "e3", badge: "L12+13", q: t("Tam giác ABC: A=45°, B=60°, a=10.\n(a) Tính b và c.\n(b) Tính diện tích S.", "Triangle: A=45°, B=60°, a=10.\n(a) Find b and c.\n(b) Find area S."),
                a: [t("C=180°−45°−60°=75°", "C=75°"), t("b=a·sinB/sinA=10·sin60°/sin45°=10·(√3/2)/(√2/2)=10√3/√2=5√6≈12.2", "b=5√6≈12.2"), t("c=a·sinC/sinA=10·sin75°/sin45°≈10·0.966/0.707≈13.66", "c≈13.66"), t("S=(1/2)·a·b·sinC=(1/2)·10·5√6·sin75°≈(1/2)·10·12.2·0.966≈59.0", "S≈59.0")]
              },
            ].map(({ id, q, a, badge }) => (
              <article key={id}>
                <div style={{ padding: "16px 20px", borderRadius: "10px 10px 0 0", background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontSize: 17, fontWeight: 600 }}>📝 {t("Bài tập", "Exercise")}</div>
                    <span style={{ background: "black", color: "white", fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>{badge}</span>
                  </div>
                  <div style={{ fontSize: 15, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{q}</div>
                </div>
                <button onClick={() => tr(id)} style={{ display: "block", width: "100%", padding: "12px 20px", background: "black", color: "white", border: "none", fontWeight: 600, fontSize: 15, cursor: "pointer", textAlign: "left" }}>{rev[id] ? t("Ẩn ▲", "Hide ▲") : t("Xem đáp án ▼", "Show ▼")}</button>
                {rev[id] && <div style={{ padding: "16px 20px", background: "#eafaf1", borderRadius: "0 0 10px 10px" }}>{a.map((l, i) => <div key={i} style={{ fontSize: 15, color: "#555", marginBottom: 6 }}>{l}</div>)}</div>}
              </article>
            ))}
          </div>
        </section>

        <section id="miniGame" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
          <SH icon="🎮" title={t("Mini Game · Ôn Tập Chương IV", "Mini Game · Chapter IV Review")} />
          <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 24, marginBottom: 32, transition: "all 0.3s" }}>
            {[["mc", "🧩", t("Trắc Nghiệm", "Multiple Choice"), t("5 câu", "5 Q")], ["tf", "🃏", t("Đúng / Sai", "True / False"), t("5 thẻ", "5 cards")], ["fill", "✍️", t("Điền Chỗ Trống", "Fill in Blank"), t("3 câu", "3 items")]].map(([mode, icon, label, sub]) => (
              <article key={mode} onClick={() => setGm(mode)} style={{ background: gm === mode ? "black" : "#f9f9f9", color: gm === mode ? "white" : "black", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", padding: 20, borderRadius: 10 }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div><div style={{ fontSize: 18, fontWeight: 600 }}>{label}</div><div style={{ fontSize: 14, opacity: 0.7 }}>{sub}</div>
              </article>
            ))}
          </div>
          {gm === "mc" && <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{!md ? (<><div style={{ color: "#777", fontSize: 15, marginBottom: 8 }}>{t("Câu", "Q")} {mi + 1}/{mcQ.length} · {t("Điểm:", "Score:")} {msc}</div><div style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>{mcQ[mi].q}</div><div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{mcQ[mi].o.map((opt, i) => { let bg = "white", co = "black"; if (ms !== null) { if (i === mcQ[mi].a) { bg = "#eafaf1"; co = "#1e8449"; } else if (i === ms) { bg = "#fdf2f2"; co = "#922b21"; } } return <button key={i} onClick={() => sel(i)} style={{ textAlign: "left", padding: "14px 18px", borderRadius: 10, border: "none", background: bg, color: co, fontSize: 15, fontWeight: ms !== null && (i === ms || i === mcQ[mi].a) ? 600 : 400, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{String.fromCharCode(65 + i)}. {opt}</button>; })}</div>{ms !== null && <><div style={{ marginTop: 16, padding: "12px 16px", background: "white", borderRadius: 8, fontSize: 15, color: "#555", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💬 {mcQ[mi].ex}</div><button onClick={nx} style={{ marginTop: 14, padding: "12px 28px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{mi + 1 < mcQ.length ? t("Câu tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")}</button></>}</>) : <RS items={mri} onReset={rm} scoreLabel={msc === mcQ.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : msc >= 3 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} t={t} />}</div>}
          {gm === "tf" && <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{!td ? (<><div style={{ color: "#777", fontSize: 15, marginBottom: 14 }}>{t("Thẻ", "Card")} {ti + 1}/{tfC.length} · {t("Điểm:", "Score:")} {ts}</div><article style={{ background: "white", borderRadius: 10, padding: 24, marginBottom: 20, textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}><div style={{ fontSize: 18, lineHeight: 1.7, marginBottom: 24 }}>{tfC[ti].s}</div>{!tf ? (<div style={{ display: "flex", gap: 16, justifyContent: "center" }}><button onClick={() => ta(true)} style={{ padding: "12px 36px", background: "#eafaf1", color: "#1e8449", border: "2px solid #1e8449", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>✅ {t("ĐÚNG", "TRUE")}</button><button onClick={() => ta(false)} style={{ padding: "12px 36px", background: "#fdf2f2", color: "#922b21", border: "2px solid #922b21", borderRadius: 8, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>❌ {t("SAI", "FALSE")}</button></div>) : (<><div style={{ padding: "12px 16px", background: "#f9f9f9", borderRadius: 8, fontSize: 15, color: "#555", textAlign: "left", marginBottom: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>💬 {tfC[ti].ex}</div><button onClick={tn} style={{ padding: "12px 28px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{ti + 1 < tfC.length ? t("Thẻ tiếp ▶", "Next ▶") : t("Xem kết quả", "See Results")}</button></>)}</article></>) : <RS items={tri} onReset={rt} scoreLabel={ts === tfC.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : t("Cố gắng thêm! 💪", "Keep going! 💪")} t={t} />}</div>}
          {gm === "fill" && <div style={{ padding: 24, borderRadius: 10, background: "#f9f9f9", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>{!fc ? (<><div style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>{t("Điền câu trả lời", "Fill in each blank")}</div>{fQ.map((q, qi) => (<div key={q.id} style={{ marginBottom: 24 }}><div style={{ fontSize: 15, color: "#777", marginBottom: 6 }}>{t("Câu", "Q")} {qi + 1}</div><div style={{ fontSize: 16, lineHeight: 1.7, marginBottom: 10 }}>{q.tp}</div><input value={fa[q.id] || ""} onChange={e => setFa(p => ({ ...p, [q.id]: e.target.value }))} placeholder={t("Nhập đáp án...", "Answer...")} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, fontSize: 15, outline: "none", border: "1px solid #ddd", background: "white", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", boxSizing: "border-box" }} /></div>))}<button onClick={() => setFc(true)} style={{ padding: "12px 32px", background: "black", color: "white", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 15, cursor: "pointer" }}>{t("Kiểm tra", "Check Answers")}</button></>) : <RS items={fri} onReset={() => { setFa({}); setFc(false); } } scoreLabel={fs === fQ.length ? t("Xuất sắc! 🎉", "Perfect! 🎉") : fs >= 2 ? t("Tốt lắm! 👍", "Well done! 👍") : t("Cố gắng thêm! 💪", "Keep going! 💪")} t={t} />}</div>}
        </section>

        <hr style={{ width: "5px" }}></hr>
        <div className="reveal" data-reveal style={{ textAlign: "center", color: "#777", fontSize: 15, marginBottom: 60 }}>Toán 10 · Chân Trời Sáng Tạo · {t("Ôn Tập Chương IV", "Chapter IV Review")}</div>
        <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
      
      </div>
    </div>
    <DuoTranslate/> </>
  );
}
