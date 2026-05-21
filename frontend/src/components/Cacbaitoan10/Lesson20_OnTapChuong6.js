
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

export default function OnTapChuong6() {
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
    {q:t("Tam giác đều cạnh a. Bán kính ngoại tiếp R = ?","Equilateral triangle side a. Circumradius R = ?"),o:["a/2","a√3/6","a√3/3","a√3/2"],a:2,ex:t("R = a/(2sin60°) = a/√3 = a√3/3.","R = a√3/3.")},
    {q:t("Diện tích hình thang đáy 6 và 10, cao 4 là?","Trapezoid bases 6 and 10, height 4. Area?"),o:["40","32","64","24"],a:1,ex:t("S=(6+10)·4/2=16·4/2=32.","S=(6+10)·4/2=32.")},
    {q:t("Đường trung tuyến ma² = ?","Median ma² = ?"),o:["(b²+c²−a²)/4","(2b²+2c²−a²)/4","(b+c)²/4","(b²+c²)/2"],a:1,ex:t("Công thức chính xác: ma²=(2b²+2c²−a²)/4.","Exact formula: ma²=(2b²+2c²−a²)/4.")},
    {q:t("Hình vành khăn R=7, r=4. Diện tích S = ?","Annulus R=7, r=4. Area S = ?"),o:["33π","49π","16π","π(7−4)²"],a:0,ex:t("S=π(R²−r²)=π(49−16)=33π.","S=π(49−16)=33π.")},
    {q:t("Bán kính nội tiếp r = S/p. Trong đó p là gì?","Inradius r=S/p. What is p?"),o:[t("Chu vi","Perimeter"),t("Nửa chu vi","Semi-perimeter"),t("Diện tích","Area"),t("Đường kính","Diameter")],a:1,ex:t("p=(a+b+c)/2 là nửa chu vi. r=S/p.","p=(a+b+c)/2 is the semi-perimeter.")},
  ];
  const tfC=[
    {s:t("Tam giác đều có R = 2r.","Equilateral triangle has R = 2r."),a:true,ex:t("ĐÚNG — R=a√3/3, r=a√3/6 → R=2r.","TRUE — R=2r for equilateral triangles.")},
    {s:t("Diện tích hình thoi = d₁·d₂ (không chia 2).","Rhombus area = d₁·d₂ (no halving)."),a:false,ex:t("SAI — S=d₁·d₂/2.","FALSE — S=d₁·d₂/2.")},
    {s:t("Trong tam giác vuông tại C: R = c/2 (nửa cạnh huyền).","Right triangle at C: R = c/2."),a:true,ex:t("ĐÚNG — cạnh huyền là đường kính của đường tròn ngoại tiếp.","TRUE — hypotenuse is the diameter of the circumscribed circle.")},
    {s:t("Công thức Heron: S = √(s(s−a)(s−b)(s−c)) với s=(a+b+c)/2.","Heron: S=√(s(s−a)(s−b)(s−c)), s=(a+b+c)/2."),a:true,ex:t("ĐÚNG — công thức Heron tính diện tích từ 3 cạnh.","TRUE — Heron's formula gives area from 3 sides.")},
    {s:t("Diện tích hình tròn = 2πR.","Circle area = 2πR."),a:false,ex:t("SAI — Diện tích = πR². Chu vi = 2πR.","FALSE — Area = πR². Circumference = 2πR.")},
  ];
  const fQ=[
    {id:"f1",tp:t("Đường cao ha = 2S / ___ (S=diện tích tam giác)","Altitude ha = 2S / ___ (S=area)"),ans:"a",alt:["a"],h:""},
    {id:"f2",tp:t("Diện tích lục giác đều cạnh a: S = 3a² · ___/2","Regular hexagon side a: S = 3a² · ___/2"),ans:"√3",alt:["√3","sqrt(3)","căn 3"],h:"6 tam giác đều"},
    {id:"f3",tp:t("Diện tích hình quạt góc α°, bán kính R: S = πR² · α / ___","Sector angle α°, radius R: S = πR²·α/___"),ans:"360",alt:["360"],h:""},
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

  return (
    <div style={{ width:"100%",background:"#fff",display:"flex",justifyContent:"center" }}>
    <div style={{ width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80 }}>
      <div className="reveal" data-reveal style={{ marginBottom:24 }}><Link href="/Cacbaitoan10" style={{ textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15 }}>← {t("Quay lại","Back")}</Link></div>
      <header className="reveal" data-reveal style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300 }}>
        <div>
          <div style={{ fontWeight:"bold",fontSize:22,color:"#0B4F5C" }}>{t("Chương VI · Hình Học Đo Lường","Chapter VI · Geometry & Measurement")}</div>
          <div style={{ fontSize:28,fontWeight:600,marginTop:4 }}>{t("Ôn Tập Chương VI","Chapter VI Review")}</div>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>setLang("vi")} style={{ background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
          <button onClick={()=>setLang("en")} style={{ background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
        </div>
      </header>

      {/* Quick links */}
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,marginBottom:40,transition:"all 0.3s" }}>
        {[{slug:"hinh-hoc-do-luong-1",num:"20",title:t("Hệ Thức Lượng Trong Tam Giác","Triangle Metric Relations")},{slug:"hinh-hoc-do-luong-2",num:"21",title:t("Diện Tích và Chu Vi","Area and Perimeter")}].map(l=>(
          <Link key={l.slug} href={`/cacbailam10/${l.slug}`} style={{ textDecoration:"none" }}>
            <article style={{ padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",cursor:"pointer" }}>
              <div style={{ fontSize:13,color:"#777",marginBottom:3 }}>{t("Bài","Lesson")} {l.num}</div>
              <div style={{ fontSize:15,fontWeight:600,color:"#0B4F5C" }}>{l.title}</div>
              <div style={{ fontSize:12,color:"#aaa",marginTop:3 }}>← {t("Ôn lại","Review")}</div>
            </article>
          </Link>
        ))}
      </div>

      <div style={{ position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)" }}>
        <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
          {tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{ background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}
        </div>
      </div>

      {/* TÓM TẮT */}
      <section id="tomTat" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📚" title={t("Tóm Tắt Chương VI","Chapter VI Summary")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:22,transition:"all 0.3s" }}>
          {[{title:t("Bài 20 · Hệ Thức Lượng Trong Tam Giác","L20 · Triangle Metric Relations"),pts:[t("R = a/(2sinA) — bán kính ngoại tiếp","R = a/(2sinA) — circumradius"),t("r = S/p — bán kính nội tiếp (p=nửa chu vi)","r = S/p — inradius (p=semi-perimeter)"),t("ma² = (2b²+2c²−a²)/4 — đường trung tuyến","ma²=(2b²+2c²−a²)/4 — median"),t("ha = 2S/a — đường cao","ha=2S/a — altitude"),t("Tam giác đều: R=2r; R=a√3/3; r=a√3/6","Equilateral: R=2r; R=a√3/3")]},
            {title:t("Bài 21 · Diện Tích và Chu Vi","L21 · Area & Perimeter"),pts:[t("Tam giác: S=½·đáy·cao=½ab·sinC=Heron","Triangle: ½·base·height=½ab·sinC=Heron"),t("Hình thang: S=(a+b)·h/2","Trapezoid: S=(a+b)·h/2"),t("Hình thoi: S=d₁·d₂/2","Rhombus: S=d₁·d₂/2"),t("Hình tròn: S=πR², C=2πR","Circle: S=πR², C=2πR"),t("Vành khăn: S=π(R²−r²)","Annulus: S=π(R²−r²)"),t("Lục giác đều: S=3a²√3/2","Regular hexagon: S=3a²√3/2")]}
          ].map((card,i)=>(
            <article key={i} style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:12 }}>{card.title}</div>
              {card.pts.map((pt,j)=><div key={j} style={{ fontSize:13,color:"#555",marginBottom:8,display:"flex",gap:8 }}><span style={{ color:"#0B4F5C",fontWeight:700,flexShrink:0 }}>•</span><span style={{ fontFamily:"monospace" }}>{pt}</span></div>)}
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
            videoId="sZMezOCZr40"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (CC BY-SA)", "Video by Khan Academy (CC BY-SA)")}
          />
        </div>
      </section>

      {/* CÔNG THỨC */}
      <section id="congThuc" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📐" title={t("Bảng Công Thức Chương VI","Chapter VI Formula Sheet")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,transition:"all 0.3s" }}>
          {[{label:t("Đường tròn NT & NTiếp","Circum & Inradius"),formula:"R = a/(2sinA)\nr = S/p\np = (a+b+c)/2\nTam giác vuông: R=c/2, r=(a+b−c)/2\nTam giác đều: R=a√3/3, r=a√3/6"},
            {label:t("Đường trung tuyến & cao","Medians & Altitudes"),formula:"ma² = (2b²+2c²−a²)/4\nha = 2S/a = b·sinC = c·sinB\nTam giác đều: m=h=a√3/2\nTam giác vuông: mc=c/2"},
            {label:t("Diện tích đa giác","Polygon Areas"),formula:"Tam giác: ½·b·h; ½ab·sinC; Heron\nHình vuông: a²\nHình chữ nhật: a·b\nHình bình hành: đáy·cao\nHình thoi: d₁·d₂/2\nHình thang: (a+b)·h/2"},
            {label:t("Hình tròn & liên quan","Circles & Related"),formula:"S_tròn = πR²\nC = 2πR\nS_quạt = πR²·α/360°\nℓ_cung = 2πR·α/360°\nS_vành_khăn = π(R²−r²)\nS_lục_giác_đều = 3a²√3/2"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:14,fontWeight:700,color:"#0B4F5C",marginBottom:10 }}>{card.label}</div>
              <div style={{ fontFamily:"monospace",fontSize:12,background:"white",padding:"10px 12px",borderRadius:8,lineHeight:1.9,whiteSpace:"pre-wrap" }}>{card.formula}</div>
            </article>
          ))}
        </div>
      </section>

      {/* BÀI TẬP TỔNG HỢP */}
      <section id="baiTap" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Bài Tập Tổng Hợp","Mixed Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s" }}>
          {[
            {id:"e1",badge:"L20",q:t("Tam giác ABC có a=7, b=8, c=9.\n(a) Tính diện tích S (Heron).\n(b) Tính r và R.","Triangle a=7, b=8, c=9.\n(a) Area S (Heron).\n(b) Inradius r and circumradius R."),
             a:[t("p=(7+8+9)/2=12","p=12"),t("S=√(12·5·4·3)=√720=12√5≈26.83","S=12√5"),t("r=S/p=12√5/12=√5≈2.24","r=√5"),t("cosA=(b²+c²−a²)/(2bc)=(64+81−49)/144=96/144=2/3","cosA=2/3"),t("sinA=√(1−4/9)=√5/3","sinA=√5/3"),t("R=a/(2sinA)=7/(2·√5/3)=21/(2√5)=21√5/10≈4.70","R=21√5/10≈4.70")]},
            {id:"e2",badge:"L21",q:t("Một sân chơi có hình chữ nhật 20m×15m. Trong sân có một bể bơi hình tròn bán kính 5m. Tính:\n(a) Diện tích phần sân (không tính bể).\n(b) Chu vi bể bơi.","Playground 20m×15m rectangle. Inside: circular pool radius 5m.\n(a) Area of playground (excluding pool).\n(b) Pool circumference."),
             a:[t("(a) S_sân=20×15=300 m²","S_rect=300"),t("S_bể=π×25=25π≈78.54 m²","S_pool=25π"),t("S_phần_sân=300−25π≈221.46 m²","S_playground=300−25π≈221.46"),t("(b) C=2π×5=10π≈31.42 m","C=10π≈31.42")]},
            {id:"e3",badge:t("Tổng hợp","Mixed"),q:t("Tam giác đều cạnh a=6.\n(a) Tính R, r, h, và diện tích S.\n(b) Diện tích phần nằm trong đường tròn ngoại tiếp nhưng ngoài tam giác.","Equilateral triangle, side 6.\n(a) Find R, r, h, S.\n(b) Area inside circumscribed circle but outside triangle."),
             a:[t("h=6√3/2=3√3; R=6√3/3=2√3; r=6√3/6=√3","h=3√3, R=2√3, r=√3"),t("S_tam_giác=(√3/4)·36=9√3≈15.59","S_triangle=9√3"),t("S_ngoại_tiếp=π·(2√3)²=12π≈37.70","S_circumcircle=12π"),t("S_phần_ngoài=12π−9√3≈22.11","S_outside=12π−9√3≈22.11")]},
          ].map(({id,q,a,badge})=>(
            <article key={id}>
              <div style={{ padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
                  <div style={{ fontSize:17,fontWeight:600 }}>📝 {t("Bài tập","Exercise")}</div>
                  <span style={{ background:"black",color:"white",fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20 }}>{badge}</span>
                </div>
                <div style={{ fontSize:15,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{q}</div>
              </div>
              <button onClick={()=>tr(id)} style={{ display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left" }}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>
              {rev[id]&&<div style={{ padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px" }}>{a.map((l,i)=><div key={i} style={{ fontSize:15,color:"#555",marginBottom:6 }}>{l}</div>)}</div>}
            </article>
          ))}
        </div>
      </section>

      {/* MINI GAME */}
      <section id="miniGame" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="🎮" title={t("Mini Game · Ôn Tập Chương VI","Mini Game · Chapter VI Review")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:24,marginBottom:32,transition:"all 0.3s" }}>
          {[["mc","🧩",t("Trắc Nghiệm","Multiple Choice"),t("5 câu","5 Q")],["tf","🃏",t("Đúng / Sai","True / False"),t("5 thẻ","5 cards")],["fill","✍️",t("Điền Chỗ Trống","Fill in Blank"),t("3 câu","3 items")]].map(([mode,icon,label,sub])=>(
            <article key={mode} onClick={()=>setGm(mode)} style={{ background:gm===mode?"black":"#f9f9f9",color:gm===mode?"white":"black",cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:20,borderRadius:10 }}>
              <div style={{ fontSize:28,marginBottom:6 }}>{icon}</div><div style={{ fontSize:18,fontWeight:600 }}>{label}</div><div style={{ fontSize:14,opacity:0.7 }}>{sub}</div>
            </article>
          ))}
        </div>
        {gm==="mc"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!md?(<><div style={{ color:"#777",fontSize:15,marginBottom:8 }}>{t("Câu","Q")} {mi+1}/{mcQ.length} · {t("Điểm:","Score:")} {msc}</div><div style={{ fontSize:20,fontWeight:600,marginBottom:20 }}>{mcQ[mi].q}</div><div style={{ display:"flex",flexDirection:"column",gap:12 }}>{mcQ[mi].o.map((opt,i)=>{let bg="white",co="black";if(ms!==null){if(i===mcQ[mi].a){bg="#eafaf1";co="#1e8449";}else if(i===ms){bg="#fdf2f2";co="#922b21";}}return <button key={i} onClick={()=>sel(i)} style={{ textAlign:"left",padding:"14px 18px",borderRadius:10,border:"none",background:bg,color:co,fontSize:15,fontWeight:ms!==null&&(i===ms||i===mcQ[mi].a)?600:400,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{String.fromCharCode(65+i)}. {opt}</button>;})}</div>{ms!==null&&<><div style={{marginTop:16,padding:"12px 16px",background:"white",borderRadius:8,fontSize:15,color:"#555",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {mcQ[mi].ex}</div><button onClick={nx} style={{marginTop:14,padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{mi+1<mcQ.length?t("Câu tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>}</>):<RS items={mri} onReset={rm} scoreLabel={msc===mcQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):msc>=3?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
        {gm==="tf"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!td?(<><div style={{ color:"#777",fontSize:15,marginBottom:14 }}>{t("Thẻ","Card")} {ti+1}/{tfC.length} · {t("Điểm:","Score:")} {ts}</div><article style={{ background:"white",borderRadius:10,padding:24,marginBottom:20,textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}><div style={{ fontSize:18,lineHeight:1.7,marginBottom:24 }}>{tfC[ti].s}</div>{!tf?(<div style={{ display:"flex",gap:16,justifyContent:"center" }}><button onClick={()=>ta(true)} style={{ padding:"12px 36px",background:"#eafaf1",color:"#1e8449",border:"2px solid #1e8449",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer" }}>✅ {t("ĐÚNG","TRUE")}</button><button onClick={()=>ta(false)} style={{ padding:"12px 36px",background:"#fdf2f2",color:"#922b21",border:"2px solid #922b21",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer" }}>❌ {t("SAI","FALSE")}</button></div>):(<><div style={{padding:"12px 16px",background:"#f9f9f9",borderRadius:8,fontSize:15,color:"#555",textAlign:"left",marginBottom:14,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {tfC[ti].ex}</div><button onClick={tn} style={{padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{ti+1<tfC.length?t("Thẻ tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>)}</article></>):<RS items={tri} onReset={rt} scoreLabel={ts===tfC.length?t("Xuất sắc! 🎉","Perfect! 🎉"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
        {gm==="fill"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!fc?(<><div style={{ fontSize:18,fontWeight:600,marginBottom:20 }}>{t("Điền câu trả lời","Fill in each blank")}</div>{fQ.map((q,qi)=>(<div key={q.id} style={{ marginBottom:24 }}><div style={{ fontSize:15,color:"#777",marginBottom:6 }}>{t("Câu","Q")} {qi+1}</div><div style={{ fontSize:16,lineHeight:1.7,marginBottom:10 }}>{q.tp}</div><input value={fa[q.id]||""} onChange={e=>setFa(p=>({...p,[q.id]:e.target.value}))} placeholder={t("Nhập đáp án...","Answer...")} style={{ width:"100%",padding:"12px 16px",borderRadius:8,fontSize:15,outline:"none",border:"1px solid #ddd",background:"white",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",boxSizing:"border-box" }} /></div>))}<button onClick={()=>setFc(true)} style={{ padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer" }}>{t("Kiểm tra","Check Answers")}</button></>):<RS items={fri} onReset={()=>{setFa({});setFc(false);}} scoreLabel={fs===fQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):fs>=2?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
      </section>

      <hr style={{ width:"5px" }}></hr>
      <div className="reveal" data-reveal style={{ textAlign:"center",color:"#777",fontSize:15,marginBottom:60 }}>Toán 10 · Chân Trời Sáng Tạo · {t("Ôn Tập Chương VI","Chapter VI Review")}</div>
      <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
    <DuoTranslate/> 
    </div></div>
  );
}
