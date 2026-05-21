
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);
export default function Lesson25_QuyTacCongNhan() {
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
      start: 0, end: 6,
      words: [
        { text: "We", vi: "Chúng ta" },
        { text: "apply", vi: "áp dụng" },
        { text: "addition", vi: "phép cộng" },
        { text: "and", vi: "và" },
        { text: "multiplication", vi: "phép nhân" },
        { text: "principles", vi: "các quy tắc,", detail: "<b>Multiplication principle (Quy tắc nhân)</b>: Quy tắc tính số cách thực hiện một công việc gồm nhiều công đoạn liên tiếp.<br/><b>Addition principle (Quy tắc cộng)</b>: Quy tắc tính số cách thực hiện một công việc gồm nhiều phương án độc lập.", detailTitle: "Counting principles" },
        { text: "to", vi: "để" },
        { text: "find", vi: "tìm" },
        { text: "outcomes.", vi: "kết quả.", detail: "<b>Outcomes (Kết quả)</b>: Các trường hợp có thể xảy ra của một phép toán đếm.", detailTitle: "Outcomes (Kết quả)" }
      ]
    },
    {
      start: 6, end: 12,
      words: [
        { text: "Understand", vi: "Hiểu" },
        { text: "permutation,", vi: "hoán vị,", detail: "<b>Permutation (Hoán vị - P_n)</b>:<br/>Sắp xếp thứ tự của n phần tử khác nhau, số cách là n!.", detailTitle: "Permutation (Hoán vị)" },
        { text: "combination,", vi: "tổ hợp,", detail: "<b>Combination (Tổ hợp - C_n^k)</b>:<br/>Chọn k phần tử từ n phần tử không quan tâm đến thứ tự.", detailTitle: "Combination (Tổ hợp)" },
        { text: "and", vi: "và" },
        { text: "factorial.", vi: "giai thừa.", detail: "<b>Factorial (Giai thừa - n!)</b>:<br/>Tích các số tự nhiên từ 1 đến n: n! = 1.2.3...n.", detailTitle: "Factorial (Giai thừa)" }
      ]
    },
    {
      start: 12, end: 18,
      words: [
        { text: "Expand", vi: "Khai triển" },
        { text: "the", vi: "nhị thức" },
        { text: "binomial", vi: "nhị thức" },
        { text: "theorem", vi: "định lí,", detail: "<b>Binomial theorem (Nhị thức Newton)</b>:<br/>Công thức khai triển biểu thức (a + b)^n.", detailTitle: "Binomial theorem" },
        { text: "with", vi: "dùng" },
        { text: "Pascal's", vi: "Pascal" },
        { text: "triangle.", vi: "tam giác.", detail: "<b>Pascal's triangle (Tam giác Pascal)</b>:<br/>Tam giác số dùng để xác định nhanh các hệ số trong khai triển nhị thức Newton.", detailTitle: "Pascal's triangle" }
      ]
    }
  ];


  const sc=(id)=>{const el=document.getElementById(id);if(el)el.scrollIntoView({behavior:"smooth",block:"start"});};
  const tr=(id)=>setRev(p=>(({...p,[id]:!p[id]})));
  const mcQ=[{'q': 'Quy tắc nhân dùng khi?', 'o': ['Các việc xung khắc nhau', 'Các bước diễn ra liên tiếp (và...và...)', 'Chỉ có 2 lựa chọn', 'Tổng số phần tử'], 'a': 1, 'ex': 'Quy tắc nhân: các bước PHẢI xảy ra đồng thời → nhân.'}, {'q': 'Từ A→B có 3 đường, B→C có 4 đường. Số đường A→B→C?', 'o': ['7', '12', '3', '4'], 'a': 1, 'ex': '3×4=12 (quy tắc nhân vì phải đi qua cả hai chặng).'}, {'q': 'Chọn 1 sách trong 4 sách toán hoặc 3 sách lý. Bao nhiêu cách?', 'o': ['12', '7', '1', '24'], 'a': 1, 'ex': '4+3=7 (quy tắc cộng vì chỉ chọn 1 trong các loại).'}, {'q': 'Mật khẩu 3 chữ số (0-9, lặp được). Bao nhiêu mật khẩu?', 'o': ['30', '27', '1000', '300'], 'a': 2, 'ex': '10×10×10=1000.'}, {'q': 'Mã PIN 4 ký tự: 2 chữ cái (A-Z) và 2 chữ số (0-9). Bao nhiêu mã?', 'o': ['28×28', '26²×10²', '26×10', '52×100'], 'a': 1, 'ex': '26²×10²=676×100=67600.'}];
  const tfC=[{'s': 'Quy tắc nhân dùng khi các lựa chọn loại trừ nhau.', 'a': false, 'ex': 'SAI — đó là Quy Tắc CỘNG. Quy tắc nhân dùng khi các bước xảy ra đồng thời.'}, {'s': '3 áo × 4 quần = 12 cách phối trang phục.', 'a': true, 'ex': 'ĐÚNG — quy tắc nhân: phải chọn CẢ áo VÀ quần.'}, {'s': "Quy tắc cộng: 'chọn 1 trong các lựa chọn xung khắc'.", 'a': true, 'ex': 'ĐÚNG — các cách loại trừ nhau → dùng cộng.'}, {'s': '10 chữ số và 26 chữ cái → mã 1 ký tự có 10+26=36 cách.', 'a': true, 'ex': 'ĐÚNG — chọn 1 ký tự: chữ số HOẶC chữ cái → cộng.'}, {'s': 'Số tự nhiên 2 chữ số (không lặp) từ {1,2,3}: 3×3=9.', 'a': false, 'ex': 'SAI — hàng chục 3 cách, hàng đơn vị 2 cách (không lặp) → 3×2=6.'}];
  const fQ=[{'id': 'f1', 'tp': 'Quy tắc nhân: N = n₁ × n₂ × ... (các bước xảy ra ___)', 'ans': 'đồng thời', 'alt': ['dong thoi', 'simultaneously', 'cùng nhau'], 'h': ''}, {'id': 'f2', 'tp': '5 áo × 3 quần = ___ bộ trang phục', 'ans': '15', 'alt': ['15'], 'h': ''}, {'id': 'f3', 'tp': 'Mật khẩu 3 chữ số (0-9, lặp): ___ mật khẩu', 'ans': '1000', 'alt': ['1000'], 'h': '10×10×10'}];
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
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. Quy Tắc Nhân","1. Multiplication")],["k2","📖",t("2. Quy Tắc Cộng","2. Addition")],["k3","📖",t("3. So Sánh","3. Compare")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮",t("Mini Game","Mini Game")]];
  return(<div style={{width:"100%",background:"#fff",display:"flex",justifyContent:"center"}}><div style={{width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80}}>
    <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/Cacbaitoan10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
    <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
      <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương VIII · Tổ Hợp</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Bài 25: Quy Tắc Cộng và Nhân</div></div>
      <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 VI</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 EN</button></div>
    </header>
    <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
      <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
              <div key={"0"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Phát biểu và áp dụng Quy Tắc Nhân. / State and apply the Multiplication Rule.</div>
        <div key={"1"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Phát biểu và áp dụng Quy Tắc Cộng. / State and apply the Addition Rule.</div>
        <div key={"2"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Phân biệt khi nào dùng cộng, khi nào dùng nhân. / Distinguish when to add vs. multiply.</div>
        <div key={"3"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Giải bài toán đếm thực tế. / Solve practical counting problems.</div>
        <div key={"4"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Kết hợp cả hai quy tắc. / Combine both rules.</div>
    </div>
    <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Bạn muốn chọn một trang phục: 3 áo, 4 quần. Có bao nhiêu cách phối? (3×4=12). Và nếu chỉ chọn một trong hai: áo hoặc quần, thì 3+4=7. Đây chính là Quy Tắc Nhân và Quy Tắc Cộng!","You want to choose an outfit: 3 shirts, 4 pants. How many combos? (3×4=12). And if choosing just one item (shirt OR pants): 3+4=7. These are the Multiplication and Addition Rules!")}</div>
        <div style={{fontSize:16}}>❓ <em>{t("Từ Hà Nội đi Đà Nẵng có 3 cách. Từ Đà Nẵng đi TP.HCM có 4 cách. Có bao nhiêu cách đi từ HN → ĐN → HCM?","From Hanoi to Da Nang: 3 ways. Da Nang to HCM: 4 ways. How many routes HN→ĐN→HCM?")}</em></div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="3_otNr9kRuY"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ Leios Labs (Manim Engine)", "Video by Leios Labs (Manim Engine)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Quy Tắc Nhân","1. Multiplication Rule")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10}}>📌 {t("Nội dung","Rule")}</div>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Một công việc gồm k bước liên tiếp. Bước 1 có n₁ cách, bước 2 có n₂ cách,..., bước k có nₖ cách. Số cách thực hiện công việc là:","A task has k consecutive steps. Step 1 has n₁ ways,..., step k has nₖ ways. Total ways:")}</div>
        <div style={{background:"white",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:22,textAlign:"center",color:"#0B4F5C",fontWeight:700}}>N = n₁ × n₂ × ... × nₖ</div>
        <div style={{marginTop:12,padding:"10px 14px",background:"#eafaf1",borderRadius:8,fontSize:14}}>✅ {t("Dùng khi các bước PHẢI xảy ra đồng thời (và... và...).","Use when all steps MUST occur (and... and...).")}</div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Quy Tắc Cộng","2. Addition Rule")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:20}}>
        <div style={{fontWeight:"bold",fontSize:17,color:"#0B4F5C",marginBottom:10}}>📌 {t("Nội dung","Rule")}</div>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Một công việc có thể hoàn thành bằng k cách khác nhau (xung khắc). Cách 1 có n₁ phương án, cách 2 có n₂ phương án,...Số phương án là:","A task can be completed in k mutually exclusive ways. Way 1 has n₁ options,...Total options:")}</div>
        <div style={{background:"white",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:22,textAlign:"center",color:"#0B4F5C",fontWeight:700}}>N = n₁ + n₂ + ... + nₖ</div>
        <div style={{marginTop:12,padding:"10px 14px",background:"#fdf2f2",borderRadius:8,fontSize:14}}>✅ {t("Dùng khi các cách LOẠI TRỪ nhau (hoặc... hoặc...).","Use when ways are MUTUALLY EXCLUSIVE (or... or...).")}</div>
      </div>
    </section>
    <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("3. Ví Dụ So Sánh","3. Comparison Examples")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16,transition:"all 0.3s"}}>
        {[{icon:"✖️",rule:t("Quy Tắc NHÂN","MULTIPLY Rule"),ex:t("Mật khẩu 4 chữ số (mỗi chữ số 0-9): 10×10×10×10=10⁴=10000","4-digit PIN (each 0-9): 10×10×10×10=10,000"),ex2:t("Trang phục: 3 áo × 4 quần = 12 bộ","Outfit: 3 shirts × 4 pants = 12 combos"),c:"#1e8449",bg:"#eafaf1"},
          {icon:"➕",rule:t("Quy Tắc CỘNG","ADD Rule"),ex:t("Đi từ A→B: 3 đường bộ hoặc 2 đường thủy = 3+2=5 lựa chọn","A→B: 3 roads or 2 water routes = 3+2=5 choices"),ex2:t("Chọn 1 sách trong 5 sách toán hoặc 3 sách văn = 5+3=8","Choose 1 book: 5 math OR 3 literature = 8"),c:"#1a5276",bg:"#eaf4fb"},
        ].map((card,i)=>(<article key={i} style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}><div style={{fontSize:24,marginBottom:6}}>{card.icon}</div><div style={{fontSize:16,fontWeight:700,color:card.c,marginBottom:10}}>{card.rule}</div><div style={{background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8,fontSize:13,marginBottom:6}}>{card.ex}</div><div style={{background:card.bg,color:card.c,padding:"8px 12px",borderRadius:8,fontSize:13}}>{card.ex2}</div></article>))}
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:t("Biển số xe gồm 2 chữ cái (26 chữ cái) và 4 chữ số (0-9). Biết chữ cái và chữ số có thể lặp lại. Có bao nhiêu biển số?","License plates: 2 letters (26) then 4 digits (0-9), repetition allowed. How many plates?"),a:["26×26×10×10×10×10 = 26²×10⁴ = 676×10000 = 6,760,000"]},
          {id:"e2",q:t("Từ các chữ số {1,2,3,4,5}, lập số tự nhiên có 3 chữ số khác nhau. Có bao nhiêu số?","From {1,2,3,4,5}, form 3-digit numbers with distinct digits. How many?"),a:[t("Hàng trăm: 5 cách, Hàng chục: 4 cách (còn lại), Hàng đơn vị: 3 cách","Hundreds: 5, Tens: 4, Units: 3"),"5×4×3 = 60"]},
          {id:"e3",q:t("Một lớp có 15 nam và 12 nữ. Cần chọn 1 lớp trưởng hoặc 1 lớp phó (không cùng người). Có bao nhiêu cách chọn?","Class: 15 boys, 12 girls. Choose 1 president OR 1 vice-president (different people). How many ways?"),a:[t("Quy tắc cộng: 1 lớp trưởng (27 người) + 1 lớp phó (26 người còn lại... nhưng nếu 'chọn một trong hai' thì: 27+27=54? Đề hỏi chọn 1 người bất kỳ làm 1 trong 2 chức: 27 cách cho mỗi chức, nhưng là HOẶC nên 27+27=54.","Addition rule: president (27) + VP (27) = 54"),"27 + 27 = 54"]},
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
    <div className="reveal" data-reveal style={{textAlign:"center",color:"#777",fontSize:15,marginBottom:60}}>Toán 10 · Chân Trời Sáng Tạo · Bài 25 / Chương VIII</div>
    <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
  <DuoTranslate/> 
  </div></div>);
}
