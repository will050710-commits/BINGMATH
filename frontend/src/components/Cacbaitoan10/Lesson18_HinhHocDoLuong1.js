
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

export default function Lesson18_HinhHocDoLuong1() {
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
    {q:t("Bán kính đường tròn ngoại tiếp tam giác R liên hệ với Định lí Sin như thế nào?","How does circumradius R relate to the Law of Sines?"),o:["R = a·sinA","R = a/(2sinA)","R = 2a·sinA","R = sinA/a"],a:1,ex:t("Từ Định lí Sin: a/sinA=2R → R=a/(2sinA).","From Law of Sines: a/sinA=2R → R=a/(2sinA).")},
    {q:t("Đường trung tuyến ma của tam giác ABC tính theo công thức?","The median ma of triangle ABC is given by?"),o:["ma²=b²+c²−a²/2","ma²=(2b²+2c²−a²)/4","ma=√(b²+c²)/2","ma=(b+c)/2"],a:1,ex:t("Công thức đường trung tuyến: ma²=(2b²+2c²−a²)/4.","Median formula: ma²=(2b²+2c²−a²)/4.")},
    {q:t("Tam giác đều cạnh a. Bán kính nội tiếp r = ?","Equilateral triangle side a. Inradius r = ?"),o:["a√3/6","a√3/3","a/2","a√3/2"],a:0,ex:t("r=a√3/6 (= R/2 với R=a√3/3 là ngoại tiếp).","r=a√3/6 (= R/2 where R=a√3/3 is circumradius).")},
    {q:t("Công thức liên hệ bán kính nội tiếp r, diện tích S và nửa chu vi p là?","The formula relating inradius r, area S and semi-perimeter p is?"),o:["S=r·p","S=r/p","r=S·p","p=r·S"],a:0,ex:t("S=r·p, trong đó p=(a+b+c)/2 là nửa chu vi.","S=r·p, where p=(a+b+c)/2 is the semi-perimeter.")},
    {q:t("Trong tam giác ABC vuông tại C, bán kính ngoại tiếp R = ?","Right triangle with right angle at C. Circumradius R = ?"),o:["a/2","b/2","c/2","(a+b)/2"],a:2,ex:t("Trong tam giác vuông, cạnh huyền c là đường kính → R=c/2.","In a right triangle, hypotenuse c is diameter → R=c/2.")},
  ];
  const tfC=[
    {s:t("Đường tròn ngoại tiếp tam giác đi qua cả 3 đỉnh.","The circumscribed circle passes through all 3 vertices."),a:true,ex:t("ĐÚNG — định nghĩa đường tròn ngoại tiếp.","TRUE — definition of circumscribed circle.")},
    {s:t("Bán kính nội tiếp r = S/p với S là diện tích và p là nửa chu vi.","Inradius r = S/p where S = area and p = semi-perimeter."),a:true,ex:t("ĐÚNG — từ S=r·p → r=S/p.","TRUE — from S=r·p → r=S/p.")},
    {s:t("Tam giác đều luôn có R = 2r.","An equilateral triangle always has R = 2r."),a:true,ex:t("ĐÚNG — đều: R=a√3/3, r=a√3/6 → R=2r.","TRUE — equilateral: R=a√3/3, r=a√3/6 → R=2r.")},
    {s:t("Công thức đường trung tuyến: ma²=b²+c²−a²/2.","Median formula: ma²=b²+c²−a²/2."),a:false,ex:t("SAI — đúng là ma²=(2b²+2c²−a²)/4.","FALSE — correct is ma²=(2b²+2c²−a²)/4.")},
    {s:t("Trong tam giác vuông tại C, đường trung tuyến mc=c/2.","Right triangle at C: median mc=c/2."),a:true,ex:t("ĐÚNG — trong tam giác vuông, trung tuyến tới cạnh huyền = nửa cạnh huyền.","TRUE — in a right triangle, median to hypotenuse = half hypotenuse.")},
  ];
  const fQ=[
    {id:"f1",tp:t("Bán kính ngoại tiếp: R = a / (2 · ___)","Circumradius: R = a / (2 · ___)"),ans:"sinA",alt:["sina","sin A","sinA","sin(A)"],h:""},
    {id:"f2",tp:t("Diện tích tam giác: S = r · ___ (r = bán kính nội tiếp)","Area: S = r · ___ (r = inradius)"),ans:"p",alt:["p"],h:t("p = nửa chu vi","p = semi-perimeter")},
    {id:"f3",tp:t("Tam giác đều cạnh a: đường trung tuyến m = (a___ )/2","Equilateral side a: median m = (a___ )/2"),ans:"√3",alt:["√3","sqrt(3)","căn 3","can 3"],h:t("Trung tuyến = chiều cao trong tam giác đều","Median = altitude in equilateral triangle")},
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
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. Đường Tròn NT/NTip","1. Circum/Inradius")],["k2","📖",t("2. Đường Trung Tuyến","2. Medians")],["k3","📖",t("3. Đường Cao","3. Altitudes")],["k4","📖",t("4. Hệ Thức Đặc Biệt","4. Special Cases")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮","Mini Game"]];

  return (
    <div style={{ width:"100%",background:"#fff",display:"flex",justifyContent:"center" }}>
    <div style={{ width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80 }}>
      <div className="reveal" data-reveal style={{ marginBottom:24 }}>
        <Link href="/Cacbaitoan10" style={{ textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15 }}>← {t("Quay lại","Back")}</Link>
      </div>
      <header className="reveal" data-reveal style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300 }}>
        <div>
          <div style={{ fontWeight:"bold",fontSize:22,color:"#0B4F5C" }}>{t("Chương VI · Hình Học Đo Lường","Chapter VI · Geometry & Measurement")}</div>
          <div style={{ fontSize:28,fontWeight:600,marginTop:4 }}>{t("Bài 18: Hình Học Phẳng – Hệ Thức Lượng","Lesson 18: Plane Geometry – Metric Relations")}</div>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>setLang("vi")} style={{ background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
          <button onClick={()=>setLang("en")} style={{ background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
        </div>
      </header>

      <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:18,fontWeight:600,marginBottom:14 }}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
        {[t("Tính bán kính đường tròn ngoại tiếp R và nội tiếp r của tam giác.","Compute circumradius R and inradius r of a triangle."),
          t("Áp dụng công thức đường trung tuyến: ma²=(2b²+2c²−a²)/4.","Apply the median formula: ma²=(2b²+2c²−a²)/4."),
          t("Tính đường cao ha = 2S/a.","Compute altitude ha = 2S/a."),
          t("Nhận biết hệ thức đặc biệt trong tam giác vuông và đều.","Identify special formulas for right and equilateral triangles."),
          t("Liên hệ R và r qua chu vi và diện tích.","Connect R and r through perimeter and area.")
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
          <div style={{ fontSize:16,lineHeight:1.8,marginBottom:16 }}>{t("Các nhà thiết kế mạch điện, kiến trúc sư xây vòm, và kỹ sư cơ khí thường xuyên cần tính đường tròn bao quanh hoặc nằm trong một hình tam giác. Những công thức hệ thức lượng trong tam giác giúp giải quyết chính xác các bài toán đó.","Circuit designers, arch architects, and mechanical engineers regularly need circles surrounding or inscribed in triangles. The metric relations of triangles solve these problems precisely.")}</div>
          <div style={{ fontSize:16 }}>❓ <em>{t("Nếu đường tròn ngoại tiếp tam giác có bán kính R, thì R liên hệ gì với cạnh và góc của tam giác?","If the circumscribed circle has radius R, how does R relate to the triangle's sides and angles?")}</em></div>
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

      {/* 1. ĐƯỜNG TRÒN NGOẠI TIẾP & NỘI TIẾP */}
      <section id="k1" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("1. Đường Tròn Ngoại Tiếp và Nội Tiếp","1. Circumscribed and Inscribed Circles")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:24,transition:"all 0.3s" }}>
          {[{
            icon:"⭕",title:t("Đường tròn NGOẠI TIẾP","Circumscribed Circle"),
            items:[t("Bán kính R: đi qua 3 đỉnh","Radius R: passes through 3 vertices"),t("R = a/(2sinA) = b/(2sinB) = c/(2sinC)","R = a/(2sinA)"),t("Tam giác vuông tại C: R = c/2","Right at C: R = c/2"),t("Tam giác đều cạnh a: R = a√3/3","Equilateral: R = a√3/3")],
            bg:"#eaf4fb",c:"#1a5276"
          },{
            icon:"🔵",title:t("Đường tròn NỘI TIẾP","Inscribed Circle"),
            items:[t("Bán kính r: tiếp xúc 3 cạnh","Radius r: tangent to 3 sides"),t("r = S/p (S=diện tích, p=nửa chu vi)","r = S/p (S=area, p=semi-perimeter)"),t("Tam giác vuông: r = (a+b−c)/2","Right triangle: r = (a+b−c)/2"),t("Tam giác đều cạnh a: r = a√3/6","Equilateral: r = a√3/6")],
            bg:"#eafaf1",c:"#1e8449"
          },{
            icon:"📐",title:t("Quan hệ R và r","Relationship R and r"),
            items:[t("Euler: OI² = R²−2Rr (O=tâm ngoại, I=tâm nội)","Euler: OI²=R²−2Rr"),t("R ≥ 2r (dấu = khi tam giác đều)","R ≥ 2r (equality for equilateral)"),t("Tam giác đều: R = 2r","Equilateral: R = 2r")],
            bg:"#f5eef8",c:"#6c3483"
          }].map((card,i)=>(
            <article key={i} style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:24,marginBottom:8 }}>{card.icon}</div>
              <div style={{ fontSize:16,fontWeight:700,color:card.c,marginBottom:12 }}>{card.title}</div>
              {card.items.map((item,j)=>(
                <div key={j} style={{ fontSize:13,color:"#555",marginBottom:8,display:"flex",gap:8 }}>
                  <span style={{ color:card.c,fontWeight:700,flexShrink:0 }}>•</span>
                  <span style={{ fontFamily:"monospace" }}>{item}</span>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>

      {/* 2. ĐƯỜNG TRUNG TUYẾN */}
      <section id="k2" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("2. Đường Trung Tuyến","2. Medians")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>{t("Công thức đường trung tuyến:","Median formulas:")}</div>
          <div style={{ background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:15,lineHeight:2.4,textAlign:"center" }}>
            ma² = (2b² + 2c² − a²) / 4<br/>
            mb² = (2a² + 2c² − b²) / 4<br/>
            mc² = (2a² + 2b² − c²) / 4
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{title:t("Tính chất trọng tâm G","Centroid G"),note:t("G chia mỗi đường trung tuyến theo tỉ lệ 2:1 kể từ đỉnh.","G divides each median 2:1 from vertex."),formula:"AG = (2/3)ma"},
            {title:t("Tam giác đều cạnh a","Equilateral, side a"),note:t("3 đường trung tuyến bằng nhau.","All 3 medians are equal."),formula:"m = a√3/2"},
            {title:t("Tam giác vuông tại C","Right triangle at C"),note:t("Trung tuyến tới cạnh huyền = R.","Median to hypotenuse = R."),formula:"mc = c/2 = R"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:6 }}>{card.title}</div>
              <div style={{ fontSize:13,color:"#777",marginBottom:8,lineHeight:1.6 }}>{card.note}</div>
              <div style={{ fontFamily:"monospace",fontSize:14,fontWeight:600,color:"#0B4F5C",background:"white",padding:"6px 12px",borderRadius:6 }}>{card.formula}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. ĐƯỜNG CAO */}
      <section id="k3" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("3. Đường Cao","3. Altitudes")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>{t("Công thức đường cao:","Altitude formulas:")}</div>
          <div style={{ background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:15,lineHeight:2.4,textAlign:"center" }}>
            ha = 2S / a &nbsp;&nbsp;&nbsp; hb = 2S / b &nbsp;&nbsp;&nbsp; hc = 2S / c
          </div>
          <div style={{ marginTop:12,padding:"10px 14px",background:"#fff3cd",borderRadius:8,fontSize:14 }}>
            💡 {t("Cũng có thể dùng: ha = b·sinC = c·sinB","Also: ha = b·sinC = c·sinB")}
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{shape:t("Tam giác đều cạnh a","Equilateral, side a"),formula:"h = a√3/2 (= đường trung tuyến)"},
            {shape:t("Tam giác vuông tại C (cạnh góc vuông a, b)","Right triangle, legs a, b"),formula:"hc = ab/c (đường cao tới cạnh huyền)"},
            {shape:t("Hệ thức trong tam giác vuông","Right triangle relations"),formula:"hc² = ha'·hb'\n(tích các hình chiếu trên huyền)"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:14,color:"#777",marginBottom:6 }}>{card.shape}</div>
              <div style={{ fontFamily:"monospace",fontSize:14,fontWeight:600,color:"#0B4F5C",whiteSpace:"pre-wrap",lineHeight:1.8 }}>{card.formula}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. HỆ THỨC ĐẶC BIỆT */}
      <section id="k4" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("4. Hệ Thức Trong Tam Giác Vuông","4. Right Triangle Relations")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>{t("Tam giác vuông tại C, đường cao CH = h, hình chiếu A&apos; và B&apos;:","Right triangle at C, altitude CH=h, projections A&apos; and B&apos;:")}</div>
          <div style={{ background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:14,lineHeight:2.2 }}>
            c² = a² + b² (Pythagore)<br/>
            h = ab/c<br/>
            a² = c·CA&apos;  &nbsp;&nbsp;  b² = c·CB&apos;<br/>
            h² = CA&apos;·CB&apos;<br/>
            1/h² = 1/a² + 1/b²
          </div>
        </div>
        <div className="reveal" data-reveal style={{ padding:14,borderRadius:10,background:"#fff3cd",border:"1px solid #ffc107",fontSize:15 }}>
          ⭐ {t("Các hệ thức này rất quan trọng trong thi cử và ứng dụng thực tế (tính độ dốc, chiều cao tòa nhà, v.v.).","These relations are crucial in exams and applications (slope, building height, etc.).")}
        </div>
      </section>

      {/* THỰC HÀNH */}
      <section id="th" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s" }}>
          {[
            {id:"e1",q:t("Tam giác ABC: a=5, b=7, c=8. Tính:\n(a) Bán kính ngoại tiếp R\n(b) Bán kính nội tiếp r","Triangle: a=5, b=7, c=8.\n(a) Circumradius R\n(b) Inradius r"),
             a:[t("Diện tích: s=(5+7+8)/2=10, S=√(10·5·3·2)=√300=10√3","Area: s=10, S=10√3"),t("(a) R=a/(2sinA). Trước: cosA=(b²+c²−a²)/(2bc)=(49+64−25)/112=88/112=11/14","cosA=11/14, sinA=√(1−121/196)=√(75/196)=5√3/14"),t("R=5/(2·5√3/14)=5·14/(10√3)=7/√3=7√3/3≈4.04","R=7√3/3≈4.04"),t("(b) r=S/p=10√3/10=√3≈1.73","r=√3≈1.73")]},
            {id:"e2",q:t("Tam giác ABC: a=6, b=8, c=10. Tính đường cao ha và đường trung tuyến ma.","Triangle: a=6, b=8, c=10.\nFind altitude ha and median ma."),
             a:[t("Kiểm tra: 6²+8²=36+64=100=10² → tam giác VUÔNG tại C (c=10)","6²+8²=100=10² → RIGHT at C"),t("S=(1/2)·6·8=24","S=24"),t("ha=2S/a=48/6=8","ha=8"),t("ma²=(2·64+2·100−36)/4=(128+200−36)/4=292/4=73 → ma=√73≈8.54","ma=√73≈8.54")]},
            {id:"e3",q:t("Tam giác đều cạnh a=6. Tính R, r, và đường cao h.","Equilateral, side 6. Find R, r, and altitude h."),
             a:[t("h = 6√3/2 = 3√3≈5.20","h=3√3"),t("R = a√3/3 = 6√3/3 = 2√3≈3.46","R=2√3"),t("r = a√3/6 = 6√3/6 = √3≈1.73","r=√3"),t("Kiểm tra: R = 2r = 2√3 ✓","R=2r ✓")]},
          ].map(({id,q,a})=>(
            <article key={id}>
              <div style={{ padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ fontSize:18,fontWeight:600,marginBottom:4 }}>📝 {t("Bài tập","Exercise")}</div>
                <div style={{ fontSize:15,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{q}</div>
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
      <div className="reveal" data-reveal style={{ textAlign:"center",color:"#777",fontSize:15,marginBottom:60 }}>Toán 10 · Chân Trời Sáng Tạo · {t("Bài 20 / Chương VI","Lesson 20 / Chapter VI")}</div>
      <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
    <DuoTranslate/> 
    </div></div>
  );
}
