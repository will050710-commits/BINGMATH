
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);
export default function Lesson30_DuongThang() {
  const [lang,setLang]=useState("vi");
  const [rev,setRev]=useState({});
  const [gm,setGm]=useState("mc");
  const [mi,setMi]=useState(0),[ms,setMs]=useState(null),[msc,setMsc]=useState(0),[md,setMd]=useState(false),[mh,setMh]=useState([]);
  const [ti,setTi]=useState(0),[tf,setTf]=useState(false),[ts,setTs]=useState(0),[td,setTd]=useState(false),[th,setTh]=useState([]);
  const [fa,setFa]=useState({}),[fc,setFc]=useState(false);
  useEffect(()=>{
    if(typeof window==="undefined")return;
    const els=document.querySelectorAll("[data-reveal]");
    els.forEach(el=>{if(el.hasAttribute("data-reveal-stagger")){const s=parseInt(el.getAttribute("data-stagger")||"80",10);Array.from(el.children).forEach((c,i)=>{c.style.opacity="0";c.style.transform="translateY(24px) scale(0.97)";c.style.transition=`opacity 0.5s cubic-bezier(.2,.8,.2,1) ${i*s}ms,transform 0.45s cubic-bezier(.2,.8,.2,1) ${i*s}ms`;c.style.willChange="opacity,transform";});}});
    const obs=new IntersectionObserver((entries,observer)=>{entries.forEach(entry=>{if(entry.isIntersecting){const el=entry.target;if(el.hasAttribute("data-reveal-stagger")){const s=parseInt(el.getAttribute("data-stagger")||"80",10);Array.from(el.children).forEach((c,i)=>setTimeout(()=>{c.style.opacity="1";c.style.transform="translateY(0) scale(1)";},i*s));}el.classList.add("visible");observer.unobserve(el);}});},{threshold:0.12,rootMargin:"0px 0px -40px 0px"});
    els.forEach(el=>obs.observe(el));return()=>obs.disconnect();
  },[]);
  const t=(vi,en)=>lang==="vi"?vi:en;

  const videoSubtitles = [
    {
      start: 0, end: 10,
      words: [
        { text: "Welcome", vi: "Chào mừng" },
        { text: "to", vi: "đến với" },
        { text: "this", vi: "bài" },
        { text: "lesson.", vi: "học." }
      ]
    }
  ];

  const sc=(id)=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});};
  const tr=(id)=>setRev(p=>(({...p,[id]:!p[id]})));
  const mcQ=[{'q': 'Đường thẳng 3x−4y+5=0. Vectơ pháp tuyến →n=?', 'o': ['(3,4)', '(3,−4)', '(4,3)', '(−4,3)'], 'a': 1, 'ex': 'Dạng ax+by+c=0: →n=(a,b)=(3,−4).'}, {'q': 'Khoảng cách từ O(0,0) đến 3x+4y−10=0?', 'o': ['2', '10', '10/5=2', '10/√25=2'], 'a': 0, 'ex': 'd=|0+0−10|/√(9+16)=10/5=2.'}, {'q': 'Đường thẳng qua A(1,2) song song Ox (y=const).', 'o': ['x=1', 'y=2', 'x+y=3', 'x−y=−1'], 'a': 1, 'ex': 'Song song Ox → y=const=2 → y=2.'}, {'q': '2x+3y−6=0 cắt Oy tại điểm?', 'o': ['(0,2)', '(0,3)', '(0,−2)', '(3,0)'], 'a': 0, 'ex': 'x=0: 3y=6 → y=2. Cắt Oy tại (0,2).'}, {'q': 'd₁: 2x+y=1 và d₂: 4x+2y=5. Quan hệ?', 'o': ['Cắt nhau', 'Song song', 'Trùng nhau', 'Vuông góc'], 'a': 1, 'ex': 'a₁/a₂=1/2; b₁/b₂=1/2; c₁/c₂=1/5. Tỉ lệ a=b≠c → song song.'}];
  const tfC=[{'s': 'Vectơ pháp tuyến của ax+by+c=0 là (a,b).', 'a': true, 'ex': 'ĐÚNG — hệ số x và y cho pháp tuyến.'}, {'s': 'Vectơ chỉ phương của ax+by+c=0 là (a,b).', 'a': false, 'ex': 'SAI — vectơ chỉ phương là (−b,a) hoặc (b,−a).'}, {'s': 'Khoảng cách từ M(x₀,y₀) đến ax+by+c=0 là |ax₀+by₀+c|/√(a²+b²).', 'a': true, 'ex': 'ĐÚNG — công thức chuẩn.'}, {'s': 'Hai đường song song khi a₁b₂=a₂b₁.', 'a': true, 'ex': 'ĐÚNG — a₁/a₂=b₁/b₂ ⟺ a₁b₂=a₂b₁.'}, {'s': 'y=2x+3 có vectơ pháp tuyến (2,1).', 'a': false, 'ex': 'SAI — 2x−y+3=0: →n=(2,−1).'}];
  const fQ=[{'id': 'f1', 'tp': 'PT đường thẳng: ax+by+c=0. Vectơ pháp tuyến →n=(___, ___)', 'ans': 'a, b', 'alt': ['(a,b)', 'a b', 'a,b'], 'h': ''}, {'id': 'f2', 'tp': 'd(O, 3x+4y−10=0) = ___', 'ans': '2', 'alt': ['2'], 'h': '|0+0−10|/5'}, {'id': 'f3', 'tp': 'Đường thẳng qua (0,0) có hệ số góc m=3: y = ___x', 'ans': '3', 'alt': ['3'], 'h': 'y=mx'}];
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
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. PT Tổng Quát","1. General Eq.")],["k2","📖",t("2. Các Dạng PT","2. Line Forms")],["k3","📖",t("3. VT Tương Đối","3. Position & Distance")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮",t("Mini Game","Mini Game")]];
  return(<div style={{width:"100%",background:"#fff",display:"flex",justifyContent:"center"}}><div style={{width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80}}>
    <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/Cacbaitoan10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
    <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
      <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương IX · Phương Pháp Tọa Độ Trong Mặt Phẳng</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Bài 30: Đường Thẳng Trong Mặt Phẳng</div></div>
      <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 VI</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 EN</button></div>
    </header>
    <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
      <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
              <div key={"0"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Viết phương trình tổng quát đường thẳng ax+by+c=0. / Write general line equation ax+by+c=0.</div>
        <div key={"1"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Xác định vectơ pháp tuyến và vectơ chỉ phương. / Identify normal and direction vectors.</div>
        <div key={"2"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Viết PT theo dạng tham số và dạng y=mx+n. / Write parametric and slope-intercept forms.</div>
        <div key={"3"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Xác định vị trí tương đối hai đường thẳng. / Determine relative position of two lines.</div>
        <div key={"4"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Tính khoảng cách từ điểm đến đường thẳng. / Compute distance from point to line.</div>
    </div>
    <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8}}>{t("Thiết kế đường ray tàu, lập trình robot di chuyển theo đường thẳng, thiết kế kiến trúc — tất cả cần phương trình đường thẳng. Tọa độ giúp ta mô tả mọi đường thẳng bằng một công thức.","Designing railroad tracks, programming robot paths, architectural design — all require line equations. Coordinates let us describe any line with a formula.")}</div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="bAerID24QJ0"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Animate Math (Manim Engine)", "Video by Animate Math (Manim Engine)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Phương Trình Tổng Quát","1. General Equation")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{background:"white",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:17,textAlign:"center",color:"#0B4F5C",fontWeight:700,lineHeight:2.4}}>
          ax + by + c = 0 (a²+b²≠0)
        </div>
        <div style={{marginTop:10,fontSize:14,color:"#777",lineHeight:1.8}}>
          {t("Vectơ pháp tuyến: →n=(a,b) | Vectơ chỉ phương: →u=(−b,a) hoặc (b,−a)","Normal vector: →n=(a,b) | Direction vector: →u=(−b,a) or (b,−a)")}
        </div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Các Dạng Phương Trình","2. Forms of Line Equations")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16,transition:"all 0.3s"}}>
        {[{name:t("PT tổng quát","General"),formula:"ax + by + c = 0",note:t("Vectơ pháp →n=(a,b)","Normal →n=(a,b)"),c:"#1a5276",bg:"#eaf4fb"},
          {name:t("PT tham số","Parametric"),formula:"x=x₀+at, y=y₀+bt (t∈ℝ)",note:t("Vectơ chỉ phương →u=(a,b)","Direction →u=(a,b)"),c:"#1e8449",bg:"#eafaf1"},
          {name:t("PT chính tắc","Standard"),formula:"(x−x₀)/a = (y−y₀)/b",note:t("Qua M(x₀,y₀), hướng (a,b)","Through M(x₀,y₀), dir (a,b)"),c:"#856404",bg:"#fff3cd"},
          {name:t("PT góc tung độ (y=mx+n)","Slope-intercept"),formula:"y = mx + n",note:t("m=−a/b là hệ số góc","m=−a/b is slope"),c:"#922b21",bg:"#fdf2f2"},
        ].map((card,i)=>(<article key={i} style={{padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:13,fontWeight:700,color:card.c,marginBottom:6}}>{card.name}</div><div style={{fontFamily:"monospace",fontSize:14,background:card.bg,color:card.c,padding:"6px 10px",borderRadius:6,marginBottom:4}}>{card.formula}</div><div style={{fontSize:12,color:"#777"}}>{card.note}</div></article>))}
      </div>
    </section>
    <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("3. Vị Trí Tương Đối & Khoảng Cách","3. Relative Position & Distance")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:14,lineHeight:2.2}}>
          2 đường thẳng: a₁x+b₁y+c₁=0 và a₂x+b₂y+c₂=0<br/>
          Cắt nhau: a₁/a₂ ≠ b₁/b₂<br/>
          Song song: a₁/a₂ = b₁/b₂ ≠ c₁/c₂<br/>
          Trùng nhau: a₁/a₂ = b₁/b₂ = c₁/c₂<br/><br/>
          Khoảng cách điểm M(x₀,y₀) đến đường ax+by+c=0:<br/>
          d = |ax₀+by₀+c| / √(a²+b²)
        </div>
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:t("Viết PT đường thẳng qua A(2,3) có vectơ pháp tuyến →n=(1,−2).","Write equation of line through A(2,3) with normal →n=(1,−2)."),a:["1(x−2)+(−2)(y−3)=0","x−2−2y+6=0","x−2y+4=0"]},
          {id:"e2",q:t("Tính khoảng cách từ M(1,2) đến đường thẳng 3x+4y−10=0.","Distance from M(1,2) to line 3x+4y−10=0."),a:["d=|3×1+4×2−10|/√(9+16)","=|3+8−10|/5 = |1|/5 = 1/5 = 0.2"]},
          {id:"e3",q:t("Hai đường thẳng d₁: 2x−y+1=0 và d₂: 4x−2y+3=0. Quan hệ?","Lines d₁: 2x−y+1=0 and d₂: 4x−2y+3=0. Relationship?"),a:[t("a₁/a₂=2/4=1/2; b₁/b₂=(−1)/(−2)=1/2; c₁/c₂=1/3","ratios: 1/2, 1/2, 1/3"),t("a₁/a₂=b₁/b₂≠c₁/c₂ → SONG SONG","equal first two ratios, different third → PARALLEL")]},
        ].map(({id,q,a})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:18,fontWeight:600,marginBottom:4}}>📝 {t("Bài tập","Exercise")}</div><div style={{fontSize:15,lineHeight:1.7}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color:"#555",marginBottom:6}}>{l}</div>)}</div>}</article>))}
      </div>
    </section>
    <section id="mg" style={{scrollMarginTop:80,marginBottom:64}}>
      <SH icon="🎮" title="Mini Game" />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:24,marginBottom:32,transition:"all 0.3s"}}>
        {[["mc","🧩",t("Trắc Nghiệm","Multiple Choice"),t("5 câu","5 Q")],["tf","🃏",t("Đúng / Sai","True / False"),t("5 thẻ","5 cards")],["fill","✍️",t("Điền Chỗ Trống","Fill in Blank"),t("3 câu","3 items")]].map(([mode,icon,label,sub])=>(<article key={mode} onClick={()=>setGm(mode)} style={{background:gm===mode?"black":"#f9f9f9",color:gm===mode?"white":"black",cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:20,borderRadius:10}}><div style={{fontSize:28,marginBottom:6}}>{icon}</div><div style={{fontSize:18,fontWeight:600}}>{label}</div><div style={{fontSize:14,opacity:0.7}}>{sub}</div></article>))}
      </div>
      {gm==="mc"&&<div style={{padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}> {!md?(<><div style={{color:"#777",fontSize:15,marginBottom:8}}>{t("Câu","Q")} {mi+1}/{mcQ.length} · {t("Điểm:","Score:")} {msc}</div><div style={{fontSize:20,fontWeight:600,marginBottom:20}}>{mcQ[mi].q}</div><div style={{display:"flex",flexDirection:"column",gap:12}}>{mcQ[mi].o.map((opt,i)=>{let bg="white",co="black";if(ms!==null){if(i===mcQ[mi].a){bg="#eafaf1";co="#1e8449";}else if(i===ms){bg="#fdf2f2";co="#922b21";}}return <button key={i} onClick={()=>sel(i)} style={{textAlign:"left",padding:"14px 18px",borderRadius:10,border:"none",background:bg,color:co,fontSize:15,fontWeight:ms!==null&&(i===ms||i===mcQ[mi].a)?600:400,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>{String.fromCharCode(65+i)}. {opt}</button>;})}</div>{ms!==null&&<><div style={{marginTop:16,padding:"12px 16px",background:"white",borderRadius:8,fontSize:15,color:"#555",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {mcQ[mi].ex}</div><button onClick={nx} style={{marginTop:14,padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{mi+1<mcQ.length?t("Câu tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>}</>):<RS items={mri} onReset={rm} scoreLabel={msc===mcQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):msc>=3?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
      {gm==="tf"&&<div style={{padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}> {!td?(<><div style={{color:"#777",fontSize:15,marginBottom:14}}>{t("Thẻ","Card")} {ti+1}/{tfC.length} · {t("Điểm:","Score:")} {ts}</div><article style={{background:"white",borderRadius:10,padding:24,marginBottom:20,textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:18,lineHeight:1.7,marginBottom:24}}>{tfC[ti].s}</div>{!tf?(<div style={{display:"flex",gap:16,justifyContent:"center"}}><button onClick={()=>ta(true)} style={{padding:"12px 36px",background:"#eafaf1",color:"#1e8449",border:"2px solid #1e8449",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer"}}>✅ {t("ĐÚNG","TRUE")}</button><button onClick={()=>ta(false)} style={{padding:"12px 36px",background:"#fdf2f2",color:"#922b21",border:"2px solid #922b21",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer"}}>❌ {t("SAI","FALSE")}</button></div>):(<><div style={{padding:"12px 16px",background:"#f9f9f9",borderRadius:8,fontSize:15,color:"#555",textAlign:"left",marginBottom:14,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {tfC[ti].ex}</div><button onClick={tn} style={{padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{ti+1<tfC.length?t("Thẻ tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>)}</article></>):<RS items={tri} onReset={rt} scoreLabel={ts===tfC.length?t("Xuất sắc! 🎉","Perfect! 🎉"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
      {gm==="fill"&&<div style={{padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}> {!fc?(<><div style={{fontSize:18,fontWeight:600,marginBottom:20}}>{t("Điền câu trả lời","Fill in the blanks")}</div>{fQ.map((q,qi)=>(<div key={q.id} style={{marginBottom:24}}><div style={{fontSize:15,color:"#777",marginBottom:6}}>{t("Câu","Q")} {qi+1}</div><div style={{fontSize:16,lineHeight:1.7,marginBottom:10}}>{q.tp}</div><input value={fa[q.id]||""} onChange={e=>setFa(p=>({...p,[q.id]:e.target.value}))} placeholder={t("Nhập đáp án...","Answer...")} style={{width:"100%",padding:"12px 16px",borderRadius:8,fontSize:15,outline:"none",border:"1px solid #ddd",background:"white",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",boxSizing:"border-box"}} /></div>))}<button onClick={()=>setFc(true)} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{t("Kiểm tra","Check Answers")}</button></>):<RS items={fri} onReset={()=>{setFa({});setFc(false);}} scoreLabel={fs===fQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):fs>=2?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
    </section>
    <hr style={{width:"5px"}}></hr>
    <div className="reveal" data-reveal style={{textAlign:"center",color:"#777",fontSize:15,marginBottom:60}}>Toán 10 · Chân Trời Sáng Tạo · Bài 30 / Chương IX</div>
    <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
  <DuoTranslate/> 
  </div></div>);
}
