
"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);
export default function Lesson22_GiaiBPTBacHai() {
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
        "text": "quadratic inequalities",
        "vi": "bất phương trình bậc hai",
        "detail": "<b>quadratic inequalities</b>: bất phương trình bậc hai.",
        "detailTitle": "quadratic inequalities (bất phương trình bậc hai)"
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
        "text": "interval",
        "vi": "khoảng nghiệm",
        "detail": "<b>interval</b>: khoảng nghiệm.",
        "detailTitle": "interval (khoảng nghiệm)"
      },
      {
        "text": "then connect it with",
        "vi": "sau đó liên hệ với"
      },
      {
        "text": "root",
        "vi": "nghiệm",
        "detail": "<b>root</b>: nghiệm.",
        "detailTitle": "root (nghiệm)"
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
        "text": "solution set",
        "vi": "tập nghiệm",
        "detail": "<b>solution set</b>: tập nghiệm.",
        "detailTitle": "solution set (tập nghiệm)"
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
        "text": "interval",
        "vi": "khoảng nghiệm",
        "detail": "<b>interval</b>: khoảng nghiệm.",
        "detailTitle": "interval (khoảng nghiệm)"
      },
      {
        "text": ",",
        "vi": ","
      },
      {
        "text": "root",
        "vi": "nghiệm",
        "detail": "<b>root</b>: nghiệm.",
        "detailTitle": "root (nghiệm)"
      },
      {
        "text": "and",
        "vi": "và"
      },
      {
        "text": "solution set",
        "vi": "tập nghiệm",
        "detail": "<b>solution set</b>: tập nghiệm.",
        "detailTitle": "solution set (tập nghiệm)"
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
  const mcQ=[{'q': 'x²−3x−4<0. Tập nghiệm?', 'o': ['(−1,4)', '(−∞,−1)∪(4,+∞)', '[−1,4]', '∅'], 'a': 0, 'ex': 'Δ=9+16=25>0; x₁=−1,x₂=4. a>0,BPT<0 → (−1,4).'}, {'q': '2x²−8>0. Tập nghiệm?', 'o': ['(−2,2)', '(−∞,−2)∪(2,+∞)', '[−2,2]', 'ℝ'], 'a': 1, 'ex': 'x²>4 → x<−2 hoặc x>2.'}, {'q': '−x²+6x−9≤0. Tập nghiệm?', 'o': ['∅', 'ℝ', '{3}', 'ℝ\\{3}'], 'a': 1, 'ex': '−(x−3)²≤0 luôn đúng vì −(x−3)²≤0 với mọi x → ℝ.'}, {'q': 'x²+4x+5>0. Tập nghiệm?', 'o': ['(−5,−1)', '∅', 'ℝ', '(−∞,−5)∪(−1,+∞)'], 'a': 2, 'ex': 'Δ=16−20=−4<0, a=1>0 → f(x)>0 mọi x → ℝ.'}, {'q': 'Giải x²≤9.', 'o': ['(−3,3)', '[−3,3]', '(−∞,−3]∪[3,+∞)', '∅'], 'a': 1, 'ex': 'x²−9≤0, x₁=−3,x₂=3, a>0,BPT≤0 → [−3,3].'}];
  const tfC=[{'s': 'Nghiệm của x²>0 là ℝ\\{0}.', 'a': true, 'ex': 'ĐÚNG — x²>0 khi x≠0. Tại x=0, x²=0 không thỏa.'}, {'s': 'Nghiệm của x²+1<0 là ∅.', 'a': true, 'ex': 'ĐÚNG — x²+1≥1>0 mọi x → không có nghiệm.'}, {'s': 'Khi giải BPT, nhân 2 vế với số âm thì không đổi chiều bất phương trình.', 'a': false, 'ex': 'SAI — nhân với số ÂM thì phải ĐỔI CHIỀU BPT.'}, {'s': 'Nghiệm của ax²+bx+c>0 (a>0, Δ=0) là x∈ℝ\\{x₀}.', 'a': true, 'ex': 'ĐÚNG — a>0,Δ=0: f(x)=a(x−x₀)²≥0, bằng 0 tại x₀, dương với x≠x₀.'}, {'s': 'Nghiệm của (x−1)²<0 là ∅.', 'a': true, 'ex': 'ĐÚNG — bình phương luôn ≥0, không thể < 0.'}];
  const fQ=[{'id': 'f1', 'tp': 'x²−5x+6≤0. Nghiệm (Solution): ___.', 'ans': '[2,3]', 'alt': ['[2,3]', '2≤x≤3'], 'h': 'x₁=2,x₂=3'}, {'id': 'f2', 'tp': 'a>0, Δ<0. BPT f(x)>0 có nghiệm (solution): ___.', 'ans': 'ℝ', 'alt': ['R', 'ℝ', 'all real'], 'h': ''}, {'id': 'f3', 'tp': 'a<0, Δ<0. BPT f(x)≤0 có nghiệm (solution): ___.', 'ans': 'ℝ', 'alt': ['R', 'ℝ', 'all real'], 'h': ''}];
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
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. Quy Trình","1. Steps")],["k2","📖",t("2. Bảng Nghiệm","2. Solution Table")],["k3","📖",t("3. Ví Dụ","3. Examples")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮",t("Mini Game","Mini Game")]];
  
  useEffect(() => {
    if (md && user) {
      saveGameResult({
        lesson_slug: "Lesson22_GiaiBPTBacHai",
        mode: "mc",
        score: msc,
        total: mcQ.length
      });
    }
  }, [md, msc, user]);

  useEffect(() => {
    if (td && user) {
      saveGameResult({
        lesson_slug: "Lesson22_GiaiBPTBacHai",
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
        lesson_slug: "Lesson22_GiaiBPTBacHai",
        mode: "fill",
        score: correctCount,
        total: fQ.length
      });
    }
  }, [fc, fa, user]);

  return(<div style={{width:"100%",background:"#fff",display:"flex",justifyContent:"center"}}><div style={{width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80}}>
    <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/Cacbaitoan10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
    <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
      <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương VII · Bất Phương Trình Bậc Hai Một Ẩn</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Bài 22: Giải Bất Phương Trình Bậc Hai</div></div>
      <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 Tiếng Việt</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 English</button></div>
    </header>
    <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
      <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
      {[
        t("Nắm vững quy trình 3 bước giải BPT bậc hai.","Master the 3-step process for solving quadratic inequalities."),
        t("Áp dụng bảng xét dấu để đọc nghiệm.","Use sign tables to read solutions."),
        t("Giải thành thạo 4 dạng: >, ≥, <, ≤.","Fluently solve all 4 forms: >, ≥, <, ≤."),
        t("Xử lý trường hợp đặc biệt Δ=0 và Δ<0.","Handle special cases Δ=0 and Δ<0."),
        t("Giải BPT bậc hai chứa tham số.","Solve quadratic inequalities with parameters."),
      ].map((item, idx) => (
        <div key={idx} style={{fontSize:15,color:"#555",marginBottom:6}}>{item}</div>
      ))}
    </div>
    <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Bài toán kinh tế: doanh thu R(x)=−x²+10x và chi phí C(x)=2x+15. Cần tìm x để có lãi: R(x)>C(x), tức −x²+10x>2x+15, tức −x²+8x−15>0. Đây là bất phương trình bậc hai!","Economic problem: revenue R(x)=−x²+10x, cost C(x)=2x+15. Find x for profit: R(x)>C(x) → −x²+8x−15>0. This is a quadratic inequality!")}</div>
        <div style={{fontSize:16}}>❓ <em>{t("Giải −x²+8x−15>0. Gợi ý: tìm nghiệm rồi dùng bảng xét dấu.","Solve −x²+8x−15>0. Hint: find roots then use sign table.")}</em></div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="xdiBjypYFRQ"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Khan Academy (YouTube)", "Video by Khan Academy (YouTube)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Quy Trình Giải BPT Bậc Hai","1. Steps to Solve Quadratic Inequality")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{fontWeight:"bold",fontSize:16,color:"#0B4F5C",marginBottom:14}}>{t("3 bước giải bất phương trình bậc hai ax²+bx+c ≥ 0 (hoặc >0, ≤0, <0):","3 steps to solve ax²+bx+c≥0 (or >0,≤0,<0):")}</div>
        <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"flex",flexDirection:"column",gap:12,transition:"all 0.3s"}}>
          {[t("① Tính Δ=b²−4ac. Nếu Δ>0 tìm x₁<x₂; Δ=0 tìm x₀; Δ<0 ghi 'vô nghiệm'","① Compute Δ=b²−4ac. If Δ>0 find x₁<x₂; Δ=0 find x₀; Δ<0 note 'no real roots'"),
            t("② Lập bảng xét dấu của f(x)=ax²+bx+c","② Build the sign table for f(x)=ax²+bx+c"),
            t("③ Đọc nghiệm từ bảng dấu theo yêu cầu bất phương trình","③ Read solution from sign table according to the inequality direction")
          ].map((step,i)=>(<div key={i} style={{display:"flex",gap:14,alignItems:"flex-start"}}><div style={{minWidth:32,height:32,borderRadius:"50%",background:"black",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,flexShrink:0}}>{i+1}</div><div style={{fontSize:15,color:"#555",lineHeight:1.7,paddingTop:4}}>{step}</div></div>))}
        </div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Bảng Tổng Hợp Nghiệm","2. Solution Summary Table")} />
      <div className="reveal" data-reveal style={{overflowX:"auto",borderRadius:10,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:13,minWidth:600}}>
          <thead><tr style={{background:"#0B4F5C",color:"white"}}>
            {[t("Điều kiện","Condition"),t("BPT: f(x)>0","f(x)>0"),t("BPT: f(x)≥0","f(x)≥0"),t("BPT: f(x)<0","f(x)<0"),t("BPT: f(x)≤0","f(x)≤0")].map((h,i)=>
              <td key={i} style={{padding:"10px 12px",textAlign:"center",fontWeight:700,border:"1px solid rgba(255,255,255,0.2)"}}>{h}</td>)}
          </tr></thead>
          <tbody>
            {[["a>0, Δ>0","(−∞,x₁)∪(x₂,+∞)","(−∞,x₁]∪[x₂,+∞)","(x₁,x₂)","[x₁,x₂]"],
              ["a>0, Δ=0","x≠x₀ (ℝ\{x₀})","ℝ","∅","{x₀}"],
              ["a>0, Δ<0","ℝ","ℝ","∅","∅"],
              ["a<0, Δ>0","(x₁,x₂)","[x₁,x₂]","(−∞,x₁)∪(x₂,+∞)","(−∞,x₁]∪[x₂,+∞)"],
              ["a<0, Δ=0","∅","{x₀}","x≠x₀ (ℝ\{x₀})","ℝ"],
              ["a<0, Δ<0","∅","∅","ℝ","ℝ"]
            ].map((row,ri)=>(
              <tr key={ri} style={{background:ri%2===0?"#f9f9f9":"white"}}>
                {row.map((cell,ci)=>(<td key={ci} style={{padding:"8px 12px",textAlign:"center",border:"1px solid #e0e0e0",fontFamily:"monospace",fontSize:12,fontWeight:ci===0?700:400,color:ci===0?"#0B4F5C":"#333"}}>{cell}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
    <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("3. Ví Dụ Minh Hoạ","3. Worked Examples")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="90" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20,transition:"all 0.3s"}}>
        {[{title:"x²−5x+6<0",steps:[t("a=1>0, Δ=25−24=1>0","a=1>0, Δ=1>0"),t("x₁=2, x₂=3","x₁=2, x₂=3"),t("a>0,Δ>0,BPT<0 → nghiệm: (2,3)","a>0,Δ>0,BPT<0 → solution: (2,3)")],c:"#1e8449",bg:"#eafaf1"},
          {title:"−x²+4x−3≥0",steps:[t("Nhân (−1): x²−4x+3≤0","Multiply by −1: x²−4x+3≤0 (flip sign)"),t("a=1>0, Δ=16−12=4>0","a=1>0, Δ=4>0"),t("x₁=1, x₂=3. BPT≤0 → nghiệm: [1,3]","x₁=1, x₂=3. → solution: [1,3]")],c:"#1a5276",bg:"#eaf4fb"},
          {title:"x²+x+1>0",steps:[t("a=1>0, Δ=1−4=−3<0","a=1>0, Δ=−3<0"),t("a>0, Δ<0 → f(x)>0 mọi x","a>0, Δ<0 → f(x)>0 for all x"),t("Nghiệm: x∈ℝ","Solution: x∈ℝ")],c:"#856404",bg:"#fff3cd"},
        ].map((ex,i)=>(<article key={i} style={{padding:18,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:ex.c,background:ex.bg,padding:"4px 12px",borderRadius:6,display:"inline-block",marginBottom:10}}>{ex.title}</div>{ex.steps.map((s,j)=><div key={j} style={{fontSize:14,color:"#555",marginBottom:6,display:"flex",gap:8}}><span style={{color:ex.c,fontWeight:700,flexShrink:0}}>→</span><span>{s}</span></div>)}</article>))}
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:"2x²−7x+3≤0",a:[t("a=2>0, Δ=49−24=25","a=2>0, Δ=25"),t("x₁=(7−5)/4=1/2, x₂=(7+5)/4=3","x₁=1/2, x₂=3"),t("a>0,Δ>0,BPT≤0 → [1/2, 3]","solution: [1/2, 3]")]},
          {id:"e2",q:"−3x²+6x−3<0",a:[t("−3(x²−2x+1)=−3(x−1)²","factor: −3(x−1)²"),t("Δ=0, x₀=1. a=−3<0","Δ=0, x₀=1, a<0"),t("a<0,Δ=0: f<0 khi x≠1 → nghiệm: x∈ℝ\{1}","solution: ℝ\{1}")]},
          {id:"e3",q:t("Tìm m để x²−2mx+m²−1>0 với mọi x.","Find m so that x²−2mx+m²−1>0 for all x."),a:[t("a=1>0. Cần Δ<0 để luôn dương.","a=1>0. Need Δ<0 for always positive."),t("Δ=4m²−4(m²−1)=4<0? → 4<0 vô lý!","Δ=4<0? → impossible! Δ=4>0 always"),t("Δ=4>0 luôn đúng → không có m nào thoả mãn.","Δ=4>0 always → no such m exists.")]},
        ].map(({id,q,a})=>(<article key={id}><div style={{padding:"16px 20px",borderRadius:"10px 10px 0 0",background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:18,fontWeight:600,marginBottom:4}}>📝 {t("Giải BPT","Solve")}</div><div style={{fontFamily:"monospace",fontSize:16,color:"#0B4F5C"}}>{q}</div></div><button onClick={()=>tr(id)} style={{display:"block",width:"100%",padding:"12px 20px",background:"black",color:"white",border:"none",fontWeight:600,fontSize:15,cursor:"pointer",textAlign:"left"}}>{rev[id]?t("Ẩn ▲","Hide ▲"):t("Xem đáp án ▼","Show ▼")}</button>{rev[id]&&<div style={{padding:"16px 20px",background:"#eafaf1",borderRadius:"0 0 10px 10px"}}>{a.map((l,i)=><div key={i} style={{fontSize:15,color:"#555",marginBottom:6}}>{l}</div>)}</div>}</article>))}
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
    <div className="reveal" data-reveal style={{textAlign:"center",color:"#777",fontSize:15,marginBottom:60}}>Toán 10 · Chân Trời Sáng Tạo · Bài 24 / Chương VII</div>
    <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
  <DuoTranslate/> 
  </div></div>);
}
