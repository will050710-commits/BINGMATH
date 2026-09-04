'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Palette } from 'lucide-react';
import MathVizTitle from './MathVizTitle';

export const BASIC_SOLIDS = {
  cuboid: 'Hình hộp chữ nhật',
  square_pyramid: 'Hình chóp tứ giác đều',
  triangular_pyramid: 'Hình chóp tam giác đều',
  triangular_prism: 'Lăng trụ tam giác',
  cone: 'Hình nón',
  cylinder: 'Hình trụ',
  regular_polygon: 'Lăng trụ lục giác',
  sphere: 'Hình cầu',
  ellipsoid: 'Hình Elipsoid',
  frustum: 'Hình nón cụt',
};

export const EXOTIC_SOLIDS = {
  klein_bottle: { name: 'Bình Klein 4D', icon: '🌀', desc: 'Mặt đóng không phân biệt trong/ngoài' },
  mobius_strip: { name: 'Dải Möbius 3D', icon: '♾️', desc: 'Mặt 1 phía với 1 cạnh duy nhất' },
  torus: { name: 'Hình xuyến (Torus)', icon: '🍩', desc: 'Mặt tròn xoay hình bánh Donut' },
  tesseract_4d: { name: 'Siêu lập phương 4D (Tesseract)', icon: '🔮', desc: 'Khối 4 chiều chiếu trực giao sang 3D' },
  boys_surface: { name: "Mặt Boy (Boy's Surface)", icon: '🌐', desc: 'Immersion mặt phẳng xạ ảnh không kỳ dị' },
  cross_cap: { name: 'Mặt Cross-Cap', icon: '🎀', desc: 'Mặt phẳng xạ ảnh có đường tự cắt' },
  trefoil_knot: { name: 'Nút Trefoil Knot', icon: '🪢', desc: 'Nút thắt topology nguyên thủy' },
};

const ALL_SOLIDS_MAP = {
  ...BASIC_SOLIDS,
  ...Object.fromEntries(Object.entries(EXOTIC_SOLIDS).map(([k, v]) => [k, v.name])),
};
const COLOR_HEX = 0xff3cac;
const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '—');

function buildGeometry(THREE, solidKey, dims) {
  const { a = 3, b = 2.5, c = 2, h = 4, r = 2, r1 = 1.5, r2 = 3, n = 6, angle_4d = 0 } = dims;
  switch (solidKey) {
    case 'cuboid':
      return new THREE.BoxGeometry(a, h, b);
    case 'square_pyramid': {
      const g = new THREE.ConeGeometry(a / Math.SQRT2, h, 4);
      g.rotateY(Math.PI / 4);
      return g;
    }
    case 'triangular_pyramid': {
      const g = new THREE.ConeGeometry(a / Math.sqrt(3), h, 3);
      g.rotateY(Math.PI / 6);
      return g;
    }
    case 'triangular_prism': {
      const g = new THREE.CylinderGeometry(a / Math.sqrt(3), a / Math.sqrt(3), h, 3);
      g.rotateY(Math.PI / 6);
      return g;
    }
    case 'cone':
      return new THREE.ConeGeometry(r, h, 48);
    case 'cylinder':
      return new THREE.CylinderGeometry(r, r, h, 48);
    case 'regular_polygon':
      return new THREE.CylinderGeometry(r, r, h, Math.max(3, n || 6));
    case 'sphere':
      return new THREE.SphereGeometry(r, 36, 28);
    case 'ellipsoid': {
      const g = new THREE.SphereGeometry(1, 36, 28);
      g.scale(a || 3, c || 2, b || 2.2);
      return g;
    }
    case 'frustum':
      return new THREE.CylinderGeometry(r1, r2, h, 48);
    case 'torus': {
      const R = r || 2.5;
      return new THREE.TorusGeometry(R, R * 0.38, 30, 60);
    }
    case 'mobius_strip': {
      const uSegments = 64, vSegments = 24;
      const geom = new THREE.BufferGeometry();
      const positions = [];
      const stripWidth = dims.w || 1.6;
      const R = 2.6;
      for (let i = 0; i <= uSegments; i++) {
        const u = (i / uSegments) * Math.PI * 2;
        for (let j = 0; j <= vSegments; j++) {
          const v = (j / vSegments - 0.5) * stripWidth;
          const x = (R + v * Math.cos(u / 2)) * Math.cos(u);
          const z = (R + v * Math.cos(u / 2)) * Math.sin(u);
          const y = v * Math.sin(u / 2);
          positions.push(x, y, z);
        }
      }
      const indices = [];
      for (let i = 0; i < uSegments; i++) {
        for (let j = 0; j < vSegments; j++) {
          const p1 = i * (vSegments + 1) + j;
          const p2 = (i + 1) * (vSegments + 1) + j;
          const p3 = (i + 1) * (vSegments + 1) + (j + 1);
          const p4 = i * (vSegments + 1) + (j + 1);
          indices.push(p1, p2, p4);
          indices.push(p2, p3, p4);
        }
      }
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    }
    case 'klein_bottle': {
      // High-precision Figure-8 Klein Bottle immersion
      const uSegments = 80, vSegments = 40;
      const geom = new THREE.BufferGeometry();
      const positions = [];
      const scaleVal = (r || 2) * 0.72;
      const aParam = 2.2;
      for (let i = 0; i <= uSegments; i++) {
        const u = (i / uSegments) * Math.PI * 2;
        const cu = Math.cos(u), su = Math.sin(u);
        const cu2 = Math.cos(u / 2), su2 = Math.sin(u / 2);
        for (let j = 0; j <= vSegments; j++) {
          const v = (j / vSegments) * Math.PI * 2;
          const sv = Math.sin(v), s2v = Math.sin(2 * v);
          const x = scaleVal * (aParam + cu2 * sv - su2 * s2v) * cu;
          const z = scaleVal * (aParam + cu2 * sv - su2 * s2v) * su;
          const y = scaleVal * (su2 * sv + cu2 * s2v) * 1.6;
          positions.push(x, y, z);
        }
      }
      const indices = [];
      for (let i = 0; i < uSegments; i++) {
        for (let j = 0; j < vSegments; j++) {
          const p1 = i * (vSegments + 1) + j;
          const p2 = (i + 1) * (vSegments + 1) + j;
          const p3 = (i + 1) * (vSegments + 1) + (j + 1);
          const p4 = i * (vSegments + 1) + (j + 1);
          indices.push(p1, p2, p4);
          indices.push(p2, p3, p4);
        }
      }
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    }
    case 'tesseract_4d': {
      // 16 vertices of 4D hypercube projected into 3D
      const ang = (angle_4d || 0) * (Math.PI / 180);
      const cosA = Math.cos(ang), sinA = Math.sin(ang);
      const vertices4D = [];
      for (let vx of [-1, 1]) {
        for (let vy of [-1, 1]) {
          for (let vz of [-1, 1]) {
            for (let vw of [-1, 1]) {
              const xRot = vx * cosA - vw * sinA;
              const wRot = vx * sinA + vw * cosA;
              const yRot = vy * cosA - vz * sinA;
              const zRot = vy * sinA + vz * cosA;
              const dist4D = 2.4;
              const factor = 1.95 / (dist4D - wRot * 0.55);
              vertices4D.push(new THREE.Vector3(xRot * factor, yRot * factor, zRot * factor));
            }
          }
        }
      }
      const linePositions = [];
      for (let i = 0; i < 16; i++) {
        for (let j = i + 1; j < 16; j++) {
          const diff = i ^ j;
          if (diff === 1 || diff === 2 || diff === 4 || diff === 8) {
            const v1 = vertices4D[i], v2 = vertices4D[j];
            linePositions.push(v1.x, v1.y, v1.z, v2.x, v2.y, v2.z);
          }
        }
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
      return geom;
    }
    case 'boys_surface': {
      const uSegments = 50, vSegments = 50;
      const geom = new THREE.BufferGeometry();
      const positions = [];
      const s = 2.3;
      for (let i = 0; i <= uSegments; i++) {
        const u = (i / uSegments) * Math.PI;
        for (let j = 0; j <= vSegments; j++) {
          const v = (j / vSegments) * Math.PI;
          const cosU = Math.cos(u), sinU = Math.sin(u);
          const sin2V = Math.sin(2 * v), cos2V = Math.cos(2 * v);
          const sin3U = Math.sin(3 * u);
          const denom = (2 - Math.SQRT2 * sin3U * sin2V) || 0.001;
          const x = (s * (Math.SQRT2 * cosU * cosU * cos2V + cosU * sin2V)) / denom;
          const y = (s * (Math.SQRT2 * sinU * sinU * cos2V - sinU * sin2V)) / denom;
          const z = (s * (3 * cosU * cosU)) / denom - s;
          positions.push(x, z, y);
        }
      }
      const indices = [];
      for (let i = 0; i < uSegments; i++) {
        for (let j = 0; j < vSegments; j++) {
          const p1 = i * (vSegments + 1) + j;
          const p2 = (i + 1) * (vSegments + 1) + j;
          const p3 = (i + 1) * (vSegments + 1) + (j + 1);
          const p4 = i * (vSegments + 1) + (j + 1);
          indices.push(p1, p2, p4);
          indices.push(p2, p3, p4);
        }
      }
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    }
    case 'cross_cap': {
      const uSegments = 50, vSegments = 50;
      const geom = new THREE.BufferGeometry();
      const positions = [];
      const scaleR = 2.7;
      for (let i = 0; i <= uSegments; i++) {
        const u = (i / uSegments) * Math.PI;
        for (let j = 0; j <= vSegments; j++) {
          const v = (j / vSegments) * Math.PI;
          const x = scaleR * (Math.sin(u) * Math.sin(2 * v) / 2);
          const y = scaleR * (Math.sin(2 * u) * Math.cos(v) * Math.cos(v));
          const z = scaleR * (Math.cos(2 * u) * Math.cos(v) * Math.cos(v));
          positions.push(x, y, z);
        }
      }
      const indices = [];
      for (let i = 0; i < uSegments; i++) {
        for (let j = 0; j < vSegments; j++) {
          const p1 = i * (vSegments + 1) + j;
          const p2 = (i + 1) * (vSegments + 1) + j;
          const p3 = (i + 1) * (vSegments + 1) + (j + 1);
          const p4 = i * (vSegments + 1) + (j + 1);
          indices.push(p1, p2, p4);
          indices.push(p2, p3, p4);
        }
      }
      geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geom.setIndex(indices);
      geom.computeVertexNormals();
      return geom;
    }
    case 'trefoil_knot': {
      class TrefoilCurve extends THREE.Curve {
        getPoint(t) {
          const u = t * Math.PI * 2;
          const x = (Math.sin(u) + 2 * Math.sin(2 * u)) * 0.95;
          const y = (Math.cos(u) - 2 * Math.cos(2 * u)) * 0.95;
          const z = -Math.sin(3 * u) * 1.25;
          return new THREE.Vector3(x, z, y);
        }
      }
      return new THREE.TubeGeometry(new TrefoilCurve(), 100, 0.42, 16, true);
    }
    default:
      return new THREE.BoxGeometry(1, 1, 1);
  }
}

function heightOf(solidKey, dims) {
  if (solidKey === 'sphere') return (dims.r || 2) * 2;
  if (solidKey === 'ellipsoid') return (dims.c || 2) * 2;
  return dims.h || 4;
}

function formulas(solidKey, dims) {
  const { a = 3, b = 2.5, c = 2, h = 4, r = 2, r1 = 1.5, r2 = 3, n = 6 } = dims;
  switch (solidKey) {
    case 'cuboid':
      return {
        V: a * b * h,
        S: 2 * (a * b + b * h + a * h),
        vText: 'V = a·b·h',
        sText: 'S = 2(ab+bh+ah)'
      };
    case 'square_pyramid': {
      const l = Math.sqrt(h ** 2 + (a / 2) ** 2);
      return {
        V: (a ** 2 * h) / 3,
        S: a ** 2 + 2 * a * l,
        vText: 'V = (1/3)·a²·h',
        sText: 'S = a² + 2al'
      };
    }
    case 'triangular_pyramid': {
      const sBase = (Math.sqrt(3) / 4) * a ** 2;
      const rIn = a / (2 * Math.sqrt(3));
      const slant = Math.sqrt(h ** 2 + rIn ** 2);
      const sSide = 3 * (0.5 * a * slant);
      return {
        V: (sBase * h) / 3,
        S: sBase + sSide,
        vText: 'V = (a²√3/12)·h',
        sText: 'S = S_đáy + 3·S_mặt_bên'
      };
    }
    case 'triangular_prism': {
      const sBase = (Math.sqrt(3) / 4) * a ** 2;
      return {
        V: sBase * h,
        S: 2 * sBase + 3 * a * h,
        vText: 'V = (a²√3/4)·h',
        sText: 'S = 2·S_đáy + 3ah'
      };
    }
    case 'cone': {
      const l = Math.sqrt(r ** 2 + h ** 2);
      return {
        V: (Math.PI * r ** 2 * h) / 3,
        S: Math.PI * r * (r + l),
        vText: 'V = (1/3)·π·r²·h',
        sText: 'S = πr(r+l)'
      };
    }
    case 'cylinder':
      return {
        V: Math.PI * r ** 2 * h,
        S: 2 * Math.PI * r * (r + h),
        vText: 'V = π·r²·h',
        sText: 'S = 2πr(r+h)'
      };
    case 'regular_polygon': {
      const sides = Math.max(3, n || 6);
      const edge = 2 * r * Math.sin(Math.PI / sides);
      const sBase = 0.5 * sides * r ** 2 * Math.sin((2 * Math.PI) / sides);
      return {
        V: sBase * h,
        S: 2 * sBase + sides * edge * h,
        vText: 'V = S_đáy·h',
        sText: 'S = 2·S_đáy + n·cạnh·h'
      };
    }
    case 'sphere':
      return {
        V: (4 / 3) * Math.PI * r ** 3,
        S: 4 * Math.PI * r ** 2,
        vText: 'V = (4/3)·π·r³',
        sText: 'S = 4πr²'
      };
    case 'ellipsoid': {
      const p = 1.6075;
      const sApprox = 4 * Math.PI * Math.pow(((a * b) ** p + (a * c) ** p + (b * c) ** p) / 3, 1 / p);
      return {
        V: (4 / 3) * Math.PI * a * b * c,
        S: sApprox,
        vText: 'V = (4/3)·π·abc',
        sText: 'S ≈ 4π·((a^p·b^p + ...)/3)^(1/p)'
      };
    }
    case 'frustum': {
      const slant = Math.sqrt((r2 - r1) ** 2 + h ** 2);
      const sTotal = Math.PI * (r1 + r2) * slant + Math.PI * r1 ** 2 + Math.PI * r2 ** 2;
      return {
        V: (Math.PI * h * (r1 ** 2 + r1 * r2 + r2 ** 2)) / 3,
        S: sTotal,
        vText: 'V = (πh/3)·(r₁²+r₁r₂+r₂²)',
        sText: 'S = π(r₁+r₂)l + πr₁² + πr₂²'
      };
    }
    case 'mobius_strip':
      return {
        V: 0,
        S: 2 * Math.PI * 2.6 * (dims.w || 1.6),
        vText: 'V = 0 (Mặt 1 phía)',
        sText: 'S = 2π·R·w (Đặc trưng Euler χ = 0)'
      };
    case 'klein_bottle':
      return {
        V: 0,
        S: 0,
        vText: 'Mặt đóng 2 chiều trong không gian ℝ⁴',
        sText: 'Không phân biệt trong/ngoài, Đặc trưng Euler χ = 0'
      };
    case 'torus': {
      const R = r || 2.5, rTube = R * 0.38;
      return {
        V: 2 * Math.PI ** 2 * R * rTube ** 2,
        S: 4 * Math.PI ** 2 * R * rTube,
        vText: 'V = 2π²Rr²',
        sText: 'S = 4π²Rr, χ = 0'
      };
    }
    case 'tesseract_4d':
      return {
        V: 16,
        S: 32,
        vText: 'V₄ = a⁴ (16 đỉnh, 32 cạnh, 24 mặt, 8 khối 3D)',
        sText: 'Siêu lập phương 4 chiều chiếu sang ℝ³'
      };
    case 'boys_surface':
      return {
        V: 0,
        S: 0,
        vText: 'Immersion mặt phẳng xạ ảnh ℝℙ² vào ℝ³',
        sText: 'Không có điểm kỳ dị, Đặc trưng Euler χ = 1'
      };
    case 'cross_cap':
      return {
        V: 0,
        S: 0,
        vText: 'Mặt Cross-Cap (Whitney Umbrella)',
        sText: 'Đặc trưng Euler χ = 1, Có đoạn tự cắt'
      };
    case 'trefoil_knot':
      return {
        V: 0,
        S: 0,
        vText: 'Nút thắt tam diệp (Trefoil Knot)',
        sText: 'Đa thức Jones V(t) = t + t³ - t⁴'
      };
    default:
      return { V: 0, S: 0, vText: '', sText: '' };
  }
}


function getLabelsAndDimLines(solidKey, dims) {
  const { a = 3, b = 2.5, c = 2, h = 4, r = 2, r1 = 1.5, r2 = 3 } = dims;
  const labels = [];
  const dimLines = [];

  if (solidKey === 'cuboid') {
    const hx = a / 2, hy = h / 2, hz = b / 2;
    labels.push(
      { text: 'A', x: -hx, y: -hy, z: hz },
      { text: 'B', x: hx, y: -hy, z: hz },
      { text: 'C', x: hx, y: -hy, z: -hz },
      { text: 'D', x: -hx, y: -hy, z: -hz },
      { text: "A'", x: -hx, y: hy, z: hz },
      { text: "B'", x: hx, y: hy, z: hz },
      { text: "C'", x: hx, y: hy, z: -hz },
      { text: "D'", x: -hx, y: hy, z: -hz }
    );
  } else if (solidKey === 'square_pyramid') {
    const hs = a / 2;
    labels.push(
      { text: 'A', x: -hs, y: -h / 2, z: hs },
      { text: 'B', x: hs, y: -h / 2, z: hs },
      { text: 'C', x: hs, y: -h / 2, z: -hs },
      { text: 'D', x: -hs, y: -h / 2, z: -hs },
      { text: 'S', x: 0, y: h / 2, z: 0 }
    );
  } else if (solidKey === 'triangular_pyramid') {
    const rBase = a / Math.sqrt(3);
    labels.push(
      { text: 'A', x: -a / 2, y: -h / 2, z: rBase / 2 },
      { text: 'B', x: a / 2, y: -h / 2, z: rBase / 2 },
      { text: 'C', x: 0, y: -h / 2, z: -rBase },
      { text: 'S', x: 0, y: h / 2, z: 0 }
    );
  } else if (solidKey === 'triangular_prism') {
    const rBase = a / Math.sqrt(3);
    labels.push(
      { text: 'A', x: -a / 2, y: -h / 2, z: rBase / 2 },
      { text: 'B', x: a / 2, y: -h / 2, z: rBase / 2 },
      { text: 'C', x: 0, y: -h / 2, z: -rBase },
      { text: "A'", x: -a / 2, y: h / 2, z: rBase / 2 },
      { text: "B'", x: a / 2, y: h / 2, z: rBase / 2 },
      { text: "C'", x: 0, y: h / 2, z: -rBase }
    );
  } else if (solidKey === 'cone') {
    labels.push(
      { text: 'S', x: 0, y: h / 2, z: 0 },
      { text: 'O', x: 0, y: -h / 2, z: 0 },
      { text: `r = ${r}`, x: r / 2, y: -h / 2, z: 0 },
      { text: `h = ${h}`, x: r + 0.6, y: 0, z: 0 }
    );
    dimLines.push([[0, -h / 2, 0], [r, -h / 2, 0]], [[r + 0.3, -h / 2, 0], [r + 0.3, h / 2, 0]]);
  } else if (solidKey === 'cylinder') {
    labels.push(
      { text: "O'", x: 0, y: h / 2, z: 0 },
      { text: 'O', x: 0, y: -h / 2, z: 0 },
      { text: `r = ${r}`, x: r / 2, y: -h / 2, z: 0 },
      { text: `h = ${h}`, x: r + 0.6, y: 0, z: 0 }
    );
    dimLines.push([[0, -h / 2, 0], [r, -h / 2, 0]], [[r + 0.3, -h / 2, 0], [r + 0.3, h / 2, 0]]);
  } else if (solidKey === 'sphere') {
    labels.push(
      { text: 'O', x: 0, y: 0, z: 0 },
      { text: `r = ${r}`, x: r / 2, y: 0, z: 0 }
    );
    dimLines.push([[0, 0, 0], [r, 0, 0]]);
  }

  return { labels, dimLines };
}

function makeTextSprite(THREE, text, color = '#00e5ff') {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  
  // Background translucent pill badge
  ctx.fillStyle = 'rgba(13, 17, 23, 0.88)';
  ctx.strokeStyle = '#388bfd';
  ctx.lineWidth = 4;
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(16, 20, 224, 88, 18);
  } else {
    ctx.rect(16, 20, 224, 88);
  }
  ctx.fill();
  ctx.stroke();

  // Text
  ctx.font = 'bold 46px sans-serif';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(1.1, 0.55, 1);
  return sprite;
}

export default function MathVizGeometry3D({ data }) {
  const initialSolid = data?.solid || 'cuboid';
  const isInitialExotic = initialSolid in EXOTIC_SOLIDS;

  const [category, setCategory] = useState(isInitialExotic ? 'exotic' : 'basic');
  const [currentSolid, setCurrentSolid] = useState(initialSolid);
  const [dims, setDims] = useState(data?.dims || {});
  const [showSection, setShowSection] = useState(data?.show_cross_section || false);
  const [sectionH, setSectionH] = useState(data?.cross_section_height || 0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [wireframeOnly, setWireframeOnly] = useState(false);
  const [autoRotate4D, setAutoRotate4D] = useState(false);
  const [bgColor, setBgColor] = useState('#0d1117');

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const groupRef = useRef(null);
  const meshRef = useRef(null);
  const edgesRef = useRef(null);
  const verticesGroupRef = useRef(null);
  const labelsGroupRef = useRef(null);
  const sectionPlaneRef = useRef(null);
  const dimLinesGroupRef = useRef(null);
  const autoRotateRef = useRef(autoRotate);
  const autoRotate4DRef = useRef(autoRotate4D);
  const threeRef = useRef(null);
  const [threeReady, setThreeReady] = useState(false);

  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });

  useEffect(() => {
    autoRotateRef.current = autoRotate;
  }, [autoRotate]);

  useEffect(() => {
    autoRotate4DRef.current = autoRotate4D;
  }, [autoRotate4D]);

  useEffect(() => {
    if (sceneRef.current && threeRef.current) {
      sceneRef.current.background = new threeRef.current.Color(bgColor);
    }
  }, [bgColor]);

  useEffect(() => {
    let mounted = true;
    import('three').then((THREE) => {
      if (mounted) {
        threeRef.current = THREE;
        setThreeReady(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!threeReady || !mountRef.current) return;
    const THREE = threeRef.current;
    const mount = mountRef.current;
    const height = 360;
    const width = mount.clientWidth || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1117);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(7, 6, 9);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dir1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dir1.position.set(6, 9, 6);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0x3b82f6, 0.4);
    dir2.position.set(-6, -4, -6);
    scene.add(dir2);

    scene.add(new THREE.GridHelper(14, 14, 0x21262d, 0x30363d));
    scene.add(new THREE.AxesHelper(6));

    const group = new THREE.Group();
    scene.add(group);
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    groupRef.current = group;

    let raf;
    const animate = () => {
      if (autoRotateRef.current && !dragRef.current.dragging && group) {
        group.rotation.y += 0.006;
      }
      if (autoRotate4DRef.current) {
        setDims((prev) => ({ ...prev, angle_4d: ((prev.angle_4d || 0) + 0.8) % 360 }));
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [threeReady]);

  useEffect(() => {
    if (!threeReady) return;
    const THREE = threeRef.current;
    const group = groupRef.current;
    if (!group) return;

    if (meshRef.current) {
      group.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      if (Array.isArray(meshRef.current.material)) {
        meshRef.current.material.forEach((m) => m.dispose());
      } else {
        meshRef.current.material.dispose();
      }
    }
    if (edgesRef.current) {
      group.remove(edgesRef.current);
      edgesRef.current.geometry.dispose();
      edgesRef.current.material.dispose();
    }
    if (verticesGroupRef.current) {
      group.remove(verticesGroupRef.current);
      verticesGroupRef.current = null;
    }
    if (dimLinesGroupRef.current) {
      group.remove(dimLinesGroupRef.current);
      dimLinesGroupRef.current = null;
    }

    const geo = buildGeometry(THREE, currentSolid, dims);

    if (currentSolid === 'tesseract_4d') {
      const lineMat = new THREE.LineBasicMaterial({ color: 0x00e5ff, linewidth: 2 });
      const lineMesh = new THREE.LineSegments(geo, lineMat);
      group.add(lineMesh);
      edgesRef.current = lineMesh;

      const vGroup = new THREE.Group();
      const vGeom = new THREE.SphereGeometry(0.08, 12, 12);
      const vMat = new THREE.MeshBasicMaterial({ color: 0xff3cac });
      const posAttr = geo.getAttribute('position');
      for (let i = 0; i < posAttr.count; i++) {
        const vMesh = new THREE.Mesh(vGeom, vMat);
        vMesh.position.set(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i));
        vGroup.add(vMesh);
      }
      group.add(vGroup);
      verticesGroupRef.current = vGroup;
    } else {
      const isExotic = currentSolid in EXOTIC_SOLIDS;
      const mat = new THREE.MeshStandardMaterial({
        color: isExotic ? 0x00e5ff : COLOR_HEX,
        transparent: true,
        opacity: wireframeOnly ? 0 : 0.84,
        metalness: 0.2,
        roughness: 0.5,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      group.add(mesh);
      meshRef.current = mesh;

      const edgesGeo = new THREE.EdgesGeometry(geo, isExotic ? 40 : 20);
      const edgesMat = new THREE.LineBasicMaterial({ color: wireframeOnly ? 0x00e5ff : 0xe2e8f0 });
      const edges = new THREE.LineSegments(edgesGeo, edgesMat);
      group.add(edges);
      edgesRef.current = edges;
    }

    if (labelsGroupRef.current) {
      group.remove(labelsGroupRef.current);
      labelsGroupRef.current = null;
    }

    const { labels, dimLines } = getLabelsAndDimLines(currentSolid, dims);
    if (labels && labels.length > 0) {
      const lGroup = new THREE.Group();
      const dotGeom = new THREE.SphereGeometry(0.07, 16, 16);
      const dotMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

      labels.forEach((lbl) => {
        // Glowing vertex dot
        const dot = new THREE.Mesh(dotGeom, dotMat);
        dot.position.set(lbl.x, lbl.y, lbl.z);
        lGroup.add(dot);

        // 3D Canvas Sprite anchored to vertex
        const sprite = makeTextSprite(THREE, lbl.text);
        const offX = lbl.x === 0 ? 0 : Math.sign(lbl.x) * 0.28;
        const offY = 0.25;
        const offZ = lbl.z === 0 ? 0 : Math.sign(lbl.z) * 0.28;
        sprite.position.set(lbl.x + offX, lbl.y + offY, lbl.z + offZ);
        lGroup.add(sprite);
      });
      group.add(lGroup);
      labelsGroupRef.current = lGroup;
    }

    if (dimLines && dimLines.length > 0) {
      const dGroup = new THREE.Group();
      const dashMat = new THREE.LineDashedMaterial({ color: 0x00e5ff, dashSize: 0.2, gapSize: 0.1 });
      dimLines.forEach(([p1, p2]) => {
        const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...p1), new THREE.Vector3(...p2)]);
        const line = new THREE.Line(g, dashMat);
        line.computeLineDistances();
        dGroup.add(line);
      });
      group.add(dGroup);
      dimLinesGroupRef.current = dGroup;
    }
  }, [threeReady, currentSolid, dims, wireframeOnly]);

  useEffect(() => {
    if (!threeReady) return;
    const THREE = threeRef.current;
    const group = groupRef.current;
    if (!group) return;

    if (sectionPlaneRef.current) {
      group.remove(sectionPlaneRef.current);
      sectionPlaneRef.current.geometry.dispose();
      sectionPlaneRef.current.material.dispose();
      sectionPlaneRef.current = null;
    }

    if (showSection) {
      const planeGeo = new THREE.PlaneGeometry(8, 8);
      const planeMat = new THREE.MeshBasicMaterial({
        color: 0x00e5ff,
        transparent: true,
        opacity: 0.28,
        side: THREE.DoubleSide,
      });
      const plane = new THREE.Mesh(planeGeo, planeMat);
      plane.rotation.x = Math.PI / 2;
      plane.position.y = sectionH;
      group.add(plane);
      sectionPlaneRef.current = plane;
    }
  }, [threeReady, showSection, sectionH, currentSolid, dims]);

  const onPointerDown = useCallback((e) => {
    dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY };
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragRef.current.dragging || !groupRef.current) return;
    const dx = e.clientX - dragRef.current.lastX, dy = e.clientY - dragRef.current.lastY;
    groupRef.current.rotation.y += dx * 0.008;
    groupRef.current.rotation.x = Math.max(-1.2, Math.min(1.2, groupRef.current.rotation.x + dy * 0.008));
    dragRef.current.lastX = e.clientX;
    dragRef.current.lastY = e.clientY;
  }, []);

  const onPointerUp = useCallback(() => {
    dragRef.current.dragging = false;
  }, []);

  const f = formulas(currentSolid, dims);
  const maxSection = heightOf(currentSolid, dims) / 2;

  const container = { background: '#0d1117', borderRadius: 12, padding: 16, color: '#e2e8f0', margin: '12px 0', border: '1px solid #30363d' };
  const chipStyle = { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '8px 12px', marginRight: 8, marginBottom: 8, display: 'inline-block' };
  const labelStyle = { fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const valueStyle = { fontSize: 13, fontFamily: 'monospace', color: '#e2e8f0', marginTop: 4 };

  return (
    <div style={container}>
      <MathVizTitle icon="🎲" title={data?.title} fallback="Hình học không gian 3D" />

      {/* Top Controls: Main Tabs and Background Color Themes */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <button
            onClick={() => { setCategory('basic'); if (currentSolid in EXOTIC_SOLIDS) setCurrentSolid('cuboid'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: category === 'basic' ? 'bold' : 'normal',
              border: '1px solid',
              cursor: 'pointer',
              background: category === 'basic' ? '#ff3cac' : '#21262d',
              color: category === 'basic' ? '#fff' : '#cbd5e1',
              borderColor: category === 'basic' ? '#ff3cac' : '#30363d',
              transition: 'all 0.2s',
            }}
          >
            🧱 Hình khối cơ bản (3D)
          </button>
          <button
            onClick={() => { setCategory('exotic'); if (!(currentSolid in EXOTIC_SOLIDS)) setCurrentSolid('klein_bottle'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '7px 16px',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: category === 'exotic' ? 'bold' : 'normal',
              border: '1px solid',
              cursor: 'pointer',
              background: category === 'exotic' ? '#3b82f6' : '#21262d',
              color: category === 'exotic' ? '#fff' : '#cbd5e1',
              borderColor: category === 'exotic' ? '#3b82f6' : '#30363d',
              transition: 'all 0.2s',
            }}
          >
            🌌 Các hình khác (Topology & 4D)
          </button>
        </div>

        {/* Background Color Themes */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#161b22', padding: '3px 6px', borderRadius: 20, border: '1px solid #30363d' }}>
          <Palette size={13} color="#8b949e" style={{ marginLeft: 2 }} />
          {[
            { id: 'dark', label: 'Tối', color: '#0d1117' },
            { id: 'white', label: 'Trắng', color: '#ffffff' },
            { id: 'blueprint', label: 'Blueprint', color: '#0a192f' },
            { id: 'black', label: 'OLED', color: '#000000' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setBgColor(t.color)}
              title={`Nền ${t.label}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                padding: '3px 7px',
                borderRadius: 14,
                fontSize: 10.5,
                fontWeight: bgColor === t.color ? 'bold' : 'normal',
                border: bgColor === t.color ? '1px solid #00e5ff' : '1px solid transparent',
                background: bgColor === t.color ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                color: bgColor === t.color ? '#00e5ff' : '#8b949e',
                cursor: 'pointer',
              }}
            >
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, border: '1px solid #484f58' }} />
              {t.label}
            </button>
          ))}
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
            title="Tùy chọn mã màu nền tự do"
            style={{ width: 20, height: 20, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4 }}
          />
        </div>
      </div>

      {/* Sub-tabs for Basic Category */}
      {category === 'basic' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {Object.entries(BASIC_SOLIDS).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setCurrentSolid(k)}
              style={{
                padding: '5px 12px',
                borderRadius: 16,
                fontSize: 11,
                border: '1px solid',
                cursor: 'pointer',
                background: currentSolid === k ? '#ff3cac' : '#21262d',
                color: currentSolid === k ? '#fff' : '#e2e8f0',
                borderColor: currentSolid === k ? '#ff3cac' : '#30363d',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: category === 'exotic' ? '220px 1fr' : '1fr', gap: 12, marginBottom: 12 }}>
        {category === 'exotic' && (
          <div style={{ background: '#161b22', borderRadius: 10, padding: 8, border: '1px solid #30363d', display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 360, overflowY: 'auto' }}>
            <div style={{ fontSize: 11, color: '#8b949e', fontWeight: 'bold', padding: '4px 8px', textTransform: 'uppercase' }}>Danh mục hình học</div>
            {Object.entries(EXOTIC_SOLIDS).map(([k, info]) => {
              const active = currentSolid === k;
              return (
                <button key={k} onClick={() => setCurrentSolid(k)} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 10px', borderRadius: 8, border: '1px solid', textAlign: 'left', cursor: 'pointer', background: active ? 'rgba(59, 130, 246, 0.15)' : 'transparent', borderColor: active ? '#3b82f6' : 'transparent', color: active ? '#60a5fa' : '#cbd5e1', transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 18 }}>{info.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: active ? 'bold' : 'normal', lineHeight: 1.3 }}>{info.name}</div>
                    <div style={{ fontSize: 10, color: '#64748b', marginTop: 2, lineHeight: 1.2 }}>{info.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        <div style={{ position: 'relative', width: '100%', height: 360, borderRadius: 10, overflow: 'hidden', background: '#0d1117', border: '1px solid #30363d' }}>
          <div ref={mountRef} style={{ width: '100%', height: '100%', touchAction: 'none', cursor: 'grab' }} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp} />
          <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(13, 17, 23, 0.85)', padding: '4px 10px', borderRadius: 6, border: '1px solid #30363d', fontSize: 11, color: '#00e5ff', pointerEvents: 'none' }}>{ALL_SOLIDS_MAP[currentSolid] || currentSolid}</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 8 }}>
        <div style={chipStyle}>
          <div style={labelStyle}>Thể tích / Chiều</div>
          <div style={{ ...valueStyle, color: category === 'exotic' ? '#00e5ff' : '#ff3cac' }}>{fmt(f.V)} ({f.vText})</div>
        </div>
        <div style={chipStyle}>
          <div style={labelStyle}>Đặc tính Topology / Diện tích</div>
          <div style={valueStyle}>{fmt(f.S)} ({f.sText})</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        {currentSolid === 'cuboid' && ['a', 'b', 'h'].map((k) => (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e', marginBottom: 2 }}>
                <span>{k === 'a' ? 'Chiều dài a' : k === 'b' ? 'Chiều rộng b' : 'Chiều cao h'}</span>
                <span>{dims[k] || (k === 'a' ? 3 : k === 'b' ? 2.5 : 4)}</span>
              </div>
              <input type="range" min="1" max="7" step="0.5" value={dims[k] || (k === 'a' ? 3 : k === 'b' ? 2.5 : 4)} onChange={(e) => setDims((d) => ({ ...d, [k]: +e.target.value }))} style={{ width: '100%', accentColor: '#ff3cac' }} />
            </div>
        ))}

        {(currentSolid === 'cone' || currentSolid === 'cylinder') && ['r', 'h'].map((k) => (
            <div key={k} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e', marginBottom: 2 }}>
                <span>{k === 'r' ? 'Bán kính đáy r' : 'Chiều cao h'}</span>
                <span>{dims[k] || (k === 'r' ? 2 : 4)}</span>
              </div>
              <input type="range" min="0.5" max={k === 'r' ? 4 : 8} step="0.25" value={dims[k] || (k === 'r' ? 2 : 4)} onChange={(e) => setDims((d) => ({ ...d, [k]: +e.target.value }))} style={{ width: '100%', accentColor: '#ff3cac' }} />
            </div>
        ))}

        {(currentSolid === 'sphere' || currentSolid === 'torus' || currentSolid === 'klein_bottle') && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e', marginBottom: 2 }}>
              <span>Bán kính quy mô r</span>
              <span>{dims.r || 2}</span>
            </div>
            <input type="range" min="0.5" max="4" step="0.25" value={dims.r || 2} onChange={(e) => setDims((d) => ({ ...d, r: +e.target.value }))} style={{ width: '100%', accentColor: '#00e5ff' }} />
          </div>
        )}

        {currentSolid === 'tesseract_4d' && (
          <div style={{ marginBottom: 8, background: '#161b22', padding: 10, borderRadius: 8, border: '1px solid #30363d' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#00e5ff', marginBottom: 4 }}>
              <span>🔮 Góc xoay 4D (Mặt phẳng X-W): {Math.round(dims.angle_4d || 0)}°</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={autoRotate4D} onChange={(e) => setAutoRotate4D(e.target.checked)} /> Tự xoay 4D
              </label>
            </div>
            <input type="range" min="0" max="360" step="1" value={dims.angle_4d || 0} onChange={(e) => setDims((d) => ({ ...d, angle_4d: +e.target.value }))} style={{ width: '100%', accentColor: '#00e5ff' }} />
          </div>
        )}

        {currentSolid === 'mobius_strip' && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e', marginBottom: 2 }}>
              <span>Độ rộng dải w</span>
              <span>{dims.w || 1.6}</span>
            </div>
            <input type="range" min="0.5" max="3" step="0.1" value={dims.w || 1.6} onChange={(e) => setDims((d) => ({ ...d, w: +e.target.value }))} style={{ width: '100%', accentColor: '#00e5ff' }} />
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#e2e8f0', cursor: 'pointer' }}>
            <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} /> Tự xoay 3D
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#e2e8f0', cursor: 'pointer' }}>
            <input type="checkbox" checked={wireframeOnly} onChange={(e) => setWireframeOnly(e.target.checked)} /> Khung dây (Wireframe)
          </label>
          {category === 'basic' && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#e2e8f0', cursor: 'pointer' }}>
              <input type="checkbox" checked={showSection} onChange={(e) => setShowSection(e.target.checked)} /> Mặt cắt ngang
            </label>
          )}
        </div>

        {showSection && category === 'basic' && (
          <div style={{ marginTop: 10, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e', marginBottom: 4 }}>
              <span>Độ cao mặt cắt</span>
              <span>{fmt(sectionH)}</span>
            </div>
            <input type="range" min={-maxSection} max={maxSection} step="0.1" value={sectionH} onChange={(e) => setSectionH(+e.target.value)} style={{ width: '100%', accentColor: '#00e5ff' }} />
          </div>
        )}
      </div>
    </div>
  );
}
