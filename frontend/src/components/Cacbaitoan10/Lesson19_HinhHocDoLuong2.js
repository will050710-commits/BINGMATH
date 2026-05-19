
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

export default function Lesson19_HinhHocDoLuong2() {
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
    {q:t("Diện tích hình thoi có hai đường chéo d₁ và d₂ là?","Area of rhombus with diagonals d₁, d₂?"),o:["d₁·d₂","(d₁+d₂)/2","d₁·d₂/2","(d₁·d₂)²"],a:2,ex:t("S=d₁·d₂/2. Hai đường chéo hình thoi vuông góc nhau.","S=d₁·d₂/2. Diagonals of a rhombus are perpendicular.")},
    {q:t("Hình thang đáy lớn a, đáy nhỏ b, chiều cao h. Diện tích S = ?","Trapezoid with parallel sides a,b and height h. Area?"),o:["(a+b)·h","(a+b)·h/2","a·b·h/2","(a−b)·h"],a:1,ex:t("S=(a+b)·h/2. Trung bình hai đáy nhân chiều cao.","S=(a+b)·h/2.")},
    {q:t("Diện tích hình tròn bán kính R là?","Area of circle with radius R?"),o:["2πR","πR²","πR²/2","2πR²"],a:1,ex:t("S=πR². Chu vi C=2πR.","S=πR². Circumference C=2πR.")},
    {q:t("Hình bình hành cạnh a và chiều cao h. Diện tích là?","Parallelogram side a and height h. Area?"),o:["a²","a·h/2","a·h","(a+h)²"],a:2,ex:t("S=a·h (đáy × chiều cao tương ứng).","S=a·h (base × corresponding height).")},
    {q:t("Hình vuông cạnh a có diện tích S = ?","Square side a has area?"),o:["4a","2a²","a²","a³"],a:2,ex:t("S=a². Chu vi=4a.","S=a². Perimeter=4a.")},
  ];
  const tfC=[
    {s:t("Diện tích hình chữ nhật = chiều dài × chiều rộng.","Rectangle area = length × width."),a:true,ex:t("ĐÚNG — S=l×w, đây là công thức cơ bản nhất.","TRUE — S=l×w, most basic formula.")},
    {s:t("Diện tích hình thoi = tích hai đường chéo.","Rhombus area = product of diagonals."),a:false,ex:t("SAI — S=d₁·d₂/2 (chia 2, vì mỗi đường chéo chia đôi hình thoi thành 2 tam giác).","FALSE — S=d₁·d₂/2 (divide by 2).")},
    {s:t("Chu vi đường tròn C=2πR.","Circle circumference C=2πR."),a:true,ex:t("ĐÚNG — C=2πR=πd (d=đường kính).","TRUE — C=2πR=πd.")},
    {s:t("Hình bình hành và hình chữ nhật có cùng công thức diện tích.","Parallelogram and rectangle have the same area formula."),a:true,ex:t("ĐÚNG — cả hai đều S=đáy×chiều cao. Hình chữ nhật là trường hợp đặc biệt của hình bình hành.","TRUE — both S=base×height. Rectangle is a special case.")},
    {s:t("Diện tích hình thang = (tổng hai đáy) × chiều cao.","Trapezoid area = (sum of bases) × height."),a:false,ex:t("SAI — S=(a+b)/2×h (cần chia 2).","FALSE — S=(a+b)·h/2 (must divide by 2).")},
  ];
  const fQ=[
    {id:"f1",tp:t("Diện tích hình tròn bán kính R: S = ___ · R²","Circle area: S = ___ · R²"),ans:"π",alt:["pi","π","3.14"],h:""},
    {id:"f2",tp:t("Diện tích hình thoi d₁=6, d₂=8: S = ___","Rhombus d₁=6, d₂=8: S = ___"),ans:"24",alt:["24"],h:"S=6×8/2"},
    {id:"f3",tp:t("Diện tích hình thang đáy 5 và 9, cao 4: S = ___","Trapezoid bases 5,9 height 4: S = ___"),ans:"28",alt:["28"],h:"S=(5+9)×4/2"},
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

  const tabs=[["w","🚀",t("Khởi động","Warm-Up")],["k1","📖",t("1. Diện Tích Đa Giác","1. Polygon Areas")],["k2","📖",t("2. Hình Tròn","2. Circles")],["k3","📖",t("3. Đa Giác Đều","3. Regular Polygons")],["k4","📖",t("4. Ứng Dụng","4. Applications")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮","Mini Game"]];

  const shapes = [
    {name:t("Tam giác","Triangle"),icon:"△",area:t("S = ½ · đáy · cao\nS = ½ · a · b · sinC\nS = √(s(s−a)(s−b)(s−c))","S=½·base·height\nS=½·a·b·sinC\nHeron formula"),perimeter:t("P = a + b + c","P=a+b+c"),c:"#1a5276",bg:"#eaf4fb"},
    {name:t("Hình vuông","Square"),icon:"□",area:t("S = a²","S=a²"),perimeter:t("P = 4a","P=4a"),c:"#1e8449",bg:"#eafaf1"},
    {name:t("Hình chữ nhật","Rectangle"),icon:"▭",area:t("S = a · b","S=a·b"),perimeter:t("P = 2(a+b)","P=2(a+b)"),c:"#6c3483",bg:"#f5eef8"},
    {name:t("Hình bình hành","Parallelogram"),icon:"▱",area:t("S = đáy · chiều cao","S=base·height"),perimeter:t("P = 2(a+b)","P=2(a+b)"),c:"#856404",bg:"#fff3cd"},
    {name:t("Hình thoi","Rhombus"),icon:"◇",area:t("S = d₁ · d₂ / 2","S=d₁·d₂/2"),perimeter:t("P = 4a","P=4a"),c:"#922b21",bg:"#fdf2f2"},
    {name:t("Hình thang","Trapezoid"),icon:"⌓",area:t("S = (a + b) · h / 2","S=(a+b)·h/2"),perimeter:t("P = a+b+c+d","P=a+b+c+d"),c:"#0B4F5C",bg:"#e8f8f5"},
  ];

  return (
    <div style={{ width:"100%",background:"#fff",display:"flex",justifyContent:"center" }}>
    <div style={{ width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80 }}>
      <div className="reveal" data-reveal style={{ marginBottom:24 }}>
        <Link href="/Cacbaitoan10" style={{ textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15 }}>← {t("Quay lại","Back")}</Link>
      </div>
      <header className="reveal" data-reveal style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300 }}>
        <div>
          <div style={{ fontWeight:"bold",fontSize:22,color:"#0B4F5C" }}>{t("Chương VI · Hình Học Đo Lường","Chapter VI · Geometry & Measurement")}</div>
          <div style={{ fontSize:28,fontWeight:600,marginTop:4 }}>{t("Bài 19: Diện Tích và Chu Vi","Lesson 19: Area and Perimeter")}</div>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>setLang("vi")} style={{ background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
          <button onClick={()=>setLang("en")} style={{ background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
        </div>
      </header>

      <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:18,fontWeight:600,marginBottom:14 }}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
        {[t("Nắm vững công thức diện tích và chu vi các hình đa giác thường gặp.","Master area and perimeter formulas for common polygons."),
          t("Tính diện tích và chu vi hình tròn, cung tròn, hình quạt.","Compute area and circumference of circles, arcs, and sectors."),
          t("Biết công thức diện tích đa giác đều n cạnh.","Know the area formula for regular n-gons."),
          t("Áp dụng vào bài toán thực tế (sàn nhà, vải, đất đai).","Apply to real problems (flooring, fabric, land)."),
          t("Tính toán kết hợp giữa các hình phẳng.","Compute combined areas of plane figures.")
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
          <div style={{ fontSize:16,lineHeight:1.8,marginBottom:16 }}>{t("Một người cần lát gạch sàn nhà. Phòng hình chữ nhật 5m×4m, có một bàn hình tròn bán kính 0.8m đặt ở giữa (không cần lát dưới bàn). Tính diện tích cần lát gạch — đây là bài toán kết hợp diện tích hình phẳng rất thực tế!","Someone needs to tile a floor. Room is 5m×4m rectangle, with a circular table radius 0.8m in the middle (no tile needed under table). Find the area to tile — this is a very practical combined-area problem!")}</div>
          <div style={{ fontSize:16 }}>❓ <em>{t("S = 5×4 − π×0.8² ≈ 20 − 2.01 ≈ 17.99 m². Đây là cách kết hợp diện tích.","S = 5×4 − π×0.8² ≈ 17.99 m². This is how to combine areas.")}</em></div>
        </div>
      </section>

      {/* 1. DIỆN TÍCH ĐA GIÁC */}
      <section id="k1" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("1. Diện Tích và Chu Vi Đa Giác","1. Polygon Area & Perimeter")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:18,transition:"all 0.3s" }}>
          {shapes.map((s,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10 }}>
                <span style={{ fontSize:22,color:s.c }}>{s.icon}</span>
                <span style={{ fontSize:15,fontWeight:700,color:s.c }}>{s.name}</span>
              </div>
              <div style={{ background:s.bg,borderRadius:8,padding:"8px 12px",marginBottom:8 }}>
                <div style={{ fontSize:12,color:s.c,fontWeight:700,marginBottom:4 }}>DIỆN TÍCH / AREA</div>
                <div style={{ fontFamily:"monospace",fontSize:13,color:s.c,whiteSpace:"pre-wrap",lineHeight:1.7 }}>{s.area}</div>
              </div>
              <div style={{ background:"white",borderRadius:8,padding:"6px 12px",border:`1px solid ${s.bg}` }}>
                <div style={{ fontSize:12,color:"#777",fontWeight:700,marginBottom:2 }}>CHU VI / PERIMETER</div>
                <div style={{ fontFamily:"monospace",fontSize:13,color:"#333" }}>{s.perimeter}</div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. HÌNH TRÒN */}
      <section id="k2" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("2. Hình Tròn, Cung Tròn và Hình Quạt","2. Circles, Arcs and Sectors")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:20,transition:"all 0.3s" }}>
          {[{icon:"⭕",name:t("Hình tròn bán kính R","Circle radius R"),formulas:["S = πR²","C = 2πR","d = 2R (đường kính)"],c:"#1a5276",bg:"#eaf4fb"},
            {icon:"🌙",name:t("Cung tròn góc α (radian)","Arc, central angle α (radians)"),formulas:["ℓ = R·α (độ dài cung)","ℓ = 2πR·α/360° (độ)","Vd: α=60°, ℓ=πR/3"],c:"#1e8449",bg:"#eafaf1"},
            {icon:"🍕",name:t("Hình quạt tròn góc α","Sector, angle α"),formulas:["S = R²·α/2 (radian)","S = πR²·α/360° (độ)","Vd: α=90°, S=πR²/4"],c:"#922b21",bg:"#fdf2f2"},
            {icon:"🔵",name:t("Hình vành khăn (R và r)","Annulus (R and r)"),formulas:["S = π(R²−r²)","S = π(R+r)(R−r)","Vd: R=5, r=3: S=16π"],c:"#6c3483",bg:"#f5eef8"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:24,marginBottom:6 }}>{card.icon}</div>
              <div style={{ fontSize:14,fontWeight:700,color:card.c,marginBottom:8 }}>{card.name}</div>
              <div style={{ background:card.bg,borderRadius:8,padding:"8px 12px" }}>
                {card.formulas.map((f,j)=><div key={j} style={{ fontFamily:"monospace",fontSize:13,color:card.c,lineHeight:1.8 }}>{f}</div>)}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. ĐA GIÁC ĐỀU */}
      <section id="k3" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("3. Đa Giác Đều n Cạnh","3. Regular n-gon")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>{t("Đa giác đều n cạnh, mỗi cạnh a:","Regular n-gon, each side a:")}</div>
          <div style={{ background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:14,lineHeight:2.2 }}>
            Chu vi: P = n·a<br/>
            Góc trung tâm: α = 360°/n<br/>
            Bán kính ngoại tiếp: R = a/(2sin(180°/n))<br/>
            Bán kính nội tiếp: r = a/(2tan(180°/n))<br/>
            Diện tích: S = (n·a·r)/2 = (n·a²)/(4tan(180°/n))
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:14,transition:"all 0.3s" }}>
          {[{n:3,name:t("Tam giác đều","Equilateral △"),S:"S = a²√3/4"},
            {n:4,name:t("Hình vuông","Square □"),S:"S = a²"},
            {n:5,name:t("Ngũ giác đều","Regular ⬠"),S:"S ≈ 1.72a²"},
            {n:6,name:t("Lục giác đều","Regular ⬡"),S:"S = 3a²√3/2"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center" }}>
              <div style={{ fontSize:28,fontWeight:700,color:"#0B4F5C",marginBottom:4 }}>{card.n}</div>
              <div style={{ fontSize:13,color:"#777",marginBottom:6 }}>{card.name}</div>
              <div style={{ fontFamily:"monospace",fontSize:12,background:"white",padding:"4px 8px",borderRadius:6,color:"#0B4F5C" }}>{card.S}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. ỨNG DỤNG */}
      <section id="k4" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("4. Mẹo Tính Diện Tích Hình Phức Tạp","4. Tips for Complex Shapes")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{icon:"➕",title:t("Cộng diện tích","Add areas"),desc:t("Chia hình phức tạp thành các hình đơn giản, tính từng phần rồi cộng lại.","Split complex shape into simples, compute each part and add."),ex:"S = S₁ + S₂ + S₃"},
            {icon:"➖",title:t("Trừ diện tích","Subtract areas"),desc:t("Tính diện tích hình lớn, trừ đi các phần bị khoét.","Compute large shape, subtract holes or cut-outs."),ex:"S = S_lớn − S_lỗ"},
            {icon:"📐",title:t("Dùng tọa độ","Use coordinates"),desc:t("Công thức Shoelace: S=½|Σ(xᵢyᵢ₊₁−xᵢ₊₁yᵢ)| cho đa giác bất kỳ.","Shoelace formula: S=½|Σ(xᵢyᵢ₊₁−xᵢ₊₁yᵢ)| for any polygon."),ex:"Shoelace / Gauss"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:28,marginBottom:8 }}>{card.icon}</div>
              <div style={{ fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:6 }}>{card.title}</div>
              <div style={{ fontSize:13,color:"#777",lineHeight:1.6,marginBottom:8 }}>{card.desc}</div>
              <div style={{ fontFamily:"monospace",fontSize:13,background:"white",padding:"6px 10px",borderRadius:6,color:"#0B4F5C",fontWeight:600 }}>{card.ex}</div>
            </article>
          ))}
        </div>
      </section>

      {/* THỰC HÀNH */}
      <section id="th" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s" }}>
          {[
            {id:"e1",q:t("Tính diện tích hình thang ABCD có đáy lớn AB=12cm, đáy nhỏ CD=8cm, chiều cao h=5cm.","Trapezoid ABCD: base AB=12, top CD=8, height 5. Find area."),
             a:[t("S=(AB+CD)·h/2=(12+8)·5/2=20·5/2=50 cm²","S=(12+8)·5/2=50 cm²")]},
            {id:"e2",q:t("Hình vành khăn (annulus) bán kính ngoài R=10, bán kính trong r=6.\n(a) Diện tích\n(b) Chu vi ngoài + chu vi trong","Annulus: outer R=10, inner r=6.\n(a) Area\n(b) Outer + inner circumference"),
             a:[t("(a) S=π(R²−r²)=π(100−36)=64π≈201.06 cm²","S=64π≈201.06"),t("(b) C_ngoài=2π·10=20π≈62.83","C_outer=20π"),t("C_trong=2π·6=12π≈37.70","C_inner=12π"),t("Tổng chu vi=20π+12π=32π≈100.53 cm","Total=32π")]},
            {id:"e3",q:t("Lục giác đều cạnh a=4cm. Tính diện tích S.","Regular hexagon, side 4cm. Find area."),
             a:[t("S=3a²√3/2=3·16·√3/2=24√3≈41.57 cm²","S=3×16×√3/2=24√3≈41.57"),t("(Lục giác đều = 6 tam giác đều cạnh a)","(Regular hexagon = 6 equilateral triangles)")]},
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
       <div className="reveal" data-reveal style={{ textAlign:"center",color:"#777",fontSize:15,marginBottom:60 }}>Toán 10 · Chân Trời Sáng Tạo · {t("Bài 19 / Chương VI","Lesson 19 / Chapter VI")}</div>
      <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
    <DuoTranslate/> 
    </div></div>
  );
}
