
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import DuoTranslate from "@/components/DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);

export default function Lesson14_TongHieuVecto() {
  const { user, saveGameResult } = useAuth();
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
        "text": "vector addition and subtraction",
        "vi": "tổng và hiệu véc-tơ",
        "detail": "<b>vector addition and subtraction</b>: tổng và hiệu véc-tơ.",
        "detailTitle": "vector addition and subtraction (tổng và hiệu véc-tơ)"
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
        "text": "sum",
        "vi": "tổng",
        "detail": "<b>sum</b>: tổng.",
        "detailTitle": "sum (tổng)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "difference",
        "vi": "hiệu",
        "detail": "<b>difference</b>: hiệu.",
        "detailTitle": "difference (hiệu)"
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
        "text": "parallelogram rule",
        "vi": "quy tắc hình bình hành",
        "detail": "<b>parallelogram rule</b>: quy tắc hình bình hành.",
        "detailTitle": "parallelogram rule (quy tắc hình bình hành)"
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
        "text": "sum",
        "vi": "tổng",
        "detail": "<b>sum</b>: tổng.",
        "detailTitle": "sum (tổng)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "difference",
        "vi": "hiệu",
        "detail": "<b>difference</b>: hiệu.",
        "detailTitle": "difference (hiệu)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "parallelogram rule",
        "vi": "quy tắc hình bình hành",
        "detail": "<b>parallelogram rule</b>: quy tắc hình bình hành.",
        "detailTitle": "parallelogram rule (quy tắc hình bình hành)"
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
  const mcQ=[{'q': '→AB + →BC = ?', 'o': ['→CA', '→AC', '→BA', '→0'], 'a': 1, 'ex': 'Quy tắc ba điểm: →AB+→BC=→AC.'}, {'q': '→a + (−→a) = ?', 'o': ['→a', '2→a', '→0', '−2→a'], 'a': 2, 'ex': '→a + (−→a) = →0. Vectơ cộng với vectơ đối của nó bằng vectơ không.'}, {'q': 'Hình bình hành ABCD. →AB + →AD = ?', 'o': ['→BD', '→AC', '→BC', '→CD'], 'a': 1, 'ex': 'Quy tắc hình bình hành: →AB+→AD=→AC (đường chéo).'}, {'q': '→AB − →AC = ?', 'o': ['→BC', '→CB', '→AC', '→CA'], 'a': 1, 'ex': '→AB − →AC = →AB + →CA = →CA + →AB = →CB.'}, {'q': 'Tính chất: →a + →b = →b + →a là?', 'o': ['Kết hợp', 'Giao hoán', 'Phân phối', 'Đơn vị'], 'a': 1, 'ex': 'Tính chất GIAO HOÁN: →a+→b=→b+→a.'}];
  const tfC=[{'s': '→AB + →BC = →AC (quy tắc ba điểm).', 'a': true, 'ex': 'ĐÚNG — đây là quy tắc ba điểm chuẩn.'}, {'s': '→a + →0 = →0.', 'a': false, 'ex': 'SAI — →a + →0 = →a (vectơ không là phần tử trung lập).'}, {'s': '→AB = →OB − →OA.', 'a': true, 'ex': 'ĐÚNG — →AB = →AO+→OB = −→OA+→OB = →OB−→OA.'}, {'s': '(→a + →b) + →c = →a + (→b + →c).', 'a': true, 'ex': 'ĐÚNG — tính chất kết hợp của phép cộng vectơ.'}, {'s': '→a − →b = →b − →a.', 'a': false, 'ex': 'SAI — phép trừ không giao hoán: →a−→b = →a+(−→b) ≠ →b−→a.'}];
  const fQ=[{'id': 'f1', 'tp': '→AB + →BC + →CA = ___', 'ans': '→0', 'alt': ['0', 'vec0', '→0'], 'h': ''}, {'id': 'f2', 'tp': 'Hình bình hành OABC: →OA + →OC = ___', 'ans': '→OB', 'alt': ['OB', 'vec(OB)'], 'h': 'Quy tắc hình bình hành'}, {'id': 'f3', 'tp': '→AB = →OB − ___', 'ans': '→OA', 'alt': ['OA', 'vec(OA)', '→OA'], 'h': ''}];
  const tabs=[["w","🚀",t("Khởi động","Warm-Up")],
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. Tổng Hai Vectơ","1. Vector Sum")],["k2","📖",t("2. Hình Bình Hành","2. Parallelogram Rule")],["k3","📖",t("3. Hiệu Hai Vectơ","3. Vector Difference")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮",t("Mini Game","Mini Game")]];

  
  useEffect(() => {
    if (md && user) {
      saveGameResult({
        lesson_slug: "Lesson14_TongHieuVecto",
        mode: "mc",
        score: msc,
        total: mcQ.length
      });
    }
  }, [md, msc, user]);

  useEffect(() => {
    if (td && user) {
      saveGameResult({
        lesson_slug: "Lesson14_TongHieuVecto",
        mode: "tf",
        score: ts,
        total: tfC.length
      });
    }
  }, [td, ts, user]);

  useEffect(() => {
    if (fc && user) {
      const correctCount = fQ.filter(q => {
        const r = (fa[q.id] || "").toLowerCase().trim().replace(/\s/g, "");
        return [q.ans, ...(q.alt || [])].map(a => a.toLowerCase().replace(/\s/g, "")).includes(r);
      }).length;
      saveGameResult({
        lesson_slug: "Lesson14_TongHieuVecto",
        mode: "fill",
        score: correctCount,
        total: fQ.length
      });
    }
  }, [fc, fa, user]);

  return (
    <div style={{width:"100%",background:"#fff",display:"flex",justifyContent:"center"}}>
    <div style={{width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80}}>
      <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/Cacbaitoan10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
      <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
        <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương V · Vectơ</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Bài 14: Tổng và Hiệu Hai Vectơ</div></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 Tiếng Việt</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 English</button></div>
      </header>
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
        {[
          t("Định nghĩa tổng hai vectơ bằng quy tắc ba điểm.","Define vector sum using the three-point rule."),
          t("Áp dụng quy tắc hình bình hành cho tổng vectơ.","Apply the parallelogram rule for vector addition."),
          t("Nắm vững các tính chất: giao hoán, kết hợp, phần tử đối.","Master properties: commutative, associative, inverse."),
          t("Tính hiệu hai vectơ →a − →b = →a + (−→b).","Compute vector difference →a − →b = →a + (−→b)."),
          t("Áp dụng: →AB = →OB − →OA.","Apply: →AB = →OB − →OA."),
        ].map((item, idx) => (
          <div key={idx} style={{fontSize:15,color:"#555",marginBottom:6}}>{item}</div>
        ))}
      </div>
      <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

      <section id="w" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="🚀" title={t("Khởi động","Warm-Up")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
          <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Nếu bạn đi bộ 3km về hướng đông rồi 4km về hướng bắc, bạn đã di chuyển tổng cộng bao nhiêu km (theo đường thẳng)? Đây là bài toán cộng vectơ trong thực tế!","If you walk 3km east then 4km north, how far have you actually moved (straight line)? This is vector addition in real life!")}</div>
          <div style={{fontSize:16}}>❓ <em>{t("Câu trả lời: 5km (tam giác vuông 3-4-5). Hướng là gì?","Answer: 5km (3-4-5 right triangle). What direction?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="YmXbE0EUTG4"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ 3Blue1Brown (CC BY)", "Video by 3Blue1Brown (CC BY)")}
          />
        </div>
      </section>
      <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("1. Tổng Hai Vectơ","1. Sum of Two Vectors")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
          <div style={{fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10}}>📌 {t("Quy tắc ba điểm","Three-point rule")}</div>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Cho hai vectơ →a và →b. Đặt điểm đầu của →b tại điểm cuối của →a:","Given →a and →b. Place the start of →b at the end of →a:")}</div>
          <div style={{background:"white",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:16,textAlign:"center",lineHeight:2.4}}>
            →AB + →BC = →AC<br/>
            →a + →b = →a + →b (quy tắc nối đầu đuôi)
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,transition:"all 0.3s"}}>
          {[{title:t("Tính chất giao hoán","Commutative"),formula:"→a + →b = →b + →a",bg:"#eaf4fb",c:"#1a5276"},
            {title:t("Tính chất kết hợp","Associative"),formula:"(→a + →b) + →c = →a + (→b + →c)",bg:"#eafaf1",c:"#1e8449"},
            {title:t("Phần tử trung lập","Identity element"),formula:"→a + →0 = →0 + →a = →a",bg:"#fff3cd",c:"#856404"},
            {title:t("Phần tử đối","Inverse element"),formula:"→a + (−→a) = →0",bg:"#fdf2f2",c:"#922b21"},
          ].map((card,i)=><article key={i} style={{padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center"}}><div style={{fontSize:14,fontWeight:700,color:card.c,marginBottom:8}}>{card.title}</div><div style={{fontFamily:"monospace",fontSize:14,background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8}}>{card.formula}</div></article>)}
        </div>
      </section>
      <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("2. Quy Tắc Hình Bình Hành","2. Parallelogram Rule")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Nếu →a = →OA và →b = →OB (cùng điểm đầu O), thì →a + →b = →OC, trong đó C là đỉnh còn lại của hình bình hành OACB.","If →a = →OA and →b = →OB (same start O), then →a + →b = →OC, where C is the remaining vertex of parallelogram OACB.")}</div>
          <div style={{background:"white",fontFamily:"monospace",fontSize:15,padding:"10px 14px",borderRadius:8,color:"#0B4F5C",fontWeight:600}}>→OA + →OB = →OC (C là đỉnh đối của O trong hình bình hành OACB)</div>
        </div>
      </section>
      <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="📖" title={t("3. Hiệu Hai Vectơ","3. Difference of Two Vectors")} />
        <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
          <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Hiệu của →a và →b được định nghĩa:","Difference of →a and →b is defined as:")}</div>
          <div style={{background:"white",borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:16,textAlign:"center",lineHeight:2.4}}>
            →a − →b = →a + (−→b)<br/>
            →AB − →AC = →CB (quy tắc trừ)
          </div>
          <div style={{marginTop:12,padding:"10px 14px",background:"#fff3cd",borderRadius:8,fontSize:14}}>
            💡 {t("Nhớ: →AB = →OB − →OA (hiệu vectơ vị trí)","Remember: →AB = →OB − →OA (position vector difference)")}
          </div>
        </div>
      </section>
      <section id="th" style={{scrollMarginTop:80,marginBottom:64}}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
          {[{id:"e1",q:t("Cho tam giác ABC. Chứng minh: →AB + →BC + →CA = →0","Given triangle ABC. Prove: →AB + →BC + →CA = →0"),
             a:[t("→AB + →BC = →AC (quy tắc ba điểm)","→AB + →BC = →AC (three-point rule)"),t("→AC + →CA = →AA = →0","→AC + →CA = →AA = →0"),t("Vậy →AB + →BC + →CA = →0 ✓","Therefore →AB + →BC + →CA = →0 ✓")]},
            {id:"e2",q:t("Cho hình bình hành ABCD. Tính →AB + →AD.","Parallelogram ABCD. Compute →AB + →AD."),
             a:[t("Theo quy tắc hình bình hành (chung điểm đầu A):","Parallelogram rule (common start A):"),t("→AB + →AD = →AC (đường chéo AC)","→AB + →AD = →AC (diagonal AC)")]},
            {id:"e3",q:t("Cho →OA, →OB là vectơ vị trí. Tính →AB.","Given position vectors →OA, →OB. Find →AB."),
             a:[t("→AB = →AO + →OB = −→OA + →OB","→AB = −→OA + →OB"),t("→AB = →OB − →OA","→AB = →OB − →OA")]},
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
      <div className="reveal" data-reveal style={{textAlign:"center",color:"#777",fontSize:15,marginBottom:60}}>Toán 10 · Chân Trời Sáng Tạo · Bài 14 / Chương V</div>
      <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
    <DuoTranslate/> 
    </div></div>
  );
}
