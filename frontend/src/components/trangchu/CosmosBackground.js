"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/*
  ==============================================================================
  CELESTIAL MATHEMATICAL COSMOS 3D (Vibe $10k Cinematic)
  Inspired by:
    1. getlayers.ai  — Deep obsidian/indigo/cyan cinematic space, 3D hyper-geometric
                       singularity, relativistic spacetime manifold, floating formulas.
    2. 60fps.design  — Damped harmonic spring physics, gravitational mouse lens,
                       constellation Delaunay network, click shockwave, 60 FPS lock.
    3. navbar.gallery— Seamless glassmorphic coordination & high-tech mathematical HUD.
  ==============================================================================
*/

// ─── Mathematical Formulas & Glyphs ──────────────────────────────────────────
const MATH_EQUATIONS = [
  { text: "e^{iπ} + 1 = 0", sub: "Euler's Identity", color: "#38bdf8" },
  { text: "∇ × E = -∂B/∂t", sub: "Maxwell-Faraday", color: "#a855f7" },
  { text: "∫ e^{-x²} dx = √π", sub: "Gaussian Integral", color: "#34d399" },
  { text: "ζ(s) = ∑ n^{-s}", sub: "Riemann Zeta", color: "#f472b6" },
  { text: "iℏ ∂ψ/∂t = Ĥψ", sub: "Schrödinger Eq.", color: "#38bdf8" },
  { text: "R_μν - ½Rg_μν = κT_μν", sub: "Einstein Field Eq.", color: "#fbbf24" },
  { text: "Φ = (1+√5)/2", sub: "Golden Ratio", color: "#60a5fa" },
  { text: "∑ 1/n² = π²/6", sub: "Basel Problem", color: "#c084fc" },
  { text: "∮ F·dr = ∬ (∇×F)·dS", sub: "Stokes' Theorem", color: "#2dd4bf" },
  { text: "det(A - λI) = 0", sub: "Eigenvalues", color: "#f87171" },
  { text: "lim (sin x)/x = 1", sub: "Fundamental Limit", color: "#818cf8" },
  { text: "F = G(m₁m₂)/r²", sub: "Universal Gravitation", color: "#a78bfa" },
];

const MATH_SYMBOLS = [
  "∫", "∂", "∇", "∮", "∑", "∏", "∞", "λ", "ψ", "Ω",
  "ℏ", "Δ", "θ", "≈", "±", "ℝⁿ", "⊂", "∀", "∃", "∝"
];

// Helper: Generate crisp Canvas Sprite for Mathematical Equations
function createMathEquationTexture(eq) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Background subtle glass pill glow
  ctx.clearRect(0, 0, 512, 160);
  const grad = ctx.createLinearGradient(0, 0, 512, 160);
  grad.addColorStop(0, "rgba(15, 23, 42, 0.75)");
  grad.addColorStop(1, "rgba(30, 27, 75, 0.65)");
  
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(16, 16, 480, 128, 24);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = eq.color + "55";
  ctx.shadowColor = eq.color;
  ctx.shadowBlur = 14;
  ctx.stroke();
  ctx.restore();

  // Equation Main Text
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 34px 'Cambria Math', 'Times New Roman', serif";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = eq.color;
  ctx.shadowBlur = 12;
  ctx.fillText(eq.text, 256, 64);

  // Subtitle / Label
  ctx.font = "600 15px 'Courier New', monospace";
  ctx.fillStyle = eq.color;
  ctx.letterSpacing = "2px";
  ctx.shadowBlur = 6;
  ctx.fillText(eq.sub.toUpperCase(), 256, 108);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

// Helper: Generate Canvas Sprite for Single Math Symbols
function createMathSymbolTexture(sym, color) {
  const canvas = document.createElement("canvas");
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.clearRect(0, 0, 128, 128);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 64px 'Cambria Math', 'Times New Roman', serif";
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 18;
  ctx.fillText(sym, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

// ─── 4D Tesseract Projection Builder ──────────────────────────────────────────
function createTesseractEdges() {
  const v4 = [];
  for (let x = -1; x <= 1; x += 2) {
    for (let y = -1; y <= 1; y += 2) {
      for (let z = -1; z <= 1; z += 2) {
        for (let w = -1; w <= 1; w += 2) {
          v4.push([x, y, z, w]);
        }
      }
    }
  }

  const edges = [];
  for (let i = 0; i < 16; i++) {
    for (let j = i + 1; j < 16; j++) {
      let diff = 0;
      for (let k = 0; k < 4; k++) {
        if (v4[i][k] !== v4[j][k]) diff++;
      }
      if (diff === 1) {
        edges.push([i, j]);
      }
    }
  }
  return { v4, edges };
}

// Helper: Generate Smooth Circular Glow Texture for Star Particles (eliminates square artifact)
function createStarParticleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "rgba(255, 255, 255, 1)");
  grad.addColorStop(0.2, "rgba(255, 255, 255, 0.85)");
  grad.addColorStop(0.5, "rgba(255, 255, 255, 0.25)");
  grad.addColorStop(1, "rgba(255, 255, 255, 0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
}

export default function CosmosBackground() {
  const mountRef = useRef(null);
  const hudRef = useRef(null);
  const [hudCoord, setHudCoord] = useState({ x: 0, y: 0, rad: "0.00π", z: "0.0" });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ─── Device Tier & Optimization ─────────────────────────────────────────
    const isMobile = window.innerWidth < 768;
    const NUM_PARTICLES = isMobile ? 450 : 1200;
    const MAX_CONSTELLATION_LINES = isMobile ? 120 : 350;
    const GRID_SIZE = isMobile ? 28 : 42;

    // ─── Scene, Camera, Renderer ────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.0035);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1200
    );
    camera.position.set(0, 5, 88);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // ─── Celestial Singularity Assembly ──────────────────────────────────────
    const celestialGroup = new THREE.Group();
    // Offset slightly to top-right to frame hero content dynamically
    celestialGroup.position.set(isMobile ? 0 : 26, isMobile ? 18 : 6, -10);
    scene.add(celestialGroup);

    // 1. 4D Tesseract Geometry
    const { v4: tesseractV4, edges: tesseractEdges } = createTesseractEdges();
    const tesseractEdgePositions = new Float32Array(tesseractEdges.length * 2 * 3);
    const tesseractGeom = new THREE.BufferGeometry();
    tesseractGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(tesseractEdgePositions, 3)
    );

    const tesseractMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      linewidth: 2,
    });
    const tesseractLines = new THREE.LineSegments(tesseractGeom, tesseractMat);
    celestialGroup.add(tesseractLines);

    // Tesseract Vertex Nodes
    const vertexPositions = new Float32Array(16 * 3);
    const vertexGeom = new THREE.BufferGeometry();
    vertexGeom.setAttribute(
      "position",
      new THREE.BufferAttribute(vertexPositions, 3)
    );
    const vertexMat = new THREE.PointsMaterial({
      color: 0xc084fc,
      size: 1.8,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.95,
    });
    const vertexPoints = new THREE.Points(vertexGeom, vertexMat);
    celestialGroup.add(vertexPoints);

    // 2. Parametric Torus Knot Singularity
    const torusGeom = new THREE.TorusKnotGeometry(12, 1.8, 120, 16, 2, 3);
    const torusMat = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const torusKnot = new THREE.Mesh(torusGeom, torusMat);
    celestialGroup.add(torusKnot);

    // 3. Sacred Armillary & Keplerian Coordinate Rings
    const createArmillaryRing = (radius, tiltX, tiltZ, color, opacity = 0.5, dashed = false) => {
      const ringGeom = new THREE.BufferGeometry();
      const points = [];
      const segments = 128;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * radius, 0, Math.sin(theta) * radius));
      }
      ringGeom.setFromPoints(points);
      const ringMat = dashed
        ? new THREE.LineDashedMaterial({
            color,
            transparent: true,
            opacity,
            dashSize: 2.5,
            gapSize: 1.5,
            blending: THREE.AdditiveBlending,
          })
        : new THREE.LineBasicMaterial({
            color,
            transparent: true,
            opacity,
            blending: THREE.AdditiveBlending,
          });
      const line = new THREE.Line(ringGeom, ringMat);
      if (dashed) line.computeLineDistances();
      line.rotation.x = tiltX;
      line.rotation.z = tiltZ;
      return line;
    };

    const ring1 = createArmillaryRing(22, Math.PI / 4, 0.2, 0x38bdf8, 0.65, true);
    const ring2 = createArmillaryRing(26, -Math.PI / 3, -0.3, 0xa855f7, 0.55, false);
    const ring3 = createArmillaryRing(30, 0.3, Math.PI / 5, 0x34d399, 0.45, true);
    celestialGroup.add(ring1);
    celestialGroup.add(ring2);
    celestialGroup.add(ring3);

    // 4. Glowing Quantum Energy Core (Center of Celestial Assembly)
    const coreGlowGeom = new THREE.SphereGeometry(3.5, 32, 32);
    const coreGlowMat = new THREE.MeshBasicMaterial({
      color: 0x60a5fa,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const coreGlow = new THREE.Mesh(coreGlowGeom, coreGlowMat);
    celestialGroup.add(coreGlow);

    // ─── 2. Einstein Spacetime Curvature Manifold (3D Wireframe Plane) ───────
    const manifoldW = 260;
    const manifoldH = 260;
    const manifoldGeom = new THREE.PlaneGeometry(manifoldW, manifoldH, GRID_SIZE, GRID_SIZE);
    manifoldGeom.rotateX(-Math.PI / 2.3);
    manifoldGeom.translate(0, -32, -20);

    const manifoldMat = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
    });
    const spacetimeManifold = new THREE.Mesh(manifoldGeom, manifoldMat);
    scene.add(spacetimeManifold);

    const baseManifoldPositions = manifoldGeom.attributes.position.array.slice();

    // ─── 3. Vector Field Star Particles & Constellation Links ────────────────
    const pPositions = new Float32Array(NUM_PARTICLES * 3);
    const pColors = new Float32Array(NUM_PARTICLES * 3);

    const particleColorsList = [
      new THREE.Color(0x38bdf8), // Neon cyan
      new THREE.Color(0xa855f7), // Vibrant purple
      new THREE.Color(0x60a5fa), // Royal blue
      new THREE.Color(0x34d399), // Emerald
      new THREE.Color(0xf472b6), // Soft rose
    ];

    for (let i = 0; i < NUM_PARTICLES; i++) {
      const idx = i * 3;
      pPositions[idx] = (Math.random() - 0.5) * 220;
      pPositions[idx + 1] = (Math.random() - 0.5) * 160;
      pPositions[idx + 2] = (Math.random() - 0.5) * 140;

      const c = particleColorsList[i % particleColorsList.length];
      pColors[idx] = c.r;
      pColors[idx + 1] = c.g;
      pColors[idx + 2] = c.b;
    }

    const homePositions = new Float32Array(pPositions);

    const particleGeom = new THREE.BufferGeometry();
    particleGeom.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    particleGeom.setAttribute("color", new THREE.BufferAttribute(pColors, 3));

    const starTexture = createStarParticleTexture();
    const particleMat = new THREE.PointsMaterial({
      size: isMobile ? 1.8 : 2.5,
      map: starTexture || undefined,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeom, particleMat);
    scene.add(particleSystem);

    // Dynamic Constellation Mesh Lines (Connects particles near cursor)
    const linePositions = new Float32Array(MAX_CONSTELLATION_LINES * 2 * 3);
    const lineGeom = new THREE.BufferGeometry();
    lineGeom.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
    const constellationLinesMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
    });
    const constellationLines = new THREE.LineSegments(lineGeom, constellationLinesMat);
    scene.add(constellationLines);

    // ─── 4. Floating 3D Mathematical Equation Sprites & Glyphs ───────────────
    const equationGroup = new THREE.Group();
    scene.add(equationGroup);

    MATH_EQUATIONS.forEach((eq, i) => {
      const tex = createMathEquationTexture(eq);
      if (!tex) return;
      const spriteMat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(spriteMat);
      
      // Distribute in a spherical arc around the viewport
      const phi = (i / MATH_EQUATIONS.length) * Math.PI * 2;
      const radX = 55 + (i % 3) * 18;
      const radY = 28 + (i % 2) * 12;
      sprite.position.set(
        Math.cos(phi) * radX,
        Math.sin(phi) * radY - 4,
        (Math.random() - 0.5) * 35 - 10
      );
      sprite.scale.set(18, 5.6, 1);
      sprite.userData = {
        baseY: sprite.position.y,
        baseX: sprite.position.x,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.5,
      };
      equationGroup.add(sprite);
    });

    // Floating Symbols
    MATH_SYMBOLS.forEach((sym, i) => {
      const col = particleColorsList[i % particleColorsList.length];
      const tex = createMathSymbolTexture(sym, "#" + col.getHexString());
      if (!tex) return;
      const symMat = new THREE.SpriteMaterial({
        map: tex,
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
      });
      const symSprite = new THREE.Sprite(symMat);
      symSprite.position.set(
        (Math.random() - 0.5) * 160,
        (Math.random() - 0.5) * 110,
        (Math.random() - 0.5) * 70 - 15
      );
      symSprite.scale.set(3.5, 3.5, 1);
      symSprite.userData = {
        baseY: symSprite.position.y,
        phase: Math.random() * Math.PI * 2,
        drift: (Math.random() - 0.5) * 0.02,
      };
      equationGroup.add(symSprite);
    });

    // ─── 5. 60fps.design Physics & State Variables ───────────────────────────
    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      worldPos: new THREE.Vector3(),
      isDown: false,
      lastX: 0,
      lastY: 0,
    };

    const drag = {
      rx: 0,
      ry: 0,
      vx: 0,
      vy: 0,
    };

    // Gravitational Shockwaves on Click
    const shockwaves = [];

    // Plane for Raycasting Cursor to World coordinates
    const raycaster = new THREE.Raycaster();
    const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

    // Event Handlers
    const onMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = -(e.clientY / window.innerHeight) * 2 + 1;
      mouse.targetX = normX;
      mouse.targetY = normY;

      // Unproject mouse to 3D world plane at Z=0
      raycaster.setFromCamera(new THREE.Vector2(normX, normY), camera);
      raycaster.ray.intersectPlane(planeZ, mouse.worldPos);

      // Drag inertia
      if (mouse.isDown) {
        const dx = e.clientX - mouse.lastX;
        const dy = e.clientY - mouse.lastY;
        drag.vy += dx * 0.0035;
        drag.vx += dy * 0.0035;
        mouse.lastX = e.clientX;
        mouse.lastY = e.clientY;
      }

      // Fast HUD update
      if (hudRef.current) {
        hudRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    const onMouseDown = (e) => {
      mouse.isDown = true;
      mouse.lastX = e.clientX;
      mouse.lastY = e.clientY;

      // Spawn Gravitational Shockwave
      shockwaves.push({
        center: mouse.worldPos.clone(),
        radius: 0,
        maxRadius: 120,
        strength: 1.0,
        speed: 2.2,
      });
    };

    const onMouseUp = () => {
      mouse.isDown = false;
    };

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    window.addEventListener("resize", onResize);

    // ─── Animation Loop (60 FPS Solid) ───────────────────────────────────────
    let clock = new THREE.Clock();
    let frameId = null;
    let isHidden = false;

    const onVisibilityChange = () => {
      isHidden = document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    let hudCounter = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      if (isHidden) return;

      const delta = Math.min(clock.getDelta(), 0.1);
      const time = clock.getElapsedTime();

      // 1. Camera Parallax (Damped Harmonic Spring)
      mouse.x += (mouse.targetX - mouse.x) * 0.045;
      mouse.y += (mouse.targetY - mouse.y) * 0.045;
      camera.position.x = mouse.x * 6;
      camera.position.y = 5 + mouse.y * 4;
      camera.lookAt(0, 0, 0);

      // 2. Drag & Rotation Momentum Decay
      if (!mouse.isDown) {
        drag.vx *= 0.94;
        drag.vy *= 0.94;
      }
      drag.rx += drag.vx;
      drag.ry += drag.vy;

      // 3. 4D Tesseract Rotation & Projection
      const angle1 = time * 0.35 + drag.ry;
      const angle2 = time * 0.22 + drag.rx;
      const cos1 = Math.cos(angle1), sin1 = Math.sin(angle1);
      const cos2 = Math.cos(angle2), sin2 = Math.sin(angle2);

      const d4 = 2.8;
      const tessScale = 11.5;
      const p3d = [];

      for (let i = 0; i < 16; i++) {
        let [x, y, z, w] = tesseractV4[i];

        // 4D Rotation in XW and YZ planes
        const x1 = x * cos1 - w * sin1;
        const w1 = x * sin1 + w * cos1;
        const y1 = y * cos2 - z * sin2;
        const z1 = y * sin2 + z * cos2;

        // Perspective 4D to 3D projection
        const k = 1 / (d4 - w1);
        const px = x1 * k * tessScale;
        const py = y1 * k * tessScale;
        const pz = z1 * k * tessScale;

        p3d.push([px, py, pz]);
        vertexPositions[i * 3] = px;
        vertexPositions[i * 3 + 1] = py;
        vertexPositions[i * 3 + 2] = pz;
      }

      vertexGeom.attributes.position.needsUpdate = true;

      // Update Tesseract Edges
      let edgeIdx = 0;
      for (let i = 0; i < tesseractEdges.length; i++) {
        const [u, v] = tesseractEdges[i];
        tesseractEdgePositions[edgeIdx++] = p3d[u][0];
        tesseractEdgePositions[edgeIdx++] = p3d[u][1];
        tesseractEdgePositions[edgeIdx++] = p3d[u][2];
        tesseractEdgePositions[edgeIdx++] = p3d[v][0];
        tesseractEdgePositions[edgeIdx++] = p3d[v][1];
        tesseractEdgePositions[edgeIdx++] = p3d[v][2];
      }
      tesseractGeom.attributes.position.needsUpdate = true;

      // Animate Armillary Rings
      ring1.rotation.y = time * 0.28;
      ring2.rotation.x = -Math.PI / 3 + time * 0.2;
      ring3.rotation.z = Math.PI / 5 + time * 0.15;

      // Animate Torus Knot
      torusKnot.rotation.x = time * 0.3 + drag.rx;
      torusKnot.rotation.y = time * 0.25 + drag.ry;

      // Core Breath Glow
      const breath = 1 + 0.15 * Math.sin(time * 3);
      coreGlow.scale.set(breath, breath, breath);

      // 4. Shockwave Expansion & Physics
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += sw.speed;
        sw.strength *= 0.965;
        if (sw.radius > sw.maxRadius || sw.strength < 0.02) {
          shockwaves.splice(s, 1);
        }
      }

      // 5. Deform Spacetime Curvature Manifold
      const manifoldPos = manifoldGeom.attributes.position.array;
      const coreWorld = celestialGroup.position;

      for (let i = 0; i < manifoldPos.length; i += 3) {
        const bx = baseManifoldPositions[i];
        const by = baseManifoldPositions[i + 1];
        const bz = baseManifoldPositions[i + 2];

        // Harmonic wave propagation
        let wave = Math.sin(bx * 0.08 + time * 1.5) * 2.5 + Math.cos(by * 0.08 + time * 1.2) * 2.2;

        // Gravitational indentation from Celestial Core
        const distToCore = Math.hypot(bx - coreWorld.x, by - coreWorld.y);
        const gravWell = -70 / (distToCore * 0.15 + 4);

        // Mouse Gravitational lens indentation
        const distToMouse = Math.hypot(bx - mouse.worldPos.x, by - mouse.worldPos.y);
        const mouseIndent = distToMouse < 45 ? -18 * (1 - distToMouse / 45) : 0;

        // Shockwaves impact
        let shockwaveDisp = 0;
        for (let s = 0; s < shockwaves.length; s++) {
          const sw = shockwaves[s];
          const distToSw = Math.hypot(bx - sw.center.x, by - sw.center.y);
          const diff = Math.abs(distToSw - sw.radius);
          if (diff < 16) {
            shockwaveDisp += Math.sin((diff / 16) * Math.PI) * 12 * sw.strength;
          }
        }

        manifoldPos[i + 2] = bz + wave + gravWell + mouseIndent + shockwaveDisp;
      }
      manifoldGeom.attributes.position.needsUpdate = true;

      // 6. Vector Field Particle Flow & Dynamic Constellations
      const pArr = particleGeom.attributes.position.array;
      let lineVertexIdx = 0;
      const mouseInfluenceRadius = 26;

      for (let i = 0; i < NUM_PARTICLES; i++) {
        const idx = i * 3;
        let px = pArr[idx];
        let py = pArr[idx + 1];
        let pz = pArr[idx + 2];
        const hx = homePositions[idx];
        const hy = homePositions[idx + 1];
        const hz = homePositions[idx + 2];

        // Harmonic vector flow
        const flowTime = time * 0.35 + i * 0.05;
        const vx = Math.sin(py * 0.03 + flowTime) * 0.06;
        const vy = Math.cos(px * 0.03 + flowTime) * 0.06;
        const vz = Math.sin(flowTime * 0.5) * 0.03;

        // Subtle gravitational lens deflection (prevents particles from collapsing into a single line)
        const dx = mouse.worldPos.x - px;
        const dy = mouse.worldPos.y - py;
        const distSq = dx * dx + dy * dy;
        let pushX = 0, pushY = 0;

        if (distSq < mouseInfluenceRadius * mouseInfluenceRadius && distSq > 0.01) {
          const dist = Math.sqrt(distSq);
          const lensForce = (1 - dist / mouseInfluenceRadius) * 0.5;
          pushX = -(dx / dist) * lensForce;
          pushY = -(dy / dist) * lensForce;

          // Connect up to 24 delicate constellation lines
          if (lineVertexIdx < 24 * 6 && dist < 18) {
            linePositions[lineVertexIdx++] = px;
            linePositions[lineVertexIdx++] = py;
            linePositions[lineVertexIdx++] = pz;
            linePositions[lineVertexIdx++] = mouse.worldPos.x;
            linePositions[lineVertexIdx++] = mouse.worldPos.y;
            linePositions[lineVertexIdx++] = 0;
          }
        }

        // Spring restoration back towards home position keeps cosmos distributed & stable
        px += (hx - px) * 0.03 + vx + pushX;
        py += (hy - py) * 0.03 + vy + pushY;
        pz += (hz - pz) * 0.02 + vz;

        // Boundary wrap relative to home
        if (px - hx > 40) px = hx - 40;
        if (px - hx < -40) px = hx + 40;
        if (py - hy > 30) py = hy - 30;
        if (py - hy < -30) py = hy + 30;

        pArr[idx] = px;
        pArr[idx + 1] = py;
        pArr[idx + 2] = pz;
      }
      particleGeom.attributes.position.needsUpdate = true;

      // Clear remaining constellation lines
      while (lineVertexIdx < linePositions.length) {
        linePositions[lineVertexIdx++] = 0;
      }
      lineGeom.attributes.position.needsUpdate = true;

      // 7. Float Math Equations & Glyphs
      equationGroup.children.forEach((child) => {
        if (child.userData.baseY !== undefined) {
          child.position.y =
            child.userData.baseY +
            Math.sin(time * (child.userData.speed || 1) + child.userData.phase) * 1.8;
        }
        if (child.userData.drift !== undefined) {
          child.position.x += child.userData.drift;
          if (child.position.x > 90) child.position.x = -90;
          if (child.position.x < -90) child.position.x = 90;
        }
      });

      // 8. Update HUD Info throttled to save CPU
      hudCounter++;
      if (hudCounter % 12 === 0) {
        const rad = Math.atan2(mouse.y, mouse.x);
        setHudCoord({
          x: Math.round(mouse.worldPos.x * 10) / 10,
          y: Math.round(mouse.worldPos.y * 10) / 10,
          rad: (rad / Math.PI).toFixed(2) + "π",
          z: Math.round(mouse.worldPos.z * 10) / 10,
        });
      }

      renderer.render(scene, camera);
    };

    frameId = requestAnimationFrame(animate);

    // ─── Cleanup ─────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(frameId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);

      // Dispose Three.js resources
      renderer.dispose();
      tesseractGeom.dispose();
      tesseractMat.dispose();
      vertexGeom.dispose();
      vertexMat.dispose();
      torusGeom.dispose();
      torusMat.dispose();
      manifoldGeom.dispose();
      manifoldMat.dispose();
      particleGeom.dispose();
      particleMat.dispose();
      if (starTexture) starTexture.dispose();
      lineGeom.dispose();
      constellationLinesMat.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <>
      {/* 3D WebGL Canvas Mount Container */}
      <div
        ref={mountRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      />

      {/* Atmospheric Radial Gradient Overlay (getlayers.ai aesthetic) */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 1,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 75% 25%, rgba(99, 102, 241, 0.12) 0%, transparent 55%), " +
            "radial-gradient(circle at 20% 80%, rgba(56, 189, 248, 0.08) 0%, transparent 50%), " +
            "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.06) 0%, transparent 65%)",
        }}
      />

      {/* 60fps.design Minimalist High-Tech Mathematical Coordinate Reticle */}
      <div
        ref={hudRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
          zIndex: 40,
          transform: "translate(-9999px, -9999px)",
          willChange: "transform",
          transition: "opacity 0.25s ease",
        }}
      >
        {/* Reticle Crosshair */}
        <div
          style={{
            position: "relative",
            width: 32,
            height: 32,
            marginLeft: -16,
            marginTop: -16,
          }}
        >
          {/* Subtle Ring */}
          <div
            style={{
              position: "absolute",
              top: 4,
              left: 4,
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: "1px dashed rgba(56, 189, 248, 0.6)",
              boxShadow: "0 0 12px rgba(56, 189, 248, 0.35)",
            }}
          />
          {/* Central Dot */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: "#38bdf8",
              boxShadow: "0 0 8px #38bdf8",
            }}
          />
          {/* Coordinates readout */}
          <div
            style={{
              position: "absolute",
              top: 36,
              left: 18,
              padding: "4px 8px",
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              borderRadius: 6,
              fontSize: 10,
              fontFamily: "'Courier New', monospace",
              color: "#38bdf8",
              whiteSpace: "nowrap",
              lineHeight: 1.3,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div>x: {hudCoord.x} | y: {hudCoord.y}</div>
            <div style={{ color: "#c084fc" }}>θ: {hudCoord.rad}</div>
          </div>
        </div>
      </div>
    </>
  );
}
