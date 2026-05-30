
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
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

export default function Lesson12_GiaiTamGiac() {
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
        "text": "solving triangles",
        "vi": "giải tam giác",
        "detail": "<b>solving triangles</b>: giải tam giác.",
        "detailTitle": "solving triangles (giải tam giác)"
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
        "text": "triangle data",
        "vi": "dữ kiện tam giác",
        "detail": "<b>triangle data</b>: dữ kiện tam giác.",
        "detailTitle": "triangle data (dữ kiện tam giác)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "trigonometry",
        "vi": "lượng giác",
        "detail": "<b>trigonometry</b>: lượng giác.",
        "detailTitle": "trigonometry (lượng giác)"
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
        "text": "application",
        "vi": "ứng dụng",
        "detail": "<b>application</b>: ứng dụng.",
        "detailTitle": "application (ứng dụng)"
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
        "text": "triangle data",
        "vi": "dữ kiện tam giác",
        "detail": "<b>triangle data</b>: dữ kiện tam giác.",
        "detailTitle": "triangle data (dữ kiện tam giác)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "trigonometry",
        "vi": "lượng giác",
        "detail": "<b>trigonometry</b>: lượng giác.",
        "detailTitle": "trigonometry (lượng giác)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "application",
        "vi": "ứng dụng",
        "detail": "<b>application</b>: ứng dụng.",
        "detailTitle": "application (ứng dụng)"
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

  const mcQ=[
    {q:t("'Giải tam giác' nghĩa là gì?","What does 'solving a triangle' mean?"),o:[t("Tính diện tích","Find the area"),t("Tìm tất cả cạnh và góc chưa biết","Find all unknown sides and angles"),t("Tính chu vi","Find the perimeter"),t("Chứng minh tam giác đồng dạng","Prove similarity")],a:1,ex:t("Giải tam giác = tìm tất cả 3 góc và 3 cạnh từ dữ kiện đã cho.","Solving = finding all 3 angles and 3 sides from the given data.")},
    {q:t("Công thức diện tích tam giác theo 2 cạnh và góc xen giữa là?","Area of triangle from 2 sides and included angle?"),o:["S = a·b","S = (1/2)·a·b·sinC","S = (1/2)·base·height","S = a²·sinC"],a:1,ex:t("S=(1/2)·a·b·sinC — diện tích qua 2 cạnh a, b và góc C xen giữa.","S=(1/2)·a·b·sinC using sides a, b and included angle C.")},
    {q:t("Biết 3 cạnh a=3, b=4, c=5. Diện tích tam giác là?","Sides 3,4,5. Area of triangle?"),o:["6","7","8","12"],a:0,ex:t("Tam giác vuông (3-4-5). S=(1/2)·3·4=6.","Right triangle (3-4-5). S=(1/2)·3·4=6.")},
    {q:t("Tam giác ABC: A=30°, b=6, c=4. Diện tích S = ?","Triangle: A=30°, b=6, c=4. Find area S."),o:["6","12","3","24"],a:0,ex:t("S=(1/2)·b·c·sinA=(1/2)·6·4·sin30°=12·(1/2)=6.","S=(1/2)·6·4·sin30°=12·0.5=6.")},
    {q:t("Muốn tính chiều cao ngọn núi từ xa, người ta dùng?","To find a mountain's height from a distance, you use?"),o:[t("Chỉ thước đo","Only a ruler"),t("Chỉ Định lí Pythagore","Only Pythagoras"),t("Định lí Sin hoặc Côsin + đo góc","Law of Sines or Cosines + angle measurement"),t("Không thể tính được","Cannot be calculated")],a:2,ex:t("Đo các góc từ hai điểm đã biết khoảng cách → dùng định lí Sin/Côsin → tính chiều cao.","Measure angles from 2 known points → use Sin/Cosine law → find height.")},
  ];
  const tfC=[
    {s:t("S=(1/2)·a·b·sinC là công thức diện tích tam giác qua 2 cạnh và góc xen giữa.","S=(1/2)·a·b·sinC is the triangle area formula using 2 sides and the included angle."),a:true,ex:t("ĐÚNG — đây là công thức chuẩn.","TRUE — this is the standard formula.")},
    {s:t("Tam giác vuông a=3, b=4, c=5 có diện tích S=10.","Right triangle 3-4-5 has area S=10."),a:false,ex:t("SAI — S=(1/2)·3·4=6, không phải 10.","FALSE — S=(1/2)·3·4=6, not 10.")},
    {s:t("Để giải tam giác cần ít nhất 3 dữ kiện độc lập (trong đó có ít nhất 1 cạnh).","To solve a triangle you need at least 3 independent pieces of data (including at least 1 side)."),a:true,ex:t("ĐÚNG — 3 góc thôi thì chưa đủ (không xác định kích thước). Cần ít nhất 1 cạnh.","TRUE — 3 angles alone don't determine size. Need at least 1 side.")},
    {s:t("Hai tam giác đồng dạng có thể giải được bằng cùng một bộ số góc và cạnh.","Two similar triangles can be solved with the same set of angles and sides."),a:false,ex:t("SAI — đồng dạng có cùng góc nhưng cạnh khác nhau (tỉ lệ).","FALSE — similar triangles share angles but have proportionally different sides.")},
    {s:t("Công thức S=(1/2)·a·b·sinC đúng với mọi góc C từ 0° đến 180°.","S=(1/2)·a·b·sinC holds for any angle C from 0° to 180°."),a:true,ex:t("ĐÚNG — sinC≥0 với 0°≤C≤180°, nên S≥0 và công thức luôn đúng.","TRUE — sinC≥0 for 0°≤C≤180°, so S≥0 and the formula always holds.")},
  ];
  const fQ=[
    {id:"f1",tp:t("Công thức diện tích qua 2 cạnh a, b và góc C xen giữa: S = (1/2) · a · b · ___","Area via 2 sides a,b and included angle C: S = (1/2) · a · b · ___"),ans:"sinC",alt:["sinc","sin C","sin(C)","sinC"],h:""},
    {id:"f2",tp:t("Tam giác vuông (C=90°): S = (1/2) · a · b · sin90° = (1/2) · a · ___","Right triangle (C=90°): S=(1/2)·a·b·sin90°=(1/2)·a·___"),ans:"b",alt:["b"],h:"sin90°=1"},
    {id:"f3",tp:t("Để giải hoàn toàn một tam giác cần biết ít nhất ___ dữ kiện (có ít nhất 1 cạnh).","To fully solve a triangle you need at least ___ pieces of data (at least 1 side)."),ans:"3",alt:["3","ba","three"],h:""},
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
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. Khái Niệm","1. Concept")],["k2","📖",t("2. Diện Tích","2. Area")],["k3","📖",t("3. Các TH Giải","3. Cases")],["k4","📖",t("4. Ứng Dụng","4. Applications")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮","Mini Game"]];

  
  useEffect(() => {
    if (md && user) {
      saveGameResult({
        lesson_slug: "Lesson12_GiaiTamGiac",
        mode: "mc",
        score: msc,
        total: mcQ.length
      });
    }
  }, [md, msc, user]);

  useEffect(() => {
    if (td && user) {
      saveGameResult({
        lesson_slug: "Lesson12_GiaiTamGiac",
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
        lesson_slug: "Lesson12_GiaiTamGiac",
        mode: "fill",
        score: correctCount,
        total: fQ.length
      });
    }
  }, [fc, fa, user]);

  return (
    <div style={{ width:"100%",background:"#fff",display:"flex",justifyContent:"center" }}>
    <div style={{ width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80 }}>

      <div className="reveal" data-reveal style={{ marginBottom:24 }}>
        <Link href="/Cacbaitoan10" style={{ textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15 }}>← {t("Quay lại","Back")}</Link>
      </div>

      <header className="reveal" data-reveal style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300 }}>
        <div>
          <div style={{ fontWeight:"bold",fontSize:22,color:"#0B4F5C" }}>{t("Chương IV · Hệ Thức Lượng Trong Tam Giác","Chapter IV · Triangle Trigonometry")}</div>
          <div style={{ fontSize:28,fontWeight:600,marginTop:4 }}>{t("Bài 12: Giải Tam Giác và Ứng Dụng","Lesson 12: Solving Triangles & Applications")}</div>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button onClick={()=>setLang("vi")} style={{ background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇻🇳 Tiếng Việt</button>
          <button onClick={()=>setLang("en")} style={{ background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>🇬🇧 English</button>
        </div>
      </header>

      <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{ marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:18,fontWeight:600,marginBottom:14 }}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
        {[t("Hiểu khái niệm 'giải tam giác'.","Understand what 'solving a triangle' means."),
          t("Tính diện tích bằng công thức S=(1/2)·a·b·sinC.","Compute area using S=(1/2)·a·b·sinC."),
          t("Biết áp dụng định lí Sin hoặc Côsin tuỳ từng trường hợp.","Know when to apply Law of Sines vs. Cosines."),
          t("Giải các bài toán thực tế: tính chiều cao, khoảng cách.","Solve real-world problems: heights, distances."),
          t("Phân tích bài toán và lập quy trình giải.","Analyze a problem and set up a solution strategy.")
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
          <div style={{ fontSize:16,lineHeight:1.8,marginBottom:16 }}>{t("Các nhà khảo sát địa hình, kiến trúc sư và hoa tiêu tàu biển đều cần giải tam giác mỗi ngày. Biết góc và khoảng cách từ các điểm quan sát, họ tính ra chiều cao núi, chiều dài cầu hay vị trí tàu. Tất cả đều quy về bài toán giải tam giác.","Surveyors, architects, and navigators solve triangles daily. From observed angles and known distances, they compute mountain heights, bridge lengths, or ship positions. All reduce to solving triangles.")}</div>
          <div style={{ fontSize:16 }}>❓ <em>{t("Cần tối thiểu bao nhiêu dữ kiện (bao gồm ít nhất 1 cạnh) để xác định duy nhất một tam giác?","What is the minimum number of pieces of data (including at least 1 side) to uniquely determine a triangle?")}</em></div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="VjmFKle7xIw"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (CC BY-NC-SA)", "Video by Khan Academy (CC BY-NC-SA)")}
          />
        </div>
      </section>

      {/* 1. KHÁI NIỆM */}
      <section id="k1" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("1. Khái Niệm Giải Tam Giác","1. Solving a Triangle — Concept")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10 }}>📌 {t("Định nghĩa","Definition")}</div>
          <div style={{ fontSize:15,lineHeight:1.8 }}>{t("Giải tam giác ABC là tìm tất cả các cạnh (a, b, c) và các góc (A, B, C) chưa biết, từ một số dữ kiện đã cho.","Solving triangle ABC means finding all unknown sides (a, b, c) and angles (A, B, C) from given data.")}</div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{icon:"📐",title:t("Dữ kiện tối thiểu","Minimum data"),note:t("3 dữ kiện, trong đó ít nhất 1 cạnh (3 góc không đủ)","3 pieces, at least 1 side (3 angles not enough)")},
            {icon:"🔑",title:t("Công cụ chính","Main tools"),note:t("Định lí Sin + Định lí Côsin + A+B+C=180°","Law of Sines + Law of Cosines + A+B+C=180°")},
            {icon:"✅",title:t("Nghiệm hợp lệ","Valid solution"),note:t("Các góc dương, tổng 3 góc=180°, cạnh dương","Positive angles, sum=180°, positive sides")},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",textAlign:"center" }}>
              <div style={{ fontSize:28,marginBottom:8 }}>{card.icon}</div>
              <div style={{ fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:6 }}>{card.title}</div>
              <div style={{ fontSize:13,color:"#777",lineHeight:1.6 }}>{card.note}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 2. DIỆN TÍCH */}
      <section id="k2" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("2. Công Thức Diện Tích","2. Area Formula")} />
        <div className="reveal" data-reveal style={{ padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20 }}>
          <div style={{ fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:12 }}>{t("Diện tích tam giác qua 2 cạnh và góc xen giữa:","Area via 2 sides and included angle:")}</div>
          <div style={{ background:"white",borderRadius:10,padding:"16px 20px",textAlign:"center",fontFamily:"monospace",fontSize:20,color:"#0B4F5C",fontWeight:700,lineHeight:2.4 }}>
            S = (1/2) · a · b · sinC<br/>
            S = (1/2) · b · c · sinA<br/>
            S = (1/2) · a · c · sinB
          </div>
        </div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{shape:t("Tam giác vuông (C=90°)","Right triangle (C=90°)"),formula:"S = (1/2)·a·b",note:t("sin90°=1","sin90°=1"),bg:"#eafaf1",c:"#1e8449"},
            {shape:t("Tam giác đều cạnh a","Equilateral, side a"),formula:"S = (√3/4)·a²",note:t("sinA=sin60°=√3/2","sinA=√3/2"),bg:"#eaf4fb",c:"#1a5276"},
            {shape:t("Công thức Heron (biết 3 cạnh)","Heron's formula (3 sides known)"),formula:"S = √(s(s-a)(s-b)(s-c))",note:t("s=(a+b+c)/2","s=(a+b+c)/2"),bg:"#f5eef8",c:"#6c3483"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:14,color:"#777",marginBottom:6 }}>{card.shape}</div>
              <div style={{ fontFamily:"monospace",fontSize:15,fontWeight:700,color:card.c,marginBottom:4 }}>{card.formula}</div>
              <div style={{ background:card.bg,color:card.c,padding:"4px 10px",borderRadius:6,fontSize:12,display:"inline-block" }}>{card.note}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 3. CÁC TRƯỜNG HỢP GIẢI */}
      <section id="k3" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("3. Các Trường Hợp Giải Tam Giác","3. Triangle Solving Cases")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,transition:"all 0.3s" }}>
          {[{case:"SAS",vi:t("Biết 2 cạnh + góc xen giữa","2 sides + included angle"),step:t("1. Dùng Đ.L.Côsin → cạnh thứ 3\n2. Dùng Đ.L.Sin → góc thứ 2\n3. Tổng 3 góc → góc thứ 3","1. Law of Cosines → 3rd side\n2. Law of Sines → 2nd angle\n3. Sum=180° → 3rd angle"),bg:"#eaf4fb",c:"#1a5276"},
            {case:"SSS",vi:t("Biết 3 cạnh","3 sides known"),step:t("1. Đ.L.Côsin → tính cosA\n2. Đ.L.Côsin → tính cosB\n3. Tổng góc → C=180°−A−B","1. Cosine law → cosA\n2. Cosine law → cosB\n3. C=180°−A−B"),bg:"#eafaf1",c:"#1e8449"},
            {case:"AAS/ASA",vi:t("Biết 2 góc + 1 cạnh","2 angles + 1 side"),step:t("1. Tổng 3 góc → góc thứ 3\n2. Đ.L.Sin → cạnh thứ 2\n3. Đ.L.Sin → cạnh thứ 3","1. Sum=180° → 3rd angle\n2. Law of Sines → 2nd side\n3. Law of Sines → 3rd side"),bg:"#fff3cd",c:"#856404"},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                <span style={{ background:card.c,color:"white",fontWeight:700,padding:"3px 12px",borderRadius:20,fontSize:14 }}>{card.case}</span>
                <span style={{ fontSize:14,color:card.c,fontWeight:600 }}>{card.vi}</span>
              </div>
              <div style={{ background:card.bg,color:card.c,padding:"10px 12px",borderRadius:8,fontSize:13,fontFamily:"monospace",whiteSpace:"pre-wrap",lineHeight:1.8 }}>{card.step}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. ỨNG DỤNG */}
      <section id="k4" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="📖" title={t("4. Ứng Dụng Thực Tế","4. Real-World Applications")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:20,transition:"all 0.3s" }}>
          {[{icon:"⛰️",title:t("Đo chiều cao núi","Mountain height"),desc:t("Đứng tại 2 điểm A, B cách nhau d đo góc ngẩng α, β → h=d·sinα·sinβ/sin(β−α)","From 2 points A,B distance d apart, measure elevation angles α,β → h=d·sinα·sinβ/sin(β−α)")},
            {icon:"🌊",title:t("Đo chiều rộng sông","River width"),desc:t("Chọn điểm C bên kia sông, đo đường cơ sở AB và góc CAB, CBA → dùng Định lí Sin tính AC hoặc BC","Choose point C across river, measure baseline AB and angles CAB, CBA → use Sines to find AC or BC")},
            {icon:"🛸",title:t("Định vị (GPS/Hàng không)","Navigation (GPS/Aviation)"),desc:t("Từ 3 trạm biết tọa độ, đo góc tới mục tiêu → giải hệ tam giác → xác định vị trí chính xác","From 3 known stations, measure angles to target → solve triangle system → find exact position")},
            {icon:"🏗️",title:t("Xây dựng & Kiến trúc","Construction & Architecture"),desc:t("Tính góc mái nhà, độ dài kèo, chiều cao cột từ các số liệu đo đạc thực địa","Compute roof angles, rafter lengths, column heights from field measurements")},
          ].map((card,i)=>(
            <article key={i} style={{ padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize:28,marginBottom:8 }}>{card.icon}</div>
              <div style={{ fontSize:15,fontWeight:700,color:"#0B4F5C",marginBottom:6 }}>{card.title}</div>
              <div style={{ fontSize:13,color:"#777",lineHeight:1.6 }}>{card.desc}</div>
            </article>
          ))}
        </div>
      </section>

      {/* THỰC HÀNH */}
      <section id="th" style={{ scrollMarginTop:80,marginBottom:64 }}>
        <SH icon="✏️" title={t("Thực Hành","Practice")} />
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:40,transition:"all 0.3s" }}>
          {[
            {id:"e1",q:t("Tam giác ABC: A=45°, b=6, c=4. Tính diện tích S và cạnh a.","Triangle ABC: A=45°, b=6, c=4. Find area S and side a."),
             a:[t("S=(1/2)·b·c·sinA=(1/2)·6·4·sin45°=12·(√2/2)=6√2≈8.49","S=6√2≈8.49"),t("a²=b²+c²−2bc·cosA=36+16−48·(√2/2)=52−24√2≈52−33.9≈18.1","a²≈18.1 → a≈4.25")]},
            {id:"e2",q:t("Từ điểm A trên bờ sông, nhìn điểm C bên kia sông theo góc 60° so với bờ. Từ điểm B cách A 100m cùng phía, góc nhìn C là 45°. Tính BC.","From point A on a riverbank, point C across is seen at 60° from the bank. From B, 100m from A, the angle to C is 45°. Find BC."),
             a:[t("Góc ACB=180°−60°−45°=75°","Angle ACB=75°"),t("BC/sinA = AB/sinACB → BC=100·sin60°/sin75°=100·(√3/2)/sin75°≈89.7m","BC=100·sin60°/sin75°≈89.7m")]},
            {id:"e3",q:t("Tam giác ABC: a=5, b=7, c=8. Tính diện tích S bằng công thức Heron.","Triangle: a=5, b=7, c=8. Find area using Heron's formula."),
             a:["s=(5+7+8)/2=10",t("S=√(10·5·3·2)=√300=10√3≈17.32","S=√300=10√3≈17.32")]},
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
        {gm==="fill"&&<div style={{ padding:24,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)" }}>{!fc?(<><div style={{ fontSize:18,fontWeight:600,marginBottom:20 }}>{t("Điền câu trả lời","Fill in the blanks")}</div>{fQ.map((q,qi)=>(<div key={q.id} style={{ marginBottom:24 }}><div style={{ fontSize:15,color:"#777",marginBottom:6 }}>{t("Câu","Q")} {qi+1}</div><div style={{ fontSize:16,lineHeight:1.7,marginBottom:10 }}>{q.tp}</div><input value={fa[q.id]||""} onChange={e=>setFa(p=>({...p,[q.id]:e.target.value}))} placeholder={t("Nhập đáp án...","Answer...")} style={{ width:"100%",padding:"12px 16px",borderRadius:8,fontSize:15,outline:"none",border:"1px solid #ddd",background:"white",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",boxSizing:"border-box" }} /></div>))}<button onClick={()=>setFc(true)} style={{ padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer" }}>{t("Kiểm tra","Check Answers")}</button></>):<RS items={fri} onReset={()=>{setFa({});setFc(false);}} scoreLabel={fs===fQ.length?t("Xuất sắc! 🎉","Perfect! 🎉"):fs>=2?t("Tốt lắm! 👍","Well done! 👍"):t("Cố gắng thêm! 💪","Keep going! 💪")} t={t} />}</div>}
      </section>

      <hr style={{ width:"5px" }}></hr>
      <div className="reveal" data-reveal style={{ textAlign:"center",color:"#777",fontSize:15,marginBottom:60 }}>Toán 10 · Chân Trời Sáng Tạo · {t("Bài 12 / Chương IV","Lesson 12 / Chapter IV")}</div>
      <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
    <DuoTranslate/>
    </div></div>
  );
}
