"use client";

/**
 * MRMBackdrop — themed, decorative background for each MRM sub-page.
 *
 * Why this exists: every MRM sub-page (leaderboard, shop, creator, profile,
 * settings…) used the same flat `linear-gradient(#020617, #0a0a1a)`, so they
 * were indistinguishable. Each variant below gives a page its own identity
 * while staying inside the MRM dark-navy palette, so text contrast is unchanged.
 *
 * Design rules (kept on purpose):
 *   - Pure CSS / inline SVG. No remote image, no canvas, no Math.random():
 *     nothing to fail offline, no hydration mismatch, no extra bytes on the wire.
 *   - Deterministic geometry (fixed arrays) so SSR and client render identically.
 *   - `aria-hidden` + `pointer-events: none`: it can never steal a click.
 *   - Motion is slow and is disabled under `prefers-reduced-motion`.
 *
 * Usage — the PAGE WRAPPER must create its own stacking context so this layer
 * (z-index: -1) sits above the wrapper's own background but below its content:
 *
 *   <div style={{ ...pageStyle, isolation: "isolate" }}>
 *     <MRMBackdrop variant="shop" />
 *     ...content...
 *   </div>
 */

export const MRM_BACKDROP_VARIANTS = [
  "leaderboard",
  "shop",
  "creator",
  "profile",
  "settings",
  "arena",
];

const PREFIX = "mrmbd";

// Deterministic pseudo-scatter: [x%, y%, size, delay s, duration s]
const SCATTER = [
  [6, 12, 10, 0, 9], [14, 68, 14, 2, 12], [22, 34, 8, 4, 10], [31, 82, 12, 1, 13],
  [39, 18, 9, 5, 11], [47, 58, 16, 3, 14], [55, 8, 10, 6, 9], [63, 74, 12, 2, 12],
  [71, 28, 14, 7, 13], [78, 90, 9, 4, 10], [85, 46, 12, 1, 11], [93, 16, 10, 5, 14],
  [11, 90, 9, 3, 10], [27, 52, 11, 6, 12], [58, 40, 8, 0, 9], [89, 66, 13, 8, 13],
];

// ── Variant layers ───────────────────────────────────────────────────────────

/** Leaderboard — a podium spotlight: warm rays fanning up from the centre. */
function Leaderboard() {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 55% at 50% -5%, rgba(251,191,36,0.16) 0%, transparent 65%), radial-gradient(ellipse 60% 50% at 50% 110%, rgba(124,58,237,0.20) 0%, transparent 70%)" }} />
      <div
        className={`${PREFIX}-rays`}
        style={{
          position: "absolute", left: "50%", top: "-45%", width: "190vmax", height: "190vmax",
          marginLeft: "-95vmax", opacity: 0.55,
          background: "repeating-conic-gradient(from 0deg at 50% 50%, rgba(251,191,36,0.07) 0deg 4deg, transparent 4deg 15deg)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 0%, transparent 38%)",
          maskImage: "radial-gradient(circle at 50% 50%, #000 0%, transparent 38%)",
        }}
      />
      {SCATTER.map(([x, y, s, d, t], i) => (
        <span
          key={i}
          className={`${PREFIX}-twinkle`}
          style={{
            position: "absolute", left: `${x}%`, top: `${y}%`, width: s / 3, height: s / 3,
            borderRadius: "50%", background: i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#a78bfa" : "#67e8f9",
            boxShadow: `0 0 ${s}px ${i % 3 === 0 ? "#fbbf24" : "#a78bfa"}`,
            animationDelay: `${d}s`, animationDuration: `${t}s`,
          }}
        />
      ))}
    </>
  );
}

/** Shop — a coin shower: gold discs drifting down over a warm ruby/amber glow. */
function Shop() {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 65% 50% at 85% 0%, rgba(245,158,11,0.18) 0%, transparent 62%), radial-gradient(ellipse 55% 50% at 5% 100%, rgba(225,29,72,0.13) 0%, transparent 65%)" }} />
      {SCATTER.map(([x, , s, d, t], i) => (
        <svg
          key={i}
          className={`${PREFIX}-coin`}
          viewBox="0 0 40 40"
          style={{
            position: "absolute", left: `${x}%`, top: "-8%", width: s * 2.2, height: s * 2.2,
            opacity: 0.22, animationDelay: `${d}s`, animationDuration: `${t + 8}s`,
            filter: "drop-shadow(0 0 8px rgba(251,191,36,0.45))",
          }}
        >
          <circle cx="20" cy="20" r="17" fill="#fbbf24" fillOpacity="0.28" stroke="#fbbf24" strokeWidth="2" />
          <circle cx="20" cy="20" r="11" fill="none" stroke="#fde68a" strokeOpacity="0.7" strokeWidth="1.4" />
          <path d="M20 12v16M16 16.5c0-2 8-2 8 0s-8 3-8 5.5 8 2.5 8 0" fill="none" stroke="#fde68a" strokeOpacity="0.8" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      ))}
    </>
  );
}

/** Creator — a drafting table: fine graph paper, compass arcs and a plotted curve. */
function Creator() {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(124,58,237,0.13) 0%, transparent 70%)" }} />
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "linear-gradient(rgba(167,139,250,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.10) 1px, transparent 1px), linear-gradient(rgba(167,139,250,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,0.05) 1px, transparent 1px)",
          backgroundSize: "120px 120px, 120px 120px, 24px 24px, 24px 24px",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 45%, #000 20%, transparent 85%)",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 45%, #000 20%, transparent 85%)",
        }}
      />
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.5 }}>
        <g fill="none" stroke="#a78bfa" strokeOpacity="0.35" strokeWidth="1.5">
          <path className={`${PREFIX}-draw`} d="M0 560 C 160 560, 220 180, 400 180 S 640 640, 820 560 S 1040 240, 1200 300" />
          <circle cx="1020" cy="170" r="110" strokeDasharray="4 8" />
          <circle cx="1020" cy="170" r="62" strokeOpacity="0.2" />
          <path d="M1020 170 L1130 170 M1020 170 L1085 255" strokeOpacity="0.4" />
          <path d="M150 640 L330 640 L240 500 Z" strokeOpacity="0.28" />
        </g>
        <g fill="#c4b5fd" fillOpacity="0.55">
          <circle cx="400" cy="180" r="4" />
          <circle cx="820" cy="560" r="4" />
          <circle cx="1020" cy="170" r="3.5" />
        </g>
      </svg>
    </>
  );
}

/** Profile — a constellation: nodes joined by faint lines, like an ELO history. */
const CONSTELLATION = [
  [8, 70], [20, 52], [31, 60], [43, 34], [55, 44], [66, 22], [78, 30], [90, 12],
];
function Profile() {
  const pts = CONSTELLATION.map(([x, y]) => `${x * 12},${y * 8}`).join(" ");
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 55% at 78% 8%, rgba(34,211,238,0.14) 0%, transparent 65%), radial-gradient(ellipse 55% 55% at 8% 95%, rgba(99,102,241,0.17) 0%, transparent 65%)" }} />
      <svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <polyline points={pts} fill="none" stroke="#22d3ee" strokeOpacity="0.22" strokeWidth="1.5" strokeDasharray="3 7" />
        {CONSTELLATION.map(([x, y], i) => (
          <g key={i} className={`${PREFIX}-twinkle`} style={{ animationDelay: `${i * 0.9}s`, animationDuration: "6s" }}>
            <circle cx={x * 12} cy={y * 8} r="14" fill="#22d3ee" fillOpacity="0.07" />
            <circle cx={x * 12} cy={y * 8} r="3.5" fill="#67e8f9" fillOpacity="0.8" />
          </g>
        ))}
        {SCATTER.map(([x, y, s], i) => (
          <circle key={`s${i}`} cx={x * 12} cy={y * 8} r={s / 9} fill="#c7d2fe" fillOpacity="0.4" />
        ))}
      </svg>
    </>
  );
}

/** Settings — calm and quiet: a soft teal aurora over a faint hex lattice. */
function Settings() {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 40% at 50% 0%, rgba(20,184,166,0.13) 0%, transparent 70%), radial-gradient(ellipse 60% 45% at 100% 100%, rgba(56,189,248,0.10) 0%, transparent 70%)" }} />
      <div className={`${PREFIX}-aurora`} style={{ position: "absolute", left: "-10%", top: "6%", width: "70%", height: "34%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(45,212,191,0.10) 0%, transparent 70%)", filter: "blur(30px)" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.55 }}>
        <defs>
          <pattern id={`${PREFIX}-hex`} width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
            <path d="M28 0 L56 16 L56 48 L28 64 L0 48 L0 16 Z M28 64 L28 97 M0 48 L0 81 L28 97 L56 81 L56 48" fill="none" stroke="#5eead4" strokeOpacity="0.07" strokeWidth="1" />
          </pattern>
          <radialGradient id={`${PREFIX}-hexfade`} cx="50%" cy="40%" r="75%">
            <stop offset="0%" stopColor="#fff" />
            <stop offset="100%" stopColor="#000" />
          </radialGradient>
          <mask id={`${PREFIX}-hexmask`}>
            <rect width="100%" height="100%" fill={`url(#${PREFIX}-hexfade)`} />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${PREFIX}-hex)`} mask={`url(#${PREFIX}-hexmask)`} />
      </svg>
    </>
  );
}

/** Arena — head-to-head: two opposing colour fields split by a diagonal clash line. */
function Arena() {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(115deg, rgba(14,165,233,0.16) 0%, transparent 46%, transparent 54%, rgba(244,63,94,0.15) 100%)" }} />
      <div
        style={{
          position: "absolute", left: "50%", top: "-10%", width: 2, height: "120%",
          transform: "rotate(18deg)", transformOrigin: "50% 50%",
          background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.28), transparent)",
          boxShadow: "0 0 24px 4px rgba(167,139,250,0.35)",
        }}
      />
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.6,
          backgroundImage: "repeating-linear-gradient(115deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 38px)",
        }}
      />
    </>
  );
}

const VARIANT_LAYERS = {
  leaderboard: Leaderboard,
  shop: Shop,
  creator: Creator,
  profile: Profile,
  settings: Settings,
  arena: Arena,
};

export default function MRMBackdrop({ variant = "profile" }) {
  const Layer = VARIANT_LAYERS[variant] || VARIANT_LAYERS.profile;
  return (
    <div
      aria-hidden="true"
      data-mrm-backdrop={variant in VARIANT_LAYERS ? variant : "profile"}
      style={{ position: "fixed", inset: 0, zIndex: -1, pointerEvents: "none", overflow: "hidden" }}
    >
      <style>{`
        @keyframes ${PREFIX}-twinkle { 0%,100% { opacity: .25; transform: scale(.8); } 50% { opacity: 1; transform: scale(1.15); } }
        @keyframes ${PREFIX}-coin { 0% { transform: translateY(0) rotate(0deg); } 100% { transform: translateY(120vh) rotate(260deg); } }
        @keyframes ${PREFIX}-rays { to { transform: rotate(360deg); } }
        @keyframes ${PREFIX}-draw { from { stroke-dashoffset: 1600; } to { stroke-dashoffset: 0; } }
        @keyframes ${PREFIX}-aurora { 0%,100% { transform: translateX(0); opacity: .8; } 50% { transform: translateX(8%); opacity: 1; } }
        .${PREFIX}-twinkle { animation: ${PREFIX}-twinkle 7s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
        .${PREFIX}-coin { animation: ${PREFIX}-coin 22s linear infinite; }
        .${PREFIX}-rays { animation: ${PREFIX}-rays 240s linear infinite; }
        .${PREFIX}-draw { stroke-dasharray: 1600; animation: ${PREFIX}-draw 5s ease-out forwards; }
        .${PREFIX}-aurora { animation: ${PREFIX}-aurora 18s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .${PREFIX}-twinkle, .${PREFIX}-coin, .${PREFIX}-rays, .${PREFIX}-draw, .${PREFIX}-aurora { animation: none !important; }
          .${PREFIX}-coin { opacity: .12 !important; top: 20% !important; }
        }
      `}</style>
      <Layer />
    </div>
  );
}
