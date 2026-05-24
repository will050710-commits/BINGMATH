
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "@/components/DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);

export default function Lesson15_TichSoVecto() {
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
    "start": 0,
    "end": 12,
    "words": [
      {
        "text": "This lesson introduces",
        "vi": "Bài học này giới thiệu"
      },
      {
        "text": "scalar multiplication of vectors",
        "vi": "tích của một số với véc-tơ",
        "detail": "<b>scalar multiplication of vectors</b>: tích của một số với véc-tơ.",
        "detailTitle": "scalar multiplication of vectors (tích của một số với véc-tơ)"
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
        "text": "scalar",
        "vi": "số thực",
        "detail": "<b>scalar</b>: số thực.",
        "detailTitle": "scalar (số thực)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "same direction",
        "vi": "cùng hướng",
        "detail": "<b>same direction</b>: cùng hướng.",
        "detailTitle": "same direction (cùng hướng)"
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
        "text": "opposite direction",
        "vi": "ngược hướng",
        "detail": "<b>opposite direction</b>: ngược hướng.",
        "detailTitle": "opposite direction (ngược hướng)"
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
        "text": "scalar",
        "vi": "số thực",
        "detail": "<b>scalar</b>: số thực.",
        "detailTitle": "scalar (số thực)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "same direction",
        "vi": "cùng hướng",
        "detail": "<b>same direction</b>: cùng hướng.",
        "detailTitle": "same direction (cùng hướng)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "opposite direction",
        "vi": "ngược hướng",
        "detail": "<b>opposite direction</b>: ngược hướng.",
        "detailTitle": "opposite direction (ngược hướng)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];


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
  const mcQ=[{'q': 'k→a với k < 0 và →a ≠ →0. Kết quả k→a có hướng thế nào?', 'o': ['Cùng hướng →a', 'Ngược hướng →a', 'Hướng tùy ý', 'Không có hướng'], 'a': 1, 'ex': 'k<0 → k→a ngược hướng →a, độ dài |k|·|→a|.'}, {'q': '|−3→a| = ? khi |→a| = 5', 'o': ['−15', '15', '3', '8'], 'a': 1, 'ex': '|−3→a|=|−3|·|→a|=3·5=15.'}, {'q': '→b = k·→a nghĩa là?', 'o': ['→a và →b bằng nhau', '→a và →b cùng phương', '→a và →b vuông góc', '→a và →b cùng hướng'], 'a': 1, 'ex': '→b=k·→a ⟺ →a và →b cùng phương (song song hoặc trùng).'}, {'q': 'A,B,C thẳng hàng khi nào?', 'o': ['→AB ⊥ →AC', '→AB = k·→AC', '|→AB|=|→AC|', '→AB + →AC = →0'], 'a': 1, 'ex': 'A,B,C thẳng hàng ⟺ →AB = k·→AC (tồn tại k).'}, {'q': 'k(→a + →b) = ?', 'o': ['k→a + →b', '→a + k→b', 'k→a + k→b', 'k²(→a+→b)'], 'a': 2, 'ex': 'Tính chất phân phối: k(→a+→b)=k→a+k→b.'}];
  const tfC=[{'s': 'k→a với k=0 cho kết quả là vectơ không →0.', 'a': true, 'ex': 'ĐÚNG — 0·→a = →0 với mọi →a.'}, {'s': '2→a có cùng hướng với →a.', 'a': true, 'ex': 'ĐÚNG — k=2>0 → cùng hướng.'}, {'s': '−→a có cùng hướng với →a.', 'a': false, 'ex': 'SAI — −→a=(−1)→a, k=−1<0 → NGƯỢC hướng →a.'}, {'s': '→b = k·→a ⟺ →a và →b cùng phương.', 'a': true, 'ex': 'ĐÚNG — điều kiện cùng phương cho →a ≠ →0.'}, {'s': '|k→a| = k·|→a| với mọi k.', 'a': false, 'ex': 'SAI — |k→a| = |k|·|→a| (giá trị tuyệt đối của k).'}];
  const fQ=[{'id': 'f1', 'tp': '→b = k·→a ⟺ →a và →b ___.', 'ans': 'cùng phương', 'alt': ['cung phuong', 'parallel', 'song song'], 'h': ''}, {'id': 'f2', 'tp': '|k→a| = ___ · |→a|', 'ans': '|k|', 'alt': ['|k|', 'abs(k)'], 'h': ''}, {'id': 'f3', 'tp': '(−1)·→a = ___', 'ans': '−→a', 'alt': ['-a', '−a', '−→a', '-vec(a)'], 'h': ''}];
  const tabs=[["w","🚀",t("Khởi động","Warm-Up")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. Định Nghĩa","1. Definition")],["k2","📖",t("2. Tính Chất","2. Properties")],["k3","📖",t("3. Điều Kiện Cùng Phương","3. Collinearity")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮",t("Mini Game","Mini Game")]];

  return (
    <div style={{width:"100%",background:"#fff",display:"flex",justifyContent:"center"}}>
    <div style={{width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80}}>
      <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/Cacbaitoan10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
      <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
        <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương V · Vectơ</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Bài 15: Tích của Số với Vectơ</div></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 Tiếng Việt</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 English</button></div>
      </header>
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
        {[
          t("Định nghĩa tích của số thực k với vectơ →a.","Define the product of scalar k and vector →a."),
          t("Tính độ dài |k→a| = |k|·|→a|.","Compute |k→a| = |k|·|→a|."),
          t("Nắm các tính chất: phân phối, kết hợp, đơn vị.","Master properties: distributive, associative, identity."),
          t("Áp dụng điều kiện cùng phương: →b=k·→a.","Apply collinearity condition: →b=k·→a."),
          t("Kiểm tra 3 điểm thẳng hàng bằng điều kiện vectơ.","Check 3 collinear points using vector condition."),
        ].map((item, idx) => (
          <div key={idx} style={{fontSize:15,color:"#555",marginBottom:6}}>{item}</div>
        ))}
      </div>
      <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

      <section id="w" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Nếu một người đi với vectơ vận tốc →v, thì sau 2 giờ họ đã di chuyển theo vectơ 2→v — cùng hướng nhưng gấp đôi độ dài. Đây là tích của số với vectơ!","If someone moves with velocity vector →v, after 2 hours they've displaced 2→v — same direction but double length. This is scalar multiplication of a vector!")}</div>
          <div style={{fontSize:16}}>❓ <em>{t("k→v với k < 0 nghĩa là gì về hướng?","What does k→v mean for direction when k < 0?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="fNk_zzaMoSs"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ 3Blue1Brown (CC BY)", "Video by 3Blue1Brown (CC BY)")}
          />
        </div>
      </section>
      <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("1. Định Nghĩa Tích Số với Vectơ","1. Definition: Scalar × Vector")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
          <div style={{fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10}}>📌 {t("Định nghĩa","Definition")}</div>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Cho số thực k và vectơ →a ≠ →0:","For real number k and vector →a ≠ →0:")}</div>
          <div style={{background:"white",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:15,lineHeight:2.2}}>
            |k→a| = |k| · |→a|<br/>
            k &gt; 0: k→a cùng hướng →a<br/>
            k &lt; 0: k→a ngược hướng →a<br/>
            k = 0: k→a = →0
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,transition:"all 0.3s"}}>
          {[{k:"k > 0",desc:t("Cùng hướng →a, dài |k|·|→a|","Same direction as →a, length |k|·|→a|"),bg:"#eafaf1",c:"#1e8449"},
            {k:"k < 0",desc:t("Ngược hướng →a, dài |k|·|→a|","Opposite to →a, length |k|·|→a|"),bg:"#fdf2f2",c:"#922b21"},
            {k:"k = 0",desc:t("Kết quả là vectơ không →0","Result is zero vector →0"),bg:"#eaf4fb",c:"#1a5276"},
            {k:"|k| > 1",desc:t("Phóng to vectơ (kéo dài)","Vector scaled up (stretched)"),bg:"#fff3cd",c:"#856404"},
          ].map((card,i)=><article key={i} style={{padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center"}}><div style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:card.c,marginBottom:8}}>{card.k}</div><div style={{background:card.bg,color:card.c,padding:"8px 10px",borderRadius:8,fontSize:13,lineHeight:1.6}}>{card.desc}</div></article>)}
        </div>
      </section>
      <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("2. Tính Chất","2. Properties")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
          <div style={{background:"white",borderRadius:8,padding:"14px 18px",fontFamily:"monospace",fontSize:15,lineHeight:2.2}}>
            k(→a + →b) = k→a + k→b  (phân phối)<br/>
            (k + l)→a = k→a + l→a   (phân phối)<br/>
            (kl)→a = k(l→a)          (kết hợp)<br/>
            1·→a = →a                 (đơn vị)<br/>
            (−1)·→a = −→a             (đối)
          </div>
        </div>
      </section>
      <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("3. Điều Kiện Cùng Phương","3. Collinearity Condition")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
          <div style={{fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:10}}>📌 {t("Định lý","Theorem")}</div>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Hai vectơ →a ≠ →0 và →b cùng phương khi và chỉ khi tồn tại số thực k sao cho:","Two vectors →a ≠ →0 and →b are parallel iff there exists a real k such that:")}</div>
          <div style={{background:"white",borderRadius:10,padding:"12px 18px",fontFamily:"monospace",fontSize:18,textAlign:"center",color:"#0B4F5C",fontWeight:700}}>→b = k·→a</div>
          <div style={{marginTop:12,padding:"10px 14px",background:"#fff3cd",borderRadius:8,fontSize:14}}>{t("💡 Ứng dụng: kiểm tra 3 điểm thẳng hàng. A, B, C thẳng hàng ⟺ →AB = k·→AC.","💡 Application: check if 3 points are collinear. A, B, C collinear ⟺ →AB = k·→AC.")}</div>
        </div>
      </section>
      <section id="th" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
          {[{id:"e1",q:t("Cho →a = →AB, |→a| = 4. Tính |3→a| và |−2→a|.","→a = →AB, |→a|=4. Find |3→a| and |−2→a|."),
             a:[t("|3→a| = |3|·|→a| = 3·4 = 12","| 3→a| = 3·4 = 12"),t("|−2→a| = |−2|·|→a| = 2·4 = 8","| −2→a| = 2·4 = 8")]},
            {id:"e2",q:t("Chứng minh G là trọng tâm tam giác ABC: →GA + →GB + →GC = →0","Prove G is centroid of triangle ABC: →GA+→GB+→GC=→0"),
             a:[t("Gọi M là trung điểm BC: →GM = (→GB+→GC)/2 → →GB+→GC = 2→GM","Let M be midpoint BC: →GB+→GC=2→GM"),t("G là trọng tâm → G trên AM với AG=2GM → →GA = −2→GM","G is centroid → AG=2GM → →GA=−2→GM"),t("→GA+→GB+→GC = −2→GM+2→GM = →0 ✓","→GA+→GB+→GC=0 ✓")]},
            {id:"e3",q:t("Ba điểm A, B, C thẳng hàng. →AB=(2,4), →AC=(1,2). Kiểm tra.","A,B,C collinear? →AB=(2,4), →AC=(1,2). Check."),
             a:[t("→AB = 2·(1,2) = 2·→AC","→AB = 2·→AC"),t("Vì →AB = k·→AC (k=2), nên A, B, C thẳng hàng ✓","Since →AB=2·→AC, points A,B,C are collinear ✓")]},
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
