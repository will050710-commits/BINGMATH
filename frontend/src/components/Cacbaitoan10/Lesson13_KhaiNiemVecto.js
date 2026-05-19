
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);

export default function Lesson13_KhaiNiemVecto() {
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
  const mcQ=[{'q': 'Vectơ là gì?', 'o': ['Đoạn thẳng có độ dài', 'Đoạn thẳng có hướng', 'Điểm trên mặt phẳng', 'Số thực'], 'a': 1, 'ex': 'Vectơ = đoạn thẳng có hướng (định hướng từ điểm đầu đến điểm cuối).'}, {'q': 'Hai vectơ bằng nhau khi nào?', 'o': ['Cùng điểm đầu', 'Cùng độ dài và cùng hướng', 'Cùng điểm cuối', 'Cùng độ dài'], 'a': 1, 'ex': '→a=→b ⟺ cùng độ dài VÀ cùng hướng. Vị trí không quan trọng.'}, {'q': 'Vectơ đối của →AB là?', 'o': ['→AB', '→BA', '→0', '→AA'], 'a': 1, 'ex': 'Vectơ đối của →AB là →BA (cùng độ dài, ngược hướng).'}, {'q': 'Vectơ không →0 có đặc điểm gì?', 'o': ['Độ dài = 1', 'Độ dài = 0', 'Hướng về phía đông', 'Không tồn tại'], 'a': 1, 'ex': '|→0| = 0. Điểm đầu = điểm cuối, hướng tùy ý (không xác định).'}, {'q': 'Hình bình hành ABCD. →AB = ?', 'o': ['→BC', '→DC', '→CD', '→CA'], 'a': 1, 'ex': 'Trong hình bình hành ABCD: AB // DC, cùng chiều → →AB = →DC.'}];
  const tfC=[{'s': 'Hai vectơ cùng độ dài thì bằng nhau.', 'a': false, 'ex': 'SAI — cần cùng độ dài VÀ cùng hướng.'}, {'s': 'Vectơ →0 có độ dài bằng 0.', 'a': true, 'ex': 'ĐÚNG — |→0|=0, điểm đầu trùng điểm cuối.'}, {'s': '→AB = →CD ⟺ ABDC là hình bình hành.', 'a': true, 'ex': 'ĐÚNG — cùng độ dài, cùng hướng ⟺ AB // CD, AB=CD, cùng chiều ⟺ ABDC là hình bình hành.'}, {'s': 'Vectơ đối của →a là →a.', 'a': false, 'ex': 'SAI — vectơ đối của →a là −→a (cùng độ dài nhưng NGƯỢC hướng).'}, {'s': 'Mọi vectơ đều có điểm đầu tại gốc tọa độ O.', 'a': false, 'ex': 'SAI — vectơ tự do, có thể đặt điểm đầu bất kỳ.'}];
  const fQ=[{'id': 'f1', 'tp': 'Vectơ đối của →AB là ___.', 'ans': '→BA', 'alt': ['BA', 'vec(BA)', '→BA'], 'h': ''}, {'id': 'f2', 'tp': '→a = →b khi chúng có cùng ___ và cùng ___.', 'ans': 'độ dài, hướng', 'alt': ['do dai, huong', 'length, direction', 'do dai huong'], 'h': ''}, {'id': 'f3', 'tp': '|→0| = ___.', 'ans': '0', 'alt': ['0'], 'h': ''}];
  const tabs=[["w","🚀",t("Khởi động","Warm-Up")],["k1","📖",t("1. Khái Niệm","1. Concept")],["k2","📖",t("2. Hai Vectơ Bằng Nhau","2. Equal Vectors")],["k3","📖",t("3. Cùng Phương / Hướng","3. Parallel & Direction")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮",t("Mini Game","Mini Game")]];

  return (
    <div style={{width:"100%",background:"#fff",display:"flex",justifyContent:"center"}}>
    <div style={{width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80}}>
      <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/Cacbaitoan10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
      <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
        <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương V · Vectơ</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Bài 13: Khái Niệm Vectơ</div></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 Tiếng Việt</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 English</button></div>
      </header>
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
        {[
          t("Hiểu khái niệm vectơ: điểm đầu, điểm cuối, độ dài, hướng.","Understand vectors: start point, end point, length, direction."),
          t("Phân biệt hai vectơ bằng nhau (cùng độ dài + cùng hướng).","Distinguish equal vectors (same length + same direction)."),
          t("Nhận biết vectơ đối, vectơ không.","Identify opposite and zero vectors."),
          t("Phân biệt vectơ cùng phương, cùng hướng, ngược hướng.","Distinguish parallel, same-direction, and opposite vectors."),
          t("Áp dụng vào hình học phẳng (hình bình hành).","Apply to plane geometry (parallelograms)."),
        ].map((item, idx) => (
          <div key={idx} style={{fontSize:15,color:"#555",marginBottom:6}}>{item}</div>
        ))}
      </div>
      <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

      <section id="w" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Khi mô tả chuyển động, lực, hoặc tốc độ gió, chúng ta cần biết không chỉ độ lớn mà còn cả hướng. Đó chính là lý do vectơ ra đời — đại lượng có cả độ lớn lẫn hướng.","When describing motion, force, or wind speed, we need not just magnitude but also direction. That is why vectors exist — quantities with both magnitude and direction.")}</div>
          <div style={{fontSize:16}}>❓ <em>{t("Lực kéo 10N theo hướng đông và lực kéo 10N theo hướng bắc có giống nhau không?","Is a 10N force east the same as a 10N force north?")}</em></div>
        </div>
      </section>
      <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("1. Khái Niệm Vectơ","1. Vector Concept")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
          <div style={{fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10}}>📌 {t("Định nghĩa","Definition")}</div>
          <div style={{fontSize:15,lineHeight:1.8}}>{t("Vectơ là một đoạn thẳng có hướng. Vectơ AB (ký hiệu →AB) có: điểm đầu A, điểm cuối B, hướng từ A đến B, độ dài |AB|.","A vector is a directed line segment. Vector AB (written →AB) has: initial point A, terminal point B, direction from A to B, length |AB|.")}</div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,transition:"all 0.3s"}}>
          {[{icon:"📏",title:t("Độ dài (Modulus)","Length (Modulus)"),desc:t("|→AB| = khoảng cách A đến B. |→u| ≥ 0","| →AB | = distance A to B. |→u| ≥ 0")},
            {icon:"🧭",title:t("Hướng (Direction)","Direction"),desc:t("Góc mà vectơ tạo với chiều dương trục Ox","Angle the vector makes with positive x-axis")},
            {icon:"📍",title:t("Vectơ không","Zero Vector"),desc:t("→0: điểm đầu = điểm cuối, |→0|=0, hướng tùy ý","→0: start=end, |→0|=0, direction undefined")},
          ].map((card,i)=><article key={i} style={{padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center"}}><div style={{fontSize:28,marginBottom:8}}>{card.icon}</div><div style={{fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:6}}>{card.title}</div><div style={{fontSize:13,color:"#777",lineHeight:1.6}}>{card.desc}</div></article>)}
        </div>
      </section>
      <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("2. Hai Vectơ Bằng Nhau","2. Equal Vectors")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
          <div style={{fontSize:15,lineHeight:1.8}}>{t("Hai vectơ bằng nhau (→a = →b) khi và chỉ khi chúng có cùng độ dài VÀ cùng hướng. Vị trí điểm gốc không quan trọng!","Two vectors are equal (→a = →b) iff they have the same length AND same direction. The position of the starting point doesn't matter!")}</div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s"}}>
      {[
  {
    title: t("→a = →b nếu", "→a = →b if"),
    cond: t(
      `• Cùng độ dài: |→a|=|→b|\n• Cùng hướng`,
      `• Same length: |→a|=|→b|\n• Same direction`
    ),
    bg: "#eafaf1", c: "#1e8449"
  },
  {
    title: t("→a ≠ →b nếu", "→a ≠ →b if"),
    cond: t(
      `• Độ dài khác nhau, HOẶC\n• Hướng khác nhau`,
      `• Different lengths, OR\n• Different directions`
    ),
    bg: "#fdf2f2", c: "#922b21"
  },
  {
    title: t("Vectơ đối −→a", "Opposite vector −→a"),
    cond: t(
      `• Cùng độ dài với →a\n• Ngược hướng với →a`,
      `• Same length as →a\n• Opposite direction to →a`
    ),
    bg: "#eaf4fb", c: "#1a5276"
  },
].map((card, i) => (
     <article key={i} style={{padding:16, borderRadius:10, background:"#f9f9f9", boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
       <div style={{fontSize:14, fontWeight:700, color:card.c, marginBottom:8}}>{card.title}</div>
       <div style={{background:card.bg, color:card.c, padding:"8px 12px", borderRadius:8, fontSize:13, whiteSpace:"pre-wrap", lineHeight:1.7}}>{card.cond}</div>
     </article>
   ))}
        </div>
      </section>
      <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("3. Vectơ Cùng Phương, Cùng Hướng","3. Parallel & Same-Direction Vectors")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s"}}>
          {[{title:t("Cùng phương","Parallel"),desc:t("→a và →b cùng phương khi giá của chúng song song hoặc trùng nhau.","→a and →b are parallel when their lines of action are parallel or identical."),ex:t("→AB và →CD cùng phương nếu AB // CD","→AB and →CD are parallel if AB // CD"),c:"#1a5276",bg:"#eaf4fb"},
            {title:t("Cùng hướng","Same direction"),desc:t("Cùng phương VÀ cùng chiều (không ngược chiều).","Parallel AND same direction (not opposite)."),ex:t("→AB và →CD cùng hướng nếu → từ A→B và C→D cùng chiều","→AB and →CD same direction if both point the same way"),c:"#1e8449",bg:"#eafaf1"},
            {title:t("Ngược hướng","Opposite direction"),desc:t("Cùng phương NHƯNG ngược chiều nhau.","Parallel BUT pointing in opposite directions."),ex:t("→AB và →DC ngược hướng (D→C ngược A→B)","→AB and →DC are opposite (D→C vs A→B)"),c:"#922b21",bg:"#fdf2f2"},
          ].map((card,i)=><article key={i} style={{padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:15,fontWeight:700,color:card.c,marginBottom:8}}>{card.title}</div><div style={{fontSize:13,color:"#555",marginBottom:8,lineHeight:1.6}}>{card.desc}</div><div style={{background:card.bg,color:card.c,padding:"6px 10px",borderRadius:6,fontSize:12}}>{card.ex}</div></article>)}
        </div>
      </section>
      <section id="th" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
          {[{id:"e1",q:t("Cho hình bình hành ABCD. Tìm tất cả các vectơ bằng →AB.","Given parallelogram ABCD. Find all vectors equal to →AB."),
             a:[t("Trong hình bình hành ABCD: AB // DC và AB = DC (cùng chiều)","In parallelogram ABCD: AB // DC and AB = DC (same direction)"),t("→DC = →AB (cùng độ dài, cùng hướng)","→DC = →AB (same length, same direction)")]},
            {id:"e2",q:t("→a và →b có |→a|=3, |→b|=3. Khi nào →a = →b?","→a and →b have |→a|=3, |→b|=3. When is →a = →b?"),
             a:[t("Cần thêm điều kiện: →a và →b phải CÙNG HƯỚNG.","Need extra condition: →a and →b must have the SAME DIRECTION."),t("Chỉ có độ dài bằng nhau chưa đủ — hai vectơ có thể khác hướng!","Equal lengths alone are not enough — they could point in different directions!")]},
            {id:"e3",q:t("Vectơ →0 có bằng bất kỳ vectơ không?","Is the zero vector equal to any other vector?"),
             a:[t("Không. →0 chỉ bằng chính nó: →0 = →0.","No. →0 equals only itself: →0 = →0."),t("|→0|=0, nhưng mọi vectơ khác không đều có độ dài >0.","| →0|=0, but every nonzero vector has length >0.")]},
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
      <div className="reveal" data-reveal style={{textAlign:"center",color:"#777",fontSize:15,marginBottom:60}}>Toán 10 · Chân Trời Sáng Tạo · Bài 15 / Chương V</div>
      <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
    <DuoTranslate/> 
    </div></div>
  );
}
