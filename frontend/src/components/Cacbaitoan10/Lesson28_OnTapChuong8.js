
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);
export default function Lesson28_OnTapChuong8() {
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
    "start": 0,
    "end": 12,
    "words": [
      {
        "text": "This lesson introduces",
        "vi": "Bài học này giới thiệu"
      },
      {
        "text": "combinatorics review",
        "vi": "ôn tập đại số tổ hợp",
        "detail": "<b>combinatorics review</b>: ôn tập đại số tổ hợp.",
        "detailTitle": "combinatorics review (ôn tập đại số tổ hợp)"
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
        "text": "counting principle",
        "vi": "nguyên lý đếm",
        "detail": "<b>counting principle</b>: nguyên lý đếm.",
        "detailTitle": "counting principle (nguyên lý đếm)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "combination",
        "vi": "tổ hợp",
        "detail": "<b>combination</b>: tổ hợp.",
        "detailTitle": "combination (tổ hợp)"
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
        "text": "binomial theorem",
        "vi": "nhị thức Newton",
        "detail": "<b>binomial theorem</b>: nhị thức Newton.",
        "detailTitle": "binomial theorem (nhị thức Newton)"
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
        "text": "counting principle",
        "vi": "nguyên lý đếm",
        "detail": "<b>counting principle</b>: nguyên lý đếm.",
        "detailTitle": "counting principle (nguyên lý đếm)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "combination",
        "vi": "tổ hợp",
        "detail": "<b>combination</b>: tổ hợp.",
        "detailTitle": "combination (tổ hợp)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "binomial theorem",
        "vi": "nhị thức Newton",
        "detail": "<b>binomial theorem</b>: nhị thức Newton.",
        "detailTitle": "binomial theorem (nhị thức Newton)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];


  const sc=(id)=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});};
  const tr=(id)=>setRev(p=>(({...p,[id]:!p[id]})));
  const mcQ=[{'q': 'A₅² = ?', 'o': ['10', '20', '15', '25'], 'a': 1, 'ex': '5×4=20.'}, {'q': 'C₈³ = ?', 'o': ['56', '28', '168', '336'], 'a': 0, 'ex': '8×7×6/6=56.'}, {'q': 'Σ C₄ᵏ = ?', 'o': ['4', '8', '16', '24'], 'a': 2, 'ex': '2⁴=16.'}, {'q': 'Hệ số x² trong (1+x)⁵?', 'o': ['5', '10', '20', '15'], 'a': 1, 'ex': 'C₅²=10.'}, {'q': 'P₆ = ?', 'o': ['720', '120', '24', '360'], 'a': 0, 'ex': '6!=720.'}];
  const tfC=[{'s': 'Aₙᵏ = k!·Cₙᵏ.', 'a': true, 'ex': 'ĐÚNG — Aₙᵏ = Cₙᵏ×k!.'}, {'s': 'C₁₀⁴ = C₁₀⁶.', 'a': true, 'ex': 'ĐÚNG — Cₙᵏ=Cₙⁿ⁻ᵏ → C₁₀⁴=C₁₀⁶.'}, {'s': '(a+b)⁵ có 6 số hạng.', 'a': true, 'ex': 'ĐÚNG — n+1=6.'}, {'s': 'Trong nhị thức Newton, T₁ ứng với k=1.', 'a': false, 'ex': 'SAI — T₁ ứng với k=0 (T_{k+1} với k=0).'}, {'s': '5! = 120.', 'a': true, 'ex': 'ĐÚNG — 5!=5×4×3×2×1=120.'}];
  const fQ=[{'id': 'f1', 'tp': 'Cₙᵏ = n! / (k! × ___)', 'ans': '(n-k)!', 'alt': ['(n-k)!', '(n−k)!'], 'h': ''}, {'id': 'f2', 'tp': 'C₁₀² = ___', 'ans': '45', 'alt': ['45'], 'h': '10×9/2'}, {'id': 'f3', 'tp': 'Σₖ₌₀³ C₃ᵏ = ___', 'ans': '8', 'alt': ['8'], 'h': '2³=8'}];
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
    <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/Cacbaitoan10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
    <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
      <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương VIII · Tổ Hợp</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Ôn Tập Chương VIII</div></div>
      <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 VI</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 EN</button></div>
    </header>
    <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
      <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
              <div key={"0"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Ôn quy tắc cộng và nhân. / Review addition and multiplication rules.</div>
        <div key={"1"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Thành thạo ba công thức Pₙ, Aₙᵏ, Cₙᵏ. / Master three formulas Pₙ, Aₙᵏ, Cₙᵏ.</div>
        <div key={"2"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Khai triển nhị thức Newton. / Expand using the Binomial Theorem.</div>
        <div key={"3"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Tìm số hạng chứa lũy thừa. / Find terms with specific powers.</div>
        <div key={"4"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Kết hợp nhiều kỹ năng đếm. / Combine multiple counting skills.</div>
    </div>
    <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

    <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,marginBottom:40,transition:"all 0.3s"}}>
      {[{slug:"quy-tac-cong-nhan",num:"27",title:t("Quy Tắc Cộng & Nhân","Add & Mult. Rules")},{slug:"hoan-vi-chinh-hop-to-hop",num:"28",title:t("Hoán Vị, Chỉnh Hợp, Tổ Hợp","P, A, C")},{slug:"nhi-thuc-newton",num:"29",title:t("Nhị Thức Newton","Binomial Theorem")}].map(l=>(<Link key={l.slug} href={`/cacbailam10/${l.slug}`} style={{textDecoration:"none"}}><article style={{padding:14,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",cursor:"pointer"}}><div style={{fontSize:12,color:"#777",marginBottom:3}}>{t("Bài","L")} {l.num}</div><div style={{fontSize:14,fontWeight:600,color:"#0B4F5C"}}>{l.title}</div></article></Link>))}
    </div>
    <section id="tomTat" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📚" title={t("Tóm Tắt Chương VIII","Chapter VIII Summary")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,transition:"all 0.3s"}}>
        {[{title:t("Quy Tắc Đếm","Counting Rules"),pts:["QT Nhân: N=n₁×n₂×...×nₖ (đồng thời)","QT Cộng: N=n₁+n₂+...+nₖ (xung khắc)"]},
          {title:t("Công Thức","Formulas"),pts:["Pₙ = n! (hoán vị)","Aₙᵏ = n!/(n−k)! (chỉnh hợp, có TT)","Cₙᵏ = n!/(k!(n−k)!) (tổ hợp, không TT)","Cₙᵏ = Cₙⁿ⁻ᵏ"]},
          {title:t("Nhị Thức Newton","Binomial Theorem"),pts:["(a+b)ⁿ = ΣCₙᵏ·aⁿ⁻ᵏ·bᵏ","T_{k+1}=Cₙᵏ·aⁿ⁻ᵏ·bᵏ (k=0..n)","Σ Cₙᵏ = 2ⁿ (tổng hệ số)","Tam Giác Pascal: tổng 2 số trên"]},
        ].map((card,i)=>(<article key={i} style={{padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:10}}>{card.title}</div>{card.pts.map((pt,j)=><div key={j} style={{fontSize:13,color:"#555",marginBottom:7,display:"flex",gap:8}}><span style={{color:"#0B4F5C",fontWeight:700,flexShrink:0}}>•</span><span style={{fontFamily:"monospace"}}>{pt}</span></div>)}</article>))}
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="HDLBCv4yyIs"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy India (YouTube)", "Video by Khan Academy India (YouTube)")}
          />
        </div>
      </section>
    <section id="baiTap" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Bài Tập Tổng Hợp","Mixed Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",badge:"L27+28",q:t("Từ {0,1,2,3,4,5} lập số tự nhiên có 4 chữ số khác nhau và chữ số đầu ≠ 0. Bao nhiêu số?","From {0,1,2,3,4,5} form 4-digit numbers with distinct digits, first digit ≠ 0. How many?"),a:[t("Hàng nghìn: 5 cách (1-5, không dùng 0)","Thousands: 5 ways (1-5, not 0)"),t("Hàng trăm: 5 cách (0 và 4 số còn lại)","Hundreds: 5 ways"),t("Hàng chục: 4 cách, hàng đơn vị: 3 cách","Tens: 4, Units: 3"),"5×5×4×3 = 300"]},
          {id:"e2",badge:"L28",q:t("Lớp 10 có 20 HS: 12 nam, 8 nữ. Chọn 3 HS bao gồm ít nhất 1 nữ. Bao nhiêu cách?","Class of 20: 12 boys, 8 girls. Choose 3 including at least 1 girl. How many?"),a:[t("Cách 1: Tổng − (không có nữ) = C₂₀³ − C₁₂³","Total − all-boys = C₂₀³−C₁₂³"),"C₂₀³ = 1140; C₁₂³ = 220","1140 − 220 = 920"]},
          {id:"e3",badge:"L29",q:t("Tìm hệ số của x³ trong khai triển (2+x)⁵.","Find coefficient of x³ in (2+x)⁵."),a:["T_{k+1} = C₅ᵏ·2⁵⁻ᵏ·xᵏ",t("Cần k=3: T₄ = C₅³·2²·x³ = 10·4·x³ = 40x³","Need k=3: T₄=10·4=40"),"Hệ số x³ = 40"]},
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
    <div className="reveal" data-reveal style={{textAlign:"center",color:"#777",fontSize:15,marginBottom:60}}>Toán 10 · Chân Trời Sáng Tạo · Ôn Tập Chương VIII</div>
    <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
  <DuoTranslate/> 
  </div></div>);
}
