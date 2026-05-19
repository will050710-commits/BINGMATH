
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

export default function Lesson21_DauTamThucBacHai() {
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

  const mcQ=[
    {q:t("Tam thức f(x)=ax²+bx+c (a>0) có Δ>0. Dấu của f(x) khi x∈(x₁,x₂)?","f(x)=ax²+bx+c (a>0), Δ>0. Sign of f(x) for x∈(x₁,x₂)?"),o:[t("Dương","Positive"),t("Âm","Negative"),t("Bằng 0","Zero"),t("Không xác định","Undefined")],a:1,ex:t("a>0, Δ>0: f(x)<0 khi x∈(x₁,x₂), f(x)>0 khi x<x₁ hoặc x>x₂.","a>0, Δ>0: f(x)<0 for x∈(x₁,x₂), f(x)>0 outside.")},
    {q:t("f(x)=x²−5x+6. Dấu của f(x) khi x∈(2,3)?","f(x)=x²−5x+6. Sign for x∈(2,3)?"),o:[t("Dương","Positive"),t("Âm","Negative"),"=0",t("Không xác định","Undefined")],a:1,ex:t("Δ=25−24=1>0; x₁=2, x₂=3. a=1>0 → f(x)<0 giữa 2 nghiệm.","Roots 2 and 3. a>0 → f<0 between roots.")},
    {q:t("f(x)=−x²+4x−5. Δ=?","f(x)=−x²+4x−5. Δ=?"),o:["4","−4","36","−36"],a:1,ex:t("Δ=b²−4ac=16−4·(−1)·(−5)=16−20=−4<0.","Δ=16−20=−4<0.")},
    {q:t("f(x)=ax²+bx+c (a>0), Δ<0. Dấu của f(x)?","f(x)=ax²+bx+c, a>0, Δ<0. Sign?"),o:[t("Luôn âm","Always negative"),t("Luôn dương","Always positive"),t("Đổi dấu","Changes sign"),t("Bằng 0","Always zero")],a:1,ex:t("a>0, Δ<0: parabol không cắt Ox, luôn nằm trên Ox → f(x)>0 với mọi x.","a>0, Δ<0: parabola above Ox → f(x)>0 for all x.")},
    {q:t("f(x)=2x²−8x+8. Tập nghiệm f(x)≤0 là?","f(x)=2x²−8x+8. Solution set of f(x)≤0?"),o:["{2}","(−∞,2]","[2,+∞)","∅"],a:0,ex:t("Δ=64−64=0; x₀=2. a=2>0 → f(x)≥0, f=0 chỉ tại x=2. Vậy f(x)≤0 ⟺ x=2.","Δ=0, x₀=2. f(x)≥0 with equality only at x=2.")},
  ];
  const tfC=[
    {s:t("Nếu a>0 và Δ<0, thì f(x)=ax²+bx+c>0 với mọi x.","If a>0 and Δ<0, then f(x)>0 for all x."),a:true,ex:t("ĐÚNG — parabol mở lên, không cắt Ox → luôn dương.","TRUE — opens up, no x-intercepts → always positive.")},
    {s:t("f(x)=x²−4x+4=(x−2)² luôn không âm.","f(x)=(x−2)² is always non-negative."),a:true,ex:t("ĐÚNG — bình phương ≥0, bằng 0 khi x=2.","TRUE — square ≥0, equals 0 when x=2.")},
    {s:t("Nếu a<0 và Δ>0, f(x)>0 với x ngoài khoảng (x₁,x₂).","If a<0 and Δ>0, f(x)>0 outside (x₁,x₂)."),a:false,ex:t("SAI — a<0: f(x)>0 trong khoảng (x₁,x₂), âm ngoài khoảng.","FALSE — a<0: f>0 INSIDE (x₁,x₂), negative outside.")},
    {s:t("Tam thức bậc hai có thể có 0, 1 hoặc 2 nghiệm thực.","A quadratic trinomial can have 0, 1, or 2 real roots."),a:true,ex:t("ĐÚNG — tùy thuộc Δ<0 (vô nghiệm), Δ=0 (nghiệm kép), Δ>0 (2 nghiệm).","TRUE — depends on sign of Δ.")},
    {s:t("Nếu Δ=0, tam thức có nghiệm kép x₀=−b/(2a) và f(x)≥0 khi a>0.","If Δ=0, f has double root x₀=−b/2a and f(x)≥0 for a>0."),a:true,ex:t("ĐÚNG — Δ=0: f(x)=a(x−x₀)²≥0 khi a>0.","TRUE — Δ=0: f=a(x−x₀)²≥0 for a>0.")},
  ];
  const fQ=[
    {id:"f1",tp:t("f(x)=ax²+bx+c, a>0, Δ>0. Dấu f(x)<0 khi x thuộc ___.","f(x)=ax²+bx+c, a>0, Δ>0. f(x)<0 when x ∈ ___."),ans:"(x₁,x₂)",alt:["(x1,x2)","x1x2","giữa hai nghiệm","between roots"],h:t("Giữa hai nghiệm","Between the two roots")},
    {id:"f2",tp:t("Δ = b² − ___ · a · c","Δ = b² − ___ · a · c"),ans:"4",alt:["4"],h:""},
    {id:"f3",tp:t("f(x)=x²−6x+9=(x−___)²","f(x)=x²−6x+9=(x−___)²"),ans:"3",alt:["3"],h:"√9=3"},
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
  const tabs=[["w","🚀",t("Khởi động","Warm-Up")],["k1","📖",t("1. Định Nghĩa","1. Definition")],["k2","📖",t("2. Bảng Xét Dấu","2. Sign Table")],["k3","📖",t("3. Các Trường Hợp","3. All Cases")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮","Mini Game"]];

  return (
    <div style={{ width:"100%",background:"#fff",display:"flex",justifyContent:"center" }}>
    <div style={{ width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80 }}>
      <div className="reveal" data-reveal style={{ marginBottom:24 }}>
        <Link href="/Cacbaitoan10" style={{ textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15 }}>← {t("Quay lại","Back")}</Link>
      </div>
      <header className="reveal" data-reveal style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300 }}>
        <div>
          <div style={{ fontWeight:"bold",fontSize:22,color:"#0B4F5C" }}>{t("Chương VII · Bất Phương Trình Bậc Hai Một Ẩn","Chapter VII · Quadratic Inequalities in One Variable")}</div>
          <div style={{ fontSize:28,fontWeight:600,marginTop:4 }}>{t("Bài 21: Dấu của Tam Thức Bậc Hai","Lesson 21: Sign of a Quadratic Trinomial")}</div>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>setLang("vi")} style={{ background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
          <button onClick={()=>setLang("en")} style={{ background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
        </div>
      </header>

      <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:18,fontWeight:600,marginBottom:14 }}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
        {[t("Hiểu khái niệm tam thức bậc hai f(x)=ax²+bx+c.","Understand quadratic trinomial f(x)=ax²+bx+c."),
          t("Xác định dấu của tam thức dựa vào a và Δ.","Determine the sign based on a and Δ."),
          t("Lập bảng xét dấu tam thức bậc hai.","Construct the sign table for a quadratic trinomial."),
          t("Áp dụng vào giải bất phương trình bậc hai.","Apply to solve quadratic inequalities."),
          t("Nhận biết 6 trường hợp dấu đầy đủ.","Identify all 6 sign cases.")
        ].map((o,i)=><div key={i} style={{ fontSize:15,color:"#555",marginBottom:6 }}>• {o}</div>)}
      </div>

      <div style={{ position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)" }}>
        <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
          {tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{ background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}
        </div>
      </div>

      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
          <div style={{ fontSize:16,lineHeight:1.8,marginBottom:16 }}>{t("Trong lợi nhuận kinh doanh, hàm lợi nhuận có dạng f(x) = −x² + 10x − 16 (nghìn đồng), với x là số sản phẩm. Hỏi với x nào thì f(x) > 0 (có lãi)? Đây là bài toán xét dấu tam thức bậc hai.","In a business profit model, profit is f(x) = −x²+10x−16 (thousands). For which x is f(x)>0 (profitable)? This is a sign-analysis problem for a quadratic trinomial.")}</div>
          <div style={{ fontSize:16 }}>❓ <em>{t("Hãy tính Δ và tìm 2 nghiệm của f(x) trước khi học lý thuyết.","Try computing Δ and the two roots of f(x) before studying the theory.")}</em></div>
        </div>
      </section>

      {/* 1. ĐỊNH NGHĨA */}
      <section id="k1" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("1. Tam Thức Bậc Hai","1. Quadratic Trinomial")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10 }}>📌 {t("Định nghĩa","Definition")}</div>
          <div style={{ fontSize:15,lineHeight:1.8,marginBottom:12 }}>{t("Tam thức bậc hai (theo x) là biểu thức dạng f(x) = ax² + bx + c, trong đó a ≠ 0. Biệt thức Δ = b² − 4ac quyết định số nghiệm và dấu của f(x).","A quadratic trinomial in x has the form f(x)=ax²+bx+c, a≠0. The discriminant Δ=b²−4ac determines the number of roots and sign of f(x).")}</div>
          <div style={{ background:"white",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:15,lineHeight:2.2 }}>
            Δ = b² − 4ac<br/>
            Δ &gt; 0 → 2 nghiệm phân biệt x₁,x₂ (x₁ &lt; x₂)<br/>
            Δ = 0 → nghiệm kép x₀ = −b/(2a)<br/>
            Δ &lt; 0 → vô nghiệm thực
          </div>
        </div>
      </section>

      {/* 2. BẢNG XÉT DẤU */}
      <section id="k2" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("2. Bảng Xét Dấu (Định Lý)","2. Sign Table (Theorem)")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>📌 {t("Định lý về dấu tam thức bậc hai (a>0, Δ>0, nghiệm x₁<x₂):","Sign theorem (a>0, Δ>0, roots x₁<x₂):")}</div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ borderCollapse:"collapse",width:"100%",fontSize:14,minWidth:500 }}>
              <tbody>
                {[["x","−∞","","x₁","","x₂","","+∞"],
                  ["f(x)","+","","0","−","0","+",""]].map((row,ri)=>(
                  <tr key={ri} style={{ background:ri===0?"#0B4F5C":"white" }}>
                    {row.map((cell,ci)=>(
                      <td key={ci} style={{ padding:"10px 14px",textAlign:"center",border:"1px solid #ddd",color:ri===0?"white":cell==="0"?"#1a5276":cell==="−"?"#922b21":cell==="+"?"#1e8449":"#555",fontWeight:cell==="0"||cell==="+"||cell==="−"?700:400,fontFamily:"monospace",fontSize:15 }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop:12,padding:"10px 14px",background:"#fff3cd",borderRadius:8,fontSize:14 }}>
            💡 {t("Quy tắc: f(x) cùng dấu với a ở ngoài khoảng (x₁,x₂), và ngược dấu với a ở trong khoảng (x₁,x₂).","Rule: f(x) has the same sign as a outside (x₁,x₂), and opposite sign inside (x₁,x₂).")}
          </div>
        </div>
      </section>

      {/* 3. CÁC TRƯỜNG HỢP */}
      <section id="k3" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("3. Bảng Tổng Hợp 6 Trường Hợp","3. All 6 Cases Summary")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{cond:"a>0, Δ>0",roots:t("x₁<x₂","x₁<x₂"),sign:t("+ ngoài | − trong | + ngoài","+outside | −inside | +outside"),pos:t("x<x₁ hoặc x>x₂","x<x₁ or x>x₂"),neg:t("x₁<x<x₂","x₁<x<x₂"),c:"#1e8449",bg:"#eafaf1"},
            {cond:"a>0, Δ=0",roots:"x₀",sign:t("≥0 mọi x, =0 tại x₀","≥0 for all x, =0 at x₀"),pos:t("mọi x≠x₀","all x≠x₀"),neg:t("∅ (không âm)","∅ (not negative)"),c:"#1a5276",bg:"#eaf4fb"},
            {cond:"a>0, Δ<0",roots:t("Vô nghiệm","No roots"),sign:t(">0 mọi x",">0 for all x"),pos:"ℝ",neg:"∅",c:"#856404",bg:"#fff3cd"},
            {cond:"a<0, Δ>0",roots:t("x₁<x₂","x₁<x₂"),sign:t("− ngoài | + trong | − ngoài","−outside | +inside | −outside"),pos:t("x₁<x<x₂","x₁<x<x₂"),neg:t("x<x₁ hoặc x>x₂","x<x₁ or x>x₂"),c:"#922b21",bg:"#fdf2f2"},
            {cond:"a<0, Δ=0",roots:"x₀",sign:t("≤0 mọi x, =0 tại x₀","≤0 for all x, =0 at x₀"),pos:t("∅ (không dương)","∅ (not positive)"),neg:t("mọi x≠x₀","all x≠x₀"),c:"#6c3483",bg:"#f5eef8"},
            {cond:"a<0, Δ<0",roots:t("Vô nghiệm","No roots"),sign:t("<0 mọi x","<0 for all x"),pos:"∅",neg:"ℝ",c:"#555",bg:"#f4f6f7"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontFamily:"monospace",fontSize:15,fontWeight:700,color:card.c,background:card.bg,padding:"4px 10px",borderRadius:6,display:"inline-block",marginBottom:8 }}>{card.cond}</div>
              <div style={{ fontSize:13,color:"#555",marginBottom:4 }}>📋 {card.sign}</div>
              <div style={{ fontSize:13,color:"#1e8449",marginBottom:2 }}>✅ f(x)&gt;0: {card.pos}</div>
              <div style={{ fontSize:13,color:"#922b21" }}>❌ f(x)&lt;0: {card.neg}</div>
            </article>
          ))}
        </div>
      </section>

      {/* THỰC HÀNH */}
      <section id="th" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s" }}>
          {[{id:"e1",q:t("Xét dấu f(x) = x² − 3x + 2.","Determine the sign of f(x)=x²−3x+2."),
             a:[t("a=1>0; Δ=9−8=1>0","a=1>0; Δ=1>0"),t("x₁=1, x₂=2","x₁=1, x₂=2"),t("f(x)>0 khi x<1 hoặc x>2","f(x)>0 when x<1 or x>2"),t("f(x)<0 khi 1<x<2","f(x)<0 when 1<x<2")]},
           {id:"e2",q:t("Xét dấu f(x) = −2x² + 4x − 3.","Sign of f(x)=−2x²+4x−3."),
             a:[t("a=−2<0; Δ=16−24=−8<0","a=−2<0; Δ=−8<0"),t("Δ<0 và a<0 → f(x)<0 với mọi x ∈ ℝ","Δ<0 and a<0 → f(x)<0 for all x∈ℝ")]},
           {id:"e3",q:t("Tìm x để f(x)=x²−4x+4≥0.","Find x such that x²−4x+4≥0."),
             a:[t("f(x)=(x−2)²","f(x)=(x−2)²"),t("Δ=16−16=0; x₀=2","Δ=0; double root x₀=2"),t("(x−2)²≥0 với mọi x → nghiệm: x∈ℝ","(x−2)²≥0 for all x → solution: x∈ℝ")]},
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
          {[["mc","🧩",t("Trắc Nghiệm","Multiple Choice"),t("5 câu","5 Q")],["tf","🃏",t("Đúng / Sai","True / False"),t("5 thẻ","5 cards")],["fill","✍️",t("Điền Chỗ Trống","Fill in Blank"),t("3 câu","3 items")]].map(([mode,icon,label,sub])=>(
            <article key={mode} onClick={()=>setGm(mode)} style={{ background:gm===mode?"black":"#f9f9f9",color:gm===mode?"white":"black",cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:20,borderRadius:10 }}>
              <div style={{ fontSize:28,marginBottom:6 }}>{icon}</div><div style={{ fontSize:18,fontWeight:600 }}>{label}</div><div style={{ fontSize:14,opacity:0.7 }}>{sub}</div>
            </article>
          ))}
        </div>
        {gm==="mc"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!md?(<><div style={{ color:"#777",fontSize:15,marginBottom:8 }}>{t("Câu","Q")} {mi+1}/{mcQ.length} · {t("Điểm:","Score:")} {msc}</div><div style={{ fontSize:20,fontWeight:600,marginBottom:20 }}>{mcQ[mi].q}</div><div style={{ display:"flex",flexDirection:"column",gap:12 }}>{mcQ[mi].o.map((opt,i)=>{let bg="white",co="black";if(ms!==null){if(i===mcQ[mi].a){bg="#eafaf1";co="#1e8449";}else if(i===ms){bg="#fdf2f2";co="#922b21";}}return <button key={i} onClick={()=>sel(i)} style={{ textAlign:"left",padding:"14px 18px",borderRadius:10,border:"none",background:bg,color:co,fontSize:15,fontWeight:ms!==null&&(i===ms||i===mcQ[mi].a)?600:400,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{String.fromCharCode(65+i)}. {opt}</button>;})}</div>{ms!==null&&<><div style={{marginTop:16,padding:"12px 16px",background:"white",borderRadius:8,fontSize:15,color:"#555",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {mcQ[mi].ex}</div><button onClick={nx} style={{marginTop:14,padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{mi+1<mcQ.length?t("Câu tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>}</>):<RS items={mri} onReset={rm} scoreLabel={msc===mcQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):msc>=3?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
        {gm==="tf"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!td?(<><div style={{ color:"#777",fontSize:15,marginBottom:14 }}>{t("Thẻ","Card")} {ti+1}/{tfC.length} · {t("Điểm:","Score:")} {ts}</div><article style={{ background:"white",borderRadius:10,padding:24,marginBottom:20,textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}><div style={{ fontSize:18,lineHeight:1.7,marginBottom:24 }}>{tfC[ti].s}</div>{!tf?(<div style={{ display:"flex",gap:16,justifyContent:"center" }}><button onClick={()=>ta(true)} style={{ padding:"12px 36px",background:"#eafaf1",color:"#1e8449",border:"2px solid #1e8449",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer" }}>✅ {t("ĐÚNG","TRUE")}</button><button onClick={()=>ta(false)} style={{ padding:"12px 36px",background:"#fdf2f2",color:"#922b21",border:"2px solid #922b21",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer" }}>❌ {t("SAI","FALSE")}</button></div>):(<><div style={{padding:"12px 16px",background:"#f9f9f9",borderRadius:8,fontSize:15,color:"#555",textAlign:"left",marginBottom:14,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {tfC[ti].ex}</div><button onClick={tn} style={{padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{ti+1<tfC.length?t("Thẻ tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>)}</article></>):<RS items={tri} onReset={rt} scoreLabel={ts===tfC.length?t("Xuất sắc! 🎉","Perfect! 🎉"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
        {gm==="fill"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!fc?(<><div style={{ fontSize:18,fontWeight:600,marginBottom:20 }}>{t("Điền câu trả lời","Fill in the blanks")}</div>{fQ.map((q,qi)=>(<div key={q.id} style={{ marginBottom:24 }}><div style={{ fontSize:15,color:"#777",marginBottom:6 }}>{t("Câu","Q")} {qi+1}</div><div style={{ fontSize:16,lineHeight:1.7,marginBottom:10 }}>{q.tp}</div><input value={fa[q.id]||""} onChange={e=>setFa(p=>({...p,[q.id]:e.target.value}))} placeholder={t("Nhập đáp án...","Answer...")} style={{ width:"100%",padding:"12px 16px",borderRadius:8,fontSize:15,outline:"none",border:"1px solid #ddd",background:"white",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",boxSizing:"border-box" }} /></div>))}<button onClick={()=>setFc(true)} style={{ padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer" }}>{t("Kiểm tra","Check Answers")}</button></>):<RS items={fri} onReset={()=>{setFa({});setFc(false);}} scoreLabel={fs===fQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):fs>=2?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
      </section>

      <hr style={{ width:"5px" }}></hr>
      <div className="reveal" data-reveal style={{ textAlign:"center",color:"#777",fontSize:15,marginBottom:60 }}>Toán 10 · Chân Trời Sáng Tạo · {t("Bài 21 / Chương VII","Lesson 21 / Chapter VII")}</div>
      <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
    <DuoTranslate/> 
    </div></div>
  );
}
