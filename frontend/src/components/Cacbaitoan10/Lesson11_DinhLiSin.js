
"use client";
import { useEffect, useState } from "react";
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

export default function Lesson11_DinhLiSin() {
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
      start: 0, end: 6,
      words: [
        { text: "The", vi: "Định lí" },
        { text: "law", vi: "định lí" },
        { text: "of", vi: "về" },
        { text: "cosines", vi: "cosin", detail: "<b>Law of cosines (Định lí côsin)</b>:<br/>Trong tam giác: a² = b² + c² - 2bc.cos(A).", detailTitle: "Law of cosines" },
        { text: "and", vi: "và" },
        { text: "law", vi: "định lí" },
        { text: "of", vi: "về" },
        { text: "sines", vi: "sin", detail: "<b>Law of sines (Định lí sin)</b>:<br/>Trong tam giác: a/sin(A) = b/sin(B) = c/sin(C) = 2R.", detailTitle: "Law of sines" },
        { text: "relate", vi: "liên hệ" },
        { text: "sides", vi: "các cạnh" },
        { text: "and", vi: "và" },
        { text: "angles.", vi: "các góc." }
      ]
    },
    {
      start: 6, end: 12,
      words: [
        { text: "We", vi: "Chúng ta" },
        { text: "calculate", vi: "tính toán" },
        { text: "circumradius,", vi: "bán kính đường tròn ngoại tiếp,", detail: "<b>Circumradius (Bán kính ngoại tiếp - R)</b>:<br/>Bán kính của đường tròn đi qua cả ba đỉnh của tam giác.", detailTitle: "Circumradius" },
        { text: "inradius,", vi: "bán kính đường tròn nội tiếp,", detail: "<b>Inradius (Bán kính nội tiếp - r)</b>:<br/>Bán kính của đường tròn tiếp xúc với cả ba cạnh của tam giác.", detailTitle: "Inradius" },
        { text: "and", vi: "và" },
        { text: "area.", vi: "diện tích.", detail: "<b>Area (Diện tích)</b>: Số đo độ lớn bề mặt của hình tam giác.", detailTitle: "Area (Diện tích)" }
      ]
    },
    {
      start: 12, end: 18,
      words: [
        { text: "Use", vi: "Sử dụng" },
        { text: "Heron's", vi: "Heron" },
        { text: "formula", vi: "công thức,", detail: "<b>Heron's formula (Công thức Heron)</b>:<br/>Công thức tính diện tích tam giác: S = √[p(p-a)(p-b)(p-c)].", detailTitle: "Heron's formula" },
        { text: "with", vi: "với" },
        { text: "the", vi: "nửa chu vi" },
        { text: "semi-perimeter.", vi: "nửa chu vi.", detail: "<b>Semi-perimeter (Nửa chu vi - p)</b>:<br/>Bằng một nửa chu vi tam giác: p = (a + b + c)/2.", detailTitle: "Semi-perimeter" }
      ]
    }
  ];


  const sc=(id)=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});};
  const tr=(id)=>setRev(p=>({...p,[id]:!p[id]}));

  const mcQ=[
    {q:t("Định lí Sin: a/sinA = ?","Law of Sines: a/sinA = ?"),o:["b·sinB","b/sinB","2R","b/sinB = c/sinC = 2R"],a:3,ex:t("a/sinA = b/sinB = c/sinC = 2R, với R là bán kính đường tròn ngoại tiếp.","a/sinA = b/sinB = c/sinC = 2R, where R is the circumradius.")},
    {q:t("Tam giác: A=30°, a=5. Tính R.","Triangle: A=30°, a=5. Find R."),o:["5","10","5/2","2.5"],a:0,ex:t("R=a/(2sinA)=5/(2·sin30°)=5/(2·0.5)=5.","R=5/(2·0.5)=5.")},
    {q:t("Nên dùng Định lí Sin khi biết?","Use the Law of Sines when you know?"),o:[t("3 cạnh","3 sides"),t("2 cạnh + góc xen giữa","2 sides + included angle"),t("2 góc + 1 cạnh bất kỳ","2 angles + any 1 side"),t("chỉ 1 góc","only 1 angle")],a:2,ex:t("AAS hoặc ASA → 2 góc + 1 cạnh → dùng Định lí Sin.","AAS or ASA → 2 angles + 1 side → use Law of Sines.")},
    {q:t("Tam giác đều cạnh a. Tính R.","Equilateral triangle side a. Find R."),o:["a","a√3/3","a/2","a/√3"],a:3,ex:t("R=a/(2sin60°)=a/(2·√3/2)=a/√3=a√3/3≈0.577a.","R=a/√3=a√3/3.")},
    {q:t("a/sinA = b/sinB. Nếu a=b thì?","If a=b in a/sinA=b/sinB, then?"),o:["sinA>sinB","sinA<sinB","sinA=sinB (A=B)","A+B=90°"],a:2,ex:t("a=b → sinA=sinB → trong tam giác (góc 0°–180°) → A=B.","a=b → sinA=sinB → A=B (in a triangle).")},
  ];
  const tfC=[
    {s:t("Định lí Sin: a/sinA = b/sinB = c/sinC = 2R.","Law of Sines: a/sinA = b/sinB = c/sinC = 2R."),a:true,ex:t("ĐÚNG — đây là phát biểu chuẩn với R là bán kính đường tròn ngoại tiếp.","TRUE — standard statement with R = circumradius.")},
    {s:t("Định lí Sin chỉ đúng với tam giác vuông.","The Law of Sines only holds for right triangles."),a:false,ex:t("SAI — Định lí Sin đúng với MỌI tam giác.","FALSE — it holds for ALL triangles.")},
    {s:t("Từ 2 góc và 1 cạnh ta giải được hoàn toàn tam giác bằng Định lí Sin.","2 angles + 1 side is enough to fully solve a triangle using the Law of Sines."),a:true,ex:t("ĐÚNG — tính góc thứ 3 (tổng 3 góc=180°), rồi dùng Định lí Sin tính 2 cạnh còn lại.","TRUE — find 3rd angle (sum=180°), then use Law of Sines for the other 2 sides.")},
    {s:t("Trong tam giác đều cạnh a: R = a.","Equilateral triangle side a: R = a."),a:false,ex:t("SAI — R=a/√3=a√3/3≈0.577a, không phải a.","FALSE — R=a√3/3≠a.")},
    {s:t("Định lí Sin cho phép tính bán kính đường tròn ngoại tiếp.","The Law of Sines allows computing the circumradius."),a:true,ex:t("ĐÚNG — R=a/(2sinA)=b/(2sinB)=c/(2sinC).","TRUE — R=a/(2sinA).")},
  ];
  const fQ=[
    {id:"f1",tp:t("a / sinA = b / sinB = c / sinC = ___","a / sinA = b / sinB = c / sinC = ___"),ans:"2R",alt:["2r","2R"],h:""},
    {id:"f2",tp:t("R = a / (2 · ___)","R = a / (2 · ___)"),ans:"sinA",alt:["sina","sin A","sin(A)","sinA"],h:""},
    {id:"f3",tp:t("Dùng Định lí Sin khi biết ___ góc và 1 cạnh.","Use Law of Sines when you know ___ angles and 1 side."),ans:"2",alt:["2","hai","two"],h:""},
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

  const tabs=[["w","🚀",t("Khởi động","Warm-Up")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. Định Lí Sin","1. The Law")],["k2","📖",t("2. Bán Kính R","2. Circumradius R")],["k3","📖",t("3. Khi Nào Dùng?","3. When to Use?")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮","Mini Game"]];

  return (
    <div style={{ width:"100%",background:"#fff",display:"flex",justifyContent:"center" }}>
    <div style={{ width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80 }}>

      <div className="reveal" data-reveal style={{ marginBottom:24 }}>
        <Link href="/Cacbaitoan10" style={{ textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15 }}>← {t("Quay lại","Back")}</Link>
      </div>

      <header className="reveal" data-reveal style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300 }}>
        <div>
          <div style={{ fontWeight:"bold",fontSize:22,color:"#0B4F5C" }}>{t("Chương IV · Hệ Thức Lượng Trong Tam Giác","Chapter IV · Triangle Trigonometry")}</div>
          <div style={{ fontSize:28,fontWeight:600,marginTop:4 }}>{t("Bài 11: Định Lí Sin","Lesson 11: Law of Sines")}</div>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>setLang("vi")} style={{ background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
          <button onClick={()=>setLang("en")} style={{ background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
        </div>
      </header>

      <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:18,fontWeight:600,marginBottom:14 }}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
        {[t("Phát biểu Định lí Sin với bán kính ngoại tiếp R.","State the Law of Sines with circumradius R."),t("Tính cạnh khi biết 2 góc và 1 cạnh (AAS/ASA).","Find a side given 2 angles and 1 side (AAS/ASA)."),t("Tính bán kính đường tròn ngoại tiếp R.","Compute circumradius R."),t("Biết khi nào dùng Định lí Sin, khi nào dùng Côsin.","Know when to use Law of Sines vs. Law of Cosines."),t("Giải tam giác thực tế.","Solve real-world triangle problems.")
        ].map((o,i)=><div key={i} style={{ fontSize:15,color:"#555",marginBottom:6 }}>• {o}</div>)}
      </div>

      <div style={{ position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)" }}>
        <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
          {tabs.map(([id,icon,label])=>(
            <button key={id} onClick={()=>sc(id)} style={{ background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s" }}
              onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>
          ))}
        </div>
      </div>

      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize:16,lineHeight:1.8,marginBottom:16 }}>{t("Để đo khoảng cách giữa hai điểm không thể tiếp cận trực tiếp (ví dụ: hai bờ sông), người ta đặt một điểm đo thứ ba rồi dùng các góc đo được. Định lí Sin kết nối cạnh và góc đối diện — rất mạnh khi đã biết 2 góc!","To measure the distance between two inaccessible points (e.g. two riverbanks), a third measurement point is set up and angles are measured. The Law of Sines connects each side with its opposite angle — very powerful when 2 angles are known!")}</div>
          <div style={{ fontSize:16 }}>❓ <em>{t("Nếu biết 2 góc của tam giác, ta có thể tìm góc thứ 3 không?","If you know 2 angles of a triangle, can you always find the third?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="VjmFKle7xIw"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (CC BY-NC-SA)", "Video by Khan Academy (CC BY-NC-SA)")}
          />
        </div>
      </section>

      {/* 1. ĐỊNH LÍ SIN */}
      <section id="k1" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("1. Phát Biểu Định Lí Sin","1. Statement of the Law of Sines")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:12 }}>📌 {t("Định lí","Theorem")}</div>
          <div style={{ fontSize:15,lineHeight:1.8,marginBottom:16 }}>{t("Trong tam giác ABC với R là bán kính đường tròn ngoại tiếp:","In triangle ABC with R = circumradius:")}</div>
          <div style={{ background:"white",borderRadius:10,padding:"20px 24px",textAlign:"center" }}>
            <div style={{ fontFamily:"monospace",fontSize:22,color:"#0B4F5C",fontWeight:700,letterSpacing:2 }}>
              a / sinA = b / sinB = c / sinC = 2R
            </div>
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{title:t("Cạnh lớn hơn","Larger side"),note:t("đối diện với góc lớn hơn","opposite the larger angle"),bg:"#eaf4fb",c:"#1a5276"},
            {title:t("Cạnh bằng nhau","Equal sides"),note:t("khi và chỉ khi góc đối diện bằng nhau","iff opposite angles are equal"),bg:"#eafaf1",c:"#1e8449"},
            {title:t("Cạnh lớn nhất","Largest side"),note:t("đối diện với góc lớn nhất","opposite the largest angle"),bg:"#fff3cd",c:"#856404"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:15,fontWeight:700,color:card.c,marginBottom:6 }}>{card.title}</div>
              <div style={{ background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8,fontSize:14 }}>{card.note}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. BÁN KÍNH R */}
      <section id="k2" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("2. Bán Kính Đường Tròn Ngoại Tiếp R","2. Circumradius R")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontFamily:"monospace",fontSize:16,background:"white",padding:"14px 18px",borderRadius:8,lineHeight:2.2 }}>
            R = a / (2·sinA) = b / (2·sinB) = c / (2·sinC)
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{shape:t("Tam giác đều cạnh a","Equilateral, side a"),formula:"R = a / √3 = a√3/3"},
            {shape:t("Tam giác vuông (C=90°)","Right triangle (C=90°)"),formula:"R = c / 2 (nửa cạnh huyền)"},
            {shape:t("Tam giác cân b=c","Isosceles b=c"),formula:"R = b / (2·sinB)"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:14,color:"#777",marginBottom:6 }}>{card.shape}</div>
              <div style={{ fontFamily:"monospace",fontSize:15,fontWeight:600,color:"#0B4F5C" }}>{card.formula}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. KHI NÀO DÙNG */}
      <section id="k3" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("3. Khi Nào Dùng Định Lí Nào?","3. Law of Sines vs. Cosines")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="100" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,transition:"all 0.3s" }}>
          {[{title:t("✅ Dùng Định Lí SIN","✅ Use Law of SINES"),items:[t("Biết 2 góc + 1 cạnh bất kỳ (AAS)","2 angles + any 1 side (AAS)"),t("Biết 1 góc và cạnh đối diện + thêm 1 góc (ASA)","1 angle + opposite side + 1 more angle (ASA)"),t("Tính bán kính ngoại tiếp R","Computing circumradius R")],bg:"#eafaf1",c:"#1e8449"},
            {title:t("✅ Dùng Định Lí CÔSIN","✅ Use Law of COSINES"),items:[t("Biết 3 cạnh → tìm góc (SSS)","3 sides → find angles (SSS)"),t("Biết 2 cạnh + góc xen giữa (SAS)","2 sides + included angle (SAS)"),t("Kiểm tra loại tam giác (nhọn/tù/vuông)","Check triangle type (acute/obtuse/right)")],bg:"#eaf4fb",c:"#1a5276"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:15,fontWeight:700,color:card.c,marginBottom:10 }}>{card.title}</div>
              {card.items.map((item,j)=><div key={j} style={{ background:card.bg,color:card.c,padding:"7px 12px",borderRadius:6,fontSize:14,marginBottom:6 }}>• {item}</div>)}
            </article>
          ))}
        </div>
      </section>

      {/* THỰC HÀNH */}
      <section id="th" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:40,transition:"all 0.3s" }}>
          {[
            {id:"e1",q:t("Tam giác ABC: A=45°, B=60°, a=8. Tính b và R.","Triangle ABC: A=45°, B=60°, a=8. Find b and R."),
             a:[t("C=180°−45°−60°=75°","C=75°"),t("b=a·sinB/sinA=8·sin60°/sin45°=8·(√3/2)/(√2/2)=8√6/2=4√6≈9.8","b=4√6≈9.8"),t("R=a/(2sinA)=8/(2·sin45°)=8/√2=4√2≈5.66","R=4√2≈5.66")]},
            {id:"e2",q:t("Tam giác đều cạnh a=6. Tính R.","Equilateral triangle, side=6. Find R."),
             a:[t("Mọi góc=60°. R=a/(2sin60°)=6/(2·√3/2)=6/√3=2√3≈3.46","All angles=60°. R=6/√3=2√3≈3.46")]},
            {id:"e3",q:t("Tam giác ABC: A=30°, a=5, b=8. Tính sinB.","Triangle: A=30°, a=5, b=8. Find sinB."),
             a:[t("sinB/b=sinA/a → sinB=b·sinA/a=8·(1/2)/5=4/5","sinB=b·sinA/a=8·(1/2)/5=4/5"),t("B=arcsin(4/5)≈53.13° hoặc B'≈126.87°","B≈53.13° or B'≈126.87°")]},
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
      <section id="mg" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="🎮" title="Mini Game" />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:24,marginBottom:32,transition:"all 0.3s" }}>
          {[["mc","🧩",t("Trắc Nghiệm","Multiple Choice"),t("5 câu","5 questions")],["tf","🃏",t("Đúng / Sai","True / False"),t("5 thẻ","5 cards")],["fill","✍️",t("Điền Chỗ Trống","Fill in Blank"),t("3 câu","3 items")]].map(([mode,icon,label,sub])=>(
            <article key={mode} onClick={()=>setGm(mode)} style={{ background:gm===mode?"black":"#f9f9f9",color:gm===mode?"white":"black",cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:20,borderRadius:10 }}>
              <div style={{ fontSize:28,marginBottom:6 }}>{icon}</div>
              <div style={{ fontSize:18,fontWeight:600 }}>{label}</div>
              <div style={{ fontSize:14,opacity:0.7 }}>{sub}</div>
            </article>
          ))}
        </div>
        {gm==="mc"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!md?(<><div style={{ color:"#777",fontSize:15,marginBottom:8 }}>{t("Câu","Q")} {mi+1}/{mcQ.length} · {t("Điểm:","Score:")} {msc}</div><div style={{ fontSize:20,fontWeight:600,marginBottom:20 }}>{mcQ[mi].q}</div><div style={{ display:"flex",flexDirection:"column",gap:12 }}>{mcQ[mi].o.map((opt,i)=>{let bg="white",co="black";if(ms!==null){if(i===mcQ[mi].a){bg="#eafaf1";co="#1e8449";}else if(i===ms){bg="#fdf2f2";co="#922b21";}}return <button key={i} onClick={()=>sel(i)} style={{ textAlign:"left",padding:"14px 18px",borderRadius:10,border:"none",background:bg,color:co,fontSize:15,fontWeight:ms!==null&&(i===ms||i===mcQ[mi].a)?600:400,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s" }}>{String.fromCharCode(65+i)}. {opt}</button>;})}</div>{ms!==null&&<><div style={{marginTop:16,padding:"12px 16px",background:"white",borderRadius:8,fontSize:15,color:"#555",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {mcQ[mi].ex}</div><button onClick={nx} style={{marginTop:14,padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{mi+1<mcQ.length?t("Câu tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>}</>):<RS items={mri} onReset={rm} scoreLabel={msc===mcQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):msc>=3?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
        {gm==="tf"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!td?(<><div style={{ color:"#777",fontSize:15,marginBottom:14 }}>{t("Thẻ","Card")} {ti+1}/{tfC.length} · {t("Điểm:","Score:")} {ts}</div><article style={{ background:"white",borderRadius:10,padding:24,marginBottom:20,textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}><div style={{ fontSize:18,lineHeight:1.7,marginBottom:24 }}>{tfC[ti].s}</div>{!tf?(<div style={{ display:"flex",gap:16,justifyContent:"center" }}><button onClick={()=>ta(true)} style={{ padding:"12px 36px",background:"#eafaf1",color:"#1e8449",border:"2px solid #1e8449",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer" }}>✅ {t("ĐÚNG","TRUE")}</button><button onClick={()=>ta(false)} style={{ padding:"12px 36px",background:"#fdf2f2",color:"#922b21",border:"2px solid #922b21",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer" }}>❌ {t("SAI","FALSE")}</button></div>):(<><div style={{padding:"12px 16px",background:"#f9f9f9",borderRadius:8,fontSize:15,color:"#555",textAlign:"left",marginBottom:14,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {tfC[ti].ex}</div><button onClick={tn} style={{padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{ti+1<tfC.length?t("Thẻ tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>)}</article></>):<RS items={tri} onReset={rt} scoreLabel={ts===tfC.length?t("Xuất sắc! 🎉","Perfect! 🎉"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
        {gm==="fill"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!fc?(<><div style={{ fontSize:18,fontWeight:600,marginBottom:20 }}>{t("Điền câu trả lời","Fill in the blanks")}</div>{fQ.map((q,qi)=>(<div key={q.id} style={{ marginBottom:24 }}><div style={{ fontSize:15,color:"#777",marginBottom:6 }}>{t("Câu","Q")} {qi+1}</div><div style={{ fontSize:16,lineHeight:1.7,marginBottom:10 }}>{q.tp}</div><input value={fa[q.id]||""} onChange={e=>setFa(p=>({...p,[q.id]:e.target.value}))} placeholder={t("Nhập đáp án...","Answer...")} style={{ width:"100%",padding:"12px 16px",borderRadius:8,fontSize:15,outline:"none",border:"1px solid #ddd",background:"white",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",boxSizing:"border-box" }} /></div>))}<button onClick={()=>setFc(true)} style={{ padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer" }}>{t("Kiểm tra","Check Answers")}</button></>):<RS items={fri} onReset={()=>{setFa({});setFc(false);}} scoreLabel={fs===fQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):fs>=2?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
      </section>

      <hr style={{ width:"5px" }}></hr>
      <div className="reveal" data-reveal style={{ textAlign:"center",color:"#777",fontSize:15,marginBottom:60 }}>Toán 10 · Chân Trời Sáng Tạo · {t("Bài 11 / Chương IV","Lesson 11 / Chapter IV")}</div>
      <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
    <DuoTranslate/>
    </div></div>
  );
}
