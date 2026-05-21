
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);
export default function Lesson36_OnTapChuong10() {
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
      start: 0, end: 6,
      words: [
        { text: "The", vi: "Không gian" },
        { text: "sample", vi: "mẫu" },
        { text: "space", vi: "không gian,", detail: "<b>Sample space (Không gian mẫu - Ω)</b>:<br/>Tập hợp tất cả các kết quả có thể xảy ra của một phép thử ngẫu nhiên.", detailTitle: "Sample space" },
        { text: "contains", vi: "chứa" },
        { text: "all", vi: "tất cả" },
        { text: "outcomes", vi: "kết quả" },
        { text: "of", vi: "của" },
        { text: "a", vi: "một" },
        { text: "random", vi: "ngẫu nhiên" },
        { text: "experiment.", vi: "phép thử.", detail: "<b>Random experiment (Phép thử ngẫu nhiên)</b>:<br/>Hành động hay thí nghiệm có kết quả không thể đoán trước chính xác.", detailTitle: "Random experiment" }
      ]
    },
    {
      start: 6, end: 12,
      words: [
        { text: "An", vi: "Một" },
        { text: "event", vi: "biến cố,", detail: "<b>Event (Biến cố)</b>:<br/>Một tập con của không gian mẫu Ω, đại diện cho một kết quả ta quan tâm.", detailTitle: "Event (Biến cố)" },
        { text: "is", vi: "là" },
        { text: "a", vi: "một" },
        { text: "subset", vi: "tập con,", detail: "<b>Subset (Tập con)</b>: Tập hợp con của không gian mẫu.", detailTitle: "Subset" },
        { text: "of", vi: "của" },
        { text: "the", vi: "không gian" },
        { text: "sample", vi: "mẫu" },
        { text: "space.", vi: "không gian mẫu." }
      ]
    },
    {
      start: 12, end: 18,
      words: [
        { text: "Calculate", vi: "Tính" },
        { text: "probability", vi: "xác suất,", detail: "<b>Probability (Xác suất - P(A))</b>:<br/>Khả năng xảy ra của biến cố: P(A) = n(A)/n(Ω).", detailTitle: "Probability (Xác suất)" },
        { text: "for", vi: "cho" },
        { text: "mutually", vi: "xung khắc" },
        { text: "exclusive", vi: "biến cố xung khắc,", detail: "<b>Mutually exclusive events (Biến cố xung khắc)</b>:<br/>Hai biến cố không thể xảy ra đồng thời (giao bằng rỗng).", detailTitle: "Mutually exclusive" },
        { text: "or", vi: "hoặc" },
        { text: "complementary", vi: "đối,", detail: "<b>Complementary event (Biến cố đối - ¬A)</b>:<br/>Biến cố xảy ra khi và chỉ khi A không xảy ra: P(¬A) = 1 - P(A).", detailTitle: "Complementary event" },
        { text: "events.", vi: "các biến cố." }
      ]
    }
  ];


  const sc=(id)=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});};
  const tr=(id)=>setRev(p=>(({...p,[id]:!p[id]})));
  const mcQ=[{'q': 'Tung 2 xúc xắc. n(Ω)=?', 'o': ['12', '36', '6', '72'], 'a': 1, 'ex': '6×6=36.'}, {'q': 'P(A)=0.4. P(Ā)=?', 'o': ['0.4', '0.6', '1.4', '0.04'], 'a': 1, 'ex': 'P(Ā)=1−0.4=0.6.'}, {'q': "Hộp 4 đỏ, 6 xanh. Rút 1: P('đỏ')=?", 'o': ['4/6', '4/10', '6/10', '1/4'], 'a': 1, 'ex': 'P=4/10=2/5.'}, {'q': 'A,B độc lập: P(A)=0.5, P(B)=0.4. P(A∩B)=?', 'o': ['0.9', '0.1', '0.2', '0.45'], 'a': 2, 'ex': 'P(A∩B)=0.5×0.4=0.2.'}, {'q': "Tung 3 đồng xu. P('ít nhất 1 ngửa')=?", 'o': ['3/8', '5/8', '7/8', '1/8'], 'a': 2, 'ex': '1−P(tất cả sấp)=1−1/8=7/8.'}];
  const tfC=[{'s': 'P(A)=n(A)/n(Ω) chỉ dùng khi các kết quả đồng khả năng.', 'a': true, 'ex': 'ĐÚNG.'}, {'s': 'P(A)+P(B)=P(A∪B) với mọi A,B.', 'a': false, 'ex': 'SAI — P(A∪B)=P(A)+P(B)−P(A∩B).'}, {'s': 'P(Ω)=1 và P(∅)=0.', 'a': true, 'ex': 'ĐÚNG.'}, {'s': 'Biến cố độc lập A,B: P(A∩B)=P(A)·P(B).', 'a': true, 'ex': 'ĐÚNG — định nghĩa độc lập.'}, {'s': 'n(Ω) khi rút không hoàn lại 2 từ 10 là 10×9=90.', 'a': false, 'ex': 'SAI — không hoàn lại và không quan tâm thứ tự → C₁₀²=45.'}];
  const fQ=[{'id': 'f1', 'tp': 'P(A)=n(A)/n(Ω). Với A={2,4,6} trên xúc xắc: P(A)=___', 'ans': '1/2', 'alt': ['1/2', '0.5', '3/6'], 'h': ''}, {'id': 'f2', 'tp': 'P(A)=0.3, P(B)=0.5, xung khắc. P(A∪B)=___', 'ans': '0.8', 'alt': ['0.8'], 'h': ''}, {'id': 'f3', 'tp': 'A,B độc lập: P(A)=0.6, P(B)=0.5. P(A∩B)=___', 'ans': '0.3', 'alt': ['0.3'], 'h': '0.6×0.5'}];
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
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["baiTap","✏️",t("Bài Tập TH","Mixed")],["mg","🎮",t("Mini Game","Mini Game")]];
  return(<div style={{width:"100%",background:"#fff",display:"flex",justifyContent:"center"}}><div style={{width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80}}>
    <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/cacbailam10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
    <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
      <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương X · Xác Suất</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Ôn Tập Chương X</div></div>
      <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 VI</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 EN</button></div>
    </header>
    <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
      <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
              <div key={"0"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Ôn không gian mẫu và các quan hệ biến cố. / Review sample spaces and event relations.</div>
        <div key={"1"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Thành thạo P(A)=n(A)/n(Ω). / Master P(A)=n(A)/n(Ω).</div>
        <div key={"2"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Áp dụng các quy tắc cộng và nhân. / Apply addition and multiplication rules.</div>
        <div key={"3"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Kết hợp tổ hợp vào tính xác suất. / Combine combinatorics with probability.</div>
        <div key={"4"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Giải bài toán xác suất thực tế. / Solve real-world probability problems.</div>
    </div>
    <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

    <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:40,transition:"all 0.3s"}}>
      {[{slug:"khong-gian-mau",num:"36",title:t("Không Gian Mẫu","Sample Spaces")},{slug:"xac-suat-bien-co",num:"37",title:t("Xác Suất Biến Cố","Probability")}].map(l=>(<Link key={l.slug} href={`/cacbailam10/${l.slug}`} style={{textDecoration:"none"}}><article style={{padding:14,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",cursor:"pointer"}}><div style={{fontSize:12,color:"#777",marginBottom:3}}>{t("Bài","L")} {l.num}</div><div style={{fontSize:15,fontWeight:600,color:"#0B4F5C"}}>{l.title}</div></article></Link>))}
    </div>
    <section id="tomTat" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📚" title={t("Tóm Tắt Chương X","Chapter X Summary")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,transition:"all 0.3s"}}>
        {[{title:t("Bài 36 · Không Gian Mẫu","L36 · Sample Space"),pts:["Ω = tập tất cả kết quả có thể","Biến cố A ⊆ Ω","Ā = Ω\A (biến cố đối)","A∩B=∅: xung khắc","n(A∪B)=n(A)+n(B)−n(A∩B)"]},
          {title:t("Bài 37 · Xác Suất","L37 · Probability"),pts:["P(A)=n(A)/n(Ω) (đồng khả năng)","0≤P(A)≤1","P(Ā)=1−P(A)","P(A∪B)=P(A)+P(B)−P(A∩B)","Độc lập: P(A∩B)=P(A)·P(B)"]},
        ].map((card,i)=>(<article key={i} style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:12}}>{card.title}</div>{card.pts.map((pt,j)=><div key={j} style={{fontSize:13,color:"#555",marginBottom:8,display:"flex",gap:8}}><span style={{color:"#0B4F5C",fontWeight:700,flexShrink:0}}>•</span><span style={{fontFamily:"monospace"}}>{pt}</span></div>)}</article>))}
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="KFgvOQtH0Z0"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (CC BY-NC-SA)", "Video by Khan Academy (CC BY-NC-SA)")}
          />
        </div>
      </section>
    <section id="baiTap" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Bài Tập Tổng Hợp","Mixed Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",badge:"L36+37",q:t("Rút 1 lá từ 52. A='át đỏ'. Tính P(A) và P(Ā).","Draw 1 card from 52. A='red ace'. Find P(A) and P(Ā)."),a:[t("4 át trong 52 lá, trong đó 2 át đỏ (♥,♦)","4 aces total, 2 red (♥,♦)"),"P(A)=2/52=1/26≈0.038","P(Ā)=1−1/26=25/26≈0.962"]},
          {id:"e2",badge:"L37",q:t("Hộp có 5 bóng đỏ, 3 bóng xanh. Rút ngẫu nhiên 2 bóng. P('cả 2 đỏ')?","Box: 5 red, 3 blue balls. Draw 2 randomly. P('both red')?"),a:[t("n(Ω)=C₈²=28","n(Ω)=C₈²=28"),t("A='2 bóng đỏ': n(A)=C₅²=10","A: n(A)=C₅²=10"),"P(A)=10/28=5/14≈0.357"]},
          {id:"e3",badge:t("Tổng hợp","Mixed"),q:t("Tung 3 đồng xu. P('đúng 2 mặt ngửa')?","Flip 3 coins. P('exactly 2 heads')?"),a:[t("Ω gồm 2³=8 kết quả","Ω has 2³=8 outcomes"),t("A={NNS,NSN,SNN}: n(A)=C₃²=3","A has C₃²=3 outcomes"),"P(A)=3/8=0.375"]},
        ].map(({id,q,a,badge})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{fontSize:17,fontWeight:600}}>📝 {t("Bài tập","Exercise")}</div><span style={{background:"black",color:"white",fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20}}>{badge}</span></div><div style={{fontSize:15,lineHeight:1.7}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color:"#555",marginBottom:6}}>{l}</div>)}</div>}</article>))}
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
    <div className="reveal" data-reveal style={{textAlign:"center",color:"#777",fontSize:15,marginBottom:60}}>Toán 10 · Chân Trời Sáng Tạo · Ôn Tập Chương X</div>
    <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
    <DuoTranslate/> 
  </div></div>);
  
}
