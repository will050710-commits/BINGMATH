
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);
export default function Lesson31_DuongTron() {
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
    "start": 0,
    "end": 12,
    "words": [
      {
        "text": "This lesson introduces",
        "vi": "Bài học này giới thiệu"
      },
      {
        "text": "circle equations",
        "vi": "phương trình đường tròn",
        "detail": "<b>circle equations</b>: phương trình đường tròn.",
        "detailTitle": "circle equations (phương trình đường tròn)"
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
        "text": "center",
        "vi": "tâm",
        "detail": "<b>center</b>: tâm.",
        "detailTitle": "center (tâm)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "radius",
        "vi": "bán kính",
        "detail": "<b>radius</b>: bán kính.",
        "detailTitle": "radius (bán kính)"
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
        "text": "tangent",
        "vi": "tiếp tuyến",
        "detail": "<b>tangent</b>: tiếp tuyến.",
        "detailTitle": "tangent (tiếp tuyến)"
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
        "text": "center",
        "vi": "tâm",
        "detail": "<b>center</b>: tâm.",
        "detailTitle": "center (tâm)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "radius",
        "vi": "bán kính",
        "detail": "<b>radius</b>: bán kính.",
        "detailTitle": "radius (bán kính)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "tangent",
        "vi": "tiếp tuyến",
        "detail": "<b>tangent</b>: tiếp tuyến.",
        "detailTitle": "tangent (tiếp tuyến)"
      },
      {
        "text": "step by step.",
        "vi": "theo từng bước."
      }
    ]
  }
];


  const sc=(id)=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});};
  const tr=(id)=>setRev(p=>(({...p,[id]:!p[id]})));
  const mcQ=[{'q': 'PT đường tròn tâm I(0,0) bán kính 5?', 'o': ['x+y=5', 'x²+y²=25', 'x²+y²=5', '(x+y)²=25'], 'a': 1, 'ex': '(x−0)²+(y−0)²=25 → x²+y²=25.'}, {'q': '(x−2)²+(y+3)²=16. Tâm và R?', 'o': ['I(2,3),R=4', 'I(2,−3),R=4', 'I(−2,3),R=16', 'I(2,−3),R=16'], 'a': 1, 'ex': 'Tâm I(2,−3), R=√16=4.'}, {'q': 'Điểm M(0,3) có nằm trên đường tròn x²+y²=9?', 'o': ['Trong', 'Trên', 'Ngoài', 'Không xác định'], 'a': 1, 'ex': '0²+3²=9=R² → M nằm trên đường tròn.'}, {'q': 'd(I,ℓ)<R thì đường thẳng ℓ và đường tròn tâm I?', 'o': ['Không giao', 'Tiếp xúc', 'Cắt tại 2 điểm', 'Cắt tại 1 điểm'], 'a': 2, 'ex': 'd<R → đường thẳng cắt đường tròn tại 2 điểm.'}, {'q': 'x²+y²−4x−6y+9=0. Dạng chính tắc?', 'o': ['(x−2)²+(y−3)²=4', '(x+2)²+(y+3)²=4', '(x−2)²+(y−3)²=9', '(x−4)²+(y−6)²=9'], 'a': 0, 'ex': '(x²−4x+4)+(y²−6y+9)=9+4=4 → (x−2)²+(y−3)²=4.'}];
  const tfC=[{'s': 'PT đường tròn tâm I(a,b) bán kính R: (x−a)²+(y−b)²=R².', 'a': true, 'ex': 'ĐÚNG — đây là dạng chính tắc.'}, {'s': 'x²+y²+2x−4y+5=0 là PT đường tròn.', 'a': false, 'ex': 'SAI — (x+1)²+(y−2)²=0, chỉ là điểm (−1,2), không phải đường tròn (R=0).'}, {'s': 'Đường tròn tâm I, bán kính R tiếp xúc đường thẳng ℓ khi d(I,ℓ)=R.', 'a': true, 'ex': 'ĐÚNG — tiếp tuyến ⟺ khoảng cách từ tâm bằng bán kính.'}, {'s': 'x²+y²=R² là đường tròn tâm gốc O.', 'a': true, 'ex': 'ĐÚNG — (x−0)²+(y−0)²=R².'}, {'s': 'Hai đường tròn không giao nhau khi d(I₁,I₂)=R₁+R₂.', 'a': false, 'ex': 'SAI — d=R₁+R₂ là tiếp xúc ngoài. Không giao khi d>R₁+R₂.'}];
  const fQ=[{'id': 'f1', 'tp': 'Đường tròn tâm I(3,−1) R=5: (x−3)²+(y+1)²=___', 'ans': '25', 'alt': ['25'], 'h': 'R²=25'}, {'id': 'f2', 'tp': 'x²+y²−2x+4y=0 → tâm I=(___, ___)', 'ans': '1, -2', 'alt': ['(1,-2)', '1,-2', '1 -2'], 'h': 'x²−2x+1+y²+4y+4=5 → I(1,−2)'}, {'id': 'f3', 'tp': 'd(I,ℓ)=R thì đường thẳng ℓ là ___ đường tròn', 'ans': 'tiếp tuyến', 'alt': ['tiep tuyen', 'tangent', 'tangent line'], 'h': ''}];
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
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. PT Đường Tròn","1. Circle Eq.")],["k2","📖",t("2. Vị Trí Tương Đối","2. Relative Position")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮",t("Mini Game","Mini Game")]];
  return(<div style={{width:"100%",background:"#fff",display:"flex",justifyContent:"center"}}><div style={{width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80}}>
    <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/cacbailam10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
    <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
      <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương IX · Phương Pháp Tọa Độ Trong Mặt Phẳng</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Bài 31: Đường Tròn Trong Mặt Phẳng</div></div>
      <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 VI</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 EN</button></div>
    </header>
    <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
      <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
              <div key={"0"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Viết phương trình đường tròn dạng chính tắc (x−a)²+(y−b)²=R². / Write circle equation (x−a)²+(y−b)²=R².</div>
        <div key={"1"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Xác định tâm và bán kính từ phương trình dạng mở rộng. / Find center and radius from expanded form.</div>
        <div key={"2"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Kiểm tra vị trí tương đối điểm/đường thẳng với đường tròn. / Check relative position of point/line with circle.</div>
        <div key={"3"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Viết PT đường tròn qua 3 điểm. / Write circle equation through 3 points.</div>
        <div key={"4"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Xác định vị trí tương đối hai đường tròn. / Determine relative position of two circles.</div>
    </div>
    <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8}}>{t("Sóng radio lan truyền theo hình tròn. Radar quét theo hình tròn. Bánh xe, đồng hồ, cung tròn — đường tròn xuất hiện khắp nơi. Trong tọa độ, một đường tròn được mô tả bằng một phương trình bậc hai đơn giản!","Radio waves spread in circles. Radar sweeps in circles. Wheels, clocks, arcs — circles appear everywhere. In coordinates, a circle is described by a simple second-degree equation!")}</div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="iX5UgArMyiI"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (CC BY-NC-SA)", "Video by Khan Academy (CC BY-NC-SA)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Phương Trình Đường Tròn","1. Circle Equation")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{background:"white",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:17,textAlign:"center",color:"#0B4F5C",fontWeight:700,lineHeight:2.6}}>
          (x−a)² + (y−b)² = R² &nbsp; [Dạng chính tắc]<br/>
          x²+y²−2ax−2by+(a²+b²−R²) = 0 &nbsp; [Dạng mở rộng]
        </div>
        <div style={{marginTop:10,fontSize:14,color:"#777",lineHeight:1.8}}>
          {t("Tâm I(a,b), bán kính R. Điểm M(x,y)∈đường tròn ⟺ IM=R.","Center I(a,b), radius R. Point M(x,y) is on circle ⟺ IM=R.")}
        </div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Vị Trí Tương Đối","2. Relative Position")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,transition:"all 0.3s"}}>
        {[{title:t("Điểm M và đường tròn","Point and circle"),items:[t("d(I,M)<R: M nằm trong","d(I,M)<R: inside"),t("d(I,M)=R: M trên đường tròn","d(I,M)=R: on circle"),t("d(I,M)>R: M nằm ngoài","d(I,M)>R: outside")],c:"#1a5276",bg:"#eaf4fb"},
          {title:t("Đường thẳng và đường tròn","Line and circle"),items:[t("d(I,d)<R: cắt (2 điểm)","d(I,d)<R: intersects (2 pts)"),t("d(I,d)=R: tiếp tuyến","d(I,d)=R: tangent"),t("d(I,d)>R: không giao","d(I,d)>R: no intersection")],c:"#1e8449",bg:"#eafaf1"},
          {title:t("Hai đường tròn","Two circles"),items:[t("d<|R₁−R₂|: trong nhau","d<|R₁−R₂|: one inside"),t("|R₁−R₂|≤d≤R₁+R₂: cắt nhau","intersect"),t("d>R₁+R₂: ngoài nhau","d>R₁+R₂: external")],c:"#922b21",bg:"#fdf2f2"},
        ].map((card,i)=>(<article key={i} style={{padding:16,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:14,fontWeight:700,color:card.c,marginBottom:8}}>{card.title}</div>{card.items.map((item,j)=><div key={j} style={{background:card.bg,color:card.c,padding:"5px 10px",borderRadius:6,fontSize:12,marginBottom:4}}>{item}</div>)}</article>))}
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:t("Viết PT đường tròn tâm I(2,−1), bán kính R=3.","Write circle equation: center I(2,−1), radius R=3."),a:["(x−2)²+(y+1)²=9","Mở rộng: x²+y²−4x+2y+4+1−9=0","x²+y²−4x+2y−4=0"]},
          {id:"e2",q:t("Tìm tâm và bán kính: x²+y²−6x+4y−3=0","Find center and radius: x²+y²−6x+4y−3=0"),a:["(x²−6x+9)+(y²+4y+4)=3+9+4=16","(x−3)²+(y+2)²=16",t("Tâm I(3,−2), R=4","Center I(3,−2), R=4")]},
          {id:"e3",q:t("Kiểm tra điểm M(5,1) có thuộc đường tròn (x−2)²+(y−1)²=9 không.","Check if M(5,1) is on circle (x−2)²+(y−1)²=9."),a:["(5−2)²+(1−1)²=9+0=9=R²",t("M thuộc đường tròn ✓","M is on the circle ✓")]},
        ].map(({id,q,a})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:18,fontWeight:600,marginBottom:4}}>📝 {t("Bài tập","Exercise")}</div><div style={{fontSize:15,lineHeight:1.7}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color:"#555",marginBottom:6}}>{l}</div>)}</div>}</article>))}
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
    <div className="reveal" data-reveal style={{textAlign:"center",color:"#777",fontSize:15,marginBottom:60}}>Toán 10 · Chân Trời Sáng Tạo · Bài 33 / Chương IX</div>
    <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
  <DuoTranslate/> 
  </div></div>);
}
