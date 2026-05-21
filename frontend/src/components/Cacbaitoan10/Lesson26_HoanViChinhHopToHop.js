
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";
import LessonVideoPlayer from "./LessonVideoPlayer";
const SH=({icon,title})=>(<div style={{display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#0B4F5C",marginBottom:20,paddingBottom:12,borderBottom:"2px solid #f0f0f0"}}><span>{icon}</span><span>{title}</span></div>);
const RS=({items,onReset,scoreLabel,t})=>(<div><div style={{textAlign:"center",marginBottom:24}}><div style={{fontSize:48,marginBottom:8}}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div><div style={{fontSize:26,fontWeight:700,color:"#0B4F5C"}}>{items.filter(i=>i.correct).length} / {items.length}</div><div style={{color:"#777",fontSize:16,marginTop:4}}>{scoreLabel}</div></div><div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>{items.map((item,idx)=>(<div key={idx} style={{padding:"14px 18px",borderRadius:10,background:item.correct?"#eafaf1":"#fdf2f2",border:`1px solid ${item.correct?"#a9dfbf":"#f1948a"}`}}><div style={{display:"flex",alignItems:"flex-start",gap:10}}><span style={{fontSize:18,flexShrink:0}}>{item.correct?"✅":"❌"}</span><div style={{flex:1}}><div style={{fontSize:15,fontWeight:600,color:"#333",marginBottom:4}}>{t("Câu","Q")} {idx+1}: {item.qText}</div>{!item.correct&&<div style={{fontSize:14,color:"#922b21"}}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}{item.yourText&&!item.correct&&<div style={{fontSize:14,color:"#777"}}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}</div></div></div>))}</div><div style={{textAlign:"center"}}><button onClick={onReset} style={{padding:"12px 32px",background:"black",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer"}}>🔄 {t("Chơi lại","Play Again")}</button></div></div>);
export default function Lesson26_HoanViChinhHopToHop() {
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
  const tr=(id)=>setRev(p=>(({...p,[id]:!p[id]})));
  const mcQ=[{'q': 'Pₙ = ?', 'o': ['n+1', 'n²', 'n!', '2n'], 'a': 2, 'ex': 'Pₙ = n! (giai thừa).'}, {'q': 'A₅³ = ?', 'o': ['10', '20', '60', '120'], 'a': 2, 'ex': 'A₅³=5×4×3=60.'}, {'q': 'C₆² = ?', 'o': ['12', '15', '30', '36'], 'a': 1, 'ex': 'C₆²=6!/(2!4!)=30/2=15.'}, {'q': 'Chọn 3 người từ 8 không quan tâm thứ tự: dùng công thức nào?', 'o': ['P₈', 'A₈³', 'C₈³', '8³'], 'a': 2, 'ex': 'Không thứ tự → Tổ hợp C₈³=56.'}, {'q': 'C₁₀³ = ?', 'o': ['60', '90', '120', '720'], 'a': 2, 'ex': 'C₁₀³=10×9×8/(3×2×1)=720/6=120.'}];
  const tfC=[{'s': 'Cₙᵏ = Cₙⁿ⁻ᵏ.', 'a': true, 'ex': 'ĐÚNG — tính chất đối xứng của tổ hợp.'}, {'s': 'Chỉnh hợp và tổ hợp khác nhau ở chỗ thứ tự.', 'a': true, 'ex': 'ĐÚNG — chỉnh hợp có thứ tự, tổ hợp không.'}, {'s': 'P₄ = 4! = 24.', 'a': true, 'ex': 'ĐÚNG — 4!=24.'}, {'s': 'A₅² = C₅².', 'a': false, 'ex': 'SAI — A₅²=20, C₅²=10. Khác nhau k! lần.'}, {'s': 'C₁₀⁰ = 1.', 'a': true, 'ex': 'ĐÚNG — C_n^0 = 1 (chọn 0 phần tử, 1 cách).'}];
  const fQ=[{'id': 'f1', 'tp': 'Aₙᵏ = n! / ___', 'ans': '(n-k)!', 'alt': ['(n-k)!', '(n−k)!'], 'h': ''}, {'id': 'f2', 'tp': 'C₅² = ___', 'ans': '10', 'alt': ['10'], 'h': '5!/(2!3!)'}, {'id': 'f3', 'tp': 'Cₙᵏ = Cₙ___', 'ans': 'n-k', 'alt': ['n-k', 'n−k'], 'h': 'Tính chất đối xứng'}];
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
    ["videoBaiGiang", "🎬", t("Video Bài Giảng", "Lesson Video")],["k1","📖",t("1. Hoán Vị","1. Permutations")],["k2","📖",t("2. Chỉnh Hợp","2. Arrangements")],["k3","📖",t("3. Tổ Hợp","3. Combinations")],["k4","📖",t("4. So Sánh","4. Comparison")],["th","✏️",t("Thực Hành","Practice")],["mg","🎮",t("Mini Game","Mini Game")]];
  return(<div style={{width:"100%",background:"#fff",display:"flex",justifyContent:"center"}}><div style={{width:"1200px",maxWidth:"95%",color:"black",paddingTop:60,paddingBottom:80}}>
    <div className="reveal" data-reveal style={{marginBottom:24}}><Link href="/Cacbaitoan10" style={{textDecoration:"none",color:"black",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",padding:"12px 16px",borderRadius:8,fontSize:15}}>← {t("Quay lại","Back")}</Link></div>
    <header className="reveal" data-reveal style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"20px 0",position:"relative",zIndex:300}}>
      <div><div style={{fontWeight:"bold",fontSize:22,color:"#0B4F5C"}}>Chương VIII · Tổ Hợp</div><div style={{fontSize:28,fontWeight:600,marginTop:4}}>Bài 26: Hoán Vị, Chỉnh Hợp, Tổ Hợp</div></div>
      <div style={{display:"flex",gap:10}}><button onClick={()=>setLang("vi")} style={{background:lang==="vi"?"black":"#f9f9f9",color:lang==="vi"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇻🇳 VI</button><button onClick={()=>setLang("en")} style={{background:lang==="en"?"black":"#f9f9f9",color:lang==="en"?"white":"black",border:"none",borderRadius:8,padding:"10px 18px",fontWeight:600,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>🇬🇧 EN</button></div>
    </header>
    <div className="reveal" data-reveal data-reveal-stagger data-stagger="60" style={{marginBottom:40,padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
      <div style={{fontSize:18,fontWeight:600,marginBottom:14}}>🎯 {t("Yêu cầu cần đạt","Objectives")}</div>
              <div key={"0"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Tính hoán vị n phần tử: Pₙ=n! / Compute permutation Pₙ=n!</div>
        <div key={"1"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Tính chỉnh hợp Aₙᵏ = n!/(n-k)! / Compute arrangement Aₙᵏ=n!/(n−k)!</div>
        <div key={"2"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Tính tổ hợp Cₙᵏ = n!/(k!(n-k)!) / Compute combination Cₙᵏ=n!/(k!(n−k)!)</div>
        <div key={"3"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Phân biệt khi nào dùng mỗi công thức. / Distinguish which formula to use.</div>
        <div key={"4"} style={{fontSize:15,color:"#555",marginBottom:6}}>• Áp dụng vào bài toán đếm thực tế. / Apply to practical counting problems.</div>
    </div>
    <div style={{position:"sticky",top:0,zIndex:200,background:"#fff",paddingTop:12,paddingBottom:12,marginBottom:48,boxShadow:"0 4px 16px rgba(0,0,0,0.07)"}}><div style={{display:"flex",gap:10,flexWrap:"wrap"}}>{tabs.map(([id,icon,label])=>(<button key={id} onClick={()=>sc(id)} style={{background:"#f9f9f9",color:"black",border:"none",borderRadius:8,padding:"10px 14px",fontWeight:600,fontSize:13,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",transition:"all 0.15s"}} onMouseEnter={e=>{e.currentTarget.style.background="black";e.currentTarget.style.color="white";}} onMouseLeave={e=>{e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="black";}}>{icon} {label}</button>))}</div></div>

    <section id="w" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="🚀" title={t("Khởi động","Warm-Up")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <div style={{fontSize:16,lineHeight:1.8,marginBottom:16}}>{t("Xếp 4 người vào 4 ghế: 4!=24 cách. Chọn đội trưởng và phó từ 10 người: P(10,2)=90 cách. Chọn 3 người từ 10 người (không phân biệt thứ tự): C(10,3)=120 cách. Ba khái niệm này là nền tảng của tổ hợp!","Arrange 4 people in 4 chairs: 4!=24. Choose captain and vice from 10: P(10,2)=90. Choose 3 from 10 (unordered): C(10,3)=120. These 3 concepts are the foundation of combinatorics!")}</div>
      </div>
    </section>

      {/* ════════════════════════════════════════
          VIDEO BÀI GIẢNG
      ════════════════════════════════════════ */}
      <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🎬" title={t("Video Bài Giảng", "Lesson Video")} />
        <div className="reveal" data-reveal>
          <LessonVideoPlayer
            videoId="Z78aBAMc89Y"
            subtitles={videoSubtitles}
            lang={lang}
            credit={t("Video từ 3Blue1Brown (CC BY)", "Video by 3Blue1Brown (CC BY)")}
          />
        </div>
      </section>
    <section id="k1" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("1. Hoán Vị","1. Permutations of n Elements")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Hoán vị của n phần tử là một cách sắp xếp n phần tử đó theo một thứ tự xác định.","A permutation of n elements is an arrangement of all n elements in a specific order.")}</div>
        <div style={{background:"white",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:20,textAlign:"center",color:"#0B4F5C",fontWeight:700,lineHeight:2.2}}>Pₙ = n! = n×(n−1)×...×2×1<br/><span style={{fontSize:14,fontWeight:400,color:"#777"}}>0! = 1 &nbsp;|&nbsp; 1! = 1 &nbsp;|&nbsp; 5! = 120</span></div>
      </div>
    </section>
    <section id="k2" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("2. Chỉnh Hợp","2. Arrangements (k from n)")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Chỉnh hợp chập k của n phần tử: số cách chọn và sắp xếp k phần tử từ n phần tử (có THỨ TỰ).","Arrangement of k from n: ways to select and order k from n elements (ORDER matters).")}</div>
        <div style={{background:"white",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:19,textAlign:"center",color:"#0B4F5C",fontWeight:700,lineHeight:2.4}}>
          Aₙᵏ = n! / (n−k)! = n(n−1)...(n−k+1)
        </div>
        <div style={{marginTop:10,fontSize:14,color:"#777",textAlign:"center"}}>{t("Ví dụ: A₅² = 5×4 = 20","Example: A₅² = 5×4 = 20")}</div>
      </div>
    </section>
    <section id="k3" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("3. Tổ Hợp","3. Combinations (k from n)")} />
      <div className="reveal" data-reveal style={{padding:20,borderRadius:10,background:"#f9f9f9",boxShadow:"0 4px 12px rgba(0,0,0,0.1)",marginBottom:16}}>
        <div style={{fontSize:15,lineHeight:1.8,marginBottom:12}}>{t("Tổ hợp chập k của n phần tử: số cách chọn k phần tử từ n (KHÔNG có thứ tự, không phân biệt).","Combination of k from n: ways to choose k from n (NO ORDER, unordered).")}</div>
        <div style={{background:"white",borderRadius:10,padding:"14px 18px",fontFamily:"monospace",fontSize:19,textAlign:"center",color:"#0B4F5C",fontWeight:700,lineHeight:2.4}}>
          Cₙᵏ = n! / (k!(n−k)!) = Aₙᵏ / k!
        </div>
        <div style={{marginTop:10,fontSize:14,color:"#777",textAlign:"center"}}>{t("Ví dụ: C₅² = 10, C₁₀³ = 120","Example: C₅² = 10, C₁₀³ = 120")}</div>
      </div>
      <div className="reveal" data-reveal style={{padding:16,borderRadius:10,background:"#fff3cd",border:"1px solid #ffc107",fontSize:14,marginTop:8}}>
        ⭐ {t("Tính chất: Cₙᵏ = Cₙⁿ⁻ᵏ. Tức C₁₀³ = C₁₀⁷ = 120.","Property: Cₙᵏ=Cₙⁿ⁻ᵏ. So C₁₀³=C₁₀⁷=120.")}
      </div>
    </section>
    <section id="k4" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="📖" title={t("4. So Sánh Ba Khái Niệm","4. Comparing the Three Concepts")} />
      <div className="reveal" data-reveal style={{overflowX:"auto",borderRadius:10,boxShadow:"0 4px 12px rgba(0,0,0,0.1)"}}>
        <table style={{borderCollapse:"collapse",width:"100%",fontSize:14,minWidth:500}}>
          <thead><tr style={{background:"#0B4F5C",color:"white"}}>{[t("Khái niệm","Concept"),t("Công thức","Formula"),t("Thứ tự?","Order?"),t("Lấy bao nhiêu?","Take k?"),t("Ví dụ","Example")].map((h,i)=><td key={i} style={{padding:"10px 12px",fontWeight:700,border:"1px solid rgba(255,255,255,0.2)"}}>{h}</td>)}</tr></thead>
          <tbody>
            {[[t("Hoán vị Pₙ","Permutation Pₙ"),"n!",t("CÓ","YES"),t("Tất cả n","All n"),"P₄=24"],
              [t("Chỉnh hợp Aₙᵏ","Arrangement Aₙᵏ"),"n!/(n−k)!",t("CÓ","YES"),"k","A₅²=20"],
              [t("Tổ hợp Cₙᵏ","Combination Cₙᵏ"),"n!/(k!(n−k)!)",t("KHÔNG","NO"),"k","C₅²=10"]
            ].map((row,ri)=>(<tr key={ri} style={{background:ri%2===0?"#f9f9f9":"white"}}>{row.map((cell,ci)=>(<td key={ci} style={{padding:"9px 12px",border:"1px solid #e0e0e0",fontFamily:ci===1||ci===4?"monospace":"inherit",fontSize:ci===1?13:14,fontWeight:ci===0?700:400,color:ci===0?"#0B4F5C":ci===2?ri===2?"#922b21":"#1e8449":"#333"}}>{cell}</td>))}</tr>))}
          </tbody>
        </table>
      </div>
    </section>
    <section id="th" style={{scrollMarginTop:80,marginBottom:64}}><SH icon="✏️" title={t("Thực Hành","Practice")} />
      <div className="reveal" data-reveal data-reveal-stagger data-stagger="80" style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:36,transition:"all 0.3s"}}>
        {[{id:"e1",q:t("Có bao nhiêu cách xếp 5 học sinh vào 5 ghế khác nhau?","How many ways to arrange 5 students in 5 different chairs?"),a:["P₅ = 5! = 5×4×3×2×1 = 120"]},
          {id:"e2",q:t("Chọn lớp trưởng và lớp phó từ 10 HS (thứ tự quan trọng). Bao nhiêu cách?","Choose president then vice from 10 students (order matters). How many?"),a:["A₁₀² = 10×9 = 90",t("(Chỉnh hợp vì thứ tự quan trọng: chức vụ khác nhau)","(Arrangement since president ≠ vice)")],},
          {id:"e3",q:t("Chọn 3 đại diện từ 10 HS (không phân biệt thứ tự). Bao nhiêu cách?","Choose 3 representatives from 10 students (unordered). How many?"),a:["C₁₀³ = 10!/(3!×7!) = 120",t("(Tổ hợp vì không phân biệt thứ tự)","(Combination since order doesn't matter)")]},
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
    <div className="reveal" data-reveal style={{textAlign:"center",color:"#777",fontSize:15,marginBottom:60}}>Toán 10 · Chân Trời Sáng Tạo · Bài 26 / Chương VIII</div>
    <style>{`.reveal{opacity:0;transform:translateY(28px) scale(0.97);transition:opacity 0.55s cubic-bezier(.2,.8,.2,1),transform 0.45s cubic-bezier(.2,.8,.2,1);will-change:opacity,transform;}.reveal.visible{opacity:1;transform:translateY(0) scale(1);}.reveal[data-reveal-stagger].visible{opacity:1;transform:none;}.reveal[data-reveal-stagger]>*{opacity:0;transform:translateY(24px) scale(0.97);will-change:opacity,transform;}header.reveal{transform:translateY(-18px);opacity:0;}header.reveal.visible{opacity:1;transform:translateY(0);}article{transition:transform 0.25s cubic-bezier(.2,.8,.2,1),box-shadow 0.25s ease;border-radius:10px;padding:8px;}article:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 12px 28px rgba(0,0,0,0.12);}`}</style>
  <DuoTranslate/> 
  </div></div>);
}
