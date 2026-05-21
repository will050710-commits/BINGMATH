
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

export default function OnTapChuong5() {
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
      start: 0, end: 6,
      words: [
        { text: "A", vi: "Một" },
        { text: "vector", vi: "vecto,", detail: "<b>Vector (Vectơ)</b>:<br/>Một đoạn thẳng có hướng, tức là có điểm đầu và điểm cuối xác định.", detailTitle: "Vector (Vectơ)" },
        { text: "has", vi: "có" },
        { text: "both", vi: "cả" },
        { text: "magnitude", vi: "độ dài", detail: "<b>Magnitude (Độ dài vectơ)</b>:<br/>Khoảng cách giữa điểm đầu và điểm cuối của vectơ đó.", detailTitle: "Magnitude (Độ dài)" },
        { text: "and", vi: "và" },
        { text: "direction.", vi: "hướng.", detail: "<b>Direction (Hướng / Phương chiều)</b>: Phương đường thẳng chứa vectơ và chiều từ điểm đầu đến điểm cuối.", detailTitle: "Direction (Hướng)" }
      ]
    },
    {
      start: 6, end: 12,
      words: [
        { text: "Vector", vi: "Vectơ" },
        { text: "addition", vi: "phép cộng,", detail: "<b>Vector addition (Cộng vectơ)</b>:<br/>Phép toán cộng hai vectơ theo quy tắc ba điểm hoặc quy tắc hình bình hành.", detailTitle: "Vector addition" },
        { text: "gives", vi: "cho ra" },
        { text: "a", vi: "một" },
        { text: "resultant", vi: "tổng hợp" },
        { text: "vector.", vi: "vecto tổng.", detail: "<b>Resultant vector (Vectơ tổng)</b>: Vectơ kết quả thu được từ phép cộng các vectơ thành phần.", detailTitle: "Resultant vector" }
      ]
    },
    {
      start: 12, end: 20,
      words: [
        { text: "Scalar", vi: "Vô hướng" },
        { text: "multiplication", vi: "phép nhân,", detail: "<b>Scalar multiplication (Nhân vectơ với một số)</b>:<br/>Phép toán nhân số k với vectơ a để được vectơ mới.", detailTitle: "Scalar multiplication" },
        { text: "and", vi: "và" },
        { text: "dot", vi: "tích" },
        { text: "product", vi: "vô hướng,", detail: "<b>Dot product (Tích vô hướng)</b>:<br/>Tích của độ dài hai vectơ với cosin của góc giữa chúng: a.b = |a|.|b|.cos(a,b).", detailTitle: "Dot product" },
        { text: "of", vi: "của" },
        { text: "orthogonal", vi: "vuông góc,", detail: "<b>Orthogonal (Vuông góc / Trực giao)</b>: Hai vectơ vuông góc khi và chỉ khi tích vô hướng của chúng bằng 0.", detailTitle: "Orthogonal (Vuông góc)" },
        { text: "vectors.", vi: "các vectơ." }
      ]
    }
  ];


  const sc=(id)=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});};
  const tr=(id)=>setRev(p=>({...p,[id]:!p[id]}));

  const mcQ=[
    {q:t("Hai vectơ bằng nhau khi nào?","When are two vectors equal?"),o:[t("Cùng điểm đầu","Same start point"),t("Cùng độ dài và cùng hướng","Same length and direction"),t("Cùng điểm cuối","Same end point"),t("Cùng độ dài","Same length")],a:1,ex:t("→a=→b ⟺ cùng độ dài VÀ cùng hướng.","Equal ⟺ same length AND direction.")},
    {q:t("Hình bình hành ABCD. →AB + →AD = ?","Parallelogram ABCD. →AB + →AD = ?"),o:["→BD","→AC","→BC","→CD"],a:1,ex:t("Quy tắc hình bình hành: →AB+→AD=→AC (đường chéo).","Parallelogram rule: sum = diagonal →AC.")},
    {q:t("→b = k·→a nghĩa là?","→b=k·→a means?"),o:[t("→a và →b bằng nhau","equal"),t("→a và →b cùng phương","parallel"),t("→a và →b vuông góc","perpendicular"),t("→a và →b cùng hướng","same direction")],a:1,ex:t("→b=k·→a ⟺ cùng phương (tồn tại số thực k).","→b=k·→a ⟺ parallel (k real).")},
    {q:t("→a=(3,4). |→a| = ?","→a=(3,4). |→a|=?"),o:["7","1","5","√7"],a:2,ex:t("|→a|=√(9+16)=√25=5.","| →a|=5.")},
    {q:t("→a·→b = 0 nghĩa là?","→a·→b=0 means?"),o:[t("→a = →b","→a=→b"),t("→a ⊥ →b","→a⊥→b"),t("→a và →b cùng hướng","same direction"),t("|→a|=|→b|","same length")],a:1,ex:t("→a·→b=|→a||→b|cosφ=0 ⟺ cosφ=0 ⟺ φ=90° ⟺ →a⊥→b.","dot product=0 ⟺ perpendicular.")},
  ];
  const tfC=[
    {s:t("Vectơ đối của →AB là →BA.","Opposite of →AB is →BA."),a:true,ex:t("ĐÚNG — cùng độ dài, ngược hướng.","TRUE — same length, opposite direction.")},
    {s:t("→AB + →BC + →CA = →0.","→AB+→BC+→CA=→0."),a:true,ex:t("ĐÚNG — quy tắc ba điểm áp dụng hai lần.","TRUE — apply three-point rule twice.")},
    {s:t("k→a với k<0 cùng hướng →a.","k→a with k<0 has same direction as →a."),a:false,ex:t("SAI — k<0 → ngược hướng →a.","FALSE — k<0 → opposite direction.")},
    {s:t("→a·→a = |→a|²","→a·→a = |→a|²"),a:true,ex:t("ĐÚNG — φ=0°, cosφ=1 → →a·→a=|→a|².","TRUE — φ=0°, cosφ=1.")},
    {s:t("→a·→b = →b·→a (giao hoán).","→a·→b=→b·→a (commutative)."),a:true,ex:t("ĐÚNG — tích vô hướng giao hoán.","TRUE — dot product is commutative.")},
  ];
  const fQ=[
    {id:"f1",tp:t("Quy tắc ba điểm: →AB + →BC = ___","Three-point rule: →AB+→BC=___"),ans:"→AC",alt:["AC","vec(AC)","→AC"],h:""},
    {id:"f2",tp:t("→a ⊥ →b ⟺ →a · →b = ___","→a⊥→b ⟺ →a·→b=___"),ans:"0",alt:["0"],h:""},
    {id:"f3",tp:t("A,B,C thẳng hàng ⟺ →AB = k · ___","A,B,C collinear ⟺ →AB=k·___"),ans:"→AC",alt:["AC","→AC","vec(AC)"],h:""},
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
  const tabs=[["tomTat","📚",t("Tóm Tắt","Summary")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["congThuc","📐",t("Công Thức","Formulas")],["baiTap","✏️",t("Bài Tập TH","Mixed")],["miniGame","🎮","Mini Game"]];

  return (
    <div style={{ width:"100%",background:"#fff",display:"flex",justifyContent:"center" }}>
    <div style={{ width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80 }}>
      <div className="reveal" data-reveal style={{ marginBottom:24 }}><Link href="/Cacbaitoan10" style={{ textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15 }}>← {t("Quay lại","Back")}</Link></div>
      <header className="reveal" data-reveal style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300 }}>
        <div>
          <div style={{ fontWeight:"bold",fontSize:22,color:"#0B4F5C" }}>{t("Chương V · Vectơ","Chapter V · Vectors")}</div>
          <div style={{ fontSize:28,fontWeight:600,marginTop:4 }}>{t("Ôn Tập Chương V","Chapter V Review")}</div>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>setLang("vi")} style={{ background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
          <button onClick={()=>setLang("en")} style={{ background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
        </div>
      </header>

      {/* Quick links */}
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="70" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginBottom:40,transition:"all 0.3s" }}>
        {[{slug:"khai-niem-vecto",num:"15",title:t("Khái Niệm Vectơ","Vector Concept")},{slug:"tong-hieu-vecto",num:"16",title:t("Tổng & Hiệu Vectơ","Sum & Difference")},{slug:"tich-so-vecto",num:"17",title:t("Tích Số với Vectơ","Scalar Mult.")},{slug:"tich-vo-huong",num:"18",title:t("Tích Vô Hướng","Dot Product")}].map(l=>(
          <Link key={l.slug} href={`/cacbailam10/${l.slug}`} style={{ textDecoration:"none" }}>
            <article style={{ padding:14,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",cursor:"pointer" }}>
              <div style={{ fontSize:12,color:"#777",marginBottom:3 }}>{t("Bài","L")} {l.num}</div>
              <div style={{ fontSize:14,fontWeight:600,color:"#0B4F5C" }}>{l.title}</div>
              <div style={{ fontSize:12,color:"#aaa",marginTop:3 }}>← {t("Ôn lại","Review")}</div>
            </article>
          </Link>
        ))}
      </div>

      <div style={{ position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)" }}>
        <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
          {tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{ background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s" }} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}
        </div>
      </div>

      {/* TÓM TẮT */}
      <section id="tomTat" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📚" title={t("Tóm Tắt Chương V","Chapter V Summary")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:22,transition:"all 0.3s" }}>
          {[{title:t("Bài 15 · Khái Niệm Vectơ","L15 · Vector Concept"),pts:[t("Vectơ = đoạn thẳng có hướng","Vector = directed segment"),t("→a=→b ⟺ cùng độ dài + cùng hướng","→a=→b ⟺ same length + direction"),t("Vectơ đối: −→a (ngược hướng, cùng độ dài)","Opposite: −→a (reverse direction, same length)"),t("Vectơ không: |→0|=0","Zero vector: |→0|=0")]},
            {title:t("Bài 16 · Tổng & Hiệu","L16 · Sum & Difference"),pts:[t("Quy tắc 3 điểm: →AB+→BC=→AC","Three-point: →AB+→BC=→AC"),t("Hình bình hành: →OA+→OB=→OC","Parallelogram: →OA+→OB=→OC"),t("→AB=→OB−→OA (vectơ vị trí)","→AB=→OB−→OA (position vectors)"),t("→a+(−→a)=→0","→a+(−→a)=→0")]},
            {title:t("Bài 17 · Tích Số với Vectơ","L17 · Scalar Multiplication"),pts:[t("|k→a|=|k|·|→a|","| k→a|=|k|·|→a|"),t("k>0: cùng hướng; k<0: ngược hướng","k>0: same dir; k<0: opposite"),t("→b=k·→a ⟺ →a//→b (cùng phương)","→b=k·→a ⟺ →a//→b (parallel)"),t("A,B,C thẳng hàng ⟺ →AB=k·→AC","A,B,C collinear ⟺ →AB=k·→AC")]},
            {title:t("Bài 18 · Tích Vô Hướng","L18 · Dot Product"),pts:[t("→a·→b=|→a||→b|cosφ (số thực!)","→a·→b=|→a||→b|cosφ (scalar!)"),t("→a⊥→b ⟺ →a·→b=0","→a⊥→b ⟺ →a·→b=0"),t("→a=(x₁,y₁), →b=(x₂,y₂): →a·→b=x₁x₂+y₁y₂","Coordinates: →a·→b=x₁x₂+y₁y₂"),t("|→a|=√(x²+y²)","| →a|=√(x²+y²)")]},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:10 }}>{card.title}</div>
              {card.pts.map((pt,j)=><div key={j} style={{ fontSize:13,color:"#555",marginBottom:7,display:"flex",gap:8 }}><span style={{ color:"#0B4F5C",fontWeight:700,flexShrink:0 }}>•</span><span style={{ fontFamily:"monospace" }}>{pt}</span></div>)}
            </article>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="LyGKycYT2v0"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ 3Blue1Brown (CC BY)", "Video by 3Blue1Brown (CC BY)")}
          />
        </div>
      </section>

      {/* CÔNG THỨC */}
      <section id="congThuc" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📐" title={t("Bảng Công Thức Chương V","Chapter V Formula Sheet")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:20,transition:"all 0.3s" }}>
          {[{label:t("Tổng & Hiệu","Sum & Difference"),formula:"→AB + →BC = →AC\n→a − →b = →a + (−→b)\n→AB = →OB − →OA\n→GA + →GB + →GC = →0 (trọng tâm)"},
            {label:t("Tích số với vectơ","Scalar multiplication"),formula:"|k→a| = |k| · |→a|\nk(→a+→b) = k→a + k→b\n(k+l)→a = k→a + l→a\n→b = k·→a ⟺ →a // →b"},
            {label:t("Tích vô hướng","Dot product"),formula:"→a·→b = |→a|·|→b|·cosφ\n→a=(x₁,y₁): →a·→b=x₁x₂+y₁y₂\n→a⊥→b ⟺ →a·→b=0\ncosφ=(→a·→b)/(|→a|·|→b|)"},
            {label:t("Độ dài & Điều kiện","Length & Conditions"),formula:"|→a|=√(x²+y²)\n|→a|²=→a·→a\n3 điểm thẳng hàng: →AB=k·→AC\nHình bình hành: →OA+→OB=→OC"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:14,fontWeight:700,color:"#0B4F5C",marginBottom:10 }}>{card.label}</div>
              <div style={{ fontFamily:"monospace",fontSize:13,background:"white",padding:"10px 12px",borderRadius:8,lineHeight:1.9,whiteSpace:"pre-wrap" }}>{card.formula}</div>
            </article>
          ))}
        </div>
      </section>

      {/* BÀI TẬP TỔNG HỢP */}
      <section id="baiTap" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Bài Tập Tổng Hợp","Mixed Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s" }}>
          {[
            {id:"e1",badge:"L15+16",q:t("Cho hình bình hành ABCD, G là giao điểm hai đường chéo.\n(a) Tính →AC bằng →AB và →AD.\n(b) Chứng minh G là trung điểm AC: →GA+→GC=→0.","Parallelogram ABCD, G = intersection of diagonals.\n(a) Express →AC via →AB and →AD.\n(b) Prove G is midpoint of AC: →GA+→GC=→0."),
             a:[t("(a) →AC = →AB + →BC = →AB + →AD (vì →BC=→AD)","(a) →AC=→AB+→AD (since →BC=→AD)"),t("(b) G là trung điểm AC → →GA = −→GC → →GA+→GC=→0 ✓","(b) G midpoint AC → →GA=−→GC → sum=→0 ✓")]},
            {id:"e2",badge:"L17+18",q:t("Cho →a=(2,1), →b=(−1,3).\n(a) Tính →a·→b.\n(b) Tính góc φ giữa →a và →b.","→a=(2,1), →b=(−1,3).\n(a) Find →a·→b.\n(b) Find angle φ."),
             a:["→a·→b = 2·(−1)+1·3 = −2+3 = 1",t("|→a|=√5, |→b|=√10","| →a|=√5, |→b|=√10"),t("cosφ = 1/(√5·√10) = 1/√50 = √2/10 → φ=arccos(√2/10)≈81.87°","cosφ=1/√50 → φ≈81.87°")]},
            {id:"e3",badge:t("Tổng hợp","Mixed"),q:t("Cho A(1,2), B(3,6), C(4,8). Kiểm tra A, B, C có thẳng hàng không.","A(1,2), B(3,6), C(4,8). Are A, B, C collinear?"),
             a:[t("→AB=(3−1, 6−2)=(2,4)","→AB=(2,4)"),t("→AC=(4−1, 8−2)=(3,6)","→AC=(3,6)"),t("→AB=2·(1,2) và →AC=3·(1,2). Cả hai cùng phương (1,2).","Both parallel to (1,2)."),t("→AB = (2/3)·→AC → A, B, C THẲNG HÀNG ✓","→AB=(2/3)→AC → A,B,C are COLLINEAR ✓")]},
          ].map(({id,q,a,badge})=>(
            <article key={id}>
              <div style={{ padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:6 }}>
                  <div style={{ fontSize:17,fontWeight:600 }}>📝 {t("Bài tập","Exercise")}</div>
                  <span style={{ background:"black",color:"white",fontSize:12,fontWeight:700,padding:"2px 10px",borderRadius:20 }}>{badge}</span>
                </div>
                <div style={{ fontSize:15,lineHeight:1.7,whiteSpace:"pre-wrap" }}>{q}</div>
              </div>
              <button onClick={()=>tr(id)} style={{ display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left" }}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>
              {rev[id]&&<div style={{ padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px" }}>{a.map((l,i)=><div key={i} style={{ fontSize:15,color:"#555",marginBottom:6 }}>{l}</div>)}</div>}
            </article>
          ))}
        </div>
      </section>

      {/* MINI GAME */}
      <section id="miniGame" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="🎮" title={t("Mini Game · Ôn Tập Chương V","Mini Game · Chapter V Review")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:24,marginBottom:32,transition:"all 0.3s" }}>
          {[["mc","🧩",t("Trắc Nghiệm","Multiple Choice"),t("5 câu","5 Q")],["tf","🃏",t("Đúng / Sai","True / False"),t("5 thẻ","5 cards")],["fill","✍️",t("Điền Chỗ Trống","Fill in Blank"),t("3 câu","3 items")]].map(([mode,icon,label,sub])=>(
            <article key={mode} onClick={()=>setGm(mode)} style={{ background:gm===mode?"black":"#f9f9f9",color:gm===mode?"white":"black",cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:20,borderRadius:10 }}>
              <div style={{ fontSize:28,marginBottom:6 }}>{icon}</div><div style={{ fontSize:18,fontWeight:600 }}>{label}</div><div style={{ fontSize:14,opacity:0.7 }}>{sub}</div>
            </article>
          ))}
        </div>
        {gm==="mc"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!md?(<><div style={{ color:"#777",fontSize:15,marginBottom:8 }}>{t("Câu","Q")} {mi+1}/{mcQ.length} · {t("Điểm:","Score:")} {msc}</div><div style={{ fontSize:20,fontWeight:600,marginBottom:20 }}>{mcQ[mi].q}</div><div style={{ display:"flex",flexDirection:"column",gap:12 }}>{mcQ[mi].o.map((opt,i)=>{let bg="white",co="black";if(ms!==null){if(i===mcQ[mi].a){bg="#eafaf1";co="#1e8449";}else if(i===ms){bg="#fdf2f2";co="#922b21";}}return <button key={i} onClick={()=>sel(i)} style={{ textAlign:"left",padding:"14px 18px",borderRadius:10,border:"none",background:bg,color:co,fontSize:15,fontWeight:ms!==null&&(i===ms||i===mcQ[mi].a)?600:400,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{String.fromCharCode(65+i)}. {opt}</button>;})}</div>{ms!==null&&<><div style={{marginTop:16,padding:"12px 16px",background:"white",borderRadius:8,fontSize:15,color:"#555",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {mcQ[mi].ex}</div><button onClick={nx} style={{marginTop:14,padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{mi+1<mcQ.length?t("Câu tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>}</>):<RS items={mri} onReset={rm} scoreLabel={msc===mcQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):msc>=3?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
        {gm==="tf"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!td?(<><div style={{ color:"#777",fontSize:15,marginBottom:14 }}>{t("Thẻ","Card")} {ti+1}/{tfC.length} · {t("Điểm:","Score:")} {ts}</div><article style={{ background:"white",borderRadius:10,padding:24,marginBottom:20,textAlign:"center",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}><div style={{ fontSize:18,lineHeight:1.7,marginBottom:24 }}>{tfC[ti].s}</div>{!tf?(<div style={{ display:"flex",gap:16,justifyContent:"center" }}><button onClick={()=>ta(true)} style={{ padding:"12px 36px",background:"#eafaf1",color:"#1e8449",border:"2px solid #1e8449",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer" }}>✅ {t("ĐÚNG","TRUE")}</button><button onClick={()=>ta(false)} style={{ padding:"12px 36px",background:"#fdf2f2",color:"#922b21",border:"2px solid #922b21",borderRadius:8,fontWeight:700,fontSize:16,cursor:"pointer" }}>❌ {t("SAI","FALSE")}</button></div>):(<><div style={{padding:"12px 16px",background:"#f9f9f9",borderRadius:8,fontSize:15,color:"#555",textAlign:"left",marginBottom:14,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>💬 {tfC[ti].ex}</div><button onClick={tn} style={{padding:"12px 28px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>{ti+1<tfC.length?t("Thẻ tiếp ▶","Next ▶"):t("Xem kết quả","See Results")}</button></>)}</article></>):<RS items={tri} onReset={rt} scoreLabel={ts===tfC.length?t("Xuất sắc! 🎉","Perfect! 🎉"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
        {gm==="fill"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!fc?(<><div style={{ fontSize:18,fontWeight:600,marginBottom:20 }}>{t("Điền câu trả lời","Fill in each blank")}</div>{fQ.map((q,qi)=>(<div key={q.id} style={{ marginBottom:24 }}><div style={{ fontSize:15,color:"#777",marginBottom:6 }}>{t("Câu","Q")} {qi+1}</div><div style={{ fontSize:16,lineHeight:1.7,marginBottom:10 }}>{q.tp}</div><input value={fa[q.id]||""} onChange={e=>setFa(p=>({...p,[q.id]:e.target.value}))} placeholder={t("Nhập đáp án...","Answer...")} style={{ width:"100%",padding:"12px 16px",borderRadius:8,fontSize:15,outline:"none",border:"1px solid #ddd",background:"white",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",boxSizing:"border-box" }} /></div>))}<button onClick={()=>setFc(true)} style={{ padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer" }}>{t("Kiểm tra","Check Answers")}</button></>):<RS items={fri} onReset={()=>{setFa({});setFc(false);}} scoreLabel={fs===fQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):fs>=2?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
      </section>

      <hr style={{ width:"5px" }}></hr>
      <div className="reveal" data-reveal style={{ textAlign:"center",color:"#777",fontSize:15,marginBottom:60 }}>Toán 10 · Chân Trời Sáng Tạo · {t("Ôn Tập Chương V","Chapter V Review")}</div>
      <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
    <DuoTranslate/> 
    </div></div>
  );
}
