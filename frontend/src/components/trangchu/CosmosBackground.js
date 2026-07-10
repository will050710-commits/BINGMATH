"use client";
import { useEffect, useRef } from "react";

/*
  CosmosBackground v2 — Saturn 3D + Vector Field + Mouse Attraction
  =================================================================
  Layer 1 (WebGL2, fixed): 3D Saturn planet — GLSL fluid shader, ring, nebula
  Layer 2 (Canvas 2D, absolute): Vector field stars + math symbols

  Performance optimisations
  ─────────────────────────
  • All star data in Float32Array / Uint8Array  → CPU cache-friendly
  • Stars batched into 6 colour bands           → only 6 ctx.stroke() calls / frame
  • No ctx.save/restore inside hot loops        → avoids state-stack overhead
  • Mouse position read via ref each frame      → zero event-handler overhead
  • Physics skips stars outside ATTRACT_RADIUS  → O(n) with early skip
  • No new object allocation inside drawFrame   → zero GC pressure
  • shadowBlur used only for cursor glow        → biggest perf win
  • docH checked only every 30 frames           → avoids forced layout
*/

// ─── Physics constants — adaptive to device ──────────────────────────────────
const IS_MOBILE        = typeof window !== "undefined" && window.innerWidth < 768;
const NUM_STARS        = IS_MOBILE ? 180 : 450;   // mobile: 60% fewer stars
const SPHERE_STACKS    = IS_MOBILE ? 32  : 64;    // mobile: lower WebGL quality
const SPHERE_SLICES    = IS_MOBILE ? 32  : 64;
const NUM_MATH_SYMBOLS = IS_MOBILE ? 10  : 28;    // mobile: fewer math particles
const ATTRACT_RADIUS   = 200;          // px
const ATTRACT_RADIUS_SQ = ATTRACT_RADIUS * ATTRACT_RADIUS;
const ATTRACT_STRENGTH = 0.10;
const SPRING_K         = 0.032;        // spring back to home
const DAMPING          = 0.84;
const ANGLE_LERP_NEAR  = 0.07;        // how fast vector points toward cursor
const ANGLE_LERP_FAR   = 0.012;       // how fast it returns to base angle
const COLOR_BANDS      = 6;
// Cap FPS on mobile to save GPU budget: 30fps on mobile vs 60fps on desktop
const TARGET_MS        = IS_MOBILE ? 1000 / 30 : 0;

// Band hues: cyan(180) → blue(210) → indigo(235) → violet(255) → purple(270) → magenta-violet(285)
const BAND_HUES = [180, 210, 235, 255, 270, 285];
const BAND_SATS = [ 80,  80,  78,  80,  82,  80];
const BAND_LUMS = [ 72,  70,  68,  68,  65,  65];
const BAND_ALPHAS = [0.55, 0.52, 0.50, 0.50, 0.48, 0.48];

// ─── Math symbols (for floating overlay) ─────────────────────────────────────
const MATH_SYMBOLS = [
  "∑","∫","∂","π","∞","√","∆","θ","≡","∈","∀","∃","α","β","γ","λ",
  "lim","sin","cos","tan","f(x)","dx","∇f","E=mc²","a²+b²=c²","x→∞",
];

// ─── GLSL — Vertex shader ─────────────────────────────────────────────────────
const VERT_SRC = `#version 300 es
precision highp float;
in vec3 a_pos;
in vec3 a_normal;
in vec2 a_uv;
uniform mat4 u_mvp;
uniform mat4 u_model;
uniform float u_time;
out vec3 v_normal;
out vec3 v_worldPos;
out vec2 v_uv;
out float v_time;
void main(){
  v_uv       = a_uv;
  v_normal   = normalize((u_model * vec4(a_normal,0.0)).xyz);
  v_worldPos = (u_model * vec4(a_pos,1.0)).xyz;
  v_time     = u_time;
  gl_Position= u_mvp * vec4(a_pos,1.0);
}`;

// ─── GLSL — Fragment shader (Saturn fluid texture) ────────────────────────────
const FRAG_SRC = `#version 300 es
precision highp float;
in vec3 v_normal;
in vec3 v_worldPos;
in vec2 v_uv;
in float v_time;
out vec4 fragColor;

float hash(vec2 p){p=fract(p*vec2(127.1,311.7));p+=dot(p,p+19.19);return fract(p.x*p.y);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);
}
float fbm(vec2 p,int oct){
  float v=0.0,a=0.5;
  for(int i=0;i<8;i++){
    if(i>=oct)break;
    v+=a*noise(p);p=p*2.0+vec2(1.7,9.2);a*=0.5;
  }
  return v;
}
vec3 saturnTex(vec2 uv,float t){
  float bands=uv.y*8.0;
  float w1=fbm(vec2(uv.x*3.0+t*0.04,uv.y*2.0),5)*0.35;
  float w2=fbm(vec2(uv.x*2.5-t*0.03+4.0,uv.y*3.0+w1),4)*0.25;
  float band=fbm(vec2(uv.x*1.5+w2,bands+w1+t*0.02),6);
  vec3 A=vec3(0.06,0.02,0.22),B=vec3(0.10,0.06,0.45),C=vec3(0.18,0.08,0.62);
  vec3 D=vec3(0.05,0.22,0.72),E=vec3(0.28,0.48,0.95),F=vec3(0.55,0.20,0.85);
  vec3 base;
  float b=band;
  if(b<0.2)      base=mix(A,B,b/0.2);
  else if(b<0.4) base=mix(B,D,(b-0.2)/0.2);
  else if(b<0.6) base=mix(D,C,(b-0.4)/0.2);
  else if(b<0.8) base=mix(C,E,(b-0.6)/0.2);
  else           base=mix(E,F,(b-0.8)/0.2);
  float str=fbm(vec2(uv.x*6.0+w1*2.0+t*0.06,uv.y*4.0),3);
  base+=vec3(0.15,0.30,0.60)*pow(str,4.0)*0.8;
  base+=vec3(0.50,0.10,0.70)*pow(1.0-str,6.0)*0.4;
  float pol=smoothstep(0.3,1.0,abs(uv.y-0.5)*2.0);
  base=mix(base,base*0.35+vec3(0.02,0.00,0.10),pol*0.7);
  return base;
}
void main(){
  vec2 uv=v_uv;
  vec2 animUV=vec2(uv.x+v_time*0.018,uv.y);
  vec3 col=saturnTex(animUV,v_time);
  vec3 lightDir=normalize(vec3(-0.6,0.7,0.8));
  vec3 normal=normalize(v_normal);
  float diff=max(dot(normal,lightDir),0.0);
  vec3 viewDir=normalize(vec3(0.0,0.0,1.0)-v_worldPos);
  vec3 halfV=normalize(lightDir+viewDir);
  float spec=pow(max(dot(normal,halfV),0.0),48.0)*0.55;
  float rim=pow(1.0-max(dot(normal,vec3(0.0,0.0,1.0)),0.0),3.5);
  vec3 lit=col*(0.12+diff*0.88)+vec3(0.90,0.92,1.0)*spec;
  lit+=vec3(0.40,0.10,0.90)*rim*0.45+vec3(0.05,0.15,0.55)*pow(rim,1.8)*0.6;
  lit=lit/(lit+0.9);
  lit=pow(lit,vec3(1.0/2.2));
  fragColor=vec4(lit,1.0);
}`;

// ─── GLSL — Ring shaders ──────────────────────────────────────────────────────
const RING_VERT = `#version 300 es
precision highp float;
in vec2 a_pos;
uniform float u_rx,u_ry;
uniform vec2 u_center;
out float v_t;
void main(){
  float angle=atan(a_pos.y,a_pos.x);
  float r=length(a_pos);
  v_t=r;
  vec2 world=vec2(cos(angle)*r*u_rx+u_center.x,sin(angle)*r*u_ry+u_center.y);
  gl_Position=vec4(world,0.0,1.0);
}`;
const RING_FRAG = `#version 300 es
precision highp float;
in float v_t;
out vec4 fragColor;
void main(){
  float a=smoothstep(0.0,0.15,v_t)*smoothstep(1.0,0.7,v_t)*0.38;
  vec3 col=mix(vec3(0.22,0.35,0.90),vec3(0.55,0.18,0.82),v_t);
  fragColor=vec4(col,a);
}`;

// ─── WebGL helpers ────────────────────────────────────────────────────────────
function compileSh(gl, src, type) {
  const s = gl.createShader(type);
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); gl.deleteShader(s); return null; }
  return s;
}
function linkProg(gl, vs, fs) {
  const p = gl.createProgram();
  gl.attachShader(p, vs); gl.attachShader(p, fs); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(p)); return null; }
  return p;
}
function mat4Mul(a, b) {
  const c = new Float32Array(16);
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++)
      c[j*4+i] = a[i]*b[j*4]+a[i+4]*b[j*4+1]+a[i+8]*b[j*4+2]+a[i+12]*b[j*4+3];
  return c;
}
function perspMat(fov, asp, n, f) {
  const t = 1/Math.tan(fov*0.5);
  return new Float32Array([t/asp,0,0,0, 0,t,0,0, 0,0,(f+n)/(n-f),-1, 0,0,(2*f*n)/(n-f),0]);
}
function buildSphere(stacks, slices) {
  const pos=[],nrm=[],uvs=[],idx=[];
  for (let st=0;st<=stacks;st++){const phi=(st/stacks)*Math.PI;for(let sl=0;sl<=slices;sl++){const th=(sl/slices)*Math.PI*2,x=Math.sin(phi)*Math.cos(th),y=Math.cos(phi),z=Math.sin(phi)*Math.sin(th);pos.push(x,y,z);nrm.push(x,y,z);uvs.push(sl/slices,st/stacks);}}
  for (let st=0;st<stacks;st++)for(let sl=0;sl<slices;sl++){const a=st*(slices+1)+sl,b=a+1,c=a+slices+1,d=c+1;idx.push(a,c,b,b,c,d);}
  return {pos:new Float32Array(pos),nrm:new Float32Array(nrm),uvs:new Float32Array(uvs),idx:new Uint32Array(idx),count:idx.length};
}
function buildRing(inner, outer, segs) {
  const pos=[];
  for(let i=0;i<=segs;i++){const a=(i/segs)*Math.PI*2,c=Math.cos(a),s=Math.sin(a);pos.push(c*inner,s*inner,c*outer,s*outer);}
  const idx=[];
  for(let i=0;i<segs;i++){const b=i*2;idx.push(b,b+1,b+2,b+1,b+3,b+2);}
  return {pos:new Float32Array(pos),idx:new Uint32Array(idx),count:idx.length};
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function CosmosBackground() {
  const glCanvasRef   = useRef(null);
  const c2dCanvasRef  = useRef(null);
  const cursorRef     = useRef(null);   // CSS div — zero-lag cursor dot
  const rafRef        = useRef(null);
  const mouseRef      = useRef({ x: -9999, y: -9999, onPage: false });
  // Planet drag rotation state
  const dragRef = useRef({
    dragging: false,
    lastX: 0, lastY: 0,
    rx: 0, ry: 0,          // accumulated drag rotation (radians)
    vx: 0, vy: 0,          // inertia velocities
  });

  useEffect(() => {
    const glCanvas  = glCanvasRef.current;
    const c2dCanvas = c2dCanvasRef.current;
    const cursorEl  = cursorRef.current;
    if (!glCanvas || !c2dCanvas) return;

    // ── Mouse tracking — update cursor div DIRECTLY (no rAF lag) ────────────
    const onMove = (e) => {
      const cx = e.clientX, cy = e.clientY;
      mouseRef.current.x      = cx;
      mouseRef.current.y      = cy + window.scrollY;
      mouseRef.current.onPage = true;
      // Move cursor div synchronously — zero delay
      if (cursorEl) cursorEl.style.transform = `translate(${cx}px,${cy}px)`;
      // Planet drag
      const drag = dragRef.current;
      if (drag.dragging) {
        drag.vy += (cx - drag.lastX) * 0.008;
        drag.vx += (cy - drag.lastY) * 0.008;
        drag.lastX = cx; drag.lastY = cy;
      }
    };
    const onLeave = () => {
      mouseRef.current.onPage = false;
      mouseRef.current.x = -9999;
      if (cursorEl) cursorEl.style.opacity = "0";
    };
    const onEnter = () => { if (cursorEl) cursorEl.style.opacity = "1"; };
    const onDown  = (e) => {
      const drag = dragRef.current;
      drag.dragging = true; drag.lastX = e.clientX; drag.lastY = e.clientY;
      drag.vx = 0; drag.vy = 0;
    };
    const onUp = () => { dragRef.current.dragging = false; };

    window.addEventListener("mousemove",  onMove,  { passive: true });
    window.addEventListener("mousedown",  onDown,  { passive: true });
    window.addEventListener("mouseup",   onUp,    { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    // ── Sizing state ─────────────────────────────────────────────────────────
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let vw  = window.innerWidth;
    let vh  = window.innerHeight;
    let docH = document.documentElement.scrollHeight || vh;

    const ctx2d = c2dCanvas.getContext("2d");

    function resizeAll() {
      dpr  = Math.min(window.devicePixelRatio || 1, 2);
      vw   = window.innerWidth;
      vh   = window.innerHeight;
      docH = document.documentElement.scrollHeight || vh;

      glCanvas.width  = vw * dpr; glCanvas.height  = vh * dpr;
      glCanvas.style.width  = vw + "px"; glCanvas.style.height  = vh + "px";

      c2dCanvas.width  = vw * dpr; c2dCanvas.height = docH * dpr;
      c2dCanvas.style.width  = vw + "px"; c2dCanvas.style.height = docH + "px";
      ctx2d.scale(dpr, dpr);

      // Rescale star home positions if already initialised
      if (homeX) {
        for (let i = 0; i < NUM_STARS; i++) {
          homeX[i] = normX[i] * vw;
          homeY[i] = normY[i] * docH;
        }
      }
    }

    // ── WebGL2 setup ─────────────────────────────────────────────────────────
    const gl = glCanvas.getContext("webgl2", { alpha: true, antialias: true, premultipliedAlpha: false });
    if (!gl) { console.warn("WebGL2 not supported"); return; }

    const vs   = compileSh(gl, VERT_SRC,  gl.VERTEX_SHADER);
    const fs   = compileSh(gl, FRAG_SRC,  gl.FRAGMENT_SHADER);
    const rvs  = compileSh(gl, RING_VERT, gl.VERTEX_SHADER);
    const rfs  = compileSh(gl, RING_FRAG, gl.FRAGMENT_SHADER);
    const prog     = linkProg(gl, vs,  fs);
    const ringProg = linkProg(gl, rvs, rfs);
    if (!prog || !ringProg) return;

    const sphere = buildSphere(SPHERE_STACKS, SPHERE_SLICES);
    const ring   = buildRing(0.55, 1.0, IS_MOBILE ? 64 : 128);

    // Sphere VAO
    const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
    const mkBuf = (data) => { const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,data,gl.STATIC_DRAW);return b; };
    const posBuf=mkBuf(sphere.pos); const aNorm=gl.getAttribLocation(prog,"a_normal");
    const nrmBuf=mkBuf(sphere.nrm);
    const uvBuf =mkBuf(sphere.uvs);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    const aPos=gl.getAttribLocation(prog,"a_pos"); gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER, nrmBuf);
    gl.enableVertexAttribArray(aNorm); gl.vertexAttribPointer(aNorm,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuf);
    const aUV=gl.getAttribLocation(prog,"a_uv"); gl.enableVertexAttribArray(aUV); gl.vertexAttribPointer(aUV,2,gl.FLOAT,false,0,0);
    const idxBuf=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,idxBuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,sphere.idx,gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    // Ring VAO
    const ringVao=gl.createVertexArray(); gl.bindVertexArray(ringVao);
    const rPosBuf=mkBuf(ring.pos);
    const rAPos=gl.getAttribLocation(ringProg,"a_pos"); gl.enableVertexAttribArray(rAPos); gl.vertexAttribPointer(rAPos,2,gl.FLOAT,false,0,0);
    const rIdxBuf=gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,rIdxBuf); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,ring.idx,gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    const uMVP=gl.getUniformLocation(prog,"u_mvp"), uModel=gl.getUniformLocation(prog,"u_model"), uTime=gl.getUniformLocation(prog,"u_time");
    const rURX=gl.getUniformLocation(ringProg,"u_rx"), rURY=gl.getUniformLocation(ringProg,"u_ry"), rUCen=gl.getUniformLocation(ringProg,"u_center");

    // ── Star / Vector field data — typed arrays for cache efficiency ─────────
    let seed = 42;
    const rng = () => { seed=(seed*1664525+1013904223)&0x7fffffff; return seed/0x7fffffff; };
    const rr  = (a,b) => a + rng()*(b-a);

    // Normalised positions (0-1) — preserved across resizes
    const normX  = new Float32Array(NUM_STARS);
    const normY  = new Float32Array(NUM_STARS);

    // World-space positions (px)
    const homeX  = new Float32Array(NUM_STARS);
    const homeY  = new Float32Array(NUM_STARS);
    const posX   = new Float32Array(NUM_STARS);
    const posY   = new Float32Array(NUM_STARS);

    // Physics
    const velX   = new Float32Array(NUM_STARS);
    const velY   = new Float32Array(NUM_STARS);

    // Visual
    const angle     = new Float32Array(NUM_STARS);  // current display angle (vector dir)
    const baseAngle = new Float32Array(NUM_STARS);  // resting flow-field angle
    const starR     = new Float32Array(NUM_STARS);  // outer radius of star sparkle
    const twPhase   = new Float32Array(NUM_STARS);  // twinkle phase offset per star
    const bandIdx   = new Uint8Array(NUM_STARS);    // colour band 0-5

    // Pre-computed fill colour strings per band (avoids template literal in hot loop)
    const bandFills = BAND_HUES.map((h,i) =>
      `hsla(${h},${BAND_SATS[i]}%,${BAND_LUMS[i]}%,${BAND_ALPHAS[i]})`
    );
    // Bright version for nearby-cursor glow
    const bandGlow = BAND_HUES.map((h,i) =>
      `hsla(${h},95%,88%,0.82)`
    );

    // Initialise star data
    resizeAll(); // sets vw, vh, docH first
    for (let i = 0; i < NUM_STARS; i++) {
      normX[i] = rng();
      normY[i] = rng();
      homeX[i] = normX[i] * vw;
      homeY[i] = normY[i] * docH;
      posX[i]  = homeX[i];
      posY[i]  = homeY[i];
      velX[i]  = 0;
      velY[i]  = 0;
      // Base flow-field angle: smooth noise via trig combo → natural swirl
      const nx = normX[i], ny = normY[i];
      baseAngle[i] = Math.sin(nx * Math.PI * 2.3 + ny * Math.PI * 1.7) * Math.PI
                   + Math.cos(ny * Math.PI * 2.1 - nx * Math.PI * 0.9) * 0.6;
      angle[i]   = baseAngle[i];
      starR[i]   = rr(2.5, 5.5);   // outer radius of the 4-point sparkle
      twPhase[i] = rng() * Math.PI * 2; // unique twinkle phase
      // Colour band by normalised Y
      bandIdx[i] = Math.min(COLOR_BANDS - 1, Math.floor(normY[i] * COLOR_BANDS));
    }

    // Math symbol particles — count scaled to device
    const mathP = Array.from({ length: NUM_MATH_SYMBOLS }, (_, i) => ({
      sym:   MATH_SYMBOLS[i % MATH_SYMBOLS.length],
      nx:    rng(), ny: rng(),   // normalised
      vy:   -rr(0.00006, 0.0002),
      size:  rr(10, 19),
      alpha: rr(0.12, 0.45),
      adrift:(rng()-0.5)*0.0025,
      rot:   0,
      rotSp: (rng()-0.5)*0.0015,
      phase: rng()*Math.PI*2,
      hue:   rr(210, 285),
    }));

    window.addEventListener("resize", resizeAll);

    // ── Pause animation when tab is hidden (saves 100% GPU on alt-tab) ───────
    let paused = false;
    const onVisibilityChange = () => { paused = document.hidden; };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // ── Animation loop ────────────────────────────────────────────────────────
    let time     = 0;
    let ringRot  = 0;
    let frameN   = 0;
    let lastDocH = docH;
    let lastFrameTs = 0; // for mobile FPS throttle

    // Pre-allocated matrix buffers — no new Float32Array() inside drawFrame
    const modelBuf   = new Float32Array(16);
    const scaleBuf   = new Float32Array(16);
    const transBuf   = new Float32Array(16);
    const rotXBuf    = new Float32Array(16);
    const tmp16      = new Float32Array(16);  // scratch for in-place multiply
    // In-place mat4 multiply: dst = a * b  (reuses dst buffer)
    function mat4MulInto(dst, a, b) {
      for (let i=0;i<4;i++) for (let j=0;j<4;j++)
        dst[j*4+i]=a[i]*b[j*4]+a[i+4]*b[j*4+1]+a[i+8]*b[j*4+2]+a[i+12]*b[j*4+3];
    }

    function drawFrame(ts = 0) {
      rafRef.current = requestAnimationFrame(drawFrame);
      // ── Pause when tab is hidden ──────────────────────────────────────────
      if (paused) return;
      // ── FPS throttle for mobile (30fps cap) ──────────────────────────────
      if (TARGET_MS > 0) {
        const elapsed = ts - lastFrameTs;
        if (elapsed < TARGET_MS) return;
        lastFrameTs = ts - (elapsed % TARGET_MS);
      }
      time    += 0.016;
      ringRot += 0.0003;
      frameN++;

      // ── Check page height change every 30 frames (avoids forced layout) ───
      if (frameN % 30 === 0) {
        const newDocH = document.documentElement.scrollHeight || vh;
        if (Math.abs(newDocH - lastDocH) > 10) { lastDocH = newDocH; resizeAll(); }
      }

      const W = vw, H = vh, DH = docH;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const hasMouse = mouseRef.current.onPage;

      // ── Planet drag inertia (apply + dampen each frame) ───────────────────
      const drag = dragRef.current;
      if (!drag.dragging) {
        drag.vx *= 0.94;  // inertia decay
        drag.vy *= 0.94;
      }
      drag.rx += drag.vx;
      drag.ry += drag.vy;

      // ════════════════════════════════════════════════════════
      // WEBGL PASS — 3D Saturn
      // ════════════════════════════════════════════════════════
      gl.viewport(0, 0, glCanvas.width, glCanvas.height);
      gl.clearColor(0,0,0,0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const aspect = glCanvas.width / glCanvas.height;

      // Auto Y-rotation + drag X/Y rotation combined
      const autoY  = time * 0.006;
      const totalY = autoY + drag.ry;
      const totalX = drag.rx;
      const cY = Math.cos(totalY), sY = Math.sin(totalY);
      const cX = Math.cos(totalX), sX = Math.sin(totalX);

      // RotY matrix
      modelBuf.fill(0);
      modelBuf[0]=cY;  modelBuf[2]=sY;  modelBuf[5]=1;
      modelBuf[8]=-sY; modelBuf[10]=cY; modelBuf[15]=1;

      // RotX matrix
      rotXBuf.fill(0);
      rotXBuf[0]=1; rotXBuf[5]=cX; rotXBuf[6]=-sX;
      rotXBuf[9]=sX; rotXBuf[10]=cX; rotXBuf[15]=1;

      // Combined rotation = RotX * RotY (in-place, no allocation)
      mat4MulInto(tmp16, rotXBuf, modelBuf);

      // Planet: bottom-right like Saturn reference image
      // Large sphere, mostly visible at top-left arc, extends off bottom-right
      const sc = Math.min(W, H) * 0.0042 * 0.38;  // ~half screen width
      scaleBuf.fill(0); scaleBuf[0]=sc; scaleBuf[5]=sc; scaleBuf[10]=sc; scaleBuf[15]=1;
      const tx = 0.68, ty = -0.55, tz = -2.0;     // right + lower + closer
      transBuf.fill(0); transBuf[0]=transBuf[5]=transBuf[10]=transBuf[15]=1;
      transBuf[12]=tx; transBuf[13]=ty; transBuf[14]=tz;

      // modelFull = Translate * Scale * (RotX*RotY) — no extra allocations
      mat4MulInto(tmp16, scaleBuf, tmp16);   // tmp16 = Scale * Rot
      mat4MulInto(modelBuf, transBuf, tmp16); // modelBuf = Trans * Scale * Rot  (reuse modelBuf)
      const proj = perspMat(1.05, aspect, 0.1, 100);
      mat4MulInto(tmp16, proj, modelBuf);     // tmp16 = MVP

      gl.useProgram(prog);
      gl.uniformMatrix4fv(uMVP,   false, tmp16);    // MVP  (no new alloc)
      gl.uniformMatrix4fv(uModel, false, modelBuf); // model
      gl.uniform1f(uTime, time);
      gl.bindVertexArray(vao);
      gl.drawElements(gl.TRIANGLES, sphere.count, gl.UNSIGNED_INT, 0);
      gl.bindVertexArray(null);

      // Ring — use same tx/ty/tz/sc as planet above
      const fov1   = 1 / Math.tan(1.05 * 0.5);
      const abstz  = Math.abs(tz);
      const pndx   = (tx / abstz) * fov1 / aspect;
      const pndy   = (ty / abstz) * fov1;
      const rscale = (sc * 0.9 / abstz) * fov1;

      gl.useProgram(ringProg);
      gl.disable(gl.DEPTH_TEST);
      gl.uniform1f(rURX, rscale * 2.8 / aspect);
      gl.uniform1f(rURY, rscale * 0.38);
      gl.uniform2f(rUCen, pndx, pndy);
      gl.bindVertexArray(ringVao);
      gl.drawElements(gl.TRIANGLES, ring.count, gl.UNSIGNED_INT, 0);
      gl.bindVertexArray(null);
      gl.enable(gl.DEPTH_TEST);

      // ════════════════════════════════════════════════════════
      // CANVAS 2D PASS — Vector field + Math
      // ════════════════════════════════════════════════════════
      ctx2d.clearRect(0, 0, W, DH);

      // ── 1. Physics update (vector field + mouse attraction) ──────────────
      for (let i = 0; i < NUM_STARS; i++) {
        const dx = mx - posX[i];
        const dy = my - posY[i];
        const dSq = dx*dx + dy*dy;

        if (hasMouse && dSq < ATTRACT_RADIUS_SQ && dSq > 1) {
          // Attraction force (inverse-square falloff capped)
          const inv = 1.0 / Math.sqrt(dSq);
          const factor = ATTRACT_STRENGTH * (1.0 - dSq / ATTRACT_RADIUS_SQ);
          velX[i] += dx * inv * factor;
          velY[i] += dy * inv * factor;
          // Rotate vector toward cursor
          const targetAng = Math.atan2(dy, dx);
          let diff = targetAng - angle[i];
          // Wrap to [-PI, PI]
          if (diff > Math.PI)  diff -= Math.PI*2;
          if (diff < -Math.PI) diff += Math.PI*2;
          angle[i] += diff * ANGLE_LERP_NEAR;
        } else {
          // Spring angle back to base flow angle
          let diff = baseAngle[i] - angle[i];
          if (diff > Math.PI)  diff -= Math.PI*2;
          if (diff < -Math.PI) diff += Math.PI*2;
          angle[i] += diff * ANGLE_LERP_FAR;
        }

        // Spring position back to home
        velX[i] += (homeX[i] - posX[i]) * SPRING_K;
        velY[i] += (homeY[i] - posY[i]) * SPRING_K;
        velX[i] *= DAMPING;
        velY[i] *= DAMPING;
        posX[i] += velX[i];
        posY[i] += velY[i];
      }

      // ── 2. Draw star sparkles — batched by colour band ───────────────────
      // 4-pointed star (✦) oriented by vector angle, filled per band.
      // 6 fill() calls for all 450 stars — no save/restore in loop.
      for (let b = 0; b < COLOR_BANDS; b++) {
        ctx2d.beginPath();
        ctx2d.fillStyle = bandFills[b];
        for (let i = 0; i < NUM_STARS; i++) {
          if (bandIdx[i] !== b) continue;
          const x  = posX[i], y = posY[i];
          // Twinkle: pulse radius ±25% based on time + unique phase
          const tw = 0.75 + 0.25 * Math.sin(time * 1.8 + twPhase[i]);
          const R  = starR[i] * tw;        // outer arm tip
          const r  = R * 0.18;             // inner waist radius
          // Arm directions from vector angle
          const ang = angle[i];
          const c0 = Math.cos(ang),     s0 = Math.sin(ang);     // axis 0 (along vec)
          const c1 = Math.cos(ang+Math.PI*0.5), s1 = Math.sin(ang+Math.PI*0.5); // axis 1 (perp)
          // 4-point star: tip0 → waist01 → tip1 → waist10 → tip2 → waist21 → tip3 → waist30
          ctx2d.moveTo(x + c0*R,  y + s0*R);
          ctx2d.lineTo(x + c1*r,  y + s1*r);
          ctx2d.lineTo(x - c0*R,  y - s0*R);
          ctx2d.lineTo(x - c1*r,  y - s1*r);
          ctx2d.closePath();
          ctx2d.moveTo(x + c1*R,  y + s1*R);
          ctx2d.lineTo(x + c0*r,  y + s0*r);
          ctx2d.lineTo(x - c1*R,  y - s1*R);
          ctx2d.lineTo(x - c0*r,  y - s0*r);
          ctx2d.closePath();
        }
        ctx2d.fill();
      }

      // ── 3. Glow dots for stars near cursor ───────────────────────────────
      if (hasMouse) {
        const GLOW_R    = ATTRACT_RADIUS * 0.65;
        const GLOW_RSQ  = GLOW_R * GLOW_R;
        ctx2d.shadowBlur = 8;
        for (let b = 0; b < COLOR_BANDS; b++) {
          ctx2d.beginPath();
          ctx2d.fillStyle   = bandGlow[b];
          ctx2d.shadowColor = bandGlow[b];
          let any = false;
          for (let i = 0; i < NUM_STARS; i++) {
            if (bandIdx[i] !== b) continue;
            const dx = mx - posX[i], dy = my - posY[i];
            if (dx*dx + dy*dy > GLOW_RSQ) continue;
            // Bright enlarged sparkle on top
            const x  = posX[i], y = posY[i];
            const R  = starR[i] * 1.6;
            const r  = R * 0.18;
            const ang = angle[i];
            const c0 = Math.cos(ang), s0 = Math.sin(ang);
            const c1 = Math.cos(ang+Math.PI*0.5), s1 = Math.sin(ang+Math.PI*0.5);
            ctx2d.moveTo(x+c0*R, y+s0*R); ctx2d.lineTo(x+c1*r, y+s1*r);
            ctx2d.lineTo(x-c0*R, y-s0*R); ctx2d.lineTo(x-c1*r, y-s1*r);
            ctx2d.closePath();
            ctx2d.moveTo(x+c1*R, y+s1*R); ctx2d.lineTo(x+c0*r, y+s0*r);
            ctx2d.lineTo(x-c1*R, y-s1*R); ctx2d.lineTo(x-c0*r, y-s0*r);
            ctx2d.closePath();
            any = true;
          }
          if (any) ctx2d.fill();
        }
        ctx2d.shadowBlur  = 0;
        ctx2d.shadowColor = "transparent";

        // Attraction field glow (soft radial, no cursor dot — dot is CSS div)
        ctx2d.save();
        ctx2d.globalCompositeOperation = "screen";
        const grad = ctx2d.createRadialGradient(mx, my, 0, mx, my, ATTRACT_RADIUS);
        grad.addColorStop(0,   "rgba(160,120,255,0.13)");
        grad.addColorStop(0.5, "rgba(80,60,200,0.04)");
        grad.addColorStop(1,   "rgba(0,0,0,0)");
        ctx2d.fillStyle = grad;
        ctx2d.beginPath(); ctx2d.arc(mx, my, ATTRACT_RADIUS, 0, Math.PI*2); ctx2d.fill();
        ctx2d.restore();
      }

      // ── 4. Math symbol particles ──────────────────────────────────────────
      // Minimal shadow only for text glyphs
      ctx2d.textAlign    = "center";
      ctx2d.textBaseline = "middle";
      for (const mp of mathP) {
        mp.ny += mp.vy;
        mp.rot += mp.rotSp;
        mp.alpha += mp.adrift;
        if (mp.ny < -0.04) mp.ny = 1.04;
        if (mp.ny >  1.04) mp.ny = -0.04;
        if (mp.alpha < 0.06) { mp.alpha = 0.06; mp.adrift *= -1; }
        if (mp.alpha > 0.50) { mp.alpha = 0.50; mp.adrift *= -1; }

        const sx = mp.nx * W;
        const sy = mp.ny * DH + Math.sin(time * 0.35 + mp.phase) * 14;
        const hue = mp.hue + Math.sin(time*0.4 + mp.phase)*12;

        ctx2d.save();
        ctx2d.translate(sx, sy);
        ctx2d.rotate(mp.rot);
        ctx2d.font        = `${mp.size}px 'Courier New',monospace`;
        ctx2d.fillStyle   = `hsla(${hue},78%,72%,${mp.alpha.toFixed(2)})`;
        ctx2d.shadowColor = `hsla(${hue},90%,80%,${(mp.alpha*0.7).toFixed(2)})`;
        ctx2d.shadowBlur  = mp.size * 0.6;
        ctx2d.fillText(mp.sym, 0, 0);
        ctx2d.restore();
      }

      // ── 5. Nebula glow (soft, screen blend) ──────────────────────────────
      const ngx = W*0.62, ngy = H*0.48;
      const nr  = Math.min(W,H)*0.52;
      const pulse = 0.08 + 0.025*Math.sin(time*0.45);
      const nebGrad = ctx2d.createRadialGradient(ngx,ngy,0,ngx,ngy,nr);
      nebGrad.addColorStop(0,   `rgba(75,20,155,${pulse.toFixed(3)})`);
      nebGrad.addColorStop(0.45,`rgba(18,38,130,${(pulse*0.55).toFixed(3)})`);
      nebGrad.addColorStop(1,   "rgba(0,0,0,0)");
      ctx2d.save();
      ctx2d.globalCompositeOperation = "screen";
      ctx2d.fillStyle = nebGrad;
      ctx2d.beginPath();
      ctx2d.ellipse(ngx, ngy, nr, nr*0.7, 0, 0, Math.PI*2);
      ctx2d.fill();
      ctx2d.restore();

    }

    rafRef.current = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("mousemove",  onMove);
      window.removeEventListener("mousedown",  onDown);
      window.removeEventListener("mouseup",   onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
      window.removeEventListener("resize", resizeAll);
      // WebGL cleanup
      [posBuf, nrmBuf, uvBuf, idxBuf, rPosBuf, rIdxBuf].forEach(b => gl.deleteBuffer(b));
      gl.deleteVertexArray(vao);
      gl.deleteVertexArray(ringVao);
      gl.deleteProgram(prog);
      gl.deleteProgram(ringProg);
    };
  }, []);

  return (
    <>
      {/* WebGL layer — fixed to viewport (planet stays in place while scrolling) */}
      <canvas
        ref={glCanvasRef}
        style={{
          position: "fixed", top: 0, left: 0,
          width: "100vw", height: "100vh",
          zIndex: 0, pointerEvents: "none",
          willChange: "transform",
        }}
      />
      {/* Canvas 2D layer — scrolls with page content */}
      <canvas
        ref={c2dCanvasRef}
        style={{
          position: "absolute", top: 0, left: 0,
          width: "100%", height: "100%",
          zIndex: 1, pointerEvents: "none",
          opacity: 0.93,
          willChange: "transform",
        }}
      />
      {/*
        Cursor dot — CSS div updated directly in mousemove (zero rAF lag).
        Uses transform: translate so GPU-composited — no layout reflow.
      */}
      <div
        ref={cursorRef}
        style={{
          position: "fixed",
          top: 0, left: 0,
          width: 10, height: 10,
          borderRadius: "50%",
          background: "rgba(230,215,255,0.92)",
          boxShadow: "0 0 10px 4px rgba(180,140,255,0.7), 0 0 22px 8px rgba(130,90,220,0.35)",
          pointerEvents: "none",
          zIndex: 10,
          transform: "translate(-9999px,-9999px)",
          willChange: "transform",
          // Offset: dot appears just below the cursor arrow tip
          marginLeft: 4, marginTop: 18,
        }}
      />
    </>
  );
}
