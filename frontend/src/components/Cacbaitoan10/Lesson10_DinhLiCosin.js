
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

export default function Lesson10_DinhLiCosin() {
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
  const tr=(id)=>setRev(p=>({...p,[id]:!p[id]}));

  const mcQ=[
    {q:t("Định lí Côsin: a² = ?","Law of Cosines: a² = ?"),o:["b²+c²+2bc·cosA","b²+c²−2bc·cosA","b²−c²+2bc·cosA","(b+c)²"],a:1,ex:t("a²=b²+c²−2bc·cosA — dấu trừ trước 2bc·cosA.","a²=b²+c²−2bc·cosA — note the minus sign before 2bc·cosA.")},
    {q:t("Tam giác ABC: b=3, c=4, A=90°. Tính a.","Triangle: b=3, c=4, A=90°. Find a."),o:["5","√7","7","√25"],a:0,ex:t("cosA=cos90°=0 → a²=9+16=25 → a=5.","cos90°=0 → a²=9+16=25 → a=5.")},
    {q:t("cosA = (b²+c²−a²)/(2bc) dùng để làm gì?","cosA=(b²+c²−a²)/(2bc) is used to?"),o:[t("Tính cạnh a","Find side a"),t("Tính góc A từ 3 cạnh","Find angle A from 3 sides"),t("Tính diện tích","Find area"),t("Tính chu vi","Find perimeter")],a:1,ex:t("Công thức ngược của Đ.L.Côsin để tính góc khi đã biết 3 cạnh.","Inverse Law of Cosines to find angle when all 3 sides are known.")},
    {q:t("Tam giác: a=3, b=4, c=5. cosC = ?","Triangle: a=3, b=4, c=5. cosC = ?"),o:["0","1/2","−1/2","3/5"],a:0,ex:t("cosC=(a²+b²−c²)/(2ab)=(9+16−25)/24=0 → C=90°.","cosC=(9+16−25)/24=0 → C=90°.")},
    {q:t("Tam giác đều cạnh a. cosA = ?","Equilateral triangle side a. cosA = ?"),o:["0","1","1/2","−1/2"],a:2,ex:t("cosA=(a²+a²−a²)/(2a²)=a²/(2a²)=1/2 → A=60°.","cosA=a²/(2a²)=1/2 → A=60°.")},
  ];
  const tfC=[
    {s:t("Định lí Pythagore là trường hợp đặc biệt của Định lí Côsin khi góc C=90°.","The Pythagorean theorem is a special case of the Law of Cosines when C=90°."),a:true,ex:t("ĐÚNG — cosC=cos90°=0 → c²=a²+b².","TRUE — cos90°=0 → c²=a²+b².")},
    {s:t("Định lí Côsin: a²=b²+c²+2bc·cosA.","Law of Cosines: a²=b²+c²+2bc·cosA."),a:false,ex:t("SAI — dấu trừ: a²=b²+c²−2bc·cosA.","FALSE — it's minus: a²=b²+c²−2bc·cosA.")},
    {s:t("Nếu tam giác có cosA<0 thì A là góc tù.","If cosA<0 in a triangle then A is obtuse."),a:true,ex:t("ĐÚNG — cosA<0 ⟺ 90°<A<180°.","TRUE — cosA<0 ⟺ 90°<A<180°.")},
    {s:t("Từ 3 cạnh bất kỳ ta luôn tính được 3 góc bằng Định lí Côsin.","From any 3 sides we can always find all 3 angles using the Law of Cosines."),a:false,ex:t("SAI — 3 cạnh phải thỏa bất đẳng thức tam giác: tổng hai cạnh > cạnh còn lại.","FALSE — the 3 sides must satisfy the triangle inequality first.")},
    {s:t("Trong tam giác đều, Định lí Côsin cho cosA=1/2.","In an equilateral triangle, the Law of Cosines gives cosA=1/2."),a:true,ex:t("ĐÚNG — cosA=(a²+a²−a²)/(2a²)=1/2 → A=60°.","TRUE — cosA=1/2 → A=60°.")},
  ];
  const fQ=[
    {id:"f1",tp:t("Định lí Côsin: a² = b² + c² − ___ · cosA","Law of Cosines: a² = b² + c² − ___ · cosA"),ans:"2bc",alt:["2bc"],h:""},
    {id:"f2",tp:t("cosC = (a² + b² − c²) / ___","cosC = (a² + b² − c²) / ___"),ans:"2ab",alt:["2ab"],h:""},
    {id:"f3",tp:t("Khi C=90°, Định lí Côsin cho: c² = a² + ___","When C=90°, Law of Cosines gives: c² = a² + ___"),ans:"b²",alt:["b²","b^2"],h:""},
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
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. Định Lí","1. The Law")],["k2","📖",t("2. Tính Góc","2. Finding Angles")],["k3","📖",t("3. Ứng Dụng","3. Applications")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮","Mini Game"]];

  return (
    <div style={{ width:"100%",background:"#fff",display:"flex",justifyContent:"center" }}>
    <div style={{ width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80 }}>

      <div className="reveal" data-reveal style={{ marginBottom:24 }}>
        <Link href="/Cacbaitoan10" style={{ textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15 }}>← {t("Quay lại","Back")}</Link>
      </div>

      <header className="reveal" data-reveal style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300 }}>
        <div>
          <div style={{ fontWeight:"bold",fontSize:22,color:"#0B4F5C" }}>{t("Chương IV · Hệ Thức Lượng Trong Tam Giác","Chapter IV · Triangle Trigonometry")}</div>
          <div style={{ fontSize:28,fontWeight:600,marginTop:4 }}>{t("Bài 10: Định Lí Côsin","Lesson 10: Law of Cosines")}</div>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>setLang("vi")} style={{ background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
          <button onClick={()=>setLang("en")} style={{ background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
        </div>
      </header>

      <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:18,fontWeight:600,marginBottom:14 }}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
        {[t("Phát biểu và chứng minh Định lí Côsin.","State and understand the Law of Cosines."),
          t("Áp dụng Định lí Côsin tính cạnh khi biết 2 cạnh và góc xen giữa.","Apply it to find a side given 2 sides and the included angle."),
          t("Áp dụng Định lí Côsin tính góc khi biết 3 cạnh.","Apply it to find angles given 3 sides."),
          t("Nhận biết Định lí Pythagore là trường hợp đặc biệt.","Recognize Pythagorean theorem as a special case."),
          t("Giải quyết bài toán thực tế liên quan.","Solve real-world problems.")
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
          <div style={{ fontSize:16,lineHeight:1.8,marginBottom:16 }}>{t("Nếu biết hai cạnh và góc xen giữa của tam giác, bạn có thể tính cạnh còn lại không? Hoặc biết 3 cạnh, bạn có thể tính các góc? Định lí Côsin trả lời chính xác điều đó.","If you know two sides and the included angle of a triangle, can you find the third side? Or knowing 3 sides, can you find all angles? The Law of Cosines answers exactly that.")}</div>
          <div style={{ fontSize:16 }}>❓ <em>{t("Định lí Pythagore có liên hệ gì với Định lí Côsin không?","How is the Pythagorean theorem related to the Law of Cosines?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="Z_D3_B2WlTM"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (CC BY-NC-SA)", "Video by Khan Academy (CC BY-NC-SA)")}
          />
        </div>
      </section>

      {/* 1. ĐỊNH LÍ */}
      <section id="k1" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("1. Phát Biểu Định Lí Côsin","1. Statement of the Law of Cosines")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:12 }}>📌 {t("Định lí","Theorem")}</div>
          <div style={{ fontSize:15,lineHeight:1.8,marginBottom:16 }}>{t("Trong tam giác ABC với a, b, c là các cạnh đối diện với góc A, B, C:","In triangle ABC with sides a, b, c opposite angles A, B, C:")}</div>
          <div style={{ background:"white",borderRadius:10,padding:"18px 24px",fontFamily:"monospace",fontSize:17,lineHeight:2.6,textAlign:"center" }}>
            a² = b² + c² − 2bc · cosA<br/>
            b² = a² + c² − 2ac · cosB<br/>
            c² = a² + b² − 2ab · cosC
          </div>
        </div>
        <div className="reveal" data-reveal style={{ padding:16,borderRadius:10,background:"#fff3cd",border:"1px solid #ffc107",fontSize:15 }}>
          💡 {t("Trường hợp đặc biệt: C=90° → cosC=0 → c²=a²+b² (Định lí Pythagore!). Định lí Côsin là mở rộng của Pythagore cho mọi tam giác.","Special case: C=90° → cosC=0 → c²=a²+b² (Pythagorean theorem!). Law of Cosines generalizes Pythagoras to any triangle.")}
        </div>
      </section>

      {/* 2. TÍNH GÓC */}
      <section id="k2" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("2. Tính Góc Khi Biết 3 Cạnh","2. Finding Angles from 3 Sides")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>{t("Rút ra công thức tính góc:","Rearranging for angles:")}</div>
          <div style={{ background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:16,lineHeight:2.4,textAlign:"center" }}>
            cosA = (b² + c² − a²) / (2bc)<br/>
            cosB = (a² + c² − b²) / (2ac)<br/>
            cosC = (a² + b² − c²) / (2ab)
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{label:t("cosA > 0","cosA > 0"),note:t("→ A nhọn (A < 90°)","→ A is acute (A < 90°)"),bg:"#eafaf1",c:"#1e8449"},
            {label:t("cosA = 0","cosA = 0"),note:t("→ A = 90° (vuông)","→ A = 90° (right angle)"),bg:"#eaf4fb",c:"#1a5276"},
            {label:t("cosA < 0","cosA < 0"),note:t("→ A tù (A > 90°)","→ A is obtuse (A > 90°)"),bg:"#fdf2f2",c:"#922b21"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center" }}>
              <div style={{ fontFamily:"monospace",fontSize:18,fontWeight:700,color:card.c,marginBottom:8 }}>{card.label}</div>
              <div style={{ background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8,fontSize:14,fontWeight:600 }}>{card.note}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. ỨNG DỤNG */}
      <section id="k3" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("3. Khi Nào Dùng Định Lí Côsin?","3. When to Use the Law of Cosines?")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,transition:"all 0.3s" }}>
          {[{case:t("Biết 2 cạnh + góc xen giữa (SAS)","2 sides + included angle (SAS)"),use:t("→ Tính cạnh thứ 3: a²=b²+c²−2bc·cosA","→ Find 3rd side: a²=b²+c²−2bc·cosA"),bg:"#eafaf1",c:"#1e8449"},
            {case:t("Biết 3 cạnh (SSS)","3 sides known (SSS)"),use:t("→ Tính cả 3 góc bằng công thức cosine ngược","→ Find all 3 angles using inverse cosine"),bg:"#eaf4fb",c:"#1a5276"},
            {case:t("Kiểm tra dạng tam giác","Check triangle type"),use:t("→ c²=a²+b² (vuông), <(nhọn), >(tù)","→ c²=a²+b² (right), < (acute), > (obtuse)"),bg:"#fff3cd",c:"#856404"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:14,fontWeight:700,color:card.c,marginBottom:8 }}>{card.case}</div>
              <div style={{ background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8,fontSize:13,fontFamily:"monospace" }}>{card.use}</div>
            </article>
          ))}
        </div>
      </section>

      {/* THỰC HÀNH */}
      <section id="th" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:40,transition:"all 0.3s" }}>
          {[
            {id:"e1",q:t("Tam giác ABC: b=5, c=7, A=60°. Tính cạnh a.","Triangle ABC: b=5, c=7, A=60°. Find side a."),
             a:[t("a²=b²+c²−2bc·cosA=25+49−2·5·7·cos60°","a²=25+49−2·5·7·cos60°"),t("=74−70·(1/2)=74−35=39","=74−35=39"),t("→ a=√39≈6.24","→ a=√39≈6.24")]},
            {id:"e2",q:t("Tam giác: a=7, b=5, c=6. Tính góc A.","Triangle: a=7, b=5, c=6. Find angle A."),
             a:[t("cosA=(b²+c²−a²)/(2bc)=(25+36−49)/(2·5·6)=12/60=1/5","cosA=(25+36−49)/60=1/5"),t("A=arccos(1/5)≈78.46°","A≈78.46°")]},
            {id:"e3",q:t("Tam giác a=3, b=4, c=5. Là tam giác gì?","Triangle: a=3, b=4, c=5. What type?"),
             a:[t("c²=25; a²+b²=9+16=25","c²=25; a²+b²=25"),t("Vì c²=a²+b² → C=90° → TAM GIÁC VUÔNG!","c²=a²+b² → C=90° → RIGHT triangle!")]},
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
        {gm==="fill"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!fc?(<><div style={{ fontSize:18,fontWeight:600,marginBottom:20 }}>{t("Điền câu trả lời vào chỗ trống","Fill in each blank")}</div>{fQ.map((q,qi)=>(<div key={q.id} style={{ marginBottom:24 }}><div style={{ fontSize:15,color:"#777",marginBottom:6 }}>{t("Câu","Q")} {qi+1}</div><div style={{ fontSize:16,lineHeight:1.7,marginBottom:10 }}>{q.tp}</div><input value={fa[q.id]||""} onChange={e=>setFa(p=>({...p,[q.id]:e.target.value}))} placeholder={t("Nhập đáp án...","Answer...")} style={{ width:"100%",padding:"12px 16px",borderRadius:8,fontSize:15,outline:"none",border:"1px solid #ddd",background:"white",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",boxSizing:"border-box" }} /></div>))}<button onClick={()=>setFc(true)} style={{ padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer" }}>{t("Kiểm tra","Check Answers")}</button></>):<RS items={fri} onReset={()=>{setFa({});setFc(false);}} scoreLabel={fs===fQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):fs>=2?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
      </section>

      <hr style={{ width:"5px" }}></hr>
      <div className="reveal" data-reveal style={{ textAlign:"center",color:"#777",fontSize:15,marginBottom:60 }}>Toán 10 · Chân Trời Sáng Tạo · {t("Bài 10 / Chương IV","Lesson 10 / Chapter IV")}</div>
      <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
    <DuoTranslate/>
    </div></div>
  );
}
