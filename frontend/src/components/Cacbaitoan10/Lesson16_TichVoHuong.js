
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);

export default function Lesson16_TichVoHuong() {
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
        { text: "A", vi: "Một" },
        { text: "vector", vi: "vecto,", detail: "<b>Vector (Vectơ)</b>:<br/>Một đoạn thẳng có hướng, tức là có điểm đầu và điểm cuối xác định.", detailTitle: "Vector (Vectơ)" },
        { text: "has", vi: "có" },
        { text: "both", vi: "cả" },
        { text: "magnitude", vi: "độ dài", detail: "<b>Magnitude (Độ dài vectơ)</b>:<br/>Khoảng cách giữa điểm đầu và điểm cuối của vectơ đó.", detailTitle: "Magnitude (Độ dài)" },
        { text: "and", vi: "và" },
        { text: "direction.", vi: "hướng.", detail: "<b>Direction (Hướng / Phương chiều)</b>: Phương đường thẳng chứa vectơ và chiều từ điểm đầu đến điểm cuối.", detailTitle: "Direction (Hướng)" }
      ]
    },
    {
      start: 6, end: 12,
      words: [
        { text: "Vector", vi: "Vectơ" },
        { text: "addition", vi: "phép cộng,", detail: "<b>Vector addition (Cộng vectơ)</b>:<br/>Phép toán cộng hai vectơ theo quy tắc ba điểm hoặc quy tắc hình bình hành.", detailTitle: "Vector addition" },
        { text: "gives", vi: "cho ra" },
        { text: "a", vi: "một" },
        { text: "resultant", vi: "tổng hợp" },
        { text: "vector.", vi: "vecto tổng.", detail: "<b>Resultant vector (Vectơ tổng)</b>: Vectơ kết quả thu được từ phép cộng các vectơ thành phần.", detailTitle: "Resultant vector" }
      ]
    },
    {
      start: 12, end: 20,
      words: [
        { text: "Scalar", vi: "Vô hướng" },
        { text: "multiplication", vi: "phép nhân,", detail: "<b>Scalar multiplication (Nhân vectơ với một số)</b>:<br/>Phép toán nhân số k với vectơ a để được vectơ mới.", detailTitle: "Scalar multiplication" },
        { text: "and", vi: "và" },
        { text: "dot", vi: "tích" },
        { text: "product", vi: "vô hướng,", detail: "<b>Dot product (Tích vô hướng)</b>:<br/>Tích của độ dài hai vectơ với cosin của góc giữa chúng: a.b = |a|.|b|.cos(a,b).", detailTitle: "Dot product" },
        { text: "of", vi: "của" },
        { text: "orthogonal", vi: "vuông góc,", detail: "<b>Orthogonal (Vuông góc / Trực giao)</b>: Hai vectơ vuông góc khi và chỉ khi tích vô hướng của chúng bằng 0.", detailTitle: "Orthogonal (Vuông góc)" },
        { text: "vectors.", vi: "các vectơ." }
      ]
    }
  ];


  const sc=(id)=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});};
  const tr=(id)=>setRev(p=>({...p,[id]:!p[id]}));
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
  const mcQ=[{'q': '→a·→b = ?', 'o': ['→a×→b', '→a+→b', '|→a|·|→b|·cosφ', '|→a|·|→b|·sinφ'], 'a': 2, 'ex': '→a·→b=|→a|·|→b|·cosφ, với φ là góc giữa hai vectơ.'}, {'q': '→a ⊥ →b ⟺ ?', 'o': ['→a·→b=1', '→a·→b=0', '→a·→b=|→a|', '→a=→b'], 'a': 1, 'ex': 'Vuông góc ⟺ cosφ=cos90°=0 ⟺ →a·→b=0.'}, {'q': '→a=(3,4). |→a| = ?', 'o': ['7', '1', '5', '√7'], 'a': 2, 'ex': '|→a|=√(3²+4²)=√(9+16)=√25=5.'}, {'q': '→a=(1,0), →b=(0,1). →a·→b = ?', 'o': ['1', '0', '-1', '2'], 'a': 1, 'ex': '→a·→b=1·0+0·1=0 → vuông góc.'}, {'q': 'cosφ=(→a·→b)/(|→a|·|→b|). Nếu →a·→b<0 thì φ ∈ ?', 'o': ['(0°,90°)', 'φ=90°', '(90°,180°)', 'φ=180°'], 'a': 2, 'ex': '→a·→b<0 → cosφ<0 → φ ∈ (90°,180°) → góc tù.'}];
  const tfC=[{'s': 'Tích vô hướng →a·→b là một số thực.', 'a': true, 'ex': 'ĐÚNG — kết quả là SCALAR (số thực), không phải vectơ.'}, {'s': '→a·→b = →b·→a (giao hoán).', 'a': true, 'ex': 'ĐÚNG — tích vô hướng giao hoán.'}, {'s': '→a·→a = |→a|.', 'a': false, 'ex': 'SAI — →a·→a = |→a|² (bình phương độ dài, không phải độ dài).'}, {'s': '→a ⊥ →b ⟺ →a·→b = 0.', 'a': true, 'ex': 'ĐÚNG — vuông góc ⟺ cosφ=0 ⟺ →a·→b=0.'}, {'s': 'Nếu →a·→b > 0 thì góc φ là góc nhọn.', 'a': true, 'ex': 'ĐÚNG — →a·→b>0 ⟺ cosφ>0 ⟺ 0°<φ<90° (góc nhọn).'}];
  const fQ=[{'id': 'f1', 'tp': '→a=(3,4). →a·→a = ___.', 'ans': '25', 'alt': ['25'], 'h': '|→a|²=9+16=25'}, {'id': 'f2', 'tp': '→a ⊥ →b ⟺ →a · →b = ___', 'ans': '0', 'alt': ['0'], 'h': ''}, {'id': 'f3', 'tp': '→a=(1,2), →b=(4,−2). →a·→b = ___.', 'ans': '0', 'alt': ['0'], 'h': '1×4+2×(−2)=4−4=0'}];
  const tabs=[["w","🚀",t("Khởi động","Warm-Up")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. Định Nghĩa","1. Definition")],["k2","📖",t("2. Tính Chất","2. Properties")],["k3","📖",t("3. Theo Toạ Độ","3. Coordinates")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮",t("Mini Game","Mini Game")]];

  return (
    <div style={{width:"100%",background:"#fff",display:"flex",justifyContent:"center"}}>
    <div style={{width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80}}>
      <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/Cacbaitoan10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
      <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
        <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương V · Vectơ</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Bài 16: Tích Vô Hướng</div></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 Tiếng Việt</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 English</button></div>
      </header>
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
        {[
          t("Định nghĩa tích vô hướng →a·→b = |→a||→b|cosφ.","Define dot product →a·→b=|→a||→b|cosφ."),
          t("Nhận biết kết quả là số thực (scalar).","Recognize the result is a real number (scalar)."),
          t("Áp dụng: kiểm tra vuông góc (→a·→b=0), tính góc.","Apply: check perpendicularity (→a·→b=0), compute angles."),
          t("Tính tích vô hướng theo tọa độ: →a·→b=x₁x₂+y₁y₂.","Compute dot product via coordinates: x₁x₂+y₁y₂."),
          t("Tính độ dài vectơ: |→a|=√(→a·→a).","Compute vector length: |→a|=√(→a·→a)."),
        ].map((item, idx) => (
          <div key={idx} style={{fontSize:15,color:"#555",marginBottom:6}}>{item}</div>
        ))}
      </div>
      <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

      <section id="w" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Trong vật lý, công của một lực F dọc theo đường dịch chuyển d là: W = F·d·cosθ. Đây chính là tích vô hướng của hai vectơ! Nếu lực vuông góc với chuyển vị thì cosθ=0 → W=0 (không sinh công).","In physics, work done by force F over displacement d is W=F·d·cosθ. This IS the dot product! If force is perpendicular to displacement, cosθ=0 → W=0 (no work done).")}</div>
          <div style={{fontSize:16}}>❓ <em>{t("Tại sao tích vô hướng lại trả về một số, không phải một vectơ?","Why does the dot product return a scalar, not a vector?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="LyGKycYT2v0"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ 3Blue1Brown (CC BY)", "Video by 3Blue1Brown (CC BY)")}
          />
        </div>
      </section>
      <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("1. Định Nghĩa Tích Vô Hướng","1. Definition of Dot Product")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
          <div style={{fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10}}>📌 {t("Định nghĩa","Definition")}</div>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Cho hai vectơ →a và →b. Góc giữa chúng là φ (0° ≤ φ ≤ 180°):","For vectors →a and →b with angle φ between them (0°≤φ≤180°):")}</div>
          <div style={{background:"white",borderRadius:10,padding:"16px 20px",textAlign:"center",fontFamily:"monospace",fontSize:20,color:"#0B4F5C",fontWeight:700,lineHeight:2.2}}>
            →a · →b = |→a| · |→b| · cosφ
          </div>
          <div style={{marginTop:12,padding:"10px 14px",background:"#fff3cd",borderRadius:8,fontSize:14}}>💡 {t("Kết quả là một SỐ THỰC (scalar), không phải vectơ!","The result is a REAL NUMBER (scalar), not a vector!")}</div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,transition:"all 0.3s"}}>
          {[{cond:t("φ = 0° (cùng hướng)","φ=0° (same direction)"),result:"→a·→b = |→a|·|→b|",note:"+",bg:"#eafaf1",c:"#1e8449"},
            {cond:t("φ = 90° (vuông góc)","φ=90° (perpendicular)"),result:"→a·→b = 0",note:"0",bg:"#eaf4fb",c:"#1a5276"},
            {cond:t("φ = 180° (ngược hướng)","φ=180° (opposite)"),result:"→a·→b = −|→a|·|→b|",note:"−",bg:"#fdf2f2",c:"#922b21"},
          ].map((card,i)=><article key={i} style={{padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center"}}><div style={{fontSize:12,color:card.c,fontWeight:700,marginBottom:6}}>{card.cond}</div><div style={{fontFamily:"monospace",fontSize:13,background:card.bg,color:card.c,padding:"6px 10px",borderRadius:6,marginBottom:4}}>{card.result}</div><div style={{fontSize:20,fontWeight:700,color:card.c}}>{card.note}</div></article>)}
        </div>
      </section>
      <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("2. Tính Chất & Ứng Dụng","2. Properties & Applications")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
          <div style={{background:"white",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:14,lineHeight:2.0}}>
            →a · →b = →b · →a  (giao hoán)<br/>
            →a · (→b + →c) = →a·→b + →a·→c  (phân phối)<br/>
            (k→a)·→b = k(→a·→b)  (tuyến tính)<br/>
            →a · →a = |→a|² ≥ 0
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16,transition:"all 0.3s"}}>
          {[{title:t("Tính độ dài","Compute length"),formula:`|→a|² = →a · →a
|→a| = √(→a · →a)`,bg:"#eaf4fb",c:"#1a5276"},
            {title:t("Kiểm tra vuông góc","Check perpendicular"),formula:"→a ⊥ →b ⟺ →a · →b = 0",bg:"#eafaf1",c:"#1e8449"},
            {title:t("Tính góc giữa 2 vectơ","Compute angle"),formula:"cosφ = (→a·→b) / (|→a|·|→b|)",bg:"#fff3cd",c:"#856404"},
          ].map((card,i)=><article key={i} style={{padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:14,fontWeight:700,color:card.c,marginBottom:8}}>{card.title}</div><div style={{background:card.bg,color:card.c,fontFamily:"monospace",fontSize:13,padding:"8px 12px",borderRadius:8,whiteSpace:"pre-wrap",lineHeight:1.8}}>{card.formula}</div></article>)}
        </div>
      </section>
      <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("3. Tích Vô Hướng Theo Toạ Độ","3. Dot Product via Coordinates")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Nếu →a = (x₁, y₁) và →b = (x₂, y₂):","If →a=(x₁,y₁) and →b=(x₂,y₂):")}</div>
          <div style={{background:"white",borderRadius:10,padding:"14px 18px",textAlign:"center",fontFamily:"monospace",fontSize:17,color:"#0B4F5C",fontWeight:700,lineHeight:2.4}}>
            →a · →b = x₁x₂ + y₁y₂<br/>
            |→a|² = x₁² + y₁²<br/>
            cosφ = (x₁x₂+y₁y₂) / (√(x₁²+y₁²)·√(x₂²+y₂²))
          </div>
        </div>
      </section>
      <section id="th" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
          {[{id:"e1",q:t("→a=(3,4), →b=(4,−3). Tính →a·→b và kiểm tra vuông góc.","→a=(3,4), →b=(4,−3). Find →a·→b and check perpendicularity."),
             a:[t("→a·→b = 3·4 + 4·(−3) = 12 − 12 = 0","→a·→b=12−12=0"),t("→a·→b=0 → →a ⊥ →b ✓","→a⊥→b ✓")]},
            {id:"e2",q:t("Tam giác ABC: A(0,0), B(4,0), C(0,3). Tính góc A.","Triangle ABC: A(0,0), B(4,0), C(0,3). Find angle A."),
             a:[t("→AB=(4,0), →AC=(0,3)","→AB=(4,0), →AC=(0,3)"),t("→AB·→AC=4·0+0·3=0 → cos A=0 → A=90°","→AB·→AC=0 → A=90°")]},
            {id:"e3",q:t("→a=(1,1), →b=(1,0). Tính góc φ giữa →a và →b.","→a=(1,1), →b=(1,0). Find angle φ."),
             a:["→a·→b=1·1+1·0=1",t("|→a|=√2, |→b|=1","| →a|=√2, |→b|=1"),t("cosφ=1/(√2·1)=1/√2=√2/2 → φ=45°","cosφ=1/√2 → φ=45°")]},
          ].map(({id,q,a})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:18,fontWeight:600,marginBottom:4}}>📝 {t("Bài tập","Exercise")}</div><div style={{fontSize:15,lineHeight:1.7}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color:"#555",marginBottom:6}}>{l}</div>)}</div>}</article>))}
        </div>
      </section>
      <section id="mg" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="🎮" title="Mini Game" />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:24,marginBottom:32,transition:"all 0.3s"}}>
          {[["mc","🧩",t("Trắc Nghiệm","Multiple Choice"),t("5 câu","5 Q")],["tf","🃏",t("Đúng / Sai","True / False"),t("5 thẻ","5 cards")],["fill","✍️",t("Điền Chỗ Trống","Fill in Blank"),t("3 câu","3 items")]].map(([mode,icon,label,sub])=>(
            <article key={mode} onClick={()=>setGm(mode)} style={{background:gm===mode?"black":"#f9f9f9",color:gm===mode?"white":"black",cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:20,borderRadius:10}}>
              <div style={{fontSize:28,marginBottom:6}}>{icon}</div><div style={{fontSize:18,fontWeight:600}}>{label}</div><div style={{fontSize:14,opacity:0.7}}>{sub}</div>
            </article>
          ))}
        </div>
        {gm==="mc"&&<div style={{padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>{!md?(<><div style={{color:"#777",fontSize:15,marginBottom:8}}>{t("Câu","Q")} {mi+1}/{mcQ.length} · {t("Điểm:","Score:")} {msc}</div><div style={{fontSize:20,fontWeight:600,marginBottom:20}}>{mcQ[mi].q}</div><div style={{display:"flex",flexDirection:"column",gap:12}}>{mcQ[mi].o.map((opt,i)=>{let bg="white",co="black";if(ms!==null){if(i===mcQ[mi].a){bg="#eafaf1";co="#1e8449";}else if(i===ms){bg="#fdf2f2";co="#922b21";}}return <button key={i} onClick={()=>sel(i)} style={{textAlign:"left",padding:"14px 18px",borderRadius:10,border:"none",background:bg,color:co,fontSize:15,fontWeight:ms!==null&&(i===ms||i===mcQ[mi].a)?600:400,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>{String.fromCharCode(65+i)}. {opt}</button>;})}</div>{ms!==null&&<><div style={{marginTop:16,padding:"12px 16px",background:"white",borderRadius:8,fontSize:15,color:"#555",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {mcQ[mi].ex}</div><button onClick={nx} style={{marginTop:14,padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{mi+1<mcQ.length?t("Câu tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>}</>):<RS items={mri} onReset={rm} scoreLabel={msc===mcQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):msc>=3?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
        {gm==="tf"&&<div style={{padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>{!td?(<><div style={{color:"#777",fontSize:15,marginBottom:14}}>{t("Thẻ","Card")} {ti+1}/{tfC.length} · {t("Điểm:","Score:")} {ts}</div><article style={{background:"white",borderRadius:10,padding:24,marginBottom:20,textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:18,lineHeight:1.7,marginBottom:24}}>{tfC[ti].s}</div>{!tf?(<div style={{display:"flex",gap:16,justifyContent:"center"}}><button onClick={()=>ta(true)} style={{padding:"12px 36px",background:"#eafaf1",color:"#1e8449",border:"2px solid #1e8449",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer"}}>✅ {t("ĐÚNG","TRUE")}</button><button onClick={()=>ta(false)} style={{padding:"12px 36px",background:"#fdf2f2",color:"#922b21",border:"2px solid #922b21",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer"}}>❌ {t("SAI","FALSE")}</button></div>):(<><div style={{padding:"12px 16px",background:"#f9f9f9",borderRadius:8,fontSize:15,color:"#555",textAlign:"left",marginBottom:14,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {tfC[ti].ex}</div><button onClick={tn} style={{padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{ti+1<tfC.length?t("Thẻ tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>)}</article></>):<RS items={tri} onReset={rt} scoreLabel={ts===tfC.length?t("Xuất sắc! 🎉","Perfect! 🎉"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
        {gm==="fill"&&<div style={{padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>{!fc?(<><div style={{fontSize:18,fontWeight:600,marginBottom:20}}>{t("Điền câu trả lời","Fill in each blank")}</div>{fQ.map((q,qi)=>(<div key={q.id} style={{marginBottom:24}}><div style={{fontSize:15,color:"#777",marginBottom:6}}>{t("Câu","Q")} {qi+1}</div><div style={{fontSize:16,lineHeight:1.7,marginBottom:10}}>{q.tp}</div><input value={fa[q.id]||""} onChange={e=>setFa(p=>({...p,[q.id]:e.target.value}))} placeholder={t("Nhập đáp án...","Answer...")} style={{width:"100%",padding:"12px 16px",borderRadius:8,fontSize:15,outline:"none",border:"1px solid #ddd",background:"white",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",boxSizing:"border-box"}} /></div>))}<button onClick={()=>setFc(true)} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{t("Kiểm tra","Check Answers")}</button></>):<RS items={fri} onReset={()=>{setFa({});setFc(false);}} scoreLabel={fs===fQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):fs>=2?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
      </section>
      <hr style={{width:"5px"}}></hr>
      <div className="reveal" data-reveal style={{textAlign:"center",color:"#777",fontSize:15,marginBottom:60}}>Toán 10 · Chân Trời Sáng Tạo · Bài 16 / Chương V</div>
      <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
    <DuoTranslate />
  </div></div>
  );
}
