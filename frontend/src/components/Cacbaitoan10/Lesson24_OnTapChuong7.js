
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);
export default function Lesson24_OnTapChuong7() {
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
        { text: "A", vi: "Một" },
        { text: "quadratic", vi: "bậc hai" },
        { text: "trinomial", vi: "tam thức,", detail: "<b>Quadratic trinomial (Tam thức bậc hai)</b>:<br/>Biểu thức dạng f(x) = ax² + bx + c với a ≠ 0.", detailTitle: "Quadratic trinomial" },
        { text: "sign", vi: "dấu,", detail: "<b>Sign (Dấu của tam thức)</b>: Giá trị âm (-), dương (+) hoặc bằng 0 của tam thức bậc hai.", detailTitle: "Sign (Dấu)" },
        { text: "depends", vi: "phụ thuộc" },
        { text: "on", vi: "vào" },
        { text: "the", vi: "hệ số" },
        { text: "leading", vi: "dẫn đầu" },
        { text: "coefficient.", vi: "hệ số.", detail: "<b>Leading coefficient (Hệ số chính)</b>:<br/>Hệ số a đi với x² trong tam thức bậc hai.", detailTitle: "Leading coefficient" }
      ]
    },
    {
      start: 6, end: 12,
      words: [
        { text: "Make", vi: "Lập" },
        { text: "a", vi: "một" },
        { text: "sign", vi: "dấu" },
        { text: "chart", vi: "bảng xét dấu,", detail: "<b>Sign chart (Bảng xét dấu)</b>:<br/>Bảng tóm tắt dấu của tam thức bậc hai trên các khoảng xét định bởi nghiệm.", detailTitle: "Sign chart" },
        { text: "using", vi: "sử dụng" },
        { text: "the", vi: "các" },
        { text: "roots.", vi: "nghiệm số.", detail: "<b>Roots (Các nghiệm)</b>: Giá trị x làm cho tam thức bằng 0, được tìm qua việc giải phương trình f(x) = 0.", detailTitle: "Roots (Nghiệm)" }
      ]
    },
    {
      start: 12, end: 18,
      words: [
        { text: "Solve", vi: "Giải" },
        { text: "the", vi: "bất phương trình" },
        { text: "quadratic", vi: "bậc hai" },
        { text: "inequality", vi: "bất phương trình,", detail: "<b>Quadratic inequality (Bất phương trình bậc hai)</b>:<br/>Bất phương trình có dạng f(x) > 0, f(x) < 0, f(x) ≥ 0, f(x) ≤ 0 với f(x) là tam thức bậc hai.", detailTitle: "Quadratic inequality" },
        { text: "to", vi: "để" },
        { text: "find", vi: "tìm" },
        { text: "the", vi: "khoảng" },
        { text: "solution", vi: "nghiệm" },
        { text: "interval.", vi: "khoảng nghiệm.", detail: "<b>Solution interval (Khoảng nghiệm)</b>:<br/>Tập hợp các khoảng số thực thỏa mãn bất phương trình.", detailTitle: "Solution interval" }
      ]
    }
  ];


  const sc=(id)=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});};
  const tr=(id)=>setRev(p=>(({...p,[id]:!p[id]})));
  const mcQ=[{'q': 'f(x)=x²+x+1. Dấu f(x)?', 'o': ['Luôn âm', 'Luôn dương', 'Đổi dấu tại 2 điểm', 'Bằng 0'], 'a': 1, 'ex': 'a=1>0, Δ=1−4=−3<0 → f(x)>0 mọi x.'}, {'q': 'Nghiệm của 2x²−3x−2<0?', 'o': ['(−1/2,2)', '(−∞,−1/2)∪(2,+∞)', '[−1/2,2]', 'ℝ'], 'a': 0, 'ex': 'Δ=9+16=25; x₁=−1/2,x₂=2. a>0,<0→(−1/2,2).'}, {'q': 'x⁴−4=0. Nghiệm thực?', 'o': ['x=±2', 'x=±√2', 'x=±2 và x=±√2', 'x=2'], 'a': 1, 'ex': 't=x²: t²=4→t=2 (t=−2 loại). x²=2→x=±√2.'}, {'q': 'Nghiệm của x²≥0?', 'o': ['∅', 'ℝ', '(0,+∞)', '[0,+∞)'], 'a': 1, 'ex': 'x² ≥ 0 với mọi x thực → nghiệm là ℝ.'}, {'q': 'a>0, Δ>0. Nghiệm BPT ax²+bx+c≤0?', 'o': ['(x₁,x₂)', '[x₁,x₂]', '(−∞,x₁)∪(x₂,+∞)', '∅'], 'a': 1, 'ex': 'a>0,Δ>0: f≤0 trong [x₁,x₂].'}];
  const tfC=[{'s': 'f(x)=x²−2x+1=(x−1)²≥0 với mọi x.', 'a': true, 'ex': 'ĐÚNG — bình phương ≥0, bằng 0 tại x=1.'}, {'s': 'Nghiệm của x²−4x+4<0 là ∅.', 'a': true, 'ex': 'ĐÚNG — (x−2)²<0 vô nghiệm vì bình phương ≥0.'}, {'s': 'x⁴+1=0 có 2 nghiệm phức.', 'a': false, 'ex': 'SAI — trong bài toán Toán 10, ta chỉ xét nghiệm THỰC. Vô nghiệm thực.'}, {'s': 'Để ax²+bx+c>0 với mọi x∈ℝ, cần a>0 và Δ<0.', 'a': true, 'ex': 'ĐÚNG — cả hai điều kiện cần và đủ.'}, {'s': 'Nghiệm của x²−9≤0 là [−3,3].', 'a': true, 'ex': 'ĐÚNG — x₁=−3,x₂=3. a>0,≤0→[−3,3].'}];
  const fQ=[{'id': 'f1', 'tp': 'Để f(x)=ax²+bx+c>0 mọi x, cần a>0 và Δ___ 0', 'ans': '<', 'alt': ['<', 'nhỏ hơn', 'less than'], 'h': ''}, {'id': 'f2', 'tp': 'Nghiệm của x²−x−6≤0 là [___,___]', 'ans': '-2, 3', 'alt': ['-2,3', '[−2,3]', '−2,3', '-2 3'], 'h': 'x₁=−2,x₂=3'}, {'id': 'f3', 'tp': 'x⁴−5x²+4=0: sau đặt t=x² ta có (t−1)(t−___)=0', 'ans': '4', 'alt': ['4'], 'h': ''}];
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
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["congThuc","📐",t("Bảng Nghiệm","Solution Table")],["baiTap","✏️",t("Bài Tập TH","Mixed")],["mg","🎮",t("Mini Game","Mini Game")]];
  return(<div style={{width:"100%",background:"#fff",display:"flex",justifyContent:"center"}}><div style={{width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80}}>
    <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/Cacbaitoan10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
    <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
      <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương VII · Bất Phương Trình Bậc Hai Một Ẩn</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Ôn Tập Chương VII</div></div>
      <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 Tiếng Việt</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 English</button></div>
    </header>
    <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
      <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
      {[
        t("Ôn tập toàn bộ lý thuyết xét dấu tam thức bậc hai.","Review the complete sign theory for quadratic trinomials."),
        t("Thành thạo bảng nghiệm 6 trường hợp.","Master the 6-case solution table."),
        t("Giải thành thạo BPT bậc hai mọi dạng.","Fluently solve all forms of quadratic inequalities."),
        t("Giải phương trình trùng phương và PT chứa căn.","Solve biquadratic and radical equations."),
        t("Giải bài toán tham số liên quan đến BPT bậc hai.","Handle parameter problems in quadratic inequalities."),
      ].map((item, idx) => (
        <div key={idx} style={{fontSize:15,color:"#555",marginBottom:6}}>{item}</div>
      ))}
    </div>
    <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

    <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14,marginBottom:40,transition:"all 0.3s"}}>
      {[{slug:"dau-tam-thuc-bac-hai",num:"23",title:t("Dấu Tam Thức Bậc Hai","Sign of Quadratic")},{slug:"giai-bpt-bac-hai",num:"24",title:t("Giải BPT Bậc Hai","Solving Quadratic Ineq.")},{slug:"phuong-trinh-quy-ve-bac-hai",num:"25",title:t("PT Quy Về Bậc Hai","Reducible Equations")}].map(l=>(<Link key={l.slug} href={`/cacbailam10/${l.slug}`} style={{textDecoration:"none"}}><article style={{padding:14,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",cursor:"pointer"}}><div style={{fontSize:12,color:"#777",marginBottom:3}}>{t("Bài","L")} {l.num}</div><div style={{fontSize:14,fontWeight:600,color:"#0B4F5C"}}>{l.title}</div><div style={{fontSize:12,color:"#aaa",marginTop:3}}>← {t("Ôn lại","Review")}</div></article></Link>))}
    </div>
    <section id="tomTat" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📚" title={t("Tóm Tắt Chương VII","Chapter VII Summary")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:22,transition:"all 0.3s"}}>
        {[{title:t("Bài 23 · Dấu Tam Thức Bậc Hai","L23 · Sign of Quadratic Trinomial"),pts:[t("f(x)=ax²+bx+c; Δ=b²−4ac","f(x)=ax²+bx+c; Δ=b²−4ac"),t("a>0,Δ>0: − trong (x₁,x₂), + ngoài","a>0,Δ>0: − inside (x₁,x₂), + outside"),t("a>0,Δ≤0: f(x)≥0 mọi x","a>0,Δ≤0: f(x)≥0 for all x"),t("a<0,Δ>0: + trong, − ngoài","a<0,Δ>0: + inside, − outside"),t("a<0,Δ≤0: f(x)≤0 mọi x","a<0,Δ≤0: f(x)≤0 for all x")]},
          {title:t("Bài 24 · Giải BPT Bậc Hai","L24 · Solving Quadratic Inequalities"),pts:[t("3 bước: tính Δ → bảng dấu → đọc nghiệm","3 steps: Δ → sign table → read solution"),t("a>0,Δ>0: f<0↔(x₁,x₂); f>0↔ngoài","a>0,Δ>0: f<0↔(x₁,x₂); f>0↔outside"),t("Đặc biệt: Δ<0,a>0→luôn dương","Special: Δ<0,a>0→always positive"),t("BPT tham số: điều kiện trên Δ","Parameter: condition on Δ")]},
          {title:t("Bài 25 · PT Quy Về Bậc Hai","L25 · Equations Reducible to Quadratic"),pts:[t("Trùng phương: đặt t=x²≥0","Biquadratic: let t=x²≥0"),t("t>0→x=±√t; t=0→x=0; t<0→loại","t>0→x=±√t; t=0→x=0; t<0→reject"),t("PT chứa căn: đặt ĐK rồi bình phương","Root equations: set conditions then square"),t("PT tích: A·B=0↔A=0 hoặc B=0","Product: A·B=0↔A=0 or B=0")]},
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
            videoId="xdiBjypYFRQ"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Animate Math (Manim Engine)", "Video by Animate Math (Manim Engine)")}
          />
        </div>
      </section>
    <section id="congThuc" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📐" title={t("Bảng Công Thức & Nghiệm","Formula & Solution Table")} />
      <div className="reveal" data-reveal style={{overflowX:"auto",borderRadius:10,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:13,minWidth:600}}>
          <thead><tr style={{background:"#0B4F5C",color:"white"}}>{["Điều kiện","f>0","f≥0","f<0","f≤0"].map((h,i)=><td key={i} style={{padding:"10px 12px",textAlign:"center",fontWeight:700,border:"1px solid rgba(255,255,255,0.2)"}}>{h}</td>)}</tr></thead>
          <tbody>
            {[["a>0, Δ>0","(−∞,x₁)∪(x₂,+∞)","(−∞,x₁]∪[x₂,+∞)","(x₁,x₂)","[x₁,x₂]"],
              ["a>0, Δ=0","ℝ\{x₀}","ℝ","∅","{x₀}"],
              ["a>0, Δ<0","ℝ","ℝ","∅","∅"],
              ["a<0, Δ>0","(x₁,x₂)","[x₁,x₂]","(−∞,x₁)∪(x₂,+∞)","(−∞,x₁]∪[x₂,+∞)"],
              ["a<0, Δ=0","∅","{x₀}","ℝ\{x₀}","ℝ"],
              ["a<0, Δ<0","∅","∅","ℝ","ℝ"]
            ].map((row,ri)=>(<tr key={ri} style={{background:ri%2===0?"#f9f9f9":"white"}}>{row.map((cell,ci)=>(<td key={ci} style={{padding:"8px 12px",textAlign:"center",border:"1px solid #e0e0e0",fontFamily:"monospace",fontSize:12,fontWeight:ci===0?700:400,color:ci===0?"#0B4F5C":"#333"}}>{cell}</td>))}</tr>))}
          </tbody>
        </table>
      </div>
    </section>
    <section id="baiTap" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Bài Tập Tổng Hợp","Mixed Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",badge:"L23+24",q:t(`Giải bất phương trình:
(a) x²−x−6>0
(b) −2x²+4x−2≥0`,`Solve:
(a) x²−x−6>0
(b) −2x²+4x−2≥0`),a:[t("(a) Δ=1+24=25; x₁=−2,x₂=3. a>0,BPT>0 → (−∞,−2)∪(3,+∞)","(a) roots −2,3. a>0,>0 → (−∞,−2)∪(3,+∞)"),t("(b) −2(x²−2x+1)=−2(x−1)²≥0","−2(x−1)²≥0"),t("−2(x−1)²≤0 mọi x, =0 khi x=1 → −2(x−1)²≥0 chỉ khi x=1","Only x=1 gives ≥0 → solution: {1}")]},
          {id:"e2",badge:"L25",q:t("Giải phương trình: x⁴−10x²+9=0","Solve: x⁴−10x²+9=0"),a:[t("Đặt t=x²≥0: t²−10t+9=0","Let t=x²: t²−10t+9=0"),t("(t−1)(t−9)=0 → t=1 hoặc t=9","t=1 or t=9"),t("x²=1→x=±1; x²=9→x=±3","x=±1 or x=±3"),t("Tất cả 4 nghiệm: {−3,−1,1,3}","4 solutions: {−3,−1,1,3}")]},
          {id:"e3",badge:t("Tổng hợp","Mixed"),q:t("Tìm m để BPT x²−2(m+1)x+m²+3m+2>0 đúng với mọi x.","Find m so that x²−2(m+1)x+m²+3m+2>0 for all x."),a:[t("a=1>0. Cần Δ<0.","a=1>0. Need Δ<0."),t("Δ=4(m+1)²−4(m²+3m+2)","Δ=4(m+1)²−4(m²+3m+2)"),t("=4(m²+2m+1−m²−3m−2)=4(−m−1)=−4m−4","=−4m−4"),t("Δ<0: −4m−4<0 → m>−1","Δ<0 → m>−1")]},
        ].map(({id,q,a,badge})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}><div style={{fontSize:17,fontWeight:600}}>📝 {t("Bài tập","Exercise")}</div><span style={{background:"black",color:"white",fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20}}>{badge}</span></div><div style={{fontSize:15,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color:"#555",marginBottom:6}}>{l}</div>)}</div>}</article>))}
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
    <div className="reveal" data-reveal style={{textAlign:"center",color:"#777",fontSize:15,marginBottom:60}}>Toán 10 · Chân Trời Sáng Tạo · Ôn Tập Chương VII</div>
    <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
  <DuoTranslate/> 
  </div></div>);
}
