
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);
export default function Lesson23_PhuongTrinhQuyVeBacHai() {
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
  const mcQ=[{'q': 'x⁴−5x²+4=0. Đặt t=x²: phương trình theo t là?', 'o': ['t²−5t+4=0', 't²+5t+4=0', 't²−5t−4=0', '2t−5=0'], 'a': 0, 'ex': 't=x²: (x²)²−5(x²)+4=t²−5t+4=0.'}, {'q': 'Phương trình trùng phương ax⁴+bx²+c=0 dùng ẩn phụ t=?', 'o': ['t=x', 't=x²', 't=x³', 't=√x'], 'a': 1, 'ex': 'Đặt t=x²≥0 để đưa về bậc hai.'}, {'q': 'Từ t=x²=4, giá trị x là?', 'o': ['x=4', 'x=2', 'x=±2', 'x=±4'], 'a': 2, 'ex': 'x²=4 → x=±2.'}, {'q': '√(x+1)=x−1. Điều kiện là?', 'o': ['x≥−1', 'x≥1', 'x≥0', 'x≥−1 và x≥1'], 'a': 3, 'ex': '√(x+1): x+1≥0→x≥−1; vế phải x−1≥0→x≥1. Kết hợp: x≥1.'}, {'q': 'x⁴−x²=0. Nghiệm?', 'o': ['x=0 hoặc x=1', 'x=0 hoặc x=±1', 'x=1', 'x=±1'], 'a': 1, 'ex': 'x²(x²−1)=0 → x²=0 (x=0) hoặc x²=1 (x=±1).'}];
  const tfC=[{'s': 'x⁴−3x²+2=0 có tất cả 4 nghiệm thực.', 'a': true, 'ex': 'ĐÚNG — t²−3t+2=(t−1)(t−2)=0; t=1→x=±1; t=2→x=±√2. Tổng 4 nghiệm.'}, {'s': 'Khi giải √f(x)=g(x), sau khi bình phương phải kiểm tra lại nghiệm.', 'a': true, 'ex': 'ĐÚNG — bình phương có thể tạo ra nghiệm ngoại lai.'}, {'s': 'x⁴+x²+1=0 có 2 nghiệm thực.', 'a': false, 'ex': 'SAI — t²+t+1=0 (t=x²≥0): Δ=1−4=−3<0 → vô nghiệm. PT không có nghiệm thực.'}, {'s': 'Phương trình tích A·B=0 khi và chỉ khi A=0 hoặc B=0.', 'a': true, 'ex': 'ĐÚNG — đây là tính chất cơ bản.'}, {'s': 'Từ t=x²=−1, ta được x=±i (nghiệm ảo).', 'a': false, 'ex': 'SAI — trong ℝ, x²=−1 vô nghiệm (loại). Chỉ làm việc trong ℝ.'}];
  const fQ=[{'id': 'f1', 'tp': 'x⁴−10x²+9=0. Đặt t=x², phương trình: t²−10t+___ =0', 'ans': '9', 'alt': ['9'], 'h': ''}, {'id': 'f2', 'tp': 'x⁴−10x²+9=0 có ___ nghiệm thực.', 'ans': '4', 'alt': ['4', 'bốn', 'four'], 'h': 't=1→x=±1; t=9→x=±3'}, {'id': 'f3', 'tp': '√(2x+1)=3. Bình phương: 2x+1=___', 'ans': '9', 'alt': ['9'], 'h': '3²=9'}];
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
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. PT Trùng Phương","1. Biquadratic")],["k2","📖",t("2. PT Chứa Căn","2. With Roots")],["k3","📖",t("3. PT Tích","3. Product Form")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮",t("Mini Game","Mini Game")]];
  return(<div style={{width:"100%",background:"#fff",display:"flex",justifyContent:"center"}}><div style={{width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80}}>
    <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/Cacbaitoan10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
    <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
      <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương VII · Bất Phương Trình Bậc Hai Một Ẩn</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Bài 23: Phương Trình Quy Về Bậc Hai</div></div>
      <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 Tiếng Việt</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 English</button></div>
    </header>
    <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
      <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
      {[
        t("Giải phương trình trùng phương ax⁴+bx²+c=0 bằng ẩn phụ t=x².","Solve biquadratic ax⁴+bx²+c=0 using t=x²."),
        t("Giải phương trình chứa căn bậc hai.","Solve equations containing square roots."),
        t("Giải phương trình dạng tích.","Solve product-form equations."),
        t("Biết điều kiện xác định và đối chiếu nghiệm.","Identify conditions and check solutions."),
        t("Kết hợp bảng xét dấu để giải BPT bậc 4.","Combine sign tables to solve degree-4 inequalities."),
      ].map((item, idx) => (
        <div key={idx} style={{fontSize:15,color:"#555",marginBottom:6}}>{item}</div>
      ))}
    </div>
    <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Nhiều phương trình thoạt nhìn không phải bậc hai nhưng sau khi đặt ẩn phụ hoặc biến đổi sẽ trở thành phương trình bậc hai. Đây là kỹ năng quan trọng trong đại số.","Many equations that appear non-quadratic become quadratic after substitution or transformation. This is a key algebraic skill.")}</div>
        <div style={{fontSize:16}}>❓ <em>{t("x⁴−5x²+4=0 có phải phương trình bậc hai không? Gợi ý: đặt t=x².","Is x⁴−5x²+4=0 a quadratic? Hint: let t=x².")}</em></div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="6b_m7wZPhhU"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Animate Math (Manim Engine)", "Video by Animate Math (Manim Engine)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Phương Trình Trùng Phương","1. Biquadratic Equations")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:10}}>{t("Dạng: ax⁴+bx²+c=0 (a≠0)","Form: ax⁴+bx²+c=0 (a≠0)")}</div>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Đặt t=x² (t≥0) → at²+bt+c=0 (phương trình bậc hai theo t).","Let t=x² (t≥0) → at²+bt+c=0.")}</div>
        <div style={{background:"white",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:14,lineHeight:2}}>
          t = x² ≥ 0 (điều kiện cần nhớ!)<br/>
          t &gt; 0 → x = ±√t<br/>
          t = 0 → x = 0<br/>
          t &lt; 0 → loại (không có nghiệm thực)
        </div>
      </div>
      <div className="reveal" data-reveal style={{padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:10}}>📘 {t("Ví dụ: x⁴−5x²+4=0","Example: x⁴−5x²+4=0")}</div>
        <div style={{fontSize:14,color:"#555",display:"flex",flexDirection:"column",gap:6}}>
          <div>{t("Đặt t=x²: t²−5t+4=0","Let t=x²: t²−5t+4=0")}</div>
          <div>{t("(t−1)(t−4)=0 → t=1 hoặc t=4","(t−1)(t−4)=0 → t=1 or t=4")}</div>
          <div>{t("t=1: x²=1 → x=±1; t=4: x²=4 → x=±2","t=1: x=±1; t=4: x=±2")}</div>
          <div style={{color:"#1e8449",fontWeight:600}}>{t("Nghiệm: x∈{−2,−1,1,2}","Solutions: x∈{−2,−1,1,2}")}</div>
        </div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Phương Trình Chứa Căn","2. Equations with Square Roots")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:18,transition:"all 0.3s"}}>
        {[{title:t("Dạng √f(x)=g(x)","Form √f(x)=g(x)"),steps:[t("ĐK: f(x)≥0 và g(x)≥0","Cond: f(x)≥0 and g(x)≥0"),t("Bình phương: f(x)=g²(x)","Square both: f(x)=g²(x)"),t("Giải và đối chiếu ĐK","Solve and check conditions")],c:"#1a5276",bg:"#eaf4fb"},
          {title:t("Dạng √(ax²+bx+c)=√(dx²+ex+f)","Form with equal roots"),steps:[t("ĐK: cả hai vế ≥0","Cond: both sides ≥0"),t("Bình phương: ax²+bx+c=dx²+ex+f","Square: equate expressions"),t("Giải pt bậc 1 hoặc 2","Solve linear or quadratic")],c:"#1e8449",bg:"#eafaf1"},
          {title:t("Đặt ẩn phụ √f(x)=t (t≥0)","Substitution √f(x)=t, t≥0"),steps:[t("Đặt t=√(ax²+bx+c), t≥0","Let t=√(ax²+bx+c), t≥0"),t("Biểu diễn pt theo t","Rewrite equation in t"),t("Giải, tìm x từ t","Solve, recover x from t")],c:"#922b21",bg:"#fdf2f2"},
        ].map((card,i)=>(<article key={i} style={{padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:14,fontWeight:700,color:card.c,marginBottom:10}}>{card.title}</div>{card.steps.map((s,j)=><div key={j} style={{fontSize:13,color:"#555",marginBottom:6,display:"flex",gap:8}}><span style={{color:card.c,fontWeight:700}}>→</span><span>{s}</span></div>)}</article>))}
      </div>
    </section>
    <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("3. Phương Trình Tích","3. Product Form Equations")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Đưa về dạng tích A·B=0, rồi giải A=0 hoặc B=0:","Reduce to product A·B=0, then solve A=0 or B=0:")}</div>
        <div style={{background:"white",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:14,lineHeight:2}}>
          x³−4x=0 → x(x²−4)=0 → x(x−2)(x+2)=0<br/>
          → x=0 hoặc x=2 hoặc x=−2<br/><br/>
          x⁴−x²−6=0 → (x²−3)(x²+2)=0<br/>
          → x²=3 (x=±√3) hoặc x²=−2 (loại)
        </div>
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:"x⁴−13x²+36=0",a:[t("Đặt t=x²: t²−13t+36=0","Let t=x²: t²−13t+36=0"),t("(t−4)(t−9)=0 → t=4 hoặc t=9","t=4 or t=9"),t("x²=4→x=±2; x²=9→x=±3","x=±2 or x=±3")]},
          {id:"e2",q:"√(x+3)=x−1",a:[t("ĐK: x+3≥0 → x≥−3; và x−1≥0 → x≥1","Cond: x≥−3 and x−1≥0 → x≥1"),t("Bình phương: x+3=(x−1)²=x²−2x+1","Square: x+3=x²−2x+1"),t("x²−3x−2=... đúng là x²−3x−2=0? Kiểm tra: x+3=x²−2x+1 → x²−3x−2=0","x²−3x−2=0"),t("x=(3±√17)/2. Kiểm tra x≥1: x=(3+√17)/2≈3.56 ✓; x=(3−√17)/2≈−0.56 ✗","x=(3+√17)/2 only")]},
          {id:"e3",q:"x⁴−5x²+4≤0",a:[t("Đặt t=x²≥0: t²−5t+4=(t−1)(t−4)≤0","Let t=x²: (t−1)(t−4)≤0"),t("1≤t≤4, kết hợp t=x²≥0: 1≤x²≤4","1≤x²≤4"),t("x²≥1 và x²≤4 → 1≤|x|≤2 → x∈[−2,−1]∪[1,2]","x∈[−2,−1]∪[1,2]")]},
        ].map(({id,q,a})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:18,fontWeight:600,marginBottom:4}}>📝 {t("Bài tập","Exercise")}</div><div style={{fontFamily:"monospace",fontSize:16,color:"#0B4F5C"}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color:"#555",marginBottom:6}}>{l}</div>)}</div>}</article>))}
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
    <div className="reveal" data-reveal style={{textAlign:"center",color:"#777",fontSize:15,marginBottom:60}}>Toán 10 · Chân Trời Sáng Tạo · Bài 25 / Chương VII</div>
    <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
  <DuoTranslate/> 
  </div></div>);
}
